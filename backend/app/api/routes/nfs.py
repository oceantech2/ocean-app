from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, extract
from sqlalchemy.exc import IntegrityError
from typing import List, Set, Optional, Literal, Tuple
from datetime import date
import io
from app.database import get_db
from app.models import NF, StatusNF, TipoFechamento
from app.schemas import NFCreate, NFResponse, NFUpdate
from app.api.routes.auth import get_current_user, require_admin
from app.services.audit import registrar_auditoria
from app.services import excel_io
from app.services.maggo_stub import listar_contas_receber, MaggoStubError
from app.services import nf_duplicidade as dup

router = APIRouter()

_MSG_EXCLUSAO_DESABILITADA = "Exclusão desabilitada — Contas a Receber são geridas pela fonte Maggo"
_MSG_CAIXA_OBRIGATORIA = (
    "Caixa é obrigatória quando a conta está recebida. Informe corrente ou investimento."
)
_MSG_CAMPO_MAGGO_RO = "Campos de negócio de origem Maggo não podem ser alterados"
_CAMPOS_NEGOCIO = {
    "razao_social", "posicao", "candidato", "valor_bruto", "valor_liquido",
    "data_emissao", "data_vencimento", "tipo", "tipo_abertura_fechamento",
}


def _parse_tipo_maggo(tipo: str, tipo_ab: str | None) -> tuple[TipoFechamento, str | None]:
    t = (tipo or "sucesso").lower()
    if t == "retainer":
        ab = tipo_ab if tipo_ab in ("abertura", "fechamento") else "abertura"
        return TipoFechamento.RETAINER, ab
    return TipoFechamento.SUCESSO, None


def _parse_tipo_create(tipo: str, tipo_ab: str | None) -> tuple[TipoFechamento, str | None]:
    return _parse_tipo_maggo(tipo, tipo_ab)


def _calcular_status_nf(data_vencimento: date, data_pagamento) -> StatusNF:
    """Paga se tem data_pagamento, vencida se passou do vencimento sem pagamento, senão pendente."""
    if data_pagamento:
        return StatusNF.PAGA
    if data_vencimento and data_vencimento < date.today():
        return StatusNF.VENCIDA
    return StatusNF.PENDENTE


def _sync_maggo_stub(db: Session) -> Tuple[Set[str], List[str]]:
    """Merge stub Maggo → nfs por numero. Preserva enriquecimento Ocean e registros manuais.
    Retorna (números no stub, números ignorados por colisão com origem manual).
    """
    itens = listar_contas_receber()
    numeros: Set[str] = set()
    colisoes: List[str] = []
    for item in itens:
        numero = dup.normalizar_numero(item["numero"])
        numeros.add(numero)
        tipo_enum, tipo_ab = _parse_tipo_maggo(item.get("tipo", "sucesso"), item.get("tipo_abertura_fechamento"))
        db_nf = db.query(NF).filter(NF.numero == numero).first()
        if db_nf:
            if (db_nf.origem or "maggo") == "manual":
                colisoes.append(numero)
                continue
            db_nf.razao_social = item["razao_social"]
            db_nf.posicao = item.get("posicao")
            db_nf.candidato = item.get("candidato")
            db_nf.valor_bruto = item["valor_bruto"]
            db_nf.valor_liquido = item["valor_liquido"]
            db_nf.data_emissao = item["data_emissao"]
            db_nf.data_vencimento = item["data_vencimento"]
            db_nf.tipo = tipo_enum
            db_nf.tipo_abertura_fechamento = tipo_ab
            db_nf.origem = "maggo"
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
                origem="maggo",
            )
            db.add(db_nf)
    db.commit()
    return numeros, colisoes


def _aplicar_campos_arquivo(db_nf: NF, r: dict) -> None:
    """Atualiza campos de negócio do arquivo; preserva enriquecimento Ocean."""
    if r.get("cancelada"):
        db_nf.status = StatusNF.CANCELADA
        db_nf.razao_social = r.get("razao_social") or db_nf.razao_social
        return
    db_nf.razao_social = r["razao_social"]
    db_nf.posicao = r.get("posicao")
    db_nf.valor_bruto = r["valor_bruto"]
    db_nf.valor_liquido = r["valor_liquido"]
    if r.get("data_emissao"):
        db_nf.data_emissao = r["data_emissao"]
    if r.get("data_vencimento"):
        db_nf.data_vencimento = r["data_vencimento"]
    # Não sobrescreve data_pagamento / caixa / colaboradores / arquivada (Ocean)
    db_nf.status = _calcular_status_nf(db_nf.data_vencimento, db_nf.data_pagamento)


