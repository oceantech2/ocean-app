# Tasks: Contas a Pagar — Fornecedor, cards e campos Conta/Tipo

**Input**: Design documents from `/specs/045-contas-pagar-campos/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (US1–US5). Evitar `[P]` em tarefas que editam o mesmo arquivo (`Contas.tsx`, `contas.py`) na mesma fase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US5 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`
- Página alvo: `frontend/src/pages/Contas.tsx`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte e dependências do plano

- [x] T001 Confirmar portas 5193/8001/5433 e escopo em [plan.md](./plan.md): alterar `backend/app/main.py`, `backend/app/models/__init__.py`, `backend/app/schemas.py`, `backend/app/api/routes/contas.py`, `backend/app/services/excel_io.py`, `frontend/src/types/index.ts`, `frontend/src/pages/Contas.tsx`; **não** alterar Dashboard nem cadastro de Fornecedores

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Coluna `tipo_despesa`, backfill de `caixa` e API base — bloqueia US3, US4 e US5

**⚠️ CRITICAL**: Histórias que persistem Tipo/Conta não começam até T006 concluir

- [x] T002 Adicionar em `backend/app/main.py` migração `_migrar`: `ALTER TABLE contas_pagar ADD COLUMN IF NOT EXISTS tipo_despesa VARCHAR(10) NOT NULL DEFAULT 'variavel'`; backfill `UPDATE contas_pagar SET caixa = :codigo_padrao WHERE caixa IS NULL` usando `codigo_padrao(db)` de `backend/app/services/caixas.py`
- [x] T003 Adicionar coluna `tipo_despesa` no model `ContaPagar` em `backend/app/models/__init__.py` (`String(10)`, NOT NULL, default `variavel`)
- [x] T004 Estender `ContaPagarCreate`, `ContaPagarUpdate` e `ContaPagarResponse` com `tipo_despesa: Literal['fixo','variavel']` (default `variavel`) e validador em `backend/app/schemas.py`
- [x] T005 [P] Adicionar `tipo_despesa?: 'fixo' | 'variavel'` em `ContaPagar` em `frontend/src/types/index.ts`
- [x] T006 Refatorar `criar_conta`, `atualizar_conta` e importação XLSX em `backend/app/api/routes/contas.py`: persistir `caixa` sempre (pendente ou paga) com default `codigo_padrao(db)`; **não** zerar `caixa` quando `pago=false`; validar `tipo_despesa`; validar `caixa` via `exigir_conta_corrente`; na importação, setar `caixa` padrão e `tipo_despesa='variavel'`

**Checkpoint**: Reiniciar backend; GET/POST/PUT `/api/contas` retornam/aceitam `tipo_despesa`; contas legadas com `caixa` preenchido após migração

---

## Phase 3: User Story 1 — Escolher Fornecedor cadastrado (Priority: P1) 🎯 MVP

**Goal**: Campo Fornecedor lista fornecedores ativos do cadastro unificado; vínculo opcional; inativo visível só na edição

**Independent Test**: Quickstart §2 — dois fornecedores ativos no select; salvar com/sem vínculo; inativo marcado na edição

### Implementation for User Story 1

- [x] T007 [US1] Em `frontend/src/pages/Contas.tsx`, garantir carregamento de fornecedores ativos via `colaboradoresService.listar(0, 500, true)` (opcional `{ tipo: 'fornecedor' }`); select com opção vazia “Sem fornecedor”
- [x] T008 [US1] Em `frontend/src/pages/Contas.tsx`, manter exibição de fornecedor inativo na edição (`fornecedor_nome (inativo)`) e na coluna da listagem conforme [contracts/ui-contas-pagar-campos.md](./contracts/ui-contas-pagar-campos.md)

**Checkpoint**: SC-001; FR-001, FR-002

---

## Phase 4: User Story 2 — Cards Total, Pago, A pagar e Vencido (Priority: P1)

**Goal**: Quatro cards na ordem correta, parcelas exclusivas, fonte = `contasFiltradas`

