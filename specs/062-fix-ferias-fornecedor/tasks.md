# Tasks: Correção de Férias (fornecedor, listagem, direito e folha)

**Input**: Design documents from `/specs/062-fix-ferias-fornecedor/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Setup → Foundation (alias REST + serviço + utils) → US1–US3 (P1) → US4 (P2) → Polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US4 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/main.py`
- Frontend: `frontend/src/pages/Ferias.tsx`, `frontend/src/services/api.ts`, `frontend/src/utils/feriasCalculo.ts`
- Contratos: `specs/062-fix-ferias-fornecedor/contracts/`
- **Não alterar**: FK `ferias.colaborador_id`; schema POST/PUT de férias; card Total da Folha da página Fornecedores; regras de saldo/fracionamento (023); portas 5193/8001

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte da feature 062 (a 050 não chegou à operação)

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e [research.md](./research.md): Férias lista **todos os ativos** (sem `elegivel_equipe`); alias `/api/fornecedores`; override só na criação; ano sugerido; folha = Tipo Fixo; sem migration DDL; portas 5193/8001

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Alias REST, client e utils — bloqueia US1–US4

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 [P] Em `backend/app/main.py`, registrar o mesmo router de `colaboradores` em `prefix="/api/fornecedores"` (tags Fornecedores), mantendo `/api/colaboradores` — [contracts/rest-fornecedores-ferias.md](./contracts/rest-fornecedores-ferias.md), R2
- [x] T003 [P] Em `frontend/src/services/api.ts`, criar `fornecedoresService` apontando para `/fornecedores` com o mesmo `listar(skip, limit, ativo, opts?)` de `colaboradoresService` — [contracts/rest-fornecedores-ferias.md](./contracts/rest-fornecedores-ferias.md)
- [x] T004 [P] Em `frontend/src/utils/feriasCalculo.ts`, implementar `temDireitoAdquirido`, `sugerirAnoAquisitivo` e `totalFolhaFixo` (Fixo ativo; `tipo_fornecedor` nulo = fixo; salário null = 0) conforme [data-model.md](./data-model.md) e [research.md](./research.md) R3–R6

**Checkpoint**: `GET /api/fornecedores?ativo=true&limit=1000` retorna 200; utils importáveis; foundation liberada

---

## Phase 3: User Story 1 - Fornecedor na tela e nomes no Novo Período (Priority: P1) 🎯 MVP

**Goal**: Rótulos **Fornecedor**; Novo Período e filtro listam os **mesmos nomes** da página Fornecedores (ativos, Fixo e Spot)

**Independent Test**: [quickstart.md](./quickstart.md) cenário 1 — seletor com nomes; inativo fora; toast se a carga falhar; SC-001 / SC-002

### Implementation for User Story 1

- [x] T005 [US1] Em `frontend/src/pages/Ferias.tsx`, trocar `colaboradoresService` por `fornecedoresService.listar(0, 1000, true)` **sem** `elegivel_equipe`; em falha, `toast.error` (não silenciar) — FR-002, FR-003, R1
- [x] T006 [US1] Em `frontend/src/pages/Ferias.tsx`, substituir textos voltados ao usuário **Colaborador → Fornecedor** (título, filtro, tabela, aviso de pendência, sobreposição, export CSV visível) — FR-001, [contracts/ui-ferias-fornecedor.md](./contracts/ui-ferias-fornecedor.md)
- [x] T007 [US1] Em `frontend/src/pages/Ferias.tsx`, no `ImportCSV`, orientar exemplo/rótulo visível a **fornecedor**; payload da API permanece `colaborador_id` — FR-001, R7

**Checkpoint**: SC-001 / SC-002 / MVP — cadastro de período utilizável com nomes

---

## Phase 4: User Story 2 - Direito após 1 ano e ano sugerido (Priority: P1)

**Goal**: Direito após 12 meses da data de entrada; override na criação; ano sugerido e editável

**Independent Test**: [quickstart.md](./quickstart.md) cenários 2–3 — confirm cancel/ok; ≥ 1 ano sem confirm; ano futuro vs corrente; edição não recalcula ano; SC-003

### Implementation for User Story 2

- [x] T008 [US2] Em `frontend/src/pages/Ferias.tsx`, na **criação**, ao selecionar ou trocar fornecedor, preencher `form.ano` com `sugerirAnoAquisitivo(data_admissao)`; o admin pode alterar; na **edição**, não recalcular — FR-013, R4
- [x] T009 [US2] Em `frontend/src/pages/Ferias.tsx`, no `salvar` de **criação**, se `!temDireitoAdquirido(data_admissao)`, `window.confirm`; Cancelar aborta e mantém o modal; OK grava com direito normal (30 no primeiro do ano). Na **edição**, não re-pedir override — FR-004, FR-005, FR-006, R3

**Checkpoint**: SC-003 / US2 independente (lista da US1 já disponível)

---

