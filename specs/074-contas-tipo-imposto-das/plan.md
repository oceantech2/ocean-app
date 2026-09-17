# Implementation Plan: Contas a Pagar — Tipo Imposto / DAS

**Branch**: `074-contas-tipo-imposto-das` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/074-contas-tipo-imposto-das/spec.md`

**Note**: Clarify 2026-09-16 (3/3): categoria opcional quando Tipo é Imposto / DAS; migração limpa a categoria; custo por categoria só exclui Imposto / DAS (sem fatia Impostos no donut).

## Summary

Promover **Impostos** de categoria para o terceiro valor do campo **Tipo** da conta a pagar (`tipo_despesa`: `fixo` | `variavel` | `imposto_das`, rótulo UI **Imposto / DAS**). Remover Impostos da taxonomia oficial de Categorias; migrar contas com categoria `impostos`/`imposto` para `tipo_despesa=imposto_das` com categoria/subcategoria vazias; página **Impostos** e exclusões de custo/DRE passam a filtrar por Tipo; importação rejeita categoria Impostos e aceita Tipo Imposto / DAS (categoria opcional). Cards Fixas/Variáveis do Dashboard mantêm a regra de classificação operacional, apenas trocando a exclusão de impostos de categoria → Tipo.

## Technical Context

**Language/Version**: Python 3.11 (FastAPI) + TypeScript 5.2 / React 18

**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic, `categorias_contas`, `contas.py`, `impostos.py`, `relatorios.py`, `Contas.tsx`, `Impostos.tsx`, `dashboardDespesas.ts`, `excel_io` / export CSV

**Storage**: PostgreSQL 16 — ampliar `contas_pagar.tipo_despesa` (hoje VARCHAR(10); `imposto_das` exige ≥ 11) e backfill de migração inline em `backend/app/main.py` (padrão do projeto; sem Alembic)

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend

**Target Platform**: Web interna; API **8001**; frontend **5193**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (backend + frontend)

**Performance Goals**: SC-006 — classificar conta Imposto / DAS em &lt; 2 min; migração única em startup; listagens/export sobre volume já suportado (≤ 500 itens na UI)

**Constraints**: Portas fixas; JWT admin escrita / visualizador leitura; sem filtro novo por Tipo na listagem; sem fatia Impostos no donut; sem mudar regra Fixas/Variáveis além da exclusão por Tipo; categoria opcional só para `imposto_das`

**Scale/Scope**: Contas a Pagar + página Impostos + ajustes mínimos em custo/DRE/despesas; ~10 arquivos backend/frontend

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS |
| III. Clareza antes de implementar | PASS — 3/3 clarifies integrados |
| IV. Consistência com produto existente | PASS — estende `tipo_despesa`, migração inline, UX Contas/Impostos |
| V. Simplicidade e escopo fechado | PASS — sem novos módulos; remove dimensão duplicada |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Valor persistido `imposto_das` documentado em [research.md](./research.md); ampliação de VARCHAR justificada pelo tamanho do código.

## Project Structure

### Documentation (this feature)

```text
specs/074-contas-tipo-imposto-das/
├── plan.md              # Este arquivo
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-contas-tipo-imposto-das.md
│   └── ui-contas-tipo-imposto-das.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/app/main.py                              # ALTER tipo_despesa + UPDATE migração
backend/app/models/__init__.py                   # ContaPagar.tipo_despesa String(20)
backend/app/schemas.py                           # Literal fixo|variavel|imposto_das; categoria opcional
backend/app/api/routes/contas.py                 # TIPOS_DESPESA, validação categoria×tipo, rótulos, import
backend/app/api/routes/impostos.py               # /de-contas por tipo_despesa
backend/app/api/routes/relatorios.py             # DRE/custo excluir imposto_das
backend/app/services/categorias_contas.py        # remover Impostos do conjunto oficial; import
backend/app/services/excel_io.py                 # rótulo Tipo Imposto / DAS (se aplicável)
frontend/src/types/index.ts                      # tipo_despesa union
frontend/src/pages/Contas.tsx                    # select Tipo 3 opções; categoria opcional; filtros
frontend/src/pages/Impostos.tsx                  # texto orientação Tipo Imposto / DAS
frontend/src/utils/dashboardDespesas.ts          # exclusão por tipo imposto_das; filtrar fatia impostos
frontend/src/utils/import.ts                     # rejeitar categoria Impostos; aceitar tipo
```

**Structure Decision**: Web app existente; mudanças concentradas em validação/taxonomia de Contas a Pagar, endpoint `/impostos/de-contas` e exclusões de custo/despesa.

## Complexity Tracking

> Sem violações da constituição.
