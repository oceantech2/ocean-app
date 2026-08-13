# Implementation Plan: Contas a Receber — NF opcional

**Branch**: `016-contas-receber-nf-opcional` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/016-contas-receber-nf-opcional/spec.md`

**Note**: Sem clarify. Plano focado no **gap**: `nfs.numero` hoje é `NOT NULL` + único; create/edit manuais e `garantir_numero_livre` recusam vazio. Ajuste mínimo: NF opcional persistida como `NULL`; unicidade só quando há número.

## Summary

Permitir ao **admin** criar e editar contas a receber **sem número de NF** na página Contas a Receber. Persistência: ausência = `NULL` (PostgreSQL permite vários `NULL` no unique). Unicidade (013) permanece **somente** se o número for informado. UI: rótulo sem `*`; listagem mostra `—`; Maggo continua somente leitura no número.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Axios, react-hot-toast; FastAPI, SQLAlchemy, Pydantic; `nf_duplicidade` (013) ajustado para pular checagem quando número ausente

**Storage**: PostgreSQL — `ALTER TABLE nfs ALTER COLUMN numero DROP NOT NULL`; unique em `numero` permanece; vazios gravados como `NULL` (não `''`)

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`; smoke POST/PUT `/api/nfs` (sem número, dois sem número, duplicidade com número)

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Create/update síncronos com validação imediata; listagem inalterada em volume

**Constraints**: Portas fixas; papéis admin/visualizador; sem import/delete/pasta; Maggo real fora de escopo; demais campos obrigatórios da 012 inalterados

**Scale/Scope**: Evoluir `NFs.tsx` + `/api/nfs` + `nf_duplicidade` + schema/modelo; 1 ALTER de nullability; 0 páginas novas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Contas a Receber; admin cria/edita; visualizador só lê |
| III. Clareza antes de implementar | PASS — spec sem `[NEEDS CLARIFICATION]`; premissas documentadas |
| IV. Consistência com produto existente | PASS — mesma página/`/api/nfs`, toast, Layout, arquivar |
| V. Simplicidade e escopo fechado | PASS — só obrigatoriedade da NF; unique permanece para número preenchido |
| Portas / segredos | PASS — sem mudança de portas; sem credenciais |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. `NULL` (não string vazia) é o mínimo para múltiplas contas sem NF no unique existente.

## Project Structure

### Documentation (this feature)

```text
specs/016-contas-receber-nf-opcional/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-contas-receber-nf-opcional.md
│   └── ui-contas-receber-nf-opcional.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    ├── main.py                      # ALTER nfs.numero DROP NOT NULL
    ├── models/__init__.py           # numero nullable=True (unique permanece)
    ├── schemas.py                   # NFCreate/NFResponse.numero opcional; "" → None
    ├── services/nf_duplicidade.py   # vazio → None; não 422; skip unique
    └── api/routes/nfs.py            # POST/PUT aceitam numero null; Maggo merge ignora vazio

frontend/
└── src/
    ├── pages/NFs.tsx                # validação, rótulo, listagem —, payload null
    ├── types/index.ts               # numero: string | null
    └── services/api.ts              # payload create/update com numero opcional
```

**Structure Decision**: Continuar no módulo Contas a Receber (`NFs.tsx` + `/api/nfs`). Não criar tabela/página. Unique atual + `NULL` cobre FR-006/FR-007 sem índice parcial.

## Complexity Tracking

> Sem violações a justificar.
