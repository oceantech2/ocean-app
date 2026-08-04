from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Ferias
from app.schemas import FeriasCreate, FeriasResponse, FeriasUpdate
from app.api.routes.auth import get_current_user
from app.services.audit import registrar_auditoria

router = APIRouter()

@router.get("/", response_model=List[FeriasResponse])
def listar_ferias(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    colaborador_id: int = Query(None),
    ano: int = Query(None),
    aprovado: bool = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Listar férias com filtros"""
    query = db.query(Ferias)
    
    if colaborador_id:
        query = query.filter(Ferias.colaborador_id == colaborador_id)
    if ano:
        query = query.filter(Ferias.ano == ano)
    if aprovado is not None:
        query = query.filter(Ferias.aprovado == aprovado)
    
    ferias = query.offset(skip).limit(limit).all()
    return ferias

@router.get("/{ferias_id}", response_model=FeriasResponse)
def obter_ferias(
    ferias_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Obter um registro de férias específico"""
    ferias = db.query(Ferias).filter(Ferias.id == ferias_id).first()
    if not ferias:
        raise HTTPException(status_code=404, detail="Férias não encontradas")
    return ferias

@router.post("/", response_model=FeriasResponse, status_code=status.HTTP_201_CREATED)
def criar_ferias(
    ferias: FeriasCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Criar um novo registro de férias"""
    novas_ferias = Ferias(**ferias.dict())
    db.add(novas_ferias)
    db.flush()
    registrar_auditoria(db, current_user, "criar", "Ferias", novas_ferias.id, f"Colaborador {novas_ferias.colaborador_id} — {novas_ferias.ano}")
    db.commit()
    db.refresh(novas_ferias)
    return novas_ferias

@router.put("/{ferias_id}", response_model=FeriasResponse)
def atualizar_ferias(
    ferias_id: int,
    ferias_update: FeriasUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Atualizar férias"""
    db_ferias = db.query(Ferias).filter(Ferias.id == ferias_id).first()
    if not db_ferias:
        raise HTTPException(status_code=404, detail="Férias não encontradas")
    
    dados = ferias_update.dict(exclude_unset=True)
    for campo, valor in dados.items():
        setattr(db_ferias, campo, valor)

    if "aprovado" in dados:
        desc = "aprovou" if dados["aprovado"] else "rejeitou"
    else:
        desc = f"campos: {', '.join(dados.keys())}"
    registrar_auditoria(db, current_user, "editar", "Ferias", db_ferias.id, f"Colaborador {db_ferias.colaborador_id} — {desc}")
    db.commit()
    db.refresh(db_ferias)
    return db_ferias

@router.delete("/{ferias_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_ferias(
    ferias_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Deletar um registro de férias"""
    db_ferias = db.query(Ferias).filter(Ferias.id == ferias_id).first()
    if not db_ferias:
        raise HTTPException(status_code=404, detail="Férias não encontradas")
    registrar_auditoria(db, current_user, "deletar", "Ferias", db_ferias.id, f"Colaborador {db_ferias.colaborador_id} — {db_ferias.ano}")
    db.delete(db_ferias)
    db.commit()
    return None
