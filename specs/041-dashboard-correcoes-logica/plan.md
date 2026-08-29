# Implementation Plan: Dashboard — Correções de Lógica, DRL e Ajustes Visuais

**Branch**: `041-dashboard-correcoes-logica` | **Date**: 2026-08-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/041-dashboard-correcoes-logica/spec.md`

**Note**: Clarify 2026-08-27 (5/5): saldo por conta via movimentos; despesas pagas only; DRL Mês/Ano omitindo meses vazios; meta anual sobre Receita Líquida. Complementa `039` e `040`. Sem migration.

## Summary

Corrigir cálculos e apresentação do Dashboard: percentual na barra da **Meta de Receita Anual** (base Receita Líquida acumulada); **saldo por conta corrente** recalculado com alocação via movimentos (bruto − impostos − despesas pagas, sem pendentes); reforço da exclusão de **impostos** em todos os campos de Despesa; **DRL** histórico jan/2024→mês atual (só meses com lançamento, eixo Mês/Ano); remoção dos **filtros de comparação** no cabeçalho; **troca de cores** Saldo (correntes verde, investimento azul). Escopo frontend; reutiliza APIs existentes com agregação client-side.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend intocado)

**Primary Dependencies**: React, Tailwind, Recharts, Axios (`relatoriosService.faturamentoLiquidoMes`, `metasService`, `contasService`, `nfsService`, `fluxoMovimentosService`, `saldosService`, `contasCorrentesService`, `impostosService`); utilitários `fluxoCaixaMovimentos`, `dashboardDespesas`

**Storage**: PostgreSQL existente — **sem** migration

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend-only)

**Performance Goals**: DRL adiciona N chamadas `faturamentoLiquidoMes` (uma por ano 2024..ano corrente, tipicamente 2–3); demais alterações O(n) sobre listas já carregadas; spinner único mantido

**Constraints**: Portas fixas; JWT; só Dashboard; papéis admin/visualizador; sem comparar anos no Head; DRL independente do filtro de ano; impostos fora de Despesa; saldo por conta sem repetir totais globais

**Scale/Scope**: `Dashboard.tsx` + helpers em `utils/` (`dashboardDespesas.ts`, `fluxoCaixaMovimentos.ts` ou novo `dashboardSaldo.ts`); 0 endpoints novos; 0 migrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS |
| III. Clareza antes de implementar | PASS — clarify 5/5 integrado |
| IV. Consistência com produto existente | PASS — reusa `saldoVisivel`/movimentos, `totaisDespesa`, `filtrarCustoSemImpostos`, filtros mês/ano |
| V. Simplicidade e escopo fechado | PASS — client-side; sem backend |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/041-dashboard-correcoes-logica/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-dashboard-correcoes-logica.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/
└── src/
    ├── pages/
    │   └── Dashboard.tsx              # meta anual %, DRL histórico, head, cores Saldo
    └── utils/
        ├── dashboardDespesas.ts       # reforço/auditoria exclusão impostos
        ├── fluxoCaixaMovimentos.ts    # base movimentos por conta (referência)
        └── dashboardSaldo.ts          # (criar) saldoCorrentePorConta no recorte
```

**Structure Decision**: Correções concentradas no Dashboard e helpers de agregação. Extrair `saldoCorrentePorConta` para `dashboardSaldo.ts` se a lógica de FR-002 crescer além de ~40 linhas. Backend intocado.

## Complexity Tracking

> Sem violações a justificar.
