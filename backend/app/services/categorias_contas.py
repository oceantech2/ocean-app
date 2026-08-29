"""Taxonomia de Categorias para Contas a Pagar."""
from __future__ import annotations

from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

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
    SUB_BONUS: "Comissões",
    SUB_COMISSAO: "Comissão",
    SUB_RETIRADA: "Retirada Sócios",
    SUB_BENEFICIOS: "Benefícios",
}

# Labels legados (exibição de pendentes)
LABELS_LEGADO = {
    "administrativo": "Administrativo (legado)",
    "salario": "Salário (legado)",
    "bonus": "Comissões (legado)",
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


def label_categoria(
    codigo: str,
    pendente: bool = False,
    subcategoria: Optional[str] = None,
    db: Optional["Session"] = None,
) -> str:
    c = normalizar_codigo(codigo)
    if pendente:
        return LABELS_LEGADO.get(c, codigo or "Pendente")
    base = CATEGORIAS.get(c)
    if base is None and db is not None:
        cad = _buscar_cadastrada(db, c)
        if cad:
            base = cad.nome
    if base is None:
        base = codigo
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


def resolver_import_categoria(raw: Optional[str], db: Optional["Session"] = None) -> Optional[str]:
    if raw is None or str(raw).strip() == "":
        return None
    key = str(raw).strip().lower()
    key_norm = normalizar_codigo(raw)
    found = _IMPORT_CATEGORIA_ALIASES.get(key) or _IMPORT_CATEGORIA_ALIASES.get(key_norm)
    if found:
        return found
    if db is not None:
        cad = _buscar_cadastrada_por_nome_ou_codigo(db, str(raw).strip())
        if cad:
            return cad.codigo
    return None


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
    db: Optional["Session"] = None,
) -> tuple[str, Optional[str]]:
    """Valida e normaliza. Levanta ValueError se inválido."""
    cat = normalizar_codigo(categoria)
    sub = normalizar_codigo(subcategoria) if subcategoria else None

    if not cat:
        raise ValueError("Categoria é obrigatória")

    if cat not in CATEGORIAS and db is not None:
        cad = _buscar_cadastrada(db, cat)
        if cad is None and categoria:
            cad = _buscar_cadastrada_por_nome_ou_codigo(db, str(categoria).strip())
        if cad:
            if sub:
                raise ValueError(f"Categoria {cad.nome} não possui subcategoria")
            return cad.codigo, None

    if cat not in CATEGORIAS:
        if permitir_pendente:
            return cat, None
        raise ValueError(f"Categoria inválida: {categoria}")

    if cat == CATEGORIA_RH:
        if not sub or sub not in SUBCATEGORIAS_RH:
            raise ValueError(
                "Recursos Humanos exige subcategoria: salário, comissões, comissão, retirada sócios ou benefícios"
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


def _char_nome_ok(ch: str) -> bool:
    if ch in " -/":
        return True
    return ch.isalnum() and ch != "_"


def _buscar_cadastrada(db: "Session", codigo: str):
    from app.models import CategoriaPagarCadastrada

    if not codigo:
        return None
    return (
        db.query(CategoriaPagarCadastrada)
        .filter(CategoriaPagarCadastrada.codigo == codigo)
        .first()
    )


def _buscar_cadastrada_por_nome_ou_codigo(db: "Session", bruto: str):
    from sqlalchemy import func
    from app.models import CategoriaPagarCadastrada

    nome = (bruto or "").strip()
    if not nome:
        return None
    por_codigo = _buscar_cadastrada(db, normalizar_codigo(nome))
    if por_codigo:
        return por_codigo
    return (
        db.query(CategoriaPagarCadastrada)
        .filter(func.lower(CategoriaPagarCadastrada.nome) == nome.casefold())
        .first()
    )


def listar_catalogo(db: "Session") -> dict:
    from sqlalchemy import func
    from app.models import CategoriaPagarCadastrada

    oficiais = [
        {
            "codigo": codigo,
            "nome": nome,
            "exige_subcategoria": codigo == CATEGORIA_RH,
        }
        for codigo, nome in CATEGORIAS.items()
    ]
    rows = (
        db.query(CategoriaPagarCadastrada)
        .order_by(func.lower(CategoriaPagarCadastrada.nome))
        .all()
    )
    cadastradas = [
        {"id": r.id, "codigo": r.codigo or f"cat_{r.id}", "nome": r.nome}
        for r in rows
        if r.codigo
    ]
    subcategorias_rh = [
        {"codigo": codigo, "nome": nome}
        for codigo, nome in SUBCATEGORIAS_RH.items()
    ]
    return {
        "oficiais": oficiais,
        "cadastradas": cadastradas,
        "subcategorias_rh": subcategorias_rh,
    }


def validar_nome_nova(nome_bruto: Optional[str], db: "Session") -> str:
    from sqlalchemy import func
    from app.models import CategoriaPagarCadastrada

    nome = (nome_bruto or "").strip()
    if not nome:
        raise ValueError("Nome é obrigatório")
    if len(nome) > 20:
        raise ValueError("Nome deve ter no máximo 20 caracteres")
    if any(not _char_nome_ok(ch) for ch in nome):
        raise ValueError("Use apenas letras, números, espaços, hífen e barra")

    chave = nome.casefold()
    labels_ocupados = {v.casefold() for v in CATEGORIAS.values()}
    labels_ocupados.update(v.casefold() for v in SUBCATEGORIAS_RH.values())
    if chave in labels_ocupados:
        raise ValueError("Já existe uma categoria com este nome")

    codigo_tentativa = normalizar_codigo(nome)
    reservados = set(CATEGORIAS.keys()) | set(SUBCATEGORIAS_RH.keys())
    if codigo_tentativa in reservados:
        raise ValueError("Este nome conflita com uma categoria ou subcategoria existente")

    existente = (
        db.query(CategoriaPagarCadastrada)
        .filter(func.lower(CategoriaPagarCadastrada.nome) == chave)
        .first()
    )
    if existente:
        raise ValueError("Já existe uma categoria com este nome")
    return nome


def criar_cadastrada(db: "Session", nome_bruto: str, criado_por: Optional[str] = None):
    from app.models import CategoriaPagarCadastrada

    nome = validar_nome_nova(nome_bruto, db)
    row = CategoriaPagarCadastrada(nome=nome, codigo=None, criado_por=criado_por)
    db.add(row)
    db.flush()
    row.codigo = f"cat_{row.id}"
    db.flush()
    return row

