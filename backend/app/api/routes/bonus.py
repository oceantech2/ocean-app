from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.database import get_db
from app.models import Bonus, NF
from app.schemas import (
    BonusAcaoLoteRequest,
    BonusAcaoLoteResponse,
    BonusCreate,
    BonusResponse,
    BonusUpdate,
)
from app.api.routes.auth import get_current_user, require_admin
from app.services.audit import registrar_auditoria
from app.services.comissoes_sync import serializar_bonus

router = APIRouter()


def _query_visivel(db: Session):
    return (
        db.query(Bonus)
        .outerjoin(NF, Bonus.nf_id == NF.id)
        .options(joinedload(Bonus.nf))
        .filter((Bonus.nf_id.is_(None)) | (NF.excluida_em.is_(None)))
    )


@router.get("/", response_model=List[BonusResponse])
def listar_bonus(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    colaborador_id: int = Query(None),
    mes: int = Query(None),
    ano: int = Query(None),
    nf_id: int = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Listar comissões com filtros"""
    query = _query_visivel(db)

    if colaborador_id:
        query = query.filter(Bonus.colaborador_id == colaborador_id)
    if mes:
        query = query.filter(Bonus.mes == mes)
    if ano:
        query = query.filter(Bonus.ano == ano)
    if nf_id is not None:
        query = query.filter(Bonus.nf_id == nf_id)

    bonus = query.offset(skip).limit(limit).all()
    return [BonusResponse(**serializar_bonus(b)) for b in bonus]


@router.post("/acoes/liberar", response_model=BonusAcaoLoteResponse)
def liberar_lote(
    body: BonusAcaoLoteRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    processados = ignorados = 0
    hoje = date.today()
    for bid in body.ids:
        b = db.query(Bonus).filter(Bonus.id == bid).first()
        if not b or b.liberado:
            ignorados += 1
            continue
        b.liberado = True
        b.data_liberacao = hoje
        registrar_auditoria(db, current_user, "liberar", "Bonus", b.id, f"R$ {b.valor_bonus:,.2f}")
        processados += 1
    db.commit()
    return BonusAcaoLoteResponse(processados=processados, ignorados=ignorados)


@router.post("/acoes/pagar", response_model=BonusAcaoLoteResponse)
def pagar_lote(
    body: BonusAcaoLoteRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    processados = ignorados = 0
    hoje = date.today()
    for bid in body.ids:
        b = db.query(Bonus).filter(Bonus.id == bid).first()
        if not b or not b.liberado or b.pago:
            ignorados += 1
            continue
        b.pago = True
        b.data_pagamento = hoje
        registrar_auditoria(db, current_user, "pagar", "Bonus", b.id, f"R$ {b.valor_bonus:,.2f}")
        processados += 1
    db.commit()
    return BonusAcaoLoteResponse(processados=processados, ignorados=ignorados)


@router.get("/{bonus_id}", response_model=BonusResponse)
def obter_bonus(
    bonus_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    bonus = _query_visivel(db).filter(Bonus.id == bonus_id).first()
    if not bonus:
        raise HTTPException(status_code=404, detail="Comissão não encontrada")
    return BonusResponse(**serializar_bonus(bonus))


@router.post("/", response_model=BonusResponse, status_code=status.HTTP_201_CREATED)
def criar_bonus(
    bonus: BonusCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Criar comissão avulsa (import CSV legado)"""
    novo_bonus = Bonus(**bonus.dict())
    db.add(novo_bonus)
    db.flush()
    registrar_auditoria(db, current_user, "criar", "Bonus", novo_bonus.id, f"Colaborador {novo_bonus.colaborador_id} — R$ {novo_bonus.valor_bonus:,.2f}")
    db.commit()
    db.refresh(novo_bonus)
    return BonusResponse(**serializar_bonus(novo_bonus))


@router.post("/{bonus_id}/liberar", response_model=BonusResponse)
def liberar_bonus(
    bonus_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    db_bonus = db.query(Bonus).filter(Bonus.id == bonus_id).first()
    if not db_bonus:
        raise HTTPException(status_code=404, detail="Comissão não encontrada")
    if db_bonus.liberado:
        raise HTTPException(status_code=422, detail="Comissão já liberada")
    db_bonus.liberado = True
    db_bonus.data_liberacao = date.today()
    registrar_auditoria(db, current_user, "liberar", "Bonus", db_bonus.id, f"R$ {db_bonus.valor_bonus:,.2f}")
    db.commit()
    db.refresh(db_bonus)
    return BonusResponse(**serializar_bonus(db_bonus))


@router.post("/{bonus_id}/pagar", response_model=BonusResponse)
def pagar_bonus(
    bonus_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    db_bonus = db.query(Bonus).filter(Bonus.id == bonus_id).first()
    if not db_bonus:
        raise HTTPException(status_code=404, detail="Comissão não encontrada")
    if not db_bonus.liberado:
        raise HTTPException(status_code=422, detail="Comissão deve estar liberada antes de pagar")
    if db_bonus.pago:
        raise HTTPException(status_code=422, detail="Comissão já paga")
    db_bonus.pago = True
    db_bonus.data_pagamento = date.today()
    registrar_auditoria(db, current_user, "pagar", "Bonus", db_bonus.id, f"R$ {db_bonus.valor_bonus:,.2f}")
    db.commit()
    db.refresh(db_bonus)
    return BonusResponse(**serializar_bonus(db_bonus))


@router.put("/{bonus_id}", response_model=BonusResponse)
def atualizar_bonus(
    bonus_id: int,
    bonus_update: BonusUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Atualizar comissão (legado / import)"""
    db_bonus = db.query(Bonus).filter(Bonus.id == bonus_id).first()
    if not db_bonus:
        raise HTTPException(status_code=404, detail="Comissão não encontrada")

    dados = bonus_update.dict(exclude_unset=True)
    for campo, valor in dados.items():
        setattr(db_bonus, campo, valor)

    registrar_auditoria(db, current_user, "editar", "Bonus", db_bonus.id, f"Colaborador {db_bonus.colaborador_id} — campos: {', '.join(dados.keys())}")
    db.commit()
    db.refresh(db_bonus)
    return BonusResponse(**serializar_bonus(db_bonus))


@router.delete("/{bonus_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_bonus(
    bonus_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Deletar comissão (API legado; UI não expõe)"""
    db_bonus = db.query(Bonus).filter(Bonus.id == bonus_id).first()
    if not db_bonus:
        raise HTTPException(status_code=404, detail="Comissão não encontrada")
    registrar_auditoria(db, current_user, "deletar", "Bonus", db_bonus.id, f"Colaborador {db_bonus.colaborador_id} — R$ {db_bonus.valor_bonus:,.2f}")
    db.delete(db_bonus)
    db.commit()
    return None
