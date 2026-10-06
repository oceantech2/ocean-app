"""Modelos de proposta por divisão (features 080 a 083): registro, setores, investimentos e validação."""
import re
from datetime import date, timedelta
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from typing import Optional

from fastapi import HTTPException

from app.services.documento import validar_email
from app.services.escopo_projeto import normalizar_escopo

# Mantido em sincronia com frontend/src/proposal/modelos/index.ts
MODELOS = {
    "executive-search": {"nome": "Executive Search", "versao_atual": 3, "disponivel": True},
    "outplacement-development": {"nome": "Development & Outplacement", "versao_atual": 1, "disponivel": True},
}
MODELO_SIMPLES = "simples"
NOME_SIMPLES = "Proposta simples"

SETORES = {
    "oil-gas": "Petróleo & Gás",
    "energia": "Energia",
    "infraestrutura": "Infraestrutura",
    "mineracao": "Mineração",
    "industria-servicos": "Indústria & Serviços",
}

# Ordem de exibição dos quadros de investimento
TIPOS_INVESTIMENTO = {
    "retainer": "Retainer",
    "sucesso": "Sucesso",
    "valor-fechado": "Valor fechado",
}
TAXA_TIPOS = ("percentual", "valor")

MOEDAS = ("BRL", "USD")
MOEDA_PADRAO = "BRL"

IDIOMAS = ("pt-BR", "en-US")
IDIOMA_PADRAO = "pt-BR"

# Mantido em sincronia com frontend/src/proposal/modelos/formatoProposta.ts
TEXTOS_PADRAO_GARANTIAS = {
    "pt-BR": {"shortlist": "3 a 5 candidatos", "sla": "5 a 10 dias úteis"},
    "en-US": {"shortlist": "3 to 5 candidates", "sla": "5 to 10 business days"},
}

CENTAVO = Decimal("0.01")
VALOR_MAXIMO = Decimal("1000000000000")
MAX_PROJETOS = 10
VALIDADE_DIAS_MAX = 365


def modelo_disponivel(modelo: Optional[str]) -> bool:
    return bool(modelo) and MODELOS.get(modelo, {}).get("disponivel", False)


def nome_modelo(modelo: Optional[str]) -> str:
    if not modelo or modelo == MODELO_SIMPLES:
        return NOME_SIMPLES
    return MODELOS.get(modelo, {}).get("nome", modelo)


def digitos_telefone(telefone: Optional[str]) -> str:
    return re.sub(r"\D", "", telefone or "")


def telefone_valido(telefone: Optional[str]) -> bool:
    return 10 <= len(digitos_telefone(telefone)) <= 13


def telefone_whatsapp(telefone: Optional[str]) -> str:
    """Dígitos para tel:/wa.me; sem "+" e com 10 ou 11 dígitos assume Brasil (+55)."""
    digitos = digitos_telefone(telefone)
    if (telefone or "").strip().startswith("+"):
        return digitos
    return "55" + digitos if len(digitos) in (10, 11) else digitos


def _erro(detail: str) -> HTTPException:
    return HTTPException(status_code=422, detail=detail)


def _texto(valor: Optional[str], vazio: str, longo: str) -> str:
    texto = (valor or "").strip()
    if not texto:
        raise _erro(vazio)
    if len(texto) > 255:
        raise _erro(longo)
    return texto


def _texto_opcional(valor: Optional[str], longo: str) -> Optional[str]:
    texto = (valor or "").strip()
    if len(texto) > 255:
        raise _erro(longo)
    return texto or None


def _taxa(valor, taxa_tipo: str, rotulo: str, sufixo: str) -> Decimal:
    try:
        taxa = None if valor is None or valor == "" else Decimal(str(valor))
    except (InvalidOperation, ValueError):
        taxa = None
    if taxa_tipo == "percentual":
        if taxa is None or taxa <= 0 or taxa >= 100:
            raise _erro(f"Taxa do {rotulo} deve ser maior que 0 e menor que 100%{sufixo}")
    elif taxa is None or taxa <= 0 or taxa >= VALOR_MAXIMO:
        raise _erro(f"Taxa do {rotulo} deve ser maior que zero{sufixo}")
    return taxa.quantize(CENTAVO, rounding=ROUND_HALF_UP)


