"""Modelos de proposta do Proposal (feature 098): leitura para todos os usuários, escrita só admin."""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.routes.proposal_auth import get_proposal_user
from app.database import get_db
from app.models import ModeloProposta
from app.schemas import ModeloPropostaIn
from app.services.audit import registrar_auditoria
from app.services.proposta_modelos import MODELOS, nome_modelo, validar_modelo_proposta

router = APIRouter()

MSG_NAO_ENCONTRADO = "Modelo não encontrado"
MSG_NOME_REPETIDO = "Já existe um modelo com esse nome nesta divisão"


def _exigir_admin(user: dict) -> None:
    if user["papel"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ação permitida apenas para administradores")


def _contem(valor: str) -> str:
    escapado = valor.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return f"%{escapado}%"


def _obter(db: Session, modelo_id: int) -> ModeloProposta:
    m = db.query(ModeloProposta).filter(ModeloProposta.id == modelo_id).first()
    if not m:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=MSG_NAO_ENCONTRADO)
    return m


def _nome_em_uso(db: Session, divisao: str, nome: str, ignorar_id: Optional[int] = None) -> bool:
    q = db.query(ModeloProposta.id).filter(
        ModeloProposta.divisao == divisao,
        func.lower(ModeloProposta.nome) == nome.lower(),
    )
    if ignorar_id is not None:
        q = q.filter(ModeloProposta.id != ignorar_id)
    return q.first() is not None


def _descricao(m: ModeloProposta) -> str:
    return f"{nome_modelo(m.divisao)} — {m.nome}"


def serializar(m: ModeloProposta) -> dict:
    return {
        "id": m.id,
        "divisao": m.divisao,
        "divisao_nome": nome_modelo(m.divisao),
        "nome": m.nome,
        "idioma": m.idioma,
        "moeda": m.moeda,
        "setor": m.setor,
        "projeto_escopo": m.projeto_escopo,
        "projetos": m.projetos or [],
        "shortlist": m.shortlist,
        "sla": m.sla,
        "garantia": m.garantia_texto,
        "validade_dias": m.validade_dias,
        "criado_por_usuario": m.criado_por_usuario,
        "criado_em": m.criado_em.isoformat() if m.criado_em else None,
        "atualizado_por_usuario": m.atualizado_por_usuario,
        "atualizado_em": m.atualizado_em.isoformat() if m.atualizado_em else None,
    }


@router.get("/")
def listar_modelos(
    divisao: Optional[str] = Query(None),
    nome: Optional[str] = Query(None, max_length=120),
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    _: dict = Depends(get_proposal_user),
):
    q = db.query(ModeloProposta)
    if divisao:
        if divisao not in MODELOS:
            raise HTTPException(status_code=422, detail="Divisão inválida")
        q = q.filter(ModeloProposta.divisao == divisao)
    if nome and nome.strip():
        q = q.filter(ModeloProposta.nome.ilike(_contem(nome.strip())))

    total = q.count()
    itens = (
        q.order_by(ModeloProposta.divisao, func.lower(ModeloProposta.nome), ModeloProposta.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {"items": [serializar(m) for m in itens], "total": total, "page": page, "page_size": page_size}


@router.get("/{modelo_id}")
def obter_modelo(
    modelo_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(get_proposal_user),
):
    return serializar(_obter(db, modelo_id))


@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_modelo(
    payload: ModeloPropostaIn,
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    _exigir_admin(user)
    dados = validar_modelo_proposta(payload)
    if _nome_em_uso(db, dados["divisao"], dados["nome"]):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=MSG_NOME_REPETIDO)
    m = ModeloProposta(**dados, criado_por_usuario=user["usuario"], criado_em=datetime.utcnow().replace(microsecond=0))
    db.add(m)
    db.flush()
    registrar_auditoria(db, user["usuario"], "criar", "ModeloProposta", m.id, _descricao(m))
    db.commit()
    db.refresh(m)
    return serializar(m)


@router.put("/{modelo_id}")
def editar_modelo(
    modelo_id: int,
    payload: ModeloPropostaIn,
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    _exigir_admin(user)
    m = _obter(db, modelo_id)
    dados = validar_modelo_proposta(payload)
    if _nome_em_uso(db, dados["divisao"], dados["nome"], ignorar_id=m.id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=MSG_NOME_REPETIDO)
    for campo, valor in dados.items():
        setattr(m, campo, valor)
    m.atualizado_por_usuario = user["usuario"]
    m.atualizado_em = datetime.utcnow().replace(microsecond=0)
    registrar_auditoria(db, user["usuario"], "editar", "ModeloProposta", m.id, _descricao(m))
    db.commit()
    db.refresh(m)
    return serializar(m)


@router.delete("/{modelo_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_modelo(
    modelo_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    _exigir_admin(user)
    m = _obter(db, modelo_id)
    registrar_auditoria(db, user["usuario"], "excluir", "ModeloProposta", m.id, _descricao(m))
    db.delete(m)
    db.commit()
    return None
