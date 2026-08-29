from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from passlib.context import CryptContext
from app.database import get_db
from app.models import UsuarioApp
from app.schemas import (
    UsuarioAppCreate,
    UsuarioAppUpdate,
    UsuarioAppResponse,
    PaginasVisibilidadeResponse,
    PaginasVisibilidadeUpdate,
)
from app.api.routes.auth import require_admin, get_current_user
from app.services.paginas_visibilidade import ler_paginas_visibilidade, salvar_paginas_visibilidade

router = APIRouter()
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")


@router.get("/paginas-visibilidade", response_model=PaginasVisibilidadeResponse)
def obter_paginas_visibilidade(
    db: Session = Depends(get_db),
    _: str = Depends(get_current_user),
):
    return {"paginas": ler_paginas_visibilidade(db)}


@router.put("/paginas-visibilidade", response_model=PaginasVisibilidadeResponse)
def atualizar_paginas_visibilidade(
    payload: PaginasVisibilidadeUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    paginas = salvar_paginas_visibilidade(db, payload.paginas)
    return {"paginas": paginas}


@router.get("/", response_model=List[UsuarioAppResponse])
def listar_usuarios(
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    return db.query(UsuarioApp).order_by(UsuarioApp.usuario).all()


@router.post("/", response_model=UsuarioAppResponse, status_code=status.HTTP_201_CREATED)
def criar_usuario(
    payload: UsuarioAppCreate,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    if db.query(UsuarioApp).filter(UsuarioApp.usuario == payload.usuario).first():
        raise HTTPException(status_code=400, detail="Usuário já existe")
    novo = UsuarioApp(
        usuario=payload.usuario,
        senha_hash=pwd_context.hash(payload.senha),
        papel=payload.papel,
        permissoes=payload.permissoes,
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo


@router.put("/{uid}", response_model=UsuarioAppResponse)
def atualizar_usuario(
    uid: int,
    payload: UsuarioAppUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    u = db.query(UsuarioApp).filter(UsuarioApp.id == uid).first()
    if not u:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if payload.senha is not None:
        u.senha_hash = pwd_context.hash(payload.senha)
    if payload.papel is not None:
        u.papel = payload.papel
    if payload.permissoes is not None:
        u.permissoes = payload.permissoes
    if payload.ativo is not None:
        u.ativo = payload.ativo
    db.commit()
    db.refresh(u)
    return u


@router.delete("/{uid}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_usuario(
    uid: int,
    db: Session = Depends(get_db),
    current_admin: str = Depends(require_admin),
):
    u = db.query(UsuarioApp).filter(UsuarioApp.id == uid).first()
    if not u:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if u.usuario == current_admin:
        raise HTTPException(status_code=400, detail="Não pode remover o próprio usuário")
    db.delete(u)
    db.commit()
    return None
