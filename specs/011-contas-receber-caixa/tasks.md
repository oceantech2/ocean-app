# Tasks: Contas a Receber — Identificação de Caixa

**Input**: Design documents from `/specs/011-contas-receber-caixa/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados no spec — validação manual via [quickstart.md](./quickstart.md) + `npm run lint` / `npm run type-check`

**Organization**: Tasks agrupadas por user story para entrega incremental e teste independente

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: User story (US1, US2, US3)
- Incluir caminhos de arquivo exatos nas descrições

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`
- Contratos: `specs/011-contas-receber-caixa/contracts/`
- Modelo: `specs/011-contas-receber-caixa/data-model.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline 007 e gaps desta feature antes de editar código

- [x] T001 Revisar `specs/011-contas-receber-caixa/plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api-caixa-contas-receber.md` e `contracts/ui-caixa-contas-receber.md` e confirmar escopo (obrigatoriedade no pagamento, “—”, preservar sync, sem migração/filtro/Fluxo)
- [x] T002 [P] Inspecionar UI Contas a Receber (`caixaLabel`, coluna Caixa, modal editar, modal Pagar, export CSV) em `frontend/src/pages/NFs.tsx`
- [x] T003 [P] Inspecionar PUT allowlist, merge Maggo (preserva `caixa`) e export XLSX em `backend/app/api/routes/nfs.py`, `backend/app/schemas.py` e `backend/app/services/excel_io.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Regra de obrigatoriedade `caixa` × `data_pagamento` no backend — fonte da verdade para US1–US3

**⚠️ CRITICAL**: Nenhuma story de UI/export até o PUT rejeitar corretamente estados inválidos

- [x] T004 Em `backend/app/api/routes/nfs.py` (função `atualizar_nf`), após aplicar o payload ao registro, calcular estado resultante de `data_pagamento` e `caixa`; se `data_pagamento` preenchida e `caixa` null/ausente, levantar **422** com mensagem pt-BR clara (conforme [contracts/api-caixa-contas-receber.md](./contracts/api-caixa-contas-receber.md) e [data-model.md](./data-model.md))
- [x] T005 [P] Em `backend/app/schemas.py`, garantir que `NFUpdate.caixa` continua aceitando só `corrente` \| `investimento` \| `null` (validator existente); não exigir `caixa` no schema isolado — a regra cruzada fica no PUT (T004)
- [x] T006 Confirmar smoke: PUT só com `data_pagamento` em registro sem `caixa` → 422; PUT com `data_pagamento` + `caixa` → 200; PUT `caixa: null` em não paga → 200 (passos em [quickstart.md](./quickstart.md))

**Checkpoint**: API é fonte da verdade para FR-003 / FR-012; listagem de legados continua sem bloqueio

---

## Phase 3: User Story 1 — Classificar conta a receber por Caixa (Priority: P1) 🎯 MVP

**Goal**: Admin informa/altera Caixa (corrente/investimento); obrigatório ao marcar recebida e ao salvar legado já recebido sem Caixa; visualizador não edita

**Independent Test**: Editar e persistir Corrente/Investimento; Pagar sem Caixa bloqueia; Pagar com Caixa ok; legado pago sem Caixa salva só com Caixa (quickstart UI admin + smoke API)

### Implementation for User Story 1

- [x] T007 [US1] Em `frontend/src/pages/NFs.tsx`, no `salvar` do modal de edição: se `data_pagamento` (form ou registro) estiver preenchida e Caixa vazia, bloquear submit com toast de erro exigindo Corrente ou Investimento (antes do PUT)
- [x] T008 [US1] Em `frontend/src/pages/NFs.tsx`, no modal **Pagar** (`pagarModal`): adicionar select de Caixa (vazio · Corrente · Investimento); estado local para o valor escolhido; resetar ao abrir
- [x] T009 [US1] Em `frontend/src/pages/NFs.tsx`, em `confirmarPagamento`: exigir Caixa selecionada; enviar no PUT `{ data_pagamento, caixa }` juntos; toast de erro se vazio; tratar 422 da API
- [x] T010 [US1] Em `frontend/src/pages/NFs.tsx`, garantir que conta não recebida ainda pode salvar com Caixa vazia (`caixa: null`) e que admin pode alterar corrente ↔ investimento; visualizador permanece sem ações de escrita

**Checkpoint**: MVP — classificação + obrigatoriedade no pagamento funcionando (UI + API)

---

## Phase 4: User Story 2 — Ver identificação de Caixa na listagem (Priority: P1)

**Goal**: Listagem mostra Corrente / Investimento / — de forma legível; sem texto “Não definido”; legados sem Caixa consultáveis

**Independent Test**: Abrir listagem com os três estados; confirmar “—” e ausência de “Não definido”; visualizador só lê (quickstart passo 2)

### Implementation for User Story 2

- [x] T011 [US2] Em `frontend/src/pages/NFs.tsx`, alterar `caixaLabel` para retornar `Corrente` / `Investimento` / `—` (remover retorno `"Não definido"`)
- [x] T012 [US2] Em `frontend/src/pages/NFs.tsx`, confirmar coluna Caixa da tabela usa `caixaLabel` (ou equivalente) e que células null exibem **—** sem inventar valor
- [x] T013 [P] [US2] Em `frontend/src/pages/NFs.tsx`, no select do modal de edição, manter opção vazia (sem rótulo “Não definido” obrigatório) alinhada ao contrato UI

