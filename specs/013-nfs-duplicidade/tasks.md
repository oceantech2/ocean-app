# Tasks: Validação de Duplicidade de NFs

**Input**: Design documents from `/specs/013-nfs-duplicidade/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados no spec — validação manual via [quickstart.md](./quickstart.md) + `npm run lint` / `npm run type-check`

**Organization**: Tasks agrupadas por user story para entrega incremental e teste independente

**Dependência externa**: User Stories 1–2 pressupõem create/edit de `numero` reabilitados (feature **012** Contas a Receber — inserção manual) ou trabalho conjunto no mesmo release.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: User story (US1, US2, US3)
- Incluir caminhos de arquivo exatos nas descrições

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`
- Contratos: `specs/013-nfs-duplicidade/contracts/`
- Modelo: `specs/013-nfs-duplicidade/data-model.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contexto e limites antes de editar código

- [x] T001 Revisar `specs/013-nfs-duplicidade/plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api-nfs-duplicidade.md` e `contracts/ui-nfs-duplicidade.md` e confirmar escopo (409 + atalho, import `on_conflict`, sem sufixos `-N`, só trim, coordenação com 012)
- [x] T002 [P] Inspecionar create/update/import e Maggo sync em `backend/app/api/routes/nfs.py` e unique de `numero` em `backend/app/models/__init__.py`
- [x] T003 [P] Inspecionar modal/salvar e ausência de import na UI em `frontend/src/pages/NFs.tsx`, `frontend/src/services/api.ts` (`nfsService`), `frontend/src/utils/erros.ts` e sufixos em `backend/app/services/excel_io.py` (`parse_nfs_xlsx`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Helper compartilhado de unicidade por `numero` (trim, lookup, payload 409, IntegrityError) — base para US1/US2/US3

**⚠️ CRITICAL**: Nenhuma user story de UI até o helper de conflito existir e for reutilizável nas rotas

- [x] T004 Criar helper de unicidade de NF (ex.: `backend/app/services/nf_duplicidade.py` ou funções em `nfs.py`) com: `normalizar_numero` (strip), `buscar_por_numero`, montagem do `detail` `NF_NUMERO_DUPLICADO` (`code`, `message`, `nf_id`, `numero`, `razao_social`) conforme [contracts/api-nfs-duplicidade.md](./contracts/api-nfs-duplicidade.md)
- [x] T005 Em `backend/app/api/routes/nfs.py` (ou helper), mapear `IntegrityError` de unique em `numero` para HTTP **409** com o mesmo `detail` (lookup pós-falha), para corridas em create/import
- [x] T006 [P] Estender `frontend/src/utils/erros.ts` (e tipos em `frontend/src/types/index.ts` se necessário) para extrair `detail` objeto com `code` / `nf_id` / `message` (além de string/array Pydantic)

**Checkpoint**: Helper de conflito + parsing de erro no frontend prontos; stories podem consumir

---

## Phase 3: User Story 1 — Bloquear cadastro com número já existente (Priority: P1) 🎯 MVP

**Goal**: Create com número duplicado é rejeitado (409); UI informa e oferece abrir a NF existente; número livre cria normalmente

**Independent Test**: Com NF `DUP-001` existente, tentar criar outra com o mesmo número → bloqueio + atalho; listagem sem segundo registro (quickstart §§1–2, §8 trim)

### Implementation for User Story 1

- [x] T007 [US1] Em `backend/app/api/routes/nfs.py`, no `POST` de criação: aplicar trim em `numero`; se já existir NF com esse número → **409** `NF_NUMERO_DUPLICADO` (não persistir); garantir create reabilitado no contexto 012/013 (remover/ajustar 403 de criação local se ainda ativo para o fluxo manual)
- [x] T008 [US1] Em `frontend/src/pages/NFs.tsx` (fluxo Nova receita/conta), ao receber 409: toast/mensagem clara; ação **“Abrir existente”** que chama `nfsService.obter(nf_id)` + `abrirEditar`; não exibir sucesso falso
- [x] T009 [P] [US1] Em `frontend/src/services/api.ts`, garantir que `nfsService.criar` propaga o erro Axios intacto (status/detail) para a página tratar o 409

**Checkpoint**: MVP — create duplicado bloqueado com atalho funcional

---

## Phase 4: User Story 2 — Bloquear edição que gere número duplicado (Priority: P1)

**Goal**: Alterar `numero` para valor de outra NF é rejeitado; manter o próprio número ou número livre funciona; atalho para a detentora

**Independent Test**: Editar manual A para número de B → bloqueio + atalho; editar sem mudar número → ok (quickstart §§3–4)

### Implementation for User Story 2

- [x] T010 [US2] Em `backend/app/api/routes/nfs.py`, no `PUT`: quando body incluir `numero` (registros manuais), trim + checar outro `id` com mesmo número → **409**; omitir/`numero` igual ao atual → sem conflito; Maggo continua sem permitir mudar `numero` (allowlist 012)
- [x] T011 [US2] Em `frontend/src/pages/NFs.tsx`, no `salvar` de edição: tratar 409 igual à US1 (mensagem + Abrir existente na NF detentora); sucesso quando número próprio ou livre

**Checkpoint**: FR-003 / FR-004 cobertos também na edição

---

## Phase 5: User Story 3 — Duplicidade na importação em massa (Priority: P2)

**Goal**: Import XLSX sem sufixos `-N`; primeira linha do número vale; diálogo por lote rejeitar/atualizar conflitos com cadastro; resultado com ok/atualizados/erros

**Independent Test**: Import com número existente → diálogo → reject e update; duas linhas mesmo número novo → uma NF, sem `-2` (quickstart §§5–7)

### Implementation for User Story 3

- [x] T012 [US3] Em `backend/app/services/excel_io.py` (`parse_nfs_xlsx`): remover geração de sufixos `-2`/`-3`; manter número base; sinalizar ocorrências >1 (ex. flag/`_duplicado_arquivo` ou lista separada) para a rota rejeitar as posteriores
- [x] T013 [US3] Em `backend/app/api/routes/nfs.py`, reabilitar `POST /importar-xlsx`: aceitar `on_conflict` (`reject`|`update`); se houver números já no cadastro e `on_conflict` ausente → **422** `NF_IMPORT_ON_CONFLICT_REQUIRED` com `conflitos`; duplicatas internas sempre rejeitadas (`duplicado_arquivo`); resposta `{ ok, atualizados, erros }` conforme contrato
- [x] T014 [US3] Em `backend/app/api/routes/nfs.py`, implementar ramo `on_conflict=reject` (não altera existentes; erros `duplicado_cadastro`) e `on_conflict=update` (upsert campos do arquivo por `numero`; preservar enriquecimento Ocean: pagamento, caixa, colaboradores, arquivada — alinhado ao merge Maggo)
- [x] T015 [P] [US3] Em `frontend/src/services/api.ts`, atualizar `nfsService.importarXlsx` para enviar `on_conflict` (FormData/query) e tipar resposta `{ ok, atualizados, erros }`
- [x] T016 [US3] Em `frontend/src/pages/NFs.tsx` (e componente de import se usado): fluxo selecionar arquivo → se 422 `NF_IMPORT_ON_CONFLICT_REQUIRED`, modal **Rejeitar / Atualizar / Cancelar** (uma vez por lote) → reenviar; toasts de `ok`/`atualizados`/`erros`; textos pt-BR do contrato UI

**Checkpoint**: US3 completa — import com política de conflito e sem sufixos artificiais

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação ponta a ponta e consistência

- [x] T017 Confirmar que sync Maggo em `backend/app/api/routes/nfs.py` (`_sync_maggo_stub`) continua sem criar segundo registro pelo mesmo `numero` e que regra 012 (manual prevalece) não é quebrada pela 013
- [x] T018 [P] Garantir visualizador sem create/import/edit de número em `frontend/src/pages/NFs.tsx` (padrão `papel === 'admin'`)
- [x] T019 Executar cenários de `specs/013-nfs-duplicidade/quickstart.md` e `npm run lint` + `npm run type-check` em `frontend/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as user stories
- **US1 (Phase 3)**: Após Foundational — MVP; depende de create reabilitado (012)
- **US2 (Phase 4)**: Após Foundational; idealmente após US1 (reusa UX 409); pode seguir US1 no mesmo PR
- **US3 (Phase 5)**: Após Foundational; independente de US1/US2 no backend de import, mas beneficia do helper T004–T005
- **Polish (Phase 6)**: Após stories desejadas

