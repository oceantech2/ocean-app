# Implementation Plan: Barra Lateral Colapsável com Ícones

**Branch**: `005-sidebar-collapse-icons` | **Date**: 2026-07-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-sidebar-collapse-icons/spec.md`

**Note**: Feature **somente frontend** — ícones + colapso da sidebar em `Layout.tsx`, estado em `useUIStore`, preferência em `localStorage` por usuário. Sem mudanças de API/backend.

## Summary

Evoluir a barra de navegação lateral do Ocean App para exibir **ícone + rótulo** no modo expandido e **somente ícones** no modo colapsado, com controle explícito de colapso/expansão, colapso ao clicar na área de conteúdo, dica de nome (tooltip/`title`) no modo colapsado, contadores numéricos de notificação mantidos, e preferência **por usuário logado** persistida no navegador (padrão: expandida).

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); backend inalterado

**Primary Dependencies**: React, React Router, Zustand (`useUIStore`, `useAuthStore`), Tailwind CSS; ícones via componentes SVG inline (padrão já usado no Layout/Dashboard) — **sem nova lib de ícones**

**Storage**: `localStorage` no browser (chave por usuário); sem PostgreSQL/Redis para esta feature

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend

**Target Platform**: Web interna (browser); frontend dev **5193**; API **8001** (sem alteração)

**Project Type**: Web application (frontend + backend) — escopo desta feature = frontend

**Performance Goals**: Alternância expandido/colapsado instantânea (&lt;100 ms percebido); sem requisições extras

**Constraints**: Portas fixas; papéis/permissões existentes intactos (FR-010); sem overlay/drawer mobile (FR-013); sem redesign do topo (busca/alertas); clique fora só colapsa, não expande (FR-014/015)

**Scale/Scope**: ~16 itens de menu; 1 componente Layout; extensão de `useUIStore`; mapa de ícones; 0 endpoints; 0 migrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — não altera autorização; só UX da nav |
| III. Clareza antes de implementar | PASS — clarify concluído na spec |
| IV. Consistência com produto existente | PASS — Layout, Zustand, localStorage como dark mode |
| V. Simplicidade e escopo fechado | PASS — só sidebar; sem lib nova; sem API |
| Portas / segredos | PASS — sem mudança de portas; sem credenciais nos artefatos |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/005-sidebar-collapse-icons/
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
    ├── components/
    │   ├── Layout.tsx           # Sidebar: ícones, colapso, clique fora, tooltips
    │   └── navIcons.tsx         # (novo) mapa path → componente SVG
    └── store/
        └── index.ts             # useUIStore: sidebarCollapsed + persistência por usuário
```

**Structure Decision**: Toda a lógica fica no frontend autenticado. `Layout.tsx` concentra UX da barra; `useUIStore` espelha o padrão de `darkMode` com chave `localStorage` por `usuario`; ícones em módulo dedicado para não inflar o Layout. Backend e rotas de páginas permanecem intactos.

## Complexity Tracking

> Sem violações a justificar.
