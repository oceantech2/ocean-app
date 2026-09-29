"""Regras do Proposal: cálculo, validade, status efetivo, hash do conteúdo e serialização."""
import hashlib
import json
import secrets
from datetime import date, datetime, timedelta
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from typing import Optional
from zoneinfo import ZoneInfo

from fastapi import HTTPException, Request

from app.models import Proposta
from app.services.documento import formatar_cnpj, normalizar_cnpj, validar_cnpj, validar_email

TZ_SP = ZoneInfo("America/Sao_Paulo")
DIAS_VALIDADE_PADRAO = 30
CENTAVO = Decimal("0.01")

STATUS_PENDENTES = ("aguardando", "visualizada")
STATUS_FILTRO = ("aguardando", "visualizada", "assinada", "cancelada", "expirada")

MSG_NAO_ENCONTRADA = "Proposta não encontrada"
MSG_CANCELADA_PUBLICA = "Esta proposta não está mais disponível."
MSG_EXPIRADA_PUBLICA = "Esta proposta expirou. Entre em contato com a Ocean para receber uma nova."


def hoje_sp() -> date:
    return datetime.now(TZ_SP).date()


def validade_padrao() -> date:
    return hoje_sp() + timedelta(days=DIAS_VALIDADE_PADRAO)


def _erro(detail: str) -> HTTPException:
    return HTTPException(status_code=422, detail=detail)


def _decimal(valor) -> Optional[Decimal]:
    if valor is None or valor == "":
        return None
    try:
        return Decimal(str(valor))
    except (InvalidOperation, ValueError):
        return None


def calcular_valores(valor: Decimal, imposto_ativo: bool, aliquota: Optional[Decimal]) -> tuple[Decimal, Decimal]:
    """Retorna (valor_imposto, total), arredondando o imposto em centavos (half-up)."""
    valor = valor.quantize(CENTAVO, rounding=ROUND_HALF_UP)
    if not imposto_ativo or aliquota is None:
        return Decimal("0.00"), valor
    imposto = (valor * aliquota / Decimal(100)).quantize(CENTAVO, rounding=ROUND_HALF_UP)
    return imposto, valor + imposto


def validar_criacao(payload) -> dict:
    """Valida o pedido de criação e devolve os campos normalizados (422 com mensagem do contrato)."""
    cliente_nome = (payload.cliente_nome or "").strip()
    if not cliente_nome:
        raise _erro("Informe o nome do cliente")
    if len(cliente_nome) > 255:
        raise _erro("Nome do cliente muito longo")

    cnpj = normalizar_cnpj(payload.cnpj)
    if not validar_cnpj(cnpj):
        raise _erro("CNPJ inválido")

    valor = _decimal(payload.valor)
    if valor is None or valor <= 0:
        raise _erro("Valor deve ser maior que zero")
    valor = valor.quantize(CENTAVO, rounding=ROUND_HALF_UP)
    if valor >= Decimal("1000000000000"):
        raise _erro("Valor muito alto")

    imposto_ativo = bool(payload.imposto_ativo)
    aliquota = None
    if imposto_ativo:
        aliquota = _decimal(payload.aliquota)
        if aliquota is None:
            raise _erro("Alíquota deve ser maior que 0 e menor que 100")
        aliquota = aliquota.quantize(CENTAVO, rounding=ROUND_HALF_UP)
        if aliquota <= 0 or aliquota >= 100:
            raise _erro("Alíquota deve ser maior que 0 e menor que 100")

    validade = payload.validade or validade_padrao()
    if validade <= hoje_sp():
        raise _erro("Validade deve ser posterior à data de emissão")

    valor_imposto, total = calcular_valores(valor, imposto_ativo, aliquota)
    return {
        "cliente_nome": cliente_nome,
        "cnpj": cnpj,
        "valor": valor,
        "imposto_ativo": imposto_ativo,
        "aliquota": aliquota,
        "valor_imposto": valor_imposto,
        "total": total,
        "validade": validade,
    }


def gerar_codigo() -> str:
    return secrets.token_urlsafe(24)


def _dec_str(valor: Optional[Decimal]) -> Optional[str]:
    return None if valor is None else f"{Decimal(valor):.2f}"


