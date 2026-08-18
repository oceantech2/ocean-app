# Implementation Plan: Anexo de NF em Contas a Receber e Contas a Pagar

**Branch**: `038-contas-anexo-nf` | **Date**: 2026-08-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/038-contas-anexo-nf/spec.md`

**Note**: Clarify 2026-08-18: anexo em Receber sobrevive ao sync Maggo; anexar na tabela **e** no formulário de edição.

## Summary

Unificar anexo de nota fiscal (PNG/JPEG/PDF, **máx. 2 MB**, um arquivo por lançamento) nas tabelas **Contas a Receber** e **Contas a Pagar**. Pagar já tem coluna e REST `comprovante`; esta entrega baixa o teto para 2 MB. Receber ganha `nfs.anexo_path` / `anexo_nome`, endpoints `/api/nfs/{id}/anexo` e coluna **Nota fiscal** (o rótulo **NF** da grade continua sendo o número). Sync Maggo por `maggo_id` não toca o anexo.

## Technical Context

**Language/Version**: Python 3.11 (FastAPI) + TypeScript 5.2 / React 18

**Primary Dependencies**: FastAPI `UploadFile` / `FileResponse`; SQLAlchemy `NF` e `ContaPagar`; Axios (`nfsService`, `contasService`); páginas `NFs.tsx` e `Contas.tsx`

**Storage**: PostgreSQL 16 — colunas novas em `nfs`; arquivos em `UPLOAD_DIR` (volume Docker). Sem blob no banco.

**Testing**: Validação manual [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend

**Target Platform**: Web interna; API **8001**; frontend **5193**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (backend + frontend)

**Performance Goals**: SC-001 — anexo válido em ≤ 1 minuto; upload ≤ 2 MB não exige fila

**Constraints**: Portas fixas; JWT e papéis admin/visualizador; 2 MiB só neste anexo (não alterar `UPLOAD_MAX_MB` de colaboradores); sem pasta compartilhada; path do disco nunca no JSON

**Scale/Scope**: Duas páginas, um helper de anexo, três rotas novas em NFs, ajuste de 413 em Pagar. Fora: Maggo real, viewer embutido, multi-arquivo

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — escrita admin; leitura autenticada |
| III. Clareza antes de implementar | PASS — 2/2 clarifies na spec |
| IV. Consistência com produto existente | PASS — espelha 029 (coluna, toast, confirm, `inline`) |
| V. Simplicidade e escopo fechado | PASS — um arquivo, reuso de Pagar, sem tabela satélite |
| Portas / segredos | PASS |

**Post-design re-check**: PASS. Não globar `UPLOAD_MAX_MB`. Não sobrescrever `anexo_*` no `_sync_maggo_stub`. Não reabrir `arquivos-nfs` / comprovantes. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/038-contas-anexo-nf/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-contas-anexo-nf.md
│   └── ui-contas-anexo-nf.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/app/main.py                         # ALTER nfs anexo_path / anexo_nome
backend/app/models/__init__.py              # NF.anexo_path, anexo_nome
backend/app/schemas.py                      # NFResponse.anexo_nome
backend/app/services/anexo_nf.py            # extensões, 2 MiB, gravar/apagar
backend/app/api/routes/contas.py            # POST comprovante usa 2 MiB
backend/app/api/routes/nfs.py               # POST/GET/DELETE /{id}/anexo; listagem
frontend/src/types/index.ts                 # NF.anexo_nome
frontend/src/services/api.ts                # nfsService upload/download/delete anexo
frontend/src/pages/Contas.tsx               # validação 2 MB no cliente
frontend/src/pages/NFs.tsx                  # coluna + formulário Nota fiscal
```

**Structure Decision**: App web existente. Pagar: ajuste de limite. Receber: mesmo padrão de arquivo por item, colunas e rotas novas, sync Maggo intocado nos anexos.

## Complexity Tracking

> Não preenchido — Constitution Check sem violações.
