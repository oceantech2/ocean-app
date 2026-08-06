# Implementation Plan: Dashboard — Filtro de Mês

**Branch**: `009-dashboard-filtro-mes` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-dashboard-filtro-mes/spec.md`

**Note**: Feature de **filtro de mês no topo da Dashboard**, ao lado do ano já existente. Indicadores mensais (meta do mês, custo isolado, saldos com fallback) respeitam mês+ano; séries anuais (DRE, faturamento por mês) continuam só no ano. Clarificações da sessão 2026-08-06 incorporadas.

## Summary

Adicionar seletor de **mês** na barra de período do header da Dashboard (junto a Ano / Comparar). Estado local `mes` + `ano` (padrão: mês/ano civis correntes). No ano corrente, opções de mês só até o mês atual; ao trocar o ano, manter o mês se válido ou fazer clamp para o máximo permitido. Meta mensal e donut de custo usam o mês selecionado (**custo = mês isolado**, não YTD); saldos usam o registro mais recente com `mês ≤ selecionado` no ano. Endpoint `GET /custo-por-categoria` ganha `mes_de` (default `1`) para permitir intervalo `[mes_de, mes_ate]` — a Dashboard envia `mes_de = mes_ate = mês`. Sem migration; escopo só Dashboard.

## Technical Context

**Language/Version**: Python 3.11+ (FastAPI backend); TypeScript 5.2 + React 18 (frontend)

**Primary Dependencies**: FastAPI, SQLAlchemy; React, Tailwind, Axios (`relatoriosService`, `metasService`, `saldosService`), Zustand (`useAuthStore` para papel; **não** obrigatório `useFilterStore` nesta feature)

**Storage**: PostgreSQL existente — sem migration; reutiliza `metas`, `saldos`, `contas_pagar` / agregações de relatórios

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend; smoke JWT do endpoint com `mes_de`/`mes_ate`

**Target Platform**: Web interna (browser); API porta **8001**; frontend dev **5193**

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Troca de mês/ano recarrega o ciclo atual da Dashboard sem regressão perceptível (mesmo padrão `Promise.all` + spinner)

**Constraints**: Portas fixas; JWT; não alterar outras páginas; não persistir período entre sessões; não colapsar/cortar gráficos anuais ao mudar só o mês; papéis `admin` / `visualizador` inalterados para edição

**Scale/Scope**: 1 ajuste de endpoint (`mes_de`); 1 método cliente em `api.ts`; mudanças concentradas em `Dashboard.tsx`; 0 migrations; 0 páginas/menus novos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (artefatos e UX em pt-BR) | PASS |
| II. Domínio financeiro + papéis admin/visualizador | PASS |
| III. Clareza antes de implementar (clarify 5/5 feito) | PASS |
| IV. Consistência com produto (header de filtros, Layout, toasts) | PASS |
| V. Simplicidade e escopo fechado (só Dashboard; local state) | PASS |
| Portas / sem segredos em artefatos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Extensão mínima do endpoint (`mes_de`) justificada pelo requisito de mês isolado vs. YTD legado.

## Project Structure

### Documentation (this feature)

```text
specs/009-dashboard-filtro-mes/
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
    └── api/routes/
        └── relatorios.py          # custo-por-categoria: + mes_de (filtro mês >= mes_de)

frontend/
└── src/
    ├── pages/
    │   └── Dashboard.tsx          # select Mês; estado mes; carga por mes+ano; regras UI
    └── services/
        └── api.ts                 # custoPorCategoria(ano, mesAte, mesDe?)
```

**Structure Decision**: Frontend concentra UX e regras de período em `Dashboard.tsx`. Backend só amplia o filtro temporal do custo para intervalo fechado `[mes_de, mes_ate]`. Metas e saldos já suportam mês/ano via APIs existentes — ajuste só no client.

## Complexity Tracking

> Sem violações a justificar.
