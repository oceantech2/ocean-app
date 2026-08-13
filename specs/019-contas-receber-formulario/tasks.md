# Tasks: Contas a Receber — Subtítulo, Recebido e Caixa oculta

**Input**: Design documents from `/specs/019-contas-receber-formulario/`

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
- Contratos: `specs/019-contas-receber-formulario/contracts/`
- Modelo: `specs/019-contas-receber-formulario/data-model.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline (rótulos Vaga/Empresa, modal Pagar+Caixa, colaboradores na edição, 422 de Caixa) antes de editar código

- [x] T001 Revisar `specs/019-contas-receber-formulario/plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api-contas-receber-formulario.md` e `contracts/ui-contas-receber-formulario.md` e confirmar escopo (Título=`posicao`, Subtítulo=`razao_social`, célula única, Caixa só na transição, sem migration, Candidato inalterado)
- [x] T002 [P] Inspecionar `criar_nf`, `atualizar_nf`, `_MSG_CAIXA_OBRIGATORIA` e export XLSX em `backend/app/api/routes/nfs.py`; coluna Caixa em `backend/app/services/excel_io.py`
- [x] T003 [P] Inspecionar colunas Vaga/Empresa/Caixa, `abrirPagar`/`confirmarPagamento`, selects Lead/Condução/Placement, `salvar` e `exportar` em `frontend/src/pages/NFs.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Persistência de Caixa no recebimento novo — bloqueia US2 e US3 (sem isso o POST/PUT ainda exige escolha corrente/investimento)

**⚠️ CRITICAL**: Não implementar o modal Recebido sem Caixa até o backend gravar `corrente` na transição

- [x] T004 Em `backend/app/api/routes/nfs.py` (`criar_nf`), se `data_pagamento` vier preenchido gravar `caixa='corrente'` (ignorar `investimento` ou ausência); **não** retornar 422 por falta de Caixa — [contracts/api-contas-receber-formulario.md](./contracts/api-contas-receber-formulario.md) · [research.md](./research.md) R-002
- [x] T005 Em `backend/app/api/routes/nfs.py` (`atualizar_nf`), se `data_pagamento` passar de `NULL` para preenchido gravar `caixa='corrente'`; se `caixa` **não** vier no body, **não** alterar a coluna; se a conta já tinha pagamento, **não** converter investimento; remover o 422 “Caixa obrigatória” nesses fluxos — [data-model.md](./data-model.md)

**Checkpoint**: Restart API; POST já recebido sem `caixa` → 201 e `caixa=corrente`; PUT só vencimento em conta investimento **não** muda Caixa

---

## Phase 3: User Story 1 — Título e subtítulo no lançamento manual (Priority: P1) 🎯 MVP

**Goal**: Formulário usa **Título** (`posicao`) e **Subtítulo** (`razao_social`); subtítulo obrigatório no manual; Maggo RO; listagem com uma célula (título em destaque, subtítulo abaixo). Candidato inalterado.

**Independent Test**: Abrir “Nova conta a receber” e ver Título + Subtítulo (não Vaga/Empresa); salvar manual e ver os dois na mesma célula da lista; Maggo com Título/Subtítulo somente leitura — [quickstart.md](./quickstart.md) UI 2–4

### Implementation for User Story 1

- [x] T006 [US1] Em `frontend/src/pages/NFs.tsx`, no modal de criação e edição, trocar rótulos **Vaga** → **Título** e **Empresa** → **Subtítulo**; manter `*` só em Subtítulo/Método/Bruto/Líquido; Título opcional; Maggo continua `INPUT_RO` nesses dois campos — [contracts/ui-contas-receber-formulario.md](./contracts/ui-contas-receber-formulario.md)
- [x] T007 [US1] Em `frontend/src/pages/NFs.tsx`, substituir as colunas **Vaga** e **Empresa** por uma coluna **Título**: linha 1 = `posicao` (destaque, `—` se vazio); linha 2 = `razao_social` (menor/cinza); vale para Maggo e manual — [contracts/ui-contas-receber-formulario.md](./contracts/ui-contas-receber-formulario.md)

**Checkpoint**: MVP — rótulos e célula única visíveis; create manual com subtítulo obrigatório

---

## Phase 4: User Story 2 — Marcar como recebido só com a data (Priority: P1)

**Goal**: Ação rápida e modal usam **Recebido**; único campo = data de pagamento; transições enviam `caixa: 'corrente'`; demais PUTs omitem `caixa`.

**Independent Test**: Conta pendente → Recebido → modal só data → status paga e GET `caixa=corrente`; sem data → toast; contas paga/arquivada com ação desabilitada — [quickstart.md](./quickstart.md) UI 5

### Implementation for User Story 2

- [x] T008 [US2] Em `frontend/src/pages/NFs.tsx`, trocar `title`/`aria-label` **Pagar** → **Recebido**; título do modal e botão para vocabulário de recebimento (**Recebido** / **Confirmar recebimento**); remover o select de Caixa do modal; manter default da data = hoje — [contracts/ui-contas-receber-formulario.md](./contracts/ui-contas-receber-formulario.md)
- [x] T009 [US2] Em `frontend/src/pages/NFs.tsx` (`confirmarPagamento` e `salvar`), na transição pendente→recebido (e create já recebido) enviar `data_pagamento` + `caixa: 'corrente'`; nas outras edições **omitir** `caixa`; toast se Recebido sem data (não usar `MSG_CAIXA_OBRIGATORIA`) — [research.md](./research.md) R-002 · R-005

