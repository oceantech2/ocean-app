# Implementation Plan: Fluxo de Caixa — Importar Contas a Receber e Contas a Pagar

**Branch**: `024-fluxo-caixa-importar` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/024-fluxo-caixa-importar/spec.md`

**Note**: Clarify 2026-08-13 (3/3): espelho automático ao abrir/filtrar; sem omissão só no caixa; coluna **Origem** canônica.

## Summary

O Fluxo de Caixa deve **espelhar** o período: entradas = Contas a Receber **recebidas** (módulo `/nfs`, `status=paga` / `data_pagamento`); saídas = Contas a Pagar **pagas**. Sem botão de importar esses módulos, sem cópia persistida, sem ocultar título no caixa. A página já monta NFs pagas + contas pagas + manuais; esta feature **alinha** essa montagem à spec (origem canônica, coluna Origem, filtro por data de pagamento, arquivadas de fora, valor inválido de fora, paginação completa das listagens, exportação com Origem) e **não** cria lote nem tabela nova.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend, sem mudança obrigatória)

**Primary Dependencies**: React, Tailwind, Axios (`nfsService`, `contasService`, `fluxoMovimentosService`, `saldosService`), Zustand (`useAuthStore`), `exportarCSV`

**Storage**: PostgreSQL existente (`nfs`, `contas_pagar`, `fluxo_movimentos`, `saldos`). **Sem migration.** Movimento automático é visão de tela, não entidade gravada.

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`. Sem suíte pytest nova.

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: SC-001 — movimentos de um período típico visíveis em &lt; 1 minuto após abrir/filtrar; listagens paginadas em blocos de até 1000 (teto atual da API)

**Constraints**: Portas fixas; JWT; admin (manuais, saldos, CSV de saldos) / visualizador (leitura); GET `/nfs` com `mes`/`ano` filtra **emissão**, não pagamento — o caixa **não** deve passar esses params; sem credenciais nos artefatos

**Scale/Scope**: 1 página (`FluxoCaixa.tsx`) + util de montagem; reuso de `GET /nfs`, `GET /contas`, `GET /fluxo-movimentos`; **fora**: endpoint unificado, persistir automático, botão Importar CR/CP, recalcular saldos, Dashboard

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Fluxo de Caixa; visualizador só consulta; manuais só admin |
| III. Clareza antes de implementar | PASS — clarify 3/3 |
| IV. Consistência com produto existente | PASS — Layout, toast, CSV de saldos, manuais e confirmar exclusão de manual; coluna Origem no mesmo espírito de Contas a Receber |
| V. Simplicidade e escopo fechado | PASS — composição no cliente; sem tabela/endpoint novos |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não criar `GET /fluxo-caixa/movimentos` nem persistir automáticos (cópia congelada recusada no clarify).

## Project Structure

### Documentation (this feature)

```text
specs/024-fluxo-caixa-importar/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-leitura-fluxo.md
│   └── ui-fluxo-caixa-movimentos.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/src/
├── pages/FluxoCaixa.tsx                 # período, totais, coluna Origem, export, sem omitir automático
├── utils/fluxoCaixaMovimentos.ts        # mapa origem → movimento de tela (id estável, filtros)
└── utils/export.ts                      # consumo: CSV com coluna Origem
```

**Structure Decision**: Só frontend. A API já entrega Contas a Receber (`/nfs`) e Contas a Pagar (`/contas`) e manuais (`/fluxo-movimentos`). O caixa combina e filtra por `data_pagamento` no cliente. Backend intacto salvo se o quickstart revelar teto `limit=1000` insuficiente — aí paginar no cliente (já previsto), não subir o teto da API nesta feature.

## Complexity Tracking

> Sem violações a justificar.
