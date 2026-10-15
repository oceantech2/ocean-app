from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Form, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.routes.auth import (
    APP_PROPOSAL,
    _decode_token,
    _exigir_app,
    create_access_token,
    pwd_context,
    verificar_2fa,
)
from app.config import settings
from app.database import get_db
from app.models import UsuarioApp
from app.services.acesso_proposal import (
    TIPO_CONVITE,
    TIPO_SSO,
    consumir_token,
    invalidar_convites,
    normalizar_login,
    usuario_do_token,
)

router = APIRouter()

oauth2_proposal = OAuth2PasswordBearer(tokenUrl="/api/proposal/auth/token")

MSG_SEM_ACESSO = "Usuário sem acesso ao Proposal"
MSG_SSO_INVALIDO = "Link de acesso inválido ou expirado"
MSG_CONVITE_INVALIDO = "Convite inválido ou expirado. Peça um novo ao administrador."
SENHA_MINIMA = 8


def get_proposal_user(
    token: str = Depends(oauth2_proposal),
    db: Session = Depends(get_db),
) -> dict:
    """Aceita só tokens do Proposal e reconfere no banco a cada requisição (revogação imediata)."""
    payload = _exigir_app(_decode_token(token), APP_PROPOSAL)
    usuario = db.query(UsuarioApp).filter(UsuarioApp.usuario == payload.get("sub")).first()
    if not usuario or not usuario.ativo or not usuario.acesso_proposal:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=MSG_SEM_ACESSO)
    return {"id": usuario.id, "usuario": usuario.usuario, "papel": usuario.papel or "visualizador"}


oauth2_proposal_opcional = OAuth2PasswordBearer(tokenUrl="/api/proposal/auth/token", auto_error=False)


def get_proposal_user_opcional(
    token: Optional[str] = Depends(oauth2_proposal_opcional),
    db: Session = Depends(get_db),
) -> Optional[dict]:
    """Para rotas públicas: usuário do Proposal se o token for válido; nunca recusa a requisição."""
    if not token:
        return None
    try:
        return get_proposal_user(token, db)
    except HTTPException:
        return None


def _sessao(usuario: UsuarioApp) -> dict:
    papel = usuario.papel or "visualizador"
    access_token = create_access_token(
        data={"sub": usuario.usuario, "uid": usuario.id, "papel": papel, "app": APP_PROPOSAL},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": usuario.usuario,
        "papel": papel,
    }


@router.post("/token")
def login_proposal(
    form_data: OAuth2PasswordRequestForm = Depends(),
    totp_code: str = Form(None),
    db: Session = Depends(get_db),
):
    """Login do Proposal: só usuários cadastrados, ativos e com acesso ao Proposal."""
    usuario = db.query(UsuarioApp).filter(
        UsuarioApp.usuario == normalizar_login(form_data.username),
        UsuarioApp.ativo == True,  # noqa: E712
    ).first()
    if (
        not usuario
        or usuario.senha_pendente
        or not pwd_context.verify(form_data.password, usuario.senha_hash)
    ):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário ou senha incorretos")

    verificar_2fa(db, usuario.usuario, totp_code)

    if not usuario.acesso_proposal:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=MSG_SEM_ACESSO)

    return _sessao(usuario)


@router.get("/me")
def me_proposal(user: dict = Depends(get_proposal_user)):
    return {"usuario": user["usuario"], "papel": user["papel"]}


class SsoIn(BaseModel):
    codigo: str


@router.post("/sso")
def entrar_sso(payload: SsoIn, db: Session = Depends(get_db)):
    """Troca o código emitido pelo ERP por uma sessão do Proposal (uso único)."""
    usuario_id = consumir_token(db, payload.codigo.strip(), TIPO_SSO)
    db.commit()
    if usuario_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=MSG_SSO_INVALIDO)
    usuario = db.get(UsuarioApp, usuario_id)
    if not usuario or not usuario.ativo or not usuario.acesso_proposal:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=MSG_SEM_ACESSO)
    return _sessao(usuario)


class ConviteConsultaIn(BaseModel):
    token: str


class ConviteAceiteIn(BaseModel):
    token: str
    senha: str


def _usuario_convidado(db: Session, usuario_id: Optional[int]) -> UsuarioApp:
    usuario = db.get(UsuarioApp, usuario_id) if usuario_id is not None else None
    if not usuario or not usuario.ativo or not usuario.acesso_proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=MSG_CONVITE_INVALIDO)
    return usuario


@router.post("/convite/consultar")
def consultar_convite(payload: ConviteConsultaIn, db: Session = Depends(get_db)):
    usuario = _usuario_convidado(db, usuario_do_token(db, payload.token.strip(), TIPO_CONVITE))
    return {"usuario": usuario.usuario}


@router.post("/convite/aceitar")
def aceitar_convite(payload: ConviteAceiteIn, db: Session = Depends(get_db)):
    """O convidado define a própria senha; o convite é consumido e a sessão do Proposal é aberta."""
    token = payload.token.strip()
    _usuario_convidado(db, usuario_do_token(db, token, TIPO_CONVITE))
    if len(payload.senha) < SENHA_MINIMA:
        raise HTTPException(status_code=400, detail=f"A senha deve ter pelo menos {SENHA_MINIMA} caracteres")
    usuario = _usuario_convidado(db, consumir_token(db, token, TIPO_CONVITE))
    usuario.senha_hash = pwd_context.hash(payload.senha)
    usuario.senha_pendente = False
    invalidar_convites(db, usuario.id)
    db.commit()
    return _sessao(usuario)
