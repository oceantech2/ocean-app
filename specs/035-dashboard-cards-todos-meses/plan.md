# Implementation Plan: Dashboard — Cards com Todos os Meses

**Branch**: `035-dashboard-cards-todos-meses` | **Date**: 2026-08-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/035-dashboard-cards-todos-meses/spec.md`

**Note**: Clarify 2026-08-18 incorporado (meta mensal oculta em **Todos os meses**; meta anual em largura total). Sem migration. Trabalho principal no client da Dashboard; ajuste aditivo em `GET /resumo-financeiro` para recorte YTD (`mes_ate`).

## Summary

Com **Todos os meses**, os cards de **Faturamento Bruto**, **Faturamento Líquido** e **NFs pendentes** passam a mostrar o consolidado do recorte anual (YTD no ano corrente; jan–dez em anos anteriores), em vez de “Selecione um mês”. O card de **meta mensal some**; o de **meta anual** ocupa a largura total (mesmo padrão do donut do ano). Com mês concreto, o comportamento atual permanece. Reutilizar `GET /relatorios/resumo-financeiro` com `ano` + `mes_ate` (sem `mes`) no recorte anual.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend — query aditiva)

**Primary Dependencies**: React, Tailwind, Axios (`relatoriosService.resumoFinanceiro`); Zustand (`useAuthStore` para papel)

**Storage**: PostgreSQL existente — **sem** migration; agregação de NFs já em `/resumo-financeiro` (`data_emissao`)

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`; smoke JWT de `resumo-financeiro` com `ano`+`mes` vs `ano`+`mes_ate`

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Troca de filtro no mesmo `Promise.all` + spinner da Dashboard; uma chamada de resumo por recorte (SC-001 ≤ 10s)

**Constraints**: Portas fixas; JWT; só Dashboard; não persistir período; papéis admin/visualizador inalterados; `mes=0` **não** pode significar “todos os meses”; donut mensal, DRE e saldos fora de escopo

**Scale/Scope**: 1 página (`Dashboard.tsx`); 1 query opcional nova (`mes_ate`) no endpoint existente; 0 migrations; 0 páginas novas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Dashboard; ambos veem consolidados; edição de meta só admin; meta mensal só com mês concreto |
| III. Clareza antes de implementar | PASS — clarify 2/2 (ocultar meta mensal; largura total da anual) |
| IV. Consistência com produto existente | PASS — mesmos selects, cards, `fmt`, grid `md:grid-cols-2` / largura total como o donut |
| V. Simplicidade e escopo fechado | PASS — reusa resumo; `mes_ate` aditivo; sem store global; sem esconder KPIs |
| Portas / segredos | PASS — sem mudança de portas; sem credenciais |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Query `mes_ate` evita somar 12 requests ou filtrar no client sem breakdown.

## Project Structure

### Documentation (this feature)

```text
specs/035-dashboard-cards-todos-meses/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-resumo-financeiro.md
│   └── ui-dashboard-cards-todos-meses.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/
└── src/
    ├── pages/
    │   └── Dashboard.tsx          # resumo YTD; ocultar meta mensal; meta anual largura total; rótulos
    └── services/
        └── api.ts                 # resumoFinanceiro: param opcional mes_ate

backend/
└── app/api/routes/relatorios.py   # GET /resumo-financeiro: mes_ate quando mes omitido
```

**Structure Decision**: KPIs e layout de metas em `Dashboard.tsx`. Contrato REST só ganha `mes_ate` opcional. Sem tabela, rota de página ou store nova.

## Complexity Tracking

> Sem violações a justificar.
