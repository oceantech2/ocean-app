"""Helpers da Configuração do Período (meta líquida + alíquota)."""
from __future__ import annotations


def meta_bruta(meta_liquida: float | None, aliquota_periodo: float | None) -> float | None:
    """meta_bruta = round(meta_liquida / (1 - aliquota/100), 2). None se inválido."""
    if meta_liquida is None or aliquota_periodo is None:
        return None
    try:
        liq = float(meta_liquida)
        aliq = float(aliquota_periodo)
    except (TypeError, ValueError):
        return None
    if aliq < 0 or aliq >= 100:
        return None
    denom = 1.0 - (aliq / 100.0)
    if denom <= 0:
        return None
    return round(liq / denom, 2)


def aliquotas_iguais(a: float | None, b: float | None) -> bool:
    if a is None and b is None:
        return True
    if a is None or b is None:
        return False
    return abs(float(a) - float(b)) < 1e-9