**Independent Test**: Quickstart §1 — Total = Pago + A pagar + Vencido; vencida não entra em A pagar; filtros refletem nos cards

### Implementation for User Story 2

- [x] T009 [US2] Em `frontend/src/pages/Contas.tsx`, calcular totais sobre `contasFiltradas`: `totalPago` (pagas), `totalVencido` (`isVencida`), `totalAPagar` (pendentes não vencidas), `totalGeral` (soma); remover cálculo antigo que somava todo pendente em um único card
- [x] T010 [US2] Em `frontend/src/pages/Contas.tsx`, renderizar grid de **4** cards na ordem **Total**, **Pago**, **A pagar**, **Vencido** com rótulos exatos e estilos alinhados aos cards atuais

**Checkpoint**: SC-002, SC-003; FR-003 a FR-005

---

## Phase 5: User Story 3 — Campo Conta no lançamento (Priority: P1)

**Goal**: Select **Conta** sempre visível; default corrente padrão; persistido mesmo pendente

**Independent Test**: Quickstart §3 — Conta visível sem data de pagamento; pendente mantém Conta; modal Pagar usa Conta gravada

### Implementation for User Story 3

- [x] T011 [US3] Em `frontend/src/pages/Contas.tsx`, exibir select **Conta** fora do condicional `form.data_pagamento` (sempre visível); rótulo **Conta**; opções = correntes ativas via `contasCorrentes.filter(c => c.ativo)`; default `codigoPadrao(contasCorrentes)` em `abrirCriar`
- [x] T012 [US3] Em `frontend/src/pages/Contas.tsx`, enviar `caixa` em `salvar()` sempre (criar e editar), não só quando há `data_pagamento`; manter `caixaInicialForm` em `abrirPago` para ação Pagar na listagem
- [x] T013 [US3] Em `frontend/src/pages/Contas.tsx`, renomear cabeçalho da coluna de **Conta corrente** para **Conta**; exibir `rotuloContaOrigem(conta.caixa, contasCorrentes)` para pendentes e pagas

**Checkpoint**: SC-005; FR-006 a FR-009

---

## Phase 6: User Story 4 — Tipo Fixo ou Variável (Priority: P1)

**Goal**: Campo Tipo obrigatório; default Variável na criação; coluna na listagem

**Independent Test**: Quickstart §4 — Variável pré-selecionado; Fixo persiste; coluna Tipo visível

### Implementation for User Story 4

- [x] T014 [US4] Em `frontend/src/pages/Contas.tsx`, adicionar `tipo_despesa: 'variavel'` em `FORM_INICIAL` e select **Tipo** (Fixo / Variável) no modal; default **Variável** em nova conta
- [x] T015 [US4] Em `frontend/src/pages/Contas.tsx`, incluir `tipo_despesa` no payload de `salvar()` e preencher em `abrirEditar()`; validar presença antes de salvar (toast se ausente)
- [x] T016 [US4] Em `frontend/src/pages/Contas.tsx`, adicionar coluna **Tipo** na tabela (rótulos Fixo / Variável a partir de `tipo_despesa`)

**Checkpoint**: SC-006, SC-008; FR-010, FR-011, FR-012

---

## Phase 7: User Story 5 — Exportar Conta e Tipo (Priority: P2)

**Goal**: Excel, CSV e PDF alinhados à listagem com Conta e Tipo

**Independent Test**: Quickstart §5 — export Excel e impressão PDF mostram Conta e Tipo iguais à tela

### Implementation for User Story 5

- [x] T017 [US5] Em `backend/app/api/routes/contas.py` (`exportar_contas_xlsx`) e `backend/app/services/excel_io.py` (`preencher_template_contas`), incluir coluna **Tipo** (Fixo/Variável) e manter **Conta corrente** com rótulo de `mapa_rotulos`
- [x] T018 [US5] Em `frontend/src/pages/Contas.tsx`, atualizar `exportar()` (CSV) para incluir colunas **Conta** e **Tipo** a partir de `contasFiltradas` (mesmos rótulos da tabela)
- [x] T019 [US5] Em `frontend/src/pages/Contas.tsx`, conferir que `window.print()` inclui colunas Conta e Tipo na tabela renderizada (ajustar classes/`print:` se alguma coluna estiver oculta na impressão)

