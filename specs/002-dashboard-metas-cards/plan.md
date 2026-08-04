# Implementation Plan: Dashboard — Cards de Metas Lado a Lado

**Branch**: `002-dashboard-metas-cards` | **Date**: 2026-07-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-dashboard-metas-cards/spec.md`

**Note**: Feature de **reorganização visual** da faixa de metas no topo da Dashboard. Sem mudança de API, schema ou regras de cálculo de progresso.

## Summary

Reordenar e agrupar os dois blocos de meta já existentes em `Dashboard.tsx` numa única faixa de cards: **(1) Meta de Faturamento Anual** e **(2) Meta de Faturamento do mês**, lado a lado a partir de ~768px (`md`) com largura 50/50 e altura alinhada; empilhados abaixo disso. Edição inline, títulos oficiais e serviços `metasService` permanecem. Demais seções da dashboard fora de escopo.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); sem alteração de backend nesta feature

**Primary Dependencies**: React, Tailwind CSS (`md:` = 768px), react-hot-toast, Zustand (`papel`), `metasService` / `relatoriosService` existentes

**Storage**: N/A — reutiliza `MetaFinanceira` e endpoints `/api/metas` já existentes (sem migration)

**Testing**: Validação manual via [quickstart.md](./quickstart.md); frontend `npm run lint` + `npm run type-check`; sem suíte automatizada obrigatória (padrão do projeto)

**Target Platform**: Web interna (browser); viewports mobile (&lt;768px) e tablet/desktop (≥768px)

**Project Type**: Web application (frontend + backend) — **escopo desta feature: somente frontend**

**Performance Goals**: Sem regressão perceptível no carregamento da dashboard; faixa de metas no mesmo ciclo `Promise.all` atual

**Constraints**: Portas fixas do projeto; não alterar contratos de `/api/metas`; preservar significado de realizado anual (soma do gráfico) vs. mensal (`progresso`); papéis admin vs. somente leitura na UI

**Scale/Scope**: 1 página (`Dashboard.tsx`); ~2 cards na faixa superior; 0 endpoints novos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

A constituição em `.specify/memory/constitution.md` ainda é o **template não ratificado** (placeholders). Gates práticos para esta feature:

| Gate | Status |
|------|--------|
| Princípios de constituição aplicáveis | N/A — constituição não preenchida |
| Escopo alinhado ao spec (só layout/ordem das metas) | PASS |
| Sem introdução de stack nova | PASS |
| Sem mudança de schema/API sem necessidade | PASS |
| Artefatos Phase 0/1 | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/002-dashboard-metas-cards/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/
└── src/
    ├── pages/
    │   └── Dashboard.tsx          # Único arquivo de implementação previsto
    ├── services/
    │   └── api.ts                 # metasService — sem mudança de contrato
    └── store/                     # useAuthStore.papel — sem mudança

backend/                           # Fora de escopo (referência apenas)
└── app/
    ├── api/routes/metas.py
    └── models/__init__.py         # MetaFinanceira
```

**Structure Decision**: Alteração localizada em `frontend/src/pages/Dashboard.tsx`. Backend e `metasService` permanecem como estão; contratos documentam o contrato UI da faixa e o REST já existente (sem delta).

## Complexity Tracking

> Sem violações a justificar.
