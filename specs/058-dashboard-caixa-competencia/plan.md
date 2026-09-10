# Implementation Plan: Abas Por Caixa e Por Competência no Dashboard

**Branch**: `058-dashboard-caixa-competencia` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/058-dashboard-caixa-competencia/spec.md`

**Note**: Clarify 2026-09-10 (5/5): substituir cards legados Receita/Receita Pendente; barra de meta do topo segue aba ativa; padrão Por Caixa; modo só-ano agrega o ano; barra no ano usa meta anual. Depende de `056` (Pipeline) e `057` (toggle + Configuração do Período). Fora: Despesas & Resultado, Aging, Alerta (07–09).

## Summary

Entregar na seção **Receita** do Dashboard as abas **Por Caixa** e **Por Competência**, removendo os cards genéricos Receita / Receita Pendente e mantendo o **Pipeline**. Por Competência reutiliza a agregação do `pipeline-receita` (Total Fechado ≡ Fechado; estágios alinhados). Por Caixa exige agregação nova no backend filtrada por `data_pagamento` (Recebido + Impostos Recolhidos) e pendentes só com `data_ent_pgto` no período. Toggle Bruto/Líquido seleciona a base no client; Impostos Recolhidos são absolutos. A barra de progresso do topo usa Recebido (Caixa) ou Total Fechado (Competência) no mês, e meta anual no modo só-ano.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Axios; SQLAlchemy `NF`; `pipeline-receita` (056/057 dual-base); `metasService` / Configuração do Período (057); filtros `mes`/`ano` e `visaoReceita` do Dashboard

**Storage**: PostgreSQL existente (`nfs`) — **sem** migration; **sem** novos campos

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`; smoke API **8001**

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend Dashboard + agregação em `relatorios`)

**Performance Goals**: 1 request Por Caixa + 1 Pipeline (reuso Competência) por mudança de período; troca de aba e toggle sem refetch; SC-007 ≤ 1 min para leitura das abas

**Constraints**: Portas fixas; JWT; mesma leitura `admin`/`visualizador`; não implementar 07–09; não agregar NFs no client; não manter cards Receita/Pendente legados; numerador da barra = totais das abas (não `progresso` legado por emissão)

**Scale/Scope**: 1 endpoint novo (Por Caixa); UI de abas + remoção de 2 cards; ajuste da barra de meta; util/tipos frontend; 0 migrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Conta a Receber = `nfs`; mesma leitura ambos papéis |
| III. Clareza antes de implementar | PASS — clarify 5/5 |
| IV. Consistência com produto existente | PASS — reutiliza Pipeline, toggle, metas, filtros Dashboard |
| V. Simplicidade e escopo fechado | PASS — Competência = reuso Pipeline; 1 endpoint Caixa; sem migration; sem 07–09 |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/058-dashboard-caixa-competencia/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-receita-caixa.md
│   └── ui-dashboard-receita-abas.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    ├── api/routes/
    │   └── relatorios.py           # GET /receita-caixa (+ reutilizar exclusões/universo)
    └── schemas.py                  # ReceitaCaixaResponse (dual-base + impostos absolutos)

frontend/
└── src/
    ├── pages/
    │   └── Dashboard.tsx           # abas; remover Receita/Pendente; barra segue aba
    ├── services/
    │   └── api.ts                  # relatoriosService.receitaCaixa(ano, mes?)
    └── utils/
        ├── pipelineReceita.ts      # mapear Pipeline → métricas Por Competência
        ├── metaPeriodo.ts          # valorPorVisao / metaExibida (reuso)
        └── receitaAbas.ts          # labels abas; numerador da barra; tipos Caixa
```

**Structure Decision**: Por Competência **não** duplica agregação — o Dashboard mapeia `pipeline-receita` para Total Fechado / Já Recebido / A Receber / A Faturar. Por Caixa ganha `GET /api/relatorios/receita-caixa` no mesmo padrão dual-base do Pipeline. Frontend remove cards legados, adiciona tabs (padrão `caixa`), e recalcula a barra de meta com numerador da aba ativa (mês → meta mensal; ano → meta anual).

## Complexity Tracking

> Sem violações a justificar.
