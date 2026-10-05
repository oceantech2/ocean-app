"""Modelos de proposta por divisão (feature 080): registro, setores, investimentos e validação."""
import re
from datetime import date
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from typing import Optional

from fastapi import HTTPException

from app.services.documento import validar_email

# Mantido em sincronia com frontend/src/proposal/modelos/index.ts
MODELOS = {
    "executive-search": {"nome": "Executive Search", "versao_atual": 1, "disponivel": True},
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

CENTAVO = Decimal("0.01")
VALOR_MAXIMO = Decimal("1000000000000")
GARANTIA_MAXIMA_MESES = 120


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


def _taxa(valor, taxa_tipo: str, rotulo: str) -> Decimal:
    try:
        taxa = None if valor is None or valor == "" else Decimal(str(valor))
    except (InvalidOperation, ValueError):
        taxa = None
    if taxa_tipo == "percentual":
        if taxa is None or taxa <= 0 or taxa >= 100:
            raise _erro(f"Taxa do {rotulo} deve ser maior que 0 e menor que 100%")
    elif taxa is None or taxa <= 0 or taxa >= VALOR_MAXIMO:
        raise _erro(f"Taxa do {rotulo} deve ser maior que zero")
    return taxa.quantize(CENTAVO, rounding=ROUND_HALF_UP)


def _entrada(valor, rotulo: str) -> Optional[int]:
    if valor is None or valor == "":
        return None
    if not isinstance(valor, int) or isinstance(valor, bool) or valor < 0 or valor > 99:
        raise _erro(f"Entrada do {rotulo} deve estar entre 0 e 99%")
    return valor or None


def validar_investimentos(itens) -> list[dict]:
    itens = list(itens or [])
    if not 1 <= len(itens) <= 3:
        raise _erro("Selecione de 1 a 3 modelos de investimento")
    por_tipo: dict[str, dict] = {}
    for item in itens:
        tipo = (item.tipo or "").strip()
        if tipo not in TIPOS_INVESTIMENTO or tipo in por_tipo:
            raise _erro("Tipo de investimento inválido ou repetido")
        rotulo = TIPOS_INVESTIMENTO[tipo]
        taxa_tipo = (item.taxa_tipo or "").strip()
        if taxa_tipo not in TAXA_TIPOS:
            raise _erro(f"Informe se a taxa do {rotulo} é em % ou em R$")
        por_tipo[tipo] = {
            "tipo": tipo,
            "taxa_tipo": taxa_tipo,
            "taxa": f"{_taxa(item.taxa, taxa_tipo, rotulo):.2f}",
            "entrada": _entrada(item.entrada, rotulo),
        }
    return [por_tipo[t] for t in TIPOS_INVESTIMENTO if t in por_tipo]


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


def validar_modelo(payload, modelo: str, validade_se_vazia: date, data_se_vazia: date) -> dict:
    """Valida criação/edição de proposta por modelo e devolve as colunas normalizadas."""
    from app.services.propostas import hoje_sp

    cliente_nome = _texto(payload.cliente_nome, "Informe a empresa", "Nome da empresa muito longo")

    setor = (payload.setor or "").strip()
    if setor not in SETORES:
        raise _erro("Selecione o setor")

    consultor = validar_contato(
        payload.consultor_nome, payload.consultor_cargo,
        payload.consultor_telefone, payload.consultor_email, obrigatorio=True,
    )
    projeto_nome = _texto(payload.projeto_nome, "Informe o nome do projeto", "Nome do projeto muito longo")

    garantia = payload.garantia_meses
    if not isinstance(garantia, int) or isinstance(garantia, bool) or not 1 <= garantia <= GARANTIA_MAXIMA_MESES:
        raise _erro("Garantia deve ser um número de meses maior que zero")

    investimentos = validar_investimentos(payload.investimentos)

    validade = payload.validade or validade_se_vazia
    if validade <= hoje_sp():
        raise _erro("Validade deve ser posterior a hoje")
    data_proposta = payload.data_proposta or data_se_vazia
    if data_proposta is None:
        raise _erro("Informe a data da proposta")
    if data_proposta > validade:
        raise _erro("Data da proposta não pode ser posterior à validade")

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
        "projeto_nome": projeto_nome,
        "garantia_meses": garantia,
        "investimentos": investimentos,
        "validade": validade,
        "cnpj": None,
        "valor": None,
        "total": None,
        "imposto_ativo": False,
        "aliquota": None,
        "valor_imposto": Decimal("0.00"),
    }
