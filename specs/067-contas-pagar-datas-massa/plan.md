# Implementation Plan: Contas a Pagar — Edição em massa de datas

**Branch**: `067-contas-pagar-datas-massa` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/067-contas-pagar-datas-massa/spec.md`

**Note**: Clarify 2026-09-14 (5/5): sem limpeza no lote; ação única; seleção linha+grupo Mês/Ano; sem regra pagamento×vencimento; limpar seleção após sucesso. `/speckit-plan` 2026-09-14 (Phase 0–1 sem NEEDS CLARIFICATION). Context: `setup-plan` havia resolvido `070` via `feature.json`; plano gerado na **067** (feature clarificada nesta conversa); `feature.json` realinhado.

## Summary

Permitir ao administrador selecionar contas a pagar (por linha e por grupo Mês/Ano visível) e aplicar, em um único fluxo **Editar datas em massa**, nova **data de vencimento** e/ou **data de pagamento**. Backend: `POST /api/contas/acoes/editar-datas` com contagem `processados`/`ignorados`. Campo omitido no lote não altera; preencher pagamento marca `pago`. Frontend espelha o padrão de seleção/lote de `Bonus.tsx`, mantendo a tabela plana de Contas (`046`).

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Axios, `react-hot-toast`, `useAuthStore`; SQLAlchemy `ContaPagar`; padrão de lote de `bonus.py` (`BonusAcaoLote*`)

**Storage**: PostgreSQL — sem migration; reusa colunas `data_vencimento`, `data_pagamento`, `pago`, `caixa` em `contas_pagar`

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`; smoke API **8001**

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (página `Contas.tsx` + rota `contas.py`)

**Performance Goals**: Um request de lote para ≥5 contas; UI responde ao confirm em tempo interativo (&lt; 1 min no fluxo SC-001, tipicamente segundos)

**Constraints**: Portas fixas; JWT; `admin` altera / `visualizador` só lê; sem limpeza de datas no lote; sem “selecionar tudo no banco”; Contas a Receber fora; exclusão em massa permanece descontinuada

**Scale/Scope**: 1 endpoint + schemas de request/response; 1 método em `contasService`; seleção + modal + cabeçalhos de grupo em `Contas.tsx`; 0 páginas novas; 0 migrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Contas a Pagar; visualizador somente leitura |
| III. Clareza antes de implementar | PASS — clarify 5/5 |
| IV. Consistência com produto existente | PASS — lote como Bonus; regras de `pago`/`caixa` como `PUT` Contas; tabela plana 046 |
| V. Simplicidade e escopo fechado | PASS — um endpoint, só datas, sem schema novo |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Cabeçalhos de grupo por Mês/Ano são o mínimo para honrar clarify sem reabrir agrupamento colapsável. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/067-contas-pagar-datas-massa/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-contas-pagar-datas-massa.md
│   └── ui-contas-pagar-datas-massa.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    ├── schemas.py                 # ContasDatasLoteRequest / ContasDatasLoteResponse
    └── api/routes/
        └── contas.py              # POST /acoes/editar-datas (require_admin)

frontend/
└── src/
    ├── pages/
    │   └── Contas.tsx             # seleção, grupos Mês/Ano, modal, lote
    ├── services/
    │   └── api.ts                 # contasService.editarDatasLote
    └── types/
        └── index.ts               # tipos do lote se necessário
```

**Structure Decision**: Web app existente (`backend/` + `frontend/`). Mudanças concentradas em Contas a Pagar; reuso do padrão de lote de Bônus/Comissão sem novas páginas.

## Complexity Tracking

> Sem violações a justificar.
