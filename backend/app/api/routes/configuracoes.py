from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from passlib.context import CryptContext
from app.database import get_db
from app.models import ImpostoProposta, UsuarioApp, UsuarioAuth
from app.schemas import (
    UsuarioAppCreate,
    UsuarioAppUpdate,
    UsuarioAppResponse,
    PaginasVisibilidadeResponse,
    PaginasVisibilidadeUpdate,
    LimiarAlertaFluxoResponse,
    LimiarAlertaFluxoPut,
    ImpostoPropostaIn,
    ImpostoPropostaOut,
)
from app.api.routes.auth import require_admin, get_current_user
from app.services.acesso_proposal import invalidar_convites, normalizar_login
from app.services.audit import registrar_auditoria
from app.services.paginas_visibilidade import ler_paginas_visibilidade, salvar_paginas_visibilidade
from app.services.limiar_alerta_fluxo import ler_limiar, salvar_limiar

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


@router.get("/limiar-alerta-fluxo", response_model=LimiarAlertaFluxoResponse)
def obter_limiar_alerta_fluxo(
    db: Session = Depends(get_db),
    _: str = Depends(get_current_user),
):
    return {"limiar_percentual": ler_limiar(db)}


@router.put("/limiar-alerta-fluxo", response_model=LimiarAlertaFluxoResponse)
def atualizar_limiar_alerta_fluxo(
    payload: LimiarAlertaFluxoPut,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    valor = salvar_limiar(db, payload.limiar_percentual)
    return {"limiar_percentual": valor}


@router.get("/imposto-proposta", response_model=List[ImpostoPropostaOut])
def listar_impostos_proposta(
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    return (
        db.query(ImpostoProposta)
        .order_by(ImpostoProposta.ano.desc(), ImpostoProposta.mes.desc())
        .all()
    )


@router.put("/imposto-proposta", response_model=ImpostoPropostaOut)
def salvar_imposto_proposta(
    payload: ImpostoPropostaIn,
    db: Session = Depends(get_db),
    current_admin: str = Depends(require_admin),
):
    registro = (
        db.query(ImpostoProposta)
        .filter(ImpostoProposta.ano == payload.ano, ImpostoProposta.mes == payload.mes)
        .first()
    )
    acao = "editar" if registro else "criar"
    if registro is None:
        registro = ImpostoProposta(ano=payload.ano, mes=payload.mes)
        db.add(registro)
    registro.percentual = payload.percentual
    registro.atualizado_em = datetime.utcnow()
    registro.atualizado_por = current_admin
    db.flush()
    registrar_auditoria(db, current_admin, acao, "ImpostoProposta", registro.id,
                        f"{payload.mes:02d}/{payload.ano} — {payload.percentual}%")
    db.commit()
    db.refresh(registro)
    return registro


@router.get("/", response_model=List[UsuarioAppResponse])
def listar_usuarios(
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    return db.query(UsuarioApp).order_by(UsuarioApp.usuario).all()


MSG_ERP_SEM_SENHA = (
    "Defina uma senha para liberar o acesso ao ERP "
    "(o usuário ainda não aceitou o convite do Proposal)"
)


def _ferramentas(acesso_erp: bool, acesso_proposal: bool) -> str:
    nomes = [n for n, ligado in (("ERP", acesso_erp), ("Proposal", acesso_proposal)) if ligado]
    return ", ".join(nomes) or "nenhuma"


@router.post("/", response_model=UsuarioAppResponse, status_code=status.HTTP_201_CREATED)
def criar_usuario(
    payload: UsuarioAppCreate,
    db: Session = Depends(get_db),
    current_admin: str = Depends(require_admin),
):
    login = normalizar_login(payload.usuario)
    if not login:
        raise HTTPException(status_code=400, detail="Usuário obrigatório")
    if db.query(UsuarioApp).filter(UsuarioApp.usuario == login).first():
        raise HTTPException(status_code=400, detail="Usuário já existe")
    novo = UsuarioApp(
        usuario=login,
        senha_hash=pwd_context.hash(payload.senha),
        papel=payload.papel,
        permissoes=payload.permissoes,
        acesso_erp=payload.acesso_erp,
        acesso_proposal=payload.acesso_proposal,
        senha_pendente=False,
    )
    db.add(novo)
    db.flush()
    registrar_auditoria(
        db, current_admin, "criar", "UsuarioApp", novo.id,
        f"{login} — papel {novo.papel}; ferramentas: {_ferramentas(novo.acesso_erp, novo.acesso_proposal)}",
    )
    db.commit()
    db.refresh(novo)
    return novo


@router.put("/{uid}", response_model=UsuarioAppResponse)
def atualizar_usuario(
    uid: int,
    payload: UsuarioAppUpdate,
    db: Session = Depends(get_db),
    current_admin: str = Depends(require_admin),
):
    u = db.query(UsuarioApp).filter(UsuarioApp.id == uid).first()
    if not u:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if u.usuario == current_admin:
        if payload.acesso_erp is False:
            raise HTTPException(status_code=400, detail="Não pode remover o próprio acesso ao ERP")
        if payload.ativo is False:
            raise HTTPException(status_code=400, detail="Não pode desativar o próprio usuário")
    if payload.acesso_erp and u.senha_pendente and not payload.senha:
        raise HTTPException(status_code=400, detail=MSG_ERP_SEM_SENHA)

    alteracoes = []
    if payload.papel is not None and payload.papel != u.papel:
        alteracoes.append(f"papel {u.papel} → {payload.papel}")
        u.papel = payload.papel
    if payload.acesso_erp is not None and payload.acesso_erp != u.acesso_erp:
        alteracoes.append(f"ERP {'liberado' if payload.acesso_erp else 'removido'}")
        u.acesso_erp = payload.acesso_erp
    if payload.acesso_proposal is not None and payload.acesso_proposal != u.acesso_proposal:
        alteracoes.append(f"Proposal {'liberado' if payload.acesso_proposal else 'removido'}")
        u.acesso_proposal = payload.acesso_proposal
    if payload.permissoes is not None and payload.permissoes != u.permissoes:
        alteracoes.append("permissões de menu alteradas")
        u.permissoes = payload.permissoes
    if payload.ativo is not None and payload.ativo != u.ativo:
        alteracoes.append("reativado" if payload.ativo else "desativado")
        u.ativo = payload.ativo
    if payload.senha:
        alteracoes.append("senha redefinida")
        u.senha_hash = pwd_context.hash(payload.senha)
        u.senha_pendente = False
        invalidar_convites(db, u.id)
    if alteracoes:
        registrar_auditoria(db, current_admin, "editar", "UsuarioApp", u.id, f"{u.usuario} — {'; '.join(alteracoes)}")
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
    db.query(UsuarioAuth).filter(UsuarioAuth.usuario == u.usuario).delete(synchronize_session=False)
    registrar_auditoria(db, current_admin, "excluir", "UsuarioApp", u.id, f"{u.usuario} — usuário excluído")
    db.delete(u)
    db.commit()
    return None
