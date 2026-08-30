# Implementation Plan: Contas a Pagar — Listagem em Tabela com Colunas Tipo, Categoria e Mês/Ano

**Branch**: `046-contas-pagar-listagem-colunas` | **Date**: 2026-08-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/046-contas-pagar-listagem-colunas/spec.md`

**Note**: Clarify 2026-08-29 (5/5): seletores Mês+Ano (Dashboard) + Todos; meses futuros permitidos; ordenação padrão vencimento asc; ordem fixa de 12 colunas; ano corrente ±5. Substitui agrupamento da feature `034`.

## Summary

Na página **Contas a Pagar** (`Contas.tsx`), **remover** agrupamento por mês/categoria e exibir **tabela plana única** com colunas **Categoria**, **Mês/Ano** e **Tipo** (ordem fixa). Adicionar filtro **Mês/Ano** (seletores Mês + Ano + opção **Todos**; padrão mês/ano correntes). Filtro mensal no **cliente** sobre `contasFiltradas`; cards e exportações CSV/PDF seguem o recorte visível. Export **Excel**: estender endpoint existente com filtros de listagem + colunas Categoria/Mês/Ano/Tipo. **Sem** migration nem campos novos no banco.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 / FastAPI (ajuste export XLSX opcional)

**Primary Dependencies**: React, Tailwind, Zustand (`usePageFilters` para categoria/status/alertas); `contasPagarAgrupamento.ts`; `Intl` pt-BR; openpyxl via `excel_io` (export)

**Storage**: N/A para filtro/colunas (estado local na página). PostgreSQL inalterado.

**Testing**: [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`; testes Vitest em helpers de coluna/filtro se criados

**Target Platform**: Web interna; frontend **5193**; API **8001**

**Project Type**: Web application — escopo principal **frontend** + **export XLSX** backend

**Performance Goals**: Filtrar/ordenar ≤500 contas já carregadas sem atraso perceptível ao trocar Mês/Ano

**Constraints**: Portas fixas; papéis admin/visualizador; não alterar Dashboard/Fluxo/Receber; remover UI da `034`; alertas de notificação devem listar vencidas de todos os meses

**Scale/Scope**: 1 página + 1 util (+ limpeza agrupamento); 1 endpoint export estendido; 0 migrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS |
| III. Clareza antes de implementar | PASS — 5/5 clarifies; research resolve alertas×mês e export |
| IV. Consistência com produto existente | PASS — seletores Mês/Ano como Dashboard; mesma página Contas |
| V. Simplicidade e escopo fechado | PASS — tabela plana no cliente; backend só onde CSV não cobre Excel template |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Excel server-side não replica filtros locais (descrição/intervalo) — CSV/PDF sim; documentado em contrato REST e quickstart.

## Project Structure

### Documentation (this feature)

```text
specs/046-contas-pagar-listagem-colunas/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-contas-pagar-listagem-colunas.md
│   └── rest-contas-pagar-listagem-colunas.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/src/pages/Contas.tsx
frontend/src/utils/contasPagarAgrupamento.ts   # rotuloMesAnoColuna; chaveMes (reuso)
frontend/src/utils/contasPagarFiltroMes.ts     # opcional: anos ±5, match competência
frontend/src/services/api.ts                   # exportarXlsx com params de filtro

backend/app/api/routes/contas.py               # exportar-xlsx: filtros + colunas
backend/app/services/excel_io.py               # colunas Categoria, Mês/Ano no template
```

**Structure Decision**: Lógica de listagem, filtro Mês/Ano e tabela plana ficam em `Contas.tsx`. Helpers puros para rótulo Mês/Ano e anos permitidos evitam duplicar parse de data. Remover imports/estado de agrupamento (`agruparPorMes`, `gruposAbertos`, subgrupos categoria). Store Zustand **não** ganha mes/ano (sessão local); alertas forçam **Todos** via efeito na página.

## Complexity Tracking

> Sem violações a justificar.

## Phase 0 — Research

Concluída: [research.md](./research.md) — decisões sobre tabela plana, filtro local, alertas×Todos, ordenação, export e limpeza da `034`.

## Phase 1 — Design

| Artefato | Caminho |
|----------|---------|
| Modelo de apresentação | [data-model.md](./data-model.md) |
| Contrato UI | [contracts/ui-contas-pagar-listagem-colunas.md](./contracts/ui-contas-pagar-listagem-colunas.md) |
| Contrato REST (export) | [contracts/rest-contas-pagar-listagem-colunas.md](./contracts/rest-contas-pagar-listagem-colunas.md) |
| Validação | [quickstart.md](./quickstart.md) |

## Notas de implementação (para `/speckit-tasks`)

1. **Remover** blocos colapsáveis e loop `gruposLista.map` → uma tabela com `ordenar(contasFiltradas)`.
2. **Inserir** filtros Todos + Mês + Ano na barra de filtros (antes ou após Categorias).
3. **Estender** `contasFiltradas` com match `YYYY-MM` quando não Todos.
4. **Reset** `sortField`/`sortDir` ao mudar filtros.
5. **`useEffect`**: se `contasAlertaVencimento` ativo → `setContasMesTodos(true)`.
6. **CSV**: ordem FR-001a; campos Categoria, Mês/Ano, Tipo.
7. **Excel**: params + colunas no backend; frontend passa estado.
8. **Testes** unitários: `rotuloMesAnoColuna`, filtro competência, `anosPermitidosContasPagar`.
