# Implementation Plan: Acesso ao Proposal pelo ERP e liberação para fornecedores

**Branch**: `088-proposal-acesso-erp-fornecedores` | **Date**: 2026-10-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/088-proposal-acesso-erp-fornecedores/spec.md`

## Summary

Duas entregas ligadas ao acesso ao Proposal (`077`):

1. **Item Proposal no menu do ERP com entrada automática**: o ERP emite uma credencial temporária (uso único, 2 minutos) para o usuário logado; o front do ERP abre `https://proposal…/entrar#c=<código>` em nova aba; o Proposal troca o código por um token `app=proposal` e entra.
2. **Liberação de acesso para fornecedores**: na página Fornecedores, o admin libera (individual ou em massa), gera novo convite ou revoga. A liberação cria um usuário só-Proposal com login = e-mail, vinculado ao fornecedor, e gera um convite (uso único, 7 dias). O fornecedor abre `https://proposal…/convite#t=<token>`, cria a senha e entra. Desativar o fornecedor revoga o acesso.

As duas credenciais temporárias (entrada automática e convite) ficam numa única tabela de tokens, gravados só como hash SHA-256 e consumidos por `UPDATE … RETURNING` atômico.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5 + React 18 (frontend)

**Primary Dependencies**: FastAPI, SQLAlchemy, passlib, python-jose (backend); React Router, Zustand, Axios, react-hot-toast, Tailwind (frontend)

**Storage**: PostgreSQL (Supabase em produção); migrações inline em `backend/app/main.py::_migrar()`

**Testing**: sem suíte automatizada no repositório; validação por `quickstart.md` (fluxos manuais + chamadas HTTP) e `tsc`/lint no front

**Target Platform**: Render (API) + Vercel (front, dois domínios no mesmo build)

**Project Type**: aplicação web (backend + frontend)

**Performance Goals**: operações unitárias; liberação em massa de até ~100 fornecedores numa requisição

**Constraints**: isolamento ERP × Proposal (`077` FR-006) mantido; credenciais temporárias fora do caminho/query da URL (FR-006 desta spec); sem dependência de SMTP

**Scale/Scope**: dezenas de fornecedores; 1 tabela nova, 2 colunas novas em `usuarios_app`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Situação |
|---|---|
| I. Idioma Português | ✅ Artefatos e textos de interface em pt-BR |
| II. Domínio financeiro interno / papéis | ✅ Ações de liberação só para `admin`; `visualizador` não vê as ações |
| III. Clareza antes de implementar | ✅ 4 decisões esclarecidas com o usuário (spec, Clarifications) |
| IV. Consistência com o produto | ✅ Ações via `ActionButton`, confirmação com `window.confirm`, toasts, modal padrão |
| V. Simplicidade | ✅ Uma tabela para os dois tipos de token; sem envio de e-mail; sem tela de troca de senha |
| Restrições (portas, segredos) | ✅ Nenhuma porta alterada; nenhum segredo em artefatos |

Reavaliação pós-design: sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/088-proposal-acesso-erp-fornecedores/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api.md
│   └── ui.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/app/
├── models/__init__.py                 # UsuarioApp (+fornecedor_id, +senha_pendente), TokenAcesso (novo)
├── main.py                            # _migrar(): colunas + tabela; include_router(proposal_acessos)
├── services/acesso_proposal.py        # NOVO: emitir/consumir tokens, liberar/revogar, status por fornecedor
├── api/routes/auth.py                 # /token e /me com acesso_proposal; POST /proposal-sso; senha_pendente bloqueia login
├── api/routes/proposal_auth.py        # POST /sso, POST /convite/consultar, POST /convite/aceitar; login com e-mail minúsculo
├── api/routes/proposal_acessos.py     # NOVO (ERP, admin): GET /, POST /liberar, POST /{id}/convite, POST /{id}/revogar
└── api/routes/colaboradores.py        # desativar/excluir fornecedor → revogar acesso

frontend/src/
├── store/index.ts                     # acessoProposal no useAuthStore
├── components/Layout.tsx              # item Proposal no menu + abertura com entrada automática
├── components/Login.tsx               # salva acesso_proposal no login
├── components/navIcons.tsx            # ícone do item Proposal (se necessário)
├── services/api.ts                    # authService.proposalSso, proposalAcessosService
├── utils/proposalUrl.ts               # NOVO: base do Proposal (VITE_PROPOSAL_PUBLIC_URL / derivada do host)
├── pages/Fornecedores.tsx             # coluna de status, ações por linha, seleção + liberação em massa, modal de links
└── proposal/
    ├── App.tsx                        # rotas públicas /entrar e /convite
    ├── pages/Entrar.tsx               # NOVO: troca o código e entra
    ├── pages/Convite.tsx              # NOVO: criar senha
    ├── pages/Login.tsx                # mensagem vinda do redirecionamento
    └── services/proposalApi.ts        # entrarSso, consultarConvite, aceitarConvite
```

**Structure Decision**: segue a estrutura existente (backend FastAPI em `backend/app`, front único com dois entrypoints `index.html`/`proposal.html`).

## Complexity Tracking

Sem violações a justificar.
