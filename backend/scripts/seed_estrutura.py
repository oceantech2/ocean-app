#!/usr/bin/env python3
"""
Seed estrutural sob demanda (não roda no startup do backend).

Recria:
  - subcategorias RH padrão
  - conta corrente padrão (codigo=corrente)
  - configuracao_app.paginas_visibilidade

Uso (no container backend, cwd /app):
  python scripts/seed_estrutura.py

Usa DATABASE_URL / settings do ambiente — sem credenciais embutidas.
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from sqlalchemy import text

from app.database import SessionLocal, engine
from app.services.categorias_contas import seed_subcategorias_rh
from app.services.paginas_visibilidade import CHAVE_PAGINAS, seed_paginas_visibilidade_json


def main() -> int:
    try:
        with SessionLocal() as db:
            seed_subcategorias_rh(db)
            db.commit()
            print("OK: subcategorias RH")

        with engine.connect() as conn:
            conn.execute(
                text(
                    """
                    INSERT INTO contas_correntes (codigo, nome, banco, padrao, ativo)
                    SELECT 'corrente', 'Conta corrente', 'A definir', TRUE, TRUE
                    WHERE NOT EXISTS (SELECT 1 FROM contas_correntes WHERE codigo = 'corrente')
                    """
                )
            )
            conn.execute(
                text(
                    """
                    INSERT INTO configuracao_app (chave, valor)
                    VALUES (:chave, :valor)
                    ON CONFLICT (chave) DO NOTHING
                    """
                ),
                {"chave": CHAVE_PAGINAS, "valor": seed_paginas_visibilidade_json()},
            )
            conn.commit()
            print("OK: conta corrente padrão + paginas_visibilidade")
        return 0
    except Exception as exc:
        print(f"ERRO: falha no seed estrutural: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
