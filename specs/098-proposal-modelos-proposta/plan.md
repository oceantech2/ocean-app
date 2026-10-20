# Implementation Plan: Modelos de proposta no Proposal

**Branch**: `098-proposal-modelos-proposta` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/098-proposal-modelos-proposta/spec.md`

## Summary

Criar o cadastro de **modelos de proposta** (pontos de partida pré-preenchidos por divisão) no Proposal: tabela nova `propostas_modelos`, CRUD em `/api/proposal/modelos` (leitura para todos os usuários do Proposal, escrita só admin, com auditoria), aba "Modelos" com filtros por divisão e nome, telas de criar/editar (reaproveitando o `ModeloForm` numa variante "modelo", sem empresa, data e consultor) e de visualizar (com "Usar este modelo"). Na nova proposta, o campo "Divisão" ganha ao lado um seletor "Modelo" que preenche o formulário, pedindo confirmação antes de substituir conteúdo editado.

## Technical Context

**Language/Version**: Python 3.11 (backend) · TypeScript 5 + React 18 (frontend)

**Primary Dependencies**: FastAPI, SQLAlchemy 2, Pydantic v2 · Vite, Tailwind, Axios, react-hot-toast, React Router 6

**Storage**: PostgreSQL (Supabase em produção). Tabela nova `propostas_modelos` criada por `Base.metadata.create_all`; RLS habilitado em `_migrar()` de `backend/app/main.py`

**Testing**: Sem suíte automatizada no projeto; validação por `npx tsc --noEmit`, `python -m py_compile`, validação de mappers SQLAlchemy e roteiro manual em [quickstart.md](./quickstart.md)

**Target Platform**: Web (Proposal em `frontend/src/proposal`, API FastAPI)

**Project Type**: Aplicação web (backend + frontend)

**Performance Goals**: Lista de modelos em 1 consulta paginada (100 por página); seletor da nova proposta em 1 consulta por carga da tela

**Constraints**: Validação do conteúdo idêntica à da proposta (reuso de `validar_projetos`, `normalizar_escopo` etc.); propostas não guardam vínculo com o modelo; portas fixas (8001/5433/6380/5193)

**Scale/Scope**: Dezenas de modelos (4 divisões); 1 tabela, 5 endpoints, 3 telas novas, 3 telas ajustadas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|-----------|-----------|--------|
| I. Idioma Português | Spec, plano e artefatos em pt-BR; textos de UI em pt-BR | ✅ |
| II. Domínio Financeiro Interno | Escrita restrita a `admin` (403 para os demais); leitura para usuários do Proposal; auditoria no ERP | ✅ |
| III. Clareza Antes de Implementar | Conteúdo do modelo e permissões esclarecidos com o usuário (Clarifications) | ✅ |
| IV. Consistência com o Produto | Mesmo formulário da proposta, mesmo padrão de lista/filtros/paginação do Proposal, `window.confirm` para excluir, toasts | ✅ |
| V. Simplicidade e Escopo Fechado | Sem versionamento de modelos, sem vínculo proposta→modelo, sem duplicar modelo; exclusão física | ✅ |

**Re-check pós-design**: sem violações; nenhuma entrada em Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/098-proposal-modelos-proposta/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── rest-proposal-modelos.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/app/
├── models/__init__.py                 # ModeloProposta (tabela propostas_modelos)
├── schemas.py                         # ModeloPropostaIn
├── main.py                            # RLS da tabela nova + include_router
├── services/proposta_modelos.py       # validar_modelo_proposta(payload)
└── api/routes/proposal_modelos.py     # NOVO: GET/POST /, GET/PUT/DELETE /{id}

frontend/src/proposal/
├── services/proposalApi.ts            # tipos + funções de modelos de proposta
├── components/ModeloForm.tsx          # variante 'modelo', onAlterado, formDeModeloProposta()
├── components/ProposalLayout.tsx      # navegação Propostas | Modelos
├── App.tsx                            # rotas /modelos, /modelos/novo, /modelos/:id, /modelos/:id/editar
├── pages/Modelos.tsx                  # NOVO: lista com filtros
├── pages/ModeloEditor.tsx             # NOVO: criar/editar (admin)
├── pages/ModeloVer.tsx                # NOVO: conteúdo + "Usar este modelo"
├── pages/Nova.tsx                     # "Divisão" + seletor "Modelo" + ?modelo=<id>
└── pages/Lista.tsx                    # filtro/coluna "Modelo" → "Divisão"
```

**Structure Decision**: Aplicação web existente (`backend/` + `frontend/`); um router novo no backend e três páginas novas no Proposal.

## Complexity Tracking

Sem violações da constitution.
