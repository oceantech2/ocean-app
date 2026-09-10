"""Endpoint de limpeza disponível SOMENTE com DEBUG=True (dev local).

Usa a mesma lógica de `app.services.zerar_dados_ops` / `scripts/zerar_dados.py`:
preserva login + fornecedores puros; zera o restante; grava maggo_stub_empty.
"""
from __future__ import annotations

from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.routes.auth import require_admin
from app.config import settings
from app.database import get_db
from app.services.zerar_dados_ops import FRASE_CONFIRMACAO, baseline_counts, zerar_dados

router = APIRouter()


def _mascara_database_url() -> str:
    """Host/db sem senha — para o botão DEV mostrar qual banco será zerado."""
    try:
        u = urlparse(settings.DATABASE_URL)
        host = u.hostname or "?"
        port = f":{u.port}" if u.port else ""
        db = (u.path or "/").lstrip("/") or "?"
        return f"{host}{port}/{db}"
    except Exception:
        return "(não foi possível identificar)"


class ZerarDadosBody(BaseModel):
    confirm: str = Field(..., description=f'Deve ser exatamente "{FRASE_CONFIRMACAO}"')


@router.get("/status")
def status_dev_wipe(current_user: str = Depends(require_admin)):
    """Indica se o wipe dev está habilitado e qual banco o backend usa."""
    return {
        "disponivel": bool(settings.DEBUG),
        "frase_confirmacao": FRASE_CONFIRMACAO if settings.DEBUG else None,
        "usuario": current_user,
        "database": _mascara_database_url() if settings.DEBUG else None,
        "escopo": {
            "preserva": ["usuarios_app", "usuarios_auth", "fornecedores puros (+ docs/histórico)"],
            "zera": [
                "nfs (contas a receber)",
                "bonus",
                "ferias",
                "contas_pagar",
                "fluxo/saldos",
                "dhs",
                "impostos",
                "audit_logs",
                "metas",
                "patrimonio",
                "categorias/subcategorias",
                "contas_correntes",
                "configuracao_app",
                "colaboradores de equipe",
            ],
            "pos_wipe": ["maggo_stub_empty=true (não recria Contas a Receber)"],
        },
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

    database = _mascara_database_url()
    antes = baseline_counts(db)
    try:
        _antes, depois, avisos = zerar_dados(db)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Limpeza abortada (rollback): {exc}",
        ) from exc

    # Garantia de aceite: contas a receber e demais devem estar zerados
    pendencias = {
        k: v
        for k, v in depois.items()
        if k
        not in (
            "usuarios_app",
            "usuarios_auth",
            "fornecedores_puros",
            "colaboradores_total",
            "configuracao_app",  # fica 1 = maggo_stub_empty
        )
        and v != 0
    }
    # colaboradores_total deve igualar fornecedores_puros
    if depois.get("colaboradores_total") != depois.get("fornecedores_puros"):
        pendencias["colaboradores_nao_fornecedor"] = depois.get("colaboradores_total")

    return {
        "ok": len(pendencias) == 0,
        "executado_por": current_user,
        "database": database,
        "antes": antes,
        "depois": depois,
        "avisos_arquivos": avisos,
        "pendencias": pendencias,
        "maggo_stub_empty": True,
    }
