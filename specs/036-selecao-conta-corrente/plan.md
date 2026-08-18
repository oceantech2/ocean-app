# Implementation Plan: Seleção de conta corrente

**Branch**: `036-selecao-conta-corrente` | **Date**: 2026-08-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/036-selecao-conta-corrente/spec.md`

**Note**: Clarify 2026-08-18: campo em Receber/NFs/Pagar; só contas correntes no campo; transferência com listas sem Inverter; par inicial fluxo ativo → investimento ou padrão; coluna também na listagem de NFs.

## Summary

Restaurar a **escolha de conta corrente** no recebimento e no pagamento, e permitir **escolher origem e destino** na transferência do Fluxo de Caixa agora que existem N contas.

No produto, **Contas a Receber e NFs são a mesma tela** (`NFs.tsx`, rota `/nfs`). O campo, a coluna e a exportação dessa página cobrem as duas menções da spec. **Contas a Pagar** ganha `caixa` persistido. Investimento **não** entra no seletor das origens; só nas listas da transferência.

Abordagem: reusar `contas_correntes` + `codigo`; aceitar `caixa` no POST/PUT de NF no ato de receber (só corrente ativa); coluna + campo em `contas_pagar`; espelho de pagar deixa de cair sempre na padrão; UI de transferência remove **Inverter** e aplica o par inicial da spec.

## Technical Context

**Language/Version**: Python 3.11 (FastAPI) + TypeScript 5.2 / React 18

**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic, Axios, Zustand (papéis), `NFs.tsx`, `Contas.tsx`, `FluxoCaixa.tsx`, `fluxoCaixaMovimentos.ts`, `app.services.caixas`

**Storage**: PostgreSQL 16 — `ALTER TABLE contas_pagar ADD COLUMN caixa VARCHAR(64)`; `nfs.caixa` já existe. Migração inline em `backend/app/main.py` (`_migrar`)

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend`

**Target Platform**: Web interna; API **8001**; frontend **5193**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (backend + frontend)

**Performance Goals**: SC-002 / SC-005 — recebimento, pagamento ou transferência com conta escolhida em &lt; 1 min

**Constraints**: Portas fixas; JWT admin escrita / visualizador leitura; sem investimento no campo das origens; sem Inverter; sem credenciais nos artefatos

**Scale/Scope**: Três superfícies (Receber/NFs, Pagar, Transferência); uma coluna nova em pagar; ajuste de roteamento no fluxo. Fora: cadastro de contas (031), dashboard por conta, Open Banking

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — admin escolhe conta e transfere; visualizador só consulta |
| III. Clareza antes de implementar | PASS — 5/5 clarifies na spec |
| IV. Consistência com produto existente | PASS — mesmo padrão de select, toast, listagem; Receber continua sendo a página de NFs |
| V. Simplicidade e escopo fechado | PASS — reusa códigos string; não cria segunda página de receber |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não duplicar tela de Contas a Receber. Não oferecer investimento no campo de origem. Não recriar Inverter. Contas já pagas sem `caixa` continuam espelhadas na padrão até o admin salvar com conta escolhida.

## Project Structure

### Documentation (this feature)

```text
specs/036-selecao-conta-corrente/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-selecao-conta-corrente.md
│   └── ui-selecao-conta-corrente.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/app/main.py                         # ALTER contas_pagar.caixa
backend/app/models/__init__.py              # ContaPagar.caixa
backend/app/schemas.py                      # caixa em ContaPagar*; validação NF
backend/app/services/caixas.py              # exigir_conta_corrente (sem investimento)
backend/app/api/routes/nfs.py               # receber/criar aceita caixa de corrente ativa
backend/app/api/routes/contas.py            # persistir caixa no pagar
frontend/src/types/index.ts                 # ContaPagar.caixa
frontend/src/utils/fluxoCaixaMovimentos.ts  # pagar pelo codigo, não só padrão
frontend/src/pages/NFs.tsx                  # campo no receber; coluna; export; sem investimento
frontend/src/pages/Contas.tsx               # campo, coluna, export, ação pagar
frontend/src/pages/FluxoCaixa.tsx           # listas; remover Inverter; par inicial FR-011
```

**Structure Decision**: Web app existente. Origens compartilham o mesmo `codigo` de `contas_correntes`. Contas a Receber = página NFs.

## Complexity Tracking

> Sem violações da constituição.
