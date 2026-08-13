# Implementation Plan: Contas a Pagar — Vincular nota fiscal por item

**Branch**: `029-contas-nf-vinculo` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/029-contas-nf-vinculo/spec.md`

**Note**: Clarify 2026-08-13: pasta compartilhada some do produto sem exclusão em massa; novos envios PDF/JPEG/PNG; anexo antigo do item permanece; vínculo na listagem **e** no formulário.

## Summary

Remover a biblioteca compartilhada de comprovantes (`GerenciadorArquivos` + `/api/arquivos-comprovantes`) da aplicação, sem apagar arquivos em disco. Reusar o anexo por conta (`comprovante_path` / `comprovante_nome` em `contas_pagar`) como **nota fiscal**: disponível em qualquer status, validar extensão em novos envios (`.pdf`, `.jpg`, `.jpeg`, `.png`), rótulos na UI. Formulário de criar: arquivo em memória → `POST /contas` → `POST /contas/{id}/comprovante`. Listagem e edição usam o mesmo upload/remoção já existente, sem exigir conta paga.

## Technical Context

**Language/Version**: Python 3.11 (FastAPI) + TypeScript 5.2 / React 18

**Primary Dependencies**: FastAPI `UploadFile` / `FileResponse`, SQLAlchemy `ContaPagar`, Axios FormData, React state no modal de `Contas.tsx`

**Storage**: PostgreSQL — colunas existentes `comprovante_path`, `comprovante_nome` (sem migração). Arquivo em `UPLOAD_DIR`. Pasta `COMPROVANTES_DIR` permanece no disco, sem rota.

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend`

**Target Platform**: Web interna; API **8001**; frontend **5193**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (backend + frontend)

**Performance Goals**: SC-001 — vínculo em &lt; 1 min (upload único, limite já existente `UPLOAD_MAX_MB` = 10)

**Constraints**: Portas fixas; JWT admin escrita / visualizador leitura; sem exclusão em massa da pasta antiga; um arquivo vigente por conta; sem credenciais nos artefatos

**Scale/Scope**: Página Contas a Pagar + rotas de anexo da conta + desligar router da biblioteca. Fora: Contas a Receber, módulo NFs, importação CSV/xlsx de arquivo fiscal, apagar `COMPROVANTES_DIR`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — admin vincula/remove; visualizador abre/baixa |
| III. Clareza antes de implementar | PASS — 3/3 clarifies na spec |
| IV. Consistência com produto existente | PASS — toast, `confirm` na remoção, mesmo padrão de upload da conta |
| V. Simplicidade e escopo fechado | PASS — reusa colunas e `POST /{id}/comprovante`; não cria entidade nova nem multipart no POST de criação |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não migrar nomes de coluna. Não apagar arquivos de `COMPROVANTES_DIR`. Não exigir NF para pagar. Não alterar Contas a Receber.

## Project Structure

### Documentation (this feature)

```text
specs/029-contas-nf-vinculo/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-contas-nf-vinculo.md
│   └── ui-contas-nf-vinculo.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/app/main.py                         # deixar de incluir arquivos_comprovantes
backend/app/api/routes/contas.py            # validar extensão; download com media_type
backend/app/api/routes/arquivos_comprovantes.py  # deixa de ser montado (arquivo pode permanecer)

frontend/src/pages/Contas.tsx               # pasta fora; NF na lista e no formulário
frontend/src/services/api.ts                # sem comprovantesService se órfão; abrir arquivo
frontend/src/types/index.ts                 # campos existentes; rótulo de negócio na UI
frontend/src/components/GerenciadorArquivos.tsx  # deixa de ser usado nesta página
```

**Structure Decision**: Sem tabela nova. O vínculo é o par de colunas já usado como comprovante. A biblioteca some desmontando o router e retirando o botão. Criação com arquivo = dois POSTs sequenciais no cliente.

## Complexity Tracking

> Sem violações a justificar.
