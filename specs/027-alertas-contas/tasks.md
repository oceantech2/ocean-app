# Tasks: Alertas de Contas (Vencer, Vencidas e NF Pendente)

**Input**: Design documents from `/specs/027-alertas-contas/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas agrupadas por história de usuário (P1 → P2). Sem mudanças de schema/API de escrita.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Helper de dia civil compartilhado pelo hook e pelas listagens

- [x] T001 Criar `hojeISO()` (YYYY-MM-DD local/civil) e `compararVencimento(data, hoje)` em `frontend/src/utils/dataCivil.ts` conforme [data-model.md](./data-model.md) e [research.md](./research.md) decisão 2 — **não** usar `new Date(vencimento) < new Date()`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Estado de filtro e comparação civil nas contas — bloqueia US1 e US2

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Incluir `contasAlertaVencimento: '' | 'hoje' | 'vencida'` e parâmetro em `setContasFilters` (ou setter dedicado) em `frontend/src/store/index.ts` conforme [data-model.md](./data-model.md)
- [x] T003 Incluir `nfsSemNumero: boolean` e forma de ligar/desligar no mesmo store `frontend/src/store/index.ts` (US3 usa; declarar agora para o Layout não divergir)
- [x] T004 Substituir `isVencida` em `frontend/src/pages/Contas.tsx` para dia civil via `frontend/src/utils/dataCivil.ts` (vencida = não paga e data &lt; hojeISO; hoje não conta como vencida)

**Checkpoint**: Store tem os campos de alerta; Contas classifica vencida pelo dia civil; painel ainda mostra “Contas atrasadas”

---

## Phase 3: User Story 1 - Ver contas a pagar vencidas no painel (Priority: P1) 🎯 MVP

**Goal**: Painel mostra **Contas vencidas** (não “atrasadas”) com quantidade correta; clique abre `/contas` só com não pagas vencidas

**Independent Test**: Não paga D−1 no painel e na lista filtrada; paga antiga, vence hoje e amanhã fora

### Implementation for User Story 1

- [x] T005 [US1] Em `frontend/src/hooks/useNotificacoes.ts`: contar `contasVencidas` com `pago === false` e `data_vencimento < hojeISO()`; expor no tipo `Notificacoes`; `total` inclui esse campo; remover/renomear `contasAtrasadas`
- [x] T006 [US1] Em `frontend/src/components/Layout.tsx`: item **Contas vencidas** (`contasVencidas`); ao clicar `setContasFilters('', 'false')` + `contasAlertaVencimento='vencida'` e `navigate('/contas')`; manter NFs vencidas e férias; não usar o rótulo Contas atrasadas — [contracts/ui-alertas-contas.md](./contracts/ui-alertas-contas.md)
- [x] T007 [US1] Em `frontend/src/pages/Contas.tsx`: se `contasAlertaVencimento === 'vencida'`, `contasFiltradas` só não pagas com vencimento &lt; hoje; limpar o alerta ao mudar Status para valor que não seja esse recorte

**Checkpoint**: SC-001 (lado vencida) e SC-002; clique FR-007 para vencidas. Item “vence hoje” ainda pode não existir

---

## Phase 4: User Story 2 - Ver contas a pagar que vencem em menos de 1 dia (Priority: P1)

**Goal**: Segundo item no painel para não pagas com vencimento = hoje; clique lista só esse conjunto; disjunto de vencidas

**Independent Test**: Só a conta com vencimento D entra neste item e nesta lista; D−1 só em vencidas; D+1 em nenhum

### Implementation for User Story 2

- [x] T008 [US2] Em `frontend/src/hooks/useNotificacoes.ts`: contar `contasVenceHoje` (`pago === false` e `data_vencimento === hojeISO()`); somar no `total`; uma conta não entra nos dois contadores
- [x] T009 [US2] Em `frontend/src/components/Layout.tsx`: item **Contas a vencer em menos de 1 dia**; clique `contasPago='false'` + `contasAlertaVencimento='hoje'` + `/contas`; ordem conforme [contracts/ui-alertas-contas.md](./contracts/ui-alertas-contas.md)
- [x] T010 [US2] Em `frontend/src/pages/Contas.tsx`: recorte `'hoje'` = não pagas com vencimento = hojeISO; limpar alerta ao mudar Status manualmente

**Checkpoint**: SC-001 partição ontem/hoje/amanhã; FR-003 disjuntos

---

## Phase 5: User Story 3 - Ver contas a receber com nota fiscal pendente (Priority: P2)

**Goal**: Item **Contas com nota fiscal pendente**; inclui já recebidas sem número; clique em `/nfs` lista só ativas sem NF

**Independent Test**: Ativa sem número (paga ou não) no painel e na lista; com número, cancelada e arquivada fora

### Implementation for User Story 3

- [x] T011 [US3] Em `frontend/src/hooks/useNotificacoes.ts`: listar NFs (sem filtrar só vencida) e contar `nfsSemNumero` = não arquivada, `status !== 'cancelada'`, `!numero?.trim()`; incluir `paga`; somar no `total`
- [x] T012 [US3] Em `frontend/src/components/Layout.tsx`: item **Contas com nota fiscal pendente**; clique `nfsSemNumero=true`, mês vazio, `/nfs`; NFs vencidas inalteradas
- [x] T013 [US3] Em `frontend/src/pages/NFs.tsx`: se `nfsSemNumero`, listar sem mês (e sem ano se a API permitir), `incluir_arquivadas=false`, filtrar cliente-side ausência de número e excluir cancelada; opção **Sem NF** no select de status; outro status limpa `nfsSemNumero`

**Checkpoint**: SC-003; FR-005/FR-006/FR-007 NF pendente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Total do indicador, visualizador, lint e prova do quickstart

- [x] T014 Garantir `total` em `frontend/src/hooks/useNotificacoes.ts` = soma de NFs vencidas + contas vence hoje + contas vencidas + nfs sem número + férias; indicador oculto se 0 em `frontend/src/components/Layout.tsx` (FR-008, SC-005)
- [x] T015 [P] Confirmar que visualizador vê os três itens e não ganha botões de escrita em `frontend/src/components/Layout.tsx` (painéis já só leitura nas páginas)
- [x] T016 **Não** alterar `backend/app/services/email.py` nem `backend/app/api/routes/alertas.py` (FR-012)
- [x] T017 Rodar `cd frontend && npm run lint && npm run type-check` e o roteiro de [quickstart.md](./quickstart.md)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: imediato (T001)
- **Foundational (Phase 2)**: depende de T001 — **bloqueia** histórias
- **US1 (Phase 3)**: após Phase 2 — MVP
- **US2 (Phase 4)**: após US1 no mesmo trio de arquivos (`useNotificacoes`, `Layout`, `Contas`) — sequencial
- **US3 (Phase 5)**: após Phase 2; pode em paralelo com US1/US2 **exceto** `Layout.tsx` e `useNotificacoes.ts`
- **Polish**: após as histórias desejadas

### User Story Dependencies

- **US1 (P1)**: após foundation; não depende de US2/US3
- **US2 (P1)**: mesma UI de contas/painel; implementar depois de US1 para evitar conflito de merge
- **US3 (P2)**: independente na página NFs; converge no painel e no hook

### Parallel Opportunities

- T002 e T003 no mesmo arquivo `store/index.ts` — **não** paralelo (já agrupados em sequência)
- T015 pode paralelo com T016
- US3 (T013 em `NFs.tsx`) paralelo a T007/T010 se o hook/Layout forem coordenados

---

## Parallel Example: User Story 3 (arquivo isolado)

```text
T013 em frontend/src/pages/NFs.tsx
enquanto US1/US2 mexem em Contas.tsx
(depois integrar T011/T012 no hook e Layout)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1–2
2. Phase 3 (Contas vencidas no painel + lista filtrada)
3. Validar quickstart passos 1–2 (parte vencidas)
4. Demo

### Incremental Delivery

1. US1 → contas vencidas
2. US2 → vence hoje (disjunto)
3. US3 → NF pendente
4. Polish → total, e-mail intocado, lint

---

## Notes

- [P] só quando arquivos distintos
- Sem testes automatizados nesta lista
- Teto de 200/500 registros: aceito nesta feature ([research.md](./research.md) decisão 5)
- Próximo comando: `/speckit-implement`
