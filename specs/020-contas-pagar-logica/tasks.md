# Tasks: Contas a Pagar — Confirmar lógica do input manual

**Input**: Design documents from `/specs/020-contas-pagar-logica/`

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
- Contratos: `specs/020-contas-pagar-logica/contracts/`
- Modelo: `specs/020-contas-pagar-logica/data-model.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline 014 vs spec 020 (gaps reais vs já entregue) antes de editar código

- [x] T001 Revisar `specs/020-contas-pagar-logica/plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api-contas-pagar-logica.md` e `contracts/ui-contas-pagar-logica.md` e confirmar escopo (Pagar=hoje sem modal, qualquer data no form, duplicata ok, desfazer só na edição, `require_admin` na escrita, sem migration/unique)
- [x] T002 [P] Inspecionar `criar_conta`, `atualizar_conta`, `deletar_conta`, `upload_comprovante` e `Depends(get_current_user)` vs `require_admin` em `backend/app/api/routes/contas.py`
- [x] T003 [P] Inspecionar CTA, máscara, `salvar`, `marcarPago`, ações da linha, importação e ausência de Origem/Caixa/Desfazer em `frontend/src/pages/Contas.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Travar escrita da API para visualizador — bloqueia FR-009 em todas as stories

**⚠️ CRITICAL**: Nenhuma story de UI/confirmação até POST/PUT/DELETE (e upload) retornarem 403 para visualizador

- [x] T004 Em `backend/app/api/routes/contas.py`, trocar `get_current_user` por `require_admin` em `criar_conta` (`POST /`), `atualizar_conta` (`PUT /{id}`), `deletar_conta` (`DELETE /{id}`) e `upload_comprovante` (`POST /{id}/comprovante`); manter `get_current_user` nos GET (lista, detalhe, download comprovante, export) — [contracts/api-contas-pagar-logica.md](./contracts/api-contas-pagar-logica.md) · [research.md](./research.md) item 2

**Checkpoint**: Restart API; token visualizador em POST/PUT/DELETE `/api/contas` → **403**; GET lista → 200; admin POST continua 201

---

## Phase 3: User Story 1 — Lançar despesa por input manual (Priority: P1) 🎯 MVP

**Goal**: Formulário **Nova conta a pagar** / **Editar conta a pagar** com máscara BRL, status via data (qualquer dia), sem seletor Pendente\|Pago, sem bloqueio de duplicata; visualizador sem CTA.

**Independent Test**: Admin cria pendente e paga (data futura ok); segunda conta igual também salva; visualizador sem “Nova conta a pagar” — [quickstart.md](./quickstart.md) UI 2–5, 9

### Implementation for User Story 1

- [x] T005 [US1] Em `frontend/src/pages/Contas.tsx`, confirmar CTA e título do modal **“Nova conta a pagar”** / **“Editar conta a pagar”**; campo valor com `formatarMoedaInput` / `isValorMoedaValido` de `frontend/src/utils/moeda.ts`; **sem** seletor Pendente\|Pago; data de pagamento **sem** `min`/`max` — [contracts/ui-contas-pagar-logica.md](./contracts/ui-contas-pagar-logica.md)
- [x] T006 [US1] Em `frontend/src/pages/Contas.tsx` (`salvar`) e `backend/app/api/routes/contas.py` (`criar_conta`), **não** adicionar checagem de duplicidade nem validação de data vs hoje/vencimento; create com `data_pagamento` preenchida nasce paga, vazia nasce pendente — [data-model.md](./data-model.md)

**Checkpoint**: MVP — cadastro unitário alinhado à lógica confirmada; duplicata e data futura aceitas

---

## Phase 4: User Story 2 — Status pago/pendente segue a data de pagamento (Priority: P1)

**Goal**: **Pagar** na lista = um clique com data de hoje (sem modal); desfazer só limpando a data na edição; valor editável com conta paga; sem ação Desfazer na linha.

**Independent Test**: Pagar pendente → “Pago em” hoje sem pedir data; editar valor de paga → continua paga; limpar data → pendente; linha paga sem Desfazer — [quickstart.md](./quickstart.md) UI 6–8

### Implementation for User Story 2

