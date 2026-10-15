from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import Date, cast, func, or_, text
from sqlalchemy.orm import Session, joinedload

from app.api.routes.proposal_auth import get_proposal_user
from app.database import get_db
from app.models import Proposta, PropostaEdicao
from app.schemas import PropostaCreate
from app.services.audit import registrar_auditoria
from app.services.imposto_proposta import imposto_vigente
from app.services.proposta_modelos import (
    MODELO_SIMPLES,
    MODELOS,
    modelo_disponivel,
    validar_idioma,
    validar_modelo,
    validar_moeda,
)
from app.services.propostas import (
    MSG_NAO_ENCONTRADA,
    STATUS_FILTRO,
    STATUS_PENDENTES,
    calcular_hash,
    diff_campos,
    eh_simples,
    gerar_codigo,
    hoje_sp,
    pode_ver,
    serializar_detalhe,
    serializar_item,
    status_efetivo,
    validar_dados,
)

router = APIRouter()


def _obter_visivel(db: Session, proposta_id: int, user: dict, travar: bool = False) -> Proposta:
    q = db.query(Proposta).filter(Proposta.id == proposta_id)
    if travar:
        # FOR UPDATE não aceita o LEFT JOIN do joinedload; as relações carregam sob demanda
        q = q.with_for_update()
    else:
        q = q.options(joinedload(Proposta.assinatura), joinedload(Proposta.edicoes))
    p = q.first()
    if not p or not pode_ver(p, user):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=MSG_NAO_ENCONTRADA)
    return p


