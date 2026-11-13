"""Servidor MCP do conector do Claude (feature 103): Streamable HTTP sem sessão e com respostas JSON.

Subconjunto do protocolo: initialize, ping, tools/list e tools/call; o SDK oficial exige versões de
Pydantic/Uvicorn incompatíveis com o stack fixado (specs/103-mcp-claude-desktop/research.md §1).
"""
import json
from typing import Any, Optional

from fastapi import APIRouter, Request, Response, status
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool

from app.database import SessionLocal
from app.services import mcp_auth, mcp_ferramentas

router = APIRouter()

VERSOES_PROTOCOLO = ("2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05")
VERSAO_PADRAO = "2025-06-18"

INSTRUCOES = (
    "Ferramentas do Consultant Panel da Ocean (propostas, modelos de proposta, vagas e candidaturas). "
    "Toda ação é feita em nome do consultor conectado, com as mesmas permissões e validações do painel. "
    "Antes de criar ou editar, confirme os dados com o consultor. Para editar, envie só os campos que mudam. "
    "Quando uma ferramenta devolver erro, explique a mensagem ao consultor e corrija os dados. "
    "Excluir ou cancelar propostas, encerrar vagas, reenviar candidaturas à planilha e abrir currículos "
    "são feitos no painel: use os links devolvidos (link_painel, link_cliente, link_curriculo)."
)


def _resposta(id_: Any, resultado: dict) -> dict:
    return {"jsonrpc": "2.0", "id": id_, "result": resultado}


def _erro(id_: Any, codigo: int, mensagem: str) -> dict:
    return {"jsonrpc": "2.0", "id": id_, "error": {"code": codigo, "message": mensagem}}


def _nao_autorizado(token_presente: bool) -> JSONResponse:
    cabecalho = f'Bearer resource_metadata="{mcp_auth.metadados_url()}"'
    if token_presente:
        cabecalho += ', error="invalid_token", error_description="Token inválido, expirado ou revogado"'
    return JSONResponse(
        {"error": "invalid_token" if token_presente else "unauthorized",
         "error_description": "Conecte o Claude ao Consultant Panel para usar este servidor"},
        status_code=status.HTTP_401_UNAUTHORIZED,
        headers={"WWW-Authenticate": cabecalho},
    )


def _bearer(authorization: Optional[str]) -> Optional[str]:
    if authorization and authorization.lower().startswith("bearer "):
        return authorization[7:].strip() or None
    return None


def _tratar(db, user: dict, mensagem: Any) -> Optional[dict]:
    """Resposta JSON-RPC da mensagem ou None para notificações e respostas do cliente."""
    if not isinstance(mensagem, dict) or mensagem.get("jsonrpc") != "2.0":
        return _erro(mensagem.get("id") if isinstance(mensagem, dict) else None, -32600, "Invalid Request")
    metodo = mensagem.get("method")
    if metodo is None or "id" not in mensagem:
        return None
    id_ = mensagem["id"]
    params = mensagem.get("params") or {}
    if not isinstance(metodo, str) or not isinstance(params, dict):
        return _erro(id_, -32600, "Invalid Request")

    if metodo == "initialize":
        pedida = params.get("protocolVersion")
        return _resposta(id_, {
            "protocolVersion": pedida if pedida in VERSOES_PROTOCOLO else VERSAO_PADRAO,
            "capabilities": {"tools": {"listChanged": False}},
            "serverInfo": {"name": "ocean-consultant-panel", "title": "Ocean · Consultant Panel", "version": "1.0.0"},
            "instructions": INSTRUCOES,
        })
    if metodo == "ping":
        return _resposta(id_, {})
    if metodo == "tools/list":
        return _resposta(id_, {"tools": mcp_ferramentas.descrever_todas()})
    if metodo == "tools/call":
        nome = params.get("name")
        if not mcp_ferramentas.existe(nome):
            return _erro(id_, -32602, f"Ferramenta desconhecida: {nome}")
        return _resposta(id_, mcp_ferramentas.executar(db, user, nome, params.get("arguments") or {}))
    return _erro(id_, -32601, "Method not found")


def _processar(token: Optional[str], corpo: bytes) -> Response:
    if not token:
        return _nao_autorizado(False)
    db = SessionLocal()
    try:
        user = mcp_auth.validar_acesso(db, token)
        if not user:
            return _nao_autorizado(True)
        db.commit()
        try:
            mensagem = json.loads(corpo)
        except ValueError:
            return JSONResponse(_erro(None, -32700, "Parse error"), status_code=status.HTTP_400_BAD_REQUEST)
        if isinstance(mensagem, list):
            if not mensagem:
                return JSONResponse(_erro(None, -32600, "Invalid Request"), status_code=status.HTTP_400_BAD_REQUEST)
            respostas = [r for r in (_tratar(db, user, m) for m in mensagem) if r is not None]
            return JSONResponse(respostas) if respostas else Response(status_code=status.HTTP_202_ACCEPTED)
        resposta = _tratar(db, user, mensagem)
        return JSONResponse(resposta) if resposta is not None else Response(status_code=status.HTTP_202_ACCEPTED)
    finally:
        db.close()


@router.post("")
async def receber(request: Request):
    token = _bearer(request.headers.get("authorization"))
    corpo = await request.body()
    return await run_in_threadpool(_processar, token, corpo)


@router.get("")
@router.delete("")
def sem_fluxo():
    """Sem fluxo SSE do servidor e sem sessão."""
    return Response(status_code=status.HTTP_405_METHOD_NOT_ALLOWED, headers={"Allow": "POST"})
