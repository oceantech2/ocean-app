"""Notícias do Consultant Panel publicadas no site (feature 106)."""
from __future__ import annotations

import re
import unicodedata
from datetime import date, datetime
from typing import Optional
from zoneinfo import ZoneInfo

from fastapi import HTTPException, status

from app.models import Noticia
from app.schemas import NoticiaIn

SEGMENTOS = {
    "oil-gas": "Petróleo & Gás",
    "offshore": "Offshore",
    "energia": "Energia",
    "infraestrutura": "Infraestrutura",
    "mineracao": "Mineração",
    "industria": "Indústria",
    "tecnologia": "Tecnologia",
}

STATUS_PUBLICADA = "publicada"
STATUS_NAO_PUBLICADA = "nao_publicada"
STATUS_VALIDOS = (STATUS_PUBLICADA, STATUS_NAO_PUBLICADA)

MSG_NAO_ENCONTRADA = "Notícia não encontrada"
MSG_INDISPONIVEL = "Notícia não disponível"
MSG_SEM_PERMISSAO = "Ação permitida apenas ao autor da notícia ou administradores"

TZ_SP = ZoneInfo("America/Sao_Paulo")


def _texto(valor: Optional[str]) -> str:
    return (valor or "").strip()


def _recusar(mensagem: str) -> None:
    raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=mensagem)


def slug_titulo(titulo: str) -> str:
    sem_acento = unicodedata.normalize("NFKD", titulo).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", sem_acento.lower()).strip("-")
    return slug[:60].strip("-") or "noticia"


def hoje_sp() -> date:
    return datetime.now(TZ_SP).date()


def elegivel_publica(n: Noticia, hoje: Optional[date] = None) -> bool:
    ref = hoje or hoje_sp()
    return n.status == STATUS_PUBLICADA and n.data_publicacao <= ref


def validar_noticia(payload: NoticiaIn, *, exigir_status: bool = False) -> dict:
    dados = {
        "titulo_pt": _texto(payload.titulo_pt),
        "titulo_en": _texto(payload.titulo_en),
        "resumo_pt": _texto(payload.resumo_pt),
        "resumo_en": _texto(payload.resumo_en),
        "conteudo_pt": _texto(payload.conteudo_pt),
        "conteudo_en": _texto(payload.conteudo_en),
        "segmento": _texto(payload.segmento),
    }
    obrigatorios = {
        "titulo_pt": "Informe o título em português",
        "titulo_en": "Informe o título em inglês",
        "resumo_pt": "Informe o resumo em português",
        "resumo_en": "Informe o resumo em inglês",
        "conteudo_pt": "Informe o conteúdo em português",
        "conteudo_en": "Informe o conteúdo em inglês",
        "segmento": "Selecione o segmento",
    }
    for campo, mensagem in obrigatorios.items():
        if not dados[campo]:
            _recusar(mensagem)
    if dados["segmento"] not in SEGMENTOS:
        _recusar("Segmento inválido")

    data_txt = _texto(payload.data_publicacao)
    if not data_txt:
        _recusar("Informe a data de publicação")
    try:
        data_pub = date.fromisoformat(data_txt)
    except ValueError:
        _recusar("Data de publicação inválida (use AAAA-MM-DD)")
    dados["data_publicacao"] = data_pub

    limites = {
        "titulo_pt": (200, "Título (PT)"),
        "titulo_en": (200, "Título (EN)"),
        "resumo_pt": (500, "Resumo (PT)"),
        "resumo_en": (500, "Resumo (EN)"),
        "conteudo_pt": (20000, "Conteúdo (PT)"),
        "conteudo_en": (20000, "Conteúdo (EN)"),
    }
    for campo, (maximo, rotulo) in limites.items():
        if len(dados[campo]) > maximo:
            _recusar(f"{rotulo} deve ter no máximo {maximo} caracteres")

    status_txt = _texto(payload.status) if payload.status is not None else ""
    if status_txt:
        if status_txt not in STATUS_VALIDOS:
            _recusar("Status inválido")
        dados["status"] = status_txt
    elif exigir_status:
        _recusar("Informe o status")
    return dados


def pode_alterar(noticia: Noticia, user: dict) -> bool:
    return user["papel"] == "admin" or (
        noticia.criado_por_id is not None and noticia.criado_por_id == user["id"]
    )


def exigir_alteracao(noticia: Noticia, user: dict) -> None:
    if not pode_alterar(noticia, user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=MSG_SEM_PERMISSAO)


def _iso(valor) -> Optional[str]:
    return valor.replace(microsecond=0).isoformat() + "Z" if valor else None


def serializar_publica(n: Noticia) -> dict:
    return {
        "id": n.id,
        "slug": slug_titulo(n.titulo_pt),
        "titulo_pt": n.titulo_pt,
        "titulo_en": n.titulo_en,
        "resumo_pt": n.resumo_pt,
        "resumo_en": n.resumo_en,
        "conteudo_pt": n.conteudo_pt,
        "conteudo_en": n.conteudo_en,
        "segmento": n.segmento,
        "data_publicacao": n.data_publicacao.isoformat(),
    }


def serializar_painel(n: Noticia, user: dict) -> dict:
    return {
        **serializar_publica(n),
        "status": n.status,
        "criado_por_usuario": n.criado_por_usuario,
        "criado_em": _iso(n.criado_em),
        "atualizado_por_usuario": n.atualizado_por_usuario,
        "atualizado_em": _iso(n.atualizado_em),
        "pode_editar": pode_alterar(n, user),
    }
