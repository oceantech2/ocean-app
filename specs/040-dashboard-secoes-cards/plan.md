# Implementation Plan: Dashboard — Seções, Títulos e Reordenação de Cards

**Branch**: `040-dashboard-secoes-cards` | **Date**: 2026-08-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/040-dashboard-secoes-cards/spec.md`

**Note**: Clarify 2026-08-27 incorporado (Lucro, origem Impostos, base pagas/não pagas, rótulos CC, exclusão Impostos na Despesa). Complementa `039-dashboard-nomenclatura`. Sem migration.

## Summary

Reorganizar o Dashboard em seções tituladas (Metas → Receita → Despesa|Resultado → Saldo → Centro de Despesa → Demonstrativo de Resultado), com novos cards **Impostos**, **Despesas Fixas/Variáveis/Pendentes** e **Lucro**, saldos por conta corrente (até 3 + investimento), títulos de gráficos atualizados e **exclusão de Impostos** do Centro de Despesa. Agregações novas preferencialmente no client reutilizando APIs já usadas (`contas`, `impostos/de-contas`, `custo-por-categoria`, saldos/CC); mapa canônico categoria→fixa|variável documentado (não há campo no schema).

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend intocado salvo se optarmos por filtro aditivo em `custo-por-categoria` — preferência: filtrar no client)

**Primary Dependencies**: React, Tailwind, Recharts, Axios (`relatoriosService`, `impostosService`, `contasService`, `contasCorrentesService`, `saldosService`, `metasService`, `nfsService`, `fluxoMovimentosService`); Zustand (`useAuthStore`)

**Storage**: PostgreSQL existente — **sem** migration; sem novo campo `tipo_despesa`

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend; backend opcionalmente intocado)

**Performance Goals**: Mesmo `Promise.all` / spinner da Dashboard; +1 request (`impostosService.deContas`); agregações O(n) no client sobre listas já carregadas (SC-002 ≤ 1 min de localização visual; carga ≤ expectativa atual do painel)

**Constraints**: Portas fixas; JWT; só Dashboard; papéis admin/visualizador; sem redesenho amplo; Impostos fora de Fixas/Variáveis/Pendentes e do Centro de Despesa; Lucro = RL − (Fixas + Variáveis); % Lucro e card Impostos conforme clarify

**Scale/Scope**: 1 página principal (`Dashboard.tsx`); helpers/constantes de agregação no frontend; 0 migrations; 0 páginas novas; contrato UI + regras de agregação

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — mesmos papéis; edição de meta só admin |
| III. Clareza antes de implementar | PASS — clarify 5/5; gap Fixas/Variáveis resolvido em research (mapa canônico) |
| IV. Consistência com produto existente | PASS — reusa serviços, filtros mês/ano, `saldoVisivel`, `de-contas`, donuts/DRE/DRL |
| V. Simplicidade e escopo fechado | PASS — sem migration; filtro Impostos no client; mapa categoria→natureza em constante |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Mapa canônico evita schema novo; ajuste futuro de natureza pode virar feature própria se o negócio divergir.

## Project Structure

### Documentation (this feature)

```text
specs/040-dashboard-secoes-cards/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-dashboard-secoes-cards.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/
└── src/
    ├── pages/
    │   └── Dashboard.tsx              # seções, cards, layout, títulos, agregações
    ├── services/
    │   └── api.ts                     # garantir uso de impostosService.deContas (já existe)
    └── utils/                         # opcional: mapa natureza + agregadores de despesa/saldo
        └── dashboardDespesas.ts       # (criar se extrair helpers do Dashboard)
```

**Structure Decision**: Escopo visual e de agregação no Dashboard. Preferir helpers em `utils/` se o arquivo crescer demais. Backend permanece; exclusão de impostos no donut no client (recalcula `total`/`percentual`). Sem endpoint novo nesta entrega.

## Complexity Tracking

> Sem violações a justificar.
