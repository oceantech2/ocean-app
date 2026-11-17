"""Notícias elegíveis no site (feature 106)."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Noticia
from app.services.noticias import (
    MSG_INDISPONIVEL,
    SEGMENTOS,
    STATUS_PUBLICADA,
    elegivel_publica,
    hoje_sp,
    serializar_publica,
)

router = APIRouter()


def _elegivel(db: Session, noticia_id: int) -> Noticia:
    n = db.query(Noticia).filter(Noticia.id == noticia_id).first()
    if not n or not elegivel_publica(n):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=MSG_INDISPONIVEL)
    return n


@router.get("/")
def listar_noticias(
    segmento: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    hoje = hoje_sp()
    q = db.query(Noticia).filter(Noticia.status == STATUS_PUBLICADA, Noticia.data_publicacao <= hoje)
    if segmento:
        if segmento not in SEGMENTOS:
            raise HTTPException(status_code=422, detail="Segmento inválido")
        q = q.filter(Noticia.segmento == segmento)
    itens = q.order_by(Noticia.data_publicacao.desc(), Noticia.id.desc()).all()
    return [serializar_publica(n) for n in itens]


@router.get("/{noticia_id}")
def obter_noticia(noticia_id: int, db: Session = Depends(get_db)):
    return serializar_publica(_elegivel(db, noticia_id))
