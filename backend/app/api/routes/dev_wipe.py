"""Endpoint de limpeza disponível SOMENTE com DEBUG=True (dev local)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.routes.auth import require_admin
from app.config import settings
from app.database import get_db
from app.services.zerar_dados_ops import FRASE_CONFIRMACAO, baseline_counts, zerar_dados

router = APIRouter()


class ZerarDadosBody(BaseModel):
    confirm: str = Field(..., description=f'Deve ser exatamente "{FRASE_CONFIRMACAO}"')


@router.get("/status")
def status_dev_wipe(current_user: str = Depends(require_admin)):
    """Indica se o wipe dev está habilitado neste backend."""
    return {
        "disponivel": bool(settings.DEBUG),
        "frase_confirmacao": FRASE_CONFIRMACAO if settings.DEBUG else None,
        "usuario": current_user,
    }


@router.post("/zerar-dados")
def zerar_dados_dev(
    body: ZerarDadosBody,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    if not settings.DEBUG:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Não disponível",
        )
    if body.confirm != FRASE_CONFIRMACAO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Confirmação inválida. Digite exatamente: {FRASE_CONFIRMACAO}',
        )

    antes = baseline_counts(db)
    try:
        _antes, depois, avisos = zerar_dados(db)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Limpeza abortada (rollback): {exc}",
        ) from exc

    return {
        "ok": True,
        "executado_por": current_user,
        "antes": antes,
        "depois": depois,
        "avisos_arquivos": avisos,
    }