**Checkpoint**: SC-002 / FR-004 / FR-011 atendidos na listagem

---

## Phase 5: User Story 3 — Exportar com identificação de Caixa (Priority: P2)

**Goal**: CSV e XLSX incluem Caixa alinhada à tela (Corrente / Investimento / — ou vazio)

**Independent Test**: Classificar registros; exportar CSV e XLSX; coluna Caixa coerente (quickstart passo 6)

### Implementation for User Story 3

- [x] T014 [US3] Em `frontend/src/pages/NFs.tsx`, ajustar export CSV para usar o novo `caixaLabel` (Corrente / Investimento / —) em vez de “Não definido”
- [x] T015 [US3] Em `backend/app/services/excel_io.py`, incluir coluna **Caixa** no preenchimento do export de NFs/Contas a Receber (append em memória se o template não tiver a coluna; valores Corrente / Investimento / vazio ou —)
- [x] T016 [US3] Em `backend/app/api/routes/nfs.py`, garantir que `GET /api/nfs/exportar-xlsx` passa `caixa` de cada registro para o writer do excel_io

**Checkpoint**: FR-010 / SC-007 — paridade CSV ↔ XLSX

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação ponta a ponta e qualidade

- [x] T017 Confirmar que merge Maggo em `backend/app/api/routes/nfs.py` ainda **preserva** `caixa` no sync (FR-009 / SC-006); corrigir só se houver regressão
- [x] T018 [P] Executar validação manual completa de [quickstart.md](./quickstart.md) (admin + visualizador + smoke 422/200)
- [x] T019 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — iniciar imediatamente
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as user stories
- **US1 (Phase 3)**: Depende da Phase 2 — MVP
- **US2 (Phase 4)**: Depende da Phase 2; pode rodar em paralelo com US1 se `NFs.tsx` for coordenado (mesmo arquivo → preferir sequencial US1 → US2)
- **US3 (Phase 5)**: Depende de US2 para rótulos de export alinhados (`caixaLabel`); backend XLSX pode começar após Phase 2 em paralelo
- **Polish (Phase 6)**: Após US1–US3 desejadas

### User Story Dependencies

| Story | Depende de | Independente para testar? |
|-------|------------|---------------------------|
| US1 (P1) | Phase 2 | Sim — classificar/pagar |
| US2 (P1) | Phase 2 | Sim — só listagem/rótulos |
| US3 (P2) | Phase 2 (+ US2 para labels CSV) | Sim — export com Caixa |

### Within Each User Story

- Backend de regra (Phase 2) antes da UI que depende do 422
- Modal Pagar (T008) antes de `confirmarPagamento` (T009)
- `caixaLabel` (T011) antes de CSV (T014)
- excel_io (T015) antes/junto do wire na rota (T016)

### Parallel Opportunities

- T002 ∥ T003 (inspeção frontend ∥ backend)
- T005 ∥ preparação mental de T004 (validator vs rota — T004 é o bloqueante)
- Após Phase 2: T015 (excel_io) pode avançar em paralelo com T007–T010 se outra pessoa cuidar do backend
- T018 ∥ T019 no polish

---

## Parallel Example: Após Foundational

```bash
# Dev A — UI classificação (US1) em NFs.tsx:
Task: "T007 validar salvar com pagamento sem caixa"
Task: "T008–T009 select Caixa no modal Pagar + PUT"

# Dev B — export XLSX (parte de US3) em excel_io + nfs.py:
Task: "T015 coluna Caixa no excel_io"
Task: "T016 wire exportar-xlsx"

# Em seguida sequencial no mesmo NFs.tsx:
Task: "T011–T013 rótulos listagem (US2)"
Task: "T014 CSV alinhado (US3)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup
2. Phase 2 Foundational (PUT 422) — crítico
3. Phase 3 US1 (editar + Pagar com Caixa)
4. **STOP e VALIDAR** via quickstart (smoke API + UI Pagar)
5. Seguir US2 → US3 → Polish

### Incremental Delivery

1. Setup + Foundational → API correta
2. US1 → classificar/obrigatoriedade (MVP)
3. US2 → listagem com “—”
4. US3 → export XLSX + CSV alinhado
5. Polish → sync Maggo + lint/type-check + quickstart completo

### Suggested MVP Scope

**US1 + Phase 2** (obrigatoriedade real na API e nos fluxos Editar/Pagar). US2 e US3 são rápidos e recomendados na mesma entrega, mas não bloqueiam o valor central.

---

## Notes

- Coluna `nfs.caixa` e UI básica já existem (007) — não recriar migration
- Não adicionar filtro por Caixa nem integração com Fluxo de Caixa
- Não migrar legados automaticamente; não bloquear listagem
- Commit após cada fase ou grupo lógico
- Evitar: tarefas vagas, endpoints novos desnecessários, alterar Dashboard/Fluxo de Caixa
