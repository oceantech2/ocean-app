"""Vagas do Consultant Panel (feature 102): todos veem e criam; editar/encerrar/excluir só autor ou admin."""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import case, func, or_
from sqlalchemy.orm import Session

from app.api.routes.proposal_auth import get_proposal_user
from app.database import get_db
from app.models import Candidatura, Vaga
from app.schemas import VagaIn
from app.services import anexo_nf
from app.services.audit import registrar_auditoria
from app.services.planilha_candidaturas import enviar
from app.services.vagas import (
    MSG_NAO_ENCONTRADA,
    STATUS_ABERTA,
    STATUS_ENCERRADA,
    exigir_alteracao,
    serializar_candidatura,
    serializar_painel,
    validar_vaga,
)

router = APIRouter()

MSG_COM_CANDIDATURAS = "Vaga com candidaturas não pode ser excluída. Encerre a vaga."
MSG_CANDIDATURA_NAO_ENCONTRADA = "Candidatura não encontrada"


def _agora() -> datetime:
    return datetime.utcnow().replace(microsecond=0)


def _contem(valor: str) -> str:
    escapado = valor.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return f"%{escapado}%"


def _obter(db: Session, vaga_id: int) -> Vaga:
    v = db.query(Vaga).filter(Vaga.id == vaga_id).first()
    if not v:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=MSG_NAO_ENCONTRADA)
    return v


def _contagens(db: Session, ids: list[int]) -> dict[int, tuple[int, int]]:
    if not ids:
        return {}
    linhas = (
        db.query(
            Candidatura.vaga_id,
            func.count(Candidatura.id),
            func.sum(case((Candidatura.planilha_enviada_em.is_(None), 1), else_=0)),
        )
        .filter(Candidatura.vaga_id.in_(ids))
        .group_by(Candidatura.vaga_id)
        .all()
    )
    return {vaga_id: (int(total), int(pendentes or 0)) for vaga_id, total, pendentes in linhas}


def _serializar(db: Session, v: Vaga, user: dict) -> dict:
    total, pendentes = _contagens(db, [v.id]).get(v.id, (0, 0))
    return serializar_painel(v, user, total, pendentes)


def _descricao(v: Vaga) -> str:
    return f"Vaga #{v.id} — {v.titulo}"


@router.get("/")
def listar_vagas(
    status_vaga: Optional[str] = Query(None, alias="status"),
    busca: Optional[str] = Query(None, max_length=120),
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    q = db.query(Vaga)
    if status_vaga:
        if status_vaga not in (STATUS_ABERTA, STATUS_ENCERRADA):
            raise HTTPException(status_code=422, detail="Status inválido")
        q = q.filter(Vaga.status == status_vaga)
    if busca and busca.strip():
        termo = _contem(busca.strip())
        q = q.filter(or_(Vaga.titulo.ilike(termo), Vaga.cliente.ilike(termo), Vaga.codigo_planilha.ilike(termo)))
    vagas = q.order_by(Vaga.criado_em.desc(), Vaga.id.desc()).all()
    contagens = _contagens(db, [v.id for v in vagas])
    itens = [serializar_painel(v, user, *contagens.get(v.id, (0, 0))) for v in vagas]
    return {"items": itens, "total": len(itens)}


@router.get("/candidaturas/{candidatura_id}/curriculo")
def abrir_curriculo(
    candidatura_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(get_proposal_user),
):
    c = db.query(Candidatura).filter(Candidatura.id == candidatura_id).first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=MSG_CANDIDATURA_NAO_ENCONTRADA)
    if not c.curriculo_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=anexo_nf.MSG_ARQUIVO_PERDIDO)
    return anexo_nf.resposta_inline(c.curriculo_path, c.curriculo_nome, f"curriculo_{c.id}")


@router.get("/{vaga_id}")
def obter_vaga(vaga_id: int, db: Session = Depends(get_db), user: dict = Depends(get_proposal_user)):
    return _serializar(db, _obter(db, vaga_id), user)


