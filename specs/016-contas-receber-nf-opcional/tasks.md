# Tasks: Contas a Receber — NF opcional

**Input**: Design documents from `/specs/016-contas-receber-nf-opcional/`

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
- Contratos: `specs/016-contas-receber-nf-opcional/contracts/`
- Modelo: `specs/016-contas-receber-nf-opcional/data-model.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline e o gap (NF obrigatória) antes de editar código

- [x] T001 Revisar `specs/016-contas-receber-nf-opcional/plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api-contas-receber-nf-opcional.md` e `contracts/ui-contas-receber-nf-opcional.md` e confirmar escopo (NF opcional = `NULL`; unique só com número; sem import/delete/pasta)
- [x] T002 [P] Inspecionar validação de create/edit, rótulo `NF *`, payload de `numero` e coluna Nº em `frontend/src/pages/NFs.tsx`
- [x] T003 [P] Inspecionar `NF.numero` NOT NULL, `NFBase.numero: str`, `garantir_numero_livre` (422 se vazio) e POST/PUT em `backend/app/models/__init__.py`, `backend/app/schemas.py`, `backend/app/services/nf_duplicidade.py` e `backend/app/api/routes/nfs.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: `numero` nullable + normalização vazio→`NULL` + unique só se preenchido — bloqueia US1–US3

**⚠️ CRITICAL**: Nenhuma story de create/edit/listagem até o banco aceitar `NULL` e `garantir_numero_livre` não lançar 422 por ausência

- [x] T004 [P] Em `backend/app/models/__init__.py`, alterar `NF.numero` para `nullable=True` mantendo `unique=True` e `index=True`, conforme [data-model.md](./data-model.md)
- [x] T005 [P] Em `backend/app/main.py` (`_migrar`), adicionar `ALTER TABLE nfs ALTER COLUMN numero DROP NOT NULL` (padrão inline do projeto)
- [x] T006 [P] Em `backend/app/schemas.py`, tornar `numero` opcional em `NFBase`/`NFCreate`/`NFResponse` (`Optional[str] = None`) e normalizar `""`/espaços para `None` (validator)
- [x] T007 Em `backend/app/services/nf_duplicidade.py`, se número ausente após trim: retornar `None` e **não** lançar 422; aplicar 409 `NF_NUMERO_DUPLICADO` **somente** quando houver número, conforme [research.md](./research.md) R-003

**Checkpoint**: DB aceita vários `NULL` em `numero`; schema e helper não exigem NF

---

## Phase 3: User Story 1 — Cadastrar conta a receber sem número de NF (Priority: P1) 🎯 MVP

**Goal**: Admin cria conta via **“Nova conta a receber”** com NF em branco; demais obrigatórios inalterados; visualizador sem create

**Independent Test**: Smoke POST sem `numero` → 201 `numero: null`; segundo POST sem número → 201; UI create sem NF aparece na lista (quickstart passos 2–3)

### Implementation for User Story 1

- [x] T008 [US1] Em `backend/app/api/routes/nfs.py` (`criar_nf`): persistir `numero=None` quando ausente; se preenchido, seguir unique 013; demais regras (Caixa se Recebido, `origem=manual`, 403 visualizador) inalteradas — [contracts/api-contas-receber-nf-opcional.md](./contracts/api-contas-receber-nf-opcional.md)
- [x] T009 [P] [US1] Em `frontend/src/types/index.ts`, alterar `NF.numero` para `string | null`
- [x] T010 [US1] Em `frontend/src/pages/NFs.tsx` (create): remover `form.numero` da validação obrigatória; rótulo **NF** sem `*`; payload `numero: form.numero.trim() || null`; toast de obrigatórios **sem** citar NF; visualizador continua sem botão create — [contracts/ui-contas-receber-nf-opcional.md](./contracts/ui-contas-receber-nf-opcional.md)

**Checkpoint**: MVP — create manual sem NF funciona (API + UI)

---

## Phase 4: User Story 2 — Editar conta manual sem exigir NF (Priority: P1)

**Goal**: Admin salva edição manual sem NF; pode **apagar** um número já informado; Maggo permanece readonly no número

**Independent Test**: Editar manual sem NF e salvar; em outro manual com NF, limpar o campo, salvar, F5 → `numero` null (quickstart passo 5)

### Implementation for User Story 2

- [x] T011 [US2] Em `backend/app/api/routes/nfs.py` (`atualizar_nf`): se origem manual e `numero` veio no body, vazio/`null` → gravar `NULL`; se preenchido → unique 013; origem Maggo continua recusando alteração de `numero` (422)
- [x] T012 [US2] Em `frontend/src/pages/NFs.tsx` (edit): em registro **manual**, sempre enviar `numero` (`trim() || null`) para permitir limpar; em Maggo, não enviar `numero`; NF readonly na origem Maggo

