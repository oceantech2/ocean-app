from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.routes.auth import get_current_user
from app.services.email import coletar_alertas, enviar_alertas

router = APIRouter()


@router.get("/")
def preview_alertas(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Retorna os alertas atuais sem enviar e-mail (usado pelo frontend)."""
    alertas = coletar_alertas(db)
    alertas["total"] = (
        len(alertas["nfs"]) + len(alertas["contas"]) + len(alertas["ferias"])
    )
    return alertas


@router.post("/enviar")
def disparar_alertas(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Dispara o e-mail de alertas manualmente."""
    return enviar_alertas(db)
