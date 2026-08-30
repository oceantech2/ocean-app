# Implementation Plan: Contas a Pagar — Fornecedor, cards e campos Conta/Tipo

**Branch**: `045-contas-pagar-campos` | **Date**: 2026-08-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/045-contas-pagar-campos/spec.md`

**Note**: Clarify 2026-08-29 (5/5): Tipo só em Contas a Pagar; cards com parcelas exclusivas; migração de `caixa`; export Excel/PDF com Conta e Tipo; Tipo **Variável** pré-selecionado na criação.

## Summary

Evoluir a página **Contas a Pagar** (`Contas.tsx`) com quatro cards (**Total**, **Pago**, **A pagar**, **Vencido**) calculados sobre o conjunto filtrado; campo **Fornecedor** alimentado pelos fornecedores ativos do cadastro unificado; campo **Conta** sempre visível no formulário (persistido mesmo pendente); novo campo **Tipo** (**Fixo** / **Variável**) persistido em `contas_pagar.tipo_despesa`.

No backend: coluna `tipo_despesa`, migração que preenche `caixa` e `tipo_despesa` em registros legados, e alteração da regra de `caixa` (feature 036 passava a `null` quando pendente — aqui passa a persistir a conta escolhida). Exportação XLSX e impressão PDF incluem **Conta** e **Tipo**. **Dashboard** permanece com classificação Fixas/Variáveis por categoria (fora de escopo).

## Technical Context

**Language/Version**: Python 3.11 (FastAPI) + TypeScript 5.2 / React 18

**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic, openpyxl (`excel_io`), Axios, `Contas.tsx`, `colaboradoresService`, `contasCorrentesService`, `fluxoCaixaMovimentos.ts`, `app.services.caixas`

**Storage**: PostgreSQL 16 — `ALTER TABLE contas_pagar ADD COLUMN tipo_despesa VARCHAR(10) NOT NULL DEFAULT 'variavel'`; backfill `caixa` onde `NULL` com `codigo_padrao(db)`; migração inline em `backend/app/main.py`

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend

**Target Platform**: Web interna; API **8001**; frontend **5193**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (backend + frontend)

**Performance Goals**: SC-004 — lançamento com Fornecedor/Conta/Tipo em &lt; 2 min; cards recalculam no client sobre lista já carregada (≤ 500 itens)

**Constraints**: Portas fixas; JWT admin escrita / visualizador leitura; sem investimento no campo Conta; Dashboard inalterado; sem novas colunas na planilha de importação

**Scale/Scope**: Uma página (`Contas.tsx`), rota `/contas`; endpoints `POST/PUT /api/contas`; export XLSX; PDF via `window.print()`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS |
| III. Clareza antes de implementar | PASS — 5/5 clarifies integrados |
| IV. Consistência com produto existente | PASS — padrão Dashboard.tsx, toast, modal, export existentes |
| V. Simplicidade e escopo fechado | PASS — estende modelo e UI atuais; não altera Dashboard |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Mudança consciente da regra 036 para `caixa` pendente documentada em [research.md](./research.md). Campo API `tipo_despesa` distinto de `tipo_fornecedor` do cadastro.

## Project Structure

### Documentation (this feature)

```text
specs/045-contas-pagar-campos/
├── plan.md              # Este arquivo
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-contas-pagar-campos.md
│   └── ui-contas-pagar-campos.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/app/main.py                         # tipo_despesa + backfill caixa
backend/app/models/__init__.py              # ContaPagar.tipo_despesa
backend/app/schemas.py                      # tipo_despesa em ContaPagar*
backend/app/api/routes/contas.py            # persistir caixa/tipo; import/export
backend/app/services/excel_io.py            # coluna Tipo no XLSX export
backend/app/services/caixas.py              # codigo_padrao (reuso)
frontend/src/types/index.ts                 # ContaPagar.tipo_despesa
frontend/src/pages/Contas.tsx               # cards, form, listagem, export CSV
frontend/src/services/api.ts                # tipos do payload (se necessário)
```

**Structure Decision**: Web app existente; alterações concentradas em `contas.py` + `Contas.tsx` + migração inline.

## Complexity Tracking

> Sem violações da constituição.
