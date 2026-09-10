# Implementation Plan: Status Derivado + Pipeline de Receita no Dashboard

**Branch**: `056-status-conta-receber` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/056-status-conta-receber/spec.md`

**Note**: Clarify 2026-09-10 (4/4): entrega no Dashboard; regra + card Pipeline (Seções 01+04); excluir cancelados/excluídos; arquivados = comportamento vigente dos KPIs de receita; datas = fechamento / emissão / pagamento-recebimento. Sem migration. Módulo Contas a Receber / NFs **não** muda listagem.

## Summary

Entregar no Dashboard a regra canônica de **status de ciclo** de Conta a Receber (derivado de datas, não persistido) e o card **Pipeline de Receita**: universo = NFs com `data_ent_pgto` no período, excluindo `cancelada` e soft-delete; estágios A Faturar / Faturado · Ag. Pagamento / Recebido a partir de `data_emissao` e `data_pagamento`; valores em `valor_liquido`. Backend: novo endpoint de agregação em `relatorios`. Frontend: card na seção Receita do `Dashboard.tsx` + serviço Axios. Sem alterar status legado (`paga`/`pendente`/`vencida`) nem a página NFs.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Axios (`relatoriosService`); SQLAlchemy/`NF` em `relatorios.py`; filtros `mes`/`ano` já existentes no Dashboard

**Storage**: PostgreSQL existente (`nfs`: `data_ent_pgto`, `data_emissao`, `data_pagamento`, `valor_liquido`, `status`, `arquivada`, `excluida_em`) — **sem** migration; **sem** novo campo de status de ciclo

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`; smoke do endpoint Pipeline (API 8001)

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + endpoint de agregação no backend)

**Performance Goals**: 1 request Pipeline por mudança de período; agregação SQL/O(n) sobre NFs do mês; SC-003 ≤ 10s para leitura visual; carga do Dashboard permanece no padrão atual

**Constraints**: Portas fixas; JWT; papéis `admin`/`visualizador` (mesma leitura); não alterar listagem NFs; não implementar toggle bruto/líquido nem demais cards do briefing (05–09); valor = líquido nesta feature

**Scale/Scope**: 1 endpoint novo; 1 card UI; helper de classificação reutilizável; 0 migrations; 0 páginas novas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Conta a Receber = `nfs`; mesma leitura para ambos papéis |
| III. Clareza antes de implementar | PASS — clarify 4/4 integrado |
| IV. Consistência com produto existente | PASS — card no Dashboard; arquivadas alinhadas aos KPIs de receita (`resumo-financeiro`/DRE); UX de filtros mes/ano reutilizada |
| V. Simplicidade e escopo fechado | PASS — 1 endpoint + 1 card; sem migration; sem mudança na página NFs |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/056-status-conta-receber/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-pipeline-receita.md
│   └── ui-pipeline-receita.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    ├── api/
    │   └── routes/
    │       └── relatorios.py       # GET /pipeline-receita (+ helper de estágio se extrair)
    └── schemas.py                  # schema de resposta Pipeline (se padrão do projeto)

frontend/
└── src/
    ├── pages/
    │   └── Dashboard.tsx           # card Pipeline de Receita (seção Receita)
    ├── services/
    │   └── api.ts                  # relatoriosService.pipelineReceita(ano, mes)
    └── utils/
        └── pipelineReceita.ts      # opcional: labels/badges/cores; % no client se API não enviar
```

**Structure Decision**: Agregação no backend (filtro por `data_ent_pgto`, exclusões e SUM/COUNT por estágio) espelhando o padrão de `resumo-financeiro`/`dre-mensal`. Frontend só renderiza o card e consome o endpoint no `carregarDados` existente. Helper de labels no frontend para badges canônicos. Página `NFs.tsx` **fora** do diff.

## Complexity Tracking

> Sem violações a justificar.
