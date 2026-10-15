from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import pyotp
from app.database import get_db
from app.config import settings
from app.models import UsuarioAuth, UsuarioApp
from app.services.acesso_proposal import TIPO_SSO, emitir_token, normalizar_login
from app.services.paginas_visibilidade import ler_paginas_visibilidade

router = APIRouter()

pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _decode_token(token: str) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("sub") is None:
            raise credentials_exception
        return payload
    except JWTError:
        raise credentials_exception


APP_ERP = "erp"
APP_PROPOSAL = "proposal"
_MSG_TOKEN_APP = {
    APP_ERP: "Token não autorizado para o ERP",
    APP_PROPOSAL: "Token não autorizado para o Proposal",
}


def _exigir_app(payload: dict, app: str) -> dict:
    """Tokens emitidos antes da claim `app` existir valem só como ERP."""
    if payload.get("app", APP_ERP) != app:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=_MSG_TOKEN_APP[app])
    return payload


def _decode_erp(token: str) -> dict:
    return _exigir_app(_decode_token(token), APP_ERP)


def _usuario_erp(token: str, db: Session) -> UsuarioApp:
    """Reconfere no banco a cada requisição: exclusão, desativação e mudança de papel valem na hora."""
    payload = _decode_erp(token)
    usuario = db.query(UsuarioApp).filter(UsuarioApp.usuario == payload.get("sub")).first()
    if not usuario or not usuario.ativo or not usuario.acesso_erp or usuario.senha_pendente:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não foi possível validar as credenciais",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return usuario


def require_erp(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> str:
    """Dependency aplicada a todos os routers do ERP: recusa tokens de outras ferramentas."""
    return _usuario_erp(token, db).usuario


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> str:
    return _usuario_erp(token, db).usuario


def get_current_papel(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> str:
    return _usuario_erp(token, db).papel or "visualizador"


def require_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> str:
    """Dependency que exige papel admin."""
    usuario = _usuario_erp(token, db)
    if usuario.papel != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ação permitida apenas para administradores",
        )
    return usuario.usuario


def _get_auth(db: Session, usuario: str) -> Optional[UsuarioAuth]:
    return db.query(UsuarioAuth).filter(UsuarioAuth.usuario == usuario).first()


def verificar_2fa(db: Session, usuario: str, totp_code: Optional[str]) -> Optional[UsuarioAuth]:
    """Exige o código TOTP quando o 2FA do usuário está ativo."""
    auth = _get_auth(db, usuario)
    if auth and auth.twofa_ativo and auth.totp_secret:
        if not totp_code:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="2FA_REQUIRED")
        if not pyotp.TOTP(auth.totp_secret).verify(totp_code, valid_window=1):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Código 2FA inválido")
    return auth


@router.post("/token")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    totp_code: str = Form(None),
    db: Session = Depends(get_db),
):
    """Login com usuário e senha: só usuários cadastrados, ativos e com senha própria definida."""
    usuario_db = db.query(UsuarioApp).filter(
        UsuarioApp.usuario == normalizar_login(form_data.username),
        UsuarioApp.ativo == True,  # noqa: E712
    ).first()
    if (
        not usuario_db
        or usuario_db.senha_pendente
        or not pwd_context.verify(form_data.password, usuario_db.senha_hash)
    ):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário ou senha incorretos")

    auth = verificar_2fa(db, usuario_db.usuario, totp_code)

    if not usuario_db.acesso_erp:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuário sem acesso ao ERP")

    papel = usuario_db.papel or "visualizador"
    access_token = create_access_token(
        data={"sub": usuario_db.usuario, "papel": papel, "app": APP_ERP},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": usuario_db.usuario,
        "papel": papel,
        "twofa_ativo": bool(auth and auth.twofa_ativo),
        "permissoes": usuario_db.permissoes,
        "paginas_visibilidade": ler_paginas_visibilidade(db),
        "acesso_proposal": bool(usuario_db.acesso_proposal),
    }


@router.get("/me")
def read_users_me(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Retorna informações do usuário autenticado"""
    usuario_db = _usuario_erp(token, db)
    auth = _get_auth(db, usuario_db.usuario)
    return {
        "usuario": usuario_db.usuario,
        "papel": usuario_db.papel or "visualizador",
        "twofa_ativo": bool(auth and auth.twofa_ativo),
        "permissoes": usuario_db.permissoes,
        "paginas_visibilidade": ler_paginas_visibilidade(db),
        "acesso_proposal": bool(usuario_db.acesso_proposal),
    }


@router.post("/proposal-sso")
def emitir_proposal_sso(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Código de uso único e curta duração para abrir o Proposal já autenticado."""
    usuario_db = db.query(UsuarioApp).filter(UsuarioApp.usuario == current_user).first()
    if not usuario_db or not usuario_db.ativo or not usuario_db.acesso_proposal:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuário sem acesso ao Proposal")
    codigo, expira = emitir_token(db, usuario_db.id, TIPO_SSO)
    db.commit()
    return {"codigo": codigo, "expira_em": expira.replace(microsecond=0).isoformat() + "Z"}


# ==================== 2FA ====================
@router.get("/2fa/status")
async def status_2fa(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    auth = _get_auth(db, current_user)
    return {"twofa_ativo": bool(auth and auth.twofa_ativo)}


@router.post("/2fa/setup")
async def setup_2fa(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Gera (ou regenera) um segredo TOTP e devolve o URI para QR code.
    O 2FA só fica ativo após confirmação via /2fa/ativar."""
    auth = _get_auth(db, current_user)
    secret = pyotp.random_base32()
    if auth:
        auth.totp_secret = secret
        auth.twofa_ativo = False
    else:
        auth = UsuarioAuth(usuario=current_user, totp_secret=secret, twofa_ativo=False)
        db.add(auth)
    db.commit()

    uri = pyotp.TOTP(secret).provisioning_uri(
        name=current_user, issuer_name="Ocean App"
    )
    return {"secret": secret, "otpauth_uri": uri}


@router.post("/2fa/ativar")
async def ativar_2fa(
    codigo: str = Form(...),
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Confirma o código do app autenticador e ativa o 2FA."""
    auth = _get_auth(db, current_user)
    if not auth or not auth.totp_secret:
        raise HTTPException(status_code=400, detail="Execute o setup primeiro")
    if not pyotp.TOTP(auth.totp_secret).verify(codigo, valid_window=1):
        raise HTTPException(status_code=400, detail="Código inválido")
    auth.twofa_ativo = True
    db.commit()
    return {"twofa_ativo": True}


@router.post("/2fa/desativar")
async def desativar_2fa(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    auth = _get_auth(db, current_user)
    if auth:
        auth.twofa_ativo = False
        auth.totp_secret = None
        db.commit()
    return {"twofa_ativo": False}
