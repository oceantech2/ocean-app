# Implementation Plan: Fluxo de Caixa — Inverter origem e destino da transferência

**Branch**: `028-transferencia-inverter-caixas` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/028-transferencia-inverter-caixas/spec.md`

**Note**: Clarify 2026-08-13: origem e destino em texto somente leitura; controle **Inverter** troca os dois. Sem alteração de API nem de persistência.

## Summary

No modal **Transferência** do Fluxo de Caixa, as duas listas (`<select>`) de origem e destino saem. O par aparece em **texto somente leitura** (rótulos **Conta corrente** / **Conta investimento**) e um botão **Inverter** troca `origem` ↔ `destino` no estado do formulário, preservando valor, data e observação. Destino continua derivado via `outraConta`. Abertura, POST, teto de saldo visível e papéis da 026 **não mudam**. Só `FluxoCaixa.tsx`.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend). Backend inalterado.

**Primary Dependencies**: React, Tailwind, estado local `transfForm`, helper `outraConta` / rótulo de caixa já existentes em `FluxoCaixa.tsx`, `fluxoMovimentosService.transferir` (026)

**Storage**: N/A — sem migração, sem campo novo. Persistência continua `fluxo_movimentos.par_id` (026).

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend`

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (ajuste só de UI)

**Performance Goals**: SC-002 — inverter o par em &lt; 5 s (troca imediata no cliente, sem round-trip)

**Constraints**: Portas fixas; JWT e papéis 026; sem listas de origem/destino; textos não clicáveis para trocar sentido; sem credenciais nos artefatos

**Scale/Scope**: 1 arquivo (`frontend/src/pages/FluxoCaixa.tsx`); **fora**: API, cálculo de saldo, lista/exportação, terceiro caixa, seletor de fluxo da página

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — só admin vê o modal; visualizador inalterado |
| III. Clareza antes de implementar | PASS — clarify 1/1 (par em texto + **Inverter**) |
| IV. Consistência com produto existente | PASS — mesmo modal, toast, confirmação e POST da 026 |
| V. Simplicidade e escopo fechado | PASS — troca de dois `<select>` por textos + um botão; sem componente novo obrigatório |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não alterar `fluxo_movimentos.py` nem o payload de `transferir`. Não reintroduzir listas. Não tornar os rótulos clicáveis.

## Project Structure

### Documentation (this feature)

```text
specs/028-transferencia-inverter-caixas/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-fluxo-caixa-inverter-transferencia.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/src/pages/FluxoCaixa.tsx
  # remover os dois <select> de origem/destino
  # textos somente leitura + botão Inverter
  # inverter: swap origem/destino; preservar demais campos
```

**Structure Decision**: Tudo no modal já existente. Helpers `outraConta` e rótulo de caixa permanecem no mesmo arquivo. Sem contrato REST novo: o POST 026 já recebe `origem` e `destino` do estado.

## Complexity Tracking

> Sem violações a justificar.
