"""Notícias do Consultant Panel (feature 106): todos veem e criam; editar/publicar/excluir só autor ou admin."""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.routes.proposal_auth import get_proposal_user
from app.database import get_db
from app.models import Noticia
from app.schemas import NoticiaIn
from app.services.audit import registrar_auditoria
from app.services.noticias import (
    MSG_NAO_ENCONTRADA,
    SEGMENTOS,
    STATUS_NAO_PUBLICADA,
    STATUS_PUBLICADA,
    STATUS_VALIDOS,
    exigir_alteracao,
    serializar_painel,
    validar_noticia,
)

router = APIRouter()


def _agora() -> datetime:
    return datetime.utcnow().replace(microsecond=0)


def _contem(valor: str) -> str:
    escapado = valor.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return f"%{escapado}%"


def _obter(db: Session, noticia_id: int) -> Noticia:
    n = db.query(Noticia).filter(Noticia.id == noticia_id).first()
    if not n:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=MSG_NAO_ENCONTRADA)
    return n


def _descricao(n: Noticia) -> str:
    return f"Notícia #{n.id} — {n.titulo_pt}"


@router.get("/")
def listar_noticias(
    status_noticia: Optional[str] = Query(None, alias="status"),
    segmento: Optional[str] = Query(None),
    busca: Optional[str] = Query(None, max_length=120),
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    q = db.query(Noticia)
    if status_noticia:
        if status_noticia not in STATUS_VALIDOS:
            raise HTTPException(status_code=422, detail="Status inválido")
        q = q.filter(Noticia.status == status_noticia)
    if segmento:
        if segmento not in SEGMENTOS:
            raise HTTPException(status_code=422, detail="Segmento inválido")
        q = q.filter(Noticia.segmento == segmento)
    if busca and busca.strip():
        termo = _contem(busca.strip())
        q = q.filter(or_(Noticia.titulo_pt.ilike(termo), Noticia.titulo_en.ilike(termo)))
    itens = q.order_by(Noticia.data_publicacao.desc(), Noticia.id.desc()).all()
    return {"items": [serializar_painel(n, user) for n in itens], "total": len(itens)}


@router.get("/{noticia_id}")
def obter_noticia(noticia_id: int, db: Session = Depends(get_db), user: dict = Depends(get_proposal_user)):
    return serializar_painel(_obter(db, noticia_id), user)


@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_noticia(payload: NoticiaIn, db: Session = Depends(get_db), user: dict = Depends(get_proposal_user)):
    dados = validar_noticia(payload)
    status_inicial = dados.pop("status", STATUS_NAO_PUBLICADA)
    n = Noticia(
        **dados,
        status=status_inicial,
        criado_por_id=user["id"],
        criado_por_usuario=user["usuario"],
        criado_em=_agora(),
    )
    db.add(n)
    db.flush()
    registrar_auditoria(db, user["usuario"], "criar", "Noticia", n.id, _descricao(n))
    db.commit()
    db.refresh(n)
    return serializar_painel(n, user)


@router.put("/{noticia_id}")
def editar_noticia(
    noticia_id: int,
    payload: NoticiaIn,
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    n = _obter(db, noticia_id)
    exigir_alteracao(n, user)
    dados = validar_noticia(payload)
    # status só muda pelos endpoints publicar/despublicar
    dados.pop("status", None)
    for campo, valor in dados.items():
        setattr(n, campo, valor)
    n.atualizado_por_usuario = user["usuario"]
    n.atualizado_em = _agora()
    registrar_auditoria(db, user["usuario"], "editar", "Noticia", n.id, _descricao(n))
    db.commit()
    db.refresh(n)
    return serializar_painel(n, user)


def _mudar_status(db: Session, noticia_id: int, user: dict, novo: str, acao: str) -> dict:
    n = _obter(db, noticia_id)
    exigir_alteracao(n, user)
    if n.status != novo:
        n.status = novo
        n.atualizado_por_usuario = user["usuario"]
        n.atualizado_em = _agora()
        registrar_auditoria(db, user["usuario"], acao, "Noticia", n.id, _descricao(n))
        db.commit()
        db.refresh(n)
    return serializar_painel(n, user)


@router.post("/{noticia_id}/publicar")
def publicar_noticia(noticia_id: int, db: Session = Depends(get_db), user: dict = Depends(get_proposal_user)):
    return _mudar_status(db, noticia_id, user, STATUS_PUBLICADA, "publicar")


@router.post("/{noticia_id}/despublicar")
def despublicar_noticia(noticia_id: int, db: Session = Depends(get_db), user: dict = Depends(get_proposal_user)):
    return _mudar_status(db, noticia_id, user, STATUS_NAO_PUBLICADA, "despublicar")


@router.delete("/{noticia_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_noticia(noticia_id: int, db: Session = Depends(get_db), user: dict = Depends(get_proposal_user)):
    n = _obter(db, noticia_id)
    exigir_alteracao(n, user)
    registrar_auditoria(db, user["usuario"], "excluir", "Noticia", n.id, _descricao(n))
    db.delete(n)
    db.commit()
    return None
