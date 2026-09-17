# Implementation Plan: Headers Fixos em Tabelas com Scroll

**Branch**: `073-tabelas-header-fixo` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/073-tabelas-header-fixo/spec.md`

**Note**: Clarify 2026-09-16 — (A) área com altura limitada + sticky em listagens de página; (C) Dashboard sem altura forçada; (B) modais só sticky se já houver scroll.

## Summary

Padronizar o comportamento de **cabeçalho fixo** das tabelas de listagem no padrão já usado em **Contas a Pagar**: container com `overflow-auto` + `max-h-[calc(100vh-22rem)]` e células `<th>` com `sticky top-0`, fundo opaco (claro/escuro) e sombra de borda inferior. Aplicar em todas as páginas de listagem/CRUD com `<table>`, sem alterar backend, dados ou regras de negócio.

Exceções: **Dashboard** (sem altura forçada; sticky só se já houver scroll próprio — hoje sem `<table>` HTML); **modais** (sticky oportunista, sem `max-h` estilo Contas); **NFs / Contas a receber** (já congela o header via grade dual sincronizada — preservar, não regressir).

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend)

**Primary Dependencies**: React, Tailwind CSS; páginas em `frontend/src/pages/*`; referência `Contas.tsx`

**Storage**: N/A — só apresentação de UI

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend; backend intocado)

**Performance Goals**: Sem impacto perceptível — CSS sticky nativo, sem libs novas

**Constraints**: Portas fixas; papéis `admin`/`visualizador` inalterados; não mudar ordenação/filtros/ações; Contas a Pagar como referência; NFs não deve perder o header congelado atual; dark mode legível

**Scale/Scope**: ~10 páginas com `<table>` de listagem + possível constante compartilhada de classes; 0 endpoints; 0 migrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — só apresentação; permissões intactas |
| III. Clareza antes de implementar | PASS — clarify fechou scroll, Dashboard e modais |
| IV. Consistência com produto existente | PASS — espelha Contas a Pagar; preserva padrão NFs já correto |
| V. Simplicidade e escopo fechado | PASS — classes Tailwind / constante de UI; sem API, sem lib sticky |
| Portas / segredos | PASS — sem credenciais; portas inalteradas |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não “unificar” NFs no padrão Contas por antecipação (risco de regressão no sync de scroll / sticky left). Não forçar `max-h` em Dashboard/modais.

## Project Structure

### Documentation (this feature)

```text
specs/073-tabelas-header-fixo/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-tabelas-header-fixo.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/src/utils/tableScroll.ts          # (opcional) constantes TABLE_SCROLL / TH_STICKY
frontend/src/pages/Contas.tsx              # referência — só ajuste cosmético se necessário
frontend/src/pages/NFs.tsx                 # preservar header congelado atual (fora do retrofit Contas)
frontend/src/pages/Fornecedores.tsx        # overflow-auto + max-h + th sticky
frontend/src/pages/Ferias.tsx              # idem
frontend/src/pages/DH.tsx                  # idem
frontend/src/pages/Bonus.tsx               # tabelas por colaborador — sticky por grade
frontend/src/pages/Patrimonio.tsx          # idem
frontend/src/pages/Impostos.tsx            # idem
frontend/src/pages/Retiradas.tsx           # idem
frontend/src/pages/Auditoria.tsx           # idem
frontend/src/pages/Configuracoes.tsx       # idem
frontend/src/pages/FluxoCaixa.tsx          # duas tabelas de listagem — idem cada uma
frontend/src/pages/Dashboard.tsx           # sem max-h forçado; sticky só se surgir scroll próprio
frontend/src/components/*Modal*.tsx        # sticky oportunista se tabela + scroll; sem max-h Contas
```

**Structure Decision**: Feature 100% frontend. Preferir constante compartilhada de classes Tailwind (espelhando Contas) para evitar drift; aplicar página a página nos wrappers `overflow-x-auto` → `overflow-auto max-h-[…]` e nos `<th>`. NFs permanece com arquitetura de header separado. Backend intocado.

## Complexity Tracking

> Sem violações a justificar.
