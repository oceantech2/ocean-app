from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date as date_type
from uuid import uuid4
from app.database import get_db
from app.models import FluxoMovimento
from app.api.routes.auth import get_current_user, require_admin

router = APIRouter()
transferencias_router = APIRouter()

CONTAS_VALIDAS = ("corrente", "investimento")
ROTULOS_CONTA = {
    "corrente": "Conta corrente",
    "investimento": "Conta investimento",
}


def _serializar(r: FluxoMovimento) -> dict:
    return {
        "id": r.id,
        "tipo": r.tipo,
        "descricao": r.descricao,
        "valor": r.valor,
        "data_movimento": str(r.data_movimento),
        "mes": r.mes,
        "ano": r.ano,
        "conta": r.conta or "corrente",
        "par_id": r.par_id,
    }


def _descricao_perna(lado: str, origem: str, destino: str, observacao: str | None) -> str:
    if lado == "origem":
        base = f"Transferência para {ROTULOS_CONTA[destino]}"
    else:
        base = f"Transferência de {ROTULOS_CONTA[origem]}"
    extra = (observacao or "").strip()
    return f"{base} — {extra}" if extra else base


@router.get("/")
def listar_movimentos(
    mes: int = Query(None),
    ano: int = Query(None),
    conta: str = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    q = db.query(FluxoMovimento)
    if mes is not None:
        q = q.filter(FluxoMovimento.mes == mes)
    if ano is not None:
        q = q.filter(FluxoMovimento.ano == ano)
    if conta:
        if conta not in CONTAS_VALIDAS:
            raise HTTPException(status_code=400, detail="conta deve ser 'corrente' ou 'investimento'")
        q = q.filter(FluxoMovimento.conta == conta)
    registros = q.order_by(FluxoMovimento.data_movimento.desc()).all()
    return [_serializar(r) for r in registros]


@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_movimento(
    dados: dict,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    tipo = dados.get("tipo", "receita")
    if tipo not in ("receita", "despesa"):
        raise HTTPException(status_code=400, detail="tipo deve ser 'receita' ou 'despesa'")

    conta = dados.get("conta") or "corrente"
    if conta not in CONTAS_VALIDAS:
        raise HTTPException(status_code=400, detail="conta deve ser 'corrente' ou 'investimento'")

    data_str = dados.get("data_movimento") or str(date_type.today())
    data_obj = date_type.fromisoformat(data_str)

    mov = FluxoMovimento(
        tipo=tipo,
        descricao=dados.get("descricao", ""),
        valor=float(dados.get("valor", 0)),
        data_movimento=data_obj,
        mes=data_obj.month,
        ano=data_obj.year,
        conta=conta,
    )
    db.add(mov)
    db.commit()
    db.refresh(mov)
    return _serializar(mov)


@router.delete("/{movimento_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_movimento(
    movimento_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    mov = db.query(FluxoMovimento).filter(FluxoMovimento.id == movimento_id).first()
    if not mov:
        raise HTTPException(status_code=404, detail="Movimento não encontrado")
    if mov.par_id:
        raise HTTPException(status_code=400, detail="Desfaça a transferência completa")
    db.delete(mov)
    db.commit()
    return None


@transferencias_router.post("", status_code=status.HTTP_201_CREATED)
@transferencias_router.post("/", status_code=status.HTTP_201_CREATED)
def criar_transferencia(
    dados: dict,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    origem = dados.get("origem")
    destino = dados.get("destino")
    if origem not in CONTAS_VALIDAS or destino not in CONTAS_VALIDAS:
        raise HTTPException(status_code=400, detail="origem e destino devem ser 'corrente' ou 'investimento'")
    if origem == destino:
        raise HTTPException(status_code=400, detail="origem e destino devem ser caixas distintos")

    try:
        valor = float(dados.get("valor", 0))
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="valor inválido")
    if valor <= 0:
        raise HTTPException(status_code=400, detail="valor deve ser maior que zero")

    data_str = dados.get("data_movimento")
    if not data_str:
        raise HTTPException(status_code=400, detail="data_movimento é obrigatória")
    try:
        data_obj = date_type.fromisoformat(str(data_str))
    except ValueError:
        raise HTTPException(status_code=400, detail="data_movimento inválida")

    observacao = dados.get("observacao")
    par_id = str(uuid4())

    saida = FluxoMovimento(
        tipo="despesa",
        descricao=_descricao_perna("origem", origem, destino, observacao),
        valor=valor,
        data_movimento=data_obj,
        mes=data_obj.month,
        ano=data_obj.year,
        conta=origem,
        par_id=par_id,
    )
    entrada = FluxoMovimento(
        tipo="receita",
        descricao=_descricao_perna("destino", origem, destino, observacao),
        valor=valor,
        data_movimento=data_obj,
        mes=data_obj.month,
        ano=data_obj.year,
        conta=destino,
        par_id=par_id,
    )
    db.add(saida)
    db.add(entrada)
    db.commit()
    db.refresh(saida)
    db.refresh(entrada)
    return [_serializar(saida), _serializar(entrada)]


@transferencias_router.delete("/{par_id}", status_code=status.HTTP_204_NO_CONTENT)
@transferencias_router.delete("/{par_id}/", status_code=status.HTTP_204_NO_CONTENT)
def desfazer_transferencia(
    par_id: str,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    pernas = db.query(FluxoMovimento).filter(FluxoMovimento.par_id == par_id).all()
    if not pernas:
        raise HTTPException(status_code=404, detail="Transferência não encontrada")
    for mov in pernas:
        db.delete(mov)
    db.commit()
    return None
