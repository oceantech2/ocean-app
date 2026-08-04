"""Fonte simulada Maggo para Contas a Receber (substituível pela Maggo real)."""
from __future__ import annotations

import os
from datetime import date


class MaggoStubError(Exception):
    """Falha controlada da fonte simulada Maggo."""


def listar_contas_receber() -> list[dict]:
    """Retorna contas a receber no shape esperado da Maggo.

    Se MAGGO_STUB_FAIL=true, levanta MaggoStubError (para testes de SC-005).
    """
    flag = os.getenv("MAGGO_STUB_FAIL", "").strip().lower()
    if flag in ("1", "true", "yes", "on"):
        raise MaggoStubError("Fonte Maggo (stub) indisponível")

    hoje = date.today()
    ano = hoje.year
    # Datas estáveis no mês corrente / próximo para facilitar filtros manuais
    return [
        {
            "numero": "MAGGO-001",
            "razao_social": "Cliente Alpha Ltda",
            "posicao": "Engenheiro de Software",
            "candidato": "Ana Silva",
            "valor_bruto": 25000.0,
            "valor_liquido": 22500.0,
            "data_emissao": date(ano, max(1, hoje.month - 1) if hoje.month > 1 else 1, 5),
            "data_vencimento": date(ano, hoje.month, min(28, hoje.day + 5) if hoje.day < 20 else 28),
            "tipo": "sucesso",
            "tipo_abertura_fechamento": None,
        },
        {
            "numero": "MAGGO-002",
            "razao_social": "Beta Recrutamento SA",
            "posicao": "Retainer Abertura",
            "candidato": None,
            "valor_bruto": 12000.0,
            "valor_liquido": 10800.0,
            "data_emissao": date(ano, hoje.month, 1),
            "data_vencimento": date(ano, hoje.month, 15),
            "tipo": "retainer",
            "tipo_abertura_fechamento": "abertura",
        },
        {
            "numero": "MAGGO-003",
            "razao_social": "Gamma Industries",
            "posicao": "Retainer Fechamento",
            "candidato": "Carlos Souza",
            "valor_bruto": 18000.0,
            "valor_liquido": 16200.0,
            "data_emissao": date(ano, hoje.month, 3),
            "data_vencimento": date(ano, min(12, hoje.month + 1) if hoje.month < 12 else 12, 10),
            "tipo": "retainer",
            "tipo_abertura_fechamento": "fechamento",
        },
        {
            "numero": "MAGGO-004",
            "razao_social": "Delta Tech",
            "posicao": "Product Manager",
            "candidato": "Beatriz Lima",
            "valor_bruto": 30000.0,
            "valor_liquido": 27000.0,
            "data_emissao": date(ano, hoje.month, 8),
            "data_vencimento": date(ano, hoje.month, 20),
            "tipo": "sucesso",
            "tipo_abertura_fechamento": None,
        },
        {
            "numero": "MAGGO-005",
            "razao_social": "Epsilon Consultoria",
            "posicao": "Designer UX",
            "candidato": "Diego Alves",
            "valor_bruto": 15000.0,
            "valor_liquido": 13500.0,
            "data_emissao": date(ano, max(1, hoje.month - 1) if hoje.month > 1 else 1, 20),
            "data_vencimento": date(ano, max(1, hoje.month - 1) if hoje.month > 1 else 1, 28),
            "tipo": "sucesso",
            "tipo_abertura_fechamento": None,
        },
    ]
