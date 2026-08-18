# Implementation Plan: Tabela Contas a Receber — Cabeçalho em Duas Linhas e Coluna/Cabeçalho Fixos

**Branch**: `033-contas-receber-tabela` | **Date**: 2026-08-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/033-contas-receber-tabela/spec.md`

**Note**: Feature **somente frontend**. Clarify 2026-08-18: “título” = nomes das colunas; Ações fixa à direita; scroll vertical interno na área da tabela; área ocupa o espaço restante da tela.

## Summary

Na página Contas a Receber (`NFs.tsx`), tornar a linha de **nomes das colunas** mais alta com quebra em até **duas linhas**, para as colunas não se alargarem só pelo rótulo. A tabela passa a ter **área própria** que preenche o espaço abaixo de título, filtros e cards de resumo: cabeçalho fixo no topo dessa área, **Projeto** fixo à esquerda, **Ações** fixa à direita, rolagem vertical no corpo e **rolagem horizontal no cabeçalho** (sincronizada com as células). Sem API, migration ou mudança de regras de negócio.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); backend inalterado

**Primary Dependencies**: React, Tailwind CSS; refs + `onScroll` para sincronizar `scrollLeft` — **sem biblioteca nova** de virtualização ou grid

**Storage**: N/A — sem persistência nova; dados da lista inalterados

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend

**Target Platform**: Web interna (browser); frontend **5193**; API **8001** (sem alteração)

**Project Type**: Web application (frontend + backend) — escopo desta feature = frontend

**Performance Goals**: Rolagem fluida na página atual (dezenas de linhas por página, ~13 colunas); sincronização horizontal sem atraso perceptível; resize da janela atualiza a área da tabela

**Constraints**: Portas fixas; papéis admin/visualizador intactos; não alterar outras tabelas; não mudar filtros, ordenação, paginação, modais nem células de dados (exceto sticky); não grudar cabeçalho no topo da janela

**Scale/Scope**: 1 página (`NFs.tsx`); ajuste mínimo de `Layout.tsx` só se o `main` impedir altura restante (opt-in, sem quebrar scroll das outras rotas); 0 endpoints; 0 migrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — mesma página e permissões; só layout da tabela |
| III. Clareza antes de implementar | PASS — 4 clarificações na spec; sem `[NEEDS CLARIFICATION]` |
| IV. Consistência com produto existente | PASS — Tailwind, sticky já usado em Ações, dark mode nas células |
| V. Simplicidade e escopo fechado | PASS — só Contas a Receber; sem grid lib; sem extrair componente compartilhado “por antecipação” |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não alterar scroll global das outras páginas. Não virtualizar linhas. Não mudar paginação (continua abaixo da área da tabela).

## Project Structure

### Documentation (this feature)

```text
specs/033-contas-receber-tabela/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-contas-receber-tabela.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/src/pages/NFs.tsx              # layout da página, área da tabela, cabeçalho, sticky, sync de scroll
frontend/src/components/Layout.tsx      # só se main/body precisarem de cadeia flex + min-h-0 nesta rota, sem cortar outras páginas
```

**Structure Decision**: Toda a UX fica em `NFs.tsx` (página já existente de Contas a Receber). `Layout.tsx` só entra se for indispensável para a cadeia `h-screen` / `flex-1` / `min-h-0` **nesta rota**, preservando o scroll de documento nas demais. Backend, `api.ts` e tipos não mudam.

## Complexity Tracking

> Sem violações a justificar.
