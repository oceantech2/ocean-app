"""Imposto do mês aplicado às propostas (feature 092)."""
from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import or_, and_
from sqlalchemy.orm import Session

from app.models import ImpostoProposta

# Sem nenhum mês cadastrado
IMPOSTO_PADRAO = Decimal("18.75")
# Texto fixo das propostas emitidas antes da feature (imposto_percentual nulo)
IMPOSTO_LEGADO = Decimal("19.55")


def imposto_vigente(db: Session, hoje: Optional[date] = None) -> dict:
    """Mês corrente (São Paulo); senão o último mês anterior cadastrado; senão o padrão."""
    from app.services.propostas import hoje_sp

    hoje = hoje or hoje_sp()
    registro = (
        db.query(ImpostoProposta)
        .filter(or_(
            ImpostoProposta.ano < hoje.year,
            and_(ImpostoProposta.ano == hoje.year, ImpostoProposta.mes <= hoje.month),
        ))
        .order_by(ImpostoProposta.ano.desc(), ImpostoProposta.mes.desc())
        .first()
    )
    if registro is None:
        return {"percentual": IMPOSTO_PADRAO, "ano": None, "mes": None, "origem": "padrao"}
    mesmo_mes = registro.ano == hoje.year and registro.mes == hoje.month
    return {
        "percentual": Decimal(registro.percentual),
        "ano": registro.ano,
        "mes": registro.mes,
        "origem": "mes" if mesmo_mes else "anterior",
    }
