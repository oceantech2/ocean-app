"""Conector do Claude (feature 103): descoberta e servidor de autorização OAuth 2.1, consentimento pelo painel
e conexões do consultor."""
import html
from typing import Optional
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, Form, Header, HTTPException, Query, Request, status
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.routes.proposal_auth import get_proposal_user
from app.config import settings
from app.database import get_db
from app.models import McpConexao
from app.services import mcp_auth
from app.services.audit import registrar_auditoria
from app.services.mcp_auth import ErroOAuth

# Descoberta na raiz do host (RFC 9728 e RFC 8414)
router_descoberta = APIRouter()
router = APIRouter()
router_conexoes = APIRouter()

MSG_CONEXAO_NAO_ENCONTRADA = "Conexão não encontrada"
_SEM_CACHE = {"Cache-Control": "no-store", "Pragma": "no-cache"}


def _erro_oauth(e: ErroOAuth) -> JSONResponse:
    headers = dict(_SEM_CACHE)
    if e.status == 401:
        headers["WWW-Authenticate"] = 'Basic realm="ocean-mcp"'
    return JSONResponse(e.corpo(), status_code=e.status, headers=headers)


def _iso(valor) -> Optional[str]:
    return valor.replace(microsecond=0).isoformat() + "Z" if valor else None


@router_descoberta.get("/.well-known/oauth-protected-resource")
@router_descoberta.get("/.well-known/oauth-protected-resource/api/mcp")
def metadados_recurso():
    return mcp_auth.metadados_recurso()


@router_descoberta.get("/.well-known/oauth-authorization-server")
def metadados_autorizacao():
    return mcp_auth.metadados_autorizacao()


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def registrar(request: Request, db: Session = Depends(get_db)):
    try:
        dados = await request.json()
    except ValueError:
        dados = None
    if not isinstance(dados, dict):
        return _erro_oauth(ErroOAuth("invalid_client_metadata", "Corpo JSON inválido"))
    try:
        resposta = mcp_auth.registrar_cliente(db, dados)
    except ErroOAuth as e:
        db.rollback()
        return _erro_oauth(e)
    db.commit()
    return JSONResponse(resposta, status_code=status.HTTP_201_CREATED, headers=_SEM_CACHE)


def _pagina_erro(mensagem: str) -> HTMLResponse:
    corpo = (
        "<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'><title>Ocean · Conectar Claude</title></head>"
        "<body style='font-family:sans-serif;max-width:480px;margin:80px auto;color:#0b3a5b'>"
        f"<h1>Não foi possível conectar</h1><p>{html.escape(mensagem)}</p>"
        "<p>Remova o conector no Claude e adicione-o novamente.</p></body></html>"
    )
    return HTMLResponse(corpo, status_code=status.HTTP_400_BAD_REQUEST)


