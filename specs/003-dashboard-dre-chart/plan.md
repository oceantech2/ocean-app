# Implementation Plan: Dashboard — Gráfico DRE Empilhado

**Branch**: `003-dashboard-dre-chart` | **Date**: 2026-07-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-dashboard-dre-chart/spec.md`

**Note**: Feature de **novo gráfico** na Dashboard (abaixo dos saldos). Inclui endpoint de agregação DRE + UI Recharts (barra de receita ao lado de pilha Despesa/Impostos/Lucro).

## Summary

Adicionar na Dashboard, imediatamente abaixo dos cards de Saldo Conta Corrente e Conta Investimento, um gráfico **DRE** do ano selecionado: por mês, **duas barras lado a lado** — (1) Receita bruta (azul); (2) pilha Despesa (vermelho) + Impostos (cinza) + Lucro (verde, só se ≥ 0). Labels/legenda interativa (padrão: todos ligados). Dados derivados de NFs pagas (`valor_bruto` por `data_emissao`) e Contas a Pagar por `data_vencimento` (pagas + pendentes); Despesa = todos os centros **exceto** `impostos` (inclui `retirada_lucro`); Lucro = receita − despesa − impostos. Endpoint novo `GET /api/relatorios/dre-mensal?ano=`; UI em `Dashboard.tsx` + `relatoriosService`.

## Technical Context

**Language/Version**: Python 3.11+ (FastAPI backend); TypeScript 5.2 + React 18 (frontend)

**Primary Dependencies**: FastAPI, SQLAlchemy, PostgreSQL; React, Recharts (`BarChart` / `Bar` com `stackId` distintos), Tailwind, Axios (`relatoriosService`), react-hot-toast

**Storage**: PostgreSQL existente — tabelas `nfs` e `contas_pagar` (sem migration; agregação somente leitura)

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend; smoke do endpoint com JWT

**Target Platform**: Web interna (browser); API em Docker na porta **8001**; frontend dev **5193**

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Agregação DRE do ano no mesmo ciclo de carga da dashboard sem regressão perceptível (SC-001 ~5s); preferir uma query agregada por mês ou loops alinhados ao padrão de `/impostos/de-contas` e `/relatorios/faturamento-liquido-mes`

**Constraints**: Portas fixas; JWT; não alterar cards de saldo nem demais gráficos além do deslocamento vertical; Lucro negativo sem segmento empilhado; eixo: ano corrente → meses 1..mês atual; anos anteriores → 12 meses; ano futuro → estado vazio

**Scale/Scope**: 1 endpoint novo; 1 método em `api.ts`; bloco novo em `Dashboard.tsx` (opcional extrair componente local se reduzir ruído); 0 migrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

A constituição em `.specify/memory/constitution.md` ainda é o **template não ratificado** (placeholders). Gates práticos:

| Gate | Status |
|------|--------|
| Princípios de constituição aplicáveis | N/A — constituição não preenchida |
| Escopo alinhado ao spec (DRE abaixo dos saldos) | PASS |
| Reutilizar padrões Ocean (relatórios, impostos, Recharts) | PASS |
| Sem schema novo desnecessário | PASS |
| Artefatos Phase 0/1 | PASS (após geração) |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/003-dashboard-dre-chart/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    ├── api/routes/
    │   └── relatorios.py          # + GET /dre-mensal
    └── models/__init__.py         # NF, ContaPagar, CentroCusto, StatusNF (sem mudança de schema)

frontend/
└── src/
    ├── pages/
    │   └── Dashboard.tsx          # Bloco gráfico DRE abaixo dos saldos
    └── services/
        └── api.ts                 # relatoriosService.dreMensal(ano)
```

**Structure Decision**: Backend agrega DRE em `relatorios.py` (mesmo router dos demais gráficos). Frontend consome via `relatoriosService` e renderiza com Recharts em `Dashboard.tsx`, logo após o grid de saldos. Sem nova página/menu.

## Complexity Tracking

> Sem violações a justificar.
