from fastapi import APIRouter, Depends, HTTPException, Query, status
from uuid import uuid4
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.models import ContaCorrente
from app.schemas import ContaCorrenteCreate, ContaCorrenteUpdate, ContaCorrenteResponse
from app.api.routes.auth import get_current_user, require_admin
from app.services.audit import registrar_auditoria
from app.services.caixas import ROTULO_INVESTIMENTO

router = APIRouter()


def _strip(v: str | None) -> str:
    return (v or "").strip()


def _nome_reservado(nome: str) -> bool:
    return nome.casefold() == ROTULO_INVESTIMENTO.casefold()


def _nome_duplicado(db: Session, nome: str, excluir_id: int | None = None) -> bool:
    q = db.query(ContaCorrente).filter(
        ContaCorrente.ativo.is_(True),
        ContaCorrente.nome.ilike(nome),
    )
    if excluir_id is not None:
        q = q.filter(ContaCorrente.id != excluir_id)
    return q.first() is not None


@router.get("/", response_model=list[ContaCorrenteResponse])
def listar(
    ativas: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    q = db.query(ContaCorrente)
    if ativas:
        q = q.filter(ContaCorrente.ativo.is_(True))
    return q.order_by(ContaCorrente.padrao.desc(), ContaCorrente.nome.asc()).all()


@router.post("/", response_model=ContaCorrenteResponse, status_code=status.HTTP_201_CREATED)
def criar(
    dados: ContaCorrenteCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    nome = _strip(dados.nome)
    banco = _strip(dados.banco)
    if not nome or not banco:
        raise HTTPException(status_code=400, detail="Nome e banco são obrigatórios")
    if _nome_reservado(nome):
        raise HTTPException(status_code=400, detail="Nome reservado para a conta investimento")
    if _nome_duplicado(db, nome):
        raise HTTPException(status_code=400, detail="Já existe uma conta corrente ativa com este nome")

    row = ContaCorrente(
        codigo=f"tmp_{uuid4().hex}",
        nome=nome,
        banco=banco,
        agencia=_strip(dados.agencia) or None,
        numero=_strip(dados.numero) or None,
        padrao=False,
        ativo=True,
    )
    db.add(row)
    db.flush()
    row.codigo = f"cc_{row.id}"
    registrar_auditoria(db, current_user, "criar", "ContaCorrente", row.id, nome)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Não foi possível gravar a conta corrente")
    db.refresh(row)
    return row


@router.put("/{conta_id}", response_model=ContaCorrenteResponse)
def atualizar(
    conta_id: int,
    dados: ContaCorrenteUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    row = db.query(ContaCorrente).filter(ContaCorrente.id == conta_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Conta corrente não encontrada")

    payload = dados.model_dump(exclude_unset=True)

    if "nome" in payload:
        nome = _strip(payload["nome"])
        if not nome:
            raise HTTPException(status_code=400, detail="Nome é obrigatório")
        if _nome_reservado(nome):
            raise HTTPException(status_code=400, detail="Nome reservado para a conta investimento")
        if row.ativo and _nome_duplicado(db, nome, excluir_id=row.id):
            raise HTTPException(status_code=400, detail="Já existe uma conta corrente ativa com este nome")
        row.nome = nome
    if "banco" in payload:
        banco = _strip(payload["banco"])
        if not banco:
            raise HTTPException(status_code=400, detail="Banco é obrigatório")
        row.banco = banco
    if "agencia" in payload:
        row.agencia = _strip(payload.get("agencia")) or None
    if "numero" in payload:
        row.numero = _strip(payload.get("numero")) or None

    tornar_padrao = payload.get("padrao") is True
    desativar = payload.get("ativo") is False
    reativar = payload.get("ativo") is True

    if desativar:
        if row.padrao:
            raise HTTPException(status_code=400, detail="Defina outra conta como padrão antes de desativar")
        ativas = db.query(ContaCorrente).filter(ContaCorrente.ativo.is_(True), ContaCorrente.id != row.id).count()
        if ativas == 0:
            raise HTTPException(status_code=400, detail="Não é possível desativar a última conta corrente")
        row.ativo = False
        row.padrao = False

    if reativar:
        if _nome_duplicado(db, row.nome, excluir_id=row.id):
            raise HTTPException(status_code=400, detail="Já existe uma conta corrente ativa com este nome")
        row.ativo = True

    if tornar_padrao:
        if not row.ativo:
            raise HTTPException(status_code=400, detail="Só uma conta ativa pode ser a padrão")
        db.query(ContaCorrente).filter(ContaCorrente.id != row.id).update({"padrao": False})
        row.padrao = True

    registrar_auditoria(db, current_user, "editar", "ContaCorrente", row.id, row.nome)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Não foi possível atualizar a conta corrente")
    db.refresh(row)
    return row
