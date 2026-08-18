from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Response
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, extract, func, cast, Date as SADate
from sqlalchemy.exc import IntegrityError
from typing import List, Set, Optional, Literal, Tuple
from datetime import date
import io
import os
from app.database import get_db
from app.models import NF, StatusNF, TipoFechamento
from app.schemas import NFCreate, NFResponse, NFUpdate
from app.api.routes.auth import get_current_user, require_admin
from app.services.audit import registrar_auditoria
from app.services import excel_io
from app.services.maggo_stub import listar_contas_receber, MaggoStubError
from app.services import nf_duplicidade as dup
from app.services.caixas import codigo_padrao, exigir_conta_corrente, mapa_rotulos
from app.services import anexo_nf

router = APIRouter()

_MSG_EXCLUSAO_DESABILITADA = "Exclusão desabilitada — Contas a Receber são geridas pela fonte Maggo"
_MSG_NF_EXIGE_EMISSAO = "Data de emissão é obrigatória quando o número da NF é informado"


def _parse_tipo_maggo(tipo: str | None, tipo_ab: str | None) -> TipoFechamento | None:
    """Converte payload Maggo (semântica antiga) para o enum oficial. None = tipo desconhecido."""
    t = (tipo or "").strip().lower()
    ab = (tipo_ab or "").strip().lower() or None
    if t == "retainer":
        if ab == "fechamento":
            return TipoFechamento.SUCESSO
        return TipoFechamento.RETAINER
    if t == "sucesso":
        return TipoFechamento.PARCELAMENTO
    if t == "parcelamento":
        return TipoFechamento.PARCELAMENTO
    return None


def _parse_tipo_create(tipo: str, tipo_ab: str | None = None) -> TipoFechamento:
    """Create/update manual: só valores oficiais (retainer | sucesso | parcelamento)."""
    t = (tipo or "").strip().lower()
    mapping = {
        "retainer": TipoFechamento.RETAINER,
        "sucesso": TipoFechamento.SUCESSO,
        "parcelamento": TipoFechamento.PARCELAMENTO,
    }
    if t not in mapping:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="tipo deve ser retainer, sucesso ou parcelamento",
        )
    return mapping[t]


def _calcular_status_nf(data_vencimento: date | None, data_pagamento) -> StatusNF:
    """Paga se tem data_pagamento; vencida só com vencimento passado; senão pendente (incl. sem vencimento)."""
    if data_pagamento:
        return StatusNF.PAGA
    if data_vencimento and data_vencimento < date.today():
        return StatusNF.VENCIDA
    return StatusNF.PENDENTE


def _expr_data_ref():
    """Data de referência da listagem: emissão, senão data ent. pgto, senão criado_em."""
    return func.coalesce(NF.data_emissao, NF.data_ent_pgto, cast(NF.criado_em, SADate))


def _filtrar_periodo(query, mes: int | None, ano: int | None):
    ref = _expr_data_ref()
    if mes and ano:
        inicio = date(ano, mes, 1)
        fim = date(ano + 1, 1, 1) if mes == 12 else date(ano, mes + 1, 1)
        return query.filter(and_(ref >= inicio, ref < fim))
    if ano:
        return query.filter(extract("year", ref) == ano)
    return query


def _exigir_emissao_se_numero(numero, data_emissao) -> None:
    if numero and not data_emissao:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=_MSG_NF_EXIGE_EMISSAO,
        )


