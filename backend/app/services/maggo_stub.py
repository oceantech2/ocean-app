"""Fonte simulada Maggo para Contas a Receber (substituível pela Maggo real)."""
from __future__ import annotations

import os
from datetime import date


class MaggoStubError(Exception):
    """Falha controlada da fonte simulada Maggo."""


def listar_contas_receber() -> list[dict]:
    """Retorna contas a receber no shape Maggo desta entrega.

    Envia maggo_id + grupo Maggo. Não envia numero / data_emissao / data_vencimento.
    Se MAGGO_STUB_FAIL=true, levanta MaggoStubError.
    """
    flag = os.getenv("MAGGO_STUB_FAIL", "").strip().lower()
    if flag in ("1", "true", "yes", "on"):
        raise MaggoStubError("Fonte Maggo (stub) indisponível")

    hoje = date.today()
    ano = hoje.year
    mes = hoje.month
    return [
        {
            "maggo_id": "MAGGO-001",
            "razao_social": "Cliente Alpha Ltda",
            "posicao": "Engenheiro de Software",
            "candidato": "Ana Silva",
            "valor_bruto": 25000.0,
            "valor_imposto": 2500.0,
            "valor_liquido": 22500.0,
            "data_ent_pgto": date(ano, mes, min(28, 20)),
            "tipo": "sucesso",
            "tipo_abertura_fechamento": None,
        },
        {
            "maggo_id": "MAGGO-002",
            "razao_social": "Beta Recrutamento SA",
            "posicao": "Retainer Abertura",
            "candidato": None,
            "valor_bruto": 12000.0,
            "valor_imposto": 1200.0,
            "valor_liquido": 10800.0,
            "data_ent_pgto": date(ano, mes, 15),
            "tipo": "retainer",
            "tipo_abertura_fechamento": "abertura",
        },
        {
            "maggo_id": "MAGGO-003",
            "razao_social": "Gamma Industries",
            "posicao": "Retainer Fechamento",
            "candidato": "Carlos Souza",
            "valor_bruto": 18000.0,
            "valor_imposto": 1800.0,
            "valor_liquido": 16200.0,
            "data_ent_pgto": date(ano, min(12, mes + 1) if mes < 12 else 12, 10),
            "tipo": "retainer",
            "tipo_abertura_fechamento": "fechamento",
        },
        {
            "maggo_id": "MAGGO-004",
            "razao_social": "Delta Tech",
            "posicao": "Product Manager",
            "candidato": "Beatriz Lima",
            "valor_bruto": 30000.0,
            "valor_imposto": 0.0,
            "valor_liquido": 27000.0,
            "data_ent_pgto": date(ano, mes, 20),
            "tipo": "sucesso",
            "tipo_abertura_fechamento": None,
        },
        {
            "maggo_id": "MAGGO-005",
            "razao_social": "Epsilon Consultoria",
            "posicao": "Designer UX",
            "candidato": "Diego Alves",
            "valor_bruto": 15000.0,
            "valor_imposto": None,
            "valor_liquido": 13500.0,
            "data_ent_pgto": None,
            "tipo": "sucesso",
            "tipo_abertura_fechamento": None,
        },
        {
            "maggo_id": "MAGGO-006",
            "razao_social": "Zeta Serviços Ltda",
            "posicao": "Analista de Dados",
            "candidato": None,
            "valor_bruto": 10000.0,
            "valor_imposto": 1500.0,
            "valor_liquido": 8500.0,
            "data_ent_pgto": date(ano, mes, min(28, hoje.day if hoje.day >= 1 else 1)),
            "tipo": "retainer",
            "tipo_abertura_fechamento": "abertura",
        },
    ]
