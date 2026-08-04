from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date as date_type
from app.database import get_db
from app.models import FluxoMovimento
from app.api.routes.auth import get_current_user, require_admin

router = APIRouter()


@router.get("/")
def listar_movimentos(
    mes: int = Query(None),
    ano: int = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    q = db.query(FluxoMovimento)
    if mes is not None:
        q = q.filter(FluxoMovimento.mes == mes)
    if ano is not None:
        q = q.filter(FluxoMovimento.ano == ano)
    registros = q.order_by(FluxoMovimento.data_movimento.desc()).all()
    return [
        {
            "id": r.id,
            "tipo": r.tipo,
            "descricao": r.descricao,
            "valor": r.valor,
            "data_movimento": str(r.data_movimento),
            "mes": r.mes,
            "ano": r.ano,
        }
        for r in registros
    ]


@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_movimento(
    dados: dict,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    tipo = dados.get("tipo", "receita")
    if tipo not in ("receita", "despesa"):
        raise HTTPException(status_code=400, detail="tipo deve ser 'receita' ou 'despesa'")

    data_str = dados.get("data_movimento") or str(date_type.today())
    data_obj = date_type.fromisoformat(data_str)

    mov = FluxoMovimento(
        tipo=tipo,
        descricao=dados.get("descricao", ""),
        valor=float(dados.get("valor", 0)),
        data_movimento=data_obj,
        mes=data_obj.month,
        ano=data_obj.year,
    )
    db.add(mov)
    db.commit()
    db.refresh(mov)
    return {
        "id": mov.id,
        "tipo": mov.tipo,
        "descricao": mov.descricao,
        "valor": mov.valor,
        "data_movimento": str(mov.data_movimento),
        "mes": mov.mes,
        "ano": mov.ano,
    }


@router.delete("/{movimento_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_movimento(
    movimento_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    mov = db.query(FluxoMovimento).filter(FluxoMovimento.id == movimento_id).first()
    if not mov:
        raise HTTPException(status_code=404, detail="Movimento não encontrado")
    db.delete(mov)
    db.commit()
    return None
