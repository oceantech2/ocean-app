# Tasks: Contas a Receber — Campos Maggo e Ocean

**Input**: Design documents from `/specs/018-contas-receber-campos/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados no spec — validação manual via [quickstart.md](./quickstart.md) + `npm run lint` / `npm run type-check`

**Organization**: Tasks agrupadas por user story para entrega incremental e teste independente

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: User story (US1–US4)
- Incluir caminhos de arquivo exatos nas descrições

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`
- Contratos: `specs/018-contas-receber-campos/contracts/`
- Modelo: `specs/018-contas-receber-campos/data-model.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline (merge por `numero`, datas NOT NULL, Maggo sobrescreve emissão/vencimento) antes de editar código

- [X] T001 Revisar `specs/018-contas-receber-campos/plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api-contas-receber-campos.md` e `contracts/ui-contas-receber-campos.md` e confirmar escopo (merge `maggo_id`; Maggo RO; Ocean lança NF; sem OCR; DRE inalterado)
- [X] T002 [P] Inspecionar `_sync_maggo_stub`, `_CAMPOS_NEGOCIO`, `_calcular_status_nf`, `criar_nf` e filtro `data_emissao` em `backend/app/api/routes/nfs.py`
- [X] T003 [P] Inspecionar `FORM_INICIAL`, `negocioEditavel`, colunas da tabela, modal e `salvar` em `frontend/src/pages/NFs.tsx`; colunas `NF` em `backend/app/models/__init__.py` e `NFCreate` em `backend/app/schemas.py`; shape em `backend/app/services/maggo_stub.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Persistência e ingestão Maggo no contrato novo — bloqueia US1–US4 (sem isso o GET continua merge por NF e datas obrigatórias)

**⚠️ CRITICAL**: Nenhuma story de UI/PUT até colunas, stub e sync por `maggo_id` existirem

- [X] T004 [P] Em `backend/app/models/__init__.py`, adicionar `maggo_id`, `valor_imposto`, `data_ent_pgto`; tornar `data_emissao` e `data_vencimento` `nullable=True` — [data-model.md](./data-model.md)
- [X] T005 [P] Em `backend/app/main.py` (`_migrar`), `ALTER` das três colunas, `DROP NOT NULL` das datas, índice único parcial `ix_nfs_maggo_id` e backfill `maggo_id = numero` onde `origem = 'maggo'` — [data-model.md](./data-model.md)
- [X] T006 [P] Em `backend/app/services/maggo_stub.py`, passar a enviar `maggo_id`, `valor_imposto`, `data_ent_pgto`; **não** enviar `numero`/`data_emissao`/`data_vencimento`; manter `MAGGO-001`…`005` e incluir `MAGGO-006` novo (nasce sem NF) — [research.md](./research.md) R-009
- [X] T007 [P] Em `frontend/src/types/index.ts`, adicionar `maggo_id?`, `valor_imposto?`, `data_ent_pgto?`; tornar `data_emissao` e `data_vencimento` `string | null`
- [X] T008 Em `backend/app/schemas.py`, tornar `data_emissao`/`data_vencimento` opcionais em `NFCreate`/`NFBase`; incluir `valor_imposto`, `data_ent_pgto`, `maggo_id` em create/update/response — [contracts/api-contas-receber-campos.md](./contracts/api-contas-receber-campos.md)
- [X] T009 Em `backend/app/api/routes/nfs.py`, reescrever `_sync_maggo_stub` para merge por `maggo_id`; insert com Ocean NULL e `status=pendente`; update **só** grupo Maggo (ignorar NF/emissão/vencimento do payload); pular item sem `maggo_id` ou tipo desconhecido — [contracts/api-contas-receber-campos.md](./contracts/api-contas-receber-campos.md)

**Checkpoint**: Restart API; `GET /api/nfs` traz Maggo com `maggo_id`, imposto, data ent. pgto; `MAGGO-006` com `numero` null; linhas 001–005 preservam NF legado

---

## Phase 3: User Story 1 — Ver campos Maggo separados dos Ocean (Priority: P1) 🎯 MVP

**Goal**: Listagem/edição distinguem grupo Maggo (RO na origem Maggo) e grupo Ocean (editável). Create manual exige só empresa, método, bruto e líquido. Visualizador só consulta.

**Independent Test**: Abrir `/nfs`; editar Maggo — vaga/empresa/valores readonly, NF/emissão/vencimento/pagamento editáveis; criar manual só com empresa+método+valores; visualizador sem escrita — [quickstart.md](./quickstart.md) UI 3 e 6

### Implementation for User Story 1

