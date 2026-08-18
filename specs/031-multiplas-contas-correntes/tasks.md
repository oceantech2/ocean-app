# Tasks: Múltiplas contas correntes

**Input**: Design documents from `/specs/031-multiplas-contas-correntes/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/rest-contas-correntes.md](./contracts/rest-contas-correntes.md), [contracts/ui-multiplas-contas-correntes.md](./contracts/ui-multiplas-contas-correntes.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (P1 US1 → US2, depois P2 US3). Sem `[P]` quando o mesmo arquivo seria editado em paralelo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar o recorte; não criar app, menu nem portas novas

- [x] T001 Confirmar portas 8001/5193/5433 e que o cadastro vive em `frontend/src/pages/FluxoCaixa.tsx` (sem item de menu novo em `frontend/src/components/Layout.tsx`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tabela, modelo, REST e tipos — bloqueia todas as histórias

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Em `backend/app/main.py` (`_migrar`): criar `contas_correntes`; seed `codigo=corrente`, `nome=Conta corrente`, `banco=A definir`, `padrao=true`; índice único parcial em `LOWER(nome)` WHERE ativo; alargar `nfs.caixa` e `fluxo_movimentos.conta` para VARCHAR(64) conforme [data-model.md](./data-model.md)
- [x] T003 Adicionar modelo `ContaCorrente` e comentários de `caixa`/`conta` em `backend/app/models/__init__.py`
- [x] T004 [P] Schemas `ContaCorrenteCreate`/`Update`/`Response` e `caixa` da NF como string (não mais só Literal corrente|investimento) em `backend/app/schemas.py` conforme [contracts/rest-contas-correntes.md](./contracts/rest-contas-correntes.md)
- [x] T005 Criar `backend/app/api/routes/contas_correntes.py` (GET/POST/PUT, padrão única, recusa desativar última/padrão, nome+banco, auditoria) e `include_router` prefix `/api/contas-correntes` em `backend/app/main.py`
- [x] T006 [P] Tipo `ContaCorrente` e `FluxoConta` como string em `frontend/src/types/index.ts`; `NF.caixa` string
- [x] T007 `contasCorrentesService` e tipos de `conta`/`origem`/`destino` em `frontend/src/services/api.ts`

**Checkpoint**: API lista a seed; POST cria `cc_{id}`; frontend tipado; seletor ainda pode estar no enum antigo até US2

---

## Phase 3: User Story 1 - Cadastrar mais de uma conta corrente (Priority: P1) 🎯 MVP

**Goal**: Admin gerencia contas no Fluxo de Caixa (nome+banco; agência/número opcionais); visualizador só lê; segunda conta aparece no seletor

**Independent Test**: Abrir Gerenciar contas, criar segunda com nome e banco; as duas no seletor; recusar nome duplicado ou sem banco; visualizador não grava

### Implementation for User Story 1

- [x] T008 [US1] Ação **Gerenciar contas** (modal) em `frontend/src/pages/FluxoCaixa.tsx`: listar, criar, editar nome/banco/agência/número, tornar padrão, desativar com `confirm` e toast; admin vs visualizador conforme [contracts/ui-multiplas-contas-correntes.md](./contracts/ui-multiplas-contas-correntes.md)
- [x] T009 [US1] Incluir correntes ativas no seletor da mesma tela em `frontend/src/pages/FluxoCaixa.tsx` (rótulo = nome + Conta investimento) para o teste independente da US1

**Checkpoint**: SC-001; FR-001/FR-002/FR-004/FR-005

---

## Phase 4: User Story 2 - Operar cada conta corrente no Fluxo de Caixa (Priority: P1)

**Goal**: Visão exclusiva por codigo; abertura na padrão; CP só na padrão; investimento isolado

**Independent Test**: Com duas correntes e movimentos, A não vaza em B; investimento isolado; F5 volta para a padrão

### Implementation for User Story 2

- [x] T010 [US2] Parametrizar `fluxoDeReceber`, `contaManual`, mapa de movimentos e `saldoVisivel` por codigo; CP somente se fluxo ativo = codigo da padrão em `frontend/src/utils/fluxoCaixaMovimentos.ts`
- [x] T011 [US2] Abrir no codigo `padrao`; recorte exclusivo (card, gráfico, tabela de saldos, lista, totais, exportação) em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T012 [US2] Validar query `conta` e filtro de listagem por codigo ativo ∪ `investimento` em `backend/app/api/routes/fluxo_movimentos.py` e `backend/app/api/routes/saldos.py` se ainda restringirem o enum antigo

**Checkpoint**: SC-002, SC-003, SC-008; FR-006/FR-007/FR-014

---

## Phase 5: User Story 3 - Automáticos na padrão, reclassificar NF e transferir (Priority: P2)

**Goal**: Receber/pagar sem escolher conta (sempre padrão); editar caixa na NF recebida; transferência entre qualquer par; dashboard um card somado

**Independent Test**: NF e CP na padrão; reclassificar NF para a segunda corrente sem duplicar; transferir A→B; dashboard um card = soma

### Implementation for User Story 3

- [x] T013 [US3] No receber (1º `data_pagamento`) gravar `caixa` da padrão e ignorar body; no PUT de NF já recebida aceitar `caixa` (corrente ativa ou investimento) em `backend/app/api/routes/nfs.py` (remover o `pop("caixa")` cego)
- [x] T014 [US3] Sem seletor de caixa ao marcar recebido; campo Caixa só com NF já recebida (admin) em `frontend/src/pages/NFs.tsx`
- [x] T015 [US3] Origem/destino de transferência: codigos de correntes ativas ∪ `investimento`; descrição de/para com **nome** em `backend/app/api/routes/fluxo_movimentos.py`
- [x] T016 [US3] Modal Transferência com a mesma lista de caixas (nomes) em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T017 [P] [US3] Card único de conta corrente = soma dos `saldoVisivel` das correntes ativas em `frontend/src/pages/Dashboard.tsx`; card investimento inalterado

**Checkpoint**: SC-004 a SC-007, SC-009, SC-010; FR-008 a FR-012, FR-015

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Texto de navegação e validação ponta a ponta

- [x] T018 [P] Atualizar descrição do item Fluxo de Caixa em `frontend/src/components/Layout.tsx` se ainda disser só “Saldo corrente e investimento”
- [x] T019 Percorrer [quickstart.md](./quickstart.md); `npm run lint` e `npm run type-check` em `frontend`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup — **bloqueia** as histórias
- **US1 (Phase 3)**: após Phase 2 — MVP
- **US2 (Phase 4)**: após US1 (precisa de N contas no seletor)
- **US3 (Phase 5)**: após US2 (mapa de movimentos por codigo)
- **Polish (Phase 6)**: após as histórias desejadas

### User Story Dependencies

- **US1 (P1)**: após Phase 2
- **US2 (P1)**: após US1
- **US3 (P2)**: após US2

### Parallel Opportunities

- T004 e T006 após T002/T003
- T017 (dashboard) em paralelo a T014–T016 se o util da US2 já existir
- T018 em paralelo ao restante do polish

### Parallel Example: Foundational

```bash
# Depois de T002 e T003:
Task: "Schemas em backend/app/schemas.py"
Task: "Tipos em frontend/src/types/index.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + 2
2. Phase 3 (US1) — gerenciar contas e segunda conta no seletor
3. **STOP** e validar SC-001

### Incremental Delivery

1. US1 → cadastro
2. US2 → operar cada caixa
3. US3 → padrão / reclassificar / transferir / dashboard
4. Quickstart

---

## Notes

- `[P]` só com arquivos diferentes
- Contas a Receber = NFs (`/contas-receber` → `/nfs`)
- Investimento não entra em `contas_correntes`
- Validação: [quickstart.md](./quickstart.md)
