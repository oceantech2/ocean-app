# Implementation Plan: Contas a Pagar — Categorias e Exclusão em Massa

**Branch**: `008-contas-pagar-categorias` | **Date**: 2026-07-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-contas-pagar-categorias/spec.md`

**Note**: Mantém Contas a Pagar com **input manual**; remove exclusão em massa; substitui “Centro de Custo” por **Categorias** (com subcategorias de RH); migra valores legados; ajuste mínimo em Impostos, Retiradas e custo por categoria.

## Summary

Evoluir Contas a Pagar para a taxonomia **Categorias** (7 categorias superiores; RH com 5 subcategorias obrigatórias), persistindo `categoria` + `subcategoria` + flag de pendência. Migrar automaticamente valores mapeáveis do antigo `centro_custo`; marcar não mapeáveis como pendentes (aviso visual, sem bloquear pagar/editar). Remover “Deletar todas” da UI e bloquear `DELETE /api/contas/todas`. Validar importação apenas com taxonomia nova. Ajustar filtros de Impostos, Retiradas e agregação de custo por categoria aos novos códigos.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Zustand, Axios, react-hot-toast; FastAPI, SQLAlchemy, PostgreSQL, Pydantic

**Storage**: PostgreSQL — tabela `contas_pagar`: substituir enum `centro_custo` por colunas `categoria` (VARCHAR), `subcategoria` (VARCHAR nullable), `categoria_pendente` (BOOLEAN); migração de dados + `ALTER` no padrão do projeto (`main.py` / startup)

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend; smoke dos endpoints de contas / import / filtros auxiliares

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Listagem e filtros no padrão atual (~500 registros); migração one-shot no deploy/startup sem impacto contínuo

**Constraints**: Portas fixas; papéis admin/visualizador; sem redesign de Impostos/Retiradas/Dashboard além do filtro/agregação; import sem aliases legados; exclusão individual permanece

**Scale/Scope**: 1 página principal (Contas), 3 consumidores mínimos (Impostos, Retiradas, custo-por-categoria), 1 migração de schema/dados, remoção de delete-all

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Contas a Pagar; admin escreve; visualizador só lê |
| III. Clareza antes de implementar | PASS — clarify 5/5 (migração, telas auxiliares, filtro RH, import, pendência) |
| IV. Consistência com produto existente | PASS — Layout/toast/confirm; CRUD manual mantido; ajuste mínimo em telas dependentes |
| V. Simplicidade e escopo fechado | PASS — colunas na mesma tabela; sem novo módulo; sem redesign amplo |
| Portas / segredos | PASS — sem mudança de portas; sem credenciais nos artefatos |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Contratos API/UI alinhados ao data-model.

## Project Structure

### Documentation (this feature)

```text
specs/008-contas-pagar-categorias/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-contas-pagar.md
│   └── ui-contas-pagar.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── main.py                      # ALTER / migração centro_custo → categoria(+sub,+pendente)
│   ├── models/__init__.py           # ContaPagar; deprecar/remover CentroCusto enum se órfão
│   ├── schemas.py                   # ContaPagar* com categoria/subcategoria/categoria_pendente
│   ├── services/
│   │   └── categorias_contas.py     # NEW — taxonomia, validação, mapeamento legado, labels
│   └── api/routes/
│       ├── contas.py                # CRUD/filtros/import; 403 em DELETE /todas
│       ├── impostos.py              # filtro categoria=impostos
│       ├── (retiradas via frontend) # se filtro client-side, alinhar códigos
│       └── relatorios.py            # custo-por-categoria + DRE impostos vs demais

frontend/
└── src/
    ├── pages/Contas.tsx             # Categorias, sub RH, sem Deletar todas, pendência, filtros
    ├── pages/Impostos.tsx           # filtro mínimo nova taxonomia
    ├── pages/Retiradas.tsx          # filtro RH/retirada_socios
    ├── pages/Dashboard.tsx          # labels/agregação custo (mínimo)
    ├── types/index.ts               # ContaPagar.categoria / subcategoria / pendente
    ├── services/api.ts              # params categoria/subcategoria; sem deletarTodas na UI
    ├── store/index.ts               # filtros de página (categoria + subcategoria RH)
    └── components/Layout.tsx        # desc do menu se mencionar “centro de custo”
```

**Structure Decision**: Manter tabela `contas_pagar` e rotas `/api/contas`. Isolar taxonomia/validação/mapeamento em `categorias_contas.py` para reutilizar em import, schemas e migração. UI renomeia para Categorias sem criar página nova.

## Complexity Tracking

> Sem violações a justificar.
