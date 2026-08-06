# Tasks: Contas a Pagar — Input Manual de Valores

**Input**: Design documents from `/specs/014-contas-pagar-manual/`

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
- Contratos: `specs/014-contas-pagar-manual/contracts/`
- Modelo: `specs/014-contas-pagar-manual/data-model.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline e gaps da 014 antes de editar código

- [x] T001 Revisar `specs/014-contas-pagar-manual/plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api-contas-pagar-manual.md` e `contracts/ui-contas-pagar-manual.md` e confirmar escopo (máscara BRL, CTA “Nova conta a pagar”, create com `data_pagamento`, limpar data → pendente, import permanece, sem Deletar todas)
- [x] T002 [P] Inspecionar create/edição/listagem/import em `frontend/src/pages/Contas.tsx` e `frontend/src/services/api.ts` (CTA “Nova Conta”, `type="number"` no valor, payload `salvar` sem null em `data_pagamento`)
- [x] T003 [P] Inspecionar `POST`/`PUT` e schemas em `backend/app/api/routes/contas.py` e `backend/app/schemas.py` (gap `ContaPagarCreate` sem `data_pagamento`, PUT sem `data_pagamento=null` → `pago=false`, validação `valor > 0`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Contrato API de create/update alinhado a pago ↔ data_pagamento e valor > 0 — bloqueia US1–US3

**⚠️ CRITICAL**: Nenhuma story de UI de valor/status até create/update aceitarem o contrato

- [x] T004 Em `backend/app/schemas.py`, estender `ContaPagarCreate` com `data_pagamento: Optional[date] = None`; garantir validação de `valor > 0` em create (validator/`Field` ou checagem na rota) conforme [data-model.md](./data-model.md) e [contracts/api-contas-pagar-manual.md](./contracts/api-contas-pagar-manual.md)
- [x] T005 Em `backend/app/schemas.py`, validar `valor > 0` também em `ContaPagarUpdate` quando `valor` for enviado
- [x] T006 Em `backend/app/api/routes/contas.py` (`criar_conta`): se `data_pagamento` preenchida → `pago=True`; se ausente/null → `pago=False` e `data_pagamento=None`; rejeitar valor ≤ 0 com **422**
- [x] T007 Em `backend/app/api/routes/contas.py` (`atualizar_conta`): se payload inclui `data_pagamento` não-nula → `pago=True`; se inclui `data_pagamento=null` → `pago=False`; manter atalho `pago=false` limpando data; permitir atualizar `valor` com conta já paga

**Checkpoint**: API create/update coerente com FR-003/FR-006/FR-015; smoke POST/PUT do quickstart passa no backend

---

## Phase 3: User Story 1 — Inserir conta a pagar com valor digitado (Priority: P1) 🎯 MVP

**Goal**: Admin cria via **“Nova conta a pagar”** com máscara BRL no valor; nasce pendente ou paga conforme data de pagamento; visualizador sem create

**Independent Test**: Smoke POST pendente/pago/422 + UI create com máscara (quickstart); registro na lista com valor correto

### Implementation for User Story 1

- [x] T008 [P] [US1] Criar util de máscara monetária brasileira em `frontend/src/utils/moeda.ts` (formatar digitação `R$ 1.234,56` + parse para `number`; rejeitar ≤ 0 / inválido) conforme [research.md](./research.md)
- [x] T009 [P] [US1] Em `frontend/src/services/api.ts`, garantir `contasService.criar` / tipagem de payload aceitam `data_pagamento` opcional alinhado ao contrato
- [x] T010 [US1] Em `frontend/src/pages/Contas.tsx`, CTA e título do modal de criação: **“Nova conta a pagar”** (não “Nova Conta”); título de edição preferir **“Editar conta a pagar”**
- [x] T011 [US1] Em `frontend/src/pages/Contas.tsx`, substituir input `type="number"` do valor por campo com máscara BRL usando `frontend/src/utils/moeda.ts` no create (e reutilizar no edit)
- [x] T012 [US1] Em `frontend/src/pages/Contas.tsx`, `salvar` no create: parse da máscara → `valor`; enviar `data_pagamento` se preenchida (senão omitir/null); bloquear valor inválido/≤0 e campos obrigatórios com toast; visualizador sem botão create; import CSV/Excel permanece disponível

**Checkpoint**: MVP — create manual com máscara e status via data funciona (API + UI)

---

## Phase 4: User Story 2 — Ver o valor na listagem e consultar (Priority: P1)

**Goal**: Valor formatado em BRL na lista; contas manuais nos filtros/export/totais existentes

**Independent Test**: Criar conta com valor conhecido, F5, lista mostra R$; filtros/export incluem o registro (quickstart UI + SC-005)

### Implementation for User Story 2

- [x] T013 [US2] Em `frontend/src/pages/Contas.tsx`, confirmar coluna Valor e totais usam formatação BRL (`fmt` / `toLocaleString`); ajustar só se create/edit quebrarem exibição
- [x] T014 [US2] Em `frontend/src/pages/Contas.tsx`, confirmar que contas criadas manualmente entram em busca, filtros de categoria/pago, período e export CSV já existentes; corrigir gaps mínimos se algum filtro excluir indevidamente

**Checkpoint**: SC-002 / SC-005 / FR-009 / FR-010 — valor legível e participação na listagem/filtros

---

## Phase 5: User Story 3 — Corrigir valor e demais dados na edição (Priority: P2)

**Goal**: Admin edita valor mesmo com conta paga; limpar data de pagamento → pendente; visualizador sem edição

**Independent Test**: Editar valor de paga e persistir; limpar data → pendente; visualizador bloqueado (quickstart passos 5–6 e 8)

### Implementation for User Story 3

- [x] T015 [US3] Em `frontend/src/pages/Contas.tsx`, `abrirEditar` / form valor: carregar valor na máscara BRL; permitir editar valor de conta paga sem exigir limpar pagamento
- [x] T016 [US3] Em `frontend/src/pages/Contas.tsx`, `salvar` no edit: **sempre** enviar `data_pagamento` (`null` se vazio) para o PUT; alinhar `pago` com a regra da API; toast de sucesso/erro; recarregar lista
- [x] T017 [US3] Em `frontend/src/pages/Contas.tsx`, confirmar visualizador sem Editar/Deletar/Pagar; botão “Pagar” da listagem permanece para admin

**Checkpoint**: FR-007 / FR-015 — edição de valor pago + limpar data → pendente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação E2E e limpeza alinhada ao quickstart

- [x] T018 Executar cenários de [quickstart.md](./quickstart.md) (smoke API + UI admin + visualizador)
- [x] T019 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T020 Revisar strings CTA (“Nova conta a pagar”), máscara só no formulário (não no import), ausência de “Deletar todas”, e taxonomia 008 intacta em `frontend/src/pages/Contas.tsx`
- [x] T021 Confirmar POST valor ≤ 0 → 422 e PUT `data_pagamento: null` → `pago=false` via smoke do quickstart

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as stories
- **US1 (Phase 3)**: Depende da Foundational — MVP
- **US2 (Phase 4)**: Depende de Foundational (+ idealmente US1 para ter conta nova na lista)
- **US3 (Phase 5)**: Depende de Foundational (+ US1 para ter registro editável com máscara)
- **Polish (Phase 6)**: Depende das stories desejadas

### User Story Dependencies

- **US1 (P1)**: Após Foundational — create + máscara + CTA
- **US2 (P1)**: Após Foundational — listagem/fmt (pode seguir US1)
- **US3 (P2)**: Após US1 — edição + limpar data

### Within Each User Story

- Backend/schema (Foundational) antes da UI que consome o contrato
- Util `moeda.ts` antes do input mascarado em Contas.tsx
- Story completa antes da próxima prioridade (ou paralelo se arquivos não conflitarem)

### Parallel Opportunities

- T002 ∥ T003 (inspeção)
- T004–T005 (schemas) antes de T006–T007 (rotas), ou T004/T005 em sequência curta
- T008 ∥ T009 (moeda.ts + api.ts) após Foundational
- T013 ∥ T014 só se edições em trechos distintos de Contas.tsx com cuidado
- T019 ∥ revisão visual T020 após implementação

---

## Parallel Example: User Story 1

```bash
# Após Phase 2 (T004–T007):
Task: "T008 [P] [US1] util máscara em frontend/src/utils/moeda.ts"
Task: "T009 [P] [US1] payload criar em frontend/src/services/api.ts"

