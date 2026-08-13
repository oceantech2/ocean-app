"""Regras de cálculo de férias (direito anual, saldo, datas, transferência)."""
from datetime import date
from typing import Iterable, Optional, Sequence, Tuple


Parcela = Tuple[int, int]  # (id, dias_direito)


def direito_anual(dias_direito: Iterable[int]) -> int:
    valores = list(dias_direito)
    return max(valores) if valores else 0


def total_tirado(dias_tirados: Iterable[int]) -> int:
    return sum(dias_tirados)


def saldo_anual(dias_direito: Iterable[int], dias_tirados: Iterable[int]) -> int:
    return direito_anual(dias_direito) - total_tirado(dias_tirados)


def datas_validas(inicio: Optional[date], fim: Optional[date]) -> bool:
    if inicio is None or fim is None:
        return True
    return fim >= inicio


def intervalos_sobrepoem(
    a_inicio: Optional[date],
    a_fim: Optional[date],
    b_inicio: Optional[date],
    b_fim: Optional[date],
) -> bool:
    if not all([a_inicio, a_fim, b_inicio, b_fim]):
        return False
    return a_inicio <= b_fim and b_inicio <= a_fim


def destino_transferencia(excluido_direito: int, restantes: Sequence[Parcela]) -> Optional[int]:
    """Retorna o id da parcela que deve herdar o direito, ou None."""
    if not restantes:
        return None
    max_restante = max(d for _, d in restantes)
    if excluido_direito > max_restante:
        return min(i for i, _ in restantes)
    return None
