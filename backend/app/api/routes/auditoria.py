from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import AuditLog
from app.api.routes.auth import get_current_user, require_admin

router = APIRouter()


@router.get("/")
def listar_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    entidade: Optional[str] = Query(None),
    usuario: Optional[str] = Query(None),
    acao: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Lista o histórico de auditoria, mais recente primeiro."""
    query = db.query(AuditLog)
    if entidade:
        query = query.filter(AuditLog.entidade == entidade)
    if usuario:
        query = query.filter(AuditLog.usuario == usuario)
    if acao:
        query = query.filter(AuditLog.acao == acao)

    total = query.count()
    logs = query.order_by(AuditLog.criado_em.desc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "dados": [
            {
                "id": l.id,
                "usuario": l.usuario,
                "acao": l.acao,
                "entidade": l.entidade,
                "entidade_id": l.entidade_id,
                "descricao": l.descricao,
                "criado_em": l.criado_em.isoformat() if l.criado_em else None,
            }
            for l in logs
        ],
    }


@router.delete("/")
def limpar_logs(
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    """Remove todos os registros do log de auditoria."""
    deletados = db.query(AuditLog).delete()
    db.commit()
    return {"deletados": deletados}