def _entrada(valor, rotulo: str, sufixo: str) -> Optional[int]:
    if valor is None or valor == "":
        return None
    if not isinstance(valor, int) or isinstance(valor, bool) or valor < 0 or valor > 99:
        raise _erro(f"Entrada do {rotulo} deve estar entre 0 e 99%{sufixo}")
    return valor or None


def validar_moeda(valor: Optional[str]) -> str:
    moeda = (valor or "").strip().upper()
    if not moeda:
        return MOEDA_PADRAO
    if moeda not in MOEDAS:
        raise _erro("Moeda inválida")
    return moeda


def validar_idioma(valor: Optional[str]) -> str:
    idioma = (valor or "").strip()
    if not idioma:
        return IDIOMA_PADRAO
    if idioma not in IDIOMAS:
        raise _erro("Idioma inválido")
    return idioma


def texto_garantia_meses(meses: int, idioma: str) -> str:
    if idioma == "en-US":
        return "1 month" if meses == 1 else f"{meses} months"
    return "1 mês" if meses == 1 else f"{meses} meses"


def validar_investimentos(itens, sufixo: str = "") -> list[dict]:
    itens = list(itens or [])
    if not 1 <= len(itens) <= 3:
        raise _erro(f"Selecione de 1 a 3 modelos de investimento{sufixo}")
    por_tipo: dict[str, dict] = {}
    for item in itens:
        tipo = (item.tipo or "").strip()
        if tipo not in TIPOS_INVESTIMENTO or tipo in por_tipo:
            raise _erro(f"Tipo de investimento inválido ou repetido{sufixo}")
        rotulo = TIPOS_INVESTIMENTO[tipo]
        taxa_tipo = (item.taxa_tipo or "").strip()
        if taxa_tipo not in TAXA_TIPOS:
            raise _erro(f"Informe se a taxa do {rotulo} é em % ou em valor{sufixo}")
        por_tipo[tipo] = {
            "tipo": tipo,
            "taxa_tipo": taxa_tipo,
            "taxa": f"{_taxa(item.taxa, taxa_tipo, rotulo, sufixo):.2f}",
            "entrada": _entrada(item.entrada, rotulo, sufixo),
        }
    return [por_tipo[t] for t in TIPOS_INVESTIMENTO if t in por_tipo]


def validar_projetos(itens) -> list[dict]:
    itens = list(itens or [])
    if not 1 <= len(itens) <= MAX_PROJETOS:
        raise _erro(f"Inclua de 1 a {MAX_PROJETOS} projetos")
    projetos = []
    for n, item in enumerate(itens, start=1):
        nome = _texto(item.nome, f"Informe o nome do projeto {n}", f"Nome do projeto {n} muito longo")
        investimentos = validar_investimentos(item.investimentos, f" no projeto {n}")
        projetos.append({"nome": nome, "investimentos": investimentos})
    return projetos


def validar_contato(nome, cargo, telefone, email, obrigatorio: bool) -> dict:
    """Valida os dados do consultor; no perfil (obrigatorio=False) campos vazios viram None."""
    dados = {
        "nome": (nome or "").strip() or None,
        "cargo": (cargo or "").strip() or None,
        "telefone": (telefone or "").strip() or None,
        "email": (email or "").strip().lower() or None,
    }
    if obrigatorio:
        if not dados["nome"]:
            raise _erro("Informe o nome do consultor")
        if not dados["cargo"]:
            raise _erro("Informe o cargo do consultor")
    if dados["nome"] and len(dados["nome"]) > 255:
        raise _erro("Nome do consultor muito longo" if obrigatorio else "Nome muito longo")
    if dados["cargo"] and len(dados["cargo"]) > 255:
        raise _erro("Cargo do consultor muito longo" if obrigatorio else "Cargo muito longo")
    if (obrigatorio or dados["telefone"]) and not telefone_valido(dados["telefone"]):
        raise _erro("Telefone do consultor inválido" if obrigatorio else "Telefone inválido")
    if dados["telefone"] and len(dados["telefone"]) > 30:
        raise _erro("Telefone do consultor inválido" if obrigatorio else "Telefone inválido")
    if (obrigatorio or dados["email"]) and (
        not dados["email"] or len(dados["email"]) > 255 or not validar_email(dados["email"])
    ):
        raise _erro("E-mail do consultor inválido" if obrigatorio else "E-mail inválido")
    return dados


