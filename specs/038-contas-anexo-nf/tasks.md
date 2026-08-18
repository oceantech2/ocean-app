# Tasks: Anexo de NF em Contas a Receber e Contas a Pagar

**Input**: Design documents from `/specs/038-contas-anexo-nf/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/rest-contas-anexo-nf.md](./contracts/rest-contas-anexo-nf.md), [contracts/ui-contas-anexo-nf.md](./contracts/ui-contas-anexo-nf.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (US1 P1 → US2 P1 → US3 P2). Sem `[P]` quando o mesmo arquivo seria editado em paralelo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte; não criar app, menu nem portas novas

- [x] T001 Confirmar superfícies: Contas a Receber = `frontend/src/pages/NFs.tsx`; Contas a Pagar = `frontend/src/pages/Contas.tsx` já com coluna Nota fiscal e `/api/contas/{id}/comprovante` em `backend/app/api/routes/contas.py`; portas 8001/5193 inalteradas; não reabrir `backend/app/api/routes/arquivos_nfs.py` nem pasta de comprovantes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Helper de 2 MiB, colunas em `nfs` e contrato de listagem — bloqueia as histórias de Receber

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 [P] Criar `backend/app/services/anexo_nf.py` conforme [research.md](./research.md) e [data-model.md](./data-model.md): extensões `.pdf`/`.jpg`/`.jpeg`/`.png`; limite **2 145 728** bytes; validar extensão e tamanho (413 com detalhe “2 MB”); gravar/apagar em `UPLOAD_DIR`; MIME para GET `inline`
- [x] T003 [P] Em `backend/app/main.py` (`_migrar`): `ALTER TABLE nfs ADD COLUMN IF NOT EXISTS anexo_path TEXT` e `anexo_nome VARCHAR(255)` conforme [data-model.md](./data-model.md)
- [x] T004 Adicionar `anexo_path` e `anexo_nome` no model `NF` em `backend/app/models/__init__.py`
- [x] T005 [P] Incluir `anexo_nome: Optional[str] = None` em `NFResponse` em `backend/app/schemas.py` (nunca expor `anexo_path`)

**Checkpoint**: Helper e schema prontos; UI e rotas `/anexo` ainda não existem

---

## Phase 3: User Story 1 - Ver e anexar a NF em Contas a Receber (Priority: P1) 🎯 MVP

**Goal**: Coluna **Nota fiscal** na tabela de Contas a Receber (coluna **NF** continua o número); admin anexa PNG/JPEG/PDF ≤ 2 MB na linha e no formulário de edição; autenticados abrem o arquivo; visualizador só lê; sync Maggo não apaga o anexo

**Independent Test**: Admin anexa PDF ≤ 2 MB numa linha Maggo; a coluna mostra o nome e abre o arquivo; repetir pelo modal de editar em outra linha; recarregar a página e o anexo permanece; visualizador abre e não anexa

### Implementation for User Story 1

- [x] T006 [US1] Em `backend/app/api/routes/nfs.py`, implementar POST/GET `/{id}/anexo` usando `backend/app/services/anexo_nf.py` (admin no POST, autenticado no GET); listagem `GET /` devolve `anexo_nome`; garantir que `_sync_maggo_stub` **não** escreve `anexo_path`/`anexo_nome` ([contracts/rest-contas-anexo-nf.md](./contracts/rest-contas-anexo-nf.md))
- [x] T007 [US1] Ao excluir NF em `backend/app/api/routes/nfs.py`, remover o arquivo em disco se `anexo_path` existir (espelhar Pagar)
- [x] T008 [P] [US1] Em `frontend/src/types/index.ts` adicionar `anexo_nome?: string | null` em `NF`; em `frontend/src/services/api.ts` criar `nfsService.uploadAnexo` / `downloadAnexo` / (stub ou omitir delete até US3) alinhado ao REST
- [x] T009 [US1] Em `frontend/src/pages/NFs.tsx`, nova coluna **Nota fiscal** na grade (`COLUNAS` + células): Anexar (admin), nome clicável para abrir, traço para visualizador sem arquivo; validar extensão e 2 MB no cliente antes do POST; toast; coluna **NF** (número) inalterada ([contracts/ui-contas-anexo-nf.md](./contracts/ui-contas-anexo-nf.md))
- [x] T010 [US1] No modal criar/editar de `frontend/src/pages/NFs.tsx`, campo opcional de arquivo (mesmas regras); criar: POST NF depois POST anexo; cancelar sem POST anexo; arquivo inválido não grava anexo

**Checkpoint**: FR-001/FR-003/FR-004/FR-005/FR-007/FR-008/FR-011/FR-012/FR-014/FR-015 (anexar); SC-001 Receber; SC-007

---

## Phase 4: User Story 2 - Coluna NF e teto 2 MB em Contas a Pagar (Priority: P1)

**Goal**: Contas a Pagar mantém a coluna Nota fiscal; novos envios recusam > 2 MB com mensagem que cita 2 MB, no servidor e no cliente

**Independent Test**: Anexar JPEG ≤ 2 MB numa linha; tentar arquivo > 2 MB e ver recusa com “2 MB” sem alterar o vínculo anterior; visualizador só abre

### Implementation for User Story 2

- [x] T011 [US2] Em `backend/app/api/routes/contas.py`, passar POST `/{id}/comprovante` a usar `backend/app/services/anexo_nf.py` (teto 2 MiB, mesma lista de extensões); 413 com detalhe “2 MB”, não `UPLOAD_MAX_MB` ([contracts/rest-contas-anexo-nf.md](./contracts/rest-contas-anexo-nf.md))
- [x] T012 [US2] Em `frontend/src/pages/Contas.tsx`, recusar arquivo > 2 MB no seletor da linha e no formulário criar/editar (toast cita 2 MB) antes do POST; tratar 413 do servidor com a mesma mensagem

**Checkpoint**: FR-002/FR-005 em Pagar; SC-004; coluna já existente permanece

---

## Phase 5: User Story 3 - Substituir ou remover a NF (Priority: P2)

**Goal**: Admin substitui ou remove (com confirmação) o arquivo vigente na tabela e no formulário, em Receber e em Pagar; visualizador sem escrita

**Independent Test**: Com arquivo nas duas páginas, substituir por PNG ≤ 2 MB (linha e formulário) e depois remover; a linha volta a Anexar; visualizador não vê as ações

### Implementation for User Story 3

- [x] T013 [US3] Em `backend/app/api/routes/nfs.py`, DELETE `/{id}/anexo` (admin): apagar arquivo, zerar `anexo_path`/`anexo_nome`; 204 mesmo se já vazio; 403 visualizador ([contracts/rest-contas-anexo-nf.md](./contracts/rest-contas-anexo-nf.md))
- [x] T014 [US3] Completar `nfsService.deleteAnexo` em `frontend/src/services/api.ts` e, em `frontend/src/pages/NFs.tsx`, ações Substituir e Remover (`window.confirm`) na coluna e no modal de edição; POST substitui o vigente
- [x] T015 [US3] Confirmar em `frontend/src/pages/Contas.tsx` e `backend/app/api/routes/contas.py` que substituir/remover já existentes usam o teto 2 MB no novo envio e que visualizador continua só leitura

**Checkpoint**: FR-006/FR-009/FR-010/FR-013; SC-006

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e validação ponta a ponta

- [x] T016 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T017 Executar o roteiro de [quickstart.md](./quickstart.md) (admin e visualizador; Receber Maggo + recarga; Pagar 2 MB; não regressão em documentos de colaborador)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependência
- **Foundational (Phase 2)**: depende do Setup — **bloqueia** US1–US3
- **US1 (Phase 3)**: após Phase 2 — MVP Receber
- **US2 (Phase 4)**: após Phase 2 (T002); pode seguir em paralelo a US1 se ninguém editar os mesmos arquivos
- **US3 (Phase 5)**: após US1 (rotas/UI de Receber); Pagar já tem substituir/remover (T015 após T011/T012)
- **Polish (Phase 6)**: após as histórias desejadas

### User Story Dependencies

- **User Story 1 (P1)**: após Foundational — MVP
- **User Story 2 (P1)**: após T002; independente de US1 (arquivos `contas.py` / `Contas.tsx`)
- **User Story 3 (P2)**: após US1 para Receber; T015 após US2

### Within Each User Story

- Model/schema/helper antes das rotas
- Rotas antes do `api.ts` e da página
- Coluna da tabela antes (ou junto) do formulário na mesma página, em sequência para evitar conflito em `NFs.tsx`

### Parallel Opportunities

- T002 e T003 em paralelo
- T005 em paralelo a T004 (arquivos diferentes)
- T008 em paralelo ao início de T006
- US1 (`nfs.py`, `NFs.tsx`) e US2 (`contas.py`, `Contas.tsx`) em paralelo após T002
- T016 em paralelo a revisões de texto, não ao código instável

---

## Parallel Example: Foundational + US1 vs US2

```bash
# Phase 2:
Task: "Criar backend/app/services/anexo_nf.py"
Task: "ALTER nfs em backend/app/main.py"

# Após T002, em paralelo:
Task: "US1 rotas anexo em backend/app/api/routes/nfs.py"
Task: "US2 teto 2 MB em backend/app/api/routes/contas.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2
2. Phase 3 (US1) — coluna e anexo em Contas a Receber
3. **STOP**: validar anexar/abrir/recarga Maggo
4. Seguir US2 (2 MB em Pagar) e US3 (substituir/remover)

### Incremental Delivery

1. Setup + Foundational
2. US1 → demo Receber
3. US2 → demo Pagar 2 MB
4. US3 → correção de vínculo
5. Polish / quickstart

---

## Notes

- [P] = arquivos diferentes, sem dependência incompleta
- Sem testes automatizados (não pedidos)
- Não alterar `UPLOAD_MAX_MB` global
- Não reabrir pastas compartilhadas
- Commit por tarefa ou grupo lógico, só se o usuário pedir
