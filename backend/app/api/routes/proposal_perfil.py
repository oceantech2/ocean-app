from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.routes.proposal_auth import get_proposal_user
from app.database import get_db
from app.models import PerfilConsultor
from app.schemas import PerfilConsultorIn
from app.services.proposta_modelos import validar_contato
from app.services.propostas import _iso

router = APIRouter()


def _serializar(perfil) -> dict:
    if perfil is None:
        return {"nome": None, "cargo": None, "telefone": None, "email": None, "atualizado_em": None}
    return {
        "nome": perfil.nome,
        "cargo": perfil.cargo,
        "telefone": perfil.telefone,
        "email": perfil.email,
        "atualizado_em": _iso(perfil.atualizado_em),
    }


@router.get("")
def obter_perfil(db: Session = Depends(get_db), user: dict = Depends(get_proposal_user)):
    return _serializar(db.get(PerfilConsultor, user["id"]))


@router.put("")
def salvar_perfil(
    payload: PerfilConsultorIn,
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    dados = validar_contato(payload.nome, payload.cargo, payload.telefone, payload.email, obrigatorio=False)
    perfil = db.get(PerfilConsultor, user["id"])
    if perfil is None:
        perfil = PerfilConsultor(usuario_id=user["id"])
        db.add(perfil)
    for campo, valor in dados.items():
        setattr(perfil, campo, valor)
    db.commit()
    db.refresh(perfil)
    return _serializar(perfil)
