# Implementation Plan: Fluxo de Caixa — Transferência entre Caixas

**Branch**: `026-fluxo-caixa-transferencia` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/026-fluxo-caixa-transferencia/spec.md`

**Note**: Clarify 2026-08-13 (5/5): saldo visível recalcula; teto = saldo da origem; tabela histórica só consulta; fórmula histórico + movimentos posteriores; texto automático de/para.

## Summary

Na tela Fluxo de Caixa, admin deixa de incluir receita/despesa e de gravar saldo (botão, CSV, editar/excluir na tabela). A escrita nova é **Transferência**: um POST atômico cria saída na origem e entrada no destino (`corrente` ↔ `investimento`), com `par_id` ligando os lados. Origem na lista = **Transferência**; descrição automática **para** / **de** o outro caixa. O **saldo visível** (card e teto) = último saldo histórico da conta + movimentos posteriores (ou zero + movimentos). Valor acima do teto é recusado. Visualizador só consulta. Espelho CR/CP (024) e visões exclusivas (025) permanecem.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Axios (`fluxoMovimentosService`, `nfsService`, `contasService`, `saldosService`), Zustand (`useAuthStore`), `mapearMovimentos`, `exportarCSV`, `react-hot-toast`

**Storage**: PostgreSQL — `fluxo_movimentos` ganha `par_id` (UUID, nullable). Sem tabela nova. Saldos inalterados (só leitura na UI). Automáticos continuam visão de tela.

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`. Sem suíte pytest nova.

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: SC-003 — transferência válida e impacto nos dois fluxos em &lt; 1 min; carga do período no mesmo patamar da 025

**Constraints**: Portas fixas; JWT; admin cria/desfaz transferência; visualizador lê; POST avulso de receita/despesa **não** é usado nesta tela; teto de saldo validado no cliente com a mesma fórmula do card; API garante par atômico e rejeita origem=destino / valor inválido; sem credenciais nos artefatos

**Scale/Scope**: 1 página (`FluxoCaixa.tsx`) + `fluxoCaixaMovimentos.ts` + endpoint de transferência + coluna `par_id`; **fora**: terceiro caixa, reescrever linhas históricas de saldo, Caixa em Contas a Pagar, recálculo servidor de CR/CP

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — transferência só admin; visualizador consulta |
| III. Clareza antes de implementar | PASS — clarify 5/5 |
| IV. Consistência com produto existente | PASS — Layout, toast, confirm em desfazer, coluna Origem, seletor 025 |
| V. Simplicidade e escopo fechado | PASS — par em `fluxo_movimentos` + um POST; sem módulo novo |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não reintroduzir Incluir receita/despesa/Registrar saldo. Não agregar CR/CP num endpoint novo de caixa (padrão 024: composição no cliente). Validação do teto no cliente alinha card e recusa; API não duplica o espelho de NFs/contas.

## Project Structure

### Documentation (this feature)

```text
specs/026-fluxo-caixa-transferencia/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-fluxo-transferencias.md
│   └── ui-fluxo-caixa-transferencia.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/app/
├── models/__init__.py                 # FluxoMovimento.par_id
├── main.py                            # ALTER TABLE fluxo_movimentos ADD COLUMN par_id
└── api/routes/fluxo_movimentos.py     # POST transferência; DELETE do par; GET serializa par_id

frontend/src/
├── pages/FluxoCaixa.tsx               # botão Transferência; remover ações de receita/despesa/saldo/CSV; card calculado
├── utils/fluxoCaixaMovimentos.ts      # origem Transferência; texto de/para; saldo visível
├── types/index.ts                     # origem_rotulo Transferência; par_id
└── services/api.ts                    # transferir / desfazer par; listar manuais da conta sem mês
```

**Structure Decision**: Mesma tela e a mesma tabela de manuais. Transferência é um par de linhas `fluxo_movimentos` (receita/despesa) com `par_id`. Saldos só alimentam o ponto de partida do card. Automáticos continuam compostos no cliente.

## Complexity Tracking

> Sem violações a justificar.
