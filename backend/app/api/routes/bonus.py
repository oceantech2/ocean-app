from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Bonus
from app.schemas import BonusCreate, BonusResponse, BonusUpdate
from app.api.routes.auth import get_current_user
from app.services.audit import registrar_auditoria

router = APIRouter()

@router.get("/", response_model=List[BonusResponse])
def listar_bonus(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    colaborador_id: int = Query(None),
    mes: int = Query(None),
    ano: int = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Listar bônus com filtros"""
    query = db.query(Bonus)
    
    if colaborador_id:
        query = query.filter(Bonus.colaborador_id == colaborador_id)
    if mes:
        query = query.filter(Bonus.mes == mes)
    if ano:
        query = query.filter(Bonus.ano == ano)
    
    bonus = query.offset(skip).limit(limit).all()
    return bonus

@router.get("/{bonus_id}", response_model=BonusResponse)
def obter_bonus(
    bonus_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Obter um bônus específico"""
    bonus = db.query(Bonus).filter(Bonus.id == bonus_id).first()
    if not bonus:
        raise HTTPException(status_code=404, detail="Bônus não encontrado")
    return bonus

@router.post("/", response_model=BonusResponse, status_code=status.HTTP_201_CREATED)
def criar_bonus(
    bonus: BonusCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Criar um novo bônus"""
    novo_bonus = Bonus(**bonus.dict())
    db.add(novo_bonus)
    db.flush()
    registrar_auditoria(db, current_user, "criar", "Bonus", novo_bonus.id, f"Colaborador {novo_bonus.colaborador_id} — R$ {novo_bonus.valor_bonus:,.2f}")
    db.commit()
    db.refresh(novo_bonus)
    return novo_bonus

@router.put("/{bonus_id}", response_model=BonusResponse)
def atualizar_bonus(
    bonus_id: int,
    bonus_update: BonusUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Atualizar um bônus"""
    db_bonus = db.query(Bonus).filter(Bonus.id == bonus_id).first()
    if not db_bonus:
        raise HTTPException(status_code=404, detail="Bônus não encontrado")
    
    dados = bonus_update.dict(exclude_unset=True)
    for campo, valor in dados.items():
        setattr(db_bonus, campo, valor)

    registrar_auditoria(db, current_user, "editar", "Bonus", db_bonus.id, f"Colaborador {db_bonus.colaborador_id} — campos: {', '.join(dados.keys())}")
    db.commit()
    db.refresh(db_bonus)
    return db_bonus

@router.delete("/{bonus_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_bonus(
    bonus_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Deletar um bônus"""
    db_bonus = db.query(Bonus).filter(Bonus.id == bonus_id).first()
    if not db_bonus:
        raise HTTPException(status_code=404, detail="Bônus não encontrado")
    registrar_auditoria(db, current_user, "deletar", "Bonus", db_bonus.id, f"Colaborador {db_bonus.colaborador_id} — R$ {db_bonus.valor_bonus:,.2f}")
    db.delete(db_bonus)
    db.commit()
    return None
