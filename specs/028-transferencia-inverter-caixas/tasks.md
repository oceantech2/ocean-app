# Tasks: Fluxo de Caixa — Inverter origem e destino da transferência

**Input**: Design documents from `/specs/028-transferencia-inverter-caixas/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/ui-fluxo-caixa-inverter-transferencia.md](./contracts/ui-fluxo-caixa-inverter-transferencia.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas agrupadas por história (P1 → P2). Quase tudo em um arquivo: sem `[P]` nas histórias (mesmo `FluxoCaixa.tsx`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Página: `frontend/src/pages/FluxoCaixa.tsx`
- Sem backend nesta feature

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar helpers já existentes; não criar arquivos novos

- [x] T001 Confirmar `rotuloFluxo`, `outraConta`, `transfForm`, `abrirTransferencia` e `salvarTransferencia` em `frontend/src/pages/FluxoCaixa.tsx` (não alterar API em `frontend/src/services/api.ts` nem `backend/app/api/routes/fluxo_movimentos.py`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Função de swap do par, preservando valor/data/observação — bloqueia as histórias

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Em `frontend/src/pages/FluxoCaixa.tsx`, adicionar handler (ex. `inverterPar`) que faz `origem` ↔ `destino` via `setTransfForm`, copiando `valor`, `data_movimento` e `observacao` sem resetar para `TRANSF_INICIAL`, conforme [data-model.md](./data-model.md)

**Checkpoint**: Swap existe no estado; o modal ainda pode ter os dois `<select>`

---

## Phase 3: User Story 1 - Ver o par e inverter origem e destino em um gesto (Priority: P1) 🎯 MVP

**Goal**: Origem e destino em texto somente leitura; botão **Inverter** troca os papéis; sem listas

**Independent Test**: Abrir Transferência, anotar o par, acionar **Inverter** (e de novo); textos trocam; valor/data/observação permanecem; clique nos nomes não inverte; não há `<select>` de origem/destino

### Implementation for User Story 1

- [x] T003 [US1] Remover os dois `<select>` de Origem e Destino do modal Transferência em `frontend/src/pages/FluxoCaixa.tsx` conforme [contracts/ui-fluxo-caixa-inverter-transferencia.md](./contracts/ui-fluxo-caixa-inverter-transferencia.md)
- [x] T004 [US1] Exibir Origem e Destino como texto somente leitura com `rotuloFluxo(transfForm.origem)` e `rotuloFluxo(transfForm.destino)` em `frontend/src/pages/FluxoCaixa.tsx` (sem `onClick` que altere o par)
- [x] T005 [US1] Incluir botão com o texto **Inverter** no bloco do par, chamando o handler de T002, em `frontend/src/pages/FluxoCaixa.tsx`

**Checkpoint**: SC-001/SC-002/SC-003/SC-005 (par visível + Inverter). Confirmar ainda usa o POST 026

---

## Phase 4: User Story 2 - Confirmar a transferência no sentido visível (Priority: P1)

**Goal**: Confirmar grava o par mostrado após **Inverter**; saldo visível da origem acompanha a origem atual

**Independent Test**: Inverter o padrão, confirmar valor válido → saída no caixa mostrado como origem e entrada no destino; subtítulo do saldo muda ao inverter; visualizador sem Transferência

### Implementation for User Story 2

- [x] T006 [US2] Garantir que o subtítulo “Saldo visível da origem” usa `saldoDaOrigem(transfForm.origem)` após o swap em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T007 [US2] Manter `salvarTransferencia` lendo `transfForm.origem` / `transfForm.destino` atuais (teto, POST `transferir`); não alterar payload nem `frontend/src/services/api.ts` — em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T008 [US2] Confirmar que visualizador continua sem botão Transferência (logo sem **Inverter**) em `frontend/src/pages/FluxoCaixa.tsx`

**Checkpoint**: SC-004 e papéis 026; US1 continua invertendo só no cliente

---

## Phase 5: User Story 3 - Abrir a transferência já com um sentido coerente (Priority: P2)

**Goal**: Ao abrir, origem = fluxo ativo e destino = o outro caixa; fechar/reabrir descarta a última inversão

**Independent Test**: Fluxo corrente → abrir = corrente→investimento; fluxo investimento → o inverso; fechar após Inverter e reabrir volta ao padrão

### Implementation for User Story 3

- [x] T009 [US3] Manter `abrirTransferencia` com `origem: fluxoAtivo` e `destino: outraConta(fluxoAtivo)` (reset do formulário ao abrir) em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T010 [US3] Garantir que Cancelar/fechar não persiste o par invertido: próxima abertura usa de novo T009 em `frontend/src/pages/FluxoCaixa.tsx`

**Checkpoint**: FR-008; invariante origem ≠ destino só pela UI (destino sempre o outro)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Lint, tipos e roteiro de validação

- [x] T011 Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T012 Percorrer [quickstart.md](./quickstart.md); confirmar que `backend/app/api/routes/fluxo_movimentos.py` não foi modificado nesta feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependência
- **Foundational (Phase 2)**: Depende do Setup — BLOQUEIA as histórias
- **US1 (Phase 3)**: Depende da Phase 2 — MVP
- **US2 (Phase 4)**: Depende da US1 (mesmo modal; Confirmar precisa do par em texto)
- **US3 (Phase 5)**: Depende da US1 (abertura do mesmo modal)
- **Polish (Phase 6)**: Depois das histórias desejadas

### User Story Dependencies

- **User Story 1 (P1)**: Depois da Phase 2 — MVP
- **User Story 2 (P1)**: Depois da US1 — Confirmar/teto no par invertido
- **User Story 3 (P2)**: Depois da US1 — defaults de abertura; não bloqueia o gesto Inverter

### Parallel Opportunities

- Nenhuma tarefa `[P]`: um único arquivo de implementação
- Executar **em sequência** T001 → T012

### Parallel Example: User Story 1

Não aplicável (T003–T005 no mesmo `frontend/src/pages/FluxoCaixa.tsx`).

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + 2 (handler de swap)
2. Phase 3: textos + **Inverter**
3. **STOP**: validar Independent Test da US1
4. Seguir US2 (gravação) e US3 (abertura)

### Incremental Delivery

1. Setup + Foundational → swap no estado
2. US1 → demo do gesto
3. US2 → confirmar sentido visível
4. US3 → defaults ao abrir
5. Polish → lint + quickstart

### Parallel Team Strategy

Um desenvolvedor; não paralelizar histórias no mesmo arquivo.

---

## Notes

- Sem testes automatizados (não pedidos na spec)
- Não reintroduzir `<select>` de origem/destino
- Não tornar os rótulos clicáveis para inverter
- Não alterar REST da 026
