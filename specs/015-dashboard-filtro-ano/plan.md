# Implementation Plan: Dashboard — Filtro de Ano Independente e Donut Anual

**Branch**: `015-dashboard-filtro-ano` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/015-dashboard-filtro-ano/spec.md`

**Note**: Clarify 2026-08-12 incorporado (mês opcional; donut do ano em largura total sem mês; donut anual ignora o mês do filtro; só o donut mensal some na visão anual). Sem migration. Backend de custo **já** suporta YTD e mês isolado — o trabalho é no client da Dashboard.

## Summary

Tornar o **ano** utilizável na Dashboard sem mês obrigatório: opção **“Todos os meses”** no seletor; blocos anuais (meta anual, DRE, faturamento, donut do ano) respondem só ao ano. Com mês selecionado, exibir **dois donuts** de custo (mês | ano) lado a lado; sem mês, **somente o donut do ano em largura total**. Remover o bloco **Próximas Ações**. Reutilizar `GET /custo-por-categoria` duas vezes (`mes_de=mes_ate=mês` e `mes_de=1` + `mes_ate` YTD/ano completo).

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend — sem mudança de contrato)

**Primary Dependencies**: React, Tailwind, Recharts (`PieChart`/`Pie`), Axios (`relatoriosService.custoPorCategoria`), Zustand (`useAuthStore` para papel)

**Storage**: PostgreSQL existente — **sem** migration; agregação `contas_pagar` já exposta em `/custo-por-categoria`

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`; smoke JWT das duas chamadas de custo (mês isolado ≠ YTD)

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Troca de mês/ano no mesmo ciclo `Promise.all` + spinner da Dashboard; duas agregações de custo no mesmo round (mês + ano) sem regressão perceptível (SC-001 ≤ 10s)

**Constraints**: Portas fixas; JWT; só Dashboard; não persistir período; papéis admin/visualizador inalterados; donut anual ignora mês; `mes=0` **não** pode significar “todos os meses” (já é meta anual)

**Scale/Scope**: 1 página (`Dashboard.tsx`); 0 endpoints novos; 0 migrations; helper local de donut para não duplicar markup; remoção do bloco Próximas Ações

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Dashboard; ambos filtram; edição de meta só admin |
| III. Clareza antes de implementar | PASS — clarify 3/3 |
| IV. Consistência com produto existente | PASS — mesmos selects, Recharts donut, Layout, toasts |
| V. Simplicidade e escopo fechado | PASS — reusa endpoint; sem store global; sem página nova |
| Portas / segredos | PASS — sem mudança de portas; sem credenciais |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Duas chamadas ao mesmo endpoint evitam endpoint novo e filtro incorreto no client.

## Project Structure

### Documentation (this feature)

```text
specs/015-dashboard-filtro-ano/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-custo-por-categoria.md
│   └── ui-dashboard-filtro-ano.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/
└── src/
    ├── pages/
    │   └── Dashboard.tsx          # mes opcional; dois donuts; layout largura; sem Próximas Ações
    └── services/
        └── api.ts                 # sem mudança de assinatura (já tem mesDe)

backend/                               # sem alteração prevista
└── app/api/routes/relatorios.py   # GET /custo-por-categoria já aceita mes_de/mes_ate
```

**Structure Decision**: Toda a feature cabe em `Dashboard.tsx` (estado, carga, layout). O contrato REST de custo permanece o da feature 009; o client passa a fazer **duas** leituras. Sem tabela, rota ou store nova.

## Complexity Tracking

> Sem violações a justificar.
