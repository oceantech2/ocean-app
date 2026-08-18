# Implementation Plan: Múltiplas contas correntes

**Branch**: `031-multiplas-contas-correntes` | **Date**: 2026-08-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/031-multiplas-contas-correntes/spec.md`

**Note**: Clarify 2026-08-17: automáticos na padrão; reclassificar caixa na NF; cadastro no Fluxo de Caixa; nome+banco obrigatórios; dashboard um card somado.

## Summary

Permitir **N contas correntes** cadastráveis no Fluxo de Caixa, cada uma um caixa exclusivo no seletor. Investimento permanece um sentinela único. NFs (Contas a Receber) e Contas a Pagar entram sempre na corrente **padrão**; o admin corrige NF depois editando `caixa`. A dashboard soma os saldos visíveis das correntes ativas em um único card.

Abordagem: tabela `contas_correntes` + `codigo` estável (`corrente` no seed, `cc_{id}` nas novas); VARCHAR de roteamento alargado; REST `/api/contas-correntes`; UI no modal da tela existente.

## Technical Context

**Language/Version**: Python 3.11 (FastAPI) + TypeScript 5.2 / React 18

**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic, Axios, Zustand (papéis), página `FluxoCaixa.tsx` / `NFs.tsx` / `Dashboard.tsx`, util `fluxoCaixaMovimentos.ts`

**Storage**: PostgreSQL 16 — tabela nova `contas_correntes`; `ALTER` em `nfs.caixa`, `fluxo_movimentos.conta`; seed e índice único parcial; migração inline em `backend/app/main.py` (`_migrar`)

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend`

**Target Platform**: Web interna; API **8001**; frontend **5193**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (backend + frontend)

**Performance Goals**: SC-001 — segunda conta no seletor em &lt; 2 min; dashboard e fluxo no recorte já usado (mês/ano)

**Constraints**: Portas fixas; JWT admin escrita / visualizador leitura; sem menu novo; sem várias contas investimento; sem credenciais nos artefatos

**Scale/Scope**: Poucas contas bancárias da empresa; uma tela de cadastro (modal); ajustes em NF, transferência, mapa de movimentos e um card da dashboard. Fora: Open Banking, caixa em Contas a Pagar, card por conta

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — admin gerencia contas, transfere e reclassifica NF; visualizador só consulta |
| III. Clareza antes de implementar | PASS — 5/5 clarifies na spec |
| IV. Consistência com produto existente | PASS — modal na tela de fluxo, toast, confirm em desativar, soft delete |
| V. Simplicidade e escopo fechado | PASS — tabela de cadastro + códigos string; investimento não vira entidade |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não criar menu nem `/api/caixas` extra se o GET de correntes + sentinela investimento no cliente bastar. Não exigir agência/número. Não somar investimento no card de corrente. Liberar `caixa` no PUT da NF **somente** após recebida (não no ato de receber).

## Project Structure

### Documentation (this feature)

```text
specs/031-multiplas-contas-correntes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-contas-correntes.md
│   └── ui-multiplas-contas-correntes.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/app/main.py                         # CREATE TABLE, seed, índice, ALTER VARCHAR
backend/app/models/__init__.py              # ContaCorrente; caixa/conta alargados
backend/app/schemas.py                      # ContaCorrente*; NF.caixa string validada
backend/app/api/routes/contas_correntes.py  # CRUD + padrão + desativar
backend/app/main.py                         # include_router /api/contas-correntes
backend/app/api/routes/nfs.py               # receber → padrão; PUT caixa se já recebida
backend/app/api/routes/fluxo_movimentos.py  # validar codigo ativo ∪ investimento
backend/app/api/routes/saldos.py            # filtro conta por codigo (se restringir enum)

frontend/src/types/index.ts                 # ContaCorrente; FluxoConta = string
frontend/src/services/api.ts                # contasCorrentesService; tipos de transferência
frontend/src/utils/fluxoCaixaMovimentos.ts  # roteamento por codigo; CP só na padrão
frontend/src/pages/FluxoCaixa.tsx           # seletor N+1; gerenciar contas; transferência
frontend/src/pages/NFs.tsx                  # sem caixa no receber; campo após recebida
frontend/src/pages/Dashboard.tsx            # soma saldos visíveis das correntes ativas
```

**Structure Decision**: Web app existente. Cadastro isolado na tabela nova; roteamento continua por string para não reescrever FKs nesta versão. Contas a Receber = NFs.

## Complexity Tracking

> Sem violações da constituição.
