from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.database import get_db
from app.models import HistoricoColaborador, Colaborador
from app.api.routes.auth import get_current_user, require_admin

router = APIRouter()


@router.get("/{colaborador_id}", status_code=status.HTTP_200_OK)
def listar_historico(
    colaborador_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    registros = (
        db.query(HistoricoColaborador)
        .filter(HistoricoColaborador.colaborador_id == colaborador_id)
        .order_by(HistoricoColaborador.data_inicio.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "cargo": r.cargo,
            "salario": r.salario,
            "data_inicio": str(r.data_inicio) if r.data_inicio else None,
            "data_fim": str(r.data_fim) if r.data_fim else None,
            "observacao": r.observacao,
            "criado_em": r.criado_em.isoformat() if r.criado_em else None,
        }
        for r in registros
    ]


@router.post("/{colaborador_id}", status_code=status.HTTP_201_CREATED)
def criar_historico(
    colaborador_id: int,
    dados: dict,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    colab = db.query(Colaborador).filter(Colaborador.id == colaborador_id).first()
    if not colab:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")

    registro = HistoricoColaborador(
        colaborador_id=colaborador_id,
        cargo=dados.get("cargo") or colab.cargo,
        salario=float(dados.get("salario") or colab.salario),
        data_inicio=date.fromisoformat(dados["data_inicio"]),
        data_fim=date.fromisoformat(dados["data_fim"]) if dados.get("data_fim") else None,
        observacao=dados.get("observacao"),
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return {
        "id": registro.id,
        "cargo": registro.cargo,
        "salario": registro.salario,
        "data_inicio": str(registro.data_inicio),
        "data_fim": str(registro.data_fim) if registro.data_fim else None,
        "observacao": registro.observacao,
    }


@router.delete("/{historico_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_historico(
    historico_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    registro = db.query(HistoricoColaborador).filter(HistoricoColaborador.id == historico_id).first()
    if not registro:
        raise HTTPException(status_code=404, detail="Registro não encontrado")
    db.delete(registro)
    db.commit()
    return None
