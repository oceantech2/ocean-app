from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Proposta, PropostaAssinatura
from app.schemas import PropostaAssinar
from app.services.propostas import (
    MSG_NAO_ENCONTRADA,
    STATUS_PENDENTES,
    calcular_hash,
    hoje_sp,
    ip_origem,
    serializar_publica,
    status_efetivo,
    validar_assinatura,
)

router = APIRouter()

_MOTIVO_409 = {
    "assinada": "Proposta já assinada",
    "cancelada": "Proposta não está mais disponível",
    "expirada": "Proposta expirada",
}


def _por_codigo(db: Session, codigo: str) -> Proposta:
    p = (
        db.query(Proposta)
        .options(joinedload(Proposta.assinatura))
        .filter(Proposta.codigo == codigo)
        .first()
    )
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=MSG_NAO_ENCONTRADA)
    return p


def _recusar(db: Session, codigo: str):
    db.rollback()
    db.expire_all()
    motivo = _MOTIVO_409.get(status_efetivo(_por_codigo(db, codigo)), "Proposta não está mais disponível")
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=motivo)


@router.get("/{codigo}")
def consultar_proposta(codigo: str, db: Session = Depends(get_db)):
    p = _por_codigo(db, codigo)
    if p.status == "aguardando" and p.visualizada_em is None and status_efetivo(p) == "aguardando":
        db.query(Proposta).filter(
            Proposta.id == p.id,
            Proposta.status == "aguardando",
            Proposta.visualizada_em.is_(None),
        ).update(
            {"status": "visualizada", "visualizada_em": datetime.utcnow()},
            synchronize_session=False,
        )
        db.commit()
        db.expire_all()
        p = _por_codigo(db, codigo)
    return serializar_publica(p)


@router.post("/{codigo}/assinar")
def assinar_proposta(
    codigo: str,
    payload: PropostaAssinar,
    request: Request,
    db: Session = Depends(get_db),
):
    p = _por_codigo(db, codigo)
    dados = validar_assinatura(payload)

    if status_efetivo(p) not in STATUS_PENDENTES:
        _recusar(db, codigo)

    conteudo_hash = calcular_hash(p)
    if conteudo_hash != p.conteudo_hash:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Proposta não está mais disponível")

    agora = datetime.utcnow()
    atualizadas = (
        db.query(Proposta)
        .filter(
            Proposta.id == p.id,
            Proposta.status.in_(STATUS_PENDENTES),
            Proposta.validade >= hoje_sp(),
        )
        .update({"status": "assinada", "assinada_em": agora}, synchronize_session=False)
    )
    if not atualizadas:
        _recusar(db, codigo)

    db.add(PropostaAssinatura(
        proposta_id=p.id,
        nome=dados["nome"],
        email=dados["email"],
        aceite=True,
        assinada_em=agora,
        ip=ip_origem(request),
        user_agent=(request.headers.get("user-agent") or "")[:500] or None,
        conteudo_hash=conteudo_hash,
    ))
    try:
        db.commit()
    except IntegrityError:
        _recusar(db, codigo)

    db.expire_all()
    return serializar_publica(_por_codigo(db, codigo))
