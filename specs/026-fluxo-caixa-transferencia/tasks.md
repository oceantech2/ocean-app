# Tasks: Fluxo de Caixa — Transferência entre Caixas

**Input**: Design documents from `/specs/026-fluxo-caixa-transferencia/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas agrupadas por história de usuário (P1 → P2).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Tipos e cliente HTTP alinhados ao contrato, sem ligar a página ainda

- [x] T001 Estender `OrigemMovimentoFluxo` com `'transferencia'`, `origem_rotulo` com `'Transferência'`, e `par_id?: string | null` em `MovimentoFluxo` / tipo de manual em `frontend/src/types/index.ts` conforme [data-model.md](./data-model.md)
- [x] T002 [P] Adicionar `fluxoMovimentosService.listar` sem mês/ano (conta opcional) e métodos `transferir` / `desfazerTransferencia(parId)` em `frontend/src/services/api.ts` conforme [contracts/rest-fluxo-transferencias.md](./contracts/rest-fluxo-transferencias.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Persistir `par_id`, criar/apagar o par atômico e mapear Transferência no util — bloqueia as histórias

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T003 Incluir `par_id = Column(String(36), nullable=True, index=True)` em `FluxoMovimento` em `backend/app/models/__init__.py`
- [x] T004 Adicionar `ALTER TABLE fluxo_movimentos ADD COLUMN IF NOT EXISTS par_id VARCHAR(36)` no bloco de migrations runtime em `backend/app/main.py`
- [x] T005 Em `backend/app/api/routes/fluxo_movimentos.py`: serializar `par_id`; POST `/` de transferência **não** é esta tarefa — implementar no mesmo router (ou include) **POST `/api/fluxo-transferencias`** (par atômico, descrições de/para, 400 pt-BR se origem=destino / valor ≤ 0) e **DELETE `/api/fluxo-transferencias/{par_id}`** (204/404); DELETE `/fluxo-movimentos/{id}` retorna 400 se `par_id` preenchido — registrar rota em `backend/app/main.py` se o prefixo for router separado, conforme [contracts/rest-fluxo-transferencias.md](./contracts/rest-fluxo-transferencias.md)
- [x] T006 Em `frontend/src/utils/fluxoCaixaMovimentos.ts`: se `par_id` então `origem='transferencia'` e `origem_rotulo='Transferência'`; exportar `saldoVisivel(conta, saldos, movimentosSinalizados)` = último histórico (ano, mes, data_registro) + movimentos com data &gt; data_registro (ou 0 + todos) conforme [data-model.md](./data-model.md)

**Checkpoint**: API cria/desfaz par; GET lista `par_id`; util classifica Transferência e calcula saldo visível; UI ainda tem receita/despesa/saldo

---

## Phase 3: User Story 1 - Transferir valor entre caixas em uma ação (Priority: P1) 🎯 MVP

**Goal**: Admin usa **Transferência**; um valor vira saída na origem e entrada no destino; card/teto usam saldo visível; visualizador não cria

**Independent Test**: Transferir 100 da corrente para investimento → saída/entrada iguais, cards atualizam; valor &gt; teto recusa; visualizador sem botão

### Implementation for User Story 1

- [x] T007 [US1] Carregar manuais da conta ativa (período, lista) **e** manuais sem mês/ano por conta (card/teto); carregar saldos da conta para achar o último histórico — em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T008 [US1] Substituir o valor do card pelo `saldoVisivel` do fluxo ativo (não o saldo cru da tabela) em `frontend/src/pages/FluxoCaixa.tsx` conforme [contracts/ui-fluxo-caixa-transferencia.md](./contracts/ui-fluxo-caixa-transferencia.md)
- [x] T009 [US1] Botão **Transferência** (só admin) + modal origem/destino/data/valor/observação (origem = fluxo ativo, destino = a outra); recusar no cliente se valor &gt; saldo visível da origem, ≤ 0 ou origem=destino; POST `transferir`; toast; recarregar — em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T010 [US1] Passar `par_id` em `mapearMovimentos` / manuais e chamar o mapa com os campos novos em `frontend/src/utils/fluxoCaixaMovimentos.ts` e `frontend/src/pages/FluxoCaixa.tsx`
- [x] T011 [US1] Ação **Desfazer** em linha com `par_id` (confirm) chamando `desfazerTransferencia`; MUST NOT usar DELETE do `id` da perna — em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T012 [US1] Visualizador: sem botão Transferência e sem Desfazer, em `frontend/src/pages/FluxoCaixa.tsx`

**Checkpoint**: SC-002/SC-003/SC-004/SC-006 (par, teto, visualizador). Botões antigos ainda podem estar na tela até a US2

---

## Phase 4: User Story 2 - Remover inclusão avulsa de receita, despesa e saldo (Priority: P1)

**Goal**: Sumir Incluir receita/despesa, Registrar saldo, Importar CSV e Editar/Deletar na tabela de saldos; tabela histórica só consulta; CR/CP e manuais legados permanecem

**Independent Test**: Admin não encontra as três ações nem CSV/edição de saldo; lista automática e manuais antigos continuam

### Implementation for User Story 2

- [x] T013 [US2] Remover botões Incluir receita, Incluir despesa e Registrar saldo e os handlers/modais só usados por eles em `frontend/src/pages/FluxoCaixa.tsx` conforme [contracts/ui-fluxo-caixa-transferencia.md](./contracts/ui-fluxo-caixa-transferencia.md)
- [x] T014 [US2] Remover Importar CSV, componente `ImportCSV` desta página, e botões Editar/Deletar da tabela de saldos; manter a tabela e o gráfico como consulta em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T015 [US2] Manter **Remover** só em Origem **Manual** (`par_id` nulo); CR/CP intactos via `mapearMovimentos` em `frontend/src/pages/FluxoCaixa.tsx` e `frontend/src/utils/fluxoCaixaMovimentos.ts`

**Checkpoint**: SC-001; US1 (Transferência) continua sendo a única escrita nova

---

## Phase 5: User Story 3 - Conferir origem, valor e impacto nos dois caixas (Priority: P2)

**Goal**: Lista/exportação mostram Origem **Transferência** e texto de/para; totais do fluxo ativo somam só um lado

**Independent Test**: No fluxo origem: Saída + para destino; no destino: Entrada + de origem; CSV alinhado; totais não dobram

### Implementation for User Story 3

- [x] T016 [US3] Garantir descrições canônicas na API (`Transferência para …` / `Transferência de …` + observação) em `backend/app/api/routes/fluxo_movimentos.py` (ou router de transferências) conforme [contracts/rest-fluxo-transferencias.md](./contracts/rest-fluxo-transferencias.md)
- [x] T017 [US3] Exportar CSV com Origem **Transferência** e descrição visível (de/para) só das linhas do fluxo ativo em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T018 [US3] Conferir totais entradas/saídas/resultado usando apenas `mapearMovimentos` do fluxo ativo (um lado da transferência) em `frontend/src/pages/FluxoCaixa.tsx`

**Checkpoint**: SC-007; US1/US2 inalteradas

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Lint, tipos e quickstart

- [x] T019 Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T020 Percorrer [quickstart.md](./quickstart.md) (smoke API + UI admin/visualizador, inclusive DELETE de perna → 400) e corrigir gaps em `frontend/src/pages/FluxoCaixa.tsx` / `frontend/src/utils/fluxoCaixaMovimentos.ts` / `backend/app/api/routes/fluxo_movimentos.py` / `backend/app/main.py` se falharem

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — BLOQUEIA as histórias
- **US1 (Phase 3)**: Depende da Phase 2 — MVP
- **US2 (Phase 4)**: Mesma página que US1; fazer depois da US1 para não ficar sem escrita
- **US3 (Phase 5)**: Refina lista/CSV/descrição; após US1 (precisa do par visível)
- **Polish (Phase 6)**: Depois das histórias desejadas

### User Story Dependencies

- **User Story 1 (P1)**: Depois da Phase 2 — MVP (transferir + card + teto)
- **User Story 2 (P1)**: Depois da US1 (remove caminhos antigos na mesma tela)
- **User Story 3 (P2)**: Depois da US1 (conferência/exportação)

### Within Each User Story

- Modelo/rota antes da UI que consome
- Card/teto antes do modal (T008 antes de T009)
- Desfazer depois do mapa com `par_id` (T010 antes de T011)

### Parallel Opportunities

- T001 e T002 (arquivos diferentes)
- T003 pode adiantar em paralelo com T001/T002; T004/T005 sequenciais após T003
- T016 (backend descrição) em paralelo com T017/T018 se o POST já gravar texto na Phase 2 — senão T016 antes
- US2 e US3 **não** em paralelo no mesmo `FluxoCaixa.tsx` sem coordenação

---

## Parallel Example: Setup

```bash
Task: "Estender tipos em frontend/src/types/index.ts"
Task: "Estender fluxoMovimentosService em frontend/src/services/api.ts"
```

## Parallel Example: User Story 3 (após T016 ou se descrição já estiver na T005)

```bash
Task: "CSV Origem Transferência em frontend/src/pages/FluxoCaixa.tsx"
Task: "Totais só um lado em frontend/src/pages/FluxoCaixa.tsx"
```

> Na prática T017 e T018 tocam o mesmo arquivo — executar em sequência.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2
2. Phase 3 (US1)
3. **STOP**: smoke POST par + UI transferência + teto + visualizador
4. Seguir US2 para cumprir o pedido de remover botões

### Incremental Delivery

1. Setup + Foundational
2. US1 → demo transferência
3. US2 → tela sem receita/despesa/saldo/CSV
4. US3 → conferência/CSV
5. Polish / quickstart

---

## Notes

- [P] = arquivos diferentes, sem dependência incompleta
- Sem tarefas de teste automatizado
- Commit por tarefa ou grupo lógico, só se o usuário pedir
- Validar no checkpoint da história com [quickstart.md](./quickstart.md)
