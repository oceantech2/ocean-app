"""Serviço de registro de auditoria.

Uso típico dentro de uma rota:

    from app.services.audit import registrar_auditoria
    registrar_auditoria(db, current_user, "criar", "NF", nova_nf.id, f"NF {nova_nf.numero}")

Não dá commit por conta própria — assume que a rota já fará commit logo em seguida.
Se ocorrer qualquer erro ao registrar, é silenciado para nunca quebrar a operação principal.
"""
from sqlalchemy.orm import Session
from app.models import AuditLog


def registrar_auditoria(
    db: Session,
    usuario: str,
    acao: str,
    entidade: str,
    entidade_id: int | None = None,
    descricao: str | None = None,
):
    try:
        log = AuditLog(
            usuario=usuario or "desconhecido",
            acao=acao,
            entidade=entidade,
            entidade_id=entidade_id,
            descricao=(descricao or "")[:500],
        )
        db.add(log)
    except Exception:
        # Auditoria nunca deve interromper o fluxo principal
        pass
