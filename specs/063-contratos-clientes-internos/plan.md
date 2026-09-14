# Implementation Plan: Renomear Atalhos da Página Contratos

**Branch**: `063-contratos-clientes-internos` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/063-contratos-clientes-internos/spec.md`

**Note**: Clarify 2026-09-14: sem perguntas críticas; rótulos e ordem já inequívocos na spec.

## Summary

Na página **Contratos**, trocar apenas os rótulos visíveis dos dois atalhos existentes: o de cima passa de **Contratos ativos** para **Contratos Clientes**; o de baixo, de **Contratos arquivados** para **Contratos Internos**. Destinos (URLs do Google Drive), ordem, título da página, item de menu, catálogo, permissões e visibilidade permanecem.

Abordagem: editar as constantes `rotulo` em `frontend/src/pages/Contratos.tsx`. Sem backend, sem catálogo, sem novos componentes.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend)

**Primary Dependencies**: React, Tailwind; página já existente `Contratos.tsx`

**Storage**: N/A — atalhos são constantes de UI; sem schema nem persistência

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend; backend intocado)

**Performance Goals**: Sem impacto — mesma página estática, só texto dos atalhos muda

**Constraints**: Portas fixas; JWT e papéis vigentes; URLs dos atalhos **não** mudam; `target="_blank"` e `rel="noopener noreferrer"` permanecem; escopo só rótulos na página Contratos

**Scale/Scope**: 1 arquivo (`frontend/src/pages/Contratos.tsx`); 2 strings; 0 endpoints; 0 migrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — mesmos papéis; mesmos atalhos para ambos |
| III. Clareza antes de implementar | PASS — clarify sem Qs; rótulos explícitos na spec |
| IV. Consistência com produto existente | PASS — mesma página, layout e comportamento de link |
| V. Simplicidade e escopo fechado | PASS — só duas strings; sem API/CRUD/catálogo |
| Portas / segredos | PASS — sem credenciais Drive; portas inalteradas |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não alterar `paginasCatalogo.ts`, `App.tsx`, backend nem URLs “por antecipação”. Artefatos históricos de `052-pagina-contratos` não são reescritos nesta entrega.

## Project Structure

### Documentation (this feature)

```text
specs/063-contratos-clientes-internos/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-contratos-rotulos.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/src/pages/Contratos.tsx   # ATALHOS[0].rotulo e ATALHOS[1].rotulo
```

**Structure Decision**: Mudança local no array `ATALHOS` de `Contratos.tsx`. Catálogo (`paginasCatalogo.ts`), rota, ícone, guarda de visibilidade e defaults de backend já entregues em `052-pagina-contratos` e ficam intactos.

## Complexity Tracking

> Sem violações a justificar.
