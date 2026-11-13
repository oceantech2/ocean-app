"""Ferramentas do conector do Claude (feature 103).

Cada ferramenta chama a função da rota do Proposal correspondente com o usuário da conexão, então valem as
mesmas validações, permissões e mensagens do painel. Os parâmetros das rotas são passados todos explicitamente:
fora da injeção do FastAPI os padrões `Query(...)` não viram valores.
"""
import json
import logging
from dataclasses import dataclass
from datetime import date
from typing import Any, Callable, Optional

from fastapi import HTTPException, status
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.api.routes import proposal_modelos, proposal_propostas, proposal_vagas
from app.config import settings
from app.models import PerfilConsultor
from app.schemas import PropostaCreate, VagaIn
from app.services.audit import origem_auditoria, registrar_auditoria
from app.services.proposta_modelos import (
    IDIOMAS,
    MODELO_SIMPLES,
    MODELOS,
    MOEDAS,
    SETORES,
    TAXA_TIPOS,
    TIPOS_INVESTIMENTO,
    VALIDADE_DIAS_MAX,
)
from app.services.propostas import STATUS_FILTRO
from app.services.vagas import AREAS, NIVEIS, STATUS_ABERTA, STATUS_ENCERRADA

logger = logging.getLogger("ocean.mcp")

ORIGEM = "Claude"
PAGINA_PROPOSTAS = 50
MSG_SIMPLES = "Propostas simples só podem ser editadas pelo painel"
MSG_INESPERADO = "Erro inesperado ao executar a ação. Tente novamente ou use o painel."

CAMPOS_PROPOSTA = (
    "modelo", "cliente_nome", "setor", "idioma", "moeda", "data_proposta", "validade_dias", "projetos",
    "projeto_escopo", "shortlist", "sla", "garantia",
    "consultor_nome", "consultor_cargo", "consultor_telefone", "consultor_email",
)
CAMPOS_VAGA = (
    "titulo", "area", "nivel", "localidade", "resumo", "descricao", "responsabilidades", "requisitos",
    "diferenciais", "cliente", "codigo_planilha",
)


class ErroArgumento(Exception):
    pass


@dataclass(frozen=True)
class Ferramenta:
    nome: str
    titulo: str
    descricao: str
    schema: dict
    funcao: Callable[[Session, dict, dict], Any]
    somente_leitura: bool

    def descrever(self) -> dict:
        return {
            "name": self.nome,
            "title": self.titulo,
            "description": self.descricao,
            "inputSchema": self.schema,
            "annotations": {
                "title": self.titulo,
                "readOnlyHint": self.somente_leitura,
                "destructiveHint": False,
                "openWorldHint": False,
            },
        }


# ==================== Argumentos ====================
def _texto(args: dict, chave: str) -> Optional[str]:
    valor = args.get(chave)
    if valor is None or valor == "":
        return None
    if not isinstance(valor, str):
        raise ErroArgumento(f"'{chave}' deve ser texto")
    return valor


def _inteiro(args: dict, chave: str, obrigatorio: bool = False, minimo: Optional[int] = None) -> Optional[int]:
    valor = args.get(chave)
    if valor is None or valor == "":
        if obrigatorio:
            raise ErroArgumento(f"Informe '{chave}'")
        return None
    if isinstance(valor, str) and valor.strip().isdigit():
        valor = int(valor.strip())
    if isinstance(valor, bool) or not isinstance(valor, int):
        raise ErroArgumento(f"'{chave}' deve ser um número inteiro")
    if minimo is not None and valor < minimo:
        raise ErroArgumento(f"'{chave}' deve ser no mínimo {minimo}")
    return valor


def _data(args: dict, chave: str) -> Optional[date]:
    valor = _texto(args, chave)
    if valor is None:
        return None
    try:
        return date.fromisoformat(valor)
    except ValueError:
        raise ErroArgumento(f"'{chave}' deve estar no formato AAAA-MM-DD")


