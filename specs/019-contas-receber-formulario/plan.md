# Implementation Plan: Contas a Receber — Subtítulo, Recebido e Caixa oculta

**Branch**: `019-contas-receber-formulario` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/019-contas-receber-formulario/spec.md`

**Note**: Clarify concluído (3 Qs). Título = vaga, Subtítulo = empresa; listagem numa célula; Caixa investimento legado sem migração em massa.

## Summary

Ajustar a página **Contas a Receber**: no formulário, **Título** (`posicao`) e **Subtítulo** (`razao_social`); na tabela, uma coluna com título em destaque e subtítulo abaixo; ação rápida **Recebido** (não Pagar) com modal só de data; Caixa some da UI e da exportação desta página; recebimento novo grava `caixa='corrente'`; Lead/Condução/Placement saem do formulário sem apagar vínculos.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Axios, react-hot-toast; FastAPI, SQLAlchemy, Pydantic

**Storage**: PostgreSQL — **sem migration**. Reusa `nfs.posicao`, `nfs.razao_social`, `nfs.caixa`, colaboradores. Sem coluna nova.

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`; smoke POST/PUT `/api/nfs` (recebimento força corrente; PUT sem `data_pagamento` não altera Caixa investimento)

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Listagem síncrona inalterada (~dezenas de linhas)

**Constraints**: Portas fixas; papéis admin/visualizador; sem migração em massa de Caixa; sem apagar colaboradores; Candidato inalterado; Dashboard/Relatórios/DH/Calendário/Fluxo de Caixa fora

**Scale/Scope**: Evoluir `NFs.tsx` + PUT/POST `/api/nfs` (regra de Caixa) + export CSV/XLSX desta página; 0 páginas novas; 0 endpoints novos; 0 colunas novas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Contas a Receber; admin escreve; visualizador só lê |
| III. Clareza antes de implementar | PASS — spec sem `[NEEDS CLARIFICATION]`; 3 clarificações gravadas |
| IV. Consistência com produto existente | PASS — mesma página/`/api/nfs`, toast, Layout, arquivar, tipos 017 |
| V. Simplicidade e escopo fechado | PASS — só rótulos/UI + regra de Caixa no recebimento; sem schema novo; outras telas fora |
| Portas / segredos | PASS — sem mudança de portas; sem credenciais |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Forçar `corrente` só na transição pendente→recebido (e create já recebido) é o mínimo para FR-005/FR-007 sem migrar legado.

## Project Structure

### Documentation (this feature)

```text
specs/019-contas-receber-formulario/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-contas-receber-formulario.md
│   └── ui-contas-receber-formulario.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    ├── api/routes/nfs.py            # create/PUT: corrente na transição de recebimento; não exigir Caixa do cliente
    └── services/excel_io.py         # export XLSX desta página: omitir coluna Caixa

frontend/
└── src/
    └── pages/NFs.tsx                # rótulos Título/Subtítulo; célula única; Recebido; ocultar Caixa e colaboradores
```

**Structure Decision**: Só a página Contas a Receber e a regra de persistência de Caixa no `/api/nfs` já existente. Sem tabela nova. `types/index.ts` e `api.ts` permanecem (payload ainda pode enviar `caixa: 'corrente'` no recebimento). Relatórios e Fluxo de Caixa não mudam.

## Complexity Tracking

> Sem violações a justificar.
