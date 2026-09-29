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
from app.services.paginas_visibilidade import ler_paginas_visibilidade

router = APIRouter()

pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Usuários padrão de fallback (usados quando DB não tem usuário cadastrado)
USUARIOS_DEV = {
    "admin": {"senha": "123456", "papel": "admin"},
    "visualizador": {"senha": "123456", "papel": "visualizador"},
}

# Permissões padrão para admin
PERMISSOES_ADMIN = '{"dashboard":true,"nfs":true,"colaboradores":true,"contas":true,"bonus":true,"ferias":true,"dh":true,"relatorios":true}'


def seed_usuarios_default(db: Session):
    """Garante que os usuários padrão existam no banco."""
    for usuario, dados in USUARIOS_DEV.items():
        if not db.query(UsuarioApp).filter(UsuarioApp.usuario == usuario).first():
            perms = PERMISSOES_ADMIN if dados["papel"] == "admin" else '{"dashboard":true,"nfs":false,"colaboradores":false,"contas":false,"bonus":false,"ferias":false,"dh":false,"relatorios":false}'
            db.add(UsuarioApp(
                usuario=usuario,
                senha_hash=pwd_context.hash(dados["senha"]),
                papel=dados["papel"],
                permissoes=perms,
            ))
    db.commit()


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


def require_erp(token: str = Depends(oauth2_scheme)) -> str:
    """Dependency aplicada a todos os routers do ERP: recusa tokens de outras ferramentas."""
    return _decode_erp(token).get("sub")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    return _decode_erp(token).get("sub")


async def get_current_papel(token: str = Depends(oauth2_scheme)) -> str:
    return _decode_erp(token).get("papel", "visualizador")


def require_admin(token: str = Depends(oauth2_scheme)) -> str:
    """Dependency que exige papel admin."""
    payload = _decode_erp(token)
    if payload.get("papel") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ação permitida apenas para administradores",
        )
    return payload.get("sub")


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
    """Login com usuário e senha. Verifica banco primeiro, fallback nos USUARIOS_DEV."""
    seed_usuarios_default(db)

    # Busca usuário no banco
    usuario_db = db.query(UsuarioApp).filter(
        UsuarioApp.usuario == form_data.username,
        UsuarioApp.ativo == True,
    ).first()

    permissoes = None
    if usuario_db:
        if not pwd_context.verify(form_data.password, usuario_db.senha_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário ou senha incorretos")
        papel = usuario_db.papel
        permissoes = usuario_db.permissoes
    else:
        # fallback hardcoded
        usuario_dev = USUARIOS_DEV.get(form_data.username)
        if not usuario_dev or form_data.password != usuario_dev["senha"]:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário ou senha incorretos")
        papel = usuario_dev["papel"]
        permissoes = PERMISSOES_ADMIN if papel == "admin" else None

    auth = verificar_2fa(db, form_data.username, totp_code)

    if usuario_db and not usuario_db.acesso_erp:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuário sem acesso ao ERP")

    access_token = create_access_token(
        data={"sub": form_data.username, "papel": papel, "app": APP_ERP},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": form_data.username,
        "papel": papel,
        "twofa_ativo": bool(auth and auth.twofa_ativo),
        "permissoes": permissoes,
        "paginas_visibilidade": ler_paginas_visibilidade(db),
    }


@router.get("/me")
async def read_users_me(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Retorna informações do usuário autenticado"""
    payload = _decode_erp(token)
    username = payload.get("sub")
    auth = _get_auth(db, username)
    usuario_db = db.query(UsuarioApp).filter(UsuarioApp.usuario == username).first()
    permissoes = usuario_db.permissoes if usuario_db else None
    return {
        "usuario": username,
        "papel": payload.get("papel", "visualizador"),
        "twofa_ativo": bool(auth and auth.twofa_ativo),
        "permissoes": permissoes,
        "paginas_visibilidade": ler_paginas_visibilidade(db),
    }


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