def _mensagem_validacao(e: ValidationError) -> str:
    erro = e.errors()[0]
    campo = ".".join(str(parte) for parte in erro.get("loc", ())) or "dados"
    return f"Valor inválido em '{campo}'"


def _mesclar(base: dict, args: dict, campos: tuple) -> dict:
    """Campos informados sobrepõem a base; None é descartado para os padrões dos schemas valerem."""
    dados = {**base, **{c: args[c] for c in campos if c in args}}
    return {c: v for c, v in dados.items() if v is not None}


# ==================== Links ====================
def _painel(caminho: str) -> str:
    return f"{settings.consultant_panel_url()}{caminho}"


def _com_links_proposta(p: dict) -> dict:
    return {
        **p,
        "link_painel": _painel(f"/propostas/{p['id']}"),
        "link_cliente": f"{settings.PROPOSAL_PUBLIC_URL.rstrip('/')}/p/{p['codigo']}",
    }


def _com_link_vaga(v: dict) -> dict:
    return {**v, "link_painel": _painel(f"/vagas/{v['id']}")}


# ==================== Propostas ====================
def _listar_propostas(db: Session, user: dict, args: dict) -> dict:
    r = proposal_propostas.listar_propostas(
        status_filtro=_texto(args, "status"),
        empresa=_texto(args, "empresa"),
        modelo=_texto(args, "modelo"),
        projeto=_texto(args, "projeto"),
        data_de=_data(args, "data_de"),
        data_ate=_data(args, "data_ate"),
        criado_por=_texto(args, "criado_por"),
        page=_inteiro(args, "pagina", minimo=1) or 1,
        page_size=PAGINA_PROPOSTAS,
        db=db,
        user=user,
    )
    return {
        "items": [_com_links_proposta(p) for p in r["items"]],
        "total": r["total"],
        "pagina": r["page"],
        "por_pagina": r["page_size"],
    }


def _ver_proposta(db: Session, user: dict, args: dict) -> dict:
    pid = _inteiro(args, "id", obrigatorio=True)
    return _com_links_proposta(proposal_propostas.obter_proposta(proposta_id=pid, db=db, user=user))


def _proposta_payload(dados: dict) -> PropostaCreate:
    try:
        return PropostaCreate(**dados)
    except ValidationError as e:
        raise ErroArgumento(_mensagem_validacao(e))


def _criar_proposta(db: Session, user: dict, args: dict) -> dict:
    perfil = db.get(PerfilConsultor, user["id"])
    base = {}
    if perfil is not None:
        base = {
            "consultor_nome": perfil.nome,
            "consultor_cargo": perfil.cargo,
            "consultor_telefone": perfil.telefone,
            "consultor_email": perfil.email,
        }
    payload = _proposta_payload(_mesclar(base, args, CAMPOS_PROPOSTA))
    p = proposal_propostas.criar_proposta(payload=payload, db=db, user=user)
    registrar_auditoria(db, user["usuario"], "criar", "Proposta", p["id"], f"{p['codigo']} — {p['cliente_nome']}")
    db.commit()
    return _com_links_proposta(p)


def _editar_proposta(db: Session, user: dict, args: dict) -> dict:
    pid = _inteiro(args, "id", obrigatorio=True)
    atual = proposal_propostas.obter_proposta(proposta_id=pid, db=db, user=user)
    if (atual.get("modelo") or MODELO_SIMPLES) == MODELO_SIMPLES:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=MSG_SIMPLES)
    base = {campo: atual.get(campo) for campo in CAMPOS_PROPOSTA}
    payload = _proposta_payload(_mesclar(base, args, CAMPOS_PROPOSTA))
    p = proposal_propostas.editar_proposta(proposta_id=pid, payload=payload, db=db, user=user)
    if p.get("alterada"):
        registrar_auditoria(
            db, user["usuario"], "editar", "Proposta", pid, f"{p['codigo']} — {p['cliente_nome']} (v{p['versao']})",
        )
        db.commit()
    return _com_links_proposta(p)


