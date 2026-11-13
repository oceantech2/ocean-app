"""Conector do Claude (feature 103): OAuth 2.1 (registro dinâmico, PKCE S256, rotação de refresh) e validação do token.

O token de acesso é um JWT com `app="mcp"` e `aud` = URL do MCP: o ERP e o Proposal o recusam (`_exigir_app`)
e o MCP recusa os tokens deles. Cada chamada reconfere no banco a conexão e o usuário (revogação imediata).
"""
import base64
import hashlib
import secrets
import time
from datetime import datetime, timedelta
from typing import Optional
from urllib.parse import urlencode, urlparse

from jose import JWTError, jwt
from sqlalchemy import exists, update
from sqlalchemy.orm import Session

from app.config import settings
from app.models import McpCliente, McpConexao, McpToken, UsuarioApp

APP_MCP = "mcp"
APP_PEDIDO = "mcp_pedido"
ESCOPO = "painel"

TIPO_CODIGO = "codigo"
TIPO_REFRESH = "refresh"

VALIDADE_ACESSO = timedelta(hours=1)
VALIDADE_CODIGO = timedelta(minutes=5)
VALIDADE_REFRESH = timedelta(days=30)
VALIDADE_PEDIDO = timedelta(minutes=10)
INTERVALO_ULTIMO_USO = timedelta(minutes=5)

METODO_PUBLICO = "none"
METODOS_AUTH = (METODO_PUBLICO, "client_secret_post", "client_secret_basic")
REDIRECTS_CLAUDE = (
    "https://claude.ai/api/mcp/auth_callback",
    "https://claude.com/api/mcp/auth_callback",
)
_HOSTS_LOOPBACK = ("localhost", "127.0.0.1", "::1")

NOME_PADRAO_CLIENTE = "Aplicativo MCP"
MSG_PEDIDO_INVALIDO = "Pedido de conexão expirado ou inválido. Conecte novamente pelo Claude."


class ErroOAuth(Exception):
    """Erro no formato da RFC 6749 (`error` + `error_description`)."""

    def __init__(self, erro: str, descricao: str, status: int = 400):
        super().__init__(descricao)
        self.erro = erro
        self.descricao = descricao
        self.status = status

    def corpo(self) -> dict:
        return {"error": self.erro, "error_description": self.descricao}


def _agora() -> datetime:
    return datetime.utcnow().replace(microsecond=0)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


# ==================== Metadados de descoberta ====================
def metadados_recurso() -> dict:
    return {
        "resource": settings.mcp_resource_url(),
        "authorization_servers": [settings.mcp_base_url()],
        "scopes_supported": [ESCOPO],
        "bearer_methods_supported": ["header"],
        "resource_name": "Ocean · Consultant Panel",
    }


def metadados_autorizacao() -> dict:
    base = settings.mcp_base_url()
    return {
        "issuer": base,
        "authorization_endpoint": f"{base}/api/mcp/oauth/authorize",
        "token_endpoint": f"{base}/api/mcp/oauth/token",
        "registration_endpoint": f"{base}/api/mcp/oauth/register",
        "revocation_endpoint": f"{base}/api/mcp/oauth/revoke",
        "response_types_supported": ["code"],
        "grant_types_supported": ["authorization_code", "refresh_token"],
        "code_challenge_methods_supported": ["S256"],
        "token_endpoint_auth_methods_supported": list(METODOS_AUTH),
        "revocation_endpoint_auth_methods_supported": list(METODOS_AUTH),
        "scopes_supported": [ESCOPO],
    }


def metadados_url() -> str:
    return f"{settings.mcp_base_url()}/.well-known/oauth-protected-resource/api/mcp"


# ==================== Clientes (registro dinâmico) ====================
def redirect_uri_permitido(uri: str) -> bool:
    if uri in REDIRECTS_CLAUDE or uri in settings.mcp_redirect_uris_extra():
        return True
    try:
        partes = urlparse(uri)
        host = partes.hostname
    except ValueError:
        return False
    return partes.scheme == "http" and host in _HOSTS_LOOPBACK and not partes.fragment


