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
from app.services.proposta_modelos import (
    MODELO_SIMPLES,
    MOEDA_PADRAO,
    nome_modelo,
    telefone_whatsapp,
)

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


def validar_dados(payload, validade_se_vazia: date) -> dict:
    """Valida criação/edição e devolve os campos normalizados (422 com mensagem do contrato)."""
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

    validade = payload.validade or validade_se_vazia
    if validade <= hoje_sp():
        raise _erro("Validade deve ser posterior a hoje")

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


def eh_simples(p: Proposta) -> bool:
    return (p.modelo or MODELO_SIMPLES) == MODELO_SIMPLES


def formato_novo(p: Proposta) -> bool:
    """Propostas por modelo com lista de projetos (feature 083); as demais estão no formato antigo."""
    return not eh_simples(p) and p.projetos is not None


def _json_canonico(dados: dict) -> str:
    return json.dumps(dados, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def conteudo_canonico(p: Proposta) -> str:
    if formato_novo(p):
        return _json_canonico({
            "codigo": p.codigo,
            "emitida_em": p.emitida_em.replace(microsecond=0).isoformat(),
            "modelo": p.modelo,
            "modelo_versao": p.modelo_versao,
            "idioma": p.idioma,
            "moeda": p.moeda,
            "cliente_nome": p.cliente_nome,
            "data_proposta": _data(p.data_proposta),
            "setor": p.setor,
            "consultor": {
                "nome": p.consultor_nome,
                "cargo": p.consultor_cargo,
                "telefone": p.consultor_telefone,
                "email": p.consultor_email,
            },
            "projeto_escopo": p.projeto_escopo,
            "projetos": p.projetos,
            "shortlist": p.shortlist,
            "sla": p.sla,
            "garantia": p.garantia_texto,
            "validade_dias": p.validade_dias,
            "validade": p.validade.isoformat(),
        })
    # Formato antigo congelado: assinaturas das versões 1 e 2 do Executive Search dependem dele
    if not eh_simples(p):
        dados = {
            "codigo": p.codigo,
            "emitida_em": p.emitida_em.replace(microsecond=0).isoformat(),
            "modelo": p.modelo,
            "modelo_versao": p.modelo_versao,
            "cliente_nome": p.cliente_nome,
            "data_proposta": _data(p.data_proposta),
            "setor": p.setor,
            "consultor": {
                "nome": p.consultor_nome,
                "cargo": p.consultor_cargo,
                "telefone": p.consultor_telefone,
                "email": p.consultor_email,
            },
            "projeto_nome": p.projeto_nome,
            "garantia_meses": p.garantia_meses,
            "investimentos": p.investimentos,
            "validade": p.validade.isoformat(),
        }
        # Sem a chave = BRL: mantém válidos os hashes gravados antes da moeda existir
        if p.moeda and p.moeda != MOEDA_PADRAO:
            dados["moeda"] = p.moeda
        # Sem a chave quando vazio: mantém válidos os hashes gravados antes do escopo existir
        if p.projeto_escopo:
            dados["projeto_escopo"] = p.projeto_escopo
        return _json_canonico(dados)
    # Formato das propostas simples congelado: assinaturas antigas dependem dele
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
    return _json_canonico(dados)


def calcular_hash(p: Proposta) -> str:
    return hashlib.sha256(conteudo_canonico(p).encode("utf-8")).hexdigest()


CAMPOS_EDITAVEIS = (
    "cliente_nome", "cnpj", "valor", "imposto_ativo", "aliquota", "valor_imposto", "total", "validade",
)


CAMPOS_MODELO = (
    "cliente_nome", "data_proposta", "setor", "consultor_nome", "consultor_cargo",
    "consultor_telefone", "consultor_email", "projeto_escopo", "shortlist", "sla", "garantia_texto",
    "validade_dias", "validade",
)


def _canonico(campo: str, valor):
    if valor is None:
        return None
    if campo in ("valor", "aliquota", "valor_imposto", "total"):
        return _dec_str(valor)
    if campo in ("validade", "data_proposta"):
        return valor.isoformat()
    if campo in ("garantia_meses", "validade_dias"):
        return int(valor)
    if campo == "imposto_ativo":
        return bool(valor)
    return valor


def diff_campos(p: Proposta, dados: dict) -> list[dict]:
    """Campos alterados entre a proposta atual e os dados validados, na forma canônica do hash."""
    if not eh_simples(p):
        return _diff_modelo(p, dados)
    alteracoes = []
    for campo in CAMPOS_EDITAVEIS:
        anterior = _canonico(campo, getattr(p, campo))
        novo = _canonico(campo, dados[campo])
        if campo == "aliquota":
            anterior = anterior if p.imposto_ativo else None
            novo = novo if dados["imposto_ativo"] else None
        if anterior != novo:
            alteracoes.append({"campo": campo, "anterior": anterior, "novo": novo})
    return alteracoes


def _diff_modelo(p: Proposta, dados: dict) -> list[dict]:
    alteracoes = []
    for campo in CAMPOS_MODELO:
        anterior = _canonico(campo, getattr(p, campo))
        novo = _canonico(campo, dados[campo])
        if anterior != novo:
            alteracoes.append({"campo": campo, "anterior": anterior, "novo": novo})
    # Projetos não têm identificador: a comparação é por posição (inclusão, remoção, renomeação e reordenação)
    atuais = list(p.projetos or [])
    novos = list(dados["projetos"] or [])
    for i in range(max(len(atuais), len(novos))):
        anterior = atuais[i] if i < len(atuais) else None
        novo = novos[i] if i < len(novos) else None
        if anterior != novo:
            alteracoes.append({"campo": f"projeto.{i + 1}", "anterior": anterior, "novo": novo})
    return alteracoes


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


def _data(d: Optional[date]) -> Optional[str]:
    return None if d is None else d.isoformat()


def serializar_item(p: Proposta) -> dict:
    projetos = p.projetos if formato_novo(p) else None
    return {
        "id": p.id,
        "codigo": p.codigo,
        "modelo": p.modelo,
        "modelo_nome": nome_modelo(p.modelo),
        "moeda": p.moeda,
        "idioma": p.idioma,
        "cliente_nome": p.cliente_nome,
        # Formato novo: nome do primeiro projeto
        "projeto_nome": projetos[0]["nome"] if projetos else p.projeto_nome,
        "projetos_total": len(projetos) if projetos else (0 if eh_simples(p) else 1),
        "data_proposta": _data(p.data_proposta),
        "cnpj": formatar_cnpj(p.cnpj) if p.cnpj else None,
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
        "modelo_versao": p.modelo_versao,
        "setor": p.setor,
        "consultor_nome": p.consultor_nome,
        "consultor_cargo": p.consultor_cargo,
        "consultor_telefone": p.consultor_telefone,
        "consultor_email": p.consultor_email,
        "projeto_escopo": p.projeto_escopo,
        "garantia_meses": p.garantia_meses,
        "investimentos": p.investimentos,
        "projetos": p.projetos if formato_novo(p) else None,
        "shortlist": p.shortlist,
        "sla": p.sla,
        "garantia": p.garantia_texto,
        "validade_dias": p.validade_dias,
        "valor": _dec_str(p.valor),
        "imposto_ativo": bool(p.imposto_ativo),
        "aliquota": _dec_str(p.aliquota) if p.imposto_ativo else None,
        "valor_imposto": _dec_str(p.valor_imposto),
        "visualizada_em": _iso(p.visualizada_em),
        "cancelada_em": _iso(p.cancelada_em),
        "versao": p.versao,
        "atualizada_em": _iso(p.atualizada_em),
        "versao_visualizada_em": _iso(p.versao_visualizada_em),
        "edicoes": [
            {
                "versao": e.versao,
                "editada_em": _iso(e.editada_em),
                "editado_por_usuario": e.editado_por_usuario,
                "alteracoes": e.alteracoes,
            }
            for e in sorted(p.edicoes, key=lambda e: e.versao, reverse=True)
        ],
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
    if status in ("cancelada", "expirada"):
        mensagem = MSG_CANCELADA_PUBLICA if status == "cancelada" else MSG_EXPIRADA_PUBLICA
        indisponivel = {"status": status, "pode_assinar": False, "mensagem": mensagem}
        if not eh_simples(p):
            indisponivel["moeda"] = p.moeda
            indisponivel["idioma"] = p.idioma
        return indisponivel
    assinatura = None
    if status == "assinada" and p.assinatura is not None:
        assinatura = {"nome": p.assinatura.nome, "assinada_em": _iso(p.assinatura.assinada_em)}
    if not eh_simples(p):
        return {
            "status": status,
            "pode_assinar": status in STATUS_PENDENTES,
            "modelo": p.modelo,
            "modelo_versao": p.modelo_versao,
            "moeda": p.moeda,
            "idioma": p.idioma,
            "cliente_nome": p.cliente_nome,
            "data_proposta": _data(p.data_proposta),
            "setor": p.setor,
            "consultor": {
                "nome": p.consultor_nome,
                "cargo": p.consultor_cargo,
                "telefone": p.consultor_telefone,
                "telefone_digitos": telefone_whatsapp(p.consultor_telefone),
                "email": p.consultor_email,
            },
            "projeto_nome": p.projeto_nome,
            "projeto_escopo": p.projeto_escopo,
            "garantia_meses": p.garantia_meses,
            "investimentos": p.investimentos,
            "projetos": p.projetos if formato_novo(p) else None,
            "shortlist": p.shortlist,
            "sla": p.sla,
            "garantia": p.garantia_texto,
            "validade": p.validade.isoformat(),
            "versao": p.versao,
            "atualizada_em": _iso(p.atualizada_em),
            "assinatura": assinatura,
        }
    dados = {
        "status": status,
        "modelo": MODELO_SIMPLES,
        "cliente_nome": p.cliente_nome,
        "cnpj": formatar_cnpj(p.cnpj),
        "valor": _dec_str(p.valor),
        "imposto_ativo": bool(p.imposto_ativo),
        "aliquota": _dec_str(p.aliquota) if p.imposto_ativo else None,
        "valor_imposto": _dec_str(p.valor_imposto) if p.imposto_ativo else None,
        "total": _dec_str(p.total),
        "emitida_em": _iso(p.emitida_em),
        "validade": p.validade.isoformat(),
        "versao": p.versao,
        "atualizada_em": _iso(p.atualizada_em),
        "pode_assinar": status in STATUS_PENDENTES,
    }
    if assinatura is not None:
        dados["assinatura"] = assinatura
    return dados
