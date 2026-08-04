# Implementation Plan: Dashboard — Gráfico Donut de Custo por Categoria

**Branch**: `004-dashboard-custo-donut` | **Date**: 2026-07-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-dashboard-custo-donut/spec.md`

**Note**: Feature de **novo gráfico donut** na Dashboard (abaixo do DRE). Endpoint de agregação por centro de custo + UI Recharts (`PieChart` com `innerRadius`). Layout metade da largura no desktop.

## Summary

Adicionar na Dashboard, imediatamente abaixo do gráfico DRE, um **donut de Custo** com a participação percentual de cada centro de custo no **total de despesas** do ano selecionado (YTD no ano corrente; ano completo em anos anteriores). Todas as categorias entram (incluindo impostos e retirada de lucro). Fatias e legenda ordenadas por valor decrescente; miolo mostra o total em R$. Endpoint novo `GET /api/relatorios/custo-por-categoria?ano=&mes_ate=`; UI em `Dashboard.tsx` + `relatoriosService`, em grid `md:grid-cols-2` (donut à esquerda / slot vazio à direita no desktop).

## Technical Context

**Language/Version**: Python 3.11+ (FastAPI backend); TypeScript 5.2 + React 18 (frontend)

**Primary Dependencies**: FastAPI, SQLAlchemy, PostgreSQL; React, Recharts (`PieChart` / `Pie` / `Cell` / `Legend` / `Tooltip`, `innerRadius` para donut), Tailwind, Axios (`relatoriosService`), react-hot-toast

**Storage**: PostgreSQL existente — tabela `contas_pagar` (sem migration; agregação somente leitura)

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend; smoke do endpoint com JWT

**Target Platform**: Web interna (browser); API em Docker na porta **8001**; frontend dev **5193**

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Agregação do ano no mesmo ciclo de carga da dashboard sem regressão perceptível (SC-001 ~5s); uma query agrupada por `centro_custo` (ou N sums alinhados ao padrão de `dre-mensal`)

**Constraints**: Portas fixas; JWT; não alterar metas, saldos, DRE nem demais gráficos além do deslocamento vertical; período YTD/ano completo alinhado ao DRE; half-width ≥768px / full-width mobile; categorias com valor 0 omitidas; total no miolo

**Scale/Scope**: 1 endpoint novo; 1 método em `api.ts`; bloco novo em `Dashboard.tsx` (grid 50/50); 0 migrations; labels de centro alinhados a Contas a Pagar

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

A constituição em `.specify/memory/constitution.md` ainda é o **template não ratificado** (placeholders). Gates práticos:

| Gate | Status |
|------|--------|
| Princípios de constituição aplicáveis | N/A — constituição não preenchida |
| Escopo alinhado ao spec (donut abaixo do DRE, half-width) | PASS |
| Reutilizar padrões Ocean (relatórios, ContaPagar, Recharts Pie) | PASS |
| Sem schema novo desnecessário | PASS |
| Artefatos Phase 0/1 | PASS (após geração) |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/004-dashboard-custo-donut/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    ├── api/routes/
    │   └── relatorios.py          # + GET /custo-por-categoria
    └── models/__init__.py         # ContaPagar, CentroCusto (sem mudança de schema)

frontend/
└── src/
    ├── pages/
    │   └── Dashboard.tsx          # Bloco donut abaixo do DRE (grid md:2)
    └── services/
        └── api.ts                 # relatoriosService.custoPorCategoria(ano, mesAte?)
```

**Structure Decision**: Backend agrega por centro de custo em `relatorios.py` (mesmo router do DRE). Frontend consome via `relatoriosService` e renderiza donut Recharts em `Dashboard.tsx`, logo após o bloco DRE, em metade da largura no desktop. Sem nova página/menu.

## Complexity Tracking

> Sem violações a justificar.
