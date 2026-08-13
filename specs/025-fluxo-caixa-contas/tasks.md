# Tasks: Fluxo de Caixa — Conta Corrente e Conta Investimento

**Input**: Design documents from `/specs/025-fluxo-caixa-contas/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas agrupadas por história de usuário (P1 → P2).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Tipos de fluxo/conta alinhados ao data-model, sem ligar a página ainda

- [x] T001 Adicionar tipo `FluxoConta = 'corrente' | 'investimento'` e campo `conta?: FluxoConta` em `MovimentoManualOrigem` (e no tipo de movimento de tela se necessário) em `frontend/src/types/index.ts` conforme [data-model.md](./data-model.md)
- [x] T002 [P] Estender `fluxoMovimentosService.listar` / `criar` para `conta` em `frontend/src/services/api.ts` conforme [contracts/rest-fluxo-movimentos-conta.md](./contracts/rest-fluxo-movimentos-conta.md) (a API ainda pode ignorar até a Phase 2)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Persistir `conta` nos manuais e recortar automáticos no util — bloqueia as histórias

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T003 Incluir `conta = Column(String(20), nullable=False, default='corrente')` em `FluxoMovimento` em `backend/app/models/__init__.py`
- [x] T004 Adicionar `ALTER TABLE fluxo_movimentos ADD COLUMN IF NOT EXISTS conta VARCHAR(20) NOT NULL DEFAULT 'corrente'` no bloco de migrations runtime em `backend/app/main.py`
- [x] T005 Em `backend/app/api/routes/fluxo_movimentos.py`: filtrar GET por `conta`; incluir `conta` na resposta; POST validar `corrente` \| `investimento` (ausente ⇒ `corrente`; inválida ⇒ 400 pt-BR) conforme [contracts/rest-fluxo-movimentos-conta.md](./contracts/rest-fluxo-movimentos-conta.md)
- [x] T006 Exportar `fluxoDeReceber(caixa)` (`investimento` só se `caixa === 'investimento'`; senão `corrente`) e estender `mapearMovimentos(..., fluxo: FluxoConta)` em `frontend/src/utils/fluxoCaixaMovimentos.ts`: CR só se `fluxoDeReceber` = fluxo; CP só se fluxo = `corrente`; manuais só se `conta` (default corrente) = fluxo

**Checkpoint**: GET/POST manuais com `conta`; util recorta por fluxo; `FluxoCaixa.tsx` ainda mistura as duas contas na UI

---

## Phase 3: User Story 1 - Operar o fluxo Conta corrente por padrão (Priority: P1) 🎯 MVP

**Goal**: Abrir o Fluxo de Caixa em **Conta corrente**: card, tabela de saldos, gráfico, movimentos, totais e exportação só dessa conta; inclusão manual/saldo sem seletor, gravando corrente

**Independent Test**: Dados nas duas contas no período → abertura em Conta corrente; lista/totais/saldos/gráfico sem itens de investimento; visualizador lê sem escrever

### Implementation for User Story 1

- [x] T007 [US1] Estado `fluxoAtivo` inicial `'corrente'` e `useEffect` de `carregarDados` passando `conta` em `saldosService.listar` e `fluxoMovimentosService.listar` em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T008 [US1] Chamar `mapearMovimentos(..., fluxoAtivo)` e calcular totais só dessa lista em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T009 [US1] Recorte exclusivo de saldo: um card (último da conta ativa), tabela só dessa conta, gráfico com **uma** série, título/subtítulo do fluxo ativo — conforme [contracts/ui-fluxo-caixa-contas.md](./contracts/ui-fluxo-caixa-contas.md) em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T010 [US1] Remover `<select>` de conta dos modais de receita/despesa e de saldo; POST/PUT com `conta: fluxoAtivo` em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T011 [US1] Manter visualizador sem incluir/remover/registrar/importar CSV; CSV de movimentos só das linhas visíveis em `frontend/src/pages/FluxoCaixa.tsx`

**Checkpoint**: SC-001/SC-005 (abertura corrente; manual sem seletor). Investimento ainda não precisa ser selecionável

---

## Phase 4: User Story 2 - Operar o fluxo Conta investimento (Priority: P1)

**Goal**: Seletor troca para **Conta investimento** sem perder mês/ano; a visão exclusiva passa a ser só essa conta; F5 volta para corrente

**Independent Test**: Trocar para investimento → lista/saldos/gráfico/totais só investimento; incluir manual lá; voltar à corrente e o manual não aparece

### Implementation for User Story 2

- [x] T012 [US2] Seletor visível **Conta corrente** / **Conta investimento** (rótulos canônicos) que altera `fluxoAtivo` sem resetar mês/ano em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T013 [US2] Incluir `fluxoAtivo` nas deps de `carregarDados` (`useEffect`) em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T014 [US2] Confirmar que inclusão no fluxo investimento grava `conta: 'investimento'` e some ao voltar para corrente; visualizador troca o seletor só para leitura em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T015 [US2] Garantir que recarregar a página (sem persistir fluxo) volta `fluxoAtivo` para `'corrente'` em `frontend/src/pages/FluxoCaixa.tsx`

**Checkpoint**: SC-002/SC-007; US1 permanece o padrão de abertura

---

## Phase 5: User Story 3 - Classificar movimentos no fluxo certo (Priority: P2)

**Goal**: CR segue Caixa da origem; CR sem Caixa e CP pagas só na corrente; manual nunca migra sozinho

**Independent Test**: CR investimento só no fluxo investimento; CP paga só na corrente; CR sem Caixa só na corrente

### Implementation for User Story 3

- [x] T016 [US3] Conferir e ajustar `fluxoDeReceber` / `mapearMovimentos` para CR `caixa === 'investimento'` só em investimento e `caixa` null/`corrente` só em corrente em `frontend/src/utils/fluxoCaixaMovimentos.ts`
- [x] T017 [US3] Garantir CP paga **nunca** entra quando `fluxo === 'investimento'` (sem campo Caixa em Contas a Pagar) em `frontend/src/utils/fluxoCaixaMovimentos.ts`
- [x] T018 [US3] Estado vazio do fluxo ativo: totais zerados, sem puxar movimentos/saldos da outra conta, em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T019 [US3] Não adicionar PUT/reclassificação de `conta` em manuais em `backend/app/api/routes/fluxo_movimentos.py` nem seletor de conta de volta em `frontend/src/pages/FluxoCaixa.tsx`

**Checkpoint**: SC-003/SC-004; coluna Origem da 024 inalterada

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Lint, tipos e quickstart

- [x] T020 Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T021 Percorrer [quickstart.md](./quickstart.md) (smoke API + UI admin/visualizador) e corrigir gaps em `frontend/src/pages/FluxoCaixa.tsx` / `frontend/src/utils/fluxoCaixaMovimentos.ts` / `backend/app/api/routes/fluxo_movimentos.py` se falharem

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — BLOQUEIA as histórias
- **US1 (Phase 3)**: Depende da Phase 2 — MVP
- **US2 (Phase 4)**: Depende da US1 (mesmo seletor/página)
- **US3 (Phase 5)**: Depende do util da Phase 2; pode refinar depois da US1; na prática após US2 na mesma página
- **Polish (Phase 6)**: Depois das histórias desejadas

### User Story Dependencies

- **User Story 1 (P1)**: Depois da Phase 2 — MVP (visão corrente exclusiva)
- **User Story 2 (P1)**: Depois da US1 (seletor sobre a mesma tela)
- **User Story 3 (P2)**: Regras no util (T006) + conferência; independente para testar classificação, mas a UI de troca é a US2

### Parallel Opportunities

- T001 e T002 em paralelo
- T003 e T004 em sequência no backend (mesmo domínio; T004 depois de T003)
- T002 (frontend service) paralelo a T003–T005 (backend)
- US2 e US3 no mesmo `FluxoCaixa.tsx`: um executor por vez na página; T016/T017 no util podem ir em paralelo com T012 se T006 já existir

---

## Parallel Example: Foundational

```bash
# Frontend service (T002) enquanto o backend ganha a coluna:
Task: "Estender fluxoMovimentosService em frontend/src/services/api.ts"
Task: "FluxoMovimento.conta em backend/app/models/__init__.py"

# Depois da migration e da rota:
Task: "mapearMovimentos(..., fluxo) em frontend/src/utils/fluxoCaixaMovimentos.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (tipos + service)
2. Phase 2: Foundational (coluna `conta` + util recortado)
3. Phase 3: US1 — abertura só em Conta corrente
4. **STOP and VALIDATE**: quickstart passos 1–3 (sem exigir o seletor investimento)
5. Demo se pronto

### Incremental Delivery

1. Setup + Foundational
2. US1 → visão corrente exclusiva (MVP)
3. US2 → seletor investimento
4. US3 → conferência CR/CP/caixa vazio
5. Polish (lint + quickstart completo)

### Parallel Team Strategy

Um executor na prática (`FluxoCaixa.tsx` único). Backend (T003–T005) pode adiantar enquanto o frontend faz T001–T002.

---

## Notes

- [P] = arquivos diferentes, sem dependência incompleta
- Sem testes automatizados (spec não pediu)
- Não adicionar Caixa em Contas a Pagar
- Não persistir último fluxo em localStorage
- Validar T021 com backend reiniciado após o ALTER TABLE