@router.get("/", response_model=List[NFResponse])
def listar_nfs(
    response: Response,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    mes: int = Query(None, ge=1, le=12),
    ano: int = Query(None),
    status_filtro: str = Query(None),
    incluir_arquivadas: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Listar Contas a Receber (sync Maggo + registros locais)."""
    colisoes: List[str] = []
    try:
        _, colisoes = _sync_maggo_stub(db)
    except MaggoStubError:
        response.headers["X-Ocean-Maggo-Status"] = "unavailable"
    except Exception:
        response.headers["X-Ocean-Maggo-Status"] = "unavailable"

    if colisoes:
        response.headers["X-Ocean-Maggo-Ignorados"] = ",".join(colisoes)

    query = db.query(NF)

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
    on_conflict: Optional[Literal["reject", "update"]] = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    """Importa NFs do XLSX. Duplicatas no arquivo: primeira vale.
    Conflitos com cadastro: exige on_conflict=reject|update.
    """
    conteudo = file.file.read()
    try:
        registros = excel_io.parse_nfs_xlsx(conteudo)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # Separar duplicatas internas (manter primeira ocorrência)
    elegiveis = []
    erros: list[dict] = []
    for r in registros:
        numero = dup.normalizar_numero(r.get("numero"))
        r["numero"] = numero
        if r.get("duplicado_arquivo"):
            erros.append({
                "linha": r.get("_linha"),
                "numero": numero,
                "motivo": "duplicado_arquivo",
            })
            continue
        elegiveis.append(r)

    conflitos = []
    for r in elegiveis:
        existente = dup.buscar_por_numero(db, r["numero"])
        if existente:
            conflitos.append({
                "linha": r.get("_linha"),
                "numero": r["numero"],
                "nf_id": existente.id,
            })

    if conflitos and on_conflict is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "code": dup.CODE_IMPORT_ON_CONFLICT,
                "message": "Há números já cadastrados. Informe on_conflict=reject ou on_conflict=update.",
                "conflitos": conflitos,
            },
        )

    ok = 0
    atualizados = 0

    for r in elegiveis:
        numero = r["numero"]
        existente = dup.buscar_por_numero(db, numero)

        if existente:
            if on_conflict == "reject":
                erros.append({
                    "linha": r.get("_linha"),
                    "numero": numero,
                    "motivo": "duplicado_cadastro",
                })
                continue
            if on_conflict == "update":
                try:
                    db.begin_nested()
                    _aplicar_campos_arquivo(existente, r)
                    registrar_auditoria(
                        db, current_user, "editar", "NF", existente.id,
                        f"Import atualizou NF {numero}",
                    )
                    db.flush()
                    atualizados += 1
                except Exception as e:
                    db.rollback()
                    erros.append({
                        "linha": r.get("_linha"),
                        "numero": numero,
                        "motivo": str(e),
                    })
                continue

        # Novo registro
        try:
            db.begin_nested()
            tipo_enum, tipo_ab = TipoFechamento.SUCESSO, None
            if r.get("cancelada"):
                status_nf = StatusNF.CANCELADA
            else:
                status_nf = _calcular_status_nf(r.get("data_vencimento") or date.today(), r.get("data_pagamento"))
            nova = NF(
                numero=numero,
                razao_social=r["razao_social"],
                posicao=r.get("posicao"),
                valor_bruto=r["valor_bruto"],
                valor_liquido=r["valor_liquido"],
                data_emissao=r.get("data_emissao") or date.today(),
                data_vencimento=r.get("data_vencimento") or date.today(),
                data_pagamento=r.get("data_pagamento"),
                tipo=tipo_enum,
                tipo_abertura_fechamento=tipo_ab,
                status=status_nf,
                arquivada=False,
            )
            db.add(nova)
            db.flush()
            registrar_auditoria(db, current_user, "criar", "NF", nova.id, f"Importado: NF {numero}")
            ok += 1
        except IntegrityError:
            db.rollback()
            existente = dup.buscar_por_numero(db, numero)
            erros.append({
                "linha": r.get("_linha"),
                "numero": numero,
                "motivo": "duplicado_cadastro" if existente else "erro_unicidade",
            })
        except Exception as e:
            db.rollback()
            erros.append({
                "linha": r.get("_linha"),
                "numero": numero,
                "motivo": str(e),
            })

    db.commit()
    return {"ok": ok, "atualizados": atualizados, "erros": erros}


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
            "caixa": nf.caixa,
            "origem": nf.origem or "maggo",
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
    Retorna resumo de Contas a Receber (Maggo sync + locais).
    Opcional: filtrar por mês e ano.
    """
    from sqlalchemy import extract as sa_extract

    try:
        _sync_maggo_stub(db)
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
    query = db.query(NF)

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
    current_user: str = Depends(require_admin),
):
    """Criar conta a receber manualmente (origem=manual; unicidade por número)."""
    numero = dup.garantir_numero_livre(db, nf.numero)
    tipo_enum, tipo_ab = _parse_tipo_create(nf.tipo, nf.tipo_abertura_fechamento)

    data_pag = nf.data_pagamento
    caixa = nf.caixa
    if data_pag is not None and caixa not in ("corrente", "investimento"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=_MSG_CAIXA_OBRIGATORIA,
        )

    status_nf = _calcular_status_nf(nf.data_vencimento, data_pag)

    db_nf = NF(
        numero=numero,
        razao_social=nf.razao_social,
        posicao=None,
        candidato=None,
        valor_bruto=nf.valor_bruto,
        valor_liquido=nf.valor_liquido,
        data_emissao=nf.data_emissao,
        data_vencimento=nf.data_vencimento,
        data_pagamento=data_pag,
        tipo=tipo_enum,
        tipo_abertura_fechamento=tipo_ab,
        status=status_nf,
        caixa=caixa,
        colaborador_lead_id=None,
        colaborador_conducao_id=None,
        colaborador_placement_id=None,
        arquivada=False,
        origem="manual",
    )
    try:
        db.add(db_nf)
        db.flush()
        registrar_auditoria(db, current_user, "criar", "NF", db_nf.id, f"NF {numero} criada (manual)")
        db.commit()
        db.refresh(db_nf)
    except IntegrityError as e:
        dup.raise_se_integrity_numero(db, e, numero)
    return db_nf

