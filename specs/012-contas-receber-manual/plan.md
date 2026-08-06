# Implementation Plan: Contas a Receber — Inserção Manual

**Branch**: `012-contas-receber-manual` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-contas-receber-manual/spec.md`

**Note**: Clarify 2026-08-06 incorporado (colisão Maggo, CTA, pagamento na criação, campos, coluna Origem). Plano focado no **gap** em relação ao WIP atual (POST/`criar` já existem parcialmente; faltam `origem`, merge que preserve manual, UI Pendente|Recebido, CTA canônico e edição plena de manuais).

## Summary

Permitir ao **admin** cadastrar unitariamente uma conta a receber via **“Nova conta a receber”**, persistida no Ocean com **origem = Manual**, coexistindo com registros Maggo. Fechar o gap técnico: coluna/`origem`, merge Maggo que **não sobrescreve** manuais em colisão de número, formulário com pagamento **Pendente|Recebido** (+ Caixa/data se Recebido), coluna **Origem** na listagem, e PUT com campos de negócio liberados só para origem manual. Sem importação, sem exclusão, sem pasta de NFs.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Zustand, Axios, react-hot-toast; FastAPI, SQLAlchemy, Pydantic; stub Maggo existente; util de duplicidade `nf_duplicidade` (013) reutilizado para unicidade de `numero`

**Storage**: PostgreSQL — coluna nova `nfs.origem` (`manual` \| `maggo`); demais campos na tabela `nfs` existente; `ALTER … IF NOT EXISTS` em `main.py` (padrão do projeto)

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`; smoke POST/PUT/GET `/api/nfs` (create, colisão Maggo, edição manual vs Maggo)

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Mesmo padrão de listagem/sync atual; create/update síncronos com validação imediata

**Constraints**: Portas fixas; papéis admin/visualizador; sem import Excel/CSV nesta feature; sem exclusão individual/em massa; sem pasta NFs; Maggo real fora de escopo; manuais prevalecem em colisão de `numero`

**Scale/Scope**: Evoluir `NFs.tsx` + `/api/nfs`; 1 coluna DB; ajustes de merge Maggo, schemas e tipos; 0 páginas novas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Contas a Receber; admin cria/edita; visualizador só lê |
| III. Clareza antes de implementar | PASS — clarify 5/5 |
| IV. Consistência com produto existente | PASS — mesma página/`/api/nfs`, toast, Layout, arquivar; CTA alinhado a Contas a Receber |
| V. Simplicidade e escopo fechado | PASS — reabre só criação unitária + origem + merge; sem import/delete/pasta |
| Portas / segredos | PASS — sem mudança de portas; sem credenciais |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. `origem` é o mínimo para distinguir edição/merge; aviso de colisão via header HTTP opcional (MAY).

## Project Structure

### Documentation (this feature)

```text
specs/012-contas-receber-manual/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-contas-receber-manual.md
│   └── ui-contas-receber-manual.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    ├── main.py                      # ALTER nfs.origem IF NOT EXISTS
    ├── models/__init__.py           # coluna origem
    ├── schemas.py                   # NFCreate (caixa/pagamento), NFUpdate condicional, NFResponse.origem
    └── api/routes/nfs.py            # POST create completo; merge skip manual; PUT por origem; header colisões

frontend/
└── src/
    ├── pages/NFs.tsx                # CTA, formulário create, coluna Origem, edição plena se Manual
    ├── types/index.ts               # origem?; tipos create
    └── services/api.ts              # payload create com caixa/data_pagamento
```

**Structure Decision**: Continuar no módulo Contas a Receber (`NFs.tsx` + `/api/nfs`). Não criar tabela/página paralela. Flag `origem` na própria `nfs` para governar merge e allowlist de edição.

## Complexity Tracking

> Sem violações a justificar.
