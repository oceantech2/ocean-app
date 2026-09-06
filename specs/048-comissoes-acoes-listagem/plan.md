# Implementation Plan: Comissões — editar pela conta, liberar, colunas e ações em massa

**Branch**: `048-comissoes-acoes-listagem` | **Date**: 2026-09-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/048-comissoes-acoes-listagem/spec.md`

**Note**: Clarify 2026-09-06 (5 respostas): **Pagar** após Liberar; **Liberado** = linha + soma grupo; seleção = página atual; Liberar sem pré-requisito de NF; limpar seleção ao paginar/filtrar.

## Summary

Fechar a listagem de **Comissões** (`/comissoes`) conforme a spec 048: Editar → Conta a receber, Liberar/Pagar (individual e em massa), colunas Liberado/Pago, checkboxes, sem Deletar. A maior parte já foi entregue em `045-comissoes-conta-receber`. Residual: **limpar seleção ao mudar de página** (FR-012a) e, como hardening, **retirar DELETE** da API/cliente. Sem novas tabelas nem endpoints de status.

## Technical Context

**Language/Version**: Python 3.11 (FastAPI) + TypeScript 5.2 / React 18

**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic v2, Axios, Zustand, React Router, `react-hot-toast`

**Storage**: PostgreSQL 16 — tabela `bonus` já com `nf_id`, `liberado`, `pago`, datas (migração 045); sem migração nova prevista

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend

**Target Platform**: Web interna; API **8001**; frontend **5193**; PostgreSQL **5433**; Redis **6380**

**Project Type**: Web application (backend + frontend)

**Performance Goals**: Listagem e lote na página atual; Liberado (linha + grupo) atualizado após reload em menos de 5 s (SC-002)

**Constraints**: Portas fixas; JWT admin/visualizador; prefixo `/api/bonus`; permKey `bonus`; artefatos em pt-BR; cadastro na NF fora de escopo

**Scale/Scope**: ~2–4 arquivos tocados no residual; maioria dos FRs já satisfeitos no código

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Liberar/Pagar/lote só admin |
| III. Clareza antes de implementar | PASS — 5/5 clarifies na spec |
| IV. Consistência com produto existente | PASS — reutiliza 045, toast, confirm, deep-link NF |
| V. Simplicidade e escopo fechado | PASS — gap-fill; sem reimplementar cadastro |
| Portas / segredos | PASS |

**Post-design re-check**: PASS. Sem violações. Complexity Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/048-comissoes-acoes-listagem/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-comissoes-acoes.md
│   └── ui-comissoes-acoes.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
backend/app/api/routes/bonus.py          # liberar/pagar/lote; hardening DELETE
frontend/src/pages/Bonus.tsx             # seleção, paginação, colunas, ações
frontend/src/services/api.ts             # bonusService (remover deletar se hardening)
frontend/src/pages/NFs.tsx               # deep-link ?edit= (já existente; só verificar)
```

**Structure Decision**: Web app existente. Sem novos módulos. Foco em `Bonus.tsx` + opcional ajuste em `bonus.py`/`api.ts`.

## Fases de implementação (resumo)

### Já entregue (045 — verificar regressão)

1. Colunas Liberado (linha + grupo) e Pago
2. Editar → `/nfs?edit={nf_id}`; toast se sem vínculo
3. Sem Deletar na UI
4. Liberar / Pagar individuais e em massa
5. Checkboxes por linha/grupo; limpeza da seleção nos filtros

### Residual (048)

1. Limpar `selecionados` no `Pagination.onChange` (e qualquer caminho que só chame `setPagina`)
2. Hardening: remover/desativar `DELETE /api/bonus/{id}` e `bonusService.deletar`
3. Quickstart completo + lint/type-check

## Complexity Tracking

> Sem violações da constituição.

| Item | Notas |
|------|-------|
| — | Nenhuma exceção necessária |

## Artefatos gerados (Phase 0–1)

| Artefato | Caminho |
|----------|---------|
| Research | [research.md](./research.md) |
| Data model | [data-model.md](./data-model.md) |
| REST contract | [contracts/rest-comissoes-acoes.md](./contracts/rest-comissoes-acoes.md) |
| UI contract | [contracts/ui-comissoes-acoes.md](./contracts/ui-comissoes-acoes.md) |
| Quickstart | [quickstart.md](./quickstart.md) |
