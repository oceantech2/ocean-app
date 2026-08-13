# Tasks: Contas a Pagar — Vincular nota fiscal por item

**Input**: Design documents from `/specs/029-contas-nf-vinculo/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/rest-contas-nf-vinculo.md](./contracts/rest-contas-nf-vinculo.md), [contracts/ui-contas-nf-vinculo.md](./contracts/ui-contas-nf-vinculo.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas agrupadas por história (US1 pasta → US2 vínculo → US3 substituir/remover).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/main.py`, `backend/app/api/routes/contas.py`
- Frontend: `frontend/src/pages/Contas.tsx`, `frontend/src/services/api.ts`
- Sem migração; colunas `comprovante_*` permanecem

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar pontos de corte; não criar arquivos novos

- [x] T001 Confirmar botão Comprovantes, `GerenciadorArquivos` e anexo só se `conta.pago` em `frontend/src/pages/Contas.tsx`; `comprovantesService` em `frontend/src/services/api.ts`
- [x] T002 [P] Confirmar `include_router` de `arquivos_comprovantes` em `backend/app/main.py` e `upload_comprovante` / `download_comprovante` / `remover_comprovante` em `backend/app/api/routes/contas.py` (sem migração de `comprovante_path` / `comprovante_nome`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Validação de novos envios e GET com `media_type` — bloqueia US2/US3

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T003 Em `backend/app/api/routes/contas.py`, recusar POST `/{id}/comprovante` se a extensão não for `.pdf`, `.jpg`, `.jpeg` ou `.png` (400 com mensagem citando PDF, JPEG e PNG); manter limite `UPLOAD_MAX_MB` (413); GET de arquivo legado continua servindo — [contracts/rest-contas-nf-vinculo.md](./contracts/rest-contas-nf-vinculo.md)
- [x] T004 Em `backend/app/api/routes/contas.py`, `download_comprovante` deve usar `media_type` (`application/pdf`, `image/jpeg`, `image/png` ou `application/octet-stream`) conforme a extensão do arquivo vigente

**Checkpoint**: Upload novo inválido = 400; PDF/JPEG/PNG = 201; GET legado ainda 200

---

## Phase 3: User Story 1 - Remover a pasta compartilhada de comprovantes (Priority: P1) 🎯 MVP

**Goal**: Ninguém lista, envia ou baixa pela biblioteca compartilhada; arquivos em disco de `COMPROVANTES_DIR` não são apagados

**Independent Test**: Cabeçalho de Contas a Pagar sem Comprovantes; `GET /api/arquivos-comprovantes/` com JWT → 404; listagem de contas e nova conta continuam

### Implementation for User Story 1

- [x] T005 [P] [US1] Deixar de incluir `arquivos_comprovantes.router` em `backend/app/main.py` (manter `backend/app/api/routes/arquivos_comprovantes.py` no repo; não apagar `COMPROVANTES_DIR`)
- [x] T006 [P] [US1] Remover botão Comprovantes, estado `comprovantesAberto` e `<GerenciadorArquivos>` de `frontend/src/pages/Contas.tsx` — [contracts/ui-contas-nf-vinculo.md](./contracts/ui-contas-nf-vinculo.md)
- [x] T007 [US1] Remover `comprovantesService` de `frontend/src/services/api.ts` se não houver outro uso; não usar `GerenciadorArquivos` em Contas a Pagar

**Checkpoint**: SC-004 / FR-001 / FR-012. Demais ações da página intactas

---

## Phase 4: User Story 2 - Vincular PDF, JPEG ou PNG da nota fiscal em cada conta (Priority: P1)

**Goal**: Admin vincula um arquivo por item (qualquer status) na listagem e no formulário criar/editar; autenticados abrem o arquivo

**Independent Test**: Anexar PDF na linha de pendente; criar conta com JPEG no formulário; editar outra com PNG; abrir em nova aba; visualizador só abre

### Implementation for User Story 2

- [x] T008 [P] [US2] Em `frontend/src/services/api.ts`, `downloadComprovante` abre o blob em nova aba (`window.open`) em vez de forçar `a.download`
- [x] T009 [US2] Em `frontend/src/pages/Contas.tsx`, coluna **Nota fiscal**: anexar em pendente/vencida/paga (não só `pago`); `accept=".pdf,.jpg,.jpeg,.png"`; recusa no cliente com toast; visualizador só vê/abre o nome — [contracts/ui-contas-nf-vinculo.md](./contracts/ui-contas-nf-vinculo.md)
- [x] T010 [US2] No modal **Nova conta a pagar** em `frontend/src/pages/Contas.tsx`, campo opcional de arquivo; guardar `File` no estado; ao salvar: `POST /contas` e depois `uploadComprovante`; cancelar descarta o arquivo — [research.md](./research.md) item 3
- [x] T011 [US2] No modal de **editar** em `frontend/src/pages/Contas.tsx`, permitir escolher PDF/JPEG/PNG para vincular se ainda não houver arquivo; salvar sem arquivo continua permitido (FR-010)

**Checkpoint**: SC-001 / SC-002 / FR-002–FR-007 / FR-010 / FR-014. Pasta da US1 continua ausente

---

## Phase 5: User Story 3 - Substituir ou remover a nota fiscal do item (Priority: P2)

**Goal**: Admin troca ou remove o arquivo na listagem e no formulário de edição, com confirmação na remoção

**Independent Test**: Substituir pela linha e pela edição; remover com confirm; item volta a permitir anexar; visualizador sem essas ações; legado não-PDF/JPEG/PNG ainda abre

### Implementation for User Story 3

- [x] T012 [US3] Na listagem de `frontend/src/pages/Contas.tsx`, com arquivo vigente: substituir (mesmo POST) e remover com `window.confirm` + `contasService.removerComprovante`
- [x] T013 [US3] No formulário de edição em `frontend/src/pages/Contas.tsx`, substituir e remover com a mesma confirmação; GET continua abrindo anexo legado (FR-013)

**Checkpoint**: SC-006 / FR-008 / FR-009 / FR-013. US1 e US2 intactas

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Lint, tipos e roteiro de validação

- [x] T014 Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T015 Percorrer [quickstart.md](./quickstart.md); confirmar que `COMPROVANTES_DIR` não foi esvaziado e que Contas a Receber / NFs não mudaram nesta feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependência
- **Foundational (Phase 2)**: Depende do Setup — BLOQUEIA as histórias
- **US1 (Phase 3)**: Depende da Phase 2 — MVP (pasta fora)
- **US2 (Phase 4)**: Depende da Phase 2; pode seguir a US1 no mesmo `Contas.tsx`
- **US3 (Phase 5)**: Depende da US2 (precisa do vínculo na linha/formulário)
- **Polish (Phase 6)**: Depois das histórias desejadas

### User Story Dependencies

- **User Story 1 (P1)**: Depois da Phase 2 — MVP; independente do formulário de NF
- **User Story 2 (P1)**: Depois da Phase 2 (+ US1 no mesmo arquivo de página para evitar conflito)
- **User Story 3 (P2)**: Depois da US2 — substituir/remover o vínculo criado na US2

### Parallel Opportunities

- T001 ∥ T002 (leitura)
- T005 ∥ T006 (main.py vs Contas.tsx)
- T008 ∥ início da US2 no backend já feito (T003/T004)
- T009–T013 no mesmo `Contas.tsx`: **sequenciais**

### Parallel Example: User Story 1

```text
T005 backend/app/main.py
T006 frontend/src/pages/Contas.tsx
# depois T007 frontend/src/services/api.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + 2 (validação de upload)
2. Phase 3: pasta fora do produto
3. **STOP**: Independent Test da US1
4. Seguir US2 (vínculo) e US3 (corrigir)

### Incremental Delivery

1. Setup + Foundational → POST/GET de anexo alinhados ao contrato
2. US1 → demo: sem pasta
3. US2 → demo: NF por item + formulário
4. US3 → substituir/remover
5. Polish → lint + quickstart

### Parallel Team Strategy

Um desenvolvedor no `Contas.tsx`. Backend (T003–T005) pode adiantar em paralelo à inspeção T001.

---

## Notes

- Sem testes automatizados (não pedidos na spec)
- Não migrar colunas para `nota_fiscal_*`
- Não montar de novo `/api/arquivos-comprovantes`
- Não exigir arquivo para **Pagar**
- Não apagar arquivos da biblioteca compartilhada em disco