**Checkpoint**: US1 e US2 — create e edit manuais não exigem NF; limpar número persiste

---

## Phase 5: User Story 3 — Ver contas sem NF e unicidade só com número (Priority: P2)

**Goal**: Listagem mostra **—** sem inventar número; várias contas sem NF coexistam; 409 só com número preenchido; merge Maggo ignora chave vazia

**Independent Test**: Duas contas sem NF na lista com **—**; criar com número já usado → 409 + atalho; Maggo não colide com manuais sem NF (quickstart passos 3–4, 6)

### Implementation for User Story 3

- [x] T013 [US3] Em `backend/app/api/routes/nfs.py` (`_sync_maggo_stub`): não usar `numero` vazio/`None` como chave de merge; manuais com `numero IS NULL` não entram na colisão por número
- [x] T014 [US3] Em `frontend/src/pages/NFs.tsx`, exibir `nf.numero || '—'` na coluna Nº, no modal de pagamento e no export da página (célula vazia ou `—`, sem número fictício)

**Checkpoint**: FR-006 a FR-008 / SC-003 / SC-004 — ausência visível; unique só com número

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação E2E alinhada ao quickstart e qualidade

- [x] T015 Executar o checklist de [quickstart.md](./quickstart.md) (smoke POST sem número, segundo sem número, 409 com duplicado, UI admin passos 1–7 e visualizador)
- [x] T016 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T017 Confirmar que visualizador não cria/edita e que a listagem mostra **—** nas contas sem NF em `frontend/src/pages/NFs.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — começa imediatamente
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as user stories
- **User Stories (Phase 3+)**: Dependem da Phase 2
  - Sequencial recomendado: US1 → US2 → US3 (`nfs.py` e `NFs.tsx` compartilhados)
  - US3 (listagem **—**) pode ser antecipada na UI após US1, mas o merge Maggo fica por último
- **Polish (Phase 6)**: Depende das stories desejadas (MVP = até US1)

### User Story Dependencies

- **User Story 1 (P1)**: Após Phase 2 — MVP
- **User Story 2 (P1)**: Após Phase 2; na prática após US1 (mesmo `NFs.tsx` / `nfs.py`)
- **User Story 3 (P2)**: Após Phase 2; listagem **—** independente do PUT; merge Maggo no mesmo `nfs.py` que US1/US2

### Within Each User Story

- Modelo/schema/helper (Phase 2) antes de endpoints
- Endpoints antes da UI que consome o contrato
- Story completa antes de avançar prioridade, salvo [P] em arquivos distintos

### Parallel Opportunities

- T002 e T003 (inspeção frontend vs backend)
- T004, T005, T006 (arquivos distintos); T007 em seguida ou em paralelo com T004–T006
- T009 (types) em paralelo com T008 (rota create)
- T016 em paralelo com T015 após o código estável

---

## Parallel Example: User Story 1

```bash
# Após Phase 2:
Task: "T008 criar_nf aceita numero null em backend/app/api/routes/nfs.py"
Task: "T009 NF.numero string | null em frontend/src/types/index.ts"
# Depois:
Task: "T010 formulário create sem NF obrigatória em frontend/src/pages/NFs.tsx"
```

---

## Parallel Example: Foundational

```bash
Task: "T004 NF.numero nullable em backend/app/models/__init__.py"
Task: "T005 ALTER DROP NOT NULL em backend/app/main.py"
Task: "T006 numero opcional em backend/app/schemas.py"
Task: "T007 garantir_numero_livre retorna None se vazio em backend/app/services/nf_duplicidade.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRITICAL)
3. Completar Phase 3: User Story 1
4. **STOP and VALIDATE**: POST sem NF + UI create (quickstart)
5. Demo se pronto

### Incremental Delivery

1. Setup + Foundational → banco e helper prontos
2. US1 → create sem NF → MVP
3. US2 → edit/limpar NF
4. US3 → **—** na lista + merge Maggo + unique só com número
5. Polish → quickstart + lint

### Parallel Team Strategy

Com mais de um dev: um no backend (T004–T008/T011/T013) e outro no frontend (T009/T010/T012/T014) após o contrato da Phase 2.

---

## Notes

- [P] = arquivos diferentes, sem depender de tarefa incompleta no mesmo arquivo
- Não incluir testes automatizados (não pedidos no spec)
- Não reabrir import, exclusão ou pasta de NFs
- Persistir ausência como `NULL`, nunca `''`
- Commit após cada tarefa ou grupo lógico, se o fluxo de git for solicitado