def _exigir_admin(user: dict) -> None:
    if user["papel"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ação permitida apenas para administradores")


def _contem(valor: str) -> str:
    """Padrão ILIKE de 'contém' tratando % e _ como texto literal (escape padrão do Postgres: \\)."""
    escapado = valor.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return f"%{escapado}%"


_PROJETO_CONTEM = text(
    "EXISTS (SELECT 1 FROM jsonb_array_elements(propostas.projetos) AS p "
    "WHERE p->>'nome' ILIKE :projeto_contem)"
)

# Mesma data da coluna Data da lista: data da proposta ou emissão (UTC) convertida para São Paulo
_DATA_EXIBIDA = func.coalesce(
    Proposta.data_proposta,
    cast(func.timezone("America/Sao_Paulo", func.timezone("UTC", Proposta.emitida_em)), Date),
)


@router.get("/")
def listar_propostas(
    status_filtro: Optional[str] = Query(None, alias="status"),
    empresa: Optional[str] = Query(None, max_length=255),
    modelo: Optional[str] = Query(None),
    projeto: Optional[str] = Query(None, max_length=255),
    data_de: Optional[date] = Query(None),
    data_ate: Optional[date] = Query(None),
    criado_por: Optional[str] = Query(None, max_length=255),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    q = db.query(Proposta)
    if user["papel"] != "admin":
        q = q.filter(Proposta.criado_por_id == user["id"])
    elif criado_por and criado_por.strip():
        q = q.filter(Proposta.criado_por_usuario == criado_por.strip())

    if empresa and empresa.strip():
        q = q.filter(Proposta.cliente_nome.ilike(_contem(empresa.strip())))
    if modelo:
        if modelo != MODELO_SIMPLES and modelo not in MODELOS:
            raise HTTPException(status_code=422, detail="Modelo inválido")
        q = q.filter(Proposta.modelo == modelo)
    if projeto and projeto.strip():
        padrao = _contem(projeto.strip())
        q = q.filter(or_(
            Proposta.projeto_nome.ilike(padrao),
            _PROJETO_CONTEM.bindparams(projeto_contem=padrao),
        ))
    if data_de:
        q = q.filter(_DATA_EXIBIDA >= data_de)
    if data_ate:
        q = q.filter(_DATA_EXIBIDA <= data_ate)

    if status_filtro:
        if status_filtro not in STATUS_FILTRO:
            raise HTTPException(status_code=422, detail="Status inválido")
        hoje = hoje_sp()
        if status_filtro == "expirada":
            q = q.filter(Proposta.status.in_(STATUS_PENDENTES), Proposta.validade < hoje)
        elif status_filtro in STATUS_PENDENTES:
            q = q.filter(Proposta.status == status_filtro, Proposta.validade >= hoje)
        else:
            q = q.filter(Proposta.status == status_filtro)

    total = q.count()
    itens = (
        q.order_by(Proposta.emitida_em.desc(), Proposta.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {
        "items": [serializar_item(p) for p in itens],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/imposto-vigente")
def obter_imposto_vigente(
    db: Session = Depends(get_db),
    _: dict = Depends(get_proposal_user),
):
    vigente = imposto_vigente(db)
    return {**vigente, "percentual": f"{vigente['percentual']:.2f}"}


@router.get("/autores")
def listar_autores(
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    _exigir_admin(user)
    linhas = db.query(Proposta.criado_por_usuario).distinct().order_by(Proposta.criado_por_usuario).all()
    return [linha[0] for linha in linhas]


@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_proposta(
    payload: PropostaCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    if not modelo_disponivel(payload.modelo):
        raise HTTPException(status_code=422, detail="Modelo de proposta inválido")
    dados = validar_modelo(payload, payload.modelo, hoje_sp())
    dados["moeda"] = validar_moeda(payload.moeda)
    dados["idioma"] = validar_idioma(payload.idioma)
    dados["imposto_percentual"] = imposto_vigente(db)["percentual"]

    codigo = gerar_codigo()
    while db.query(Proposta.id).filter(Proposta.codigo == codigo).first():
        codigo = gerar_codigo()

    p = Proposta(
        **dados,
        codigo=codigo,
        emitida_em=datetime.utcnow().replace(microsecond=0),
        status="aguardando",
        versao=1,
        criado_por_id=user["id"],
        criado_por_usuario=user["usuario"],
    )
    p.conteudo_hash = calcular_hash(p)
    db.add(p)
    db.commit()
    db.refresh(p)
    return serializar_detalhe(p)


@router.get("/{proposta_id}")
def obter_proposta(
    proposta_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    return serializar_detalhe(_obter_visivel(db, proposta_id, user))


@router.put("/{proposta_id}")
def editar_proposta(
    proposta_id: int,
    payload: PropostaCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    p = _obter_visivel(db, proposta_id, user, travar=True)
    status_atual = status_efetivo(p)
    if status_atual == "assinada":
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Proposta já assinada")
    if status_atual == "cancelada":
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Proposta cancelada não pode ser editada")

    try:
        if eh_simples(p):
            dados = validar_dados(payload, p.validade)
        else:
            if payload.modelo and payload.modelo != p.modelo:
                raise HTTPException(status_code=422, detail="O modelo da proposta não pode ser alterado")
            moeda = (payload.moeda or "").strip().upper()
            if moeda and moeda != p.moeda:
                raise HTTPException(status_code=422, detail="A moeda da proposta não pode ser alterada")
            idioma = (payload.idioma or "").strip()
            if idioma and idioma != p.idioma:
                raise HTTPException(status_code=422, detail="O idioma da proposta não pode ser alterado")
            dados = validar_modelo(payload, p.modelo, p.data_proposta)
            dados.pop("modelo")
            dados["imposto_percentual"] = imposto_vigente(db)["percentual"]
    except HTTPException:
        db.rollback()
        raise
    alteracoes = diff_campos(p, dados)
    if not alteracoes:
        db.rollback()
        return {**serializar_detalhe(p), "alterada": False}

    agora = datetime.utcnow().replace(microsecond=0)
    for campo, valor in dados.items():
        setattr(p, campo, valor)
    p.versao += 1
    p.atualizada_em = agora
    p.status = "aguardando"
    p.versao_visualizada_em = None
    p.conteudo_hash = calcular_hash(p)
    db.add(PropostaEdicao(
        proposta_id=p.id,
        versao=p.versao,
        editada_em=agora,
        editado_por_id=user["id"],
        editado_por_usuario=user["usuario"],
        alteracoes=alteracoes,
    ))
    db.commit()
    db.expire_all()
    return {**serializar_detalhe(_obter_visivel(db, proposta_id, user)), "alterada": True}


@router.post("/{proposta_id}/cancelar")
def cancelar_proposta(
    proposta_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    p = _obter_visivel(db, proposta_id, user)
    if status_efetivo(p) not in STATUS_PENDENTES:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Proposta não pode ser cancelada")
    atualizadas = (
        db.query(Proposta)
        .filter(
            Proposta.id == p.id,
            Proposta.status.in_(STATUS_PENDENTES),
            Proposta.validade >= hoje_sp(),
        )
        .update({"status": "cancelada", "cancelada_em": datetime.utcnow()}, synchronize_session=False)
    )
    if not atualizadas:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Proposta não pode ser cancelada")
    db.commit()
    db.expire_all()
    return serializar_detalhe(_obter_visivel(db, proposta_id, user))


@router.delete("/{proposta_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_proposta(
    proposta_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_proposal_user),
):
    """Exclusão definitiva (qualquer status); assinatura e edições saem por ON DELETE CASCADE."""
    _exigir_admin(user)
    p = _obter_visivel(db, proposta_id, user)
    registrar_auditoria(
        db, user["usuario"], "excluir", "Proposta", p.id,
        f"{p.codigo} — {p.cliente_nome} ({status_efetivo(p)})",
    )
    db.delete(p)
    db.commit()
    return None
