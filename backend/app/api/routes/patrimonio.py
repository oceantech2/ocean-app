from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.database import get_db
from app.models import Patrimonio, Colaborador
from app.api.routes.auth import get_current_user, require_admin

router = APIRouter()


def _serializar(p: Patrimonio) -> dict:
    return {
        "id": p.id,
        "colaborador_id": p.colaborador_id,
        "colaborador_nome": p.colaborador.nome if p.colaborador else None,
        "descricao": p.descricao,
        "tipo": p.tipo,
        "numero_serie": p.numero_serie,
        "marca": p.marca,
        "modelo": p.modelo,
        "valor_aquisicao": p.valor_aquisicao,
        "data_aquisicao": str(p.data_aquisicao) if p.data_aquisicao else None,
        "status": p.status,
        "observacao": p.observacao,
        "criado_em": p.criado_em.isoformat() if p.criado_em else None,
    }


@router.get("/")
def listar(
    colaborador_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    tipo: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    q = db.query(Patrimonio).options(joinedload(Patrimonio.colaborador))
    if colaborador_id is not None:
        q = q.filter(Patrimonio.colaborador_id == colaborador_id)
    if status:
        q = q.filter(Patrimonio.status == status)
    if tipo:
        q = q.filter(Patrimonio.tipo == tipo)
    registros = q.order_by(Patrimonio.id.desc()).offset(skip).limit(limit).all()
    return [_serializar(p) for p in registros]


@router.post("/", status_code=status.HTTP_201_CREATED)
def criar(
    dados: dict,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    from datetime import date as date_type
    data_aq = None
    if dados.get("data_aquisicao"):
        try:
            data_aq = date_type.fromisoformat(dados["data_aquisicao"])
        except ValueError:
            pass

    p = Patrimonio(
        colaborador_id=dados.get("colaborador_id") or None,
        descricao=dados.get("descricao", ""),
        tipo=dados.get("tipo", "Outro"),
        numero_serie=dados.get("numero_serie") or None,
        marca=dados.get("marca") or None,
        modelo=dados.get("modelo") or None,
        valor_aquisicao=float(dados["valor_aquisicao"]) if dados.get("valor_aquisicao") else None,
        data_aquisicao=data_aq,
        status=dados.get("status", "ativo"),
        observacao=dados.get("observacao") or None,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    # reload with join
    db.expire(p)
    p = db.query(Patrimonio).options(joinedload(Patrimonio.colaborador)).filter(Patrimonio.id == p.id).first()
    return _serializar(p)


@router.put("/{patrimonio_id}")
def atualizar(
    patrimonio_id: int,
    dados: dict,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    from datetime import date as date_type
    p = db.query(Patrimonio).filter(Patrimonio.id == patrimonio_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patrimônio não encontrado")

    campos = ["descricao", "tipo", "numero_serie", "marca", "modelo", "status", "observacao"]
    for campo in campos:
        if campo in dados:
            setattr(p, campo, dados[campo] or None if campo not in ("descricao", "tipo", "status") else dados[campo])

    if "colaborador_id" in dados:
        p.colaborador_id = dados["colaborador_id"] or None
    if "valor_aquisicao" in dados:
        p.valor_aquisicao = float(dados["valor_aquisicao"]) if dados["valor_aquisicao"] else None
    if "data_aquisicao" in dados and dados["data_aquisicao"]:
        try:
            p.data_aquisicao = date_type.fromisoformat(dados["data_aquisicao"])
        except ValueError:
            pass
    elif "data_aquisicao" in dados:
        p.data_aquisicao = None

    db.commit()
    db.refresh(p)
    db.expire(p)
    p = db.query(Patrimonio).options(joinedload(Patrimonio.colaborador)).filter(Patrimonio.id == p.id).first()
    return _serializar(p)


@router.delete("/{patrimonio_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(
    patrimonio_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    p = db.query(Patrimonio).filter(Patrimonio.id == patrimonio_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patrimônio não encontrado")
    db.delete(p)
    db.commit()
    return None
