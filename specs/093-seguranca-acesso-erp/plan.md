# Implementation Plan: Segurança de acesso ao ERP

**Branch**: `093-seguranca-acesso-erp` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/093-seguranca-acesso-erp/spec.md`

## Summary

Fechar a brecha de credenciais padrão e corrigir a gestão de usuários do ERP:

- remover do login do ERP a dica de credenciais, a criação automática das contas `admin`/`visualizador` (`seed_usuarios_default`) e o fallback fixo `USUARIOS_DEV`;
- criar o script `backend/scripts/criar_admin.py` para criar o primeiro administrador sem senha embutida;
- em Configurações, quando o admin define senha, limpar `senha_pendente` e invalidar convites; recusar ligar o ERP de usuário pendente sem senha; sinalizar "Convite pendente"; normalizar login de e-mail; auditar alterações; apagar o 2FA (`usuarios_auth`) junto com o usuário;
- normalizar o login (ERP e Proposal) com a mesma função;
- passar todas as dependências de autenticação do ERP (`require_erp`, `get_current_user`, `get_current_papel`, `require_admin`) a reconferir no banco, a cada requisição, se o usuário existe, está ativo, tem acesso ao ERP e qual é o papel atual.

## Technical Context

**Language/Version**: Python 3.11 (backend) · TypeScript 5 + React 18 (frontend)

**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic v2, passlib, python-jose · Vite, Tailwind, Axios, react-hot-toast

**Storage**: PostgreSQL (Supabase em produção; Postgres 16 local na porta 5433). Sem tabelas ou colunas novas

**Testing**: Sem suíte automatizada no projeto; validação por `python -m py_compile`, `npm run type-check`, `npm run build`, teste com `fastapi.testclient` contra o banco local quando disponível e roteiro manual em [quickstart.md](./quickstart.md)

**Target Platform**: Web (ERP em `frontend/src`, API FastAPI no Render)

**Project Type**: Aplicação web (backend + frontend)

**Performance Goals**: +1 consulta por chave única (`usuarios_app.usuario`, indexada) por requisição autenticada do ERP; impacto desprezível

**Constraints**: Tokens já emitidos continuam válidos se o usuário ainda estiver apto (sem logout em massa); portas fixas (8001/5433/6380/5193); nenhuma credencial em código, spec ou commit

**Scale/Scope**: ~15 usuários; 24 routers do ERP protegidos por `ERP_DEPS`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|-----------|-----------|--------|
| I. Idioma Português | Spec, plano e artefatos em pt-BR; mensagens de erro e UI em pt-BR | ✅ |
| II. Domínio Financeiro Interno | Reforça os papéis `admin`/`visualizador`: papel lido do cadastro atual; gestão de usuários continua só para admin | ✅ |
| III. Clareza Antes de Implementar | 3 esclarecimentos registrados (contas padrão, revogação imediata, ERP sem senha) | ✅ |
| IV. Consistência com o Produto | Mesma regra de sessão já usada no Proposal (`get_proposal_user`); toast e `confirm` mantidos em Configurações; auditoria no padrão `registrar_auditoria` | ✅ |
| V. Simplicidade e Escopo Fechado | Sem tabelas novas, sem lista de revogação de tokens (a reconferência no banco resolve), sem política de senha nova; olho da senha fica na 096 | ✅ |
| Restrição: credenciais fora de artefatos | Remove credenciais do código e da UI; o script de bootstrap lê a senha de forma interativa ou de variável de ambiente | ✅ |

**Re-check pós-design**: sem violações; nenhuma entrada em Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/093-seguranca-acesso-erp/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── rest-auth-usuarios.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── app/api/routes/auth.py             # remove seed/fallback; login normalizado; deps reconferem no banco
├── app/api/routes/proposal_auth.py    # usa normalizar_login
├── app/api/routes/configuracoes.py    # senha definida limpa pendência; FR-006; normalização; 2FA; auditoria
├── app/services/acesso_proposal.py    # normalizar_login()
├── app/schemas.py                     # UsuarioAppResponse.senha_pendente
└── scripts/criar_admin.py             # NOVO: bootstrap do primeiro administrador

frontend/src/
├── components/Login.tsx               # remove dica de credenciais e aviso de ambiente
├── pages/Configuracoes.tsx            # selo "Convite pendente"; validação ERP sem senha
└── types/index.ts                     # UsuarioApp.senha_pendente
```

**Structure Decision**: Aplicação web existente (`backend/` + `frontend/`); único arquivo novo é o script de bootstrap em `backend/scripts/`, ao lado dos scripts sob demanda existentes (`seed_estrutura.py`, `zerar_dados.py`).

## Complexity Tracking

Sem violações da constitution.
