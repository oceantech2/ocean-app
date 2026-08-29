import json
from typing import Dict

from sqlalchemy.orm import Session

from app.models import ConfiguracaoApp

CHAVE_PAGINAS = "paginas_visibilidade"

PAGINAS_VISIBILIDADE_DEFAULT: Dict[str, bool] = {
    "dashboard": True,
    "calendario": True,
    "nfs": True,
    "contas": True,
    "fluxo_caixa": True,
    "impostos": True,
    "retiradas": True,
    "bonus": True,
    "dh": False,
    "colaboradores": True,
    "ferias": True,
    "patrimonio": True,
    "auditoria": True,
    "seguranca": True,
}


def _chaves_validas() -> set[str]:
    return set(PAGINAS_VISIBILIDADE_DEFAULT.keys())


def ler_paginas_visibilidade(db: Session) -> Dict[str, bool]:
    row = db.query(ConfiguracaoApp).filter(ConfiguracaoApp.chave == CHAVE_PAGINAS).first()
    base = dict(PAGINAS_VISIBILIDADE_DEFAULT)
    if not row:
        return base
    try:
        data = json.loads(row.valor)
        if isinstance(data, dict):
            for key in _chaves_validas():
                if key in data:
                    base[key] = bool(data[key])
    except (json.JSONDecodeError, TypeError):
        pass
    base["dashboard"] = True
    return base


def salvar_paginas_visibilidade(db: Session, parcial: Dict[str, bool]) -> Dict[str, bool]:
    atual = ler_paginas_visibilidade(db)
    validas = _chaves_validas()
    for key, valor in parcial.items():
        if key == "configuracoes" or key not in validas:
            continue
        atual[key] = bool(valor)
    atual["dashboard"] = True

    row = db.query(ConfiguracaoApp).filter(ConfiguracaoApp.chave == CHAVE_PAGINAS).first()
    payload = json.dumps(atual)
    if row:
        row.valor = payload
    else:
        db.add(ConfiguracaoApp(chave=CHAVE_PAGINAS, valor=payload))
    db.commit()
    return atual


def seed_paginas_visibilidade_json() -> str:
    return json.dumps(PAGINAS_VISIBILIDADE_DEFAULT)