@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_vaga(payload: VagaIn, db: Session = Depends(get_db), user: dict = Depends(get_proposal_user)):
    v = Vaga(
        **validar_vaga(payload),
        status=STATUS_ABERTA,
        criado_por_id=user["id"],
        criado_por_usuario=user["usuario"],
        criado_em=_agora(),
    )
    db.add(v)
    db.flush()
    registrar_auditoria(db, user["usuario"], "criar", "Vaga", v.id, _descricao(v))
    db.commit()
    db.refresh(v)
    return _serializar(db, v, user)


@router.put("/{vaga_id}")
def editar_vaga(
    vaga_id: int,
    payload: VagaIn,
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    v = _obter(db, vaga_id)
    exigir_alteracao(v, user)
    for campo, valor in validar_vaga(payload).items():
        setattr(v, campo, valor)
    v.atualizado_por_usuario = user["usuario"]
    v.atualizado_em = _agora()
    registrar_auditoria(db, user["usuario"], "editar", "Vaga", v.id, _descricao(v))
    db.commit()
    db.refresh(v)
    return _serializar(db, v, user)


def _mudar_status(db: Session, vaga_id: int, user: dict, novo: str, acao: str) -> dict:
    v = _obter(db, vaga_id)
    exigir_alteracao(v, user)
    if v.status != novo:
        v.status = novo
        v.encerrada_em = _agora() if novo == STATUS_ENCERRADA else None
        v.atualizado_por_usuario = user["usuario"]
        v.atualizado_em = _agora()
        registrar_auditoria(db, user["usuario"], acao, "Vaga", v.id, _descricao(v))
        db.commit()
        db.refresh(v)
    return _serializar(db, v, user)


@router.post("/{vaga_id}/encerrar")
def encerrar_vaga(vaga_id: int, db: Session = Depends(get_db), user: dict = Depends(get_proposal_user)):
    return _mudar_status(db, vaga_id, user, STATUS_ENCERRADA, "encerrar")


@router.post("/{vaga_id}/reabrir")
def reabrir_vaga(vaga_id: int, db: Session = Depends(get_db), user: dict = Depends(get_proposal_user)):
    return _mudar_status(db, vaga_id, user, STATUS_ABERTA, "reabrir")


@router.delete("/{vaga_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_vaga(vaga_id: int, db: Session = Depends(get_db), user: dict = Depends(get_proposal_user)):
    v = _obter(db, vaga_id)
    exigir_alteracao(v, user)
    if db.query(Candidatura.id).filter(Candidatura.vaga_id == v.id).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=MSG_COM_CANDIDATURAS)
    registrar_auditoria(db, user["usuario"], "excluir", "Vaga", v.id, _descricao(v))
    db.delete(v)
    db.commit()
    return None


@router.get("/{vaga_id}/candidaturas")
def listar_candidaturas(vaga_id: int, db: Session = Depends(get_db), _: dict = Depends(get_proposal_user)):
    v = _obter(db, vaga_id)
    itens = (
        db.query(Candidatura)
        .filter(Candidatura.vaga_id == v.id)
        .order_by(Candidatura.criada_em.desc(), Candidatura.id.desc())
        .all()
    )
    return [serializar_candidatura(c) for c in itens]


@router.post("/{vaga_id}/reenviar-planilha")
def reenviar_planilha(vaga_id: int, db: Session = Depends(get_db), _: dict = Depends(get_proposal_user)):
    v = _obter(db, vaga_id)
    pendentes = (
        db.query(Candidatura)
        .filter(Candidatura.vaga_id == v.id, Candidatura.planilha_enviada_em.is_(None))
        .order_by(Candidatura.id)
        .all()
    )
    enviadas = 0
    for c in pendentes:
        if enviar(c):
            enviadas += 1
        db.commit()
    return {"enviadas": enviadas, "pendentes": len(pendentes) - enviadas}
