from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import DH
from app.schemas import DHCreate, DHResponse
from app.api.routes.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[DHResponse])
def listar_dhs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    mes: int = Query(None),
    ano: int = Query(None),
    colaborador: str = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Listar DHs com filtros por período e colaborador"""
    from datetime import date
    
    query = db.query(DH)
    
    if mes and ano:
        # Filtrar por mês e ano
        query = query.filter(
            DH.data_envio >= date(ano, mes, 1),
            DH.data_envio < date(ano if mes < 12 else ano + 1, (mes % 12) + 1 if mes < 12 else 1, 1)
        )
    
    if colaborador:
        query = query.filter(DH.colaborador_preencheu.ilike(f"%{colaborador}%"))
    
    dhs = query.offset(skip).limit(limit).all()
    return dhs

@router.get("/{dh_id}", response_model=DHResponse)
def obter_dh(
    dh_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Obter um DH específico"""
    dh = db.query(DH).filter(DH.id == dh_id).first()
    if not dh:
        raise HTTPException(status_code=404, detail="DH não encontrado")
    return dh

@router.post("/", response_model=DHResponse, status_code=status.HTTP_201_CREATED)
def criar_dh(
    dh: DHCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Criar um novo DH"""
    # Gerar assunto automaticamente
    # Formato: DH :: nome da empresa :: posição :: Retainer | Sucesso | Parcela
    
    assunto = f"DH :: {dh.empresa} :: {dh.posicao} :: "
    nomes = {
        "retainer": "Retainer",
        "sucesso": "Sucesso",
        "parcelamento": "Parcela",
    }
    tf = (dh.tipo_fechamento or "").strip().lower()
    assunto += nomes.get(tf, tf or "Retainer")

    payload = dh.dict()
    payload["tipo_abertura_fechamento"] = None
    novo_dh = DH(**payload)
    novo_dh.assunto = assunto
    
    db.add(novo_dh)
    db.commit()
    db.refresh(novo_dh)
    
    # TODO: Enviar email para financeiro e CEO
    # from app.services.email_service import enviar_dh
    # enviar_dh(novo_dh)
    
    return novo_dh

@router.put("/{dh_id}/marcar-enviado")
def marcar_dh_enviado(
    dh_id: int,
    enviado_para: str = Query(..., description="'financeiro' ou 'ceo'"),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Marcar DH como enviado para financeiro ou CEO"""
    dh = db.query(DH).filter(DH.id == dh_id).first()
    if not dh:
        raise HTTPException(status_code=404, detail="DH não encontrado")
    
    if enviado_para == "financeiro":
        dh.enviado_financeiro = True
    elif enviado_para == "ceo":
        dh.enviado_ceo = True
    else:
        raise HTTPException(status_code=400, detail="Enviar para 'financeiro' ou 'ceo'")
    
    db.commit()
    db.refresh(dh)
    return dh

@router.delete("/{dh_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_dh(
    dh_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Deletar um DH"""
    dh = db.query(DH).filter(DH.id == dh_id).first()
    if not dh:
        raise HTTPException(status_code=404, detail="DH não encontrado")
    db.delete(dh)
    db.commit()
    return None
