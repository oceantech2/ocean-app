# Implementation Plan: Alertas de Contas (Vencer, Vencidas e NF Pendente)

**Branch**: `027-alertas-contas` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/027-alertas-contas/spec.md`

**Note**: Clarify 2026-08-13 (3/3): NF pendente = contas a receber ativas sem número; inclui já recebidas; clique abre tela já filtrada.

## Summary

Estender o painel in-app do topo (sem mexer no e-mail) com três itens: **Contas vencidas** (renomeia “Contas atrasadas”), **Contas a vencer em menos de 1 dia** (não pagas com vencimento = hoje civil) e **Contas com nota fiscal pendente** (NFs/contas a receber ativas sem número, inclusive pagas). Clique aplica filtro persistido em `usePageFilters` para a lista mostrar só aquele conjunto. Contagens e recorte de vencimento usam **dia civil** (`YYYY-MM-DD`), não `Date` vs agora. NFs vencidas e férias permanecem.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend, só leitura das listas já existentes)

**Primary Dependencies**: React, Tailwind, Axios (`contasService`, `nfsService`, `feriasService`), Zustand (`usePageFilters`, `useNotifStore`, `useAuthStore`), `useNotificacoes`, `Layout`

**Storage**: PostgreSQL existente (`contas_pagar`, `nfs`). Sem tabela, coluna ou migration.

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`. Sem suíte pytest nova.

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: SC-004 — do painel à lista filtrada em &lt; 30 s; contagens no mesmo ciclo de 30 s já usado por `useNotificacoes`

**Constraints**: Portas fixas; JWT; mesmos alertas para admin e visualizador; **não** alterar `coletar_alertas` / envio SMTP (FR-012); comparação de vencimento por data civil; sem credenciais nos artefatos

**Scale/Scope**: Painel (`Layout.tsx` + `useNotificacoes.ts`) + filtros (`store/index.ts`) + listagens `Contas.tsx` e `NFs.tsx`. **Fora**: e-mail, campo NF em contas a pagar, alerta extra de CR vencida, push/SMS

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — mesmos alertas; visualizador só consulta nas telas |
| III. Clareza antes de implementar | PASS — clarify 3/3 |
| IV. Consistência com produto existente | PASS — mesmo painel do topo, toast/spinner das páginas, clique como NFs vencidas |
| V. Simplicidade e escopo fechado | PASS — só UI + filtros; sem endpoint nem schema novos |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não reutilizar `GET /api/alertas` para o badge (ele alimenta o e-mail via `coletar_alertas`). Não tratar “hoje” com `new Date(vencimento) < new Date()` (marca o dia corrente como vencido à tarde).

## Project Structure

### Documentation (this feature)

```text
specs/027-alertas-contas/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-alertas-contas.md
│   └── rest-leitura-alertas-contas.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/src/
├── hooks/useNotificacoes.ts     # três contagens novas + dia civil
├── components/Layout.tsx        # rótulos, itens, navegação com filtro
├── store/index.ts               # contasAlertaVencimento; nfsSemNumero
├── pages/Contas.tsx             # lista só o conjunto do alerta
└── pages/NFs.tsx                # lista só ativas sem número de NF

backend/                      # sem mudança de contrato de escrita; GET listas atuais
```

**Structure Decision**: Tudo no painel e nas duas páginas já existentes. Contagens no cliente (padrão atual). Filtro de destino no Zustand para sobreviver à navegação. API inalterada.

## Complexity Tracking

> Sem violações a justificar.
