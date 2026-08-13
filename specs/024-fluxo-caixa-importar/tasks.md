# Tasks: Fluxo de Caixa — Importar Contas a Receber e Contas a Pagar

**Input**: Design documents from `/specs/024-fluxo-caixa-importar/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas agrupadas por história de usuário (P1 → P2).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Esqueleto tipado do movimento de tela e do util de montagem (sem ligar a página ainda)

- [x] T001 Adicionar tipo `MovimentoFluxo` (`id`, `data`, `tipo`, `origem`, `origem_rotulo`, `desc`, `valor`, `manual`, `movId?`) em `frontend/src/types/index.ts` conforme [data-model.md](./data-model.md)
- [x] T002 [P] Criar esqueleto exportando tipos/funções vazias (`noPeriodoPagamento`, `elegivelReceber`, `elegivelPagar`, `mapearMovimentos`) em `frontend/src/utils/fluxoCaixaMovimentos.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Regras canônicas de inclusão, recorte por data de pagamento e mapeamento 1 origem → 1 linha

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T003 Implementar `noPeriodoPagamento(data, mes, ano)` (ano obrigatório; mês vazio = todos os meses do ano) em `frontend/src/utils/fluxoCaixaMovimentos.ts`
- [x] T004 Implementar `elegivelReceber` (paga, `data_pagamento`, não arquivada, `valor_liquido > 0`) e `elegivelPagar` (pago, `data_pagamento`, `valor > 0`) em `frontend/src/utils/fluxoCaixaMovimentos.ts`
- [x] T005 Implementar `mapearMovimentos(nfs, contas, manuais, mes, ano)` gerando `MovimentoFluxo[]` com ids `receber-{id}` / `pagar-{id}` / `mov-{id}`, rótulos **Contas a Receber** / **Contas a Pagar** / **Manual**, descrições FR-006 e sem fundir manual com origem em `frontend/src/utils/fluxoCaixaMovimentos.ts`

**Checkpoint**: Util puro cobre inclusão/período/identidade; `FluxoCaixa.tsx` ainda usa a montagem antiga

---

## Phase 3: User Story 1 - Ver recebimentos e pagamentos no Fluxo de Caixa (Priority: P1) 🎯 MVP

**Goal**: Ao abrir ou mudar mês/ano, o caixa lista entradas de Contas a Receber recebidas e saídas de Contas a Pagar pagas do período, com totais, sem botão de importar CR/CP

**Independent Test**: Uma CR recebida e uma CP paga no período → duas linhas (entrada/saída) com data de pagamento e valores da origem ao abrir o Fluxo; visualizador vê o mesmo sem Importar CSV / incluir receita

### Implementation for User Story 1

- [x] T006 [US1] Paginar `nfsService.listar` (`status_filtro=paga`, `incluir_arquivadas=false`, **sem** `mes`/`ano`, `limit=1000` até página vazia) e `contasService.listar` (`pago=true`, mesmo teto) em `carregarDados` de `frontend/src/pages/FluxoCaixa.tsx` conforme [contracts/rest-leitura-fluxo.md](./contracts/rest-leitura-fluxo.md)
- [x] T007 [US1] Substituir `movimentosAutoEntrada` / `movimentosAutoSaida` / `todosMovimentos` por `mapearMovimentos` em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T008 [US1] Totais de entradas/saídas/resultado só a partir da lista mapeada (sem contar o mesmo `id` duas vezes) em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T009 [US1] Garantir que não existe botão de importar Contas a Receber/Pagar; manter **↑ Importar CSV** só como modal “Saldos via CSV” em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T010 [US1] Se GET de NFs ou contas falhar: toast de erro, listas automáticas vazias, sem totais automáticos inventados; manuais só se `fluxoMovimentosService` tiver sucesso em `frontend/src/pages/FluxoCaixa.tsx`

**Checkpoint**: US1 cobre SC-001/SC-002/SC-005/SC-006 (espelho ao filtrar; pendentes fora; visualizador sem importar CR/CP)

---

## Phase 4: User Story 2 - Permanecer alinhado às origens sem duplicar (Priority: P1)

**Goal**: Reabrir/refiltrar não duplica; origem alterada ou pendente de novo atualiza o espelho; manuais intactos; automático sem omitir/remover

**Independent Test**: Reabrir o período → uma linha por origem; voltar CP a pendente → saída some e o manual permanece; automático sem botão Remover

