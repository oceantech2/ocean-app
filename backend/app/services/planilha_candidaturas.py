"""Envio das candidaturas à planilha "Formulário de candidatura em vaga" (Web App do Apps Script).

O `externalId` é o id da candidatura: a planilha ignora reenvios do mesmo id, então tentar de
novo uma pendente nunca duplica a linha.
"""
from __future__ import annotations

import logging
from datetime import datetime

import httpx
from sqlalchemy.orm import Session, joinedload

from app.config import settings
from app.database import SessionLocal
from app.models import Candidatura
from app.services.vagas import DISPONIBILIDADE, INGLES, MOBILIDADE

logger = logging.getLogger("ocean.planilha")

_TIMEOUT = httpx.Timeout(30.0)
MSG_NAO_CONFIGURADA = "Integração com a planilha não configurada"


def link_curriculo(c: Candidatura) -> str:
    return f"{settings.consultant_panel_url()}/candidaturas/{c.id}/curriculo"


def montar_payload(c: Candidatura) -> dict:
    vaga = c.vaga
    payload = {
        "externalId": str(c.id),
        "nome": c.nome,
        "email": c.email,
        "consentimento": True,
        "telefone": c.telefone,
        "linkedin": c.linkedin,
        "localizacao": c.localidade,
        "cargoAtual": c.cargo_atual,
        "empresaAtual": c.empresa_atual,
        "formacao": c.formacao,
        "experiencia": c.experiencia,
        "ingles": INGLES.get(c.ingles or ""),
        "outrosIdiomas": c.outros_idiomas,
        "pretensaoMin": float(c.pretensao_min),
        "pretensaoMax": float(c.pretensao_max),
        "disponibilidade": DISPONIBILIDADE.get(c.disponibilidade or ""),
        "mobilidade": MOBILIDADE.get(c.mobilidade or ""),
        "linkCv": link_curriculo(c) if c.curriculo_path else None,
    }
    if vaga.codigo_planilha:
        payload["vagaId"] = vaga.codigo_planilha
    else:
        payload["vaga"] = vaga.titulo
        payload["cliente"] = vaga.cliente
    return {chave: valor for chave, valor in payload.items() if valor not in (None, "")}


def _falhar(c: Candidatura, erro: str) -> bool:
    c.planilha_tentativas = (c.planilha_tentativas or 0) + 1
    c.planilha_erro = erro[:500]
    logger.warning("Candidatura %s não enviada à planilha: %s", c.id, erro)
    return False


def enviar(c: Candidatura) -> bool:
    """Tenta enviar e atualiza o status na candidatura (sem commit). Devolve True se a planilha aceitou."""
    if c.planilha_enviada_em:
        return True
    if not settings.SHEETS_WEBHOOK_URL:
        return _falhar(c, MSG_NAO_CONFIGURADA)
    corpo = {**montar_payload(c), "secret": settings.SHEETS_WEBHOOK_SECRET}
    try:
        r = httpx.post(settings.SHEETS_WEBHOOK_URL, json=corpo, timeout=_TIMEOUT, follow_redirects=True)
    except httpx.HTTPError as exc:
        return _falhar(c, f"Planilha indisponível: {exc.__class__.__name__}")
    if r.status_code >= 400:
        return _falhar(c, f"Planilha respondeu HTTP {r.status_code}")
    try:
        dados = r.json()
    except ValueError:
        return _falhar(c, "Planilha respondeu em formato inesperado")
    if not isinstance(dados, dict) or not dados.get("ok"):
        erro = dados.get("error") if isinstance(dados, dict) else None
        return _falhar(c, f"Planilha recusou: {erro or 'sem detalhe'}")

    c.planilha_tentativas = (c.planilha_tentativas or 0) + 1
    c.planilha_enviada_em = datetime.utcnow().replace(microsecond=0)
    c.planilha_id_candidatura = str(dados.get("idCandidatura") or "")[:40] or None
    c.planilha_id_pessoa = str(dados.get("idPessoa") or "")[:40] or None
    c.planilha_erro = None
    return True


def carregar(db: Session, candidatura_id: int) -> Candidatura | None:
    return (
        db.query(Candidatura)
        .options(joinedload(Candidatura.vaga))
        .filter(Candidatura.id == candidatura_id)
        .first()
    )


def enviar_em_segundo_plano(candidatura_id: int) -> None:
    """Tarefa após gravar a candidatura; falhas ficam na própria candidatura como pendência."""
    try:
        with SessionLocal() as db:
            c = carregar(db, candidatura_id)
            if c:
                enviar(c)
                db.commit()
    except Exception:
        logger.exception("Falha ao enviar a candidatura %s à planilha", candidatura_id)
