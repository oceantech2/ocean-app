# Implementation Plan: Padronizar ícones, menu aberto e botões

**Branch**: `045-padronizar-icones-menu` | **Date**: 2026-08-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/045-padronizar-icones-menu/spec.md`

**Note**: Feature **somente frontend** — menu lateral, componentes compartilhados de ação e refatoração de páginas de listagem/CRUD. Sem mudanças de API/backend.

## Summary

Padronizar a UX do Ocean App em três frentes: (1) menu lateral **sempre expandido** ao entrar/recarregar, sem colapso ao clicar no conteúdo e **sem persistência** de recolhido entre visitas; (2) ícones e rótulos consistentes no menu (global) e nos botões de listagem/CRUD; (3) ordem, tamanho de texto e estilo (**fundo colorido suave** nas linhas) unificados nas páginas de listagem com tabelas, excluindo Dashboard e Configurações.

Abordagem técnica: ajustar `Layout.tsx` e `useUIStore`; extrair ícones/ações para módulos compartilhados (`actionIcons.tsx`, `ActionButton.tsx`); migrar páginas no escopo para usar variantes tipadas (`editar`, `excluir`, `fluxo`, `auxiliar`, etc.) e ordem canônica de cabeçalho/linha.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); backend inalterado

**Primary Dependencies**: React, React Router, Zustand (`useUIStore`, `useAuthStore`), Tailwind CSS; SVG inline (padrão `navIcons.tsx` / ícones locais em `NFs.tsx`) — **sem nova lib de ícones**

**Storage**: Estado do menu **somente em memória** (Zustand) por sessão; remover leitura/gravação de `ocean-sidebar-collapsed:{usuario}` no fluxo normal (opcional: limpar chaves legadas no hydrate). Sem PostgreSQL/Redis.

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend

**Target Platform**: Web interna (browser); frontend dev **5193**; API **8001** (sem alteração)

**Project Type**: Web application — escopo desta feature = frontend autenticado

**Performance Goals**: Alternância de menu na sessão instantânea; refatoração visual sem requisições extras

**Constraints**: Portas fixas; papéis/permissões intactos (FR-015); Dashboard e Configurações fora do escopo de botões (FR-017); rótulo destrutivo sempre **Excluir** (FR-018); Novo/Nova por último no cabeçalho (FR-011)

**Scale/Scope**: ~12 páginas de listagem/CRUD; 1 `Layout`; extensão/refatoração de `useUIStore`; 2–3 componentes/utilitários novos; 0 endpoints; 0 migrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — não altera autorização |
| III. Clareza antes de implementar | PASS — clarify concluído (5 decisões) |
| IV. Consistência com produto existente | PASS — Layout, Zustand, Tailwind, padrão de botões existente |
| V. Simplicidade e escopo fechado | PASS — componentes compartilhados mínimos; sem API; Dashboard/Config fora |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/045-padronizar-icones-menu/
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
    │   ├── Layout.tsx              # Menu: sempre expandido no mount; remover colapso no clique do main
    │   ├── navIcons.tsx            # Ícones do menu (revisão de consistência se necessário)
    │   ├── actionIcons.tsx         # (novo) ícones de ação compartilhados
    │   └── ActionButton.tsx        # (novo) botão padronizado (cabeçalho + linha + variantes)
    ├── utils/
    │   └── actionButtonStyles.ts   # (novo) mapa variante → classes Tailwind
    ├── store/
    │   └── index.ts                # useUIStore: sidebar só sessão; sem persistência entre visitas
    └── pages/
        ├── NFs.tsx                 # Reordenar cabeçalho; ícone+texto nas linhas; usar ActionButton
        ├── Contas.tsx              # Deletar→Excluir; padronizar ações
        ├── Fornecedores.tsx
        ├── Ferias.tsx
        ├── DH.tsx
        ├── Bonus.tsx               # Comissões
        ├── Patrimonio.tsx
        ├── FluxoCaixa.tsx          # Borda → fundo suave nas linhas
        ├── Retiradas.tsx
        ├── Impostos.tsx
        ├── Calendario.tsx
        ├── Auditoria.tsx           # Se tiver tabela+ações no escopo
        └── Seguranca.tsx           # Se tiver tabela+ações no escopo
        # FORA DO ESCOPO de botões: Dashboard.tsx, Configuracoes.tsx
```

**Structure Decision**: Centralizar ícones e estilos de ação evita duplicar SVGs (hoje `NFs.tsx` define ícones locais) e classes Tailwind espalhadas (`text-xs px-2 py-1 bg-blue-100...`). Páginas no escopo passam a compor `ActionButton` com `variant` + `context="header"|"row"`. Menu permanece em `Layout` + `useUIStore`, com comportamento revertido em relação à feature `005-sidebar-collapse-icons` (sem clique-fora e sem localStorage).

## Complexity Tracking

> Sem violações a justificar.
