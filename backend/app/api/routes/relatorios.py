from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Literal, Optional
from datetime import datetime, date, timedelta
from app.database import get_db
from app.models import NF, DH, Bonus, Imposto, Saldo, StatusNF, TipoFechamento, Colaborador, ContaPagar
from app.schemas import (
    PipelineReceitaResponse,
    ReceitaCaixaResponse,
    AgingRecebiveisResponse,
    ProximoRecebimentoResponse,
)
from app.services.categorias_contas import CATEGORIA_IMPOSTOS, label_categoria
from app.api.routes.auth import get_current_user

router = APIRouter()

StatusCiclo = Literal["a_faturar", "faturado_ag_pagamento", "recebido"]


def status_ciclo_nf(data_emissao: Optional[date], data_pagamento: Optional[date]) -> StatusCiclo:
    """Status de ciclo derivado (não persistido). Pagamento prevalece."""
    if data_pagamento is not None:
        return "recebido"
    if data_emissao is not None:
        return "faturado_ag_pagamento"
    return "a_faturar"


def _totais_estagio(
    valor_liquido: float,
    valor_bruto: float,
    contagem: int,
    base_liquido: float,
    base_bruto: float,
) -> dict:
    pct_l = (valor_liquido / base_liquido * 100.0) if base_liquido > 0 else None
    pct_b = (valor_bruto / base_bruto * 100.0) if base_bruto > 0 else None
    return {
        "valor_liquido": float(valor_liquido),
        "valor_bruto": float(valor_bruto),
        "contagem": contagem,
        "percentual_liquido": pct_l,
        "percentual_bruto": pct_b,
        "valor": float(valor_liquido),
        "percentual": pct_l,
    }