def registrar_cliente(db: Session, dados: dict) -> dict:
    """Registra o aplicativo e devolve a resposta da RFC 7591. Não faz commit."""
    uris = dados.get("redirect_uris")
    if not isinstance(uris, list) or not uris or not all(isinstance(u, str) and u for u in uris):
        raise ErroOAuth("invalid_redirect_uri", "Informe ao menos um redirect_uri")
    for uri in uris:
        if len(uri) > 2000 or not redirect_uri_permitido(uri):
            raise ErroOAuth("invalid_redirect_uri", f"redirect_uri não permitido: {uri[:200]}")

    metodo = dados.get("token_endpoint_auth_method") or METODO_PUBLICO
    if metodo not in METODOS_AUTH:
        raise ErroOAuth("invalid_client_metadata", "token_endpoint_auth_method não suportado")
    nome = dados.get("client_name")
    nome = (nome.strip() if isinstance(nome, str) else "")[:255] or NOME_PADRAO_CLIENTE

    segredo = secrets.token_urlsafe(32) if metodo != METODO_PUBLICO else None
    cliente = McpCliente(
        client_id=secrets.token_urlsafe(24),
        client_secret_hash=hash_token(segredo) if segredo else None,
        auth_method=metodo,
        client_name=nome,
        redirect_uris=list(dict.fromkeys(uris)),
        criado_em=_agora(),
    )
    db.add(cliente)
    db.flush()

    resposta = {
        "client_id": cliente.client_id,
        "client_id_issued_at": int(time.time()),
        "client_name": cliente.client_name,
        "redirect_uris": cliente.redirect_uris,
        "grant_types": ["authorization_code", "refresh_token"],
        "response_types": ["code"],
        "token_endpoint_auth_method": metodo,
        "scope": ESCOPO,
    }
    if segredo:
        resposta["client_secret"] = segredo
        resposta["client_secret_expires_at"] = 0
    return resposta


def obter_cliente(db: Session, client_id: Optional[str]) -> Optional[McpCliente]:
    if not client_id:
        return None
    return db.query(McpCliente).filter(McpCliente.client_id == client_id).first()


def credenciais_basic(authorization: Optional[str]) -> tuple[Optional[str], Optional[str]]:
    """Lê `Authorization: Basic base64(client_id:client_secret)`; (None, None) se ausente ou malformado."""
    if not authorization or not authorization.lower().startswith("basic "):
        return None, None
    try:
        decodificado = base64.b64decode(authorization[6:].strip()).decode("utf-8")
    except (ValueError, UnicodeDecodeError):
        return None, None
    client_id, _, segredo = decodificado.partition(":")
    return client_id or None, segredo or None


def autenticar_cliente(db: Session, client_id: Optional[str], segredo: Optional[str]) -> McpCliente:
    cliente = obter_cliente(db, client_id)
    if not cliente:
        raise ErroOAuth("invalid_client", "Cliente desconhecido", 401)
    if cliente.auth_method != METODO_PUBLICO and (
        not segredo or not secrets.compare_digest(hash_token(segredo), cliente.client_secret_hash or "")
    ):
        raise ErroOAuth("invalid_client", "Credenciais do cliente inválidas", 401)
    return cliente


# ==================== Autorização (pedido assinado + consentimento) ====================
def challenge_valido(challenge: Optional[str]) -> bool:
    return bool(challenge) and 43 <= len(challenge) <= 128


def pkce_valido(verifier: Optional[str], challenge: Optional[str]) -> bool:
    if not verifier or not challenge or not 43 <= len(verifier) <= 128:
        return False
    calculado = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode("ascii", "ignore")).digest())
    return secrets.compare_digest(calculado.decode("ascii").rstrip("="), challenge)


def resource_valido(resource: Optional[str]) -> bool:
    return not resource or resource.rstrip("/") == settings.mcp_resource_url()


def url_retorno(redirect_uri: str, params: dict) -> str:
    query = urlencode({k: v for k, v in params.items() if v is not None})
    return f"{redirect_uri}{'&' if '?' in redirect_uri else '?'}{query}"


