from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, extract
from typing import List, Set
from datetime import date
import io
from app.database import get_db
from app.models import NF, StatusNF, TipoFechamento
from app.schemas import NFCreate, NFResponse, NFUpdate
from app.api.routes.auth import get_current_user, require_admin
from app.services.audit import registrar_auditoria
from app.services import excel_io
from app.services.maggo_stub import listar_contas_receber, MaggoStubError

router = APIRouter()

_MSG_CRIACAO_DESABILITADA = "Criação local desabilitada — Contas a Receber vêm da fonte Maggo"
_MSG_EXCLUSAO_DESABILITADA = "Exclusão desabilitada — Contas a Receber são geridas pela fonte Maggo"
_MSG_IMPORT_DESABILITADO = "Importação desabilitada — Contas a Receber vêm da fonte Maggo"


def _parse_tipo_maggo(tipo: str, tipo_ab: str | None) -> tuple[TipoFechamento, str | None]:
    t = (tipo or "sucesso").lower()
    if t == "retainer":
        ab = tipo_ab if tipo_ab in ("abertura", "fechamento") else "abertura"
        return TipoFechamento.RETAINER, ab
    return TipoFechamento.SUCESSO, None


def _calcular_status_nf(data_vencimento: date, data_pagamento) -> StatusNF:
    """Paga se tem data_pagamento, vencida se passou do vencimento sem pagamento, senão pendente."""
    if data_pagamento:
        return StatusNF.PAGA
    if data_vencimento and data_vencimento < date.today():
        return StatusNF.VENCIDA
    return StatusNF.PENDENTE


def _sync_maggo_stub(db: Session) -> Set[str]:
    """Merge stub Maggo → nfs por numero. Preserva enriquecimento Ocean.
    Retorna o conjunto de números presentes no stub.
    """
    try:
        itens = listar_contas_receber()
    except MaggoStubError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e) or "Fonte Maggo indisponível",
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Falha ao consultar fonte Maggo: {e}",
        ) from e

    numeros: Set[str] = set()
    for item in itens:
        numero = item["numero"]
        numeros.add(numero)
        tipo_enum, tipo_ab = _parse_tipo_maggo(item.get("tipo", "sucesso"), item.get("tipo_abertura_fechamento"))
        db_nf = db.query(NF).filter(NF.numero == numero).first()
        if db_nf:
            db_nf.razao_social = item["razao_social"]
            db_nf.posicao = item.get("posicao")
            db_nf.candidato = item.get("candidato")
            db_nf.valor_bruto = item["valor_bruto"]
            db_nf.valor_liquido = item["valor_liquido"]
            db_nf.data_emissao = item["data_emissao"]
            db_nf.data_vencimento = item["data_vencimento"]
            db_nf.tipo = tipo_enum
            db_nf.tipo_abertura_fechamento = tipo_ab
            # Preserva data_pagamento, colaboradores, arquivada, caixa
            db_nf.status = _calcular_status_nf(db_nf.data_vencimento, db_nf.data_pagamento)
        else:
            db_nf = NF(
                numero=numero,
                razao_social=item["razao_social"],
                posicao=item.get("posicao"),
                candidato=item.get("candidato"),
                valor_bruto=item["valor_bruto"],
                valor_liquido=item["valor_liquido"],
                data_emissao=item["data_emissao"],
                data_vencimento=item["data_vencimento"],
                tipo=tipo_enum,
                tipo_abertura_fechamento=tipo_ab,
                status=_calcular_status_nf(item["data_vencimento"], None),
                arquivada=False,
            )
            db.add(db_nf)
    db.commit()
    return numeros


