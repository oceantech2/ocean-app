from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import extract
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models import MetaFinanceira, NF, StatusNF
from app.api.routes.auth import get_current_user, require_admin
from app.services.audit import registrar_auditoria
from app.services.meta_periodo import meta_bruta, aliquotas_iguais
from app.services.nf_valores import calcular_imposto_liquido
from app.schemas import ConfiguracaoPeriodoPut, ConfiguracaoPeriodoResponse

router = APIRouter()


class MetaInput(BaseModel):
    mes: int
    ano: int
    valor_meta: float


def _count_nfs_afetaveis(db: Session, mes: int, ano: int) -> int:
    return (
        db.query(NF)
        .filter(
            NF.excluida_em.is_(None),
            NF.status != StatusNF.CANCELADA,
            NF.data_emissao.isnot(None),
            extract("year", NF.data_emissao) == ano,
            extract("month", NF.data_emissao) == mes,
        )
        .count()
    )


def _nfs_afetaveis(db: Session, mes: int, ano: int):
    return (
        db.query(NF)
        .filter(
            NF.excluida_em.is_(None),
            NF.status != StatusNF.CANCELADA,
            NF.data_emissao.isnot(None),
            extract("year", NF.data_emissao) == ano,
            extract("month", NF.data_emissao) == mes,
        )
        .all()
    )


def _periodo_payload(
    mes: int,
    ano: int,
    meta: MetaFinanceira | None,
    registros_afetaveis: int,
    registros_atualizados: int | None = None,
) -> dict:
    if meta is None or meta.aliquota_periodo is None:
        return {
            "mes": mes,
            "ano": ano,
            "meta_liquida": None,
            "aliquota_periodo": None,
            "meta_bruta": None,
            "configurada": False,
            "registros_afetaveis": registros_afetaveis,
            "registros_atualizados": registros_atualizados,
        }
    liq = float(meta.valor_meta)
    aliq = float(meta.aliquota_periodo)
    return {
        "mes": mes,
        "ano": ano,
        "meta_liquida": liq,
        "aliquota_periodo": aliq,
        "meta_bruta": meta_bruta(liq, aliq),
        "configurada": True,
        "registros_afetaveis": registros_afetaveis,
        "registros_atualizados": registros_atualizados,
    }


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
        {
            "id": m.id,
            "mes": m.mes,
            "ano": m.ano,
            "valor_meta": m.valor_meta,
            "aliquota_periodo": m.aliquota_periodo,
        }
        for m in metas
    ]


@router.get("/periodo", response_model=ConfiguracaoPeriodoResponse)
def obter_periodo(
    mes: int = Query(..., ge=1, le=12),
    ano: int = Query(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    meta = (
        db.query(MetaFinanceira)
        .filter(MetaFinanceira.mes == mes, MetaFinanceira.ano == ano)
        .first()
    )
    return _periodo_payload(mes, ano, meta, _count_nfs_afetaveis(db, mes, ano))


@router.put("/periodo", response_model=ConfiguracaoPeriodoResponse)
def salvar_periodo(
    dados: ConfiguracaoPeriodoPut,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    """Upsert da Configuração do Período (meta líquida + alíquota). Massa com confirmação."""
    meta = (
        db.query(MetaFinanceira)
        .filter(MetaFinanceira.mes == dados.mes, MetaFinanceira.ano == dados.ano)
        .first()
    )
    aliq_atual = meta.aliquota_periodo if meta else None
    aliq_mudou = not aliquotas_iguais(aliq_atual, dados.aliquota_periodo)
    afetaveis = _count_nfs_afetaveis(db, dados.mes, dados.ano)

    if aliq_mudou and not dados.confirmar_atualizacao_massa:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "detail": "confirmacao_necessaria",
                "registros_afetaveis": afetaveis,
                "aliquota_atual": aliq_atual,
                "aliquota_nova": dados.aliquota_periodo,
            },
        )

    if meta:
        meta.valor_meta = dados.meta_liquida
        meta.aliquota_periodo = dados.aliquota_periodo
        acao = "editar"
    else:
        meta = MetaFinanceira(
            mes=dados.mes,
            ano=dados.ano,
            valor_meta=dados.meta_liquida,
            aliquota_periodo=dados.aliquota_periodo,
        )
        db.add(meta)
        acao = "criar"

    registros_atualizados = 0
    if aliq_mudou:
        for nf in _nfs_afetaveis(db, dados.mes, dados.ano):
            imposto, liquido, aliq = calcular_imposto_liquido(
                float(nf.valor_bruto or 0),
                dados.aliquota_periodo,
            )
            nf.aliquota_imposto = aliq
            nf.valor_imposto = imposto
            nf.valor_liquido = liquido
            registros_atualizados += 1

    registrar_auditoria(
        db,
        current_user,
        acao,
        "MetaFinanceira",
        None,
        (
            f"Configuração período {dados.mes:02d}/{dados.ano}: "
            f"meta R$ {dados.meta_liquida:,.2f}, alíquota {dados.aliquota_periodo}%"
            + (f", {registros_atualizados} NFs atualizadas" if aliq_mudou else "")
        ),
    )
    db.commit()
    db.refresh(meta)
    return _periodo_payload(
        dados.mes,
        dados.ano,
        meta,
        afetaveis,
        registros_atualizados if aliq_mudou else None,
    )


@router.get("/progresso")
def progresso_meta(
    mes: int = Query(...),
    ano: int = Query(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Compara a meta com o faturamento realizado.
    mes=0 significa meta anual (soma todos os meses do ano)."""
    meta = (
        db.query(MetaFinanceira)
        .filter(MetaFinanceira.mes == mes, MetaFinanceira.ano == ano)
        .first()
    )
    valor_meta = meta.valor_meta if meta else 0.0
    aliquota = meta.aliquota_periodo if meta and mes != 0 else None

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
    realizado_liquido = sum(float(n.valor_liquido or 0) for n in nfs)
    realizado_bruto = sum(float(n.valor_bruto or 0) for n in nfs)
    percentual = (realizado_liquido / valor_meta * 100) if valor_meta > 0 else 0

    out = {
        "mes": mes,
        "ano": ano,
        "valor_meta": valor_meta,
        "realizado": realizado_liquido,
        "realizado_liquido": realizado_liquido,
        "realizado_bruto": realizado_bruto,
        "percentual": round(percentual, 1),
        "tem_meta": meta is not None and (mes == 0 or meta.aliquota_periodo is not None),
        "aliquota_periodo": aliquota,
        "meta_bruta": meta_bruta(valor_meta, aliquota) if mes != 0 else None,
    }
    # Meta mensal só é "completa" com alíquota; legado sem alíquota: tem_meta se valor existe
    if mes != 0 and meta is not None and meta.aliquota_periodo is None:
        out["tem_meta"] = False
    elif mes != 0 and meta is not None:
        out["tem_meta"] = True
    return out


@router.put("/")
def definir_meta(
    dados: MetaInput,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Cria ou atualiza a meta do mês/ano (upsert). Preferir /periodo para meses 1–12.
    Mantido para meta anual (mes=0) e compatibilidade."""
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
    return {
        "id": meta.id,
        "mes": meta.mes,
        "ano": meta.ano,
        "valor_meta": meta.valor_meta,
        "aliquota_periodo": meta.aliquota_periodo,
    }
