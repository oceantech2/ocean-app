"""Limiar global do Alerta de Fluxo de Caixa (Dashboard)."""

from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import ConfiguracaoApp

CHAVE_LIMIAR = "limiar_alerta_fluxo"
LIMIAR_DEFAULT = 60


def _inteiro_valido(valor) -> int | None:
    """Retorna int 1..100 se válido; senão None."""
    if isinstance(valor, bool):
        return None
    try:
        if isinstance(valor, float):
            if not valor.is_integer():
                return None
            i = int(valor)
        elif isinstance(valor, int):
            i = valor
        else:
            s = str(valor).strip().replace(",", ".")
            f = float(s)
            if not f.is_integer():
                return None
            i = int(f)
    except (TypeError, ValueError):
        return None
    if not (1 <= i <= 100):
        return None
    return i


def ler_limiar(db: Session) -> int:
    row = db.query(ConfiguracaoApp).filter(ConfiguracaoApp.chave == CHAVE_LIMIAR).first()
    if not row or row.valor is None or str(row.valor).strip() == "":
        return LIMIAR_DEFAULT
    ok = _inteiro_valido(row.valor)
    return ok if ok is not None else LIMIAR_DEFAULT


def salvar_limiar(db: Session, valor) -> int:
    ok = _inteiro_valido(valor)
    if ok is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="limiar_percentual deve ser um inteiro de 1 a 100",
        )
    row = db.query(ConfiguracaoApp).filter(ConfiguracaoApp.chave == CHAVE_LIMIAR).first()
    payload = str(ok)
    if row:
        row.valor = payload
    else:
        db.add(ConfiguracaoApp(chave=CHAVE_LIMIAR, valor=payload))
    db.commit()
    return ok
