# Tasks: Headers Fixos em Tabelas com Scroll

**Input**: Design documents from `/specs/073-tabelas-header-fixo/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Constantes compartilhadas (fundação) → Contas como referência (US1 MVP) → demais listagens (US2) → controles/temas/modais/exceções (US3) → polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Constantes: `frontend/src/utils/tableScroll.ts`
- Referência: `frontend/src/pages/Contas.tsx`
- Listagens: `frontend/src/pages/{Fornecedores,Ferias,DH,Bonus,Patrimonio,Impostos,Retiradas,Auditoria,Configuracoes,FluxoCaixa}.tsx`
- Exceções: `frontend/src/pages/NFs.tsx` (preservar), `frontend/src/pages/Dashboard.tsx` (sem max-h forçado)
- Contrato UI: `specs/073-tabelas-header-fixo/contracts/ui-tabelas-header-fixo.md`
- **Não alterar**: backend, regras de negócio, ordenação/filtros/handlers; não converter NFs para sticky Contas; não forçar `max-h` Contas em Dashboard/modais

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte; sem app novo, sem dependência nova

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e [contracts/ui-tabelas-header-fixo.md](./contracts/ui-tabelas-header-fixo.md): padrão Contas (`overflow-auto` + `max-h-[calc(100vh-22rem)]` + `th` sticky opaco); portas 5193/8001 inalteradas; NFs/Dashboard/modais conforme exceções; não tocar backend

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Constantes canônicas do padrão Contas — bloqueia todas as histórias

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Criar `frontend/src/utils/tableScroll.ts` exportando constantes Tailwind equivalentes a Contas a Pagar: container (`overflow-auto max-h-[calc(100vh-22rem)]`) e `th` sticky (`sticky top-0 z-10 bg-gray-50 dark:bg-gray-700` + sombra inferior Contas); documentar uso em comentário breve pt-BR
- [x] T003 Em `frontend/src/pages/Contas.tsx`, migrar o wrapper da tabela e classes dos `<th>` sticky para as constantes de `frontend/src/utils/tableScroll.ts` **sem** mudança visual perceptível; preservar checkbox/ordenação/`print-area`

**Checkpoint**: Contas continua com header fixo; constantes prontas para reuso nas demais páginas

---

## Phase 3: User Story 1 - Identificar colunas ao rolar listas longas (Priority: P1) 🎯 MVP

**Goal**: Em listagens principais além da referência, o cabeçalho permanece visível ao rolar, no padrão Contas a Pagar

**Independent Test**: Abrir Fornecedores e Férias com lista longa; rolar a área da tabela — títulos das colunas ficam no topo com fundo opaco, como em Contas

### Implementation for User Story 1

- [x] T004 [P] [US1] Em `frontend/src/pages/Fornecedores.tsx`, trocar wrapper `overflow-x-auto` da listagem por container com constante de scroll (`overflow-auto` + max-h Contas); aplicar classes sticky opacas em cada `<th>`; filtros/CTAs fora da área rolável
- [x] T005 [P] [US1] Em `frontend/src/pages/Ferias.tsx`, aplicar o mesmo padrão Contas (container scroll + `th` sticky via `tableScroll.ts`)
- [x] T006 [US1] Validar visualmente Contas + Fornecedores + Férias (tema claro): scroll vertical com header fixo; scroll horizontal alinhado; sem regressão de ações/ordenação (FR-001, FR-001a, SC-001 parcial)

**Checkpoint**: MVP testável — padrão Contas comprovado em ≥2 listagens além da referência

---

## Phase 4: User Story 2 - Cobertura consistente em todas as listagens (Priority: P1)

**Goal**: Mesmo padrão completo (altura limitada + header sticky) em todas as páginas de listagem/CRUD cobertas; NFs e Dashboard respeitam exceções

**Independent Test**: Percorrer DH, Bonus, Patrimônio, Impostos, Retiradas, Auditoria, Configurações e Fluxo de Caixa; em cada grade com dados suficientes, header fixo equivalente a Contas; NFs ainda congela o header pela grade dual

### Implementation for User Story 2

- [x] T007 [P] [US2] Em `frontend/src/pages/DH.tsx`, aplicar padrão Contas (container + `th` sticky via `tableScroll.ts`)
- [x] T008 [P] [US2] Em `frontend/src/pages/Bonus.tsx`, em cada grade por colaborador (`overflow-x-auto` → scroll Contas), aplicar `th` sticky com fundo **opaco** (substituir `bg-gray-50/50` / `dark:bg-gray-700/50` no sticky)
- [x] T009 [P] [US2] Em `frontend/src/pages/Patrimonio.tsx`, aplicar padrão Contas (container + `th` sticky)
- [x] T010 [P] [US2] Em `frontend/src/pages/Impostos.tsx`, aplicar padrão Contas (container + `th` sticky)
- [x] T011 [P] [US2] Em `frontend/src/pages/Retiradas.tsx`, aplicar padrão Contas (container + `th` sticky)
- [x] T012 [P] [US2] Em `frontend/src/pages/Auditoria.tsx`, aplicar padrão Contas (container + `th` sticky)
- [x] T013 [P] [US2] Em `frontend/src/pages/Configuracoes.tsx`, aplicar padrão Contas (container + `th` sticky)
- [x] T014 [P] [US2] Em `frontend/src/pages/FluxoCaixa.tsx`, aplicar padrão Contas em **cada** wrapper de tabela de listagem (duas grades); não alterar o bloco sticky de filtros/resumo da página (~linha do card superior)
- [x] T015 [US2] Confirmar que `frontend/src/pages/NFs.tsx` **não** foi convertido ao sticky Contas e que o header congelado (grade dual) permanece; confirmar que `frontend/src/pages/Dashboard.tsx` **não** recebeu `max-h-[calc(100vh-22rem)]` forçado (FR-002, FR-002a, FR-009, SC-001)

**Checkpoint**: Cobertura cross-página (US2) completa; exceções NFs/Dashboard intactas

---

## Phase 5: User Story 3 - Não atrapalhar leitura nem ações (Priority: P2)

**Goal**: Controles do cabeçalho seguem utilizáveis; header legível em claro/escuro; modais só sticky oportunista

**Independent Test**: Em Contas (ou listagem com ordenação/checkbox), rolar e usar controles do header; tema escuro em amostra de telas; modal com tabela sem segundo max-h Contas

### Implementation for User Story 3

- [x] T016 [US3] Em `frontend/src/pages/Contas.tsx` (e ao menos uma listagem com ordenação do escopo), validar que checkbox/ordenação no `<th>` sticky respondem após scroll; ajustar `z-index`/padding só se algum controle ficar inacessível (FR-005)
- [x] T017 [P] [US3] Revisar amostra ≥5 páginas do escopo em tema escuro (`dark:`) — fundos sticky opacos, texto legível; corrigir qualquer `th` sticky semi-transparente remanescente (FR-004, SC-005)
- [x] T018 [US3] Varredura em `frontend/src/components/` (ex.: `Modal.tsx`, `DocumentosModal.tsx` e modais com `<table>`): se houver tabela em área já rolável, aplicar apenas classes sticky opacas nos `th` via `tableScroll.ts` (ou equivalente); **não** adicionar `max-h-[calc(100vh-22rem)]` (FR-006)

**Checkpoint**: US3 atendida — sticky sem regressão de controles/legibilidade; modais conforme clarify B

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e aceite final

- [x] T019 Executar validação manual completa de [quickstart.md](./quickstart.md) (Contas baseline, listagens, NFs, Dashboard/modais, temas)
- [x] T020 Rodar `npm run lint` e `npm run type-check` em `frontend/`; corrigir regressões introduzidas por esta feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → histórias
- **US1 (Phase 3)** após fundação; MVP entregável sozinho
- **US2 (Phase 4)** após US1 (reusa o mesmo padrão/constantes); páginas T007–T014 em paralelo entre si
- **US3 (Phase 5)** após US2 (valida controles/temas sobre a cobertura completa); T017 paralelo a ajustes pontuais
- **Phase 6** após US3

### User Story Dependencies

- **US1**: Independente após T002–T003
- **US2**: Depende do padrão validado em US1; páginas independentes entre si
- **US3**: Depende das listagens já com sticky (US1+US2)

### Within Each User Story

- Aplicar container + `th` sticky → validar scroll/controles
- Não misturar mudança de handlers/dados

### Parallel Opportunities

- T004 ∥ T005 (US1)
- T007 ∥ T008 ∥ T009 ∥ T010 ∥ T011 ∥ T012 ∥ T013 ∥ T014 (US2)
- T017 ∥ preparação de T018 (arquivos diferentes)

### Parallel Example: User Story 2

```text
# Após T006 (US1 checkpoint):
T007 DH.tsx
T008 Bonus.tsx
T009 Patrimonio.tsx
T010 Impostos.tsx
T011 Retiradas.tsx
T012 Auditoria.tsx
T013 Configuracoes.tsx
T014 FluxoCaixa.tsx
# Depois: T015 verificação NFs/Dashboard
```

---

## Implementation Strategy

### MVP (User Story 1)

1. T001 → T002 → T003  
2. T004 + T005 → T006  
3. Parar e validar Contas + Fornecedores + Férias

### Incremental Delivery

1. Fundação + Contas (constantes)  
2. MVP US1 (2 listagens)  
3. US2 (restante das listagens)  
4. US3 (controles, dark, modais)  
5. Polish / quickstart / lint

### Notes

- Total: **20 tarefas** (T001–T020)
- Por história: US1 = 3 · US2 = 9 · US3 = 3 · Setup/Fundação/Polish = 5
- Formato checklist validado: `- [ ]`, ID, `[P]`/`[USn]` quando cabível, caminhos de arquivo
- MVP sugerido: Phase 1–3 (T001–T006)
