"""Vagas do Consultant Panel publicadas no site e candidaturas recebidas (feature 102)."""
from __future__ import annotations

import re
import unicodedata
from decimal import Decimal, InvalidOperation
from typing import Optional

from fastapi import HTTPException, status

from app.models import Candidatura, Vaga
from app.schemas import VagaIn

AREAS = {
    "financas": "Finanças",
    "tecnologia": "Tecnologia",
    "comercial": "Comercial",
    "rh": "Recursos Humanos",
    "operacoes": "Operações",
}
NIVEIS = {"gerencia": "Gerência", "diretoria": "Diretoria", "vp": "VP", "c-level": "C-Level"}
INGLES = {
    "basico": "Básico",
    "intermediario": "Intermediário",
    "avancado": "Avançado",
    "fluente": "Fluente",
    "nativo": "Nativo",
}
DISPONIBILIDADE = {"imediata": "Imediata", "15-dias": "15 dias", "30-dias": "30 dias", "mais-30-dias": "Mais de 30 dias"}
MOBILIDADE = {"sim": "Sim", "nao": "Não", "a-combinar": "A combinar"}

STATUS_ABERTA = "aberta"
STATUS_ENCERRADA = "encerrada"

MSG_NAO_ENCONTRADA = "Vaga não encontrada"
MSG_INDISPONIVEL = "Vaga não disponível"
MSG_SEM_PERMISSAO = "Ação permitida apenas ao autor da vaga ou administradores"

CURRICULO_EXTENSOES = {".pdf", ".doc", ".docx"}
CURRICULO_MAX_BYTES = 5 * 1024 * 1024
PRETENSAO_MAXIMA = Decimal("10000000")

_CODIGO_PLANILHA = re.compile(r"^[A-Z0-9._-]{1,20}$")
_EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _texto(valor: Optional[str]) -> str:
    return (valor or "").strip()


def _opcional(valor: Optional[str]) -> Optional[str]:
    return _texto(valor) or None


def _recusar(mensagem) -> None:
    raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=mensagem)


def slug_titulo(titulo: str) -> str:
    sem_acento = unicodedata.normalize("NFKD", titulo).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", sem_acento.lower()).strip("-")
    return slug[:60].strip("-") or "vaga"


def validar_vaga(payload: VagaIn) -> dict:
    dados = {
        "titulo": _texto(payload.titulo),
        "area": _texto(payload.area),
        "nivel": _texto(payload.nivel),
        "localidade": _texto(payload.localidade),
        "resumo": _texto(payload.resumo),
        "descricao": _opcional(payload.descricao),
        "responsabilidades": _opcional(payload.responsabilidades),
        "requisitos": _texto(payload.requisitos),
        "diferenciais": _opcional(payload.diferenciais),
        "cliente": _opcional(payload.cliente),
        "codigo_planilha": (_opcional(payload.codigo_planilha) or "").upper() or None,
    }
    obrigatorios = {
        "titulo": "Informe o título da vaga",
        "localidade": "Informe a localidade",
        "resumo": "Informe o resumo",
        "requisitos": "Informe os pré-requisitos",
    }
    for campo, mensagem in obrigatorios.items():
        if not dados[campo]:
            _recusar(mensagem)
    if dados["area"] not in AREAS:
        _recusar("Área inválida")
    if dados["nivel"] not in NIVEIS:
        _recusar("Nível inválido")
    limites = {
        "titulo": (120, "Título"),
        "localidade": (120, "Localidade"),
        "resumo": (300, "Resumo"),
        "descricao": (5000, "Descrição"),
        "responsabilidades": (5000, "Responsabilidades"),
        "requisitos": (5000, "Pré-requisitos"),
        "diferenciais": (5000, "Diferenciais"),
        "cliente": (160, "Cliente"),
    }
    for campo, (maximo, rotulo) in limites.items():
        if dados[campo] and len(dados[campo]) > maximo:
            _recusar(f"{rotulo} deve ter no máximo {maximo} caracteres")
    if dados["codigo_planilha"] and not _CODIGO_PLANILHA.match(dados["codigo_planilha"]):
        _recusar("Código na planilha inválido (use letras, números, ponto, hífen ou sublinhado; até 20)")
    if not dados["codigo_planilha"] and not dados["cliente"]:
        _recusar("Informe o cliente ou o código da vaga na planilha")
    return dados


def pode_alterar(vaga: Vaga, user: dict) -> bool:
    return user["papel"] == "admin" or (vaga.criado_por_id is not None and vaga.criado_por_id == user["id"])


def exigir_alteracao(vaga: Vaga, user: dict) -> None:
    if not pode_alterar(vaga, user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=MSG_SEM_PERMISSAO)


def _iso(valor) -> Optional[str]:
    # Gravado em UTC sem fuso; o "Z" faz o navegador converter para o horário local
    return valor.replace(microsecond=0).isoformat() + "Z" if valor else None


def serializar_publica(v: Vaga) -> dict:
    return {
        "id": v.id,
        "slug": slug_titulo(v.titulo),
        "titulo": v.titulo,
        "area": v.area,
        "nivel": v.nivel,
        "localidade": v.localidade,
        "resumo": v.resumo,
        "descricao": v.descricao,
        "responsabilidades": v.responsabilidades,
        "requisitos": v.requisitos,
        "diferenciais": v.diferenciais,
        "criado_em": _iso(v.criado_em),
    }


