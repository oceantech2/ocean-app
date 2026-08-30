"""Sincronização de comissões vinculadas a Contas a receber (NF)."""
from __future__ import annotations

import json
from datetime import date
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Bonus, Colaborador, NF
from app.schemas import ComissaoLinhaInput
from app.services.audit import registrar_auditoria

ATIVIDADES_VALIDAS = frozenset({"lead", "venda", "conducao", "placement"})


def calcular_valor_bonus(percentual: float, valor_liquido: float) -> float:
    liquido = max(float(valor_liquido or 0), 0)
    return round((float(percentual) / 100.0) * liquido, 2)


def _atividades_json(atividades: List[str]) -> str:
    return json.dumps(list(dict.fromkeys(atividades)))


def _parse_atividades(raw: Optional[str]) -> List[str]:
    if not raw:
        return []
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            return [str(a) for a in parsed]
    except json.JSONDecodeError:
        pass
    return []


def _exigir_fornecedor_ativo(db: Session, colaborador_id: int) -> Colaborador:
    col = (
        db.query(Colaborador)
        .filter(Colaborador.id == colaborador_id, Colaborador.ativo.is_(True))
        .first()
    )
    if not col:
        raise HTTPException(status_code=422, detail="Fornecedor inativo ou inexistente")
    return col


def _preencher_de_nf(bonus: Bonus, nf: NF) -> None:
    bonus.nf_id = nf.id
    bonus.cliente = nf.razao_social
    bonus.posicao = nf.posicao
    bonus.numero_nf = nf.numero


def _aplicar_linha(db: Session, bonus: Bonus, linha: ComissaoLinhaInput, nf: NF) -> None:
    _exigir_fornecedor_ativo(db, linha.colaborador_id)
    bonus.colaborador_id = linha.colaborador_id
    bonus.mes = linha.mes
    bonus.ano = linha.ano
    bonus.atividades = _atividades_json(linha.atividades)
    bonus.etapa = linha.atividades[0]
    bonus.percentual = linha.percentual
    bonus.valor_bonus = calcular_valor_bonus(linha.percentual, nf.valor_liquido)
    _preencher_de_nf(bonus, nf)


def sincronizar(
    db: Session,
    nf: NF,
    linhas: Optional[List[ComissaoLinhaInput]],
    current_user: str,
) -> None:
    """Cria/atualiza/remove comissões não liberadas da NF."""
    if linhas is None:
        return

    existentes = db.query(Bonus).filter(Bonus.nf_id == nf.id).all()
    por_id = {b.id: b for b in existentes}
    ids_payload = {l.id for l in linhas if l.id}

    for linha in linhas:
        _exigir_fornecedor_ativo(db, linha.colaborador_id)
        if linha.id:
            bonus = por_id.get(linha.id)
            if not bonus:
                raise HTTPException(status_code=422, detail=f"Comissão {linha.id} não encontrada nesta conta")
            if bonus.liberado:
                raise HTTPException(status_code=422, detail="Comissão liberada não pode ser alterada")
            _aplicar_linha(db, bonus, linha, nf)
            registrar_auditoria(
                db, current_user, "editar", "Bonus", bonus.id,
                f"NF #{nf.id} — fornecedor {bonus.colaborador_id} — R$ {bonus.valor_bonus:,.2f}",
            )
        else:
            bonus = Bonus(
                colaborador_id=linha.colaborador_id,
                mes=linha.mes,
                ano=linha.ano,
                etapa=linha.atividades[0],
                atividades=_atividades_json(linha.atividades),
                percentual=linha.percentual,
                valor_bonus=calcular_valor_bonus(linha.percentual, nf.valor_liquido),
                liberado=False,
                pago=False,
            )
            _preencher_de_nf(bonus, nf)
            db.add(bonus)
            db.flush()
            registrar_auditoria(
                db, current_user, "criar", "Bonus", bonus.id,
                f"NF #{nf.id} — fornecedor {bonus.colaborador_id} — R$ {bonus.valor_bonus:,.2f}",
            )

    for bonus in existentes:
        if bonus.liberado:
            continue
        if bonus.id not in ids_payload:
            registrar_auditoria(
                db, current_user, "deletar", "Bonus", bonus.id,
                f"Removida do sync NF #{nf.id}",
            )
            db.delete(bonus)

    # Recalcular linhas não liberadas se valor líquido mudou (PUT da NF)
    for bonus in db.query(Bonus).filter(Bonus.nf_id == nf.id, Bonus.liberado.is_(False)).all():
        bonus.valor_bonus = calcular_valor_bonus(bonus.percentual, nf.valor_liquido)


def serializar_bonus(bonus: Bonus, nf: Optional[NF] = None) -> dict:
    atividades = _parse_atividades(bonus.atividades)
    if not atividades and bonus.etapa:
        atividades = [bonus.etapa]
    nf_ref = nf or bonus.nf
    return {
        "id": bonus.id,
        "colaborador_id": bonus.colaborador_id,
        "nf_id": bonus.nf_id,
        "mes": bonus.mes,
        "ano": bonus.ano,
        "etapa": bonus.etapa,
        "atividades": atividades,
        "percentual": bonus.percentual,
        "valor_bonus": bonus.valor_bonus,
        "liberado": bool(bonus.liberado),
        "pago": bool(bonus.pago),
        "data_liberacao": bonus.data_liberacao,
        "data_pagamento": bonus.data_pagamento,
        "cliente": bonus.cliente or (nf_ref.razao_social if nf_ref else None),
        "posicao": bonus.posicao or (nf_ref.posicao if nf_ref else None),
        "numero_nf": bonus.numero_nf or (nf_ref.numero if nf_ref else None),
        "criado_em": bonus.criado_em,
    }
