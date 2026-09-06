# Implementation Plan: Fornecedores — campos opcionais de PF, período, salário e total da folha

**Branch**: `050-fornecedores-folha-campos` | **Date**: 2026-09-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/050-fornecedores-folha-campos/spec.md`

**Note**: Clarify 2026-09-06 (3 respostas): salário/datas para todos; Nome+Endereço PF obrigatórios; rótulos início/término (mesmo dado de admissão/desligamento).

## Summary

Ajustar o cadastro de **Fornecedores**: relaxar obrigatoriedade de `pf_cpf` e `pf_data_nascimento` (manter `pf_nome` e `pf_endereco`); exibir **Salário**, **Data de início** e **Data de término** para todos os registros (opcionais), mapeados a `salario` / `data_admissao` / `data_desligamento`; restaurar card **Total da folha** = soma de salários de ativos `tipo_fornecedor=fixo`. Demais campos de RH (cargo, benefício, histórico) permanecem só em legados (`elegivel_equipe`).

## Technical Context

**Language/Version**: Python 3.11 (FastAPI) + TypeScript 5.2 / React 18

**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic, Axios, Zustand, React Router, `react-hot-toast`

**Storage**: PostgreSQL 16 — colunas já existentes em `colaboradores` (`salario`, `data_admissao`, `data_desligamento`, `pf_*`, `tipo_fornecedor`); sem nova migração de schema

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend

**Target Platform**: Web interna; API **8001**; frontend **5193**; PostgreSQL **5433**; Redis **6380**

**Project Type**: Web application (backend + frontend)

**Performance Goals**: SC-003 — gravar fornecedor com campos opcionais em &lt; 2 min; card recalcula no fluxo normal da listagem

**Constraints**: Portas fixas; JWT admin/visualizador; REST `/api/colaboradores` preservado; sem credenciais nos artefatos; não alterar menu/rota

**Scale/Scope**: ~6–8 arquivos (validação API + página Fornecedores + tipos); sem nova tabela

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS |
| III. Clareza antes de implementar | PASS — 3/3 clarifies na spec |
| IV. Consistência com produto existente | PASS — toast, soft delete, padrão Dashboard/Fornecedores |
| V. Simplicidade e escopo fechado | PASS — reusa colunas; card client-side; sem microserviço |
| Portas / segredos | PASS |

**Post-design re-check**: PASS. Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/050-fornecedores-folha-campos/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-fornecedores-folha-campos.md
│   └── ui-fornecedores-folha-campos.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
backend/app/api/routes/colaboradores.py   # _validar_pf_cnpj; _normalizar_cadastro; create/update; strip RH seletivo
backend/app/schemas.py                    # se necessário alinhar Optional (já em grande parte)

frontend/src/pages/Fornecedores.tsx       # formulário (salário/datas para todos; PF parcial); card Total da folha
frontend/src/types/index.ts               # tipos já cobrem campos; ajustar só se faltar
frontend/src/services/api.ts              # payload create/update já envia campos; sem endpoint novo
```

**Structure Decision**: Web app existente. Sem nova rota REST: persistência continua em `/api/colaboradores`. Total da folha calculado no frontend a partir da listagem carregada (ativos Fixo), sem endpoint dedicado nesta feature.

## Fases de implementação (resumo)

### Backend

1. `_validar_pf_cnpj`: exigir só `pf_nome` + `pf_endereco`; CPF/data opcionais com validação condicional
2. `_normalizar_cadastro` / create / update: não zerar `salario`/`data_admissao`/`data_desligamento` em não-legados; salário não obrigatório em legado
3. Validar intervalo início ≤ término quando ambos preenchidos
4. Duplicidade `pf_cpf` só quando CPF informado

### Frontend

1. Formulário: salário + Data de início/término visíveis para todos; labels corretos
2. PF CNPJ: remover `*` / check obrigatório de CPF e nascimento; manter Nome/Endereço
3. Card Total da folha (ativos `tipo_fornecedor === 'fixo'`, soma `salario`)
4. Lint + type-check + quickstart manual

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
| REST contract | [contracts/rest-fornecedores-folha-campos.md](./contracts/rest-fornecedores-folha-campos.md) |
| UI contract | [contracts/ui-fornecedores-folha-campos.md](./contracts/ui-fornecedores-folha-campos.md) |
| Quickstart | [quickstart.md](./quickstart.md) |