### User Story Dependencies

- **US1 (P1)**: Após Phase 2 — sem dependência de US2/US3
- **US2 (P1)**: Após Phase 2 — reutiliza helper e padrão UI da US1
- **US3 (P2)**: Após Phase 2 — independente no canal import; não bloqueia MVP

### Within Each User Story

- Backend (validação/rota) antes da UI que consome o contrato
- Parser Excel (T012) antes da lógica de import na rota (T013–T014)
- `api.ts` pode paralelizar com backend quando o contrato estiver fechado

### Parallel Opportunities

- T002 ∥ T003 (setup)
- T006 ∥ T004–T005 (frontend erros vs helper backend, após alinhamento do shape do detail)
- T009 ∥ T007 (api.ts create vs rota, contrato estável)
- T015 ∥ T012–T014 (cliente import vs backend, após contrato)
- T017 ∥ T018 (polish)

---

## Parallel Example: User Story 1

```bash
# Após T004–T006:
Task: "POST create com trim + 409 em backend/app/api/routes/nfs.py"
Task: "nfsService.criar propaga erro em frontend/src/services/api.ts"
# Depois:
Task: "UX Abrir existente em frontend/src/pages/NFs.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Remover sufixos -N em backend/app/services/excel_io.py"
Task: "Atualizar importarXlsx com on_conflict em frontend/src/services/api.ts"
# Depois (sequencial na rota):
Task: "Reabilitar import + 422 on_conflict required em nfs.py"
Task: "reject/update branches em nfs.py"
Task: "Modal Rejeitar/Atualizar em NFs.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2  
2. Phase 3 (US1)  
3. **STOP**: validar quickstart §§1–2, §8  
4. Demo: create duplicado bloqueado com atalho  

### Incremental Delivery

1. Setup + Foundational  
2. US1 → MVP  
3. US2 → edição segura de número  
4. US3 → import com escolha de lote  
5. Polish + quickstart completo  

### Parallel Team Strategy

1. Time fecha Setup + Foundational  
2. Dev A: US1 → US2 (mesmo arquivo UI)  
3. Dev B: US3 (excel_io + import rota + UI import) — coordenar merge em `nfs.py` / `NFs.tsx`

---

## Notes

- [P] = arquivos diferentes, sem depender de tarefa incompleta no mesmo arquivo  
- Sem tasks de teste automatizado (não pedidas no spec)  
- Não reintroduzir delete em massa / pasta de arquivos  
- Unique de `numero` no modelo já existe — sem migração de schema obrigatória  
- Commit por tarefa ou grupo lógico; validar checkpoint de cada story  
- Implementação 2026-08-06: todas as tasks T001–T019 concluídas. Listagem passou a incluir NFs locais (não só stub Maggo) para create/import serem visíveis.  
