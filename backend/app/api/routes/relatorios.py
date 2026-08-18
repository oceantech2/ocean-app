from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List
from datetime import datetime, date
from app.database import get_db
from app.models import NF, DH, Bonus, Imposto, Saldo, StatusNF, TipoFechamento, Colaborador, ContaPagar
from app.services.categorias_contas import CATEGORIA_IMPOSTOS, label_categoria
from app.api.routes.auth import get_current_user

router = APIRouter()

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
            NF.status == StatusNF.PAGA
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
    query = db.query(NF)
    
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
    ).filter(NF.status == StatusNF.PAGA)

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
        query = db.query(NF)
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
        ).filter(campo_id.isnot(None))
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
    query = db.query(NF)
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
    DRE mensal do ano: receita bruta (NFs pagas), despesa e impostos (contas por vencimento),
    lucro derivado. Sempre retorna 12 meses.
    """
    dados = []
    for mes in range(1, 13):
        receita_bruta = db.query(func.sum(NF.valor_bruto)).filter(
            NF.status == StatusNF.PAGA,
            extract("year", NF.data_emissao) == ano,
            extract("month", NF.data_emissao) == mes,
        ).scalar() or 0.0

        impostos = db.query(func.sum(ContaPagar.valor)).filter(
            ContaPagar.categoria == CATEGORIA_IMPOSTOS,
            ContaPagar.categoria_pendente == False,  # noqa: E712
            ContaPagar.data_vencimento.isnot(None),
            extract("year", ContaPagar.data_vencimento) == ano,
            extract("month", ContaPagar.data_vencimento) == mes,
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
