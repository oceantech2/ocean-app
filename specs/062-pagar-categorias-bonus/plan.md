# Implementation Plan: Contas a Pagar — Categoria Bônus e Catálogo Editável

**Branch**: `062-pagar-categorias-bonus` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/062-pagar-categorias-bonus/spec.md`

**Note**: Clarify 2026-09-14 (5/5): rótulo **Bônus** só na página Contas a Pagar; categorias 1º nível só as criadas pelo admin; RH — editar qualquer / excluir só admin; após excluir selecionada — categoria oficial válida / sub vazia; importação aceita Bônus, Comissões e o rótulo composto anterior. Catálogo CRUD já existe (049); esta entrega é **delta** (rótulo + seed + aliases de import + conferência de gaps).

## Summary

Na página **Contas a Pagar**, a subcategoria RH de código `bonus` passa a exibir **Bônus** (no lugar de **Comissões** / **Bônus & Comissão**). Reutilizar o catálogo já persistido: PATCH/DELETE de categorias cadastradas; CRUD de subcategorias RH (editar qualquer nome, excluir só `sistema=false`) no formulário. Fechar gaps: seed atualiza o nome de fábrica `bonus`; importação (CSV da página e XLSX) resolve **Bônus**, **Comissões** e **Bônus & Comissão** para o mesmo código; conferir o reset do formulário após exclusão. **Não** alterar Dashboard, Impostos, Retiradas nem a página Comissões.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 / FastAPI (backend)

**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic; React, Tailwind, Axios (`api.ts`), react-hot-toast

**Storage**: PostgreSQL — tabelas existentes `categorias_pagar_cadastradas` e `subcategorias_rh_cadastradas`. Sem DDL novo. Seed/upsert de rótulo da linha `bonus` (`sistema=true`).

**Testing**: [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`; smoke manual admin/visualizador na página Contas a Pagar

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Mutações de catálogo e rename de rótulo com feedback &lt; 2 s; listagem da página sem recarregar sessão além do retorno do catálogo

**Constraints**: Portas fixas; papéis `admin` / `visualizador`; sem tela dedicada de catálogo; exclusão bloqueada com vínculos; nome ≤ 20 caracteres; legado “Comissões (legado)” intacto; Dashboard fora do escopo

**Scale/Scope**: 1 página (`Contas.tsx`); serviço `categorias_contas.py`; rotas `/api/contas/categorias*` já existentes; 0 tabelas novas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS |
| III. Clareza antes de implementar | PASS — clarify 5/5 |
| IV. Consistência com produto existente | PASS — gestão no formulário; confirmação em exclusão; reuso 049 |
| V. Simplicidade e escopo fechado | PASS — delta de rótulo + import; sem tela nova; sem Dashboard |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Persistência de subcategorias já existe; o rename não migra contas (`codigo` `bonus` permanece).

## Project Structure

### Documentation (this feature)

```text
specs/062-pagar-categorias-bonus/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-categorias-bonus.md
│   └── ui-contas-pagar-catalogo.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/app/services/categorias_contas.py   # rótulo Bônus; seed; aliases de import; validar_classificacao
backend/app/api/routes/contas.py            # import XLSX + criar/atualizar usam resolução de subcategoria
backend/app/main.py                         # seed_subcategorias_rh no startup (já chamado)

frontend/src/pages/Contas.tsx               # rótulo via catálogo; import CSV; conferir editar/excluir e reset
frontend/src/services/api.ts                # métodos CRUD catálogo (já existem)
frontend/src/types/index.ts                 # CatalogoCategoriasContas (já existe)
```

**Structure Decision**: Backend concentra taxonomia em `categorias_contas.py`. Frontend restringe gestão e rótulos à página Contas a Pagar. Sem novos arquivos de rota ou tabela.

## Complexity Tracking

> Sem violações a justificar.
