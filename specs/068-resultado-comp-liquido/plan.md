# Implementation Plan: Resultado Competência fixo em líquido

**Branch**: `068-resultado-comp-liquido` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/068-resultado-comp-liquido/spec.md`

**Note**: Clarify 2026-09-14 (2/2): (1) só Resultado Competência fixo em líquido — Caixa segue toggle; (2) subtítulo canônico fixo **“base líquida”** sempre no Competência (não no Caixa). Padrão de estabilidade numérica = Impostos Recolhidos.

## Summary

Travar o card **Resultado Competência** do Dashboard na receita de competência **líquida** (`pipeline.fechado.valor_liquido`), independentemente do toggle Bruto/Líquido, e exibir sempre o subtítulo **“base líquida”**. A seleção de base é só no cliente (sem `valorPorVisao` neste card). **Resultado Caixa** continua com a base ativa do toggle e **sem** esse subtítulo. Sem backend, migration ou alteração de `calcularResultado` / fórmulas de despesa (`059`).

**Estado no código (baseline atual)**: o cálculo já usa `valor_liquido`; o subtítulo ainda está como “Não alterna com Bruto/Líquido” — falta alinhar ao texto canônico da spec.

## Technical Context

**Language/Version**: TypeScript (frontend React 18+); Python 3.11 no backend (inalterado nesta feature)

**Primary Dependencies**: React, Tailwind; `dashboardDespesas.calcularResultado`; dual-base de `pipeline` / `receitaCaixa` (`056`–`058`); `visaoReceita` / `valorPorVisao` (`057`) só para Caixa e demais métricas

**Storage**: N/A (cálculo derivado em memória no Dashboard; sem persistência nova)

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/` recomendados

**Target Platform**: Web (Dashboard Ocean App, frontend porta 5193)

**Project Type**: Web application (frontend + backend; só frontend muda)

**Performance Goals**: Alternar toggle não refetch; Resultado Competência estável com dados já carregados; SC-005 ≤ 5 s ao mudar período

**Constraints**: Portas fixas 8001/5433/6380/5193; papéis `admin` / `visualizador` inalterados; texto canônico do subtítulo = **“base líquida”**; não redesenhar o bloco além desse hint; não alterar Impostos Recolhidos nem regras de Resultado Caixa

**Scale/Scope**: 1 card no Dashboard; tipicamente 1 arquivo (`Dashboard.tsx`); zero endpoints novos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Nota |
|-----------|--------|------|
| I. Idioma Português | PASS | Artefatos e UI em pt-BR (“base líquida”) |
| II. Domínio Financeiro Interno | PASS | Ajuste de leitura no Dashboard; papéis respeitados |
| III. Clareza Antes de Implementar | PASS | Spec clarificada (2/2); FRs/SCs testáveis |
| IV. Consistência com o Produto Existente | PASS | Estabilidade como Impostos Recolhidos; layout dos cards preservado |
| V. Simplicidade e Escopo Fechado | PASS | Seleção de base + subtítulo; sem API/migration |
| Portas / segredos | PASS | Sem mudança de infra ou credenciais |

**Post-design re-check**: PASS — design só documenta contrato UI/cálculo no cliente; subtítulo canônico fechado na clarificação; sem complexidade adicional.

## Project Structure

### Documentation (this feature)

```text
specs/068-resultado-comp-liquido/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── calc-resultado-comp-liquido.md
│   └── ui-resultado-comp-liquido.md
└── tasks.md             # /speckit-tasks (Phase 2)
```

### Source Code (repository root)

```text
frontend/
└── src/
    ├── pages/
    │   └── Dashboard.tsx          # receitaComp = valor_liquido; subtítulo "base líquida"
    └── utils/
        ├── dashboardDespesas.ts   # calcularResultado inalterado
        ├── pipelineReceita.ts     # fonte fechado.valor_liquido
        ├── receitaAbas.ts         # Impostos Recolhidos / abas (referência)
        └── metaPeriodo.ts         # valorPorVisao (só Caixa nesta feature)

backend/                           # inalterado
```

**Structure Decision**: Web app existente; alteração isolada no Frontend Dashboard. Sem mudanças em `backend/`.

## Complexity Tracking

> Sem violações da constitution — tabela omitida.
