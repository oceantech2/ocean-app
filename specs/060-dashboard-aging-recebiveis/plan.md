# Implementation Plan: Aging de Recebíveis no Dashboard

**Branch**: `060-dashboard-aging-recebiveis` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/060-dashboard-aging-recebiveis/spec.md`

**Note**: Clarify 2026-09-10 (5/5): residual só no total (sem linha/aviso); rótulo canônico **1–60 dias**; sem COUNT; Total em aberto no cabeçalho. Depende de `057` (toggle Bruto/Líquido). Complementa `056`–`059`. Fora: Alerta de Fluxo de Caixa (Seção 09).

## Summary

Entregar no **Dashboard** o card **Aging de Recebíveis**: estoque **global** de Contas a Receber (`nfs`) com NF emitida e sem recebimento, classificado em quatro buckets por `data_vencimento` vs hoje. Agregação no backend (dual-base bruto/líquido + percentuais); o frontend só escolhe a base via toggle e renderiza Total + buckets (valor, %, cor, ação). **Não** filtra por `mes`/`ano` do Dashboard. Sem migration; sem Alerta (09).

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Axios; SQLAlchemy `NF`; toggle `visaoReceita` (057); padrão dual-base de `pipeline-receita` / `receita-caixa`

**Storage**: PostgreSQL existente (`nfs.data_vencimento`, `data_emissao`, `data_pagamento`, `valor_bruto`, `valor_liquido`) — **sem** migration; **sem** novos campos

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`; smoke API **8001**

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend Dashboard + agregação em `relatorios`)

**Performance Goals**: 1 request de Aging por carga do Dashboard (independente de mudança de mês — números estáveis; refetch em `carregarDados` ok para frescor); toggle sem refetch; SC-008 ≤ 10 s de leitura

**Constraints**: Portas fixas; JWT; mesma leitura `admin`/`visualizador`; não filtrar por período; não implementar Seção 09; não agregar Aging no client via `nfsService.listar`; não exibir COUNT nem aviso de residual; rótulo **1–60 dias** (não “30–60”)

**Scale/Scope**: 1 endpoint novo; 1 util frontend + card no Dashboard; 0 migrations; Alerta fora

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Conta a Receber = `nfs`; mesma leitura ambos papéis |
| III. Clareza antes de implementar | PASS — clarify 5/5 |
| IV. Consistência com produto existente | PASS — dual-base, exclusões e toggle iguais a 056/057/058 |
| V. Simplicidade e escopo fechado | PASS — 1 endpoint; sem migration; sem 09; sem COUNT/drill-down |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/060-dashboard-aging-recebiveis/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-aging-recebiveis.md
│   └── ui-dashboard-aging.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    ├── api/routes/
    │   └── relatorios.py           # GET /aging-recebiveis
    └── schemas.py                  # AgingRecebiveisResponse (dual-base + %)

frontend/
└── src/
    ├── pages/
    │   └── Dashboard.tsx           # card Aging (Total + 4 buckets); fetch no carregarDados
    ├── services/
    │   └── api.ts                  # relatoriosService.agingRecebiveis()
    └── utils/
        └── agingRecebiveis.ts      # labels, cores, ações; normalize; valorPorVisao
```

**Structure Decision**: Agregação canônica no backend (`GET /api/relatorios/aging-recebiveis`), sibling de Pipeline/Caixa, **sem** query `ano`/`mes`. Frontend consome dual-base, aplica `visaoReceita` e renderiza o card com Total em aberto + quatro buckets. Util puro no client só para apresentação e seleção de base — classificação e somas vêm da API.

## Complexity Tracking

> Sem violações a justificar.
