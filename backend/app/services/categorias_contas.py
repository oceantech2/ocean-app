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
    SUB_BONUS: "Bônus",
    SUB_COMISSAO: "Comissão",
    SUB_RETIRADA: "Retirada Sócios",
    SUB_BENEFICIOS: "Benefícios",
}

NOMES_FABRICA_ANTIGOS_BONUS = frozenset({"Comissões", "Bônus & Comissão"})

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
    "bônus": SUB_BONUS,
    "comissões": SUB_BONUS,
    "comissoes": SUB_BONUS,
    "bônus & comissão": SUB_BONUS,
    "bonus & comissao": SUB_BONUS,
    "bônus e comissão": SUB_BONUS,
    "bonus e comissao": SUB_BONUS,
}


def normalizar_codigo(valor: Optional[str]) -> str:
    if not valor:
        return ""
    return str(valor).strip().lower().replace(" ", "_").replace("-", "_").replace("&", "")


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
        sub_code = normalizar_codigo(subcategoria)
        sub = SUBCATEGORIAS_RH.get(sub_code, subcategoria)
        if db is not None:
            row = _buscar_sub_rh(db, sub_code)
            if row:
                sub = row.nome
        return f"{base} / {sub}"
    return base


def mapear_legado(valor_antigo: Optional[str]) -> tuple[str, Optional[str], bool]:
    """Retorna (categoria, subcategoria, pendente) a partir do centro_custo legado."""
    v = normalizar_codigo(valor_antigo)
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


def resolver_import_subcategoria(raw: Optional[str], db: Optional["Session"] = None) -> Optional[str]:
    if raw is None or str(raw).strip() == "":
        return None
    key = str(raw).strip().lower()
    key_norm = normalizar_codigo(raw)
    found = _IMPORT_SUB_ALIASES.get(key) or _IMPORT_SUB_ALIASES.get(key_norm)
    if found:
        return found
    if db is not None:
        row = _buscar_sub_rh_por_nome_ou_codigo(db, str(raw).strip())
        if row:
            return row.codigo
    return None


def _codigos_sub_rh_validos(db: Optional["Session"]) -> set[str]:
    codes = set(SUBCATEGORIAS_RH.keys())
    if db is None:
        return codes
    from app.models import SubcategoriaRhCadastrada

    for r in db.query(SubcategoriaRhCadastrada).all():
        if r.codigo:
            codes.add(r.codigo)
    return codes


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
        validos = _codigos_sub_rh_validos(db)
        resolvida = resolver_import_subcategoria(subcategoria, db) if subcategoria else None
        if resolvida and resolvida in validos:
            return cat, resolvida
        if sub and sub in validos:
            return cat, sub
        raise ValueError(
            "Recursos Humanos exige uma subcategoria válida "
            "(ex.: salário, bônus, comissão, retirada sócios ou benefícios)"
        )

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
    if ch in " -/&":
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


def _buscar_sub_rh(db: "Session", codigo: str):
    from app.models import SubcategoriaRhCadastrada

    if not codigo:
        return None
    return (
        db.query(SubcategoriaRhCadastrada)
        .filter(SubcategoriaRhCadastrada.codigo == codigo)
        .first()
    )


def _buscar_sub_rh_por_nome_ou_codigo(db: "Session", bruto: str):
    from sqlalchemy import func
    from app.models import SubcategoriaRhCadastrada

    nome = (bruto or "").strip()
    if not nome:
        return None
    por_codigo = _buscar_sub_rh(db, normalizar_codigo(nome))
    if por_codigo:
        return por_codigo
    return (
        db.query(SubcategoriaRhCadastrada)
        .filter(func.lower(SubcategoriaRhCadastrada.nome) == nome.casefold())
        .first()
    )


def _labels_ocupados(db: "Session", *, excluir_cat_id: Optional[int] = None, excluir_sub_id: Optional[int] = None) -> set[str]:
    from app.models import CategoriaPagarCadastrada, SubcategoriaRhCadastrada

    labels = {v.casefold() for v in CATEGORIAS.values()}
    for r in db.query(CategoriaPagarCadastrada).all():
        if excluir_cat_id is not None and r.id == excluir_cat_id:
            continue
        labels.add(r.nome.casefold())
    sub_rows = db.query(SubcategoriaRhCadastrada).all()
    if sub_rows:
        for r in sub_rows:
            if excluir_sub_id is not None and r.id == excluir_sub_id:
                continue
            labels.add(r.nome.casefold())
    else:
        for nome in SUBCATEGORIAS_RH.values():
            labels.add(nome.casefold())
    return labels


def listar_catalogo(db: "Session") -> dict:
    from sqlalchemy import func
    from app.models import CategoriaPagarCadastrada, SubcategoriaRhCadastrada

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

    sub_rows = (
        db.query(SubcategoriaRhCadastrada)
        .order_by(SubcategoriaRhCadastrada.sistema.desc(), func.lower(SubcategoriaRhCadastrada.nome))
        .all()
    )
    if sub_rows:
        subcategorias_rh = [
            {
                "id": r.id,
                "codigo": r.codigo,
                "nome": r.nome,
                "sistema": bool(r.sistema),
            }
            for r in sub_rows
            if r.codigo
        ]
    else:
        subcategorias_rh = [
            {"id": None, "codigo": codigo, "nome": nome, "sistema": True}
            for codigo, nome in SUBCATEGORIAS_RH.items()
        ]
    return {
        "oficiais": oficiais,
        "cadastradas": cadastradas,
        "subcategorias_rh": subcategorias_rh,
    }