**Checkpoint**: SC-009; FR-017

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Papéis, qualidade e validação ponta a ponta

- [x] T020 Em `frontend/src/pages/Contas.tsx`, conferir papel `visualizador`: vê cards/colunas; selects desabilitados; sem criar/editar/pagar (FR-014)
- [x] T021 Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T022 Percorrer [quickstart.md](./quickstart.md) (cenários 1–8) em `http://localhost:5193` contra API `8001`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende de T001 — **bloqueia** US3, US4, US5 (e parcialmente persistência de Conta)
- **US1 (Phase 3)**: Pode começar após Phase 1 (só frontend); independente da Phase 2
- **US2 (Phase 4)**: Pode começar após Phase 1 (só frontend); independente da Phase 2
- **US3 (Phase 5)**: Depende da Phase 2 (API `caixa` pendente)
- **US4 (Phase 6)**: Depende da Phase 2 (`tipo_despesa` na API)
- **US5 (Phase 7)**: Depende de US3/US4 (colunas e campos na listagem) + T017 backend
- **Polish (Phase 8)**: Depois das histórias desejadas

### User Story Dependencies

| Story | Depende de | Independente para teste |
|-------|------------|---------------------------|
| US1 Fornecedor | — | Sim (select + listagem) |
| US2 Cards | — | Sim (cálculo visual) |
| US3 Conta | Phase 2 | Sim após foundation |
| US4 Tipo | Phase 2 | Sim após foundation |
| US5 Export | US3, US4, T017 | Sim após colunas existirem |

### Parallel Opportunities

```text
Após T001:
  - T002 + T003 + T004 [P] (backend migration/model/schemas)
  - T005 [P] (frontend types) em paralelo com T002–T004

Após Phase 2:
  - US1 (T007–T008) e US2 (T009–T010) em paralelo [P] se devs distintos — mesmo arquivo Contas.tsx: serializar por dev

Após US3+US4:
  - T017 (backend export) [P] com T018 (CSV frontend) — arquivos diferentes
```

---

## Parallel Example: Foundational

```bash
# Backend em paralelo com types frontend:
T002: backend/app/main.py
T003: backend/app/models/__init__.py
T004: backend/app/schemas.py
T005: frontend/src/types/index.ts

# Depois, sequencial (mesmo arquivo):
T006: backend/app/api/routes/contas.py
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Phase 1 + Phase 2 (mínimo: T002–T006 se for testar Conta/Tipo cedo; ou pular Phase 2 para demo rápida de cards/fornecedor)
2. Phase 3 (US1) + Phase 4 (US2)
3. **Validar** quickstart §1–§2
4. Seguir US3 → US4 → US5

### Entrega incremental recomendada

1. Setup + Foundational → API pronta
2. US2 Cards → leitura gerencial imediata
3. US1 Fornecedor → cadastro operacional
4. US3 Conta + US4 Tipo → formulário completo
5. US5 Export → paridade fora do sistema
6. Polish → quickstart completo

### Escopo MVP mínimo (spec)

**US2 (cards)** entrega valor visível sem migration; **US1** já está quase pronto no código. Para MVP **funcional completo** da spec: Phase 2 + US1–US4.

---

## Notes

- Campo API `tipo_despesa` ≠ `tipo_fornecedor` do cadastro — não misturar
- Dashboard **fora de escopo** — não alterar `frontend/src/utils/dashboardDespesas.ts`
- Importação XLSX: sem novas colunas na planilha; defaults na API (T006)
- Total de tarefas: **22** (T001–T022)
- Por story: Setup 1 | Foundational 5 | US1 2 | US2 2 | US3 3 | US4 3 | US5 3 | Polish 3