@router.get("/pipeline-receita", response_model=PipelineReceitaResponse)
def pipeline_receita(
    ano: int = Query(..., ge=2000, le=2100),
    mes: Optional[int] = Query(None, ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """
    Pipeline de Receita: Contas a Receber (NFs) por data de fechamento (data_ent_pgto).
    Exclui canceladas e soft-delete; inclui arquivadas. Dual-base bruto/líquido.
    """
    query = db.query(NF).filter(
        NF.excluida_em.is_(None),
        NF.status != StatusNF.CANCELADA,
        NF.data_ent_pgto.isnot(None),
        extract("year", NF.data_ent_pgto) == ano,
    )
    if mes is not None:
        query = query.filter(extract("month", NF.data_ent_pgto) == mes)

    nfs = query.all()

    buckets = {
        "a_faturar": {"valor_liquido": 0.0, "valor_bruto": 0.0, "contagem": 0},
        "faturado_ag_pagamento": {"valor_liquido": 0.0, "valor_bruto": 0.0, "contagem": 0},
        "recebido": {"valor_liquido": 0.0, "valor_bruto": 0.0, "contagem": 0},
    }
    for nf in nfs:
        ciclo = status_ciclo_nf(nf.data_emissao, nf.data_pagamento)
        buckets[ciclo]["valor_liquido"] += float(nf.valor_liquido or 0)
        buckets[ciclo]["valor_bruto"] += float(nf.valor_bruto or 0)
        buckets[ciclo]["contagem"] += 1

    fechado_liq = sum(b["valor_liquido"] for b in buckets.values())
    fechado_bru = sum(b["valor_bruto"] for b in buckets.values())
    fechado_contagem = sum(b["contagem"] for b in buckets.values())

    return {
        "ano": ano,
        "mes": mes,
        "fechado": {
            "valor_liquido": float(fechado_liq),
            "valor_bruto": float(fechado_bru),
            "contagem": fechado_contagem,
            "percentual_liquido": 100.0 if fechado_liq > 0 else None,
            "percentual_bruto": 100.0 if fechado_bru > 0 else None,
            "valor": float(fechado_liq),
            "percentual": 100.0 if fechado_liq > 0 else None,
        },
        "a_faturar": _totais_estagio(
            buckets["a_faturar"]["valor_liquido"],
            buckets["a_faturar"]["valor_bruto"],
            buckets["a_faturar"]["contagem"],
            fechado_liq,
            fechado_bru,
        ),
        "faturado_ag_pagamento": _totais_estagio(
            buckets["faturado_ag_pagamento"]["valor_liquido"],
            buckets["faturado_ag_pagamento"]["valor_bruto"],
            buckets["faturado_ag_pagamento"]["contagem"],
            fechado_liq,
            fechado_bru,
        ),
        "recebido": _totais_estagio(
            buckets["recebido"]["valor_liquido"],
            buckets["recebido"]["valor_bruto"],
            buckets["recebido"]["contagem"],
            fechado_liq,
            fechado_bru,
        ),
    }


def _totais_caixa(valor_liquido: float, valor_bruto: float, contagem: int) -> dict:
    return {
        "valor_liquido": float(valor_liquido),
        "valor_bruto": float(valor_bruto),
        "contagem": contagem,
    }


@router.get("/receita-caixa", response_model=ReceitaCaixaResponse)
def receita_caixa(
    ano: int = Query(..., ge=2000, le=2100),
    mes: Optional[int] = Query(None, ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """
    Aba Por Caixa: Recebido / Impostos por data_pagamento;
    pendentes (A Receber / A Faturar) por data_ent_pgto no período.
    Exclui canceladas e soft-delete; inclui arquivadas.
    """
    exclusoes = (
        NF.excluida_em.is_(None),
        NF.status != StatusNF.CANCELADA,
    )

    q_recebido = db.query(NF).filter(
        *exclusoes,
        NF.data_pagamento.isnot(None),
        extract("year", NF.data_pagamento) == ano,
    )
    if mes is not None:
        q_recebido = q_recebido.filter(extract("month", NF.data_pagamento) == mes)

    recebido_liq = recebido_bru = 0.0
    impostos = 0.0
    cont_recebido = 0
    for nf in q_recebido.all():
        recebido_liq += float(nf.valor_liquido or 0)
        recebido_bru += float(nf.valor_bruto or 0)
        impostos += float(nf.valor_imposto or 0)
        cont_recebido += 1

    q_pend = db.query(NF).filter(
        *exclusoes,
        NF.data_ent_pgto.isnot(None),
        NF.data_pagamento.is_(None),
        extract("year", NF.data_ent_pgto) == ano,
    )
    if mes is not None:
        q_pend = q_pend.filter(extract("month", NF.data_ent_pgto) == mes)

    a_receber = {"valor_liquido": 0.0, "valor_bruto": 0.0, "contagem": 0}
    a_faturar = {"valor_liquido": 0.0, "valor_bruto": 0.0, "contagem": 0}
    for nf in q_pend.all():
        alvo = a_receber if nf.data_emissao is not None else a_faturar
        alvo["valor_liquido"] += float(nf.valor_liquido or 0)
        alvo["valor_bruto"] += float(nf.valor_bruto or 0)
        alvo["contagem"] += 1

    return {
        "ano": ano,
        "mes": mes,
        "recebido": _totais_caixa(recebido_liq, recebido_bru, cont_recebido),
        "impostos_recolhidos": float(impostos),
        "a_receber": _totais_caixa(
            a_receber["valor_liquido"], a_receber["valor_bruto"], a_receber["contagem"]
        ),
        "a_faturar": _totais_caixa(
            a_faturar["valor_liquido"], a_faturar["valor_bruto"], a_faturar["contagem"]
        ),
    }


def _aging_bucket_vazio() -> dict:
    return {"valor_liquido": 0.0, "valor_bruto": 0.0}


def _totais_aging(valor_liquido: float, valor_bruto: float, base_liq: float, base_bru: float) -> dict:
    return {
        "valor_liquido": float(valor_liquido),
        "valor_bruto": float(valor_bruto),
        "percentual_liquido": (valor_liquido / base_liq * 100.0) if base_liq > 0 else None,
        "percentual_bruto": (valor_bruto / base_bru * 100.0) if base_bru > 0 else None,
    }


def _classificar_bucket_aging(vencimento: Optional[date], hoje: date) -> Optional[str]:
    """Retorna chave do bucket ou None (residual: sem vencimento / a vencer >30d)."""
    if vencimento is None:
        return None
    limite = hoje + timedelta(days=30)
    if vencimento >= hoje and vencimento <= limite:
        return "a_vencer_lt_30"
    atraso = (hoje - vencimento).days
    if 1 <= atraso <= 60:
        return "d1_60"
    if 61 <= atraso <= 90:
        return "d60_90"
    if atraso > 90:
        return "d_mais_90"
    return None


@router.get("/aging-recebiveis", response_model=AgingRecebiveisResponse)
def aging_recebiveis(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """
    Aging de Recebíveis: estoque global de NFs emitidas sem recebimento.
    Sem filtro de período. Dual-base bruto/líquido. Residual só no total_aberto.
    """
    hoje = date.today()
    nfs = db.query(NF).filter(
        NF.excluida_em.is_(None),
        NF.status != StatusNF.CANCELADA,
        NF.data_emissao.isnot(None),
        NF.data_pagamento.is_(None),
    ).all()

    buckets = {
        "a_vencer_lt_30": _aging_bucket_vazio(),
        "d1_60": _aging_bucket_vazio(),
        "d60_90": _aging_bucket_vazio(),
        "d_mais_90": _aging_bucket_vazio(),
    }
    total_liq = 0.0
    total_bru = 0.0
    for nf in nfs:
        liq = float(nf.valor_liquido or 0)
        bru = float(nf.valor_bruto or 0)
        total_liq += liq
        total_bru += bru
        chave = _classificar_bucket_aging(nf.data_vencimento, hoje)
        if chave is not None:
            buckets[chave]["valor_liquido"] += liq
            buckets[chave]["valor_bruto"] += bru

    return {
        "referencia": hoje,
        "total_aberto": {
            "valor_liquido": float(total_liq),
            "valor_bruto": float(total_bru),
            "percentual_liquido": 100.0 if total_liq > 0 else None,
            "percentual_bruto": 100.0 if total_bru > 0 else None,
        },
        "a_vencer_lt_30": _totais_aging(
            buckets["a_vencer_lt_30"]["valor_liquido"],
            buckets["a_vencer_lt_30"]["valor_bruto"],
            total_liq,
            total_bru,
        ),
        "d1_60": _totais_aging(
            buckets["d1_60"]["valor_liquido"],
            buckets["d1_60"]["valor_bruto"],
            total_liq,
            total_bru,
        ),
        "d60_90": _totais_aging(
            buckets["d60_90"]["valor_liquido"],
            buckets["d60_90"]["valor_bruto"],
            total_liq,
            total_bru,
        ),
        "d_mais_90": _totais_aging(
            buckets["d_mais_90"]["valor_liquido"],
            buckets["d_mais_90"]["valor_bruto"],
            total_liq,
            total_bru,
        ),
    }


@router.get("/proximo-recebimento", response_model=ProximoRecebimentoResponse)
def proximo_recebimento(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """
    Próximo recebimento do Alerta: MIN(data_vencimento) ≥ hoje entre NFs em aberto.
    Estoque global. Empate estável: maior líquido, depois maior bruto, depois menor id.
    """
    hoje = date.today()
    nfs = db.query(NF).filter(
        NF.excluida_em.is_(None),
        NF.status != StatusNF.CANCELADA,
        NF.data_emissao.isnot(None),
        NF.data_pagamento.is_(None),
        NF.data_vencimento.isnot(None),
        NF.data_vencimento >= hoje,
    ).all()

    if not nfs:
        return {
            "referencia": hoje,
            "encontrado": False,
            "data_vencimento": None,
            "valor_liquido": None,
            "valor_bruto": None,
            "nf_id": None,
        }

    escolhida = min(
        nfs,
        key=lambda nf: (
            nf.data_vencimento,
            -float(nf.valor_liquido or 0),
            -float(nf.valor_bruto or 0),
            int(nf.id),
        ),
    )
    return {
        "referencia": hoje,
        "encontrado": True,
        "data_vencimento": escolhida.data_vencimento,
        "valor_liquido": float(escolhida.valor_liquido or 0),
        "valor_bruto": float(escolhida.valor_bruto or 0),
        "nf_id": int(escolhida.id),
    }


@router.get("/faturamento-liquido-mes")
def faturamento_liquido_por_mes(
    ano: int = Query(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """
    Gráfico de faturamento líquido por mês.
    Retorna array com 12 meses.
    """
    dados = []

    for mes in range(1, 13):
        nfs = db.query(NF).filter(
            extract("year", NF.data_emissao) == ano,
            extract("month", NF.data_emissao) == mes,
            NF.status == StatusNF.PAGA,
            NF.excluida_em.is_(None),
        ).all()

        total = sum(nf.valor_liquido for nf in nfs)
        dados.append({
            "mes": mes,
            "valor": total,
            "quantidade": len(nfs)
        })

    return {"ano": ano, "dados": dados}

@router.get("/fechamentos-por-tipo")
def fechamentos_por_tipo(
    ano: int = Query(None),
    mes: int = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """
    Contagem de fechamentos por tipo: retainer, sucesso e parcelamento.
    Opcional: filtrar por ano/mês.
    """
    query = db.query(NF).filter(NF.excluida_em.is_(None))

    if ano and mes:
        query = query.filter(
            extract("year", NF.data_emissao) == ano,
            extract("month", NF.data_emissao) == mes
        )
    elif ano:
        query = query.filter(extract("year", NF.data_emissao) == ano)
    
    retainer = query.filter(NF.tipo == TipoFechamento.RETAINER).count()
    sucesso = query.filter(NF.tipo == TipoFechamento.SUCESSO).count()
    parcelamento = query.filter(NF.tipo == TipoFechamento.PARCELAMENTO).count()

    return {
        "retainer": retainer,
        "sucesso": sucesso,
        "parcelamento": parcelamento,
        "total": retainer + sucesso + parcelamento
    }

@router.get("/faturamento-por-cliente")
def faturamento_por_cliente(
    ano: int = Query(None),
    limite: int = Query(10),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Faturamento líquido e bruto por cliente (NFs pagas). Top 10 por padrão."""
    query = db.query(
        NF.razao_social,
        func.sum(NF.valor_liquido).label("valor_liquido"),
        func.sum(NF.valor_bruto).label("valor_bruto"),
        func.count().label("quantidade"),
    ).filter(NF.status == StatusNF.PAGA, NF.excluida_em.is_(None))

    if ano:
        query = query.filter(extract("year", NF.data_emissao) == ano)

    clientes = query.group_by(NF.razao_social).order_by(
        func.sum(NF.valor_liquido).desc()
    ).limit(limite).all()

    return {
        "clientes": [
            {
                "nome": c[0],
                "valor_liquido": c[1] or 0,
                "valor_bruto": c[2] or 0,
                "quantidade": c[3] or 0,
            }
            for c in clientes
        ]
    }

@router.get("/bonus-mensal")
def bonus_mensal(
    ano: int = Query(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Bônus distribuído por mês em um ano"""
    dados = []
    
    for mes in range(1, 13):
        bonus = db.query(Bonus).filter(
            Bonus.ano == ano,
            Bonus.mes == mes
        ).all()
        
        total = sum(b.valor_bonus for b in bonus)
        dados.append({
            "mes": mes,
            "valor": total,
            "quantidade": len(bonus)
        })
    
    return {"ano": ano, "dados": dados}

@router.get("/propostas-enviadas")
def propostas_enviadas(
    ano: int = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Número de propostas (NFs) enviadas por mês"""
    dados = []
    
    for mes in range(1, 13):
        query = db.query(NF).filter(NF.excluida_em.is_(None))
        if ano:
            query = query.filter(extract("year", NF.data_emissao) == ano)
        
        propostas = query.filter(extract("month", NF.data_emissao) == mes).count()
        dados.append({
            "mes": mes,
            "quantidade": propostas
        })
    
    return {"ano": ano or "all", "dados": dados}

@router.get("/contratos-assinados")
def contratos_assinados(
    ano: int = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Número de contratos assinados (NFs pagas)"""
    dados = []
    
    for mes in range(1, 13):
        query = db.query(NF).filter(
            NF.status == StatusNF.PAGA,
            NF.data_pagamento.isnot(None),
            NF.excluida_em.is_(None),
        )
        if ano:
            query = query.filter(extract("year", NF.data_pagamento) == ano)

        contratos = query.filter(extract("month", NF.data_pagamento) == mes).count()
        dados.append({
            "mes": mes,
            "quantidade": contratos
        })
    
    return {"ano": ano or "all", "dados": dados}

@router.get("/placement-por-consultor")
def placement_por_consultor(
    ano: int = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Lead, Condução e Placement por consultor — quantidade e valor líquido."""
    def _agrupar(campo_id):
        q = db.query(
            campo_id,
            func.count().label("qtd"),
            func.sum(NF.valor_liquido).label("valor_liquido"),
            func.sum(NF.valor_bruto).label("valor_bruto"),
        ).filter(campo_id.isnot(None), NF.excluida_em.is_(None))
        if ano:
            q = q.filter(extract("year", NF.data_emissao) == ano)
        return q.group_by(campo_id).all()

    leads = _agrupar(NF.colaborador_lead_id)
    conducoes = _agrupar(NF.colaborador_conducao_id)
    placements = _agrupar(NF.colaborador_placement_id)

    # Carregar nomes de todos os colaboradores envolvidos
    ids = set()
    for rows in (leads, conducoes, placements):
        for r in rows:
            if r[0]:
                ids.add(r[0])
    colabs = {c.id: c.nome for c in db.query(Colaborador).filter(Colaborador.id.in_(ids)).all()} if ids else {}

    def _fmt(rows):
        return [
            {
                "colaborador_id": r[0],
                "consultor": colabs.get(r[0], f"ID {r[0]}"),
                "quantidade": r[1],
                "valor_liquido": r[2] or 0,
                "valor_bruto": r[3] or 0,
            }
            for r in sorted(rows, key=lambda x: x[2] or 0, reverse=True)
        ]

    return {
        "leads": _fmt(leads),
        "conducoes": _fmt(conducoes),
        "placements": _fmt(placements),
    }

@router.get("/resumo-financeiro")
def resumo_financeiro(
    ano: int = Query(None),
    mes: int = Query(None, ge=1, le=12),
    mes_ate: int = Query(None, ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Resumo geral financeiro. Filtra por ano e, se informado, pelo mês de data_emissao.

    `mes` (exato) tem precedência. Sem `mes`, `mes_ate` restringe a janeiro–mes_ate.
    """
    query = db.query(NF).filter(NF.excluida_em.is_(None))
    if ano:
        query = query.filter(extract("year", NF.data_emissao) == ano)
    if mes:
        query = query.filter(extract("month", NF.data_emissao) == mes)
    elif mes_ate:
        query = query.filter(extract("month", NF.data_emissao) <= mes_ate)

    nfs_pagas = query.filter(NF.status == StatusNF.PAGA).all()
    nfs_pendentes = query.filter(NF.status == StatusNF.PENDENTE).all()

    return {
        "faturamento_liquido_pago": sum(nf.valor_liquido for nf in nfs_pagas),
        "faturamento_bruto_pago": sum(nf.valor_bruto for nf in nfs_pagas),
        "faturamento_liquido_pendente": sum(nf.valor_liquido for nf in nfs_pendentes),
        "faturamento_bruto_pendente": sum(nf.valor_bruto for nf in nfs_pendentes),
        "quantidade_pagas": len(nfs_pagas),
        "quantidade_pendentes": len(nfs_pendentes),
    }


@router.get("/dre-mensal")
def dre_mensal(
    ano: int = Query(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """
    DRE mensal do ano: receita bruta e impostos (NFs pagas por emissão),
    despesa (contas por vencimento, exceto impostos), lucro derivado. Sempre 12 meses.
    """
    dados = []
    for mes in range(1, 13):
        receita_bruta = db.query(func.sum(NF.valor_bruto)).filter(
            NF.status == StatusNF.PAGA,
            NF.excluida_em.is_(None),
            extract("year", NF.data_emissao) == ano,
            extract("month", NF.data_emissao) == mes,
        ).scalar() or 0.0

        impostos = db.query(func.sum(NF.valor_imposto)).filter(
            NF.status == StatusNF.PAGA,
            NF.excluida_em.is_(None),
            extract("year", NF.data_emissao) == ano,
            extract("month", NF.data_emissao) == mes,
        ).scalar() or 0.0

        despesa = db.query(func.sum(ContaPagar.valor)).filter(
            ContaPagar.categoria != CATEGORIA_IMPOSTOS,
            ContaPagar.data_vencimento.isnot(None),
            extract("year", ContaPagar.data_vencimento) == ano,
            extract("month", ContaPagar.data_vencimento) == mes,
        ).scalar() or 0.0

        receita_bruta = float(receita_bruta)
        despesa = float(despesa)
        impostos = float(impostos)
        lucro = receita_bruta - despesa - impostos

        dados.append({
            "mes": mes,
            "receita_bruta": receita_bruta,
            "despesa": despesa,
            "impostos": impostos,
            "lucro": lucro,
        })

    return {"ano": ano, "dados": dados}


@router.get("/custo-por-categoria")
def custo_por_categoria(
    ano: int = Query(...),
    mes_ate: int = Query(..., ge=1, le=12),
    mes_de: int = Query(1, ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """
    Composição do custo por categoria no período (meses mes_de..mes_ate do ano).
    Default mes_de=1 preserva YTD. Dashboard usa mes_de=mes_ate para mês isolado.
    Pendentes agregados em bucket 'pendente'. Contas pagas e pendentes de pagamento.
    """
    if mes_de > mes_ate:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="mes_de deve ser menor ou igual a mes_ate",
        )

    rows = (
        db.query(
            ContaPagar.categoria,
            ContaPagar.categoria_pendente,
            func.sum(ContaPagar.valor),
        )
        .filter(
            ContaPagar.data_vencimento.isnot(None),
            extract("year", ContaPagar.data_vencimento) == ano,
            extract("month", ContaPagar.data_vencimento) >= mes_de,
            extract("month", ContaPagar.data_vencimento) <= mes_ate,
        )
        .group_by(ContaPagar.categoria, ContaPagar.categoria_pendente)
        .all()
    )

    agregados: dict[str, float] = {}
    for categoria, pendente, soma in rows:
        valor = float(soma or 0.0)
        if valor <= 0:
            continue
        key = "pendente" if pendente else str(categoria)
        agregados[key] = agregados.get(key, 0.0) + valor

    categorias = []
    for key, valor in agregados.items():
        categorias.append({
            "categoria": key,
            "centro_custo": key,  # compat Dashboard até migração completa do front
            "valor": valor,
            "label": "Pendente de reclassificação" if key == "pendente" else label_categoria(key, db=db),
        })

    categorias.sort(key=lambda c: (-c["valor"], c["categoria"]))
    total = sum(c["valor"] for c in categorias)
    for c in categorias:
        c["percentual"] = (c["valor"] / total * 100.0) if total > 0 else 0.0

    return {
        "ano": ano,
        "mes_de": mes_de,
        "mes_ate": mes_ate,
        "total": total,
        "categorias": categorias,
    }
