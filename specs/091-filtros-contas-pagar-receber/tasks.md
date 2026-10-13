# Tasks: Filtros padronizados e compactos em Contas a Pagar e Contas a Receber

**Input**: Design documents from `/specs/091-filtros-contas-pagar-receber/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — validação via [quickstart.md](./quickstart.md).

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e nos contratos; depende de 089 (cards de Receber) já aplicado

## Phase 2: Foundational

- [x] T002 [P] Criar `frontend/src/components/BarraFiltros.tsx` (`BarraFiltros`, `CampoFiltro`, `FILTRO_INPUT`) conforme `contracts/ui-barra-filtros.md`
- [x] T003 [P] Em `backend/app/api/routes/nfs.py` (`listar_nfs`), aceitar `fornecedor_id` opcional com subconsulta em `Bonus`
- [x] T004 [P] Em `frontend/src/services/api.ts`, `nfsService.listar` com parâmetro opcional `fornecedor_id`

## Phase 3: User Story 1 + 2 em Contas a Pagar (P1) 🎯 MVP

- [x] T005 [US1] Em `frontend/src/pages/Contas.tsx`, estados `filtroTipo` e `filtroFornecedor`, aplicados em `contasFiltradas` e nos efeitos que limpam seleção/ordenação; opções de fornecedor = ativos + inativos com contas, ordem alfabética, com "Sem fornecedor"
- [x] T006 [US2] Em `frontend/src/pages/Contas.tsx`, trocar a barra pela `BarraFiltros`: principal (Período com "Todos os períodos", Status, Tipo, Fornecedor, Descrição), Mais filtros (Categoria, Subcategoria RH, Vencimento de/até), "Limpar filtros" e "X de Y"

## Phase 4: User Story 1 + 2 em Contas a Receber (P1)

- [x] T007 [US1] Em `frontend/src/pages/NFs.tsx`, estados `filtroTipo` e `filtroFornecedor`; Tipo em memória, Fornecedor enviado ao servidor e incluído no efeito de recarga
- [x] T008 [US2] Em `frontend/src/pages/NFs.tsx`, trocar a barra pela `BarraFiltros` (Período com ano em seletor, Status, Tipo, Fornecedor, Cliente; Mais filtros: Mostrar arquivadas), mover os cards para antes da barra e a legenda/"Exibir N" para a faixa no topo da tabela

## Phase 4b: Ajuste pós-validação (filtros por todos os campos)

- [x] T011 Criar `frontend/src/utils/filtrosAvancados.ts` (intervalo de data/valor, opções distintas, descrição de intervalo) e, em `BarraFiltros.tsx`, `SecaoFiltros`, `FiltroIntervaloData`, `FiltroIntervaloValor` e chips de filtros ativos
- [x] T012 Em `Contas.tsx` e `NFs.tsx`, "Mais filtros" em grupos Datas/Valor/Detalhes (FR-006), chips (FR-006a) e busca ampliada (FR-006b); "Limpar filtros" passa a mostrar todos os períodos

## Phase 5: Polish

- [x] T009 `npm run type-check` e `npm run build` em `frontend/`; `python -m py_compile backend/app/api/routes/nfs.py`
- [ ] T010 Validar os cenários de [quickstart.md](./quickstart.md) nas duas telas (admin e visualizador, claro/escuro, tela estreita)

## Dependencies & Execution Order

- T002, T003, T004 em paralelo → T005 → T006 (Contas.tsx)
- T002 + T003 + T004 → T007 → T008 (NFs.tsx)
- T006 + T008 → T009 → T010
