# Implementation Plan: Contas a Receber — Alíquota do Mês no Tooltip de Imposto

**Branch**: `037-contas-receber-aliquota-tooltip` | **Date**: 2026-08-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/037-contas-receber-aliquota-tooltip/spec.md`

**Note**: Clarify 2026-08-18: tooltip só na célula Imposto de Contas a Receber; percentual efetivo do mês (mesmo “% Imposto”); indisponível com mensagem explícita; célula “—” ainda mostra a alíquota se existir.

## Summary

Na tabela de **Contas a Receber** (`NFs.tsx`, rota `/nfs`), a célula **Imposto** passa a ter tooltip (e texto acessível) com a **alíquota do mês**: o `percentual_imposto` efetivo já calculado em `GET /api/impostos/de-contas` para o mês/ano de competência do lançamento (emissão, senão vencimento).

Não há coluna nova, cadastro de alíquota nem alteração da página Impostos. O frontend busca os percentuais do(s) ano(s) visíveis, monta um mapa mês→percentual e resolve o texto na célula. Percentual ≤ 0 (o “—” da tela Impostos) ou competência indefinida → mensagem “Alíquota do mês indisponível”.

## Technical Context

**Language/Version**: Python 3.11 (FastAPI, inalterado nesta feature) + TypeScript 5.2 / React 18

**Primary Dependencies**: Axios (`impostosService.deContas`), `NFs.tsx`, helper de competência/texto do tooltip

**Storage**: N/A — reusa cálculo existente (Contas a Pagar categoria Impostos + faturamento de NFs pagas). Sem migração.

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend`

**Target Platform**: Web interna; API **8001**; frontend **5193**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (backend + frontend; mudança concentrada no frontend)

**Performance Goals**: SC-002 — alíquota visível em ≤ 2 s após hover/foco; um `de-contas` por ano visível (12 meses), em paralelo ao `listar` de NFs

**Constraints**: Portas fixas; JWT já existente; visualizador e admin veem o mesmo tooltip; sem credenciais nos artefatos; sem alterar Impostos/Dashboard/Pagar

**Scale/Scope**: Uma coluna de uma tabela; helper puro; reuso de um GET já autenticado. Fora: gráficos Impostos, cadastro de alíquota, percentual da linha

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — leitura para ambos; sem mudança de permissão |
| III. Clareza antes de implementar | PASS — 4/4 clarifies na spec |
| IV. Consistência com produto existente | PASS — `title` já usado na tabela; mesmo “% Imposto” da página Impostos |
| V. Simplicidade e escopo fechado | PASS — sem endpoint novo, sem campo em NF, sem página nova |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não embutir percentual no payload de NF. Não recalcular imposto÷bruto na linha. Não alterar `Impostos.tsx`.

## Project Structure

### Documentation (this feature)

```text
specs/037-contas-receber-aliquota-tooltip/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-impostos-de-contas.md
│   └── ui-contas-receber-aliquota-tooltip.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/src/pages/NFs.tsx                  # carregar de-contas; tooltip na célula Imposto
frontend/src/utils/aliquotaMes.ts           # competência, disponibilidade, texto do tooltip
frontend/src/services/api.ts                # impostosService.deContas (já existe; só passar a usar em NFs)
# backend inalterado (GET /api/impostos/de-contas permanece a fonte)
```

**Structure Decision**: App web existente. A feature vive na página de NFs (Contas a Receber) + helper de domínio no frontend. Backend só é contrato de leitura.

## Complexity Tracking

> Não preenchido — Constitution Check sem violações.
