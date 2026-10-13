# Implementation Plan: Filtros padronizados e compactos em Contas a Pagar e Contas a Receber

**Branch**: `091-filtros-contas-pagar-receber` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/091-filtros-contas-pagar-receber/spec.md`

## Summary

Novo componente de layout `components/BarraFiltros.tsx` (linha principal + botão "Mais filtros (n)" + painel recolhível + "Limpar filtros" + resumo "X de Y"), usado por `Contas.tsx` e `NFs.tsx`. Em **Pagar**, filtros Tipo e Fornecedor aplicados em memória em `contasFiltradas` (os cards já derivam dela); "Todos" do período vira opção do seletor de mês. Em **Receber**, Tipo aplicado em memória e Fornecedor aplicado no servidor: `GET /api/nfs` ganha `fornecedor_id` opcional, que mantém NFs com algum `Bonus` (comissão ou bônus) daquele colaborador; ordem da página passa a ser cards → filtros; legenda e "Exibir N" vão para uma faixa no topo da tabela.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18; Python 3.11 + FastAPI + SQLAlchemy

**Primary Dependencies**: Tailwind CSS, Zustand (`usePageFilters`), `PAGE_FILTERS_STICKY_CLASS`

**Storage**: PostgreSQL — sem mudança de schema (subconsulta em `bonus.nf_id`, já indexado)

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run type-check`/`build`; `python -m py_compile`

**Target Platform**: Web interna; API **8001**; frontend **5193**

**Project Type**: Web application (backend + frontend)

**Performance Goals**: Filtros em memória (≤ 500 linhas) instantâneos; filtro por fornecedor em Receber = 1 requisição

**Constraints**: Manter regras atuais (alertas de vencimento, "Sem NF", seleção em massa, exportações); `admin` e `visualizador`

**Scale/Scope**: 5 arquivos (`components/BarraFiltros.tsx` novo, `pages/Contas.tsx`, `pages/NFs.tsx`, `services/api.ts`, `routes/nfs.py`); 0 endpoints novos; 0 migrations

## Constitution Check

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis | PASS — leitura; ambos os papéis |
| III. Clareza antes de implementar | PASS — clarify registrado |
| IV. Consistência com produto existente | PASS — mesma barra sticky, selects e cores; Pagar como referência |
| V. Simplicidade e escopo fechado | PASS — componente de layout pequeno; um parâmetro opcional no servidor |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/091-filtros-contas-pagar-receber/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-nfs-fornecedor.md
│   └── ui-barra-filtros.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/components/BarraFiltros.tsx  # BarraFiltros + CampoFiltro + FILTRO_INPUT
frontend/src/pages/Contas.tsx             # Tipo, Fornecedor, período com "Todos", Mais filtros, Limpar
frontend/src/pages/NFs.tsx                # Tipo, Fornecedor, ordem cards→filtros, faixa da tabela
frontend/src/services/api.ts              # nfsService.listar(..., fornecedor_id)
backend/app/api/routes/nfs.py             # listar_nfs: fornecedor_id opcional
```

**Structure Decision**: Componente de layout compartilhado garante o "igual nas duas telas" (SC-005) sem abstrair a lógica de filtro, que continua em cada página.

## Complexity Tracking

> Sem violações a justificar.
