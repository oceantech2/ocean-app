from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import extract
from typing import List, Optional
import io
import os
import uuid
from app.database import get_db
from app.models import ContaPagar
from app.schemas import ContaPagarCreate, ContaPagarResponse, ContaPagarUpdate
from app.api.routes.auth import get_current_user, require_admin
from app.services.audit import registrar_auditoria
from app.services import excel_io
from app.services import categorias_contas as cat_svc
from app.config import settings

router = APIRouter()


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
            cat, sub = cat_svc.validar_classificacao(r.get("categoria"), r.get("subcategoria"))
            nova = ContaPagar(
                descricao=r["descricao"],
                categoria=cat,
                subcategoria=sub,
                categoria_pendente=False,
                valor=r["valor"],
                data_vencimento=r["data_vencimento"],
                data_pagamento=r.get("data_pagamento"),
                pago=r.get("pago", False),
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


@router.get("/exportar-xlsx")
def exportar_contas_xlsx(
    mes: int = Query(None, ge=1, le=12),
    ano: int = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Exporta Contas a Pagar no formato do modelo xlsx."""
    query = db.query(ContaPagar).order_by(ContaPagar.data_vencimento)
    if mes and ano:
        query = query.filter(
            extract("month", ContaPagar.data_vencimento) == mes,
            extract("year", ContaPagar.data_vencimento) == ano,
        )
    elif ano:
        query = query.filter(extract("year", ContaPagar.data_vencimento) == ano)

    contas = query.all()
    dados = [
        {
            "descricao": c.descricao,
            "valor": c.valor,
            "pago": c.pago,
            "data_vencimento": c.data_vencimento,
            "data_pagamento": c.data_pagamento,
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
    query = db.query(ContaPagar)

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
    conta = db.query(ContaPagar).filter(ContaPagar.id == conta_id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    return conta


@router.post("/", response_model=ContaPagarResponse, status_code=status.HTTP_201_CREATED)
def criar_conta(
    conta: ContaPagarCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Criar uma nova conta a pagar"""
    try:
        cat, sub = cat_svc.validar_classificacao(conta.categoria, conta.subcategoria)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    dados = conta.dict()
    dados["categoria"] = cat
    dados["subcategoria"] = sub
    nova_conta = ContaPagar(**dados, categoria_pendente=False)
    if nova_conta.data_pagamento and not nova_conta.pago:
        nova_conta.pago = True
    elif nova_conta.pago and not nova_conta.data_pagamento:
        from datetime import date as _date
        nova_conta.data_pagamento = _date.today()
    db.add(nova_conta)
    db.flush()
    registrar_auditoria(db, current_user, "criar", "ContaPagar", nova_conta.id, f"{nova_conta.descricao} — R$ {nova_conta.valor:,.2f}")
    db.commit()
    db.refresh(nova_conta)
    return nova_conta


@router.put("/{conta_id}", response_model=ContaPagarResponse)
def atualizar_conta(
    conta_id: int,
    conta_update: ContaPagarUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Atualizar uma conta. Pagamento/descrição sem forçar reclassificação."""
    db_conta = db.query(ContaPagar).filter(ContaPagar.id == conta_id).first()
    if not db_conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")

    dados = conta_update.dict(exclude_unset=True)

    if "categoria" in dados:
        try:
            cat, sub = cat_svc.validar_classificacao(
                dados.get("categoria"),
                dados.get("subcategoria") if "subcategoria" in dados else db_conta.subcategoria,
            )
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
        dados["categoria"] = cat
        dados["subcategoria"] = sub
        dados["categoria_pendente"] = False
    elif "subcategoria" in dados and not db_conta.categoria_pendente:
        try:
            cat, sub = cat_svc.validar_classificacao(db_conta.categoria, dados.get("subcategoria"))
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
        dados["categoria"] = cat
        dados["subcategoria"] = sub

    for campo, valor in dados.items():
        setattr(db_conta, campo, valor)

    if "data_pagamento" in dados and dados["data_pagamento"] and not db_conta.pago:
        db_conta.pago = True
    elif "pago" in dados:
        if dados["pago"] and not db_conta.data_pagamento:
            from datetime import date as _date
            db_conta.data_pagamento = _date.today()
        elif not dados["pago"]:
            db_conta.data_pagamento = None

    acao_desc = "marcou como paga" if dados.get("pago") else f"campos: {', '.join(dados.keys())}"
    registrar_auditoria(db, current_user, "editar", "ContaPagar", db_conta.id, f"{db_conta.descricao} — {acao_desc}")
    db.commit()
    db.refresh(db_conta)
    return db_conta


@router.delete("/{conta_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_conta(
    conta_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Deletar uma conta"""
    db_conta = db.query(ContaPagar).filter(ContaPagar.id == conta_id).first()
    if not db_conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    if db_conta.comprovante_path and os.path.exists(db_conta.comprovante_path):
        os.remove(db_conta.comprovante_path)
    registrar_auditoria(db, current_user, "deletar", "ContaPagar", db_conta.id, f"{db_conta.descricao} — R$ {db_conta.valor:,.2f}")
    db.delete(db_conta)
    db.commit()
    return None


@router.post("/{conta_id}/comprovante", status_code=status.HTTP_201_CREATED)
async def upload_comprovante(
    conta_id: int,
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    db_conta = db.query(ContaPagar).filter(ContaPagar.id == conta_id).first()
    if not db_conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")

    conteudo = await arquivo.read()
    if len(conteudo) > settings.UPLOAD_MAX_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"Arquivo excede {settings.UPLOAD_MAX_MB} MB")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    if db_conta.comprovante_path and os.path.exists(db_conta.comprovante_path):
        os.remove(db_conta.comprovante_path)

    ext = os.path.splitext(arquivo.filename or "")[1]
    nome_arquivo = f"comprovante_{conta_id}_{uuid.uuid4().hex}{ext}"
    caminho = os.path.join(settings.UPLOAD_DIR, nome_arquivo)
    with open(caminho, "wb") as f:
        f.write(conteudo)

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
        media_type="application/octet-stream",
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
    if db_conta.comprovante_path and os.path.exists(db_conta.comprovante_path):
        os.remove(db_conta.comprovante_path)
    db_conta.comprovante_path = None
    db_conta.comprovante_nome = None
    db.commit()
    return None