## Phase 5: User Story 3 - Datas de início e término opcionais (Priority: P1)

**Goal**: Gozo sem datas obrigatórias; uma data só permitida; intervalo invertido bloqueia

**Independent Test**: [quickstart.md](./quickstart.md) cenário 4 — salvar sem datas; só uma data; fim &lt; início bloqueia; SC-004

### Implementation for User Story 3

- [x] T010 [US3] Em `frontend/src/pages/Ferias.tsx`, garantir Data Início / Data Fim **sem** asterisco de obrigatório; payload `null` se vazio; permitir salvar com zero ou uma data; manter bloqueio de `intervaloInvertido` e sugestão de dias via `diasCorridos` — FR-007, FR-008, FR-009, R5

**Checkpoint**: SC-004 / datas alinhadas ao contrato UI

---

## Phase 6: User Story 4 - Salário e card Total da Folha (Priority: P2)

**Goal**: Salário somente leitura (coluna + modal); card soma só Tipo Fixo ativos

**Independent Test**: [quickstart.md](./quickstart.md) cenário 5 — Todos = soma Fixo; filtro Fixo; filtro Spot = 0; ano não muda o card; SC-005

### Implementation for User Story 4

- [x] T011 [US4] Em `frontend/src/pages/Ferias.tsx`, exibir coluna **Salário** (BRL ou “—”) na tabela e campo somente leitura no modal a partir do cadastro carregado — FR-010, [contracts/ui-ferias-fornecedor.md](./contracts/ui-ferias-fornecedor.md)
- [x] T012 [US4] Em `frontend/src/pages/Ferias.tsx`, renderizar card **Total da Folha** sempre visível usando `totalFolhaFixo` + filtro de fornecedor (Todos / Fixo / Spot=0); filtro de ano **não** entra — FR-011, R6

**Checkpoint**: SC-005 / US4 completa

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Papéis, qualidade estática e smoke E2E

- [x] T013 Em `frontend/src/pages/Ferias.tsx`, confirmar que `visualizador` vê listagem, salários e Total da Folha e **não** vê criar/editar/aprovar/excluir — FR-012, SC-006
- [x] T014 Executar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T015 Percorrer os cenários 1–6 de [quickstart.md](./quickstart.md) (admin + visualizador; smoke `GET /api/fornecedores`)

**Checkpoint**: Feature pronta para aceite

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as histórias
- **US1 (Phase 3)**: Depende da Foundation — MVP
- **US2 (Phase 4)**: Depende da Foundation + seletor da US1 (precisa do fornecedor escolhido)
- **US3 (Phase 5)**: Depende da Foundation; pode validar datas no mesmo modal da US1
- **US4 (Phase 6)**: Depende da Foundation + carga de fornecedores da US1 (salário/folha vêm da lista)
- **Polish (Phase 7)**: Depende das histórias desejadas

### User Story Dependencies

- **US1 (P1)**: Após Phase 2 — sem dependência de outras histórias
- **US2 (P1)**: Após US1 no mesmo `Ferias.tsx` (mesmo arquivo; sequencial na prática)
- **US3 (P1)**: Independente em regra; sequencial no mesmo arquivo após US1
- **US4 (P2)**: Independente em regra; precisa da lista da US1 para somar salários

### Within Each User Story

- Utils (Phase 2) antes de ligar a UI
- Carga/nomenclatura (US1) antes de override/ano (US2) e folha (US4)
- Sem tarefas de teste TDD (não pedidas)

### Parallel Opportunities

- T002, T003 e T004 em paralelo (arquivos distintos)
- Depois da Foundation, um único implementador em `Ferias.tsx` (T005–T013) — **não** paralelizar no mesmo arquivo
- T014 pode começar quando T013 terminar

---

## Parallel Example: Foundation

```bash
Task: "Alias /api/fornecedores em backend/app/main.py"
Task: "fornecedoresService em frontend/src/services/api.ts"
Task: "Utils em frontend/src/utils/feriasCalculo.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: US1 (nomes no seletor + rótulo Fornecedor)
4. **STOP and VALIDATE**: quickstart cenário 1
5. Demo se o cadastro de período voltou a ser usável

### Incremental Delivery

1. Setup + Foundation
2. US1 → nomes + nomenclatura (MVP)
3. US2 → direito 1 ano + ano sugerido
4. US3 → datas opcionais
5. US4 → salário + Total da Folha
6. Polish → visualizador + lint + quickstart completo

### Parallel Team Strategy

Foundation em paralelo (3 arquivos). Histórias US1–US4 no mesmo `Ferias.tsx`: um implementador sequencial, ou extrair subcomponentes antes de paralelizar.

---

## Notes

- [P] = arquivos diferentes, sem dependência incompleta
- [US1]–[US4] = rastreio às histórias da spec
- Payload de férias continua `colaborador_id`
- Não redesenhar importador além de rótulo visível
- Validar cada checkpoint pelo [quickstart.md](./quickstart.md)
