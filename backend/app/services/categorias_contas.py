"""Taxonomia de Categorias para Contas a Pagar."""
from __future__ import annotations

from typing import Optional

CATEGORIA_ADM = "adm_financeiro"
CATEGORIA_OPERACOES = "operacoes"
CATEGORIA_MARKETING = "marketing"
CATEGORIA_COMERCIAL = "comercial"
CATEGORIA_RH = "recursos_humanos"
CATEGORIA_TECNOLOGIA = "tecnologia"
CATEGORIA_IMPOSTOS = "impostos"

CATEGORIAS = {
    CATEGORIA_ADM: "Adm/Financeiro",
    CATEGORIA_OPERACOES: "Operações",
    CATEGORIA_MARKETING: "Marketing",
    CATEGORIA_COMERCIAL: "Comercial",
    CATEGORIA_RH: "Recursos Humanos",
    CATEGORIA_TECNOLOGIA: "Tecnologia",
    CATEGORIA_IMPOSTOS: "Impostos",
}

SUB_SALARIO = "salario"
SUB_BONUS = "bonus"
SUB_COMISSAO = "comissao"
SUB_RETIRADA = "retirada_socios"
SUB_BENEFICIOS = "beneficios"

SUBCATEGORIAS_RH = {
    SUB_SALARIO: "Salário",
    SUB_BONUS: "Bônus",
    SUB_COMISSAO: "Comissão",
    SUB_RETIRADA: "Retirada Sócios",
    SUB_BENEFICIOS: "Benefícios",
}

# Labels legados (exibição de pendentes)
LABELS_LEGADO = {
    "administrativo": "Administrativo (legado)",
    "salario": "Salário (legado)",
    "bonus": "Bônus (legado)",
    "retirada_lucro": "Retirada de Lucro (legado)",
    "impostos": "Impostos (legado)",
    "imposto": "Imposto (legado)",
    "reembolsos": "Reembolsos (legado)",
    "evento": "Evento (legado)",
}

# Aliases de import (apenas taxonomia NOVA — labels pt-BR)
_IMPORT_CATEGORIA_ALIASES = {
    **{k: k for k in CATEGORIAS},
    **{v.lower(): k for k, v in CATEGORIAS.items()},
    "adm/financeiro": CATEGORIA_ADM,
    "adm financeiro": CATEGORIA_ADM,
    "recursos humanos": CATEGORIA_RH,
    "rh": CATEGORIA_RH,
}

_IMPORT_SUB_ALIASES = {
    **{k: k for k in SUBCATEGORIAS_RH},
    **{v.lower(): k for k, v in SUBCATEGORIAS_RH.items()},
    "retirada sócios": SUB_RETIRADA,
    "retirada socios": SUB_RETIRADA,
}


def normalizar_codigo(valor: Optional[str]) -> str:
    if not valor:
        return ""
    return str(valor).strip().lower().replace(" ", "_").replace("-", "_")


def label_categoria(codigo: str, pendente: bool = False, subcategoria: Optional[str] = None) -> str:
    c = normalizar_codigo(codigo)
    if pendente:
        return LABELS_LEGADO.get(c, codigo or "Pendente")
    base = CATEGORIAS.get(c, codigo)
    if c == CATEGORIA_RH and subcategoria:
        sub = SUBCATEGORIAS_RH.get(normalizar_codigo(subcategoria), subcategoria)
        return f"{base} / {sub}"
    return base


def mapear_legado(valor_antigo: Optional[str]) -> tuple[str, Optional[str], bool]:
    """Retorna (categoria, subcategoria, pendente) a partir do centro_custo legado."""
    v = normalizar_codigo(valor_antigo)
    # Enum SQLAlchemy às vezes persiste NAME em maiúsculas
    mapa = {
        "administrativo": (CATEGORIA_ADM, None, False),
        "salario": (CATEGORIA_RH, SUB_SALARIO, False),
        "bonus": (CATEGORIA_RH, SUB_BONUS, False),
        "retirada_lucro": (CATEGORIA_RH, SUB_RETIRADA, False),
        "impostos": (CATEGORIA_IMPOSTOS, None, False),
        "imposto": (CATEGORIA_IMPOSTOS, None, False),
    }
    if v in mapa:
        return mapa[v]
    # Não mapeável — mantém valor antigo, pendente
    return (v or "desconhecido", None, True)


def resolver_import_categoria(raw: Optional[str]) -> Optional[str]:
    if raw is None or str(raw).strip() == "":
        return None
    key = str(raw).strip().lower()
    key_norm = normalizar_codigo(raw)
    return _IMPORT_CATEGORIA_ALIASES.get(key) or _IMPORT_CATEGORIA_ALIASES.get(key_norm)


def resolver_import_subcategoria(raw: Optional[str]) -> Optional[str]:
    if raw is None or str(raw).strip() == "":
        return None
    key = str(raw).strip().lower()
    key_norm = normalizar_codigo(raw)
    return _IMPORT_SUB_ALIASES.get(key) or _IMPORT_SUB_ALIASES.get(key_norm)


def validar_classificacao(
    categoria: Optional[str],
    subcategoria: Optional[str] = None,
    *,
    permitir_pendente: bool = False,
) -> tuple[str, Optional[str]]:
    """Valida e normaliza. Levanta ValueError se inválido."""
    cat = normalizar_codigo(categoria)
    sub = normalizar_codigo(subcategoria) if subcategoria else None

    if not cat:
        raise ValueError("Categoria é obrigatória")

    if cat not in CATEGORIAS:
        if permitir_pendente:
            return cat, None
        raise ValueError(f"Categoria inválida: {categoria}")

    if cat == CATEGORIA_RH:
        if not sub or sub not in SUBCATEGORIAS_RH:
            raise ValueError(
                "Recursos Humanos exige subcategoria: salário, bônus, comissão, retirada sócios ou benefícios"
            )
        return cat, sub

    if sub:
        raise ValueError(f"Categoria {CATEGORIAS[cat]} não possui subcategoria")
    return cat, None


def inferir_de_descricao(descricao: str) -> tuple[str, Optional[str]]:
    """Infere taxonomia nova a partir da descrição (import Excel)."""
    d = (descricao or "").lower()
    if any(k in d for k in ("salário", "salario", "folha", "férias", "ferias")):
        return CATEGORIA_RH, SUB_SALARIO
    if any(k in d for k in ("imposto", "das", "irpj", "csll", "pis", "cofins", "iss")):
        return CATEGORIA_IMPOSTOS, None
    if any(k in d for k in ("bônus", "bonus", "premiação", "premiacao")):
        return CATEGORIA_RH, SUB_BONUS
    if any(k in d for k in ("comissão", "comissao")):
        return CATEGORIA_RH, SUB_COMISSAO
    if any(k in d for k in ("retirada", "lucro", "sócio", "socio", "pro-labore", "pró-labore")):
        return CATEGORIA_RH, SUB_RETIRADA
    if any(k in d for k in ("benefício", "beneficio", "vr", "vt", "plano de saúde")):
        return CATEGORIA_RH, SUB_BENEFICIOS
    if any(k in d for k in ("marketing", "ads", "campanha")):
        return CATEGORIA_MARKETING, None
    if any(k in d for k in ("comercial", "venda")):
        return CATEGORIA_COMERCIAL, None
    if any(k in d for k in ("tecnologia", "software", "saas", "cloud", "servidor")):
        return CATEGORIA_TECNOLOGIA, None
    if any(k in d for k in ("operação", "operacao", "logística", "logistica")):
        return CATEGORIA_OPERACOES, None
    return CATEGORIA_ADM, None