@router.get("/authorize")
def autorizar(
    response_type: Optional[str] = Query(None),
    client_id: Optional[str] = Query(None),
    redirect_uri: Optional[str] = Query(None),
    code_challenge: Optional[str] = Query(None),
    code_challenge_method: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    scope: Optional[str] = Query(None),
    resource: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    cliente = mcp_auth.obter_cliente(db, client_id)
    if not cliente:
        return _pagina_erro("Aplicativo desconhecido.")
    uris = cliente.redirect_uris or []
    if not redirect_uri and len(uris) == 1:
        redirect_uri = uris[0]
    if not redirect_uri or redirect_uri not in uris:
        return _pagina_erro("Endereço de retorno não registrado para este aplicativo.")

    def erro(codigo: str, descricao: str) -> RedirectResponse:
        destino = mcp_auth.url_retorno(redirect_uri, {"error": codigo, "error_description": descricao, "state": state})
        return RedirectResponse(destino, status_code=status.HTTP_302_FOUND)

    if response_type != "code":
        return erro("unsupported_response_type", "Só response_type=code é aceito")
    if code_challenge_method != "S256" or not mcp_auth.challenge_valido(code_challenge):
        return erro("invalid_request", "PKCE com code_challenge_method=S256 é obrigatório")
    if not mcp_auth.resource_valido(resource):
        return erro("invalid_target", "resource não corresponde a este servidor MCP")

    pedido = mcp_auth.emitir_pedido(cliente, redirect_uri, code_challenge, state)
    destino = f"{settings.consultant_panel_url()}/conectar-claude?{urlencode({'pedido': pedido})}"
    return RedirectResponse(destino, status_code=status.HTTP_302_FOUND)


def _cliente_da_requisicao(
    db: Session, authorization: Optional[str], client_id: Optional[str], client_secret: Optional[str],
):
    basic_id, basic_segredo = mcp_auth.credenciais_basic(authorization)
    return mcp_auth.autenticar_cliente(db, basic_id or client_id, basic_segredo or client_secret)


@router.post("/token")
def emitir_token(
    grant_type: Optional[str] = Form(None),
    code: Optional[str] = Form(None),
    redirect_uri: Optional[str] = Form(None),
    code_verifier: Optional[str] = Form(None),
    refresh_token: Optional[str] = Form(None),
    resource: Optional[str] = Form(None),
    client_id: Optional[str] = Form(None),
    client_secret: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    try:
        cliente = _cliente_da_requisicao(db, authorization, client_id, client_secret)
        if not mcp_auth.resource_valido(resource):
            raise ErroOAuth("invalid_target", "resource não corresponde a este servidor MCP")
        if grant_type == "authorization_code":
            resposta = mcp_auth.trocar_codigo(db, cliente, code, redirect_uri, code_verifier)
        elif grant_type == "refresh_token":
            resposta = mcp_auth.renovar(db, cliente, refresh_token)
        else:
            raise ErroOAuth("unsupported_grant_type", "grant_type não suportado")
    except ErroOAuth as e:
        # Mantém o consumo do código/refresh e a revogação por reuso
        db.commit()
        return _erro_oauth(e)
    db.commit()
    return JSONResponse(resposta, headers=_SEM_CACHE)


@router.post("/revoke")
def revogar_token(
    token: Optional[str] = Form(None),
    token_type_hint: Optional[str] = Form(None),
    client_id: Optional[str] = Form(None),
    client_secret: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    try:
        cliente = _cliente_da_requisicao(db, authorization, client_id, client_secret)
    except ErroOAuth as e:
        return _erro_oauth(e)
    mcp_auth.revogar_por_token(db, cliente, token)
    db.commit()
    return JSONResponse({}, headers=_SEM_CACHE)


@router.get("/pedido")
def obter_pedido(
    pedido: str = Query(..., max_length=4000),
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    try:
        _, cliente = mcp_auth.ler_pedido(db, pedido)
    except ErroOAuth as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.descricao)
    return {"cliente_nome": cliente.client_name, "usuario": user["usuario"], "mcp_url": settings.mcp_resource_url()}


class ConsentimentoIn(BaseModel):
    pedido: str
    aprovar: bool


@router.post("/consentir")
def consentir(payload: ConsentimentoIn, db: Session = Depends(get_db), user: dict = Depends(get_proposal_user)):
    try:
        dados, cliente = mcp_auth.ler_pedido(db, payload.pedido)
    except ErroOAuth as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.descricao)
    if not payload.aprovar:
        destino = mcp_auth.url_retorno(dados["ru"], {
            "error": "access_denied",
            "error_description": "O consultor recusou a conexão",
            "state": dados.get("st"),
        })
        return {"redirect_url": destino}
    conexao, destino = mcp_auth.autorizar(db, dados, cliente, user["id"])
    registrar_auditoria(db, user["usuario"], "conectar", "ConexaoClaude", conexao.id, cliente.client_name)
    db.commit()
    return {"redirect_url": destino}


@router_conexoes.get("")
def listar_conexoes(db: Session = Depends(get_db), user: dict = Depends(get_proposal_user)):
    itens = [
        {
            "id": c.id,
            "cliente_nome": c.cliente.client_name if c.cliente else mcp_auth.NOME_PADRAO_CLIENTE,
            "criado_em": _iso(c.criado_em),
            "ultimo_uso_em": _iso(c.ultimo_uso_em),
        }
        for c in mcp_auth.conexoes_ativas(db, user["id"])
    ]
    return {"mcp_url": settings.mcp_resource_url(), "items": itens}


@router_conexoes.delete("/{conexao_id}", status_code=status.HTTP_204_NO_CONTENT)
def desconectar(conexao_id: int, db: Session = Depends(get_db), user: dict = Depends(get_proposal_user)):
    conexao = db.get(McpConexao, conexao_id)
    if not conexao or conexao.usuario_id != user["id"] or conexao.revogada_em is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=MSG_CONEXAO_NAO_ENCONTRADA)
    mcp_auth.revogar_conexao(conexao)
    nome = conexao.cliente.client_name if conexao.cliente else mcp_auth.NOME_PADRAO_CLIENTE
    registrar_auditoria(db, user["usuario"], "desconectar", "ConexaoClaude", conexao.id, nome)
    db.commit()
    return None
