from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import io
from app.database import get_db
from app.models import Colaborador, Ferias
from app.schemas import ColaboradorCreate, ColaboradorResponse, ColaboradorUpdate
from app.api.routes.auth import get_current_user, require_admin
from app.services.audit import registrar_auditoria
from app.services import excel_io

router = APIRouter()

@router.get("/", response_model=List[ColaboradorResponse])
def listar_colaboradores(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    ativo: bool = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Listar todos os colaboradores com paginação"""
    query = db.query(Colaborador)
    
    if ativo is not None:
        query = query.filter(Colaborador.ativo == ativo)
    
    total = query.count()
    colaboradores = query.offset(skip).limit(limit).all()
    
    return colaboradores

@router.post("/importar-xlsx")
def importar_colaboradores_xlsx(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    """Importa colaboradores + férias a partir da aba 'Colaboradores' do arquivo modelo .xlsx
    (best effort, reporta sucesso/erro por linha). CPF é a chave de deduplicação."""
    conteudo = file.file.read()
    try:
        registros = excel_io.parse_colaboradores_xlsx(conteudo)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    ok = 0
    erros: list[str] = []

    for reg in registros:
        linha = reg["_linha"]
        try:
            if not reg.get("nome"):
                erros.append(f"Linha {linha}: Nome vazio, ignorada")
                continue
            if not reg.get("cpf"):
                erros.append(f"Linha {linha}: CPF vazio, ignorada")
                continue
            if reg.get("cargo") is None:
                erros.append(f"Linha {linha}: Posição/cargo vazio, ignorada")
                continue
            if reg.get("salario") is None:
                erros.append(f"Linha {linha}: Salário inválido, ignorada")
                continue
            if reg.get("data_nascimento") is None:
                erros.append(f"Linha {linha}: Nascimento inválido, ignorada")
                continue

            db_colab = db.query(Colaborador).filter(Colaborador.cpf == reg["cpf"]).first()
            if db_colab:
                db_colab.nome = reg["nome"]
                db_colab.cargo = reg["cargo"]
                db_colab.salario = reg["salario"]
                db_colab.data_nascimento = reg["data_nascimento"]
                db_colab.endereco_completo = reg.get("endereco_completo")
                if reg.get("data_admissao"):
                    db_colab.data_admissao = reg["data_admissao"]
                if reg.get("data_desligamento"):
                    db_colab.data_desligamento = reg["data_desligamento"]
            else:
                db_colab = Colaborador(
                    nome=reg["nome"],
                    cpf=reg["cpf"],
                    cargo=reg["cargo"],
                    salario=reg["salario"],
                    data_nascimento=reg["data_nascimento"],
                    endereco_completo=reg.get("endereco_completo"),
                    data_admissao=reg.get("data_admissao"),
                    data_desligamento=reg.get("data_desligamento"),
                )
                db.add(db_colab)
                db.flush()

            for f in reg.get("ferias", []):
                ja_existe = db.query(Ferias).filter(
                    Ferias.colaborador_id == db_colab.id,
                    Ferias.data_inicio == f["data_inicio"],
                    Ferias.data_fim == f["data_fim"],
                ).first()
                if ja_existe:
                    continue
                db.add(Ferias(
                    colaborador_id=db_colab.id,
                    ano=f["ano"],
                    dias_direito=f["dias_direito"],
                    dias_tirados=f["dias_tirados"],
                    data_inicio=f["data_inicio"],
                    data_fim=f["data_fim"],
                    aprovado=True,
                ))

            ok += 1
        except Exception as e:
            erros.append(f"Linha {linha}: erro inesperado — {e}")

    registrar_auditoria(db, current_user, "criar", "Colaborador", None, f"Importação xlsx: {ok} colaboradores processados, {len(erros)} avisos/erros")
    db.commit()

    return {"ok": ok, "erros": erros}


@router.get("/exportar-xlsx")
def exportar_colaboradores_xlsx(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Exporta colaboradores + férias preenchendo o template oficial (aba 'Colaboradores')."""
    colaboradores = db.query(Colaborador).order_by(Colaborador.nome).all()

    dados = []
    for c in colaboradores:
        ferias_ordenadas = sorted(
            [f for f in c.ferias if f.data_inicio and f.data_fim],
            key=lambda f: f.data_inicio
        )[:5]
        dados.append({
            "nome": c.nome,
            "cpf": c.cpf,
            "cargo": c.cargo,
            "salario": c.salario,
            "data_nascimento": c.data_nascimento,
            "endereco_completo": c.endereco_completo,
            "data_admissao": c.data_admissao,
            "data_desligamento": c.data_desligamento,
            "ferias": [
                {"data_inicio": f.data_inicio, "data_fim": f.data_fim, "dias_tirados": f.dias_tirados}
                for f in ferias_ordenadas
            ],
        })

    conteudo = excel_io.preencher_template_colaboradores(dados)

    return StreamingResponse(
        io.BytesIO(conteudo),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=colaboradores_ocean.xlsx"},
    )


@router.get("/{colaborador_id}", response_model=ColaboradorResponse)
def obter_colaborador(
    colaborador_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Obter um colaborador específico"""
    colaborador = db.query(Colaborador).filter(Colaborador.id == colaborador_id).first()
    
    if not colaborador:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Colaborador não encontrado"
        )
    
    return colaborador

@router.post("/", response_model=ColaboradorResponse, status_code=status.HTTP_201_CREATED)
def criar_colaborador(
    colaborador: ColaboradorCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Criar um novo colaborador"""
    # Verificar se CPF já existe
    db_colaborador = db.query(Colaborador).filter(Colaborador.cpf == colaborador.cpf).first()
    if db_colaborador:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Colaborador com este CPF já existe"
        )
    
    dados = colaborador.dict()
    if dados.get('data_admissao') is None:
        dados.pop('data_admissao', None)
    novo_colaborador = Colaborador(**dados)
    db.add(novo_colaborador)
    db.flush()
    registrar_auditoria(db, current_user, "criar", "Colaborador", novo_colaborador.id, f"{novo_colaborador.nome} — {novo_colaborador.cargo}")
    db.commit()
    db.refresh(novo_colaborador)

    return novo_colaborador

@router.put("/{colaborador_id}", response_model=ColaboradorResponse)
def atualizar_colaborador(
    colaborador_id: int,
    colaborador_update: ColaboradorUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Atualizar um colaborador"""
    db_colaborador = db.query(Colaborador).filter(Colaborador.id == colaborador_id).first()
    
    if not db_colaborador:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Colaborador não encontrado"
        )
    
    dados_atualizacao = colaborador_update.dict(exclude_unset=True)
    for campo, valor in dados_atualizacao.items():
        setattr(db_colaborador, campo, valor)

    reativando = dados_atualizacao.get("ativo") is True
    desc = "reativou" if reativando else f"campos: {', '.join(dados_atualizacao.keys())}"
    registrar_auditoria(db, current_user, "editar", "Colaborador", db_colaborador.id, f"{db_colaborador.nome} — {desc}")
    db.commit()
    db.refresh(db_colaborador)

    return db_colaborador

@router.delete("/{colaborador_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_colaborador(
    colaborador_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Soft delete — marca colaborador como inativo (mantém no banco)."""
    db_colaborador = db.query(Colaborador).filter(Colaborador.id == colaborador_id).first()
    if not db_colaborador:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Colaborador não encontrado")

    from datetime import datetime
    db_colaborador.ativo = False
    db_colaborador.data_desligamento = datetime.utcnow()
    registrar_auditoria(db, current_user, "deletar", "Colaborador", db_colaborador.id, f"Desligou {db_colaborador.nome}")
    db.commit()
    return None


@router.delete("/{colaborador_id}/permanente", status_code=status.HTTP_204_NO_CONTENT)
def excluir_colaborador_permanente(
    colaborador_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    """Hard delete — remove permanentemente o colaborador e todos os seus registros do banco."""
    db_colaborador = db.query(Colaborador).filter(Colaborador.id == colaborador_id).first()
    if not db_colaborador:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Colaborador não encontrado")

    nome = db_colaborador.nome
    registrar_auditoria(db, current_user, "deletar", "Colaborador", colaborador_id, f"Exclusão permanente: {nome}")
    db.delete(db_colaborador)
    db.commit()
    return None



