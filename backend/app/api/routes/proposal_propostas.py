from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.api.routes.proposal_auth import get_proposal_user
from app.database import get_db
from app.models import Proposta
from app.schemas import PropostaCreate
from app.services.propostas import (
    MSG_NAO_ENCONTRADA,
    STATUS_FILTRO,
    STATUS_PENDENTES,
    calcular_hash,
    gerar_codigo,
    hoje_sp,
    pode_ver,
    serializar_detalhe,
    serializar_item,
    status_efetivo,
    validar_criacao,
)

router = APIRouter()


def _obter_visivel(db: Session, proposta_id: int, user: dict) -> Proposta:
    p = (
        db.query(Proposta)
        .options(joinedload(Proposta.assinatura))
        .filter(Proposta.id == proposta_id)
        .first()
    )
    if not p or not pode_ver(p, user):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=MSG_NAO_ENCONTRADA)
    return p


@router.get("/")
def listar_propostas(
    status_filtro: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    q = db.query(Proposta)
    if user["papel"] != "admin":
        q = q.filter(Proposta.criado_por_id == user["id"])

    if status_filtro:
        if status_filtro not in STATUS_FILTRO:
            raise HTTPException(status_code=422, detail="Status inválido")
        hoje = hoje_sp()
        if status_filtro == "expirada":
            q = q.filter(Proposta.status.in_(STATUS_PENDENTES), Proposta.validade < hoje)
        elif status_filtro in STATUS_PENDENTES:
            q = q.filter(Proposta.status == status_filtro, Proposta.validade >= hoje)
        else:
            q = q.filter(Proposta.status == status_filtro)

    total = q.count()
    itens = (
        q.order_by(Proposta.emitida_em.desc(), Proposta.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {
        "items": [serializar_item(p) for p in itens],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_proposta(
    payload: PropostaCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    dados = validar_criacao(payload)

    codigo = gerar_codigo()
    while db.query(Proposta.id).filter(Proposta.codigo == codigo).first():
        codigo = gerar_codigo()

    p = Proposta(
        **dados,
        codigo=codigo,
        emitida_em=datetime.utcnow().replace(microsecond=0),
        status="aguardando",
        criado_por_id=user["id"],
        criado_por_usuario=user["usuario"],
    )
    p.conteudo_hash = calcular_hash(p)
    db.add(p)
    db.commit()
    db.refresh(p)
    return serializar_detalhe(p)


@router.get("/{proposta_id}")
def obter_proposta(
    proposta_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    return serializar_detalhe(_obter_visivel(db, proposta_id, user))


@router.post("/{proposta_id}/cancelar")
def cancelar_proposta(
    proposta_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    p = _obter_visivel(db, proposta_id, user)
    if status_efetivo(p) not in STATUS_PENDENTES:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Proposta não pode ser cancelada")
    atualizadas = (
        db.query(Proposta)
        .filter(
            Proposta.id == p.id,
            Proposta.status.in_(STATUS_PENDENTES),
            Proposta.validade >= hoje_sp(),
        )
        .update({"status": "cancelada", "cancelada_em": datetime.utcnow()}, synchronize_session=False)
    )
    if not atualizadas:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Proposta não pode ser cancelada")
    db.commit()
    db.expire_all()
    return serializar_detalhe(_obter_visivel(db, proposta_id, user))
