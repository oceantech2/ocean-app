# Implementation Plan: Cabeçalho com Filtros Fixo no Scroll

**Branch**: `076-cabecalho-filtro-fixo` | **Date**: 2026-09-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/076-cabecalho-filtro-fixo/spec.md`

**Note**: Clarify 2026-09-23 — (B) título/ações + filtros fixos empilhados; (A) Dashboard no escopo; (A) KPIs rolam e não ficam fixos.

## Summary

Fixar o **cabeçalho de página** (título, ações do topo e controles de filtro) durante a rolagem vertical em todas as telas com filtros no topo — incluindo o **Dashboard** — no espírito do padrão já usado em **Fluxo de Caixa**, corrigindo o offset para ficar **abaixo do header global** da aplicação (`Layout`, ~`5.5rem`). Cards de KPI entre título e filtros **não** ficam sticky; após saírem da vista, título e filtros ficam contíguos. Sem backend, sem mudança de regras de negócio ou de cabeçalho de colunas de tabela (feature 073).

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend)

**Primary Dependencies**: React, Tailwind CSS; páginas em `frontend/src/pages/*`; referência `FluxoCaixa.tsx` + `Layout.tsx` (`sticky top-[5.5rem]`)

**Storage**: N/A — só apresentação de UI

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend; backend intocado)

**Performance Goals**: Sem impacto perceptível — CSS `position: sticky` nativo, sem libs novas

**Constraints**: Portas fixas; papéis `admin`/`visualizador` inalterados; não alterar lógica de filtros; não regredir sticky de `th` (073); fundo opaco claro/escuro; impressão sem exigir sticky; z-index abaixo do header global (`z-50`) e acima do conteúdo

**Scale/Scope**: ~12 páginas com filtros no topo + utilitário compartilhado de classes; 0 endpoints; 0 migrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — só apresentação; permissões intactas |
| III. Clareza antes de implementar | PASS — clarify fechou empilhamento, Dashboard e KPIs |
| IV. Consistência com produto existente | PASS — espelha Fluxo de Caixa; alinha offset ao Layout |
| V. Simplicidade e escopo fechado | PASS — classes Tailwind / constante de UI; sem API, sem lib sticky |
| Portas / segredos | PASS — sem credenciais; portas inalteradas |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não reordenar KPIs abaixo dos filtros “por antecipação” se dual-sticky com offsets bastar; não mexer em `tableScroll.ts` / sticky de coluna além de garantir z-index compatível.

## Project Structure

### Documentation (this feature)

```text
specs/076-cabecalho-filtro-fixo/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-cabecalho-filtro-fixo.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/src/utils/pageHeaderSticky.ts   # constantes TITLE / FILTERS / COMBINED sticky
frontend/src/components/Layout.tsx       # referência de altura do header (~5.5rem); sem mudança obrigatória
frontend/src/pages/FluxoCaixa.tsx        # referência visual — corrigir top-0 → offset Layout
frontend/src/pages/Dashboard.tsx         # título + filtros de período no mesmo card → sticky combinado
frontend/src/pages/Contas.tsx            # título sticky + filtros sticky (KPIs no meio rolam)
frontend/src/pages/NFs.tsx               # título + filtros (blocos separados)
frontend/src/pages/Bonus.tsx
frontend/src/pages/Ferias.tsx
frontend/src/pages/DH.tsx
frontend/src/pages/Fornecedores.tsx
frontend/src/pages/Patrimonio.tsx
frontend/src/pages/Impostos.tsx
frontend/src/pages/Retiradas.tsx
frontend/src/pages/Auditoria.tsx
frontend/src/utils/tableScroll.ts        # intocado (cabeçalho de coluna); só validar z-index
```

**Structure Decision**: Feature 100% frontend. Extrair constantes Tailwind em `pageHeaderSticky.ts` (espelhando `tableScroll.ts`). Aplicar página a página: bloco único (título+filtros) → sticky combinado; blocos separados com KPIs entre → dual sticky com offsets. Backend intocado. Telas sem filtro no topo (Calendário, Segurança, Contratos, Configurações sem filtro de listagem, etc.) fora do escopo.

## Complexity Tracking

> Sem violações a justificar.
