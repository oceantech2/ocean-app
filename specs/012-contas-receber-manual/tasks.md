# Tasks: Contas a Receber — Inserção Manual

**Input**: Design documents from `/specs/012-contas-receber-manual/`

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
- Contratos: `specs/012-contas-receber-manual/contracts/`
- Modelo: `specs/012-contas-receber-manual/data-model.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline/WIP e gaps da 012 antes de editar código

- [x] T001 Revisar `specs/012-contas-receber-manual/plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api-contas-receber-manual.md` e `contracts/ui-contas-receber-manual.md` e confirmar escopo (origem, merge skip manual, create Pendente|Recebido, CTA, sem import/delete/pasta)
- [x] T002 [P] Inspecionar create/edição/listagem/import WIP em `frontend/src/pages/NFs.tsx` e `frontend/src/services/api.ts` (CTA atual, campos do formulário, botão Importar)
- [x] T003 [P] Inspecionar `POST`/`PUT`/`_sync_maggo_stub` e schemas em `backend/app/api/routes/nfs.py` e `backend/app/schemas.py` (gap `origem`, Caixa no create, allowlist PUT)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Coluna `origem`, resposta API e merge Maggo que preserva manuais — bloqueia US1–US3

**⚠️ CRITICAL**: Nenhuma story de UI até `origem` existir e o sync não sobrescrever manuais

- [x] T004 Em `backend/app/models/__init__.py`, adicionar coluna `origem` (`String(20)`, default/`server_default` adequado) em `NF` conforme [data-model.md](./data-model.md)
- [x] T005 Em `backend/app/main.py`, adicionar `ALTER TABLE nfs ADD COLUMN IF NOT EXISTS origem VARCHAR(20)` e backfill `UPDATE nfs SET origem = 'maggo' WHERE origem IS NULL` (padrão do projeto)
- [x] T006 Em `backend/app/schemas.py`, incluir `origem: Optional[str] = None` (ou str) em `NFResponse`; valores canônicos `manual` \| `maggo`
- [x] T007 Em `backend/app/api/routes/nfs.py` (`_sync_maggo_stub`): se registro existente com `origem == "manual"`, **não** atualizar campos Maggo; acumular `numero` em lista de colisões; ao criar linha nova do stub, setar `origem = "maggo"`
- [x] T008 Em `backend/app/api/routes/nfs.py` (`listar_nfs`): em falha do stub Maggo, **não** abortar com 502 total — retornar query em `nfs` e sinalizar indisponibilidade (header `X-Ocean-Maggo-Status: unavailable` ou equivalente); se houver colisões, header `X-Ocean-Maggo-Ignorados: num1,num2` conforme [contracts/api-contas-receber-manual.md](./contracts/api-contas-receber-manual.md)

**Checkpoint**: DB/schemas/`origem` prontos; merge preserva manuais; listagem resiliente

---

## Phase 3: User Story 1 — Inserir receita/nota manualmente (Priority: P1) 🎯 MVP

**Goal**: Admin cria conta via **“Nova conta a receber”** (Pendente|Recebido + Caixa se Recebido); visualizador sem create; sem import

**Independent Test**: Smoke POST Pendente/Recebido/422 + UI create (quickstart); registro com `origem=manual` na lista

### Implementation for User Story 1

- [x] T009 [US1] Em `backend/app/schemas.py`, estender `NFCreate` com `data_pagamento` e `caixa` opcionais; validar valores de `caixa` (`corrente` \| `investimento` \| null)
- [x] T010 [US1] Em `backend/app/api/routes/nfs.py` (`criar_nf`): setar `origem="manual"`; mapear Pendente/Recebido via `data_pagamento`; se `data_pagamento` preenchida exigir `caixa`; calcular `status` com `_calcular_status_nf`; reutilizar unicidade (`nf_duplicidade` se presente); **403** para não-admin
- [x] T011 [P] [US1] Em `frontend/src/types/index.ts`, adicionar `origem?: 'manual' | 'maggo'` em `NF` e tipagem de create com `caixa` / `data_pagamento`
- [x] T012 [P] [US1] Em `frontend/src/services/api.ts`, garantir `nfsService.criar` envia payload alinhado ao contrato (incl. `caixa`, `data_pagamento`)
- [x] T013 [US1] Em `frontend/src/pages/NFs.tsx`, CTA e título do modal: **“Nova conta a receber”**; remover/ocultar Importar Excel/CSV, Deletar e pasta NFs da superfície (FR-002/FR-011)
- [x] T014 [US1] Em `frontend/src/pages/NFs.tsx`, formulário de criação só com: NF, razão social, valores, emissão, vencimento, tipo, pagamento (**Pendente** \| **Recebido**), e se Recebido: data pagamento + Caixa; **sem** posição/candidato/colaboradores no create
- [x] T015 [US1] Em `frontend/src/pages/NFs.tsx`, validação cliente + `salvar` create: bloquear Recebido sem Caixa/data; toast de erro; tratar 409/422; sucesso recarrega lista; visualizador sem botão create

**Checkpoint**: MVP — create manual funciona (API + UI) sem import

---

## Phase 4: User Story 2 — Ver e distinguir registro manual na listagem (Priority: P1)

**Goal**: Coluna **Origem** (Manual / Maggo); manuais e Maggo na mesma lista; toast opcional de colisão/Maggo down

**Independent Test**: Criar manual, F5, coluna Origem; registros Maggo mostram Maggo (quickstart passos 3 e 7)

### Implementation for User Story 2

- [x] T016 [US2] Em `frontend/src/pages/NFs.tsx`, adicionar coluna **Origem** na tabela com rótulos **Manual** / **Maggo** a partir de `nf.origem`
- [x] T017 [US2] Em `frontend/src/pages/NFs.tsx` (e export CSV se aplicável), incluir Origem no export cliente; em `backend/app/api/routes/nfs.py` / `backend/app/services/excel_io.py`, incluir coluna Origem no export XLSX quando a página exportar
- [x] T018 [US2] Em `frontend/src/pages/NFs.tsx` / interceptor de listagem: se header `X-Ocean-Maggo-Ignorados` ou Maggo unavailable, exibir toast informativo (não bloquear a lista)

**Checkpoint**: SC-006 / FR-007 / FR-012 atendidos na listagem e export

---

## Phase 5: User Story 3 — Editar e arquivar receita criada manualmente (Priority: P2)

**Goal**: Admin edita campos de negócio só em origem manual; Maggo permanece allowlist de enriquecimento; arquivar continua

**Independent Test**: Editar razão/valor de manual e persistir; Maggo com campos negócio readonly; arquivar manual (quickstart passos 5–6)

### Implementation for User Story 3

- [x] T019 [US3] Em `backend/app/schemas.py` e `backend/app/api/routes/nfs.py` (`atualizar_nf`): se `origem == "manual"`, aceitar campos de negócio do create + enriquecimento; se `origem == "maggo"`, manter allowlist de enriquecimento e rejeitar negócio com **422**; nunca alterar `origem`; regra Caixa se Recebido
- [x] T020 [US3] Em `frontend/src/pages/NFs.tsx`, modal de edição: se Manual, inputs de negócio editáveis + pagamento Pendente|Recebido + Caixa/colaboradores/arquivar; se Maggo, negócio readonly e só enriquecimento
- [x] T021 [US3] Em `frontend/src/pages/NFs.tsx`, confirmar fluxo Arquivar/desarquivar para manuais; visualizador sem escrita

**Checkpoint**: FR-009 / FR-010 / FR-011 — edição diferenciada por origem

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação E2E e limpeza alinhada ao quickstart

- [x] T022 Executar cenários de [quickstart.md](./quickstart.md) (smoke API + UI admin + visualizador)
- [x] T023 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T024 Revisar strings CTA (“Nova conta a receber”), ausência de Importar/Deletar/pasta, e `origem` em create/list/export em `frontend/src/pages/NFs.tsx`
- [x] T025 Confirmar que create com número já existente (manual ou Maggo) é rejeitado e que sync não sobrescreve manual (smoke + header de colisões se aplicável)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as stories
- **US1 (Phase 3)**: Depende da Foundational — MVP
- **US2 (Phase 4)**: Depende de Foundational (+ idealmente US1 para ter manual na lista)
- **US3 (Phase 5)**: Depende de Foundational (+ US1 para ter registro manual editável)
- **Polish (Phase 6)**: Depende das stories desejadas

### User Story Dependencies

- **US1 (P1)**: Após Foundational — create + CTA
- **US2 (P1)**: Após Foundational — coluna Origem (pode seguir US1)
- **US3 (P2)**: Após US1 — edição plena de manuais

### Within Each User Story

- Backend/schema antes da UI que consome o contrato
- Validação cliente alinhada à API
- Story completa antes da próxima prioridade (ou paralelo se arquivos não conflitarem)

### Parallel Opportunities

- T002 ∥ T003 (inspeção)
- T011 ∥ T012 (types + api.ts) após T009/T010 em andamento ou feitos
- T017 (export) pode paralelizar partes backend/frontend com cuidado
- T023 ∥ revisão visual T024 após implementação

---

## Parallel Example: User Story 1

```bash
# Após T009–T010 (backend create):
Task: "T011 [P] [US1] types origem/create em frontend/src/types/index.ts"
Task: "T012 [P] [US1] payload criar em frontend/src/services/api.ts"

