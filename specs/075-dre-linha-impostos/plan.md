# Implementation Plan: DRE — Linha Impostos (Contas Imposto / DAS)

**Branch**: `075-dre-linha-impostos` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/075-dre-linha-impostos/spec.md`

**Note**: Clarify 2026-09-16 (3/3): Impostos do DRE por **data de vencimento**; card Impostos (NFs) **inalterado**; **sem** hint de divergência. Complementa `003`, `047` (substitui fonte de Impostos só no DRE) e `074` (`tipo_despesa=imposto_das`).

## Summary

No gráfico **DRE** do Dashboard: (1) reposicionar o segmento **Impostos** **antes** de **Despesa** na pilha de composição (ordem canônica: Receita bruta → Impostos → Despesa → Lucro); (2) recalcular `impostos` em `GET /api/relatorios/dre-mensal` como Σ Contas a Pagar com `tipo_despesa=imposto_das` e `data_vencimento` no mês (pagas e pendentes), alinhado a `GET /api/impostos/de-contas`; (3) manter `despesa` excluindo `imposto_das` e `lucro = receita_bruta − despesa − impostos`. Card Impostos da seção Receita permanece em NFs; sem migration; sem aviso UI.

## Technical Context

**Language/Version**: Python 3.11 (FastAPI) + TypeScript 5.2 / React 18

**Primary Dependencies**: FastAPI, SQLAlchemy, React, Recharts, Axios (`relatoriosService.dreMensal`); `ContaPagar.tipo_despesa` (`074`)

**Storage**: PostgreSQL 16 existente (`contas_pagar`, `nfs`) — **sem** migration

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend; smoke do endpoint DRE (API 8001)

**Target Platform**: Web interna; API **8001**; frontend **5193**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (backend + frontend)

**Performance Goals**: DRE continua 1 request/ano com 12 agregações; SC-005 ≤ 1 min de interpretação; carga do bloco DRE no padrão já vigente do Dashboard

**Constraints**: Portas fixas; JWT; só DRE + `dre-mensal` + ordem das `<Bar>` no Dashboard; não alterar card Impostos / abas / Fixas·Variáveis·Pendentes / Resultado / página Impostos; sem hint de bases; papéis admin/visualizador somente leitura no DRE

**Scale/Scope**: `relatorios.py` (`dre_mensal`); `Dashboard.tsx` (ordem Impostos antes de Despesa); contratos REST/UI; 0 migrations; 0 páginas novas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS |
| III. Clareza antes de implementar | PASS — clarify 3/3 integrado |
| IV. Consistência com produto existente | PASS — reutiliza filtro `imposto_das` já usado em despesa/custo/`impostos/de-contas`; UX DRE intacta |
| V. Simplicidade e escopo fechado | PASS — 1 endpoint + reorder de Barras; sem migration nem hint |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Fonte de Impostos do DRE diverge deliberadamente do card (NFs) — documentado em [research.md](./research.md) e [contracts/](./contracts/).

## Project Structure

### Documentation (this feature)

```text
specs/075-dre-linha-impostos/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── rest-dre-mensal-impostos-das.md
│   └── ui-dre-linha-impostos.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/app/api/routes/relatorios.py   # dre_mensal: impostos ← ContaPagar imposto_das por vencimento
frontend/src/pages/Dashboard.tsx       # <Bar impostos> antes de <Bar despesa> (stackId composicao)
frontend/src/services/api.ts           # sem mudança de contrato (mesmo shape); smoke se tipagem existir
```

**Structure Decision**: Web app existente (backend FastAPI + frontend React). Sem novos pacotes; alteração pontual no agregador DRE e na ordem visual do gráfico.
