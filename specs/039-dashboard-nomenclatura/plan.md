# Implementation Plan: Dashboard — Nomenclatura e Remoção de Card

**Branch**: `039-dashboard-nomenclatura` | **Date**: 2026-08-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/039-dashboard-nomenclatura/spec.md`

**Note**: Feature só de UI no Dashboard. Sem migration, sem alteração de contratos REST, sem mudança de cálculo. Clarify não gerou Qs críticas.

## Summary

Atualizar os rótulos visíveis do Dashboard para o vocabulário de **Receita** / **Centro de Despesas** / **DRL** e **remover** o card/gráfico **Fechamentos por Tipo**. Após a remoção, o gráfico **DRL** ocupa a largura disponível da fileira. Limpar estado e chamada `fechamentosPorTipo` que só serviam esse card. Identificadores de API/estado (`faturamento_bruto_pago`, etc.) permanecem — só texto apresentado ao usuário muda.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend)

**Primary Dependencies**: React, Tailwind, Recharts (LineChart permanece; PieChart do card removido deixa de ser necessário neste arquivo se não houver outro uso)

**Storage**: N/A — sem mudança de schema ou persistência

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`

**Target Platform**: Web interna; frontend **5193**; API **8001** (inalteradas)

**Project Type**: Web application (frontend; backend intocado)

**Performance Goals**: Sem impacto — menos um request (`fechamentosPorTipo`) no `carregarDados`

**Constraints**: Portas fixas; JWT; escopo só Dashboard; papéis admin/visualizador inalterados; não renomear página Impostos nem outros módulos; não alterar fórmulas/DTOs da API

**Scale/Scope**: 1 arquivo principal (`Dashboard.tsx`); 0 migrations; 0 endpoints novos; ~7 strings de rótulo + remoção de 1 bloco UI

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — mesmos papéis; só rótulos e ausência do card |
| III. Clareza antes de implementar | PASS — clarify sem Qs; renomes e remoção explícitos na spec |
| IV. Consistência com produto existente | PASS — mesmos cards/filtros; DRL em largura total após remoção do pie |
| V. Simplicidade e escopo fechado | PASS — só `Dashboard.tsx`; sem API/schema |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/039-dashboard-nomenclatura/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-dashboard-nomenclatura.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/
└── src/
    └── pages/
        └── Dashboard.tsx   # rótulos; remover pie Fechamentos; limpar fetch/estado; layout DRL
```

**Structure Decision**: Toda a mudança é local em `Dashboard.tsx`. Endpoint `fechamentosPorTipo` pode permanecer no backend/serviço para outros usos futuros; apenas deixa de ser chamado pela Dashboard. Sem contratos REST novos.

## Complexity Tracking

> Sem violações a justificar.
