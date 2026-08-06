# Implementation Plan: Dashboard — Card NFs com Pagamento Pendente (R$)

**Branch**: `010-dashboard-nfs-pendente` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-dashboard-nfs-pendente/spec.md`

**Note**: Clarificações da sessão 2026-08-06 incorporadas: card único com valor em destaque e subtítulo `{n} NFs pendentes`; faixa permanece com 3 KPIs.

## Summary

Substituir o KPI **“NFs Pendentes”** (quantidade como valor principal) por **“NFs com pagamento pendente (R$)”**: valor principal = soma do **valor bruto** das NFs com `status = pendente` no mesmo contexto do resumo atual; subtítulo = `{quantidade_pendentes} NFs pendentes`. Estender `GET /api/relatorios/resumo-financeiro` com `faturamento_bruto_pendente` (hoje só existe `faturamento_liquido_pendente`). Frontend: estado `resumo` + card em `Dashboard.tsx`. Sem migration; Relatórios fora de escopo.

## Technical Context

**Language/Version**: Python 3.11+ (FastAPI backend); TypeScript 5.2 + React 18 (frontend)

**Primary Dependencies**: FastAPI, SQLAlchemy; React, Tailwind, Axios (`relatoriosService.resumoFinanceiro`)

**Storage**: PostgreSQL existente — sem migration; reutiliza entidade `NF` / `StatusNF.PENDENTE`

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend; smoke JWT do `resumo-financeiro` conferindo o novo campo

**Target Platform**: Web interna (browser); API porta **8001**; frontend dev **5193**

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Mesmo ciclo de carga da Dashboard (`Promise.all` + spinner); sem endpoint novo

**Constraints**: Portas fixas; JWT; só Dashboard (FR-009); não alterar Relatórios; papéis `admin` / `visualizador` só leitura no card; manter grid `md:grid-cols-3`

**Scale/Scope**: 1 campo novo na resposta de `resumo-financeiro`; mudanças concentradas em `relatorios.py` + `Dashboard.tsx`; 0 migrations; 0 páginas/menus novos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (artefatos e UX em pt-BR) | PASS |
| II. Domínio financeiro + papéis admin/visualizador | PASS |
| III. Clareza antes de implementar (clarify 2/2 feito) | PASS |
| IV. Consistência com produto (KPI cards, `fmt`, subtítulo como Líquido) | PASS |
| V. Simplicidade e escopo fechado (1 campo API + 1 card UI) | PASS |
| Portas / sem segredos em artefatos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Campo `faturamento_bruto_pendente` alinhado à nomenclatura já usada (`faturamento_bruto_pago` / `faturamento_liquido_pendente`).

## Project Structure

### Documentation (this feature)

```text
specs/010-dashboard-nfs-pendente/
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
        └── relatorios.py          # resumo-financeiro: + faturamento_bruto_pendente

frontend/
└── src/
    └── pages/
        └── Dashboard.tsx          # KPI card unificado; estado resumo
```

**Structure Decision**: Backend só expõe a soma bruta pendente no endpoint já consumido pela Dashboard. UI concentra título, `fmt(valor)` e subtítulo no terceiro KPI. `api.ts` não precisa de mudança de assinatura (`resumoFinanceiro(ano)` já retorna o JSON ampliado). Texto de insights que cita quantidade (ex.: “Acompanhar N NFs pendentes”) pode permanecer — fora do card KPI.

## Complexity Tracking

> Sem violações a justificar.