# ==================== Modelos ====================
def _listar_modelos(db: Session, user: dict, args: dict) -> dict:
    r = proposal_modelos.listar_modelos(
        divisao=_texto(args, "divisao"), nome=_texto(args, "nome"), page=1, page_size=200, db=db, _=user,
    )
    return {"items": r["items"], "total": r["total"]}


def _ver_modelo(db: Session, user: dict, args: dict) -> dict:
    return proposal_modelos.obter_modelo(modelo_id=_inteiro(args, "id", obrigatorio=True), db=db, _=user)


# ==================== Vagas e candidaturas ====================
def _listar_vagas(db: Session, user: dict, args: dict) -> dict:
    r = proposal_vagas.listar_vagas(status_vaga=_texto(args, "status"), busca=_texto(args, "busca"), db=db, user=user)
    return {"items": [_com_link_vaga(v) for v in r["items"]], "total": r["total"]}


def _ver_vaga(db: Session, user: dict, args: dict) -> dict:
    return _com_link_vaga(proposal_vagas.obter_vaga(vaga_id=_inteiro(args, "id", obrigatorio=True), db=db, user=user))


def _vaga_payload(dados: dict) -> VagaIn:
    try:
        return VagaIn(**dados)
    except ValidationError as e:
        raise ErroArgumento(_mensagem_validacao(e))


def _criar_vaga(db: Session, user: dict, args: dict) -> dict:
    payload = _vaga_payload(_mesclar({}, args, CAMPOS_VAGA))
    return _com_link_vaga(proposal_vagas.criar_vaga(payload=payload, db=db, user=user))


def _editar_vaga(db: Session, user: dict, args: dict) -> dict:
    vid = _inteiro(args, "id", obrigatorio=True)
    atual = proposal_vagas.obter_vaga(vaga_id=vid, db=db, user=user)
    base = {campo: atual.get(campo) for campo in CAMPOS_VAGA}
    payload = _vaga_payload(_mesclar(base, args, CAMPOS_VAGA))
    return _com_link_vaga(proposal_vagas.editar_vaga(vaga_id=vid, payload=payload, db=db, user=user))


def _listar_candidaturas(db: Session, user: dict, args: dict) -> dict:
    vid = _inteiro(args, "vaga_id", obrigatorio=True)
    vaga = proposal_vagas.obter_vaga(vaga_id=vid, db=db, user=user)
    itens = proposal_vagas.listar_candidaturas(vaga_id=vid, db=db, _=user)
    return {
        "vaga": {"id": vaga["id"], "titulo": vaga["titulo"], "status": vaga["status"], "link_painel": _painel(f"/vagas/{vid}")},
        "items": [{**c, "link_curriculo": _painel(f"/candidaturas/{c['id']}/curriculo")} for c in itens],
        "total": len(itens),
    }


# ==================== Schemas ====================
def _enum(valores, descricao: str) -> dict:
    return {"type": "string", "enum": list(valores), "description": descricao}


def _rotulos(mapa: dict) -> str:
    return "; ".join(f"{k} = {v}" for k, v in mapa.items())


_ID = {"type": "integer", "minimum": 1}

_INVESTIMENTO = {
    "type": "object",
    "properties": {
        "tipo": _enum(TIPOS_INVESTIMENTO, f"Modelo de investimento: {_rotulos(TIPOS_INVESTIMENTO)}"),
        "taxa_tipo": _enum(
            TAXA_TIPOS, "percentual: taxa em % (maior que 0 e menor que 100); valor: valor na moeda da proposta",
        ),
        "taxa": {"type": "number", "exclusiveMinimum": 0, "description": "Taxa (% ou valor, conforme taxa_tipo)"},
        "entrada": {
            "type": "integer", "minimum": 0, "maximum": 100,
            "description": "Percentual pago na entrada (opcional)",
        },
    },
    "required": ["tipo", "taxa_tipo", "taxa"],
    "additionalProperties": False,
}

