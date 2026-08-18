from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models import ContaCorrente

CODIGO_INVESTIMENTO = "investimento"
ROTULO_INVESTIMENTO = "Conta investimento"


def codigo_padrao(db: Session) -> str:
    row = db.query(ContaCorrente).filter(ContaCorrente.ativo.is_(True), ContaCorrente.padrao.is_(True)).first()
    if row:
        return row.codigo
    seed = db.query(ContaCorrente).filter(ContaCorrente.codigo == "corrente").first()
    return seed.codigo if seed else "corrente"


def contas_ativas(db: Session) -> list[ContaCorrente]:
    return (
        db.query(ContaCorrente)
        .filter(ContaCorrente.ativo.is_(True))
        .order_by(ContaCorrente.padrao.desc(), ContaCorrente.nome.asc())
        .all()
    )


def mapa_rotulos(db: Session) -> dict[str, str]:
    rotulos = {CODIGO_INVESTIMENTO: ROTULO_INVESTIMENTO}
    for c in db.query(ContaCorrente).all():
        rotulos[c.codigo] = c.nome
    return rotulos


def rotulo(db: Session, codigo: str) -> str:
    return mapa_rotulos(db).get(codigo, codigo)


def caixa_permitido(db: Session, codigo: str, *, exigir_ativa: bool = True) -> bool:
    if codigo == CODIGO_INVESTIMENTO:
        return True
    q = db.query(ContaCorrente).filter(ContaCorrente.codigo == codigo)
    if exigir_ativa:
        q = q.filter(ContaCorrente.ativo.is_(True))
    return q.first() is not None


def exigir_caixa(db: Session, codigo: str | None, *, exigir_ativa: bool = True) -> str:
    if not codigo or not caixa_permitido(db, codigo, exigir_ativa=exigir_ativa):
        raise HTTPException(status_code=400, detail="caixa inválido")
    return codigo


def exigir_conta_corrente(db: Session, codigo: str | None) -> str:
    if not codigo or codigo == CODIGO_INVESTIMENTO:
        raise HTTPException(status_code=400, detail="caixa inválido")
    return exigir_caixa(db, codigo, exigir_ativa=True)
