from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import extract
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
import io
import os
from app.database import get_db
from app.models import ContaPagar, Colaborador
from app.schemas import (
    CatalogoCategoriasContas,
    CategoriaCadastradaCreate,
    CategoriaCadastradaResponse,
    SubcategoriaRhCreate,
    SubcategoriaRhResponse,
    ContaPagarCreate,
    ContaPagarResponse,
    ContaPagarUpdate,
    ContasDatasLoteRequest,
    ContasDatasLoteResponse,
)
from app.api.routes.auth import get_current_user, require_admin
from app.services.audit import registrar_auditoria
from app.services import excel_io
from app.services import categorias_contas as cat_svc
from app.services.caixas import exigir_conta_corrente, mapa_rotulos, codigo_padrao
from app.services import anexo_nf

router = APIRouter()

TIPOS_DESPESA = frozenset({"fixo", "variavel", "imposto_das"})


def _rotulo_tipo_despesa(tipo: str | None) -> str:
    t = (tipo or "").strip().lower()
    if t == "fixo":
        return "Fixo"
    if t == "imposto_das":
        return "Imposto / DAS"
    return "Variável"


def _validar_tipo_despesa(tipo: str | None) -> str:
    t = (tipo or "variavel").strip().lower()
    if t not in TIPOS_DESPESA:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Tipo deve ser Fixo, Variável ou Imposto / DAS",
        )
    return t


def _resolver_tipo_import(raw: str | None) -> str:
    if raw is None or str(raw).strip() == "":
        return "variavel"
    t = str(raw).strip().lower().replace(" ", "_").replace("/", "_")
    aliases = {
        "fixo": "fixo",
        "variavel": "variavel",
        "variável": "variavel",
        "imposto_das": "imposto_das",
        "imposto__das": "imposto_das",
        "imposto": "imposto_das",
        "impostos": "imposto_das",
        "das": "imposto_das",
    }
    # rótulos com espaços/barra
    label = str(raw).strip().casefold()
    if label in {"imposto / das", "imposto/das", "imposto das"}:
        return "imposto_das"
    if t in aliases:
        return aliases[t]
    if t in TIPOS_DESPESA:
        return t
    raise ValueError("Tipo deve ser Fixo, Variável ou Imposto / DAS")


def _validar_categoria_para_tipo(
    db: Session,
    tipo: str,
    categoria: str | None,
    subcategoria: str | None,
) -> tuple[str | None, str | None]:
    if cat_svc.eh_categoria_impostos_rejeitada(categoria):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Categoria Impostos não é mais válida; use o Tipo Imposto / DAS",
        )
    try:
        if tipo == "imposto_das":
            return cat_svc.validar_classificacao(
                categoria, subcategoria, permitir_vazia=True, db=db
            )
        return cat_svc.validar_classificacao(categoria, subcategoria, db=db)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )


def _resolver_caixa_conta(db: Session, caixa_in: str | None) -> str:
    codigo = caixa_in or codigo_padrao(db)
    return exigir_conta_corrente(db, codigo)


def _validar_fornecedor_id(db: Session, fornecedor_id: int | None, atual: ContaPagar | None = None):
    if fornecedor_id is None:
        return None
    f = db.query(Colaborador).filter(Colaborador.id == fornecedor_id).first()
    if not f or f.tipo != "fornecedor":
        raise HTTPException(status_code=400, detail="Fornecedor inválido")
    if not f.ativo and (not atual or atual.fornecedor_id != fornecedor_id):
        raise HTTPException(status_code=400, detail="Fornecedor inativo")
    return fornecedor_id


@router.delete("/todas", status_code=status.HTTP_403_FORBIDDEN)
def deletar_todas_contas(
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    """Exclusão em massa descontinuada."""
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Exclusão em massa de contas a pagar foi descontinuada",
    )