- [X] T010 [US1] Em `backend/app/api/routes/nfs.py`, separar allowlist: PUT Maggo **rejeita** grupo Maggo (`razao_social`, `posicao`, `candidato`, `valor_bruto`, `valor_imposto`, `valor_liquido`, `tipo`, `data_ent_pgto`) e **aceita** Ocean (`numero`, `data_emissao`, `data_vencimento`, pagamento, Caixa, colaboradores, `arquivada`); `criar_nf` persiste só obrigatórios + opcionais nulos (`origem=manual`, status pendente) — [contracts/api-contas-receber-campos.md](./contracts/api-contas-receber-campos.md)
- [X] T011 [P] [US1] Em `frontend/src/services/api.ts`, ajustar payload create/update para enviar `valor_imposto`, `data_ent_pgto` e datas/`numero` como `null` quando vazios (não string vazia de data)
- [X] T012 [US1] Em `frontend/src/pages/NFs.tsx`, modal em dois blocos (Dados Maggo / Dados Ocean); rótulos **Vaga**, **Empresa**, **Método de pagamento**; Maggo RO no grupo Maggo; Ocean editável também na origem Maggo; create: `*` só em Empresa, Método, Bruto, Líquido; PUT Maggo **não** envia grupo Maggo — [contracts/ui-contas-receber-campos.md](./contracts/ui-contas-receber-campos.md)

**Checkpoint**: MVP — split visível; Maggo não edita fechamento; admin lança Ocean; create mínimo funciona

---

## Phase 4: User Story 2 — Preencher NF, emissão, vencimento, pagamento e status (Priority: P1)

**Goal**: Conta Maggo existe sem nota; admin completa Ocean; status derivado (sem vencimento = pendente; vencida só com vencimento passado; paga com pagamento). Sync Maggo não apaga a NF.

**Independent Test**: `MAGGO-006` na lista sem NF (pendente); lançar emissão+vencimento; vencimento passado → vencida; Recebido+Caixa sem vencimento → paga; F5 não some a NF — [quickstart.md](./quickstart.md) UI 2–5 e 7

### Implementation for User Story 2

- [X] T013 [US2] Em `backend/app/api/routes/nfs.py`, garantir `_calcular_status_nf(data_vencimento: date | None, …)` (None → pendente, não vencida); recalc no PUT quando mudam `data_vencimento` ou `data_pagamento`; `criar_nf`/`atualizar_nf` não inventam `date.today()` para datas ausentes
- [X] T014 [US2] Em `frontend/src/pages/NFs.tsx`, permitir salvar Ocean Maggo sem NF/emissão/vencimento; Recebido continua exigindo Caixa+data; Status somente leitura (badge); toast de Maggo 422 se tentar alterar grupo Maggo

**Checkpoint**: US1+US2 — ciclo Maggo sem nota → lançamento Ocean → status correto; sync preserva NF

---

## Phase 5: User Story 3 — NF e data de emissão no mesmo passo (Priority: P2)

**Goal**: Número da NF e data de emissão ficam juntos no formulário Ocean; se houver número, emissão é obrigatória; emissão sem número é permitida

**Independent Test**: Modal: NF e emissão adjacentes; salvar número sem emissão → bloqueio; salvar os dois → F5 preenchidos; emissão sem NF → aceito — [quickstart.md](./quickstart.md) UI 4

### Implementation for User Story 3

- [X] T015 [US3] Em `backend/app/schemas.py` (e/ou `criar_nf`/`atualizar_nf` em `backend/app/api/routes/nfs.py`), se `numero` preenchido após trim, exigir `data_emissao` (422); emissão sem número permitida — [contracts/api-contas-receber-campos.md](./contracts/api-contas-receber-campos.md)
- [X] T016 [US3] Em `frontend/src/pages/NFs.tsx`, colocar **NF** e **Data de emissão** lado a lado no bloco Ocean; validação client espelhando T015 (toast claro)

**Checkpoint**: FR-006/FR-010 — mesmo passo; número implica emissão

---

## Phase 6: User Story 4 — Imposto e data ent. pgto na listagem (Priority: P2)

**Goal**: Listagem e exportação mostram imposto e data ent. pgto (distintos de pagamento); Maggo sem emissão continua visível no filtro de período

**Independent Test**: Colunas Imposto e Data ent. pgto; `0` ≠ `—`; filtro mês/ano ainda lista `MAGGO-006`; CSV inclui os campos — [quickstart.md](./quickstart.md) UI 2

### Implementation for User Story 4

