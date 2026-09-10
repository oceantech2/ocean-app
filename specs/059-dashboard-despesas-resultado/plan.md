# Implementation Plan: Despesas & Resultado no Dashboard

**Branch**: `059-dashboard-despesas-resultado` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/059-dashboard-despesas-resultado/spec.md`

**Note**: Clarify 2026-09-10 (5/5): Centro/Demonstrativo inalterados; excluir categoria imposto; Fixas/Variáveis só por `data_pagamento` (ignora `pago`); Pendentes = vencimento no período + pagamento em branco; Resultado = só valor + %. Depende de `057` (toggle) e `058` (Por Caixa / Pipeline Dual). Fora: Aging (08), Alerta (09), redesign Centro/Demonstrativo.

## Summary

Alinhar o bloco **Despesas & Resultado** do Dashboard à Seção 07: recalcular Fixas / Variáveis / Pendentes com `tipo_despesa` + datas canônicas (pagamento / vencimento), excluir imposto, e substituir o card único **Lucro** por **Resultado Competência** e **Resultado Caixa** (valor + %). Receitas vêm das bases já carregadas (`pipeline-receita` → competência; `receita-caixa` → caixa) na visão do toggle; despesas são absolutas e não mudam com o toggle. Agregação de despesa no client via `dashboardDespesas.ts` sobre a lista já buscada de Contas a Pagar (sem migration; Centro/Demonstrativo intocados).

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend — sem mudança obrigatória)

**Primary Dependencies**: React, Tailwind, Axios; `ContaPagar` (`tipo_despesa`, `data_pagamento`, `data_vencimento`, `categoria`); `pipeline-receita` + `receita-caixa` (056–058); `visaoReceita` / `valorPorVisao` (057); `dashboardDespesas.ts` (reescrita das regras)

**Storage**: PostgreSQL existente (`contas_pagar`, `nfs`) — **sem** migration; **sem** novos campos

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (Dashboard frontend; reuso de APIs de receita existentes)

**Performance Goals**: Sem request extra obrigatório (reuso de `contasService.listar` + Pipeline + Caixa já no `carregarDados`); toggle recalcula Resultado localmente; SC-006 ≤ 5 s percebidos ao mudar período

**Constraints**: Portas fixas; JWT; mesma leitura `admin`/`visualizador`; não alterar Centro de Despesa / Demonstrativo; não implementar 08–09; despesas ignoram toggle; Lucro legado sai da leitura canônica

**Scale/Scope**: Reescrita de `totaisDespesa` + helpers de Resultado; UI Despesa/Resultado no `Dashboard.tsx`; 0 endpoints novos (salvo follow-up se `listar(0,1000)` truncar); 0 migrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Contas a Pagar + Contas a Receber (`nfs`); mesma leitura ambos papéis |
| III. Clareza antes de implementar | PASS — clarify 5/5 |
| IV. Consistência com produto existente | PASS — reutiliza toggle, Pipeline, Por Caixa, listagem Contas a Pagar; Centro/Demonstrativo preservados |
| V. Simplicidade e escopo fechado | PASS — util + UI; sem migration; sem 08–09; sem redesign auxiliar |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/059-dashboard-despesas-resultado/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-dashboard-despesas-resultado.md
│   └── calc-despesas-resultado.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/
└── src/
    ├── pages/
    │   └── Dashboard.tsx              # 3 cards Despesa; 2 cards Resultado; remove Lucro canônico
    ├── utils/
    │   ├── dashboardDespesas.ts       # totaisDespesa (tipo + datas); calcularResultado*
    │   ├── metaPeriodo.ts             # valorPorVisao (reuso)
    │   ├── pipelineReceita.ts         # receita_comp = fechado
    │   └── receitaAbas.ts             # receita_caixa = recebido
    ├── services/
    │   └── api.ts                     # sem endpoint novo nesta entrega
    └── types/
        └── index.ts                   # ContaPagar.tipo_despesa / data_pagamento (já existem)
```

**Structure Decision**: Agregar despesas no **frontend** reescrevendo `totaisDespesa` (fonte = `contasService.listar` já usada no Dashboard). Resultado Competência/Caixa = `valorPorVisao(receita_*) − (fixas + variáveis)` no client, reusando Pipeline e Por Caixa para FR-015. Backend Contas a Pagar / relatorios de custo **não** mudam nesta feature (Demonstrativo/Centro ficam divergentes de propósito).

## Complexity Tracking

> Sem violações a justificar.
