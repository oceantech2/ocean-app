from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Saldo
from app.schemas import SaldoCreate, SaldoUpdate, SaldoResponse
from app.api.routes.auth import get_current_user
from app.services.audit import registrar_auditoria

router = APIRouter()


@router.get("/", response_model=List[SaldoResponse])
def listar_saldos(
    mes: int = Query(None),
    ano: int = Query(None),
    conta: str = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    query = db.query(Saldo)
    if mes is not None:
        query = query.filter(Saldo.mes == mes)
    if ano is not None:
        query = query.filter(Saldo.ano == ano)
    if conta:
        query = query.filter(Saldo.conta == conta)
    return query.order_by(Saldo.ano.desc(), Saldo.mes.desc()).all()


@router.post("/", response_model=SaldoResponse, status_code=status.HTTP_201_CREATED)
def criar_saldo(
    saldo: SaldoCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    # upsert: se já existe registro para mes/ano/conta, atualiza
    existente = db.query(Saldo).filter(
        Saldo.mes == saldo.mes, Saldo.ano == saldo.ano, Saldo.conta == saldo.conta
    ).first()
    if existente:
        existente.saldo = saldo.saldo
        existente.data_registro = saldo.data_registro
        db.commit()
        db.refresh(existente)
        return existente

    novo = Saldo(**saldo.dict())
    db.add(novo)
    db.flush()
    registrar_auditoria(db, current_user, "criar", "Saldo", novo.id,
                        f"Conta {saldo.conta} — {saldo.mes}/{saldo.ano}")
    db.commit()
    db.refresh(novo)
    return novo


@router.put("/{saldo_id}", response_model=SaldoResponse)
def atualizar_saldo(
    saldo_id: int,
    dados: SaldoUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    saldo = db.query(Saldo).filter(Saldo.id == saldo_id).first()
    if not saldo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saldo não encontrado")
    for campo, valor in dados.dict(exclude_none=True).items():
        setattr(saldo, campo, valor)
    registrar_auditoria(db, current_user, "editar", "Saldo", saldo_id, f"Conta {saldo.conta}")
    db.commit()
    db.refresh(saldo)
    return saldo


@router.delete("/{saldo_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_saldo(
    saldo_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    saldo = db.query(Saldo).filter(Saldo.id == saldo_id).first()
    if not saldo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saldo não encontrado")
    registrar_auditoria(db, current_user, "deletar", "Saldo", saldo_id, f"Conta {saldo.conta}")
    db.delete(saldo)
    db.commit()
