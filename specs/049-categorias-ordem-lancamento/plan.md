# Implementation Plan: Categorias Contas a Pagar, Subcategorias RH e Ordenação por Lançamento

**Branch**: `049-categorias-ordem-lancamento` | **Date**: 2026-09-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/049-categorias-ordem-lancamento/spec.md`

**Note**: Clarify 2026-09-06 (5/5): ordenar (não filtrar) por inclusão; RH editar qualquer / excluir só admin; categorias 1º nível só admin; **Comissões → Bônus & Comissão** + manter **Comissão**; gestão no formulário de conta a pagar.

## Summary

Entregar quatro fatias na stack existente: (1) renomear rótulo da subcategoria RH `bonus` de **Comissões** para **Bônus & Comissão**; (2) PATCH/DELETE de categorias **cadastradas** (padrão imutável); (3) CRUD de subcategorias RH com persistência — editar qualquer nome, excluir só as criadas pelo admin — no formulário de Contas a Pagar; (4) ordenação por **ordem de lançamento** (`criado_em`) em Contas a Pagar, Contas a Receber e Fluxo de Caixa, convivendo com filtros e sorts já existentes.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 / FastAPI (backend)

**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic; React, Tailwind, Zustand (`usePageFilters`), Axios (`api.ts`), react-hot-toast

**Storage**: PostgreSQL — estender `categorias_pagar_cadastradas` (CRUD); nova tabela `subcategorias_rh_cadastradas` (seed das padrão + custom); campos `criado_em` já existem em `contas_pagar`, `nfs`, `fluxo_movimentos`

**Testing**: [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`; smoke manual admin/visualizador

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Catálogo e listagens ≤500 linhas ordenam no cliente sem atraso perceptível; mutações de catálogo &lt; 2 s de feedback

**Constraints**: Portas fixas; papéis admin/visualizador; sem tela dedicada de catálogo; exclusão bloqueada com vínculos; limite de nome alinhado ao produto (20 caracteres — **Bônus & Comissão** cabe); legado “Comissões (legado)” intacto

**Scale/Scope**: 1 página Contas (form + sort) + NFs + FluxoCaixa; serviço `categorias_contas.py`; rotas `/contas/categorias*`; 1 tabela nova + endpoints; tipagem `criado_em` no frontend

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS |
| III. Clareza antes de implementar | PASS — clarify 5/5 |
| IV. Consistência com produto existente | PASS — gestão no formulário; sort por cabeçalho; confirmação em exclusão |
| V. Simplicidade e escopo fechado | PASS — reutiliza catálogo/cadastro; sem tela nova de gestão |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Persistência de subcategorias RH é o mínimo para “editar qualquer / excluir só custom”; rename de rótulo não exige migration de dados nas contas (`codigo` `bonus` permanece).

## Project Structure

### Documentation (this feature)

```text
specs/049-categorias-ordem-lancamento/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-categorias-subcategorias.md
│   └── ui-contas-categorias-ordem.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/app/services/categorias_contas.py   # rótulo Bônus & Comissão; CRUD cadastradas; CRUD RH
backend/app/models/__init__.py              # SubcategoriaRhCadastrada (+ flags)
backend/app/schemas.py                      # request/response catálogo + CRUD
backend/app/api/routes/contas.py            # PATCH/DELETE categorias; CRUD subcategorias RH
backend/app/main.py                         # CREATE TABLE IF NOT EXISTS + seed RH

frontend/src/pages/Contas.tsx               # UI editar/excluir no form; sort criado_em
frontend/src/pages/NFs.tsx                  # sort ordem de lançamento
frontend/src/pages/FluxoCaixa.tsx           # coluna/sort criado_em nos movimentos
frontend/src/utils/fluxoCaixaMovimentos.ts  # propagar criado_em nos MovimentoFluxo
frontend/src/services/api.ts                # métodos CRUD catálogo
frontend/src/types/index.ts                 # criado_em; flags gerenciavel/sistema no catálogo
```

**Structure Decision**: Backend concentra taxonomia em `categorias_contas.py` e rotas em `contas.py` (já listam/criam categorias). Frontend restringe gestão ao modal/formulário de Contas a Pagar. Ordenação por lançamento estende o padrão de cabeçalho clicável já usado em Contas/NFs/Fluxo; Fluxo exige enriquecer `MovimentoFluxo` com `criado_em` das fontes (NF, ContaPagar, movimento manual).

## Complexity Tracking

> Sem violações a justificar.