@router.get("/", response_model=List[NFResponse])
def listar_nfs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    mes: int = Query(None, ge=1, le=12),
    ano: int = Query(None),
    status_filtro: str = Query(None),
    incluir_arquivadas: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Listar Contas a Receber a partir do stub Maggo (merge com Ocean)."""
    numeros_stub = _sync_maggo_stub(db)
    query = db.query(NF).filter(NF.numero.in_(numeros_stub))

    if not incluir_arquivadas:
        query = query.filter(NF.arquivada == False)

    if mes and ano:
        query = query.filter(
            and_(
                NF.data_emissao >= date(ano, mes, 1),
                NF.data_emissao < date(ano if mes < 12 else ano + 1, (mes % 12) + 1 if mes < 12 else 1, 1)
            )
        )
    elif ano:
        query = query.filter(extract('year', NF.data_emissao) == ano)

    if status_filtro:
        query = query.filter(NF.status == status_filtro)

    nfs = query.offset(skip).limit(limit).all()

    return nfs


@router.delete("/todas", status_code=status.HTTP_403_FORBIDDEN)
def deletar_todas_nfs(
    mes: int = Query(None, ge=1, le=12),
    ano: int = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=_MSG_EXCLUSAO_DESABILITADA)


@router.post("/importar-xlsx")
def importar_nfs_xlsx(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=_MSG_IMPORT_DESABILITADO)


@router.get("/exportar-xlsx")
def exportar_nfs_xlsx(
    mes: int = Query(None, ge=1, le=12),
    ano: int = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Exporta as NFs do banco preenchendo o template oficial (aba 'Entradas')."""
    query = db.query(NF)
    if mes and ano:
        query = query.filter(
            and_(
                NF.data_emissao >= date(ano, mes, 1),
                NF.data_emissao < date(ano if mes < 12 else ano + 1, (mes % 12) + 1 if mes < 12 else 1, 1)
            )
        )
    elif ano:
        query = query.filter(extract('year', NF.data_emissao) == ano)

    nfs = query.order_by(NF.data_emissao).all()

    dados = []
    for nf in nfs:
        dados.append({
            "numero": nf.numero,
            "razao_social": nf.razao_social,
            "posicao": nf.posicao,
            "valor_bruto": nf.valor_bruto,
            "valor_liquido": nf.valor_liquido,
            "data_emissao": nf.data_emissao,
            "data_vencimento": nf.data_vencimento,
            "data_pagamento": nf.data_pagamento,
            "lead_nome": nf.colaborador_lead.nome if nf.colaborador_lead else None,
            "conducao_nome": nf.colaborador_conducao.nome if nf.colaborador_conducao else None,
            "placement_nome": nf.colaborador_placement.nome if nf.colaborador_placement else None,
        })

    conteudo = excel_io.preencher_template_nfs(dados)

    return StreamingResponse(
        io.BytesIO(conteudo),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=nfs_ocean.xlsx"},
    )

@router.get("/resumo/total")
def resumo_nfs(
    mes: int = Query(None, ge=1, le=12),
    ano: int = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """
    Retorna resumo de Contas a Receber (visão Maggo stub mesclada).
    Opcional: filtrar por mês e ano.
    """
    from sqlalchemy import extract as sa_extract

    numeros_stub = _sync_maggo_stub(db)
    query = db.query(NF).filter(NF.numero.in_(numeros_stub))

    if ano:
        query = query.filter(sa_extract("year", NF.data_emissao) == ano)
    if mes:
        query = query.filter(sa_extract("month", NF.data_emissao) == mes)

    nfs_pagas = query.filter(NF.status == StatusNF.PAGA).all()
    nfs_pendentes = query.filter(NF.status == StatusNF.PENDENTE).all()
    nfs_vencidas = query.filter(NF.status == StatusNF.VENCIDA).all()
    
    return {
        "total_bruto_pago": sum(nf.valor_bruto for nf in nfs_pagas),
        "total_liquido_pago": sum(nf.valor_liquido for nf in nfs_pagas),
        "qtd_pagas": len(nfs_pagas),
        "total_bruto_pendente": sum(nf.valor_bruto for nf in nfs_pendentes),
        "total_liquido_pendente": sum(nf.valor_liquido for nf in nfs_pendentes),
        "qtd_pendentes": len(nfs_pendentes),
        "total_bruto_vencido": sum(nf.valor_bruto for nf in nfs_vencidas),
        "total_liquido_vencido": sum(nf.valor_liquido for nf in nfs_vencidas),
        "qtd_vencidas": len(nfs_vencidas),
    }

@router.get("/{nf_id}", response_model=NFResponse)
def obter_nf(
    nf_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Obter uma NF específica"""
    nf = db.query(NF).filter(NF.id == nf_id).first()
    
    if not nf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NF não encontrada"
        )
    
    return nf

@router.post("/", response_model=NFResponse, status_code=status.HTTP_201_CREATED)
def criar_nf(
    nf: NFCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=_MSG_CRIACAO_DESABILITADA)

@router.put("/{nf_id}", response_model=NFResponse)
def atualizar_nf(
    nf_id: int,
    nf_update: NFUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Atualizar enriquecimento Ocean (allowlist Contas a Receber)."""
    db_nf = db.query(NF).filter(NF.id == nf_id).first()
    
    if not db_nf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NF não encontrada"
        )
    
    dados_atualizacao = nf_update.model_dump(exclude_unset=True)
    for campo, valor in dados_atualizacao.items():
        setattr(db_nf, campo, valor)

    if "data_pagamento" in dados_atualizacao:
        db_nf.status = _calcular_status_nf(db_nf.data_vencimento, db_nf.data_pagamento)

    registrar_auditoria(db, current_user, "editar", "NF", db_nf.id, f"NF {db_nf.numero} — campos: {', '.join(dados_atualizacao.keys())}")
    db.commit()
    db.refresh(db_nf)

    return db_nf

@router.delete("/{nf_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_nf(
    nf_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=_MSG_EXCLUSAO_DESABILITADA)


