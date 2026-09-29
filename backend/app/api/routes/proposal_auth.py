from datetime import timedelta

from fastapi import APIRouter, Depends, Form, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
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

router = APIRouter()

oauth2_proposal = OAuth2PasswordBearer(tokenUrl="/api/proposal/auth/token")

MSG_SEM_ACESSO = "Usuário sem acesso ao Proposal"


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


@router.post("/token")
def login_proposal(
    form_data: OAuth2PasswordRequestForm = Depends(),
    totp_code: str = Form(None),
    db: Session = Depends(get_db),
):
    """Login do Proposal: só usuários cadastrados, ativos e com acesso ao Proposal."""
    usuario = db.query(UsuarioApp).filter(
        UsuarioApp.usuario == form_data.username,
        UsuarioApp.ativo == True,  # noqa: E712
    ).first()
    if not usuario or not pwd_context.verify(form_data.password, usuario.senha_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário ou senha incorretos")

    verificar_2fa(db, usuario.usuario, totp_code)

    if not usuario.acesso_proposal:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=MSG_SEM_ACESSO)

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


@router.get("/me")
def me_proposal(user: dict = Depends(get_proposal_user)):
    return {"usuario": user["usuario"], "papel": user["papel"]}