**Checkpoint**: US1+US2 — Recebido funciona só com data; backend grava corrente

---

## Phase 5: User Story 3 — Não ver Caixa em Contas a Receber (Priority: P1)

**Goal**: Caixa some da tabela, formulários e exportações desta página; legado investimento permanece até novo recebimento.

**Independent Test**: Listagem/criação/edição/modal sem Caixa; CSV sem coluna Caixa; conta investimento editando só vencimento mantém Caixa no GET — [quickstart.md](./quickstart.md) UI 2, 3, 6, 7

### Implementation for User Story 3

- [x] T010 [US3] Em `frontend/src/pages/NFs.tsx`, remover coluna Caixa da tabela, o campo Caixa do create/edit, `caixaPagarForm`/`caixaLabel` se ficarem sem uso, e a exigência visual de Caixa quando Recebido — [contracts/ui-contas-receber-formulario.md](./contracts/ui-contas-receber-formulario.md)
- [x] T011 [P] [US3] Em `backend/app/services/excel_io.py`, omitir a coluna Caixa acrescentada no XLSX de NFs (`GET /api/nfs/exportar-xlsx`); manter lead/condução/placement do template — [research.md](./research.md) R-006
- [x] T012 [US3] Em `frontend/src/pages/NFs.tsx` (`exportar`), CSV com **Título** e **Subtítulo** (não Vaga/Empresa) e **sem** Caixa — [contracts/ui-contas-receber-formulario.md](./contracts/ui-contas-receber-formulario.md)

**Checkpoint**: US1–US3 — Caixa invisível nesta página; XLSX da página sem Caixa

---

## Phase 6: User Story 4 — Edição sem Lead, Condução e Placement (Priority: P2)

**Goal**: Formulário de criação/edição não mostra os três colaboradores; PUT **omite** os IDs (não envia `null`). Relatórios inalterados.

**Independent Test**: Abrir edição Maggo e manual — sem Lead/Condução/Placement; salvar vencimento/título **não** zera vínculos (conferir GET ou Relatórios) — [quickstart.md](./quickstart.md) UI 3–4

### Implementation for User Story 4

- [x] T013 [US4] Em `frontend/src/pages/NFs.tsx`, remover os selects Lead/Condução/Placement do modal; em `salvar`, **não** incluir `colaborador_lead_id`, `colaborador_conducao_id` nem `colaborador_placement_id` no payload — [research.md](./research.md) R-003 · [contracts/ui-contas-receber-formulario.md](./contracts/ui-contas-receber-formulario.md)

**Checkpoint**: Form limpo; vínculos antigos preservados

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validação ponta a ponta e qualidade

- [x] T014 Rodar `npm run lint` e `npm run type-check` em `frontend/` e corrigir erros introduzidos em `frontend/src/pages/NFs.tsx`
- [x] T015 Percorrer [quickstart.md](./quickstart.md) (smoke POST/PUT + UI admin e visualizador) e conferir SC-001–SC-008

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia US2 e US3** (regra de Caixa)
- **US1 (Phase 3)**: Pode começar após Setup (só UI de rótulos/célula); não depende do backend de Caixa
- **US2 (Phase 4)**: Depende da Phase 2 (T004–T005)
- **US3 (Phase 5)**: Depende da US2 (modal/form já sem escolha de Caixa) e da Phase 2
- **US4 (Phase 6)**: Independente da Caixa; mesmo arquivo `NFs.tsx` — fazer **depois** de US1–US3 para evitar conflito
- **Polish (Phase 7)**: Depois das stories desejadas

### User Story Dependencies

- **US1 (P1)**: Após Setup — MVP de identificação
- **US2 (P1)**: Após Foundational; complementar à US1
- **US3 (P1)**: Após US2 (remove o que restar de Caixa na UI/export)
- **US4 (P2)**: Após US1–US3 no mesmo arquivo, ou isolada se só T013

### Within Each User Story

- Sem testes automatizados (não pedidos)
- UI depois da regra de API quando a story grava recebimento (US2)
- Story completa antes da próxima no mesmo arquivo

### Parallel Opportunities

- T002 e T003 (arquivos diferentes)
- T011 (`excel_io.py`) em paralelo com T010 (`NFs.tsx`)
- US1 pode avançar enquanto T004–T005 no backend

---

## Parallel Example: Setup

```bash
Task: "Inspecionar criar_nf/atualizar_nf em backend/app/api/routes/nfs.py"
Task: "Inspecionar colunas e modal em frontend/src/pages/NFs.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Remover Caixa da UI em frontend/src/pages/NFs.tsx"
Task: "Omitir coluna Caixa em backend/app/services/excel_io.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 3: US1 (rótulos + célula) — **STOP e validar**
3. Demo: listagem e modal com Título/Subtítulo

### Incremental Delivery

1. Setup → US1 (identificação)
2. Foundational + US2 (Recebido só com data)
3. US3 (Caixa invisível + export)
4. US4 (sem colaboradores no form)
5. Polish / quickstart

### Parallel Team Strategy

- Dev A: T004–T005 (backend) + T011 (XLSX)
- Dev B: T006–T010, T012–T013 (`NFs.tsx`) — sequencial no mesmo arquivo

---

## Notes

- `[P]` só quando arquivos diferentes e sem dependência
- Sem migration e sem endpoint novo
- PUT **omitir** `caixa` e `colaborador_*` — não enviar `null`
- Candidato permanece na edição
- Dashboard, Relatórios, DH, Calendário e Fluxo de Caixa fora
- Validar no checkpoint de cada story com o [quickstart.md](./quickstart.md)