def conteudo_canonico(p: Proposta) -> str:
    dados = {
        "aliquota": _dec_str(p.aliquota) if p.imposto_ativo else None,
        "cliente_nome": p.cliente_nome,
        "cnpj": p.cnpj,
        "codigo": p.codigo,
        "emitida_em": p.emitida_em.replace(microsecond=0).isoformat(),
        "imposto_ativo": bool(p.imposto_ativo),
        "total": _dec_str(p.total),
        "validade": p.validade.isoformat(),
        "valor": _dec_str(p.valor),
        "valor_imposto": _dec_str(p.valor_imposto),
    }
    return json.dumps(dados, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def calcular_hash(p: Proposta) -> str:
    return hashlib.sha256(conteudo_canonico(p).encode("utf-8")).hexdigest()


def status_efetivo(p: Proposta) -> str:
    """'expirada' é derivado: pendente e já passou das 23:59:59 (São Paulo) do dia da validade."""
    if p.status in STATUS_PENDENTES and hoje_sp() > p.validade:
        return "expirada"
    return p.status


def pode_ver(p: Proposta, user: dict) -> bool:
    return user["papel"] == "admin" or p.criado_por_id == user["id"]


def validar_assinatura(payload) -> dict:
    nome = (payload.nome or "").strip()
    if len(nome) < 3:
        raise _erro("Informe o nome completo")
    if len(nome) > 255:
        raise _erro("Nome muito longo")
    email = (payload.email or "").strip().lower()
    if not email or len(email) > 255 or not validar_email(email):
        raise _erro("E-mail inválido")
    if payload.aceite is not True:
        raise _erro("É necessário aceitar os termos da proposta")
    return {"nome": nome, "email": email}


def ip_origem(request: Request) -> str:
    encaminhado = request.headers.get("x-forwarded-for", "")
    if encaminhado:
        primeiro = encaminhado.split(",")[0].strip()
        if primeiro:
            return primeiro[:64]
    return (request.client.host if request.client else "desconhecido")[:64]


def _iso(dt: Optional[datetime]) -> Optional[str]:
    return None if dt is None else dt.replace(microsecond=0).isoformat() + "Z"


def serializar_item(p: Proposta) -> dict:
    return {
        "id": p.id,
        "codigo": p.codigo,
        "cliente_nome": p.cliente_nome,
        "cnpj": formatar_cnpj(p.cnpj),
        "total": _dec_str(p.total),
        "emitida_em": _iso(p.emitida_em),
        "validade": p.validade.isoformat(),
        "status": status_efetivo(p),
        "criado_por_usuario": p.criado_por_usuario,
    }


def serializar_detalhe(p: Proposta) -> dict:
    a = p.assinatura
    return {
        **serializar_item(p),
        "valor": _dec_str(p.valor),
        "imposto_ativo": bool(p.imposto_ativo),
        "aliquota": _dec_str(p.aliquota) if p.imposto_ativo else None,
        "valor_imposto": _dec_str(p.valor_imposto),
        "visualizada_em": _iso(p.visualizada_em),
        "cancelada_em": _iso(p.cancelada_em),
        "assinatura": None if a is None else {
            "nome": a.nome,
            "email": a.email,
            "assinada_em": _iso(a.assinada_em),
            "ip": a.ip,
            "user_agent": a.user_agent,
            "conteudo_hash": a.conteudo_hash,
        },
    }


def serializar_publica(p: Proposta) -> dict:
    """Só dados da própria proposta; cancelada/expirada não expõem valores nem identificação."""
    status = status_efetivo(p)
    if status == "cancelada":
        return {"status": status, "pode_assinar": False, "mensagem": MSG_CANCELADA_PUBLICA}
    if status == "expirada":
        return {"status": status, "pode_assinar": False, "mensagem": MSG_EXPIRADA_PUBLICA}
    dados = {
        "status": status,
        "cliente_nome": p.cliente_nome,
        "cnpj": formatar_cnpj(p.cnpj),
        "valor": _dec_str(p.valor),
        "imposto_ativo": bool(p.imposto_ativo),
        "aliquota": _dec_str(p.aliquota) if p.imposto_ativo else None,
        "valor_imposto": _dec_str(p.valor_imposto) if p.imposto_ativo else None,
        "total": _dec_str(p.total),
        "emitida_em": _iso(p.emitida_em),
        "validade": p.validade.isoformat(),
        "pode_assinar": status in STATUS_PENDENTES,
    }
    if status == "assinada" and p.assinatura is not None:
        dados["assinatura"] = {"nome": p.assinatura.nome, "assinada_em": _iso(p.assinatura.assinada_em)}
    return dados
