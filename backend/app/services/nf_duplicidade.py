"""Unicidade de número de NF / Contas a Receber (features 013 + 053)."""
from __future__ import annotations

from typing import Any, Optional

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import NF

CODE_DUPLICADO = "NF_NUMERO_DUPLICADO"
CODE_ORIGEM_CONFLITO = "NF_NUMERO_ORIGEM_CONFLITO"
CODE_IMPORT_ON_CONFLICT = "NF_IMPORT_ON_CONFLICT_REQUIRED"
MSG_DUPLICADO = "Já existe uma conta a receber com este número."

_ORIGEM_ROTULO = {"manual": "Manual", "maggo": "Maggo"}


def normalizar_numero(numero: str | None) -> str:
    return (numero or "").strip()


def normalizar_origem(origem: str | None) -> str:
    o = (origem or "maggo").strip().lower()
    return o if o in ("manual", "maggo") else "maggo"


def origem_de(nf: NF) -> str:
    return normalizar_origem(getattr(nf, "origem", None))


def rotulo_origem(origem: str | None) -> str:
    return _ORIGEM_ROTULO.get(normalizar_origem(origem), "Maggo")


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
        "origem_existente": origem_de(nf),
    }


def detail_origem_conflito(nf: NF) -> dict[str, Any]:
    rotulo = rotulo_origem(origem_de(nf))
    return {
        "code": CODE_ORIGEM_CONFLITO,
        "message": (
            f"Este número já existe em outra origem ({rotulo}). "
            "Não é permitido cadastrar a mesma nota em duas origens."
        ),
        "nf_id": nf.id,
        "numero": nf.numero,
        "razao_social": nf.razao_social,
        "origem_existente": origem_de(nf),
    }


def raise_duplicado(nf: NF) -> None:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail_duplicado(nf))


def raise_origem_conflito(nf: NF) -> None:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail_origem_conflito(nf))


def raise_conflito_numero(existente: NF, origem_operacao: str) -> None:
    """Emite 409 duplicado (mesma origem) ou conflito de origem (origens diferentes)."""
    if origem_de(existente) != normalizar_origem(origem_operacao):
        raise_origem_conflito(existente)
    raise_duplicado(existente)


def garantir_numero_livre(
    db: Session,
    numero: str | None,
    origem_operacao: str = "manual",
    excluir_id: Optional[int] = None,
) -> Optional[str]:
    """Normaliza o número. Vazio → None (sem checagem). Preenchido → livre ou 409 classificado."""
    num = normalizar_numero(numero)
    if not num:
        return None
    existente = buscar_por_numero(db, num, excluir_id=excluir_id)
    if existente:
        raise_conflito_numero(existente, origem_operacao)
    return num


def raise_se_integrity_numero(
    db: Session,
    exc: IntegrityError,
    numero: str | None,
    origem_operacao: str = "manual",
) -> None:
    """Se IntegrityError for de unique em numero, relança 409 classificado; senão relança a original."""
    db.rollback()
    msg = str(getattr(exc, "orig", exc)).lower()
    if "numero" in msg or "nfs" in msg or "unique" in msg:
        existente = buscar_por_numero(db, normalizar_numero(numero))
        if existente:
            raise_conflito_numero(existente, origem_operacao)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": CODE_DUPLICADO,
                "message": MSG_DUPLICADO,
                "nf_id": None,
                "numero": normalizar_numero(numero),
                "razao_social": None,
                "origem_existente": None,
            },
        )
    raise exc