def validar_nome_nova(
    nome_bruto: Optional[str],
    db: "Session",
    *,
    excluir_cat_id: Optional[int] = None,
    excluir_sub_id: Optional[int] = None,
) -> str:
    nome = (nome_bruto or "").strip()
    if not nome:
        raise ValueError("Nome é obrigatório")
    if len(nome) > 20:
        raise ValueError("Nome deve ter no máximo 20 caracteres")
    if any(not _char_nome_ok(ch) for ch in nome):
        raise ValueError("Use apenas letras, números, espaços, hífen, barra e &")

    chave = nome.casefold()
    if chave in _labels_ocupados(db, excluir_cat_id=excluir_cat_id, excluir_sub_id=excluir_sub_id):
        raise ValueError("Já existe uma categoria ou subcategoria com este nome")

    if excluir_cat_id is None and excluir_sub_id is None:
        codigo_tentativa = normalizar_codigo(nome)
        reservados = set(CATEGORIAS.keys()) | set(SUBCATEGORIAS_RH.keys())
        if codigo_tentativa in reservados:
            raise ValueError("Este nome conflita com uma categoria ou subcategoria existente")

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


def atualizar_cadastrada(db: "Session", cat_id: int, nome_bruto: str):
    from app.models import CategoriaPagarCadastrada

    row = db.query(CategoriaPagarCadastrada).filter(CategoriaPagarCadastrada.id == cat_id).first()
    if not row:
        raise LookupError("Categoria não encontrada")
    nome = validar_nome_nova(nome_bruto, db, excluir_cat_id=cat_id)
    # validar_nome_nova rejeita codigo reservado mesmo em rename de cadastrada com nome livre
    # Revalidar só unicidade sem o check de codigo reservado se nome normalizado colidir
    row.nome = nome
    db.flush()
    return row


def excluir_cadastrada(db: "Session", cat_id: int):
    from app.models import CategoriaPagarCadastrada, ContaPagar

    row = db.query(CategoriaPagarCadastrada).filter(CategoriaPagarCadastrada.id == cat_id).first()
    if not row:
        raise LookupError("Categoria não encontrada")
    codigo = row.codigo or f"cat_{row.id}"
    vinculados = (
        db.query(ContaPagar)
        .filter(
            ContaPagar.categoria == codigo,
            ContaPagar.categoria_pendente == False,  # noqa: E712
        )
        .count()
    )
    if vinculados > 0:
        raise ValueError("Há contas usando esta categoria")
    db.delete(row)
    db.flush()


def criar_subcategoria_rh(db: "Session", nome_bruto: str, criado_por: Optional[str] = None):
    from app.models import SubcategoriaRhCadastrada

    nome = validar_nome_nova(nome_bruto, db)
    row = SubcategoriaRhCadastrada(nome=nome, codigo=None, sistema=False, criado_por=criado_por)
    db.add(row)
    db.flush()
    row.codigo = f"sub_{row.id}"
    db.flush()
    return row


def atualizar_subcategoria_rh(db: "Session", sub_id: int, nome_bruto: str):
    from app.models import SubcategoriaRhCadastrada

    row = db.query(SubcategoriaRhCadastrada).filter(SubcategoriaRhCadastrada.id == sub_id).first()
    if not row:
        raise LookupError("Subcategoria não encontrada")
    nome = (nome_bruto or "").strip()
    if not nome:
        raise ValueError("Nome é obrigatório")
    if len(nome) > 20:
        raise ValueError("Nome deve ter no máximo 20 caracteres")
    if any(not _char_nome_ok(ch) for ch in nome):
        raise ValueError("Use apenas letras, números, espaços, hífen, barra e &")
    chave = nome.casefold()
    if chave in _labels_ocupados(db, excluir_sub_id=sub_id):
        raise ValueError("Já existe uma categoria ou subcategoria com este nome")
    row.nome = nome
    db.flush()
    return row


def excluir_subcategoria_rh(db: "Session", sub_id: int):
    from app.models import ContaPagar, SubcategoriaRhCadastrada

    row = db.query(SubcategoriaRhCadastrada).filter(SubcategoriaRhCadastrada.id == sub_id).first()
    if not row:
        raise LookupError("Subcategoria não encontrada")
    if row.sistema:
        raise ValueError("Subcategoria padrão não pode ser excluída")
    codigo = row.codigo
    vinculados = (
        db.query(ContaPagar)
        .filter(
            ContaPagar.categoria == CATEGORIA_RH,
            ContaPagar.subcategoria == codigo,
        )
        .count()
    )
    if vinculados > 0:
        raise ValueError("Há contas usando esta subcategoria")
    db.delete(row)
    db.flush()


def seed_subcategorias_rh(db: "Session") -> None:
    """Garante as 5 subcategorias padrão no banco."""
    from app.models import SubcategoriaRhCadastrada

    existentes = {r.codigo: r for r in db.query(SubcategoriaRhCadastrada).all() if r.codigo}
    for codigo, nome in SUBCATEGORIAS_RH.items():
        if codigo in existentes:
            row = existentes[codigo]
            if row.sistema and codigo == SUB_BONUS and row.nome in NOMES_FABRICA_ANTIGOS_BONUS:
                row.nome = nome
            continue
        db.add(
            SubcategoriaRhCadastrada(
                codigo=codigo,
                nome=nome,
                sistema=True,
                criado_por=None,
            )
        )
    db.flush()
