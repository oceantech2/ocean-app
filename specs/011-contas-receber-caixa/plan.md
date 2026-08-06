# Implementation Plan: Contas a Receber — Identificação de Caixa

**Branch**: `011-contas-receber-caixa` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-contas-receber-caixa/spec.md`

**Note**: Clarificações 2026-08-06 incorporadas: Caixa obrigatória ao receber/salvar recebido; preservar no sync; rótulos curtos; ausência como “—”; legados sem migração.

## Summary

Completar a identificação de **Caixa** (`corrente` \| `investimento`) em Contas a Receber: o campo e a coluna já existem (feature 007), mas faltam **regras de obrigatoriedade** (backend + UI), ajuste de exibição de ausência (**“—”** em vez de “Não definido”), seletor de Caixa no fluxo **Pagar**, e inclusão de Caixa no export **XLSX** (CSV já exporta). Sem migration nova; sem integração com Fluxo de Caixa; sem filtro por Caixa.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Zustand, Axios, react-hot-toast; FastAPI, SQLAlchemy, Pydantic; openpyxl (export XLSX existente)

**Storage**: PostgreSQL — coluna existente `nfs.caixa` (`VARCHAR(20) NULL`); sem `ALTER` adicional

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend; smoke PUT `/api/nfs/{id}` com/sem `caixa` + `data_pagamento`

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Mesmo padrão atual de listagem/edição; validação síncrona no PUT e no formulário

**Constraints**: Portas fixas; papéis admin/visualizador; não migrar legados; não bloquear listagem; não criar lançamentos no Fluxo de Caixa; escopo só Caixa (+ validação acoplada a pagamento)

**Scale/Scope**: Ajustes em `nfs.py` / `schemas.py`, `NFs.tsx`, export XLSX; 0 páginas novas; 0 migrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Contas a Receber; admin grava Caixa; visualizador só lê |
| III. Clareza antes de implementar | PASS — clarify 5/5 (obrigatoriedade, sync, rótulos, ausência, legados) |
| IV. Consistência com produto existente | PASS — mesma página `NFs.tsx`, allowlist PUT, toast, papéis |
| V. Simplicidade e escopo fechado | PASS — regras + UX sobre coluna já existente; sem filtro/Fluxo |
| Portas / segredos | PASS — sem mudança de portas; sem credenciais |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Validação de Caixa no pagamento reutiliza `PUT /api/nfs/{id}` (sem endpoint novo).

## Project Structure

### Documentation (this feature)

```text
specs/011-contas-receber-caixa/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-caixa-contas-receber.md
│   └── ui-caixa-contas-receber.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    ├── schemas.py                 # validação cruzada caixa × data_pagamento (NFUpdate)
    ├── api/routes/nfs.py          # regra de obrigatoriedade no PUT; export XLSX com Caixa
    └── services/excel_io.py       # coluna Caixa no export de NFs (se ausente no template)

frontend/
└── src/
    └── pages/NFs.tsx              # rótulo “—”; validação save/pagar; select Caixa no modal Pagar
```

**Structure Decision**: Evoluir o módulo Contas a Receber já entregue em 007 (`NFs.tsx` + `/api/nfs`). Não criar tabela, página ou serviço novos. Persistência e merge Maggo↔Ocean de `caixa` já atendem FR-008/FR-009; o trabalho desta feature é **regra de negócio + UX + export XLSX**.

## Complexity Tracking

> Sem violações a justificar.
