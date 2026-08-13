# Implementation Plan: Fluxo de Caixa — Conta Corrente e Conta Investimento

**Branch**: `025-fluxo-caixa-contas` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/025-fluxo-caixa-contas/spec.md`

**Note**: Clarify 2026-08-13 (4/5): visões exclusivas; Contas a Pagar só na corrente; recorte completo de saldos; manuais (e saldo) sem seletor — sempre o fluxo ativo.

## Summary

A tela Fluxo de Caixa passa a ter **dois fluxos exclusivos** na mesma rota: **Conta corrente** (padrão ao abrir) e **Conta investimento**. Lista, totais, exportação, card, tabela de saldos e gráfico mostram **só** o fluxo ativo. Entradas automáticas seguem a Caixa de Contas a Receber (`corrente` / `investimento`; ausente ⇒ corrente). Saídas de Contas a Pagar entram **somente** na corrente. Manuais precisam persistir `conta`; o POST usa o fluxo ativo, sem seletor na UI. Saldos já têm `conta` — a tela filtra e grava só a conta ativa.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Axios (`nfsService`, `contasService`, `fluxoMovimentosService`, `saldosService`), Zustand (`useAuthStore`), `mapearMovimentos`, `exportarCSV`

**Storage**: PostgreSQL — `saldos.conta` já existe; `fluxo_movimentos` **ganha** `conta VARCHAR` (`corrente` \| `investimento`, default `corrente` para legado). Sem tabela nova. Movimentos automáticos continuam visão de tela.

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`. Sem suíte pytest nova.

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: SC-002 — troca de fluxo e recorte visível em &lt; 30 s; período típico continua carregando como na 024

**Constraints**: Portas fixas; JWT; admin (manuais, saldos, CSV de saldos) / visualizador (leitura + troca de fluxo); GET `/nfs` **sem** `mes`/`ano` no caixa (filtro de pagamento no cliente); sem credenciais nos artefatos

**Scale/Scope**: 1 página (`FluxoCaixa.tsx`) + `fluxoCaixaMovimentos.ts` + coluna `conta` em manuais; reuso de `GET /saldos?conta=`; **fora**: Caixa em Contas a Pagar, visão unificada, transferência especial, recálculo de saldo, memória do último fluxo

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Fluxo de Caixa; visualizador consulta e troca fluxo; escrita só admin |
| III. Clareza antes de implementar | PASS — clarify 4/5; reclassificar manual após gravar assumido fora |
| IV. Consistência com produto existente | PASS — Layout, toast, confirm em exclusão, CSV de saldos, coluna Origem da 024 |
| V. Simplicidade e escopo fechado | PASS — um campo `conta` em manuais + filtro de UI; sem módulo novo |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não adicionar Caixa em Contas a Pagar. Não criar endpoint unificado de caixa. Import CSV de saldos pode trazer `conta` no arquivo; a visão continua exclusiva (linhas da outra conta só aparecem ao trocar o fluxo).

## Project Structure

### Documentation (this feature)

```text
specs/025-fluxo-caixa-contas/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-fluxo-movimentos-conta.md
│   └── ui-fluxo-caixa-contas.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/app/
├── models/__init__.py                 # FluxoMovimento.conta
├── main.py                            # ALTER TABLE fluxo_movimentos ADD COLUMN conta
└── api/routes/fluxo_movimentos.py     # query/body conta; legado corrente

frontend/src/
├── pages/FluxoCaixa.tsx               # seletor de fluxo, recorte exclusivo, POST sem seletor
├── utils/fluxoCaixaMovimentos.ts      # filtrar por fluxo (CR.caixa, CP→corrente, manuais.conta)
├── types/index.ts                     # conta no movimento manual / tela
└── services/api.ts                    # listar/criar com conta
```

**Structure Decision**: Frontend + pequeno ajuste de persistência em manuais. Saldos já filtram por `conta` na API. Automáticos continuam compostos no cliente a partir de `/nfs` e `/contas`, agora recortados pelo fluxo ativo.

## Complexity Tracking

> Sem violações a justificar.
