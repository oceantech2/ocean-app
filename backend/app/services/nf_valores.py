"""Cálculo fiscal de contas a receber (imposto e líquido por alíquota)."""
from fastapi import HTTPException


def calcular_imposto_liquido(
    valor_bruto: float,
    aliquota_pct: float | None,
) -> tuple[float, float, float | None]:
    """Retorna (valor_imposto, valor_liquido, aliquota_gravada)."""
    if aliquota_pct is None:
        pct = 0.0
        aliq_gravada = None
    else:
        pct = float(aliquota_pct)
        aliq_gravada = pct
    if pct < 0 or pct > 100:
        raise HTTPException(status_code=400, detail="Alíquota inválida (deve estar entre 0 e 100)")
    imposto = round(valor_bruto * (pct / 100), 2)
    liquido = round(valor_bruto - imposto, 2)
    return imposto, liquido, aliq_gravada
