# Implementation Plan: Contas a Pagar — Cadastro de Nova Categoria

**Branch**: `032-cadastro-categoria-pagar` | **Date**: 2026-08-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/032-cadastro-categoria-pagar/spec.md`

**Note**: Clarify 2026-08-17 (5 Qs): cadastro só no select do formulário; seleção automática; oficiais depois cadastradas A–Z; nome ≤ 20; letras/números/espaço/hífen/barra.

## Summary

Permitir que o **admin** cadastre categorias de primeiro nível em Contas a Pagar a partir do campo Categorias. Oficiais continuam no módulo `categorias_contas.py`; cadastradas vão para a tabela `categorias_pagar_cadastradas` com código `cat_{id}`. API `GET/POST /api/contas/categorias`; validação de classificação, import e `custo-por-categoria` passam a reconhecer o código novo. UI: opção **Nova categoria…** no select do formulário, sem ação na listagem, sem excluir/renomear, sem subcategoria.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Axios, react-hot-toast, Zustand (papéis); FastAPI, SQLAlchemy, Pydantic — sem biblioteca nova

**Storage**: PostgreSQL 16 — tabela nova `categorias_pagar_cadastradas`; `contas_pagar.categoria` VARCHAR(64) já existente (sem migração de dados)

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Cadastro + seleção no formulário em menos de 2 minutos (SC-001); listagem/agregação no volume atual (~centenas de contas, dezenas de categorias)

**Constraints**: Portas fixas; só admin escreve categoria; visualizador lê catálogo; sem DELETE/renomear; sem subcategorias novas; Impostos/Retiradas sem novo recorte; sem credenciais nos artefatos

**Scale/Scope**: 1 tabela, 2 rotas no prefixo `/api/contas`, 1 página (`Contas.tsx`) + label no relatório/donut; 0 menus novos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Contas a Pagar; admin cadastra; visualizador só consulta |
| III. Clareza antes de implementar | PASS — spec sem `[NEEDS CLARIFICATION]`; 5 clarificações gravadas |
| IV. Consistência com produto existente | PASS — mesmo modal/CRUD, toast, JWT, auditoria; select existente + sentinela |
| V. Simplicidade e escopo fechado | PASS — tabela + rotas de catálogo; sem CRUD completo de taxonomia |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não promover oficiais para tabela. Não inferir categoria só das contas. Não criar item de menu. `validar_classificacao` ganha `db` para incluir cadastradas; rotas `GET/POST .../categorias` **antes** de `/{id}`.

## Project Structure

### Documentation (this feature)

```text
specs/032-cadastro-categoria-pagar/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-contas-categorias.md
│   └── ui-contas-categorias.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/app/main.py                         # CREATE TABLE + índice UNIQUE LOWER(nome)
backend/app/models/__init__.py              # CategoriaPagarCadastrada
backend/app/schemas.py                      # request/response do catálogo
backend/app/services/categorias_contas.py   # listar, validar nome, criar, label/import com db
backend/app/api/routes/contas.py            # GET/POST /categorias; validar contas/import
backend/app/api/routes/relatorios.py        # label de cat_{id} no custo-por-categoria
backend/app/services/audit.py               # uso existente no POST

frontend/src/types/index.ts                 # tipos do catálogo
frontend/src/services/api.ts                # contasCategoriasService (ou métodos em contasService)
frontend/src/pages/Contas.tsx               # select, sentinela, POST, labels, import
frontend/src/pages/Dashboard.tsx            # só se o donut não usar c.label (mínimo)
```

**Structure Decision**: Reusar prefixo `/api/contas` e o serviço de taxonomia. Persistência só das cadastradas. Frontend deixa a lista hardcoded de oficiais em favor do GET unificado (legado de pendência permanece local). Impostos/Retiradas fora da lista de arquivos a alterar.

## Complexity Tracking

> Preencher só se o Constitution Check tiver violações a justificar

Nenhuma.