def validar_modelo(payload, modelo: str, data_se_vazia: date) -> dict:
    """Valida criação/edição de proposta por modelo (formato novo) e devolve as colunas normalizadas."""
    from app.services.propostas import hoje_sp

    cliente_nome = _texto(payload.cliente_nome, "Informe a empresa", "Nome da empresa muito longo")

    setor = (payload.setor or "").strip()
    if setor not in SETORES:
        raise _erro("Selecione o setor")

    consultor = validar_contato(
        payload.consultor_nome, payload.consultor_cargo,
        payload.consultor_telefone, payload.consultor_email, obrigatorio=True,
    )
    projeto_escopo = normalizar_escopo(getattr(payload, "projeto_escopo", None))
    projetos = validar_projetos(payload.projetos)

    shortlist = _texto_opcional(payload.shortlist, "Shortlist muito longo")
    sla = _texto_opcional(payload.sla, "SLA muito longo")
    garantia = _texto_opcional(payload.garantia, "Garantia muito longa")

    dias = payload.validade_dias
    if not isinstance(dias, int) or isinstance(dias, bool) or not 1 <= dias <= VALIDADE_DIAS_MAX:
        raise _erro(f"Validade deve ser de 1 a {VALIDADE_DIAS_MAX} dias")
    data_proposta = payload.data_proposta or data_se_vazia
    if data_proposta is None:
        raise _erro("Informe a data da proposta")
    validade = data_proposta + timedelta(days=dias)
    if validade <= hoje_sp():
        raise _erro("A validade calculada já passou. Ajuste a data ou os dias.")

    return {
        "modelo": modelo,
        "modelo_versao": MODELOS[modelo]["versao_atual"],
        "cliente_nome": cliente_nome,
        "data_proposta": data_proposta,
        "setor": setor,
        "consultor_nome": consultor["nome"],
        "consultor_cargo": consultor["cargo"],
        "consultor_telefone": consultor["telefone"],
        "consultor_email": consultor["email"],
        "projeto_escopo": projeto_escopo,
        "projetos": projetos,
        "shortlist": shortlist,
        "sla": sla,
        "garantia_texto": garantia,
        "validade_dias": dias,
        "validade": validade,
        "projeto_nome": None,
        "garantia_meses": None,
        "investimentos": None,
        "cnpj": None,
        "valor": None,
        "total": None,
        "imposto_ativo": False,
        "aliquota": None,
        "valor_imposto": Decimal("0.00"),
    }


def converter_para_formato_novo(p, versao: int) -> None:
    """Leva uma proposta no formato antigo (projeto único, garantia em meses) ao formato novo, sem mudar a validade."""
    idioma = p.idioma or ("en-US" if p.moeda == "USD" else IDIOMA_PADRAO)
    padroes = TEXTOS_PADRAO_GARANTIAS[idioma]
    p.idioma = idioma
    p.projetos = [{"nome": p.projeto_nome, "investimentos": p.investimentos or []}]
    p.shortlist = padroes["shortlist"]
    p.sla = padroes["sla"]
    p.garantia_texto = texto_garantia_meses(p.garantia_meses, idioma) if p.garantia_meses else None
    p.validade_dias = max((p.validade - p.data_proposta).days, 0)
    p.projeto_nome = None
    p.garantia_meses = None
    p.investimentos = None
    p.modelo_versao = versao
