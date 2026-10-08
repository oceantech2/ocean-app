# Implementation Plan: Cards Total de Despesas e Impostos Pagos na seção Despesa

**Branch**: `085-dashboard-despesa-total-impostos` | **Date**: 2026-10-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/085-dashboard-despesa-total-impostos/spec.md`

**Note**: Clarify 2026-10-08 — Impostos Pagos é o último card; no modo só-ano soma Dez/A−1 a Nov/A; título "Impostos Pagos".

## Summary

Adicionar dois cards à seção **Despesa** do Dashboard: **Total de Despesas** (primeiro card; Fixas + Variáveis, valor já calculado em `despesasTotaisResultado`) e **Impostos Pagos** (último card; impostos recolhidos do mês anterior ao filtro). Impostos Pagos reutiliza o endpoint existente `GET /relatorios/receita-caixa` (campo `impostos_recolhidos`) consultando o mês anterior; no modo só-ano compõe a janela Dez/A−1..Nov/A com três consultas (`Dez/A−1 + Ano A − Dez/A`). Para caber 5 cards, a seção Despesa passa a ocupar a largura inteira e Resultado desce para a linha de baixo. Sem backend novo, sem migration.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend)

**Primary Dependencies**: React, Tailwind CSS, Axios (`relatoriosService.receitaCaixa` já existente)

**Storage**: N/A — leitura de endpoint existente

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` + `npm run build` no `frontend/`

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (somente frontend; backend intocado)

**Performance Goals**: +1 requisição leve no modo mês, +3 no modo só-ano, todas em paralelo com a carga atual do Dashboard (sem aumentar o tempo total de forma perceptível)

**Constraints**: Não alterar regras de Fixas/Variáveis/Pendentes (059), Resultado (068) nem do card Impostos da Receita (058); Impostos Pagos não entra em Total nem em Resultado; falha isolada no card; tema claro/escuro; responsivo

**Scale/Scope**: 2 arquivos (`Dashboard.tsx`, `utils/dashboardDespesas.ts`); 0 endpoints novos; 0 migrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — somente leitura; mesmos valores para os dois papéis |
| III. Clareza antes de implementar | PASS — clarify fechou posição, modo só-ano e título |
| IV. Consistência com produto existente | PASS — mesmo visual dos cards da seção; mesma fonte do card Impostos Recolhidos |
| V. Simplicidade e escopo fechado | PASS — reuso de endpoint; helper puro para mês anterior/janela; nenhum endpoint novo |
| Portas / segredos | PASS — sem credenciais; portas inalteradas |

**Post-design re-check**: Sem violações. Complexity Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/085-dashboard-despesa-total-impostos/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-despesa-total-impostos.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/utils/dashboardDespesas.ts  # helpers puros: mesAnterior() e rotuloImpostosPagos()
frontend/src/pages/Dashboard.tsx         # estado impostosPagos + carga em carregarDados + 2 cards + layout da seção
```

**Structure Decision**: Feature 100% frontend. A regra de "mês anterior / janela deslocada" fica em helper puro em `dashboardDespesas.ts` (arquivo que já concentra as agregações da seção Despesa); a carga e a renderização ficam em `Dashboard.tsx`, no mesmo padrão dos demais cards.

## Complexity Tracking

> Sem violações a justificar.
