from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.api.routes.proposal_auth import get_proposal_user
from app.database import get_db
from app.models import Proposta, PropostaEdicao
from app.schemas import PropostaCreate
from app.services.proposta_modelos import modelo_disponivel, validar_modelo
from app.services.propostas import (
    MSG_NAO_ENCONTRADA,
    STATUS_FILTRO,
    STATUS_PENDENTES,
    calcular_hash,
    diff_campos,
    eh_simples,
    gerar_codigo,
    hoje_sp,
    pode_ver,
    serializar_detalhe,
    serializar_item,
    status_efetivo,
    validade_padrao,
    validar_dados,
)

router = APIRouter()


def _obter_visivel(db: Session, proposta_id: int, user: dict, travar: bool = False) -> Proposta:
    q = db.query(Proposta).filter(Proposta.id == proposta_id)
    if travar:
        # FOR UPDATE não aceita o LEFT JOIN do joinedload; as relações carregam sob demanda
        q = q.with_for_update()
    else:
        q = q.options(joinedload(Proposta.assinatura), joinedload(Proposta.edicoes))
    p = q.first()
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
    if not modelo_disponivel(payload.modelo):
        raise HTTPException(status_code=422, detail="Modelo de proposta inválido")
    dados = validar_modelo(payload, payload.modelo, validade_padrao(), hoje_sp())

    codigo = gerar_codigo()
    while db.query(Proposta.id).filter(Proposta.codigo == codigo).first():
        codigo = gerar_codigo()

    p = Proposta(
        **dados,
        codigo=codigo,
        emitida_em=datetime.utcnow().replace(microsecond=0),
        status="aguardando",
        versao=1,
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


@router.put("/{proposta_id}")
def editar_proposta(
    proposta_id: int,
    payload: PropostaCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    p = _obter_visivel(db, proposta_id, user, travar=True)
    status_atual = status_efetivo(p)
    if status_atual == "assinada":
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Proposta já assinada")
    if status_atual == "cancelada":
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Proposta cancelada não pode ser editada")

    try:
        if eh_simples(p):
            dados = validar_dados(payload, p.validade)
        else:
            if payload.modelo and payload.modelo != p.modelo:
                raise HTTPException(status_code=422, detail="O modelo da proposta não pode ser alterado")
            dados = validar_modelo(payload, p.modelo, p.validade, p.data_proposta)
            dados.pop("modelo")
    except HTTPException:
        db.rollback()
        raise
    alteracoes = diff_campos(p, dados)
    if not alteracoes:
        db.rollback()
        return {**serializar_detalhe(p), "alterada": False}

    agora = datetime.utcnow().replace(microsecond=0)
    for campo, valor in dados.items():
        setattr(p, campo, valor)
    p.versao += 1
    p.atualizada_em = agora
    p.status = "aguardando"
    p.versao_visualizada_em = None
    p.conteudo_hash = calcular_hash(p)
    db.add(PropostaEdicao(
        proposta_id=p.id,
        versao=p.versao,
        editada_em=agora,
        editado_por_id=user["id"],
        editado_por_usuario=user["usuario"],
        alteracoes=alteracoes,
    ))
    db.commit()
    db.expire_all()
    return {**serializar_detalhe(_obter_visivel(db, proposta_id, user)), "alterada": True}


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
