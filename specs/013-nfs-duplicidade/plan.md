# Implementation Plan: Validação de Duplicidade de NFs

**Branch**: `013-nfs-duplicidade` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-nfs-duplicidade/spec.md`

**Note**: Plano preenchido por `/speckit-plan`. Artefatos de design em research / data-model / contracts / quickstart.

## Summary

Garantir **unicidade do número** de contas a receber (NFs) em criação, edição e importação: bloquear segundo registro, devolver conflito acionável (409 + `nf_id`) com atalho na UI para abrir a existente, e na importação XLSX perguntar **uma vez por lote** se rejeita ou atualiza conflitos com o cadastro — sem sufixos artificiais `-2` no parser. Complementa a criação manual da **012** e reabilita import com política explícita.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Zustand, Axios, react-hot-toast; FastAPI, SQLAlchemy, Pydantic, openpyxl

**Storage**: PostgreSQL — unique existente em `nfs.numero`; sem migração de schema obrigatória (apenas reforço de validação/UX). Se houver duplicatas históricas, tratar fora desta feature.

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`; smoke dos endpoints create/update/import

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Checagem de duplicidade O(1) via índice unique / lookup por `numero`; import no padrão atual de lotes internos

**Constraints**: Portas fixas; papéis admin/visualizador; só trim no número; dependência de create/edit manual (012); import reabilitado sob política 013; Maggo merge inalterado quanto a não criar duplicata

**Scale/Scope**: 1 entidade (`NF`), rotas `/api/nfs` (+ import), 1 página Contas a Receber (`NFs.tsx`), ajuste em `excel_io.parse_nfs_xlsx`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Contas a Receber/NFs; admin escreve; visualizador só lê |
| III. Clareza antes de implementar | PASS — clarify 5/5 integrado na spec |
| IV. Consistência com produto existente | PASS — modal + toast; padrão import ok/erros; 409 estruturado |
| V. Simplicidade e escopo fechado | PASS — sem tabela nova; sem tela de varredura histórica; decisão por lote |
| Portas / segredos | PASS — sem mudança de portas; sem credenciais nos artefatos |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Contratos API/UI e data-model alinhados à research (incl. remoção de sufixos `-N` e coordenação com 012).

## Project Structure

### Documentation (this feature)

```text
specs/013-nfs-duplicidade/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-nfs-duplicidade.md
│   └── ui-nfs-duplicidade.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── models/__init__.py          # NF.numero unique (já existe) — sem schema novo
│   ├── schemas.py                  # detail de conflito / resposta import (se tipado)
│   ├── services/
│   │   └── excel_io.py             # parse_nfs_xlsx: remover sufixos -2/-3; marcar duplicatas
│   └── api/routes/
│       └── nfs.py                  # create/update: trim + 409; import: on_conflict; IntegrityError

frontend/
└── src/
    ├── pages/NFs.tsx               # UX 409 + Abrir existente; diálogo on_conflict no import
    ├── components/ImportCSV.tsx    # ou fluxo xlsx dedicado — escolha rejeitar/atualizar
    ├── services/api.ts             # importarXlsx com on_conflict; tipagem do 409
    ├── utils/erros.ts              # extrair detail objeto NF_NUMERO_DUPLICADO
    └── types/index.ts              # tipos de erro/import se necessário
```

**Structure Decision**: Reusar `/api/nfs` e a página Contas a Receber. Lógica de unicidade no backend (lookup + unique + IntegrityError); UI só consome 409 e o diálogo de import. Parser Excel alinhado à regra “primeira linha vale”.

## Complexity Tracking

> Sem violações a justificar.