def _sync_maggo_stub(db: Session) -> Tuple[Set[str], List[str]]:
    """Merge stub Maggo → nfs por maggo_id. Preserva grupo Ocean e registros manuais.
    Retorna (ids no stub, maggo_ids ignorados por colisão com origem manual).
    """
    itens = listar_contas_receber()
    ids: Set[str] = set()
    colisoes: List[str] = []
    for item in itens:
        maggo_id = (item.get("maggo_id") or "").strip()
        if not maggo_id:
            continue
        ids.add(maggo_id)
        tipo_enum = _parse_tipo_maggo(item.get("tipo"), item.get("tipo_abertura_fechamento"))
        if tipo_enum is None:
            continue
        db_nf = db.query(NF).filter(NF.maggo_id == maggo_id).first()
        if db_nf:
            if (db_nf.origem or "maggo") == "manual":
                colisoes.append(maggo_id)
                continue
            # Não sobrescreve grupo Maggo em registro já existente — Ocean pode editar.
        else:
            db_nf = NF(
                maggo_id=maggo_id,
                numero=None,
                razao_social=item["razao_social"],
                posicao=item.get("posicao"),
                candidato=item.get("candidato"),
                valor_bruto=item["valor_bruto"],
                valor_imposto=item.get("valor_imposto"),
                valor_liquido=item["valor_liquido"],
                data_ent_pgto=item.get("data_ent_pgto"),
                data_emissao=None,
                data_vencimento=None,
                tipo=tipo_enum,
                tipo_abertura_fechamento=None,
                status=StatusNF.PENDENTE,
                arquivada=False,
                origem="maggo",
            )
            db.add(db_nf)
    db.commit()
    return ids, colisoes


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

    query = _filtrar_periodo(query, mes, ano)

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
            tipo_enum = TipoFechamento.PARCELAMENTO
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
                tipo_abertura_fechamento=None,
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
    query = _filtrar_periodo(query, mes, ano)

    nfs = query.order_by(NF.data_emissao.nulls_last()).all()

    rotulos = mapa_rotulos(db)
    dados = []
    for nf in nfs:
        dados.append({
            "numero": nf.numero,
            "razao_social": nf.razao_social,
            "posicao": nf.posicao,
            "valor_bruto": nf.valor_bruto,
            "valor_imposto": nf.valor_imposto,
            "valor_liquido": nf.valor_liquido,
            "data_ent_pgto": nf.data_ent_pgto,
            "data_emissao": nf.data_emissao,
            "data_vencimento": nf.data_vencimento,
            "data_pagamento": nf.data_pagamento,
            "lead_nome": nf.colaborador_lead.nome if nf.colaborador_lead else None,
            "conducao_nome": nf.colaborador_conducao.nome if nf.colaborador_conducao else None,
            "placement_nome": nf.colaborador_placement.nome if nf.colaborador_placement else None,
            "caixa": nf.caixa,
            "caixa_rotulo": rotulos.get(nf.caixa) if nf.caixa else "",
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
    query = _filtrar_periodo(query, mes, ano)

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


def _limpar_anexo_disco(db_nf: NF) -> None:
    anexo_nf.remover_arquivo(db_nf.anexo_path)
    db_nf.anexo_path = None
    db_nf.anexo_nome = None


@router.post("/{nf_id}/anexo", status_code=status.HTTP_201_CREATED)
async def upload_anexo_nf(
    nf_id: int,
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    db_nf = db.query(NF).filter(NF.id == nf_id).first()
    if not db_nf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="NF não encontrada")
    conteudo = await arquivo.read()
    caminho = anexo_nf.gravar("anexo_nf", nf_id, arquivo.filename, conteudo, db_nf.anexo_path)
    db_nf.anexo_path = caminho
    db_nf.anexo_nome = arquivo.filename
    registrar_auditoria(db, current_user, "editar", "NF", nf_id, f"NF anexada: {arquivo.filename}")
    db.commit()
    return {"anexo_nome": arquivo.filename}


@router.get("/{nf_id}/anexo")
def download_anexo_nf(
    nf_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    db_nf = db.query(NF).filter(NF.id == nf_id).first()
    if not db_nf or not db_nf.anexo_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Anexo não encontrado")
    if not os.path.exists(db_nf.anexo_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Arquivo não encontrado no servidor")
    return FileResponse(
        db_nf.anexo_path,
        filename=db_nf.anexo_nome or "nota-fiscal",
        media_type=anexo_nf.media_type(db_nf.anexo_path, db_nf.anexo_nome),
        content_disposition_type="inline",
    )


@router.delete("/{nf_id}/anexo", status_code=status.HTTP_204_NO_CONTENT)
def remover_anexo_nf(
    nf_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    db_nf = db.query(NF).filter(NF.id == nf_id).first()
    if not db_nf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="NF não encontrada")
    _limpar_anexo_disco(db_nf)
    db.commit()
    return None


@router.post("/", response_model=NFResponse, status_code=status.HTTP_201_CREATED)
def criar_nf(
    nf: NFCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    """Criar conta a receber manualmente (origem=manual; NF e datas Ocean opcionais)."""
    numero = dup.garantir_numero_livre(db, nf.numero)
    _exigir_emissao_se_numero(numero, nf.data_emissao)
    tipo_enum = _parse_tipo_create(nf.tipo)

    data_pag = nf.data_pagamento
    if data_pag is not None:
        caixa = exigir_conta_corrente(db, nf.caixa) if nf.caixa else codigo_padrao(db)
    else:
        caixa = None

    status_nf = _calcular_status_nf(nf.data_vencimento, data_pag)

    db_nf = NF(
        maggo_id=None,
        numero=numero,
        razao_social=nf.razao_social,
        posicao=nf.posicao,
        candidato=nf.candidato,
        valor_bruto=nf.valor_bruto,
        valor_imposto=nf.valor_imposto,
        valor_liquido=nf.valor_liquido,
        data_ent_pgto=nf.data_ent_pgto,
        data_emissao=nf.data_emissao,
        data_vencimento=nf.data_vencimento,
        data_pagamento=data_pag,
        tipo=tipo_enum,
        tipo_abertura_fechamento=None,
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
        registrar_auditoria(db, current_user, "criar", "NF", db_nf.id, f"NF {numero or '(sem número)'} criada (manual)")
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
    """Atualizar conta a receber (grupos Maggo e Ocean)."""
    db_nf = db.query(NF).filter(NF.id == nf_id).first()

    if not db_nf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NF não encontrada"
        )

    pagamento_antes = db_nf.data_pagamento
    dados_atualizacao = nf_update.model_dump(exclude_unset=True)
    caixa_pedido = dados_atualizacao.pop("caixa", None)

    if "numero" in dados_atualizacao:
        dados_atualizacao["numero"] = dup.garantir_numero_livre(
            db, dados_atualizacao.get("numero"), excluir_id=db_nf.id
        )

    if "tipo" in dados_atualizacao:
        dados_atualizacao["tipo"] = _parse_tipo_create(dados_atualizacao["tipo"])
        dados_atualizacao["tipo_abertura_fechamento"] = None

    for campo, valor in dados_atualizacao.items():
        if campo in ("origem", "maggo_id"):
            continue
        setattr(db_nf, campo, valor)

    try:
        _exigir_emissao_se_numero(db_nf.numero, db_nf.data_emissao)
    except HTTPException:
        db.rollback()
        raise

    if "data_pagamento" in dados_atualizacao or "data_vencimento" in dados_atualizacao:
        db_nf.status = _calcular_status_nf(db_nf.data_vencimento, db_nf.data_pagamento)

    if pagamento_antes is None and db_nf.data_pagamento is not None:
        db_nf.caixa = exigir_conta_corrente(db, caixa_pedido) if caixa_pedido else codigo_padrao(db)
    elif db_nf.data_pagamento is None:
        db_nf.caixa = None
    elif caixa_pedido is not None:
        db_nf.caixa = exigir_conta_corrente(db, caixa_pedido)

    try:
        registrar_auditoria(db, current_user, "editar", "NF", db_nf.id, f"NF {db_nf.numero or '(sem número)'} — campos: {', '.join(dados_atualizacao.keys())}")
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
    # Exclusão desabilitada (Maggo). Se for reativada, chamar _limpar_anexo_disco antes do delete.
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=_MSG_EXCLUSAO_DESABILITADA)