_PROJETOS = {
    "type": "array",
    "minItems": 1,
    "maxItems": 10,
    "description": "De 1 a 10 projetos (posições); cada um com 1 a 3 investimentos de tipos diferentes",
    "items": {
        "type": "object",
        "properties": {
            "nome": {"type": "string", "maxLength": 255, "description": "Nome do projeto/posição (ex.: CFO)"},
            "investimentos": {"type": "array", "minItems": 1, "maxItems": 3, "items": _INVESTIMENTO},
        },
        "required": ["nome", "investimentos"],
        "additionalProperties": False,
    },
}

_TEXTO_CURTO = {"type": "string", "maxLength": 255}


def _campos_proposta(com_imutaveis: bool) -> dict:
    campos = {
        "cliente_nome": {**_TEXTO_CURTO, "description": "Nome da empresa cliente"},
        "setor": _enum(SETORES, f"Setor do cliente: {_rotulos(SETORES)}"),
        "data_proposta": {"type": "string", "format": "date", "description": "Data da proposta (AAAA-MM-DD; padrão: hoje)"},
        "validade_dias": {
            "type": "integer", "minimum": 1, "maximum": VALIDADE_DIAS_MAX,
            "description": "Validade em dias a partir da data da proposta",
        },
        "projetos": _PROJETOS,
        "projeto_escopo": {
            "type": "string",
            "description": "Escopo do projeto (até 5.000 caracteres). Aceita texto ou HTML simples com <p>, <ul>, <ol>, <li>, <strong> e <br>",
        },
        "shortlist": {**_TEXTO_CURTO, "description": "Garantia de shortlist (opcional; vazio usa o texto padrão, ex.: 3 a 5 candidatos)"},
        "sla": {**_TEXTO_CURTO, "description": "SLA (opcional; vazio usa o texto padrão, ex.: 5 a 10 dias úteis)"},
        "garantia": {**_TEXTO_CURTO, "description": "Garantia (opcional)"},
        "consultor_nome": {**_TEXTO_CURTO, "description": "Nome do consultor (padrão: Meu perfil)"},
        "consultor_cargo": {**_TEXTO_CURTO, "description": "Cargo do consultor (padrão: Meu perfil)"},
        "consultor_telefone": {"type": "string", "maxLength": 30, "description": "Telefone do consultor (padrão: Meu perfil)"},
        "consultor_email": {**_TEXTO_CURTO, "description": "E-mail do consultor (padrão: Meu perfil)"},
    }
    if com_imutaveis:
        campos = {
            "modelo": _enum(MODELOS, "Modelo da proposta: " + "; ".join(f"{k} = {v['nome']}" for k, v in MODELOS.items())),
            "idioma": _enum(IDIOMAS, "Idioma da página do cliente (padrão pt-BR)"),
            "moeda": _enum(MOEDAS, "Moeda dos valores (padrão BRL)"),
            **campos,
        }
    return campos


_CAMPOS_VAGA_SCHEMA = {
    "titulo": {"type": "string", "maxLength": 120, "description": "Título da vaga"},
    "area": _enum(AREAS, f"Área: {_rotulos(AREAS)}"),
    "nivel": _enum(NIVEIS, f"Nível: {_rotulos(NIVEIS)}"),
    "localidade": {"type": "string", "maxLength": 120, "description": "Localidade (ex.: São Paulo / SP, Remoto · Brasil)"},
    "resumo": {"type": "string", "maxLength": 300, "description": "Resumo exibido na lista do site"},
    "descricao": {"type": "string", "maxLength": 5000, "description": "Descrição da vaga (opcional)"},
    "responsabilidades": {"type": "string", "maxLength": 5000, "description": "Responsabilidades, uma por linha (opcional)"},
    "requisitos": {"type": "string", "maxLength": 5000, "description": "Pré-requisitos, um por linha"},
    "diferenciais": {"type": "string", "maxLength": 5000, "description": "Diferenciais, um por linha (opcional)"},
    "cliente": {
        "type": "string", "maxLength": 160,
        "description": "Cliente da vaga (uso interno, nunca aparece no site); obrigatório quando não há codigo_planilha",
    },
    "codigo_planilha": {
        "type": "string", "maxLength": 20,
        "description": "Código da vaga na planilha de candidaturas (ex.: V0005; opcional)",
    },
}


