"""Vagas abertas no site e candidatura sem login (feature 102)."""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Request, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Candidatura, Vaga
from app.services import anexo_nf
from app.services.planilha_candidaturas import enviar_em_segundo_plano
from app.services.propostas import ip_origem
from app.services.vagas import (
    CURRICULO_EXTENSOES,
    CURRICULO_MAX_BYTES,
    MSG_INDISPONIVEL,
    STATUS_ABERTA,
    serializar_publica,
    validar_candidatura,
)

router = APIRouter()

MSG_CURRICULO_FORMATO = "Formato não permitido. Envie PDF, DOC ou DOCX."
MSG_CURRICULO_TAMANHO = "Arquivo excede 5 MB"


def _aberta(db: Session, vaga_id: int) -> Vaga:
    v = db.query(Vaga).filter(Vaga.id == vaga_id, Vaga.status == STATUS_ABERTA).first()
    if not v:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=MSG_INDISPONIVEL)
    return v


@router.get("/")
def listar_vagas(db: Session = Depends(get_db)):
    vagas = (
        db.query(Vaga)
        .filter(Vaga.status == STATUS_ABERTA)
        .order_by(Vaga.criado_em.desc(), Vaga.id.desc())
        .all()
    )
    return [serializar_publica(v) for v in vagas]


@router.get("/{vaga_id}")
def obter_vaga(vaga_id: int, db: Session = Depends(get_db)):
    return serializar_publica(_aberta(db, vaga_id))


@router.post("/{vaga_id}/candidaturas", status_code=status.HTTP_201_CREATED)
def candidatar(
    vaga_id: int,
    request: Request,
    background_tasks: BackgroundTasks,
    nome: str = Form(""),
    email: str = Form(""),
    telefone: str = Form(""),
    linkedin: str = Form(""),
    localidade: str = Form(""),
    cargo_atual: str = Form(""),
    empresa_atual: str = Form(""),
    formacao: str = Form(""),
    experiencia: str = Form(""),
    ingles: str = Form(""),
    outros_idiomas: str = Form(""),
    pretensao_min: str = Form(""),
    pretensao_max: str = Form(""),
    disponibilidade: str = Form(""),
    mobilidade: str = Form(""),
    consentimento: str = Form(""),
    site: str = Form(""),
    curriculo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    vaga = _aberta(db, vaga_id)
    # Campo isca invisível para pessoas: preenchido indica robô; responde como sucesso sem gravar
    if site.strip():
        return {"ok": True}

    conteudo = curriculo.file.read(CURRICULO_MAX_BYTES + 1) if curriculo and curriculo.filename else b""
    erro_curriculo = {}
    ext = None
    if not conteudo:
        erro_curriculo["curriculo"] = "Anexe seu currículo"
    else:
        try:
            ext = anexo_nf.validar(
                curriculo.filename,
                conteudo,
                extensoes=CURRICULO_EXTENSOES,
                max_bytes=CURRICULO_MAX_BYTES,
                msg_formato=MSG_CURRICULO_FORMATO,
                msg_tamanho=MSG_CURRICULO_TAMANHO,
            )
        except HTTPException as exc:
            erro_curriculo["curriculo"] = exc.detail

    dados = validar_candidatura(
        {
            "nome": nome,
            "email": email,
            "telefone": telefone,
            "linkedin": linkedin,
            "localidade": localidade,
            "cargo_atual": cargo_atual,
            "empresa_atual": empresa_atual,
            "formacao": formacao,
            "experiencia": experiencia,
            "ingles": ingles,
            "outros_idiomas": outros_idiomas,
            "pretensao_min": pretensao_min,
            "pretensao_max": pretensao_max,
            "disponibilidade": disponibilidade,
            "mobilidade": mobilidade,
            "consentimento": consentimento,
        },
        erros_extra=erro_curriculo,
    )

    agora = datetime.utcnow().replace(microsecond=0)
    c = Candidatura(
        **dados,
        vaga_id=vaga.id,
        consentimento_em=agora,
        criada_em=agora,
        ip=ip_origem(request),
        curriculo_nome=(curriculo.filename or "")[:255] or None,
        planilha_tentativas=0,
    )
    db.add(c)
    try:
        db.flush()
        c.curriculo_path = anexo_nf.gravar("curriculos", c.id, curriculo.filename, conteudo, None, ext=ext)
        db.commit()
    except Exception:
        db.rollback()
        raise

    background_tasks.add_task(enviar_em_segundo_plano, c.id)
    return {"ok": True}
