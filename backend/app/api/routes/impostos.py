from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from typing import List
from app.database import get_db
from app.models import Imposto, NF, StatusNF, ContaPagar
from app.schemas import ImpostoCreate, ImpostoUpdate, ImpostoResponse
from app.api.routes.auth import get_current_user
from app.services.audit import registrar_auditoria
from app.services.categorias_contas import CATEGORIA_IMPOSTOS

router = APIRouter()


def _recalcular_valor(faturamento: float, percentual: float, valor_informado: float | None) -> float:
    """Retorna valor_imposto calculado se percentual e faturamento disponíveis,
    caso contrário mantém o valor informado pelo usuário."""
    if faturamento and percentual:
        return round(faturamento * percentual / 100, 2)
    return valor_informado or 0.0


@router.get("/de-contas")
def impostos_de_contas(
    ano: int = Query(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Retorna valor de impostos por mês derivado de Contas a Pagar (categoria=impostos).
    Também inclui faturamento líquido das NFs pagas no mesmo período."""
    resultados = []
    for mes in range(1, 13):
        valor_imposto = db.query(func.sum(ContaPagar.valor)).filter(
            ContaPagar.categoria == CATEGORIA_IMPOSTOS,
            ContaPagar.categoria_pendente == False,  # noqa: E712
            extract("year", ContaPagar.data_vencimento) == ano,
            extract("month", ContaPagar.data_vencimento) == mes,
        ).scalar() or 0.0

        # Faturamento líquido das NFs pagas no mês
        faturamento = db.query(func.sum(NF.valor_liquido)).filter(
            NF.status == StatusNF.PAGA,
            extract("year", NF.data_emissao) == ano,
            extract("month", NF.data_emissao) == mes,
        ).scalar() or 0.0

        percentual = round((valor_imposto / faturamento) * 100, 2) if faturamento > 0 else 0.0

        resultados.append({
            "mes": mes,
            "ano": ano,
            "faturamento": faturamento,
            "valor_imposto": valor_imposto,
            "percentual_imposto": percentual,
        })
    return resultados


@router.get("/faturamento-nfs")
def faturamento_nfs_mes(
    mes: int = Query(..., ge=1, le=12),
    ano: int = Query(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Retorna o faturamento bruto e líquido real das NFs pagas no mês/ano,
    para pré-preencher o campo 'faturamento' na tela de Impostos."""
    nfs = db.query(NF).filter(
        NF.status == StatusNF.PAGA,
        extract("year", NF.data_emissao) == ano,
        extract("month", NF.data_emissao) == mes,
    ).all()
    return {
        "mes": mes,
        "ano": ano,
        "faturamento_bruto": sum(n.valor_bruto for n in nfs),
        "faturamento_liquido": sum(n.valor_liquido for n in nfs),
        "quantidade_nfs": len(nfs),
    }


@router.get("/", response_model=List[ImpostoResponse])
def listar_impostos(
    ano: int = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    query = db.query(Imposto)
    if ano is not None:
        query = query.filter(Imposto.ano == ano)
    return query.order_by(Imposto.ano.asc(), Imposto.mes.asc()).all()


@router.post("/", response_model=ImpostoResponse, status_code=status.HTTP_201_CREATED)
def criar_imposto(
    imposto: ImpostoCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    # upsert por mes/ano
    existente = db.query(Imposto).filter(
        Imposto.mes == imposto.mes, Imposto.ano == imposto.ano
    ).first()
    if existente:
        existente.faturamento = imposto.faturamento
        existente.percentual_imposto = imposto.percentual_imposto
        existente.valor_imposto = _recalcular_valor(
            imposto.faturamento, imposto.percentual_imposto, imposto.valor_imposto
        )
        db.commit()
        db.refresh(existente)
        return existente

    dados = imposto.dict()
    dados["valor_imposto"] = _recalcular_valor(
        imposto.faturamento, imposto.percentual_imposto, imposto.valor_imposto
    )
    novo = Imposto(**dados)
    db.add(novo)
    db.flush()
    registrar_auditoria(db, current_user, "criar", "Imposto", novo.id,
                        f"{imposto.mes}/{imposto.ano} — {imposto.percentual_imposto}%")
    db.commit()
    db.refresh(novo)
    return novo


@router.put("/{imposto_id}", response_model=ImpostoResponse)
def atualizar_imposto(
    imposto_id: int,
    dados: ImpostoUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    imposto = db.query(Imposto).filter(Imposto.id == imposto_id).first()
    if not imposto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imposto não encontrado")
    update = dados.dict(exclude_none=True)
    for campo, valor in update.items():
        setattr(imposto, campo, valor)
    # Recalcula valor_imposto se faturamento ou percentual foram alterados
    if "faturamento" in update or "percentual_imposto" in update:
        imposto.valor_imposto = _recalcular_valor(
            imposto.faturamento, imposto.percentual_imposto, imposto.valor_imposto
        )
    registrar_auditoria(db, current_user, "editar", "Imposto", imposto_id,
                        f"{imposto.mes}/{imposto.ano}")
    db.commit()
    db.refresh(imposto)
    return imposto


@router.delete("/{imposto_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_imposto(
    imposto_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    imposto = db.query(Imposto).filter(Imposto.id == imposto_id).first()
    if not imposto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imposto não encontrado")
    registrar_auditoria(db, current_user, "deletar", "Imposto", imposto_id,
                        f"{imposto.mes}/{imposto.ano}")
    db.delete(imposto)
    db.commit()
