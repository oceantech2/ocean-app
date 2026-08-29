# Implementation Plan: Página Comissões — nomenclatura, criação e filtro de período

**Branch**: `044-comissoes-pagina` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/044-comissoes-pagina/spec.md`

**Note**: Clarify 2026-08-28 (5 respostas): nomenclatura em todo o produto; padrão ano inteiro; gráfico 12 meses; rota `/comissoes` sem redirect; `/bonus` inexistente.

## Summary

Renomear a experiência de **Bônus** para **Comissões** em toda a UI (menu, página, Dashboard, Contas a Pagar, Auditoria). Trocar a rota para `/comissoes` (permKey `bonus` permanece). Remover o botão de criação avulsa; manter importar/editar/excluir. Acrescentar recorte mês **ou** trimestre no cliente, sem mudar o modelo `bonus` nem `/api/bonus`.

## Technical Context

**Language/Version**: Python 3.11 (FastAPI) + TypeScript 5.2 / React 18

**Primary Dependencies**: FastAPI, SQLAlchemy, Axios, Zustand, React Router, Recharts, `react-hot-toast`

**Storage**: PostgreSQL 16 — **sem** migração; tabela `bonus` inalterada. Recorte temporal só em Zustand (`usePageFilters`).

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend

**Target Platform**: Web interna; API **8001**; frontend **5193**; PostgreSQL **5433**; Redis **6380**

**Project Type**: Web application (backend + frontend)

**Performance Goals**: SC-003 — aplicar mês ou trimestre e conferir listagem/total em menos de 30s (filtro no conjunto já carregado do ano)

**Constraints**: Portas fixas; JWT admin/visualizador; permKey `bonus` preservado; REST `/api/bonus` preservado; `/bonus` sem redirect; sem credenciais nos artefatos

**Scale/Scope**: ~12 arquivos frontend/backend de rótulo e uma página de filtros; zero tabelas novas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS |
| III. Clareza antes de implementar | PASS — 5/5 clarifies na spec |
| IV. Consistência com produto existente | PASS — toast, confirm, Layout, catálogo, padrão da página atual |
| V. Simplicidade e escopo fechado | PASS — filtro no cliente; sem rename de API/tabela; sem página 404 nova |
| Portas / segredos | PASS |

**Post-design re-check**: PASS. Sem violações. Complexidade Tracking vazio. Colisão de nome com subcategoria RH já existente **Comissão** resolvida em [research.md](./research.md) R6 (ex-Bônus → **Comissões**).

## Project Structure

### Documentation (this feature)

```text
specs/044-comissoes-pagina/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-comissoes-pagina.md
│   └── ui-comissoes-pagina.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
frontend/src/utils/paginasCatalogo.ts         # label, path /comissoes, desc; key bonus
frontend/src/App.tsx                          # rota via catálogo; sem /bonus
frontend/src/components/navIcons.tsx          # ícone em /comissoes
frontend/src/pages/Bonus.tsx                  # nomenclatura, sem novo, filtros recorte
frontend/src/store/index.ts                   # bonusRecorte, bonusMes, bonusTrimestre
frontend/src/pages/Dashboard.tsx              # rótulo Comissões
frontend/src/pages/Contas.tsx                 # Bônus (legado) → Comissões (legado)
frontend/src/pages/Auditoria.tsx              # rótulo Comissão / valor Bonus
backend/app/services/categorias_contas.py    # rótulos bonus / legado
backend/app/api/routes/bonus.py              # mensagens HTTP visíveis
backend/app/main.py                          # tag OpenAPI
```

**Structure Decision**: Web app existente. Persistência e REST de bônus não mudam. UX e recorte são frontend; backend só ajusta textos visíveis e labels de categoria.

## Fases de implementação (resumo)

### Frontend

1. Catálogo `path=/comissoes`, labels; ícone; **não** registrar `/bonus`
2. Zustand: recorte ano/mês/trimestre; `setBonusFilters` estendido
3. `Bonus.tsx`: nomenclatura; remover novo; filtrar listagem/total/export; gráfico anual
4. Dashboard, Contas, Auditoria: rótulos Comissões/Comissão

### Backend

1. `categorias_contas.py`: “Comissões” / “Comissões (legado)”; chave `bonus` intacta
2. Mensagens e tag OpenAPI de `/api/bonus` em vocabulário de comissão

### Verificação

Lint + type-check + [quickstart.md](./quickstart.md)

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
| REST contract | [contracts/rest-comissoes-pagina.md](./contracts/rest-comissoes-pagina.md) |
| UI contract | [contracts/ui-comissoes-pagina.md](./contracts/ui-comissoes-pagina.md) |
| Quickstart | [quickstart.md](./quickstart.md) |

**Próximo comando sugerido**: `/speckit-tasks`
