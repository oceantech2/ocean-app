"""Formulário de contato do site enviado à aba Leads da planilha "Base de Relacionamento"."""
from __future__ import annotations

import re

from fastapi import HTTPException, status

from app.services.planilha_candidaturas import postar

TIPOS = {
    "empresa": "Empresa buscando contratar",
    "profissional": "Profissional em busca de oportunidades",
    "outro": "Outro",
}
ORIGEM = "Site (contato)"

_EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def validar_contato(campos: dict) -> dict:
    """Valida os campos do formulário; erros vão em 422 como {campo: mensagem}."""
    d = {chave: (valor or "").strip() for chave, valor in campos.items()}
    erros: dict[str, str] = {}

    if not (2 <= len(d["nome"]) <= 120):
        erros["nome"] = "Informe seu nome"
    if not _EMAIL.match(d["email"]) or len(d["email"]) > 180:
        erros["email"] = "E-mail inválido"
    if not (8 <= len(d["telefone"]) <= 40):
        erros["telefone"] = "Informe um telefone válido"
    if not (1 <= len(d["cargo"]) <= 120):
        erros["cargo"] = "Informe seu cargo"
    if not (1 <= len(d["empresa"]) <= 160):
        erros["empresa"] = "Informe sua empresa"
    if d["tipo"] not in TIPOS:
        erros["tipo"] = "Selecione uma opção"
    if len(d["linkedin"]) > 200:
        erros["linkedin"] = "Máximo de 200 caracteres"
    if len(d["mensagem"]) > 2000:
        erros["mensagem"] = "Máximo de 2000 caracteres"

    if erros:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=erros)
    return {**d, "email": d["email"].lower()}


def enviar_lead(d: dict) -> dict:
    """Grava na aba Leads; levanta ErroPlanilha se a planilha não aceitar."""
    payload = {
        "tipo": "lead",
        "origem": ORIGEM,
        "nome": d["nome"],
        "email": d["email"],
        "telefone": d["telefone"],
        "linkedin": d["linkedin"],
        "cargo": d["cargo"],
        "empresa": d["empresa"],
        "tipoContato": d["tipo"],
        "perfil": TIPOS[d["tipo"]],
        "mensagem": d["mensagem"],
    }
    return postar({chave: valor for chave, valor in payload.items() if valor not in (None, "")})
