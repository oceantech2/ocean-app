"""Liberação de acesso ao Proposal para fornecedores (feature 088). Somente admin do ERP."""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.routes.auth import require_admin
from app.database import get_db
from app.models import Colaborador, UsuarioApp
from app.services.acesso_proposal import (
    MOTIVO_NAO_ENCONTRADO,
    STATUS_SEM_ACESSO,
    gerar_convite,
    liberar_fornecedor,
    revogar_acesso_fornecedor,
    status_acessos,
)
from app.services.audit import registrar_auditoria

router = APIRouter()


def _iso(dt: Optional[datetime]) -> Optional[str]:
    return None if dt is None else dt.replace(microsecond=0).isoformat() + "Z"


class LiberarIn(BaseModel):
    fornecedor_ids: List[int] = Field(..., min_length=1, max_length=200)


def _fornecedor(db: Session, fornecedor_id: int) -> Colaborador:
    fornecedor = db.query(Colaborador).filter(Colaborador.id == fornecedor_id).first()
    if not fornecedor:
        raise HTTPException(status_code=404, detail=MOTIVO_NAO_ENCONTRADO)
    return fornecedor


@router.get("/")
def listar_acessos(db: Session = Depends(get_db), _: str = Depends(require_admin)):
    return [{**item, "convite_expira_em": _iso(item["convite_expira_em"])} for item in status_acessos(db)]


@router.post("/liberar")
def liberar(payload: LiberarIn, db: Session = Depends(get_db), admin: str = Depends(require_admin)):
    resultados = []
    for fornecedor_id in dict.fromkeys(payload.fornecedor_ids):
        r = liberar_fornecedor(db, fornecedor_id)
        if r["resultado"] != "ignorado":
            registrar_auditoria(
                db, admin, "editar", "Colaborador", fornecedor_id,
                f"{r['nome']} — acesso ao Proposal liberado ({r['resultado']})",
            )
        if "expira_em" in r:
            r["expira_em"] = _iso(r["expira_em"])
        resultados.append(r)
    db.commit()
    return {"resultados": resultados}


@router.post("/{fornecedor_id}/convite")
def novo_convite(fornecedor_id: int, db: Session = Depends(get_db), admin: str = Depends(require_admin)):
    fornecedor = _fornecedor(db, fornecedor_id)
    usuario = db.query(UsuarioApp).filter(UsuarioApp.fornecedor_id == fornecedor.id).first()
    if not fornecedor.ativo or not usuario or not usuario.acesso_proposal:
        raise HTTPException(status_code=400, detail="Libere o acesso antes de gerar um convite")
    token, expira = gerar_convite(db, usuario)
    registrar_auditoria(db, admin, "editar", "Colaborador", fornecedor.id, f"{fornecedor.nome} — novo convite do Proposal")
    db.commit()
    return {"token": token, "expira_em": _iso(expira), "usuario": usuario.usuario}


@router.post("/{fornecedor_id}/revogar")
def revogar(fornecedor_id: int, db: Session = Depends(get_db), admin: str = Depends(require_admin)):
    fornecedor = _fornecedor(db, fornecedor_id)
    revogar_acesso_fornecedor(db, fornecedor.id)
    registrar_auditoria(db, admin, "editar", "Colaborador", fornecedor.id, f"{fornecedor.nome} — acesso ao Proposal revogado")
    db.commit()
    return {"status": STATUS_SEM_ACESSO}
