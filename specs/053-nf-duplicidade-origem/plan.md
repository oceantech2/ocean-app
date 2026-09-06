# Implementation Plan: NF — Conflito de Duplicidade entre Origens

**Branch**: `053-nf-duplicidade-origem` | **Date**: 2026-09-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/053-nf-duplicidade-origem/spec.md`

**Note**: Plano preenchido por `/speckit-plan`. Artefatos de design em research / data-model / contracts / quickstart.

## Summary

Estender a validação de duplicidade de Contas a Receber/NFs (feature **013**) para distinguir **duplicidade na mesma origem** de **conflito entre origens** (Manual × Maggo). Manter unicidade efetiva do número (no máximo um registro por número no banco — o UNIQUE global permanece válido), permitir reenvio/merge pela mesma origem, bloquear criação de segundo registro na mesma origem, e na importação XLSX: `on_conflict` só para mesma origem; conflito entre origens sempre rejeitado. Sem listagem/saneamento histórico nem canais extras de notificação no sync Maggo.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Zustand, Axios, react-hot-toast; FastAPI, SQLAlchemy, Pydantic, openpyxl

**Storage**: PostgreSQL — `nfs.numero` UNIQUE (já existe); coluna `nfs.origem` (`manual` \| `maggo`). Sem migração de schema obrigatória; UNIQUE global continua correto sob as regras esclarecidas (um número não pode existir duas vezes, nem na mesma origem nem em origens distintas).

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`; smoke create/update/import/sync

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Lookup por `numero` via índice unique existente; import/sync no padrão atual de lotes

**Constraints**: Portas fixas; papéis admin/visualizador; só trim no número; origem imutável; fora de escopo: saneamento histórico, toast/notificação persistente para colisão Maggo

**Scale/Scope**: Serviço `nf_duplicidade`, rotas `/api/nfs` (create/update/import + sync Maggo no GET), página Contas a Receber (`NFs.tsx`), tipagem/erros no frontend

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Contas a Receber/NFs; admin escreve; visualizador só lê |
| III. Clareza antes de implementar | PASS — clarify 4/4 integrado na spec |
| IV. Consistência com produto existente | PASS — reusa 409 estruturado, diálogo `on_conflict`, atalho “Abrir existente”, sync Maggo existente |
| V. Simplicidade e escopo fechado | PASS — estende serviço 013; sem tabela/tela nova; sem saneamento histórico |
| Portas / segredos | PASS — sem mudança de portas; sem credenciais nos artefatos |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Contratos API/UI e data-model alinhados à research (classificação por origem + UNIQUE global preservado).

## Project Structure

### Documentation (this feature)

```text
specs/053-nf-duplicidade-origem/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-nf-duplicidade-origem.md
│   └── ui-nf-duplicidade-origem.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── models/__init__.py              # NF.numero unique + origem (inalterados no schema)
│   ├── schemas.py                      # tipagem de detail 409 / erros import (se necessário)
│   ├── services/
│   │   └── nf_duplicidade.py           # classificar mesma origem vs conflito de origem
│   └── api/routes/
│       └── nfs.py                      # create/update/import/sync Maggo usam classificação

frontend/
└── src/
    ├── pages/NFs.tsx                   # mensagens distintas; import: on_conflict só mesma origem
    ├── services/api.ts                 # tipagem códigos novos / resposta import
    ├── utils/erros.ts                  # extrair NF_NUMERO_DUPLICADO e NF_NUMERO_ORIGEM_CONFLITO
    └── types/index.ts                  # tipos de erro/import se necessário
```

**Structure Decision**: Reusar `/api/nfs`, serviço `nf_duplicidade` e a página Contas a Receber. Sem novos módulos nem mudança de UNIQUE no banco. UI consome códigos de erro distintos e motivos de import `conflito_origem`.

## Complexity Tracking

> Sem violações a justificar.
