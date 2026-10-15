#!/usr/bin/env python3
"""
Cria o primeiro administrador do ERP (ou redefine a senha de um existente).

O sistema não cria contas sozinho nem tem senha padrão (feature 093).

Uso (no container backend, cwd /app):
  python scripts/criar_admin.py <login>
  python scripts/criar_admin.py <login> --redefinir-senha

A senha é lida de OCEAN_ADMIN_SENHA ou digitada no terminal (com confirmação).
"""
from __future__ import annotations

import argparse
import getpass
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from passlib.context import CryptContext

from app.database import SessionLocal
from app.models import UsuarioApp
from app.services.acesso_proposal import normalizar_login

SENHA_MINIMA = 8
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")


def ler_senha() -> str:
    senha = os.getenv("OCEAN_ADMIN_SENHA")
    if senha is None:
        senha = getpass.getpass("Senha: ")
        if getpass.getpass("Confirme a senha: ") != senha:
            raise ValueError("As senhas não conferem")
    if len(senha) < SENHA_MINIMA:
        raise ValueError(f"A senha deve ter pelo menos {SENHA_MINIMA} caracteres")
    return senha


def main() -> int:
    parser = argparse.ArgumentParser(description="Cria o primeiro administrador do ERP.")
    parser.add_argument("login")
    parser.add_argument("--redefinir-senha", action="store_true", help="redefine a senha se o login já existir")
    args = parser.parse_args()

    login = normalizar_login(args.login)
    if not login:
        print("ERRO: login obrigatório", file=sys.stderr)
        return 1

    with SessionLocal() as db:
        usuario = db.query(UsuarioApp).filter(UsuarioApp.usuario == login).first()
        if usuario and not args.redefinir_senha:
            print(f"ERRO: '{login}' já existe. Use --redefinir-senha para trocar a senha.", file=sys.stderr)
            return 1
        try:
            senha_hash = pwd_context.hash(ler_senha())
        except ValueError as exc:
            print(f"ERRO: {exc}", file=sys.stderr)
            return 1

        if usuario:
            usuario.senha_hash = senha_hash
            usuario.senha_pendente = False
            usuario.ativo = True
            usuario.acesso_erp = True
            usuario.papel = "admin"
        else:
            db.add(UsuarioApp(
                usuario=login,
                senha_hash=senha_hash,
                papel="admin",
                ativo=True,
                acesso_erp=True,
                acesso_proposal=False,
                senha_pendente=False,
            ))
        db.commit()
    print(f"OK: administrador '{login}' {'atualizado' if usuario else 'criado'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