def _objeto(propriedades: dict, obrigatorios: tuple = ()) -> dict:
    schema = {"type": "object", "properties": propriedades, "additionalProperties": False}
    if obrigatorios:
        schema["required"] = list(obrigatorios)
    return schema


FERRAMENTAS = (
    Ferramenta(
        "listar_propostas",
        "Listar propostas",
        "Lista propostas do Consultant Panel com os mesmos filtros da lista do painel, mais recentes primeiro, "
        f"{PAGINA_PROPOSTAS} por página. Cada item traz id, código, empresa, projeto, status, datas, autor e links.",
        _objeto({
            "status": _enum(STATUS_FILTRO, "Status (expirada = pendente com validade vencida)"),
            "empresa": {"type": "string", "description": "Parte do nome da empresa"},
            "modelo": _enum((*MODELOS, MODELO_SIMPLES), "Modelo da proposta"),
            "projeto": {"type": "string", "description": "Parte do nome de um projeto"},
            "data_de": {"type": "string", "format": "date", "description": "Data inicial (AAAA-MM-DD)"},
            "data_ate": {"type": "string", "format": "date", "description": "Data final (AAAA-MM-DD)"},
            "criado_por": {"type": "string", "description": "Login exato de quem criou"},
            "pagina": {"type": "integer", "minimum": 1, "description": "Página (padrão 1)"},
        }),
        _listar_propostas,
        True,
    ),
    Ferramenta(
        "ver_proposta",
        "Ver proposta",
        "Mostra todos os dados de uma proposta (projetos, investimentos, consultor, validade, status, assinatura e "
        "histórico de versões), com o link do painel e o link da página do cliente.",
        _objeto({"id": {**_ID, "description": "id da proposta"}}, ("id",)),
        _ver_proposta,
        True,
    ),
    Ferramenta(
        "criar_proposta",
        "Criar proposta",
        "Cria uma proposta por modelo com as mesmas regras do painel. A proposta nasce 'aguardando' com link público "
        "para o cliente; nada é enviado automaticamente. Dados do consultor omitidos vêm do Meu perfil. "
        "Confirme os dados com o consultor antes de criar.",
        _objeto(_campos_proposta(com_imutaveis=True), ("modelo", "cliente_nome", "setor", "projetos", "validade_dias")),
        _criar_proposta,
        False,
    ),
    Ferramenta(
        "editar_proposta",
        "Editar proposta",
        "Altera uma proposta ainda não assinada nem cancelada (só quem criou ou admin). Envie apenas os campos que "
        "mudam; os demais são mantidos. 'projetos', quando enviado, substitui a lista inteira (consulte ver_proposta "
        "antes). Modelo, idioma e moeda não mudam. Cada edição gera uma nova versão e volta o status para 'aguardando'.",
        _objeto({"id": {**_ID, "description": "id da proposta"}, **_campos_proposta(com_imutaveis=False)}, ("id",)),
        _editar_proposta,
        False,
    ),
    Ferramenta(
        "listar_modelos",
        "Listar modelos de proposta",
        "Lista os modelos de proposta cadastrados (divisão, nome, idioma, moeda, setor, projetos e condições), "
        "úteis como ponto de partida para criar_proposta.",
        _objeto({
            "divisao": _enum(MODELOS, "Divisão (modelo de proposta)"),
            "nome": {"type": "string", "description": "Parte do nome do modelo"},
        }),
        _listar_modelos,
        True,
    ),
    Ferramenta(
        "ver_modelo",
        "Ver modelo de proposta",
        "Mostra um modelo de proposta.",
        _objeto({"id": {**_ID, "description": "id do modelo"}}, ("id",)),
        _ver_modelo,
        True,
    ),
    Ferramenta(
        "listar_vagas",
        "Listar vagas",
        "Lista as vagas do painel (abertas e encerradas), mais recentes primeiro, com contagem de candidaturas e link do painel.",
        _objeto({
            "status": _enum((STATUS_ABERTA, STATUS_ENCERRADA), "Status da vaga"),
            "busca": {"type": "string", "description": "Parte do título, cliente ou código na planilha"},
        }),
        _listar_vagas,
        True,
    ),
    Ferramenta(
        "ver_vaga",
        "Ver vaga",
        "Mostra todos os dados de uma vaga, incluindo cliente, código na planilha e contagem de candidaturas.",
        _objeto({"id": {**_ID, "description": "id da vaga"}}, ("id",)),
        _ver_vaga,
        True,
    ),
    Ferramenta(
        "criar_vaga",
        "Criar vaga",
        "Cria uma vaga aberta com o consultor como autor; ela passa a aparecer na página Vagas do site. "
        "Confirme os dados com o consultor antes de criar.",
        _objeto(_CAMPOS_VAGA_SCHEMA, ("titulo", "area", "nivel", "localidade", "resumo", "requisitos")),
        _criar_vaga,
        False,
    ),
    Ferramenta(
        "editar_vaga",
        "Editar vaga",
        "Altera uma vaga (só o autor ou admin). Envie apenas os campos que mudam; os demais são mantidos.",
        _objeto({"id": {**_ID, "description": "id da vaga"}, **_CAMPOS_VAGA_SCHEMA}, ("id",)),
        _editar_vaga,
        False,
    ),
    Ferramenta(
        "listar_candidaturas",
        "Listar candidaturas da vaga",
        "Lista as candidaturas de uma vaga (mais recentes primeiro) com contatos, cargo e empresa atuais, pretensões, "
        "demais respostas do formulário, status do envio à planilha e o link do painel para abrir o currículo.",
        _objeto({"vaga_id": {**_ID, "description": "id da vaga"}}, ("vaga_id",)),
        _listar_candidaturas,
        True,
    ),
)

