# Implementation Plan: Fornecedores — cadastro unificado e dados de pessoa física

**Branch**: `043-fornecedores-cadastro` | **Date**: 2026-08-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/043-fornecedores-cadastro/spec.md`

**Note**: Clarify 2026-08-27 (5 respostas): elegibilidade equipe só legado; RH condicional; data nascimento só legado CPF; rota `/fornecedores` + redirect; CNPJ sem PF pode vincular em contas.

## Summary

Unificar o cadastro em **Fornecedores**: migrar ex-colaboradores para `tipo=fornecedor` com flag `elegivel_equipe`, adicionar `tipo_fornecedor` (Fixo/Spot) e campos PF do CNPJ (`pf_*`). Renomear UI/rota; manter REST `/api/colaboradores` e permKey `colaboradores`. Telas de RH filtram `elegivel_equipe=true`; Contas a Pagar listam todos os fornecedores ativos.

## Technical Context

**Language/Version**: Python 3.11 (FastAPI) + TypeScript 5.2 / React 18

**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic, Axios, Zustand, React Router, `react-hot-toast`

**Storage**: PostgreSQL 16 — novas colunas em `colaboradores`; migração inline em `backend/app/main.py` (`_migrar`); índices únicos parciais atualizados

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend

**Target Platform**: Web interna; API **8001**; frontend **5193**; PostgreSQL **5433**; Redis **6380**

**Project Type**: Web application (backend + frontend)

**Performance Goals**: SC-001 — localizar legado em &lt; 30s na listagem unificada

**Constraints**: Portas fixas; JWT admin/visualizador; permKey `colaboradores` preservado; endpoint REST legado; sem credenciais nos artefatos

**Scale/Scope**: ~15 arquivos backend/frontend; uma migração de dados; sem nova tabela

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS |
| III. Clareza antes de implementar | PASS — 5/5 clarifies na spec |
| IV. Consistência com produto existente | PASS — toast, confirm, soft delete, padrão Dashboard |
| V. Simplicidade e escopo fechado | PASS — colunas na tabela existente + flag `elegivel_equipe`; sem microserviço |
| Portas / segredos | PASS |

**Post-design re-check**: PASS. Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/043-fornecedores-cadastro/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-fornecedores-cadastro.md
│   └── ui-fornecedores-cadastro.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
backend/app/main.py                           # ALTER TABLE + índices + backfill
backend/app/models/__init__.py                # Colaborador: elegivel_equipe, tipo_fornecedor, pf_*
backend/app/schemas.py                        # campos novos; validação condicional
backend/app/api/routes/colaboradores.py       # listagem, create/update, import/export
backend/app/services/excel_io.py              # tipo_fornecedor; elegivel_equipe no import
backend/app/api/routes/contas.py              # validação fornecedor (sem checar PF)

frontend/src/types/index.ts                   # Colaborador estendido
frontend/src/services/api.ts                  # elegivel_equipe param; tipos create/update
frontend/src/utils/paginasCatalogo.ts         # label Fornecedores, path /fornecedores
frontend/src/App.tsx                          # redirect /colaboradores
frontend/src/pages/Fornecedores.tsx           # renomear de Colaboradores.tsx; UI unificada
frontend/src/pages/Ferias.tsx                 # listar elegivel_equipe
frontend/src/pages/Bonus.tsx                  # idem
frontend/src/pages/Patrimonio.tsx             # idem
frontend/src/pages/NFs.tsx                    # selects colaborador → elegivel_equipe
frontend/src/components/Layout.tsx            # se label hardcoded, alinhar catálogo
```

**Structure Decision**: Web app existente. Cadastro permanece na tabela `colaboradores` com semântica de fornecedor unificado. Discriminador de equipe é `elegivel_equipe`, não `tipo`.

## Fases de implementação (resumo)

### Backend

1. Migração colunas + backfill + índices ([data-model.md](./data-model.md))
2. Model e schemas Pydantic com validadores condicionais (CNPJ→PF, legado→RH)
3. Refatorar `_normalizar_cadastro` / `_checar_duplicidade` (documento global; `pf_cpf`)
4. `GET` com `elegivel_equipe`; `POST` força fornecedor; `PUT` regras por flag
5. Ajustar `excel_io` import/export

### Frontend

1. Catálogo, rota, redirect
2. Renomear página; remover abas; coluna Tipo
3. Formulário condicional (RH legado, PF CNPJ, sem data nasc. em CPF novo)
4. Atualizar consumidores RH e tipos TS
5. Lint + type-check + quickstart manual

## Complexity Tracking

> Sem violações da constituição.

| Item | Notas |
|------|-------|
| — | Nenhuma exceção necessária |

## Artefatos gerados (Phase 0–1)

| Artefato | Caminho |
|----------|---------|
| Research | [research.md](./research.md) |
| Data model | [data-model.md](./data-model.md) |
| REST contract | [contracts/rest-fornecedores-cadastro.md](./contracts/rest-fornecedores-cadastro.md) |
| UI contract | [contracts/ui-fornecedores-cadastro.md](./contracts/ui-fornecedores-cadastro.md) |
| Quickstart | [quickstart.md](./quickstart.md) |

**Próximo comando sugerido**: `/speckit-tasks`