def serializar_painel(v: Vaga, user: dict, total: int = 0, pendentes: int = 0) -> dict:
    return {
        **serializar_publica(v),
        "cliente": v.cliente,
        "codigo_planilha": v.codigo_planilha,
        "status": v.status,
        "criado_por_usuario": v.criado_por_usuario,
        "atualizado_por_usuario": v.atualizado_por_usuario,
        "atualizado_em": _iso(v.atualizado_em),
        "encerrada_em": _iso(v.encerrada_em),
        "candidaturas_total": total,
        "candidaturas_pendentes": pendentes,
        "pode_editar": pode_alterar(v, user),
    }


def serializar_candidatura(c: Candidatura) -> dict:
    return {
        "id": c.id,
        "nome": c.nome,
        "email": c.email,
        "telefone": c.telefone,
        "linkedin": c.linkedin,
        "localidade": c.localidade,
        "cargo_atual": c.cargo_atual,
        "empresa_atual": c.empresa_atual,
        "formacao": c.formacao,
        "experiencia": c.experiencia,
        "ingles": c.ingles,
        "outros_idiomas": c.outros_idiomas,
        "pretensao_min": str(c.pretensao_min),
        "pretensao_max": str(c.pretensao_max),
        "disponibilidade": c.disponibilidade,
        "mobilidade": c.mobilidade,
        "curriculo_nome": c.curriculo_nome,
        "criada_em": _iso(c.criada_em),
        "planilha_status": "enviada" if c.planilha_enviada_em else "pendente",
        "planilha_enviada_em": _iso(c.planilha_enviada_em),
        "planilha_erro": c.planilha_erro,
    }


def _valor_monetario(texto: str) -> Optional[Decimal]:
    """Aceita formatos pt e en ("15.000,50", "15,000.50", "R$ 15.000"): o último separador só é decimal
    quando seguido de 1 ou 2 dígitos; os demais separam milhares."""
    limpo = re.sub(r"[^\d.,]", "", texto or "")
    decimal = re.search(r"[.,](\d{1,2})$", limpo)
    inteiro = re.sub(r"[.,]", "", limpo[: decimal.start()] if decimal else limpo)
    if not inteiro:
        return None
    try:
        return Decimal(f"{inteiro}.{decimal.group(1)}" if decimal else inteiro).quantize(Decimal("0.01"))
    except InvalidOperation:
        return None


def validar_candidatura(campos: dict, erros_extra: Optional[dict] = None) -> dict:
    """Valida os campos do formulário; erros vão em 422 como {campo: mensagem}."""
    d = {chave: _texto(campos.get(chave)) for chave in campos}
    erros: dict[str, str] = dict(erros_extra or {})

    def exigir(campo: str, minimo: int, maximo: int, mensagem: str) -> None:
        if not (minimo <= len(d.get(campo, "")) <= maximo):
            erros[campo] = mensagem

    exigir("nome", 2, 120, "Informe seu nome")
    if not _EMAIL.match(d.get("email", "")) or len(d.get("email", "")) > 180:
        erros["email"] = "E-mail inválido"
    digitos = re.sub(r"\D", "", d.get("telefone", ""))
    if not (10 <= len(digitos) <= 13) or len(d.get("telefone", "")) > 30:
        erros["telefone"] = "Telefone inválido"
    exigir("localidade", 2, 120, "Informe sua localidade")
    exigir("cargo_atual", 2, 120, "Informe seu cargo atual")
    exigir("empresa_atual", 2, 120, "Informe sua empresa atual")

    linkedin = d.get("linkedin", "")
    if linkedin and (not re.match(r"^https?://\S+\.\S+", linkedin) or len(linkedin) > 200):
        erros["linkedin"] = "URL inválida"
    for campo, maximo in (("formacao", 300), ("experiencia", 2000), ("outros_idiomas", 200)):
        if len(d.get(campo, "")) > maximo:
            erros[campo] = f"Máximo de {maximo} caracteres"
    for campo, opcoes in (("ingles", INGLES), ("disponibilidade", DISPONIBILIDADE), ("mobilidade", MOBILIDADE)):
        if d.get(campo) and d[campo] not in opcoes:
            erros[campo] = "Opção inválida"

    minimo = _valor_monetario(d.get("pretensao_min", ""))
    maximo = _valor_monetario(d.get("pretensao_max", ""))
    if minimo is None or minimo <= 0 or minimo > PRETENSAO_MAXIMA:
        erros["pretensao_min"] = "Informe a pretensão mínima"
    if maximo is None or maximo <= 0 or maximo > PRETENSAO_MAXIMA:
        erros["pretensao_max"] = "Informe a pretensão salarial"
    elif minimo is not None and maximo < minimo:
        erros["pretensao_max"] = "A pretensão salarial deve ser maior ou igual à mínima"

    if d.get("consentimento", "").lower() not in ("true", "1", "on", "sim"):
        erros["consentimento"] = "É necessário aceitar o uso dos dados"

    if erros:
        _recusar(erros)

    return {
        "nome": d["nome"],
        "email": d["email"].lower(),
        "telefone": d["telefone"],
        "linkedin": linkedin or None,
        "localidade": d["localidade"],
        "cargo_atual": d["cargo_atual"],
        "empresa_atual": d["empresa_atual"],
        "formacao": d.get("formacao") or None,
        "experiencia": d.get("experiencia") or None,
        "ingles": d.get("ingles") or None,
        "outros_idiomas": d.get("outros_idiomas") or None,
        "pretensao_min": minimo,
        "pretensao_max": maximo,
        "disponibilidade": d.get("disponibilidade") or None,
        "mobilidade": d.get("mobilidade") or None,
    }
