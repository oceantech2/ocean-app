# Implementation Plan: Alerta de Fluxo de Caixa no Dashboard

**Branch**: `061-dashboard-alerta-fluxo` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/061-dashboard-alerta-fluxo/spec.md`

**Note**: Clarify 2026-09-10: próximo ≥ hoje; limiar no Dashboard (sempre editável por `admin`); inconsistência → % = 0; banner não dismissível; falha parcial → “indisponível”; limiar **inteiro** 1–100; comparação usa **% calculado** (precisão completa). Complementa `056`–`060`. Última seção de cards do briefing (09). `/speckit-plan` revalidado em 2026-09-10 (Phase 0–1 sem NEEDS CLARIFICATION).

## Summary

Entregar no **Dashboard** o **Alerta de Fluxo de Caixa**: banner âmbar no topo quando `% não recebida` (competência do período) **>** limiar global **inteiro** (padrão 60). O banner mostra %, **próximo recebimento** (MIN vencimento ≥ hoje) e **Aging em atenção** (`d60_90`). Reutilizar Pipeline (`fechado`/`recebido`) e Aging já carregados; persistir limiar em `configuracao_app`; agregar próximo recebimento em endpoint dedicado. Toggle Bruto/Líquido sem refetch; limiar editável só por `admin` no Dashboard; arredondamento visual não altera a decisão do banner.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Axios; SQLAlchemy `NF` + `ConfiguracaoApp`; toggle `visaoReceita` (057); Pipeline (056/058); Aging (060)

**Storage**: PostgreSQL — `nfs` (leitura); `configuracao_app` chave `limiar_alerta_fluxo` (texto do inteiro, padrão `"60"`). **Sem** migration DDL (tabela já existe); seed/upsert na primeira leitura ou no save

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`; smoke API **8001**

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend Dashboard + rotas `relatorios` / `configuracoes`)

**Performance Goals**: 1 GET limiar + 1 GET próximo-recebimento por `carregarDados` (além de Pipeline/Aging já existentes); toggle e troca de limiar local sem refetch dos totais; SC-008 ≤ 10 s de leitura

**Constraints**: Portas fixas; JWT; mesma leitura `admin`/`visualizador` nos dados do banner; PUT limiar só `admin` e só **inteiros** 1–100; não dismiss; não misturar limiar com Configuração do Período; não redefinir regras 058/060; falha parcial sem zero falso; comparação `% > limiar` com precisão completa

**Scale/Scope**: 2 endpoints (limiar GET/PUT + próximo-recebimento GET); 1 util frontend + banner + controle limiar no Dashboard; 0 migrations DDL

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Conta a Receber = `nfs`; limiar só admin; leitura igual |
| III. Clareza antes de implementar | PASS — clarify completo (incl. inteiros + precisão) |
| IV. Consistência com produto existente | PASS — Pipeline/Aging/toggle; `configuracao_app` |
| V. Simplicidade e escopo fechado | PASS — reuso 058/060; sem DDL; sem notificações/drill-down |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/061-dashboard-alerta-fluxo/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-limiar-alerta-fluxo.md
│   ├── rest-proximo-recebimento.md
│   └── ui-dashboard-alerta-fluxo.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    ├── api/routes/
    │   ├── configuracoes.py        # GET/PUT limiar-alerta-fluxo
    │   └── relatorios.py           # GET /proximo-recebimento
    ├── schemas.py                  # Limiar (inteiro) + ProximoRecebimento dual-base
    └── services/
        └── limiar_alerta_fluxo.py  # ler/salvar chave configuracao_app (inteiro 1–100)

frontend/
└── src/
    ├── pages/
    │   └── Dashboard.tsx           # banner âmbar + controle limiar (admin)
    ├── services/
    │   └── api.ts                  # limiar + proximoRecebimento
    └── utils/
        └── alertaFluxoCaixa.ts     # % , deveExibirBanner (precisão completa), normalize, rótulos
```

**Structure Decision**: Não criar endpoint composto que recalcule competência/aging — o Dashboard já carrega Pipeline e Aging. Novos contratos: limiar global (`configuracao_app`) e agregação de próximo recebimento. Util puro no client decide exibir banner (`pct > limiar` com precisão completa), aplica toggle e trata falhas parciais (FR-014/015).

## Complexity Tracking

> Sem violações a justificar.