@router.put("/{nf_id}", response_model=NFResponse)
def atualizar_nf(
    nf_id: int,
    nf_update: NFUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    """Atualizar: manuais = negócio + enriquecimento; Maggo = só enriquecimento."""
    db_nf = db.query(NF).filter(NF.id == nf_id).first()

    if not db_nf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NF não encontrada"
        )

    dados_atualizacao = nf_update.model_dump(exclude_unset=True)
    origem = db_nf.origem or "maggo"

    if origem != "manual":
        negocio = _CAMPOS_NEGOCIO.intersection(dados_atualizacao.keys())
        if negocio:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=_MSG_CAMPO_MAGGO_RO,
            )

    if "numero" in dados_atualizacao:
        novo = dup.normalizar_numero(dados_atualizacao["numero"])
        if novo != db_nf.numero:
            dados_atualizacao["numero"] = dup.garantir_numero_livre(db, novo, excluir_id=db_nf.id)
        else:
            dados_atualizacao["numero"] = db_nf.numero

    if "tipo" in dados_atualizacao:
        tipo_ab = dados_atualizacao.get("tipo_abertura_fechamento", db_nf.tipo_abertura_fechamento)
        tipo_enum, tipo_ab_n = _parse_tipo_create(dados_atualizacao["tipo"], tipo_ab)
        dados_atualizacao["tipo"] = tipo_enum
        if "tipo_abertura_fechamento" in dados_atualizacao or dados_atualizacao.get("tipo"):
            dados_atualizacao["tipo_abertura_fechamento"] = tipo_ab_n

    for campo, valor in dados_atualizacao.items():
        if campo == "origem":
            continue
        setattr(db_nf, campo, valor)

    if "data_pagamento" in dados_atualizacao or "data_vencimento" in dados_atualizacao:
        db_nf.status = _calcular_status_nf(db_nf.data_vencimento, db_nf.data_pagamento)

    if db_nf.data_pagamento is not None and db_nf.caixa not in ("corrente", "investimento"):
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=_MSG_CAIXA_OBRIGATORIA,
        )

    try:
        registrar_auditoria(db, current_user, "editar", "NF", db_nf.id, f"NF {db_nf.numero} — campos: {', '.join(dados_atualizacao.keys())}")
        db.commit()
        db.refresh(db_nf)
    except IntegrityError as e:
        dup.raise_se_integrity_numero(db, e, db_nf.numero)

    return db_nf

@router.delete("/{nf_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_nf(
    nf_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=_MSG_EXCLUSAO_DESABILITADA)
