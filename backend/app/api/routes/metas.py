from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models import MetaFinanceira, NF, StatusNF
from app.api.routes.auth import get_current_user
from app.services.audit import registrar_auditoria

router = APIRouter()


class MetaInput(BaseModel):
    mes: int
    ano: int
    valor_meta: float


@router.get("/")
def listar_metas(
    ano: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    query = db.query(MetaFinanceira)
    if ano:
        query = query.filter(MetaFinanceira.ano == ano)
    metas = query.order_by(MetaFinanceira.ano, MetaFinanceira.mes).all()
    return [
        {"id": m.id, "mes": m.mes, "ano": m.ano, "valor_meta": m.valor_meta}
        for m in metas
    ]


@router.get("/progresso")
def progresso_meta(
    mes: int = Query(...),
    ano: int = Query(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Compara a meta com o faturamento líquido pago realizado.
    mes=0 significa meta anual (soma todos os meses do ano)."""
    from sqlalchemy import extract
    meta = (
        db.query(MetaFinanceira)
        .filter(MetaFinanceira.mes == mes, MetaFinanceira.ano == ano)
        .first()
    )
    valor_meta = meta.valor_meta if meta else 0.0

    if mes == 0:
        nfs = (
            db.query(NF)
            .filter(
                NF.status == StatusNF.PAGA,
                NF.excluida_em.is_(None),
                extract("year", NF.data_emissao) == ano,
            )
            .all()
        )
    else:
        nfs = (
            db.query(NF)
            .filter(
                NF.status == StatusNF.PAGA,
                NF.excluida_em.is_(None),
                extract("month", NF.data_emissao) == mes,
                extract("year", NF.data_emissao) == ano,
            )
            .all()
        )
    realizado = sum(n.valor_liquido for n in nfs)
    percentual = (realizado / valor_meta * 100) if valor_meta > 0 else 0

    return {
        "mes": mes,
        "ano": ano,
        "valor_meta": valor_meta,
        "realizado": realizado,
        "percentual": round(percentual, 1),
        "tem_meta": meta is not None,
    }


@router.put("/")
def definir_meta(
    dados: MetaInput,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Cria ou atualiza a meta do mês/ano (upsert)."""
    meta = (
        db.query(MetaFinanceira)
        .filter(MetaFinanceira.mes == dados.mes, MetaFinanceira.ano == dados.ano)
        .first()
    )
    if meta:
        meta.valor_meta = dados.valor_meta
        acao = "editar"
    else:
        meta = MetaFinanceira(mes=dados.mes, ano=dados.ano, valor_meta=dados.valor_meta)
        db.add(meta)
        acao = "criar"

    registrar_auditoria(
        db, current_user, acao, "MetaFinanceira", None,
        f"Meta {dados.mes:02d}/{dados.ano}: R$ {dados.valor_meta:,.2f}",
    )
    db.commit()
    db.refresh(meta)
    return {"id": meta.id, "mes": meta.mes, "ano": meta.ano, "valor_meta": meta.valor_meta}
