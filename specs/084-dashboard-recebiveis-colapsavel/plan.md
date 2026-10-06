# Implementation Plan: Previsão de Recebíveis Recolhível no Dashboard

**Branch**: `084-dashboard-recebiveis-colapsavel` | **Date**: 2026-10-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/084-dashboard-recebiveis-colapsavel/spec.md`

**Note**: Clarify 2026-10-06 — cabeçalho (título, subtítulo, total) visível quando fechada; estado não persistido; mesmo comportamento para `admin` e `visualizador`.

## Summary

Transformar a seção "Previsão de Recebíveis" do Dashboard em um bloco recolhível que **inicia fechado**. O cabeçalho (título, subtítulo de referência/visão e "Total em aberto") vira um botão de alternância com seta indicadora; os cards por faixa de vencimento (ou a mensagem de erro) só são renderizados quando a seção está aberta. Estado local de componente (`useState(false)`), sem persistência, sem backend e sem nova busca de dados.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend)

**Primary Dependencies**: React, Tailwind CSS; ícone `ChevronRightIcon` já existente em `frontend/src/components/navIcons.tsx`

**Storage**: N/A — estado efêmero de UI

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (somente frontend; backend intocado)

**Performance Goals**: Sem impacto — alternância local, nenhuma requisição adicional

**Constraints**: Não alterar cálculo/fonte do aging (feature 060); não alterar carregamento de dados; acessível por teclado (`button` nativo + `aria-expanded`/`aria-controls`); tema claro/escuro

**Scale/Scope**: 1 arquivo (`Dashboard.tsx`); 0 endpoints; 0 migrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — só apresentação; permissões intactas |
| III. Clareza antes de implementar | PASS — clarify fechou conteúdo visível, persistência e papéis |
| IV. Consistência com produto existente | PASS — reaproveita ícone de seta da sidebar e o card atual da seção |
| V. Simplicidade e escopo fechado | PASS — `useState` local; sem lib de accordion; demais seções intocadas |
| Portas / segredos | PASS — sem credenciais; portas inalteradas |

**Post-design re-check**: Sem violações. Complexity Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/084-dashboard-recebiveis-colapsavel/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-previsao-recebiveis-colapsavel.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/pages/Dashboard.tsx         # estado agingAberto + cabeçalho clicável + render condicional dos cards
frontend/src/components/navIcons.tsx     # ChevronRightIcon (reuso, sem alteração)
```

**Structure Decision**: Feature 100% frontend, concentrada no bloco "Previsão de Recebíveis" de `Dashboard.tsx`. Nenhum componente genérico de collapse é criado (só há um uso; evitar abstração antecipada).

## Complexity Tracking

> Sem violações a justificar.