@router.post("/acoes/editar-datas", response_model=ContasDatasLoteResponse)
def editar_datas_lote(
    body: ContasDatasLoteRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    """Aplica data de vencimento e/ou pagamento em massa. Null/omitido = não alterar."""
    aplicar_venc = body.data_vencimento is not None
    aplicar_pag = body.data_pagamento is not None
    if not aplicar_venc and not aplicar_pag:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Informe data de vencimento e/ou data de pagamento",
        )

    processados = ignorados = 0
    for cid in body.ids:
        conta = db.query(ContaPagar).filter(ContaPagar.id == cid).first()
        if not conta:
            ignorados += 1
            continue

        old_venc = conta.data_vencimento
        old_pag = conta.data_pagamento
        old_pago = conta.pago
        old_caixa = conta.caixa

        if aplicar_venc:
            conta.data_vencimento = body.data_vencimento

        if aplicar_pag:
            conta.data_pagamento = body.data_pagamento
            conta.pago = True
            if not conta.caixa:
                try:
                    conta.caixa = _resolver_caixa_conta(db, None)
                except HTTPException:
                    conta.data_vencimento = old_venc
                    conta.data_pagamento = old_pag
                    conta.pago = old_pago
                    conta.caixa = old_caixa
                    ignorados += 1
                    continue
            if not conta.caixa:
                conta.data_vencimento = old_venc
                conta.data_pagamento = old_pag
                conta.pago = old_pago
                conta.caixa = old_caixa
                ignorados += 1
                continue

        campos = []
        if aplicar_venc:
            campos.append("data_vencimento")
        if aplicar_pag:
            campos.append("data_pagamento")
        registrar_auditoria(
            db,
            current_user,
            "editar",
            "ContaPagar",
            conta.id,
            f"{conta.descricao} — lote datas: {', '.join(campos)}",
        )
        processados += 1

    db.commit()
    return ContasDatasLoteResponse(processados=processados, ignorados=ignorados)


