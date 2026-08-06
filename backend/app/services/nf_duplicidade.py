"""Unicidade de número de NF / Contas a Receber (feature 013)."""
from __future__ import annotations

from typing import Any, Optional

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import NF

CODE_DUPLICADO = "NF_NUMERO_DUPLICADO"
CODE_IMPORT_ON_CONFLICT = "NF_IMPORT_ON_CONFLICT_REQUIRED"
MSG_DUPLICADO = "Já existe uma conta a receber com este número."


def normalizar_numero(numero: str | None) -> str:
    return (numero or "").strip()


def buscar_por_numero(db: Session, numero: str, excluir_id: Optional[int] = None) -> Optional[NF]:
    q = db.query(NF).filter(NF.numero == numero)
    if excluir_id is not None:
        q = q.filter(NF.id != excluir_id)
    return q.first()


def detail_duplicado(nf: NF) -> dict[str, Any]:
    return {
        "code": CODE_DUPLICADO,
        "message": MSG_DUPLICADO,
        "nf_id": nf.id,
        "numero": nf.numero,
        "razao_social": nf.razao_social,
    }


def raise_duplicado(nf: NF) -> None:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail_duplicado(nf))


def garantir_numero_livre(db: Session, numero: str, excluir_id: Optional[int] = None) -> str:
    """Normaliza e garante que o número não pertence a outra NF. Retorna o número trimado."""
    num = normalizar_numero(numero)
    if not num:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Número da conta a receber é obrigatório",
        )
    existente = buscar_por_numero(db, num, excluir_id=excluir_id)
    if existente:
        raise_duplicado(existente)
    return num


def raise_se_integrity_numero(db: Session, exc: IntegrityError, numero: str) -> None:
    """Se IntegrityError for de unique em numero, relança 409; senão relança a original."""
    db.rollback()
    msg = str(getattr(exc, "orig", exc)).lower()
    if "numero" in msg or "nfs" in msg or "unique" in msg:
        existente = buscar_por_numero(db, normalizar_numero(numero))
        if existente:
            raise_duplicado(existente)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": CODE_DUPLICADO,
                "message": MSG_DUPLICADO,
                "nf_id": None,
                "numero": normalizar_numero(numero),
                "razao_social": None,
            },
        )
    raise exc