### Implementation for User Story 2

- [x] T011 [US2] Usar `key={mov.id}` estável (`receber-` / `pagar-` / `mov-`) na tabela de movimentos em `frontend/src/pages/FluxoCaixa.tsx` (sem gerar id novo a cada render)
- [x] T012 [US2] Exibir **Remover** apenas se `mov.manual && papel === 'admin'`; confirmar que automático não tem ocultar/excluir em `frontend/src/pages/FluxoCaixa.tsx`
- [x] T013 [US2] Manter create/delete só via `fluxoMovimentosService` para manuais; recarregar período após mutação de origem (usuário volta à página) sem apagar manuais em `frontend/src/pages/FluxoCaixa.tsx`

**Checkpoint**: US1 continua válida; SC-003/SC-004/SC-009 cobertos na UI

---

## Phase 5: User Story 3 - Distinguir origem e consultar no período (Priority: P2)

**Goal**: Coluna **Origem** canônica; CSV com Origem; recorte mês/ano pela data de pagamento (já no util)

**Independent Test**: Três origens na lista com rótulos corretos; export inclui Origem; mudar o mês some o que não é daquele pagamento

### Implementation for User Story 3

- [x] T014 [US3] Incluir coluna ordenável **Origem** (`origem_rotulo`) entre Tipo e Descrição na tabela de movimentos em `frontend/src/pages/FluxoCaixa.tsx` conforme [contracts/ui-fluxo-caixa-movimentos.md](./contracts/ui-fluxo-caixa-movimentos.md)
- [x] T015 [US3] Remover legenda “✦ = lançamento manual” e o sufixo `✦` da descrição dos manuais em `frontend/src/pages/FluxoCaixa.tsx` e em `mapearMovimentos` de `frontend/src/utils/fluxoCaixaMovimentos.ts`
- [x] T016 [US3] Exportar CSV com colunas Data, Tipo, Origem, Descrição, Valor (rótulos da tela), ordenado por Data, em `frontend/src/pages/FluxoCaixa.tsx`

**Checkpoint**: SC-007/SC-008; filtro de período da US1 permanece

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Conferência final alinhada ao quickstart

- [x] T017 Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T018 Percorrer os passos de [quickstart.md](./quickstart.md) (admin + visualizador) e corrigir gaps em `frontend/src/pages/FluxoCaixa.tsx` / `frontend/src/utils/fluxoCaixaMovimentos.ts` se falharem

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — BLOQUEIA as histórias
- **US1 (Phase 3)**: Depende da Phase 2 — MVP
- **US2 (Phase 4)**: Depende da US1 (mesma tabela; Remover/ids)
- **US3 (Phase 5)**: Depende da US1 (coluna/export sobre a lista já mapeada)
- **Polish (Phase 6)**: Depois das histórias desejadas

### User Story Dependencies

- **User Story 1 (P1)**: Depois da Phase 2 — MVP
- **User Story 2 (P1)**: Depois da US1 (mesma página)
- **User Story 3 (P2)**: Depois da US1; pode seguir em paralelo com US2 se T014/T016 não colidirem com T011–T013 no mesmo arquivo — na prática **sequencial** em `FluxoCaixa.tsx`

### Parallel Opportunities

- T001 e T002 em paralelo
- T015 toca util + página: não paralelo com T005 até o mapeamento existir
- US2 e US3 no mesmo `FluxoCaixa.tsx`: um executor por vez

### Parallel Example: Setup

```bash
Task: "Adicionar tipo MovimentoFluxo em frontend/src/types/index.ts"
Task: "Criar esqueleto em frontend/src/utils/fluxoCaixaMovimentos.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + 2 (util de regras)
2. Phase 3: ligar `FluxoCaixa.tsx`
3. **STOP**: validar uma CR recebida + uma CP paga no período

### Incremental Delivery

1. Setup + Foundational
2. US1 → demo do espelho
3. US2 → sem duplicar / sem omitir
4. US3 → coluna Origem + CSV
5. Polish / quickstart

---

## Notes

- Sem migration, sem endpoint novo, sem persistir movimento automático
- GET `/nfs` do caixa **nunca** envia `mes`/`ano` (filtro de emissão)
- [P] só quando arquivos diferentes e sem dependência incompleta
- Commit só se o usuário pedir