- [X] T017 [US4] Em `backend/app/api/routes/nfs.py` (`listar_nfs` e export XLSX da rota, se usar o mesmo filtro), filtrar mês/ano por `COALESCE(data_emissao, data_ent_pgto, criado_em::date)` — **não** alterar Relatórios/Dashboard — [research.md](./research.md) R-005
- [X] T018 [US4] Em `frontend/src/pages/NFs.tsx`, colunas mínimas FR-014 (Vaga, Empresa, Método, Bruto, Imposto, Líquido, Data ent. pgto, NF, Emissão, Vencimento, Pagamento, Status); nulos como **—**; imposto `0` formatado em R$; export CSV com os mesmos campos — [contracts/ui-contas-receber-campos.md](./contracts/ui-contas-receber-campos.md)
- [X] T019 [P] [US4] Em `backend/app/services/excel_io.py`, incluir colunas `valor_imposto` e `data_ent_pgto` (e rótulos) no export XLSX de contas a receber, se o arquivo for gerado por esse serviço

**Checkpoint**: Listagem operacional no novo modelo; filtro não esconde Maggo sem nota

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Fechar validação ponta a ponta sem alargar escopo

- [X] T020 Percorrer [quickstart.md](./quickstart.md) (smoke API + UI admin + visualizador) e corrigir regressões em `backend/app/api/routes/nfs.py` e `frontend/src/pages/NFs.tsx`
- [X] T021 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as stories
- **US1 (Phase 3)**: Depende da Phase 2 — MVP
- **US2 (Phase 4)**: Depende de US1 (mesmo modal/PUT Ocean)
- **US3 (Phase 5)**: Depende de US2 (regra NF+emissão sobre o lançamento Ocean)
- **US4 (Phase 6)**: Depende da Phase 2 (campos na API); pode seguir US1 para a tabela, mas o filtro COALESCE é independente da US3
- **Polish (Phase 7)**: Depende das stories que se deseja validar

### User Story Dependencies

- **US1 (P1)**: Após Phase 2 — split UI + allowlist + create mínimo
- **US2 (P1)**: Após US1 — status e ciclo sem nota
- **US3 (P2)**: Após US2 — adjacência + 422 número sem emissão
- **US4 (P2)**: Após Phase 2 (+ US1 para rótulos na tabela) — colunas, export, filtro período

### Within Each User Story

- Modelo/schema/sync (Phase 2) antes de UI
- Allowlist/create (US1) antes de status (US2)
- Validator NF→emissão (US3) depois que o save Ocean já funciona
- Sem TDD (spec não pediu)

### Parallel Opportunities

- T002 e T003 (inspect)
- T004, T005, T006, T007 (model / migrar / stub / types)
- T011 (`api.ts`) em paralelo com T010 se o contrato de payload já estiver claro
- T019 (`excel_io.py`) em paralelo com T018 (`NFs.tsx`) após T017

---

## Parallel Example: Phase 2

```bash
Task: "Colunas novas e datas nullable em backend/app/models/__init__.py"
Task: "ALTER/backfill em backend/app/main.py"
Task: "Shape novo em backend/app/services/maggo_stub.py"
Task: "Tipos em frontend/src/types/index.ts"
```

## Parallel Example: User Story 4

```bash
Task: "Colunas e CSV em frontend/src/pages/NFs.tsx"
Task: "Colunas XLSX em backend/app/services/excel_io.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational (colunas + stub + sync `maggo_id`)
3. Phase 3: US1 (split Maggo/Ocean + create mínimo)
4. **STOP and VALIDATE**: editar Maggo RO vs Ocean; create sem datas
5. Demo se pronto

### Incremental Delivery

1. Setup + Foundational
2. US1 → MVP visual e allowlist
3. US2 → status e ciclo sem nota
4. US3 → NF + emissão no mesmo passo
5. US4 → listagem/export/filtro
6. Polish + quickstart

### Parallel Team Strategy

1. Time fecha Setup + Foundational
2. Dev A: US1 + US3 (`NFs.tsx` modal)
3. Dev B: US2 (`nfs.py` status/PUT) + US4 filtro
4. Dev C: US4 colunas/export (`NFs.tsx` tabela + `excel_io.py`) — coordenar com Dev A no mesmo arquivo

---

## Notes

- [P] = arquivos diferentes, sem dependência de tarefa incompleta
- Sem tarefas de teste automatizado (spec não pediu TDD)
- Não renomear colunas `razao_social` / `posicao` / `tipo` — só rótulos na UI
- Não alterar eixo de data de Dashboard/Relatórios (`data_emissao` = faturado)
- Sem OCR, pasta de NFs, import ou exclusão
- Commit por tarefa ou grupo lógico, se o usuário pedir
