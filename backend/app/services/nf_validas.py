"""Filtros de Contas a Receber (NF) e comissões válidas para cálculos.

Conta válida: não cancelada e não excluída (soft delete). Arquivamento segue a regra
de cada tela e não é tratado aqui.
"""
from sqlalchemy import and_, or_

from app.models import NF, Bonus, StatusNF


def filtro_nf_valida():
    return and_(NF.status != StatusNF.CANCELADA, NF.excluida_em.is_(None))


def filtro_bonus_valido():
    """Comissão sem conta vinculada ou com conta vinculada válida.

    A consulta chamadora precisa de `outerjoin(NF, Bonus.nf_id == NF.id)`.
    """
    return or_(Bonus.nf_id.is_(None), filtro_nf_valida())