_POR_NOME = {f.nome: f for f in FERRAMENTAS}


def descrever_todas() -> list[dict]:
    return [f.descrever() for f in FERRAMENTAS]


def existe(nome: Any) -> bool:
    return isinstance(nome, str) and nome in _POR_NOME


def _resultado(texto: str, erro: bool) -> dict:
    return {"content": [{"type": "text", "text": texto}], "isError": erro}


def _detalhe(detail: Any) -> str:
    return detail if isinstance(detail, str) else json.dumps(detail, ensure_ascii=False)


def executar(db: Session, user: dict, nome: str, args: Any) -> dict:
    """Resultado de `tools/call`; erros de negócio voltam como `isError` com a mensagem do painel."""
    if not isinstance(args, dict):
        return _resultado("Os argumentos devem ser um objeto JSON", True)
    marcador = origem_auditoria.set(ORIGEM)
    try:
        resultado = _POR_NOME[nome].funcao(db, user, args)
        return _resultado(json.dumps(resultado, ensure_ascii=False, default=str), False)
    except HTTPException as e:
        db.rollback()
        return _resultado(_detalhe(e.detail), True)
    except ErroArgumento as e:
        db.rollback()
        return _resultado(str(e), True)
    except Exception:
        db.rollback()
        logger.exception("Falha na ferramenta %s do conector do Claude", nome)
        return _resultado(MSG_INESPERADO, True)
    finally:
        origem_auditoria.reset(marcador)