# Depois, UI sequencial no mesmo arquivo:
Task: "T013 [US1] CTA e remoção import em frontend/src/pages/NFs.tsx"
Task: "T014 [US1] formulário create Pendente|Recebido em frontend/src/pages/NFs.tsx"
Task: "T015 [US1] validação/salvar create em frontend/src/pages/NFs.tsx"
```

---

## Parallel Example: User Story 2

```bash
Task: "T016 [US2] coluna Origem em frontend/src/pages/NFs.tsx"
Task: "T017 [US2] Origem no export (NFs.tsx + excel_io/nfs.py)"
Task: "T018 [US2] toasts Maggo headers em frontend/src/pages/NFs.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup + Phase 2 Foundational (`origem` + merge)
2. Phase 3 US1 (POST + formulário **Nova conta a receber**)
3. **STOP e VALIDAR** quickstart create
4. Demo MVP

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → create manual (MVP)
3. US2 → coluna Origem + export/avisos
4. US3 → edição plena manual / readonly Maggo
5. Polish → quickstart completo

### Parallel Team Strategy

1. Time fecha Setup + Foundational junto
2. Dev A: US1 UI; Dev B: US2 coluna/export (após `origem` na API)
3. US3 após create estável

---

## Notes

- [P] = arquivos diferentes, sem dependência de tarefa incompleta
- Labels [US1]/[US2]/[US3] mapeiam às stories da spec
- Sem tasks de teste automatizado (não solicitados)
- WIP existente (POST/“Nova receita”) deve ser **alinhado** ao contrato (não duplicar fluxos)
- Feature 013 (duplicidade/import) pode coexistir: 012 **não** reintroduz import na UI; unicidade de `numero` reutiliza `nf_duplicidade` se presente
- Próximo comando: `/speckit-implement`
