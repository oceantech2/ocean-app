"""Sincronização de bônus (tipo=bonus) vinculados a Contas a receber (NF)."""
from __future__ import annotations

from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Bonus, Colaborador, NF
from app.schemas import BonusLinhaInput
from app.services.audit import registrar_auditoria
from app.services.comissoes_sync import _preencher_de_nf

TIPO_BONUS = "bonus"


def _exigir_fornecedor_ativo(db: Session, colaborador_id: int) -> Colaborador:
    col = (
        db.query(Colaborador)
        .filter(Colaborador.id == colaborador_id, Colaborador.ativo.is_(True))
        .first()
    )
    if not col:
        raise HTTPException(status_code=422, detail="Fornecedor inativo ou inexistente")
    return col


def _como_linha(linha: BonusLinhaInput | dict) -> BonusLinhaInput:
    if isinstance(linha, BonusLinhaInput):
        return linha
    return BonusLinhaInput.model_validate(linha)


def _aplicar_linha(db: Session, bonus: Bonus, linha: BonusLinhaInput, nf: NF) -> None:
    _exigir_fornecedor_ativo(db, linha.colaborador_id)
    bonus.tipo = TIPO_BONUS
    bonus.colaborador_id = linha.colaborador_id
    bonus.mes = linha.mes
    bonus.ano = linha.ano
    bonus.valor_bonus = round(float(linha.valor), 2)
    bonus.percentual = None
    bonus.etapa = None
    bonus.atividades = None
    _preencher_de_nf(bonus, nf)


def sincronizar_bonus(
    db: Session,
    nf: NF,
    linhas: Optional[List[BonusLinhaInput | dict]],
    current_user: str,
) -> None:
    """Cria/atualiza/remove bônus não liberados da NF. Não recalcula valor pelo líquido."""
    if linhas is None:
        return

    linhas = [_como_linha(l) for l in linhas]
    existentes = db.query(Bonus).filter(Bonus.nf_id == nf.id, Bonus.tipo == TIPO_BONUS).all()
    por_id = {b.id: b for b in existentes}
    ids_payload = {l.id for l in linhas if l.id}

    for linha in linhas:
        _exigir_fornecedor_ativo(db, linha.colaborador_id)
        if linha.id:
            bonus = por_id.get(linha.id)
            if not bonus:
                raise HTTPException(status_code=422, detail=f"Bônus {linha.id} não encontrado nesta conta")
            if bonus.tipo != TIPO_BONUS:
                raise HTTPException(status_code=422, detail=f"Bônus {linha.id} não encontrado nesta conta")
            if bonus.liberado:
                # Eco do formulário da conta: linha travada permanece; demais campos da NF podem gravar.
                continue
            _aplicar_linha(db, bonus, linha, nf)
            registrar_auditoria(
                db, current_user, "editar", "Bonus", bonus.id,
                f"NF #{nf.id} — tipo bonus — fornecedor {bonus.colaborador_id} — R$ {bonus.valor_bonus:,.2f}",
            )
        else:
            bonus = Bonus(
                colaborador_id=linha.colaborador_id,
                mes=linha.mes,
                ano=linha.ano,
                tipo=TIPO_BONUS,
                etapa=None,
                atividades=None,
                percentual=None,
                valor_bonus=round(float(linha.valor), 2),
                liberado=False,
                pago=False,
            )
            _preencher_de_nf(bonus, nf)
            db.add(bonus)
            db.flush()
            registrar_auditoria(
                db, current_user, "criar", "Bonus", bonus.id,
                f"NF #{nf.id} — tipo bonus — fornecedor {bonus.colaborador_id} — R$ {bonus.valor_bonus:,.2f}",
            )

    for bonus in existentes:
        if bonus.liberado:
            continue
        if bonus.id not in ids_payload:
            registrar_auditoria(
                db, current_user, "deletar", "Bonus", bonus.id,
                f"Removido do sync bonus NF #{nf.id}",
            )
            db.delete(bonus)
