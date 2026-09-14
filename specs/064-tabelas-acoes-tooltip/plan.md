# Implementation Plan: Ações de Tabela Só com Tooltip

**Branch**: `064-tabelas-acoes-tooltip` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/064-tabelas-acoes-tooltip/spec.md`

**Note**: Clarify 2026-09-14 — (B) todas as ações ícone+texto da coluna; alinhamento horizontal sem wrap; (C) ações só-texto permanecem com texto.

## Summary

Nas listagens, ações de linha que hoje usam `ActionButton` com `context="row"` (ícone + texto) passam a exibir **somente o ícone**, com o `label` no **tooltip nativo** (`title`) e em `aria-label`. Botões de cabeçalho (`context="header"`) e ações **só-texto** (ex.: Substituir/Remover de anexos) **não mudam**. Controles da célula de ações ficam em linha horizontal **sem** `flex-wrap`.

Abordagem: alterar o componente compartilhado `ActionButton` + estilos de `row` + trocar wrappers `flex-wrap` → `flex-nowrap` nas páginas. Sem backend, sem API, sem migrations.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend)

**Primary Dependencies**: React, Tailwind; `ActionButton`, `actionIcons`, `actionButtonStyles`

**Storage**: N/A — só apresentação de UI

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend; backend intocado)

**Performance Goals**: Sem impacto perceptível — mesmos botões, menos nós de texto

**Constraints**: Portas fixas; papéis `admin`/`visualizador` inalterados; `context="header"` inalterado; ações só-texto inalteradas; sem novos ícones só para converter texto

**Scale/Scope**: 1 componente central + estilos + ~8 páginas com wrappers `flex-wrap` na coluna de ações; 0 endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — mesma disponibilidade de ações por papel |
| III. Clareza antes de implementar | PASS — clarify fechou escopo, layout e exceção só-texto |
| IV. Consistência com produto existente | PASS — mesmo `ActionButton` / variantes / ícones; padrão uniforme em todas as listagens |
| V. Simplicidade e escopo fechado | PASS — mudança central no componente; sem API/CRUD/biblioteca de tooltip |
| Portas / segredos | PASS — sem credenciais; portas inalteradas |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não alterar handlers, permissões, API nem botões de header “por antecipação”. Tooltip via `title` nativo (sem lib nova).

## Project Structure

### Documentation (this feature)

```text
specs/064-tabelas-acoes-tooltip/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-acoes-tabela-tooltip.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/src/components/ActionButton.tsx      # row: ocultar span; title + aria-label
frontend/src/utils/actionButtonStyles.ts      # ROW_BASE: padding/gap adequados a ícone-only
frontend/src/pages/NFs.tsx                    # flex-nowrap na coluna de ações
frontend/src/pages/Contas.tsx                 # idem (+ preservar anexos só-texto)
frontend/src/pages/Fornecedores.tsx           # idem (Colaboradores)
frontend/src/pages/Bonus.tsx                  # idem
frontend/src/pages/Ferias.tsx                 # idem
frontend/src/pages/DH.tsx                     # idem
frontend/src/pages/Patrimonio.tsx             # idem
frontend/src/pages/FluxoCaixa.tsx             # wrappers de ActionButton context=row sem wrap
```

**Structure Decision**: A regra visual de `context="row"` vive em `ActionButton` + `actionButtonStyles`. Páginas só ajustam o container (`flex-nowrap` / `items-center`) para FR-009. Controles fora de `ActionButton` (Substituir/Remover, badges DH) ficam intactos (FR-003a / FR-007).

## Complexity Tracking

> Sem violações a justificar.