# Depois, UI sequencial no mesmo arquivo:
Task: "T010 [US1] CTA Nova conta a pagar em frontend/src/pages/Contas.tsx"
Task: "T011 [US1] input valor com máscara em frontend/src/pages/Contas.tsx"
Task: "T012 [US1] salvar create + validação em frontend/src/pages/Contas.tsx"
```

---

## Parallel Example: User Story 3

```bash
# Após US1 (máscara já no form):
Task: "T015 [US3] abrirEditar com máscara em frontend/src/pages/Contas.tsx"
Task: "T016 [US3] salvar edit com data_pagamento null em frontend/src/pages/Contas.tsx"
Task: "T017 [US3] papéis visualizador / botão Pagar em frontend/src/pages/Contas.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup + Phase 2 Foundational (schemas + create/update API)
2. Phase 3 US1 (máscara + CTA + create)
3. **STOP e VALIDAR** quickstart create
4. Demo MVP

### Incremental Delivery

1. Setup + Foundational → API pronta
2. US1 → create com máscara (MVP)
3. US2 → conferência listagem/filtros/export
4. US3 → edição valor pago + limpar data
5. Polish → quickstart completo

### Parallel Team Strategy

1. Time fecha Setup + Foundational junto
2. Dev A: US1 UI (máscara/CTA); Dev B: US2 verificação listagem (após create estável)
3. US3 após create/máscara estáveis

---

## Notes

- [P] = arquivos diferentes, sem dependência de tarefa incompleta
- Labels [US1]/[US2]/[US3] mapeiam às stories da spec
- Sem tasks de teste automatizado (não solicitados)
- CRUD Contas a Pagar já existe — tasks **alinham** gaps (não duplicar módulo)
- Import CSV/Excel e taxonomia 008 **permanecem**; “Deletar todas” continua ausente
- Próximo comando: `/speckit-implement`
