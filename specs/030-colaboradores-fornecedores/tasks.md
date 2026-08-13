# Tasks: Colaboradores e Fornecedores — cadastros separados

**Input**: Design documents from `/specs/030-colaboradores-fornecedores/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/rest-cadastro-pessoas.md](./contracts/rest-cadastro-pessoas.md), [contracts/ui-colaboradores-fornecedores.md](./contracts/ui-colaboradores-fornecedores.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (P1 US1 → US2 → US3 → US5, depois P2 US4). Sem `[P]` quando o mesmo arquivo seria editado em paralelo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US5 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar o recorte; não criar app nem dependências novas

- [x] T001 Confirmar portas 8001/5193/5433 e que o cadastro vive em `frontend/src/pages/Colaboradores.tsx` + `backend/app/api/routes/colaboradores.py` (sem item de menu novo em `frontend/src/components/Layout.tsx`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Colunas, modelo, schemas, filtro `tipo` na API e tipos TS — bloqueia todas as histórias

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Em `backend/app/main.py` (`_migrar`): adicionar colunas `tipo`, `tipo_documento`, `documento`, `razao_social`, `telefone`, `email` em `colaboradores`; backfill (`tipo=colaborador`, dígitos de `cpf` em `documento`); DROP NOT NULL em `cargo`/`salario`/`data_nascimento`; remover UNIQUE de `cpf`; criar índice parcial `ux_colaboradores_tipo_documento_ativo`; adicionar `contas_pagar.fornecedor_id` (FK) conforme [data-model.md](./data-model.md)
- [x] T003 Atualizar `Colaborador` e `ContaPagar` em `backend/app/models/__init__.py` (`tipo`, documento, contato, `fornecedor_id` + relationship)
- [x] T004 Estender schemas de cadastro e de conta em `backend/app/schemas.py` (`tipo` default colaborador, `tipo_documento`, `documento`, `razao_social`, `telefone`, `email`; campos de RH opcionais; `ContaPagar*` com `fornecedor_id` / `fornecedor_nome` / `fornecedor_ativo`) conforme [contracts/rest-cadastro-pessoas.md](./contracts/rest-cadastro-pessoas.md)
- [x] T005 Em `backend/app/api/routes/colaboradores.py`: query `tipo` com **default `colaborador`**; POST grava `tipo`; PUT recusa mudança de `tipo` (400); import/export xlsx só `tipo=colaborador` (filtro em `excel_io` se necessário em `backend/app/services/excel_io.py`)
- [x] T006 [P] Estender `Colaborador` e `ContaPagar` em `frontend/src/types/index.ts` (tipo, documento, contato, fornecedor_*)
- [x] T007 Em `frontend/src/services/api.ts`, `colaboradoresService.listar` aceitar `tipo`; `contasService` criar/atualizar enviar `fornecedor_id` opcional

**Checkpoint**: API lista só colaboradores por padrão; banco aceita fornecedor e `fornecedor_id`; frontend tipado

---

## Phase 3: User Story 1 - Separar cadastro de Colaboradores e Fornecedores (Priority: P1) 🎯 MVP

**Goal**: Um menu, duas visões; criar/listar sem misturar tipos; visualizador só lê

**Independent Test**: Alternar visões, criar um de cada, confirmar que não aparecem na lista do outro; menu continua um único item

### Implementation for User Story 1

- [x] T008 [US1] Adicionar duas visões (abas) **Colaboradores** / **Fornecedores** na mesma página em `frontend/src/pages/Colaboradores.tsx` conforme [contracts/ui-colaboradores-fornecedores.md](./contracts/ui-colaboradores-fornecedores.md); listar com `tipo` correspondente; não alterar `frontend/src/components/Layout.tsx`
- [x] T009 [US1] Criar/editar enviando `tipo` da visão ativa (imutável na edição) em `frontend/src/pages/Colaboradores.tsx`; admin vs visualizador como hoje
- [x] T010 [US1] Total da folha só na visão Colaboradores (ativos) em `frontend/src/pages/Colaboradores.tsx`
- [x] T011 [P] [US1] Garantir que `Bonus.tsx`, `Ferias.tsx` e `Patrimonio.tsx` chamam `colaboradoresService.listar` **sem** `tipo=fornecedor` (default da API)

**Checkpoint**: SC-005; FR-001/FR-014/FR-017

---

## Phase 4: User Story 2 - Documento CPF ou CNPJ (Priority: P1)

**Goal**: Opção CPF ou CNPJ; CNPJ exige Razão Social; validação e unicidade ativo+tipo

**Independent Test**: Gravar CPF válido e CNPJ+razão; recusar CPF inválido, CNPJ inválido e CNPJ sem razão; registros antigos abrem como CPF

### Implementation for User Story 2

- [x] T012 [US2] Validar dígitos CPF/CNPJ, razão social se CNPJ, unicidade `(tipo, documento)` em ativos, normalizar dígitos em `backend/app/api/routes/colaboradores.py` (helpers no mesmo arquivo ou módulo pequeno se já houver padrão)
- [x] T013 [US2] Campo Documento (CPF|CNPJ), máscaras, Razão Social condicional, preencher edição a partir do registro em `frontend/src/pages/Colaboradores.tsx`; toast nas recusas

**Checkpoint**: SC-002, SC-003, SC-007; FR-003 a FR-006 e FR-012

---

## Phase 5: User Story 3 - Telefone e e-mail (Priority: P1)

**Goal**: Contato opcional nos dois cadastros, visível na lista; e-mail validado se preenchido

**Independent Test**: Gravar telefone/e-mail, reabrir; e-mail inválido recusado; visualizador vê e não edita

### Implementation for User Story 3

- [x] T014 [US3] Validar e-mail (formato) e persistir `telefone`/`email` (vazios → null) em `backend/app/api/routes/colaboradores.py` e `backend/app/schemas.py` se ainda faltar
- [x] T015 [US3] Campos Telefone e Email nos formulários e colunas/texto na listagem das duas visões em `frontend/src/pages/Colaboradores.tsx`

**Checkpoint**: SC-004; FR-007/FR-008

---

## Phase 6: User Story 5 - Usar fornecedor nas telas financeiras (Priority: P1)

**Goal**: Vínculo opcional em Contas a Pagar; nome no calendário; RH sem fornecedor

**Independent Test**: Conta sem fornecedor grava; com fornecedor aparece na lista e no calendário; férias/bônus não listam o fornecedor

### Implementation for User Story 5

- [x] T016 [US5] Aceitar `fornecedor_id` opcional em create/update; validar `tipo=fornecedor` e ativo em vínculo novo; incluir `fornecedor_nome` e `fornecedor_ativo` na resposta em `backend/app/api/routes/contas.py`
- [x] T017 [US5] Select Fornecedor opcional (ativos `tipo=fornecedor`) e coluna/texto na listagem em `frontend/src/pages/Contas.tsx`; visualizador não altera
- [x] T018 [P] [US5] Título do evento de conta com `fornecedor_nome` quando houver em `frontend/src/pages/Calendario.tsx`

**Checkpoint**: SC-008; FR-013/FR-015/FR-016

---

## Phase 7: User Story 4 - Campos de equipe só no colaborador (Priority: P2)

**Goal**: Formulário e ações de RH só na visão Colaboradores; fornecedor desativa sem desligamento

**Independent Test**: Novo fornecedor sem cargo/salário/histórico; colaborador mantém documentos/desligar/histórico

### Implementation for User Story 4

- [x] T019 [US4] Formulário da visão Fornecedores só com identificação, documento, contato e observação em `frontend/src/pages/Colaboradores.tsx`; POST de fornecedor sem exigir cargo/salário/nascimento (alinhar `backend/app/schemas.py` e `backend/app/api/routes/colaboradores.py`)
- [x] T020 [US4] Desativar fornecedor com `confirm` (sem data de desligamento); import/export/histórico/documentos só na visão Colaboradores em `frontend/src/pages/Colaboradores.tsx`; DELETE em `backend/app/api/routes/colaboradores.py` não exige desligamento para `tipo=fornecedor`

**Checkpoint**: FR-009/FR-010

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Fechar qualidade e o roteiro do quickstart

- [x] T021 Garantir import/export xlsx e busca por CPF em `backend/app/services/excel_io.py` e `backend/app/api/routes/colaboradores.py` só com `tipo=colaborador`
- [x] T022 Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T023 Percorrer [quickstart.md](./quickstart.md) (visões, documento, contato, contas, calendário, visualizador)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: imediato
- **Foundational (Phase 2)**: após Setup — **bloqueia** histórias
- **US1 → US2 → US3**: sequenciais no mesmo `Colaboradores.tsx`
- **US5**: após Foundational; pode seguir US1 (precisa existir fornecedor na prática); arquivos `contas.py` / `Contas.tsx` / `Calendario.tsx` distintos de US2–US4
- **US4**: após US1–US3 (mesmo arquivo de página)
- **Polish**: após as histórias desejadas

### User Story Dependencies

- **US1 (P1)**: após Phase 2 — MVP
- **US2 (P1)**: após US1 (mesmo formulário)
- **US3 (P1)**: após US1 (mesmo formulário)
- **US5 (P1)**: após Phase 2; melhor após US1 para ter fornecedor cadastrado
- **US4 (P2)**: após US1 (refina o formulário de fornecedor)

### Parallel Opportunities

- T006 (types) em paralelo com T005 (rotas) após T004
- T011 (Bonus/Férias/Patrimônio) em paralelo com T008–T010
- T018 (Calendário) em paralelo com T017 (Contas)
- Não paralelizar T008–T010, T013, T015, T019–T020 (todos `Colaboradores.tsx`)

---

## Parallel Example: Foundational + US5 UI

```bash
# Após T004:
Task: "T005 rotas colaboradores.py"
Task: "T006 types/index.ts"

# US5 após T016:
Task: "T017 Contas.tsx"
Task: "T018 Calendario.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 + Phase 2
2. Phase 3 (US1) — duas visões no mesmo menu
3. Validar: criar colaborador e fornecedor sem misturar listas
4. Seguir US2 (documento) e US3 (contato) na mesma tela
5. US5 (contas + calendário)
6. US4 (esconder RH no fornecedor)
7. Polish / quickstart

### Incremental Delivery

1. Foundation → API não vaza fornecedor para RH
2. US1 → demo das duas visões
3. US2+US3 → cadastro fiscal e contato
4. US5 → valor financeiro
5. US4 → formulário de fornecedor limpo

---

## Notes

- Sem testes automatizados nesta lista
- Não criar `/api/fornecedores` nem segundo item de menu
- Default da listagem = `tipo=colaborador`
- Validar formato checklist: checkbox, ID, `[P]` só se paralelo, `[USx]` nas histórias, caminho de arquivo