- [x] T007 [US2] Em `frontend/src/pages/Contas.tsx` (`marcarPago`), manter um clique: PUT com `pago: true` e `data_pagamento` = hoje; **não** abrir modal de data (não copiar Recebido de `frontend/src/pages/NFs.tsx`) — [contracts/ui-contas-pagar-logica.md](./contracts/ui-contas-pagar-logica.md)
- [x] T008 [US2] Em `frontend/src/pages/Contas.tsx`, garantir botão **Pagar** só se `!conta.pago`; **não** adicionar **Desfazer pagamento** na listagem; `salvar` na edição envia `data_pagamento: null` (e `pago: false`) ao limpar o campo — [spec.md](./spec.md) Clarify Q4

**Checkpoint**: US1+US2 — Pagar=hoje; desfazer só na edição

---

## Phase 5: User Story 3 — Ver, filtrar e conviver com importação (Priority: P2)

**Goal**: Importação CSV/Excel permanece; sem “Deletar todas”; sem coluna Origem/Caixa; filtros e exportação inalterados; visualizador só consulta.

**Independent Test**: Admin vê importar CSV/Excel e Nova conta a pagar; não vê Deletar todas nem Origem/Caixa; visualizador consulta sem escrever — [quickstart.md](./quickstart.md) UI 2, 9

### Implementation for User Story 3

- [x] T009 [US3] Em `frontend/src/pages/Contas.tsx`, confirmar que Importar CSV, Importar Excel e exportações permanecem; **não** reintroduzir “Deletar todas”; **não** adicionar coluna Origem nem campo Caixa — [contracts/ui-contas-pagar-logica.md](./contracts/ui-contas-pagar-logica.md)
- [x] T010 [US3] Em `frontend/src/pages/Contas.tsx`, confirmar `papel === 'admin'` nas ações de escrita (criar, importar, pagar, editar, deletar, anexar comprovante); visualizador só lê a lista — [spec.md](./spec.md) FR-009

**Checkpoint**: US1–US3 — perímetro da página confirmado (manual + import, sem Maggo/Caixa)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação ponta a ponta da lógica confirmada

- [x] T011 Executar smoke de [quickstart.md](./quickstart.md) (403 visualizador; duplicata 201; data futura 201; PUT limpar data → pendente) contra API **8001**
- [x] T012 Rodar `npm run lint` e `npm run type-check` em `frontend/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as user stories
- **User Stories (Phase 3+)**: Dependem da Phase 2
  - US1 (P1) e US2 (P1) em sequência recomendada (mesmo arquivo `Contas.tsx`)
  - US3 (P2) depois ou em paralelo conceitual, mas mesmo arquivo — sequencial na prática
- **Polish**: Depois das stories desejadas

### User Story Dependencies

- **User Story 1 (P1)**: Após Phase 2 — cadastro manual
- **User Story 2 (P1)**: Após Phase 2; toca o mesmo `Contas.tsx` que US1 (não paralelizar no mesmo arquivo)
- **User Story 3 (P2)**: Após Phase 2; mesmo arquivo — após US1/US2 para evitar conflito

### Parallel Opportunities

- T002 e T003 em paralelo (backend vs frontend)
- T004 é único no backend (mesmo arquivo)
- US1–US3 **não** marcar [P] entre si: todas editam `frontend/src/pages/Contas.tsx`

---

## Parallel Example: Setup

```bash
Task: "Inspecionar criar_conta/atualizar_conta em backend/app/api/routes/contas.py"
Task: "Inspecionar salvar/marcarPago em frontend/src/pages/Contas.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1: Setup (inspeção)
2. Phase 2: `require_admin` na escrita — **obrigatório**
3. Phase 3: User Story 1 (formulário)
4. **STOP and VALIDATE**: quickstart create pendente/paga/duplicata/data futura
5. Seguir US2 (Pagar/desfazer) e US3 (import/perímetro)

### Incremental Delivery

1. Setup + Foundational → visualizador 403 na API
2. US1 → input manual confirmado
3. US2 → Pagar=hoje; desfazer só na edição
4. US3 → import permanece; sem Origem/Caixa
5. Polish → quickstart + lint

---

## Notes

- Não reimplementar 014 (máscara, schemas, taxonomia) se a inspeção confirmar alinhamento — só ajustar gaps.
- Não copiar o modal de data do Recebido (019).
- Não criar unique nem `min`/`max` na data de pagamento.
- Commit após cada grupo lógico, se o usuário pedir.