def emitir_pedido(cliente: McpCliente, redirect_uri: str, code_challenge: str, state: Optional[str]) -> str:
    return jwt.encode(
        {
            "app": APP_PEDIDO,
            "cid": cliente.client_id,
            "ru": redirect_uri,
            "cc": code_challenge,
            "st": state,
            "exp": datetime.utcnow() + VALIDADE_PEDIDO,
        },
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def ler_pedido(db: Session, pedido: Optional[str]) -> tuple[dict, McpCliente]:
    """Valida o pedido assinado e o cliente; ErroOAuth com mensagem para a tela do painel se inválido."""
    try:
        dados = jwt.decode(pedido or "", settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise ErroOAuth("invalid_request", MSG_PEDIDO_INVALIDO)
    cliente = obter_cliente(db, dados.get("cid"))
    if dados.get("app") != APP_PEDIDO or not cliente or dados.get("ru") not in (cliente.redirect_uris or []):
        raise ErroOAuth("invalid_request", MSG_PEDIDO_INVALIDO)
    return dados, cliente


def autorizar(db: Session, pedido: dict, cliente: McpCliente, usuario_id: int) -> tuple[McpConexao, str]:
    """Cria a conexão e o código de uso único; devolve a conexão e a URL de retorno. Não faz commit."""
    agora = _agora()
    conexao = McpConexao(usuario_id=usuario_id, cliente_id=cliente.id, criado_em=agora)
    db.add(conexao)
    db.flush()
    codigo = secrets.token_urlsafe(32)
    db.add(McpToken(
        conexao_id=conexao.id,
        tipo=TIPO_CODIGO,
        token_hash=hash_token(codigo),
        redirect_uri=pedido["ru"],
        code_challenge=pedido["cc"],
        criado_em=agora,
        expira_em=agora + VALIDADE_CODIGO,
    ))
    return conexao, url_retorno(pedido["ru"], {"code": codigo, "state": pedido.get("st")})


# ==================== Tokens ====================
def _consumir(db: Session, token: Optional[str], tipo: str):
    """Marca o token como usado de forma atômica; devolve a linha (conexao_id, redirect_uri, code_challenge)."""
    if not token:
        return None
    agora = datetime.utcnow()
    return db.execute(
        update(McpToken)
        .where(
            McpToken.token_hash == hash_token(token),
            McpToken.tipo == tipo,
            McpToken.usado_em.is_(None),
            McpToken.expira_em > agora,
        )
        .values(usado_em=agora)
        .returning(McpToken.conexao_id, McpToken.redirect_uri, McpToken.code_challenge)
        .execution_options(synchronize_session=False)
    ).first()


def _usuario_valido(usuario: Optional[UsuarioApp]) -> bool:
    return bool(usuario and usuario.ativo and usuario.acesso_proposal and not usuario.senha_pendente)


def _conexao_valida(db: Session, conexao_id) -> Optional[tuple[McpConexao, UsuarioApp]]:
    if not isinstance(conexao_id, int):
        return None
    conexao = db.get(McpConexao, conexao_id)
    if not conexao or conexao.revogada_em is not None:
        return None
    usuario = db.get(UsuarioApp, conexao.usuario_id)
    if not _usuario_valido(usuario):
        return None
    return conexao, usuario


def _emitir_tokens(db: Session, conexao: McpConexao, usuario: UsuarioApp, cliente: McpCliente) -> dict:
    agora = datetime.utcnow()
    acesso = jwt.encode(
        {
            "sub": usuario.usuario,
            "uid": usuario.id,
            "cx": conexao.id,
            "cid": cliente.client_id,
            "app": APP_MCP,
            "aud": settings.mcp_resource_url(),
            "iss": settings.mcp_base_url(),
            "iat": agora,
            "exp": agora + VALIDADE_ACESSO,
        },
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    refresh = secrets.token_urlsafe(32)
    db.add(McpToken(
        conexao_id=conexao.id,
        tipo=TIPO_REFRESH,
        token_hash=hash_token(refresh),
        criado_em=agora,
        expira_em=agora + VALIDADE_REFRESH,
    ))
    return {
        "access_token": acesso,
        "token_type": "Bearer",
        "expires_in": int(VALIDADE_ACESSO.total_seconds()),
        "refresh_token": refresh,
        "scope": ESCOPO,
    }


def trocar_codigo(
    db: Session, cliente: McpCliente, codigo: Optional[str], redirect_uri: Optional[str], verifier: Optional[str],
) -> dict:
    """grant_type=authorization_code. O código é consumido mesmo quando a troca falha. Não faz commit."""
    linha = _consumir(db, codigo, TIPO_CODIGO)
    if not linha:
        raise ErroOAuth("invalid_grant", "Código de autorização inválido, usado ou expirado")
    conexao = db.get(McpConexao, linha.conexao_id)
    if not conexao or conexao.cliente_id != cliente.id:
        raise ErroOAuth("invalid_grant", "Código de autorização emitido para outro cliente")
    if redirect_uri and redirect_uri != linha.redirect_uri:
        raise ErroOAuth("invalid_grant", "redirect_uri diferente do usado na autorização")
    if not pkce_valido(verifier, linha.code_challenge):
        raise ErroOAuth("invalid_grant", "code_verifier inválido")
    valida = _conexao_valida(db, conexao.id)
    if not valida:
        raise ErroOAuth("invalid_grant", "Usuário sem acesso ao Consultant Panel")
    agora = _agora()
    conexao.ativada_em = conexao.ativada_em or agora
    conexao.ultimo_uso_em = agora
    return _emitir_tokens(db, conexao, valida[1], cliente)


def renovar(db: Session, cliente: McpCliente, refresh: Optional[str]) -> dict:
    """grant_type=refresh_token com rotação; reapresentar um refresh já usado revoga a conexão. Não faz commit."""
    linha = _consumir(db, refresh, TIPO_REFRESH)
    if not linha:
        usado = (
            db.query(McpToken)
            .filter(McpToken.token_hash == hash_token(refresh or ""), McpToken.tipo == TIPO_REFRESH)
            .first()
        )
        if usado is not None and usado.usado_em is not None:
            conexao = db.get(McpConexao, usado.conexao_id)
            if conexao:
                revogar_conexao(conexao)
        raise ErroOAuth("invalid_grant", "Refresh token inválido, usado ou expirado")
    conexao = db.get(McpConexao, linha.conexao_id)
    if not conexao or conexao.cliente_id != cliente.id:
        raise ErroOAuth("invalid_grant", "Refresh token emitido para outro cliente")
    valida = _conexao_valida(db, conexao.id)
    if not valida:
        raise ErroOAuth("invalid_grant", "Conexão revogada ou usuário sem acesso ao Consultant Panel")
    conexao.ultimo_uso_em = _agora()
    return _emitir_tokens(db, conexao, valida[1], cliente)


def revogar_conexao(conexao: McpConexao) -> None:
    if conexao.revogada_em is None:
        conexao.revogada_em = _agora()


def revogar_por_token(db: Session, cliente: McpCliente, token: Optional[str]) -> None:
    """RFC 7009: aceita refresh token ou token de acesso; tokens desconhecidos são ignorados. Não faz commit."""
    if not token:
        return
    conexao_id = None
    linha = db.query(McpToken).filter(McpToken.token_hash == hash_token(token), McpToken.tipo == TIPO_REFRESH).first()
    if linha:
        conexao_id = linha.conexao_id
    else:
        try:
            dados = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM], audience=settings.mcp_resource_url(),
            )
            if dados.get("app") == APP_MCP and dados.get("cid") == cliente.client_id:
                conexao_id = dados.get("cx")
        except JWTError:
            return
    conexao = db.get(McpConexao, conexao_id) if isinstance(conexao_id, int) else None
    if conexao and conexao.cliente_id == cliente.id:
        revogar_conexao(conexao)


# ==================== Validação por chamada do MCP ====================
def validar_acesso(db: Session, token: str) -> Optional[dict]:
    """Usuário (mesmo formato de `get_proposal_user`) ou None. Pode atualizar `ultimo_uso_em`; o chamador faz commit."""
    try:
        dados = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM], audience=settings.mcp_resource_url(),
        )
    except JWTError:
        return None
    if dados.get("app") != APP_MCP or dados.get("aud") != settings.mcp_resource_url():
        return None
    valida = _conexao_valida(db, dados.get("cx"))
    if not valida:
        return None
    conexao, usuario = valida
    if usuario.id != dados.get("uid"):
        return None
    agora = _agora()
    if conexao.ultimo_uso_em is None or agora - conexao.ultimo_uso_em > INTERVALO_ULTIMO_USO:
        conexao.ultimo_uso_em = agora
    return {"id": usuario.id, "usuario": usuario.usuario, "papel": usuario.papel or "visualizador"}


# ==================== Conexões do usuário (Perfil) ====================
def conexoes_ativas(db: Session, usuario_id: int) -> list[McpConexao]:
    """Ativadas, não revogadas e com refresh ainda válido (sem 30 dias de inatividade)."""
    refresh_valido = exists().where(
        McpToken.conexao_id == McpConexao.id,
        McpToken.tipo == TIPO_REFRESH,
        McpToken.usado_em.is_(None),
        McpToken.expira_em > datetime.utcnow(),
    )
    return (
        db.query(McpConexao)
        .filter(
            McpConexao.usuario_id == usuario_id,
            McpConexao.ativada_em.isnot(None),
            McpConexao.revogada_em.is_(None),
            refresh_valido,
        )
        .order_by(McpConexao.criado_em.desc(), McpConexao.id.desc())
        .all()
    )
