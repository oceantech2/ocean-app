#!/usr/bin/env python3
"""
Operação pontual (CLI/ops) para zerar dados do Ocean App.

Preserva: usuarios_app, usuarios_auth e fornecedores puros
(tipo='fornecedor' e elegivel_equipe=false), com histórico e documentos deles.

Uso:
  docker compose exec backend python scripts/zerar_dados.py
  docker compose exec backend python scripts/zerar_dados.py --confirm="ZERAR DADOS OCEAN"

Simulação SC-007:
  python scripts/zerar_dados.py --confirm="ZERAR DADOS OCEAN" --fail-before-commit

Códigos: 0 sucesso | 1 confirmação inválida | 2 erro (rollback) | 3 config/conexão
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Optional, Sequence

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.database import SessionLocal
from app.services.zerar_dados_ops import FRASE_CONFIRMACAO, baseline_counts, zerar_dados

TABELAS_ZERAR = [
    "bonus",
    "nfs (contas a receber — manual + maggo, inclusive excluídas)",
    "ferias",
    "contas_pagar",
    "patrimonio",
    "historico/documentos não preservados",
    "fluxo_movimentos",
    "saldos",
    "dhs",
    "impostos",
    "audit_logs",
    "metas_financeiras",
    "categorias / subcategorias / contas_correntes / configuracao_app",
    "colaboradores (não fornecedores puros)",
    "(pós-wipe) flag maggo_stub_empty — evita stub Maggo recriar Contas a Receber",
]


def _print_baseline(counts: dict) -> None:
    print("=== Baseline (antes da limpeza) ===")
    for k, v in counts.items():
        print(f"  {k}: {v}")
    print("Tabelas no escopo de limpeza:")
    for t in TABELAS_ZERAR:
        print(f"  - {t}")


def pedir_confirmacao(confirm_arg: Optional[str]) -> bool:
    if confirm_arg is not None:
        return confirm_arg == FRASE_CONFIRMACAO
    try:
        print(f"\nATENÇÃO: operação irreversível. Digite exatamente: {FRASE_CONFIRMACAO}")
        digitado = input("> ").strip()
    except EOFError:
        return False
    return digitado == FRASE_CONFIRMACAO


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Zera dados do Ocean preservando login e fornecedores puros (CLI/ops)."
    )
    parser.add_argument("--confirm", dest="confirm", default=None)
    parser.add_argument("--fail-before-commit", action="store_true")
    parser.add_argument("-y", "--yes", "--force", action="store_true", dest="force_ignored")
    return parser.parse_args(argv)


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = parse_args(argv)

    if args.force_ignored and args.confirm is None:
        print(
            "ERRO: --yes/--force sozinhos não autorizam a limpeza. "
            f'Use --confirm="{FRASE_CONFIRMACAO}".',
            file=sys.stderr,
        )
        return 1

    try:
        db = SessionLocal()
    except Exception as exc:
        print(f"ERRO: falha ao conectar ao banco: {exc}", file=sys.stderr)
        return 3

    try:
        _print_baseline(baseline_counts(db))

        if not pedir_confirmacao(args.confirm):
            print("Confirmação inválida ou cancelada. Nenhuma alteração.", file=sys.stderr)
            return 1

        try:
            antes, depois, avisos = zerar_dados(db, fail_before_commit=args.fail_before_commit)
        except Exception as exc:
            print(f"ERRO: limpeza abortada (rollback). Motivo: {exc}", file=sys.stderr)
            return 2

        for a in avisos:
            print(f"AVISO: não foi possível remover arquivo {a}", file=sys.stderr)

        print("\n=== Limpeza concluída ===")
        print(f"  usuarios_app: {depois['usuarios_app']} (antes {antes['usuarios_app']})")
        print(f"  usuarios_auth: {depois['usuarios_auth']} (antes {antes['usuarios_auth']})")
        print(f"  fornecedores_puros: {depois['fornecedores_puros']} (antes {antes['fornecedores_puros']})")
        print(f"  nfs restantes: {depois.get('nfs_contas_receber', depois.get('nfs'))}")
        print(f"  contas_pagar restantes: {depois['contas_pagar']}")
        print(f"  contas_correntes restantes: {depois['contas_correntes']}")
        print(f"  configuracao_app restantes: {depois['configuracao_app']}")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
