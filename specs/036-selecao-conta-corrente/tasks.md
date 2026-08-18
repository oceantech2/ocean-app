# Tasks: Seleção de conta corrente

**Input**: Design documents from `/specs/036-selecao-conta-corrente/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/rest-selecao-conta-corrente.md](./contracts/rest-selecao-conta-corrente.md), [contracts/ui-selecao-conta-corrente.md](./contracts/ui-selecao-conta-corrente.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (todas P1: US1 → US2 → US3). Sem `[P]` quando o mesmo arquivo seria editado em paralelo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar o recorte; não criar app, menu nem portas novas

- [x] T001 Confirmar que Contas a Receber e NFs são a mesma tela (`frontend/src/pages/NFs.tsx`, rota `/nfs` em `frontend/src/App.tsx`) e que portas 8001/5193/5433 permanecem; cadastro de contas continua na 031 (`frontend/src/pages/FluxoCaixa.tsx`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Coluna `caixa` em pagar, validador só de corrente, tipos — bloqueia todas as histórias

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Em `backend/app/main.py` (`_migrar`): `ALTER TABLE contas_pagar ADD COLUMN IF NOT EXISTS caixa VARCHAR(64)` conforme [data-model.md](./data-model.md)
- [x] T003 Campo `caixa` em `ContaPagar` em `backend/app/models/__init__.py`
- [x] T004 `exigir_conta_corrente` (codigo de corrente **ativa**, recusa `investimento`) em `backend/app/services/caixas.py`; manter `exigir_caixa` para transferência
- [x] T005 [P] `caixa` em `ContaPagarCreate`/`Update`/`Response` em `backend/app/schemas.py` conforme [contracts/rest-selecao-conta-corrente.md](./contracts/rest-selecao-conta-corrente.md)
- [x] T006 [P] Campo `caixa` em `ContaPagar` em `frontend/src/types/index.ts`

**Checkpoint**: Modelo e tipos prontos; API de NF/pagar ainda pode forçar padrão até US1

---

## Phase 3: User Story 1 - Escolher a conta corrente no recebimento e no pagamento (Priority: P1) 🎯 MVP

**Goal**: Admin escolhe conta corrente (só ativas, sem investimento) ao receber NF/Contas a Receber e ao pagar Contas a Pagar; movimento cai só no fluxo escolhido; visualizador não altera

**Independent Test**: Com duas correntes, receber uma NF e pagar uma conta na conta B; entradas/saídas só no fluxo B, não na padrão; select sem investimento; inicial = padrão

### Implementation for User Story 1

- [x] T007 [US1] Aceitar `caixa` de corrente ativa no `POST /nfs` e no primeiro recebimento/`PUT` em `backend/app/api/routes/nfs.py` (omitido → padrão; investimento/inativa → 400) conforme [contracts/rest-selecao-conta-corrente.md](./contracts/rest-selecao-conta-corrente.md)
- [x] T008 [US1] Persistir `caixa` obrigatório ao pagar (criar já paga, PUT, ação pagar) e limpar ao desmarcar pago em `backend/app/api/routes/contas.py`
- [x] T009 [US1] `fluxoDePagar` e espelho de Contas a Pagar pelo codigo (legado `null` → padrão) em `frontend/src/utils/fluxoCaixaMovimentos.ts` — deixar de filtrar CP só quando `fluxo === padrao`
- [x] T010 [US1] Campo **Conta corrente** no receber (formulário e modal Recebido) em `frontend/src/pages/NFs.tsx`: opções = correntes ativas pelo nome, sem investimento, pré-seleção padrão, envio no POST/PUT, visualizador somente leitura conforme [contracts/ui-selecao-conta-corrente.md](./contracts/ui-selecao-conta-corrente.md)
- [x] T011 [US1] Campo **Conta corrente** no pagar (formulário e ação pagar) em `frontend/src/pages/Contas.tsx`: mesmas regras da US1; admin grava, visualizador não

**Checkpoint**: SC-002; FR-001/FR-002/FR-003/FR-004; US1 testável sem coluna na tabela

---

## Phase 4: User Story 2 - Ver a conta corrente na listagem (Priority: P1)

**Goal**: Coluna e exportação com o nome da conta em NFs/Receber e Contas a Pagar; pendente = “—”

**Independent Test**: Itens na padrão e na segunda corrente; nomes na tabela e no CSV/XLSX; pendente “—”; visualizador vê e não edita

### Implementation for User Story 2

- [x] T012 [US2] Coluna **Conta corrente** na tabela de `frontend/src/pages/NFs.tsx` (nome pelo codigo; `null` → “—”; legado investimento → “Conta investimento”) e incluir o texto nas exportações CSV/XLSX dessa página
- [x] T013 [US2] Coluna **Conta corrente** e exportação em `frontend/src/pages/Contas.tsx` com as mesmas regras
- [x] T014 [US2] Se a exportação XLSX de NFs/contas for gerada no backend, incluir a coluna em `backend/app/services/excel_io.py` (e rotas de export se existirem) alinhada à tela

**Checkpoint**: SC-001 (listagem), SC-003; FR-005/FR-006

---

## Phase 5: User Story 3 - Escolher contas na transferência (Priority: P1)

**Goal**: Origem e destino em listas (correntes ativas + investimento); sem Inverter; par inicial FR-011

**Independent Test**: Abrir Transferência numa corrente → destino investimento; no investimento → destino padrão; transferir A→B; origem=destino recusado; sem botão Inverter; visualizador sem Transferência

### Implementation for User Story 3

- [x] T015 [US3] Remover botão e função `inverterPar` em `frontend/src/pages/FluxoCaixa.tsx`; manter os dois selects (correntes ativas + Conta investimento)
- [x] T016 [US3] Ao abrir o modal, aplicar par inicial: origem = `fluxoAtivo`; destino = `investimento` se origem for corrente, senão destino = codigo da padrão, em `frontend/src/pages/FluxoCaixa.tsx` conforme FR-011 e [contracts/ui-selecao-conta-corrente.md](./contracts/ui-selecao-conta-corrente.md)

**Checkpoint**: SC-004, SC-005; FR-007/FR-008/FR-011; REST de transferência já vigente (031)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Consistência e validação ponta a ponta

- [x] T017 Confirmar que selects de origem (NFs/Contas) **não** listam correntes inativas nem investimento; transferência **não** lista correntes inativas em `frontend/src/pages/NFs.tsx`, `frontend/src/pages/Contas.tsx` e `frontend/src/pages/FluxoCaixa.tsx` (FR-010)
- [x] T018 [P] Executar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T019 Percorrer os passos de [quickstart.md](./quickstart.md)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependência
- **Foundational (Phase 2)**: Depende do Setup — BLOQUEIA as histórias
- **US1 (Phase 3)**: Depende da Phase 2 — MVP
- **US2 (Phase 4)**: Depende da US1 (mesmo `caixa` e mesmas páginas)
- **US3 (Phase 5)**: Depende da Phase 2; independente da US2 (pode seguir após US1)
- **Polish (Phase 6)**: Depende das histórias desejadas

### User Story Dependencies

- **User Story 1 (P1)**: Após Phase 2
- **User Story 2 (P1)**: Após US1 (coluna nas mesmas telas)
- **User Story 3 (P1)**: Após Phase 2; não precisa da coluna da US2

### Within Each User Story

- Backend (persistência/validação) antes da UI da mesma história
- Espelho no fluxo (`fluxoCaixaMovimentos.ts`) antes de validar o teste independente da US1
- Sem tarefas de teste automatizado (não pedidas)

### Parallel Opportunities

- T005 e T006 após T003/T004
- T007 e T008 em arquivos diferentes após Phase 2
- T018 paralelo a revisão visual T017

---

## Parallel Example: User Story 1

```bash
# Depois da Phase 2:
Task: "Aceitar caixa no POST/PUT de NF em backend/app/api/routes/nfs.py"
Task: "Persistir caixa ao pagar em backend/app/api/routes/contas.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2
2. Phase 3 (US1)
3. **STOP and VALIDATE**: receber e pagar na conta B
4. Seguir US2 (coluna) e US3 (transferência)

### Incremental Delivery

1. Setup + Foundational
2. US1 → demo escolha no receber/pagar
3. US2 → demo listagem/export
4. US3 → demo transferência sem Inverter
5. Polish + quickstart

---

## Notes

- [P] = arquivos diferentes, sem dependência incompleta
- Receber = `NFs.tsx`; não criar segunda página
- Validação: [quickstart.md](./quickstart.md)
- Não alterar portas, autenticação nem CRUD de `contas_correntes` (031)