@router.post("/importar-xlsx")
def importar_contas_xlsx(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    """Importa Contas a Pagar a partir do arquivo Fluxo de Caixa .xlsx."""
    conteudo = file.file.read()
    try:
        registros = excel_io.parse_contas_xlsx(conteudo)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    ok, erros = 0, []
    for r in registros:
        try:
            db.begin_nested()
            tipo = _resolver_tipo_import(r.get("tipo") or r.get("tipo_despesa"))
            cat_bruta = r.get("categoria")
            if cat_svc.eh_categoria_impostos_rejeitada(cat_bruta):
                raise ValueError(
                    "Categoria Impostos não é mais válida; use o Tipo Imposto / DAS"
                )
            resolvida = cat_svc.resolver_import_categoria(cat_bruta, db) or cat_bruta
            if cat_svc.eh_categoria_impostos_rejeitada(resolvida):
                raise ValueError(
                    "Categoria Impostos não é mais válida; use o Tipo Imposto / DAS"
                )
            sub_bruta = r.get("subcategoria")
            sub_resolvida = cat_svc.resolver_import_subcategoria(sub_bruta, db) or sub_bruta
            cat, sub = cat_svc.validar_classificacao(
                resolvida,
                sub_resolvida,
                permitir_vazia=(tipo == "imposto_das"),
                db=db,
            )
            padrao = codigo_padrao(db)
            nova = ContaPagar(
                descricao=r["descricao"],
                categoria=cat,
                subcategoria=sub,
                categoria_pendente=False,
                valor=r["valor"],
                data_vencimento=r["data_vencimento"],
                data_pagamento=r.get("data_pagamento"),
                pago=r.get("pago", False),
                caixa=exigir_conta_corrente(db, padrao),
                tipo_despesa=tipo,
            )
            db.add(nova)
            db.flush()
            registrar_auditoria(db, current_user, "criar", "ContaPagar", nova.id,
                                f"Importado: {nova.descricao}")
            ok += 1
        except Exception as e:
            db.rollback()
            erros.append(f"Linha {r.get('_linha')}: {e}")

    db.commit()
    return {"ok": ok, "erros": erros}


@router.get("/categorias", response_model=CatalogoCategoriasContas)
def listar_categorias_contas(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return cat_svc.listar_catalogo(db)


@router.post(
    "/categorias",
    response_model=CategoriaCadastradaResponse,
    status_code=status.HTTP_201_CREATED,
)
def criar_categoria_cadastrada(
    body: CategoriaCadastradaCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    try:
        row = cat_svc.criar_cadastrada(db, body.nome, criado_por=current_user)
        registrar_auditoria(
            db,
            current_user,
            "criar",
            "CategoriaPagarCadastrada",
            row.id,
            row.nome,
        )
        db.commit()
        db.refresh(row)
        return row
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Já existe uma categoria com este nome",
        )


@router.patch("/categorias/{cat_id}", response_model=CategoriaCadastradaResponse)
def atualizar_categoria_cadastrada(
    cat_id: int,
    body: CategoriaCadastradaCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    try:
        row = cat_svc.atualizar_cadastrada(db, cat_id, body.nome)
        registrar_auditoria(
            db, current_user, "atualizar", "CategoriaPagarCadastrada", row.id, row.nome
        )
        db.commit()
        db.refresh(row)
        return row
    except LookupError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Já existe uma categoria com este nome",
        )


@router.delete("/categorias/{cat_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_categoria_cadastrada(
    cat_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    try:
        cat_svc.excluir_cadastrada(db, cat_id)
        registrar_auditoria(
            db, current_user, "excluir", "CategoriaPagarCadastrada", cat_id, None
        )
        db.commit()
    except LookupError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.post(
    "/categorias/subcategorias-rh",
    response_model=SubcategoriaRhResponse,
    status_code=status.HTTP_201_CREATED,
)
def criar_subcategoria_rh(
    body: SubcategoriaRhCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    try:
        row = cat_svc.criar_subcategoria_rh(db, body.nome, criado_por=current_user)
        registrar_auditoria(
            db, current_user, "criar", "SubcategoriaRhCadastrada", row.id, row.nome
        )
        db.commit()
        db.refresh(row)
        return row
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Já existe uma subcategoria com este nome",
        )


@router.patch("/categorias/subcategorias-rh/{sub_id}", response_model=SubcategoriaRhResponse)
def atualizar_subcategoria_rh(
    sub_id: int,
    body: SubcategoriaRhCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    try:
        row = cat_svc.atualizar_subcategoria_rh(db, sub_id, body.nome)
        registrar_auditoria(
            db, current_user, "atualizar", "SubcategoriaRhCadastrada", row.id, row.nome
        )
        db.commit()
        db.refresh(row)
        return row
    except LookupError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Já existe uma subcategoria com este nome",
        )


@router.delete("/categorias/subcategorias-rh/{sub_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_subcategoria_rh(
    sub_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    try:
        cat_svc.excluir_subcategoria_rh(db, sub_id)
        registrar_auditoria(
            db, current_user, "excluir", "SubcategoriaRhCadastrada", sub_id, None
        )
        db.commit()
    except LookupError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        detail = str(e)
        code = (
            status.HTTP_409_CONFLICT
            if "usando" in detail.lower()
            else status.HTTP_422_UNPROCESSABLE_ENTITY
        )
        db.rollback()
        raise HTTPException(status_code=code, detail=detail)


def _rotulo_mes_ano_coluna(data_vencimento) -> str:
    if not data_vencimento:
        return "—"
    meses = (
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    )
    try:
        return f"{meses[data_vencimento.month - 1]}/{data_vencimento.year}"
    except (AttributeError, IndexError):
        return "—"


def _rotulo_status_conta(conta: ContaPagar) -> str:
    if conta.pago:
        return "Pago"
    if conta.data_vencimento and not conta.pago:
        from datetime import date
        hoje = date.today()
        if conta.data_vencimento < hoje:
            return "Vencida"
    return "Pendente"


@router.get("/exportar-xlsx")
def exportar_contas_xlsx(
    mes: int = Query(None, ge=1, le=12),
    ano: int = Query(None),
    categoria: Optional[str] = Query(None),
    subcategoria: Optional[str] = Query(None),
    pago: bool = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Exporta Contas a Pagar no formato do modelo xlsx."""
    query = db.query(ContaPagar).options(joinedload(ContaPagar.fornecedor)).order_by(ContaPagar.data_vencimento)

    if categoria:
        cat = cat_svc.normalizar_codigo(categoria)
        query = query.filter(
            ContaPagar.categoria == cat,
            ContaPagar.categoria_pendente == False,  # noqa: E712
        )
        if subcategoria:
            if cat != cat_svc.CATEGORIA_RH:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="subcategoria só se aplica a Recursos Humanos",
                )
            query = query.filter(ContaPagar.subcategoria == cat_svc.normalizar_codigo(subcategoria))
    if pago is not None:
        query = query.filter(ContaPagar.pago == pago)
    if mes and ano:
        query = query.filter(
            extract("month", ContaPagar.data_vencimento) == mes,
            extract("year", ContaPagar.data_vencimento) == ano,
        )
    elif ano:
        query = query.filter(extract("year", ContaPagar.data_vencimento) == ano)

    contas = query.all()
    rotulos = mapa_rotulos(db)
    dados = [
        {
            "descricao": c.descricao,
            "categoria_rotulo": cat_svc.label_categoria(
                c.categoria,
                pendente=c.categoria_pendente,
                subcategoria=c.subcategoria,
                db=db,
            ),
            "mes_ano_rotulo": _rotulo_mes_ano_coluna(c.data_vencimento),
            "fornecedor_nome": c.fornecedor.nome if c.fornecedor else "",
            "valor": c.valor,
            "pago": c.pago,
            "data_vencimento": c.data_vencimento,
            "data_pagamento": c.data_pagamento,
            "caixa_rotulo": rotulos.get(c.caixa) if c.caixa else "",
            "tipo_rotulo": _rotulo_tipo_despesa(getattr(c, "tipo_despesa", None)),
            "status_rotulo": _rotulo_status_conta(c),
        }
        for c in contas
    ]
    xlsx_bytes = excel_io.preencher_template_contas(dados, mes=mes, ano=ano)
    nome = f"contas_{ano or 'todos'}{'_' + str(mes).zfill(2) if mes else ''}.xlsx"
    return StreamingResponse(
        io.BytesIO(xlsx_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{nome}"'},
    )


@router.get("/", response_model=List[ContaPagarResponse])
def listar_contas(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    categoria: Optional[str] = Query(None),
    subcategoria: Optional[str] = Query(None),
    pago: bool = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Listar contas a pagar com filtros por categoria/subcategoria."""
    query = db.query(ContaPagar).options(joinedload(ContaPagar.fornecedor))

    if categoria:
        cat = cat_svc.normalizar_codigo(categoria)
        query = query.filter(
            ContaPagar.categoria == cat,
            ContaPagar.categoria_pendente == False,  # noqa: E712
        )
        if subcategoria:
            if cat != cat_svc.CATEGORIA_RH:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="subcategoria só se aplica a Recursos Humanos",
                )
            query = query.filter(ContaPagar.subcategoria == cat_svc.normalizar_codigo(subcategoria))
    if pago is not None:
        query = query.filter(ContaPagar.pago == pago)

    contas = query.offset(skip).limit(limit).all()
    return contas


@router.get("/{conta_id}", response_model=ContaPagarResponse)
def obter_conta(
    conta_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Obter uma conta específica"""
    conta = db.query(ContaPagar).options(joinedload(ContaPagar.fornecedor)).filter(ContaPagar.id == conta_id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    return conta


@router.post("/", response_model=ContaPagarResponse, status_code=status.HTTP_201_CREATED)
def criar_conta(
    conta: ContaPagarCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    """Criar uma nova conta a pagar"""
    tipo = _validar_tipo_despesa(conta.tipo_despesa)
    cat, sub = _validar_categoria_para_tipo(db, tipo, conta.categoria, conta.subcategoria)

    if conta.valor is None or conta.valor <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Valor deve ser maior que zero",
        )

    dados = conta.dict()
    dados["categoria"] = cat
    dados["subcategoria"] = sub
    dados["fornecedor_id"] = _validar_fornecedor_id(db, dados.get("fornecedor_id"))
    dados["tipo_despesa"] = tipo
    caixa_in = dados.pop("caixa", None)
    dados["caixa"] = _resolver_caixa_conta(db, caixa_in)
    data_pag = dados.get("data_pagamento")
    if data_pag:
        dados["pago"] = True
    else:
        dados["data_pagamento"] = None
        dados["pago"] = False
    nova_conta = ContaPagar(**dados, categoria_pendente=False)
    db.add(nova_conta)
    db.flush()
    registrar_auditoria(db, current_user, "criar", "ContaPagar", nova_conta.id, f"{nova_conta.descricao} — R$ {nova_conta.valor:,.2f}")
    db.commit()
    db.refresh(nova_conta)
    db.refresh(nova_conta, attribute_names=["fornecedor"])
    return nova_conta


@router.put("/{conta_id}", response_model=ContaPagarResponse)
def atualizar_conta(
    conta_id: int,
    conta_update: ContaPagarUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    """Atualizar uma conta. Pagamento/descrição sem forçar reclassificação."""
    db_conta = db.query(ContaPagar).options(joinedload(ContaPagar.fornecedor)).filter(ContaPagar.id == conta_id).first()
    if not db_conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")

    dados = conta_update.dict(exclude_unset=True)
    caixa_pedido = dados.pop("caixa") if "caixa" in dados else None
    caixa_informado = "caixa" in conta_update.model_fields_set

    if "fornecedor_id" in dados:
        dados["fornecedor_id"] = _validar_fornecedor_id(db, dados.get("fornecedor_id"), db_conta)

    tipo_final = (
        _validar_tipo_despesa(dados["tipo_despesa"])
        if "tipo_despesa" in dados
        else _validar_tipo_despesa(getattr(db_conta, "tipo_despesa", None))
    )
    if "tipo_despesa" in dados:
        dados["tipo_despesa"] = tipo_final

    precisa_reclassificar = (
        "categoria" in dados
        or "subcategoria" in dados
        or "tipo_despesa" in dados
    )
    if precisa_reclassificar:
        cat_in = dados["categoria"] if "categoria" in dados else db_conta.categoria
        sub_in = dados["subcategoria"] if "subcategoria" in dados else db_conta.subcategoria
        # limpar categoria explicitamente (string vazia / None) quando Imposto / DAS
        if "categoria" in dados and (dados.get("categoria") is None or str(dados.get("categoria") or "").strip() == ""):
            cat_in = None
            sub_in = None
        cat, sub = _validar_categoria_para_tipo(db, tipo_final, cat_in, sub_in)
        dados["categoria"] = cat
        dados["subcategoria"] = sub
        dados["categoria_pendente"] = False

    for campo, valor in dados.items():
        setattr(db_conta, campo, valor)

    if "data_pagamento" in dados:
        if dados["data_pagamento"]:
            db_conta.pago = True
        else:
            db_conta.pago = False
            db_conta.data_pagamento = None
    elif "pago" in dados:
        if dados["pago"] and not db_conta.data_pagamento:
            from datetime import date as _date
            db_conta.data_pagamento = _date.today()
        elif not dados["pago"]:
            db_conta.data_pagamento = None

    if caixa_informado:
        db_conta.caixa = _resolver_caixa_conta(db, caixa_pedido)
    elif not db_conta.caixa:
        db_conta.caixa = _resolver_caixa_conta(db, None)

    if db_conta.pago and not db_conta.caixa:
        raise HTTPException(status_code=400, detail="caixa inválido")

    acao_desc = "marcou como paga" if dados.get("pago") else f"campos: {', '.join(dados.keys())}"
    registrar_auditoria(db, current_user, "editar", "ContaPagar", db_conta.id, f"{db_conta.descricao} — {acao_desc}")
    db.commit()
    db.refresh(db_conta)
    db.refresh(db_conta, attribute_names=["fornecedor"])
    return db_conta


@router.delete("/{conta_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_conta(
    conta_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    """Deletar uma conta"""
    db_conta = db.query(ContaPagar).filter(ContaPagar.id == conta_id).first()
    if not db_conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    anexo_nf.remover_arquivo(db_conta.comprovante_path)
    registrar_auditoria(db, current_user, "deletar", "ContaPagar", db_conta.id, f"{db_conta.descricao} — R$ {db_conta.valor:,.2f}")
    db.delete(db_conta)
    db.commit()
    return None


@router.post("/{conta_id}/comprovante", status_code=status.HTTP_201_CREATED)
async def upload_comprovante(
    conta_id: int,
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    db_conta = db.query(ContaPagar).filter(ContaPagar.id == conta_id).first()
    if not db_conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")

    conteudo = await arquivo.read()
    caminho = anexo_nf.gravar("comprovante", conta_id, arquivo.filename, conteudo, db_conta.comprovante_path)

    db_conta.comprovante_path = caminho
    db_conta.comprovante_nome = arquivo.filename
    registrar_auditoria(db, current_user, "editar", "ContaPagar", conta_id, f"Comprovante anexado: {arquivo.filename}")
    db.commit()
    return {"comprovante_nome": arquivo.filename}


@router.get("/{conta_id}/comprovante")
def download_comprovante(
    conta_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    db_conta = db.query(ContaPagar).filter(ContaPagar.id == conta_id).first()
    if not db_conta or not db_conta.comprovante_path:
        raise HTTPException(status_code=404, detail="Comprovante não encontrado")
    if not os.path.exists(db_conta.comprovante_path):
        raise HTTPException(status_code=404, detail="Arquivo não encontrado no servidor")
    return FileResponse(
        db_conta.comprovante_path,
        filename=db_conta.comprovante_nome or "comprovante",
        media_type=anexo_nf.media_type(db_conta.comprovante_path, db_conta.comprovante_nome),
        content_disposition_type="inline",
    )


@router.delete("/{conta_id}/comprovante", status_code=status.HTTP_204_NO_CONTENT)
def remover_comprovante(
    conta_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    db_conta = db.query(ContaPagar).filter(ContaPagar.id == conta_id).first()
    if not db_conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    anexo_nf.remover_arquivo(db_conta.comprovante_path)
    db_conta.comprovante_path = None
    db_conta.comprovante_nome = None
    db.commit()
    return None
