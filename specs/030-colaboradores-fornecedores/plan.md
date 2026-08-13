# Implementation Plan: Colaboradores e Fornecedores — cadastros separados

**Branch**: `030-colaboradores-fornecedores` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/030-colaboradores-fornecedores/spec.md`

**Note**: Clarify 2026-08-13: CPF ou CNPJ nos dois cadastros; tipo imutável; fornecedor em Contas a Pagar e Calendário (vínculo opcional); um item de menu com duas visões. O `setup-plan.ps1` nesta sessão apontou a branch git `029-contas-nf-vinculo`; os artefatos desta feature ficam em `specs/030-colaboradores-fornecedores` (`feature.json`).

## Summary

Estender o cadastro atual (`colaboradores`) com **tipo** (`colaborador` | `fornecedor`) e **documento** (CPF ou CNPJ + Razão Social), mais telefone e e-mail. A tela de Colaboradores ganha duas visões no mesmo menu. Contas a pagar passam a ter `fornecedor_id` opcional; o Calendário mostra o nome quando houver vínculo. Listagens usadas por RH (bônus, férias, patrimônio, NFs) continuam só com `tipo=colaborador` (filtro padrão da API).

## Technical Context

**Language/Version**: Python 3.11 (FastAPI) + TypeScript 5.2 / React 18

**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic, Axios, Zustand (papéis), React na página `Colaboradores.tsx` / `Contas.tsx` / `Calendario.tsx`

**Storage**: PostgreSQL 16 — colunas novas em `colaboradores` e `contas_pagar`; índice único parcial `(tipo, documento)` WHERE `ativo`; migração inline em `backend/app/main.py` (`_migrar`), padrão do projeto

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend`

**Target Platform**: Web interna; API **8001**; frontend **5193**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (backend + frontend)

**Performance Goals**: SC-001 — cadastro em &lt; 2 min (formulário único, sem etapa extra)

**Constraints**: Portas fixas; JWT admin escrita / visualizador leitura; tipo imutável após criar; import/export xlsx só colaboradores; sem credenciais nos artefatos

**Scale/Scope**: Uma tabela de cadastro + FK opcional em contas a pagar + UI da tela de Colaboradores, Contas a Pagar e Calendário. Fora: item de menu novo, conversão de tipo, importação de fornecedores, vínculo em NFs/retiradas/fluxo de caixa/impostos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — admin CRUD cadastro e vínculo; visualizador só consulta |
| III. Clareza antes de implementar | PASS — 5/5 clarifies na spec |
| IV. Consistência com produto existente | PASS — mesmo menu, toast, confirm, soft delete; fornecedor sem fluxo de desligamento de RH |
| V. Simplicidade e escopo fechado | PASS — discriminator na tabela existente em vez de tabela nova; filtro padrão evita vazamento em RH |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não criar `/api/fornecedores` separado. Não tornar cargo/salário obrigatórios na API para fornecedor. Não alterar permissões de menu (mesmo `permKey` `colaboradores`).

## Project Structure

### Documentation (this feature)

```text
specs/030-colaboradores-fornecedores/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-cadastro-pessoas.md
│   └── ui-colaboradores-fornecedores.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/app/main.py                      # ALTER TABLE + índice único parcial
backend/app/models/__init__.py           # Colaborador + ContaPagar.fornecedor_id
backend/app/schemas.py                   # documento, tipo, contato; ContaPagar.fornecedor_*
backend/app/api/routes/colaboradores.py  # query tipo (default colaborador); validação; tipo imutável
backend/app/api/routes/contas.py         # fornecedor_id opcional; validar tipo=fornecedor e ativo
backend/app/services/excel_io.py         # import/export só tipo=colaborador (CPF)

frontend/src/types/index.ts              # Colaborador/Fornecedor + ContaPagar.fornecedor
frontend/src/services/api.ts             # listar({ tipo }); contas com fornecedor_id
frontend/src/pages/Colaboradores.tsx     # duas visões; Documento; telefone; email
frontend/src/pages/Contas.tsx            # select fornecedor opcional; coluna na lista
frontend/src/pages/Calendario.tsx        # título do evento com nome do fornecedor
```

**Structure Decision**: Web app existente. Cadastro único na tabela `colaboradores` com `tipo`. Vínculo financeiro é FK `contas_pagar.fornecedor_id`. Sem rota REST nova de coleção.

## Complexity Tracking

> Sem violações da constituição.
