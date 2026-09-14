# Tasks: Ações de Tabela Só com Tooltip

**Input**: Design documents from `/specs/064-tabelas-acoes-tooltip/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Fundação no `ActionButton` (US1+US2); wrappers `flex-nowrap` por página (US1 MVP → US3); polish no fim.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Componente: `frontend/src/components/ActionButton.tsx`
- Estilos: `frontend/src/utils/actionButtonStyles.ts`
- Páginas: `frontend/src/pages/{NFs,Contas,Fornecedores,Bonus,Ferias,DH,Patrimonio,FluxoCaixa}.tsx`
- Contrato UI: `specs/064-tabelas-acoes-tooltip/contracts/ui-acoes-tabela-tooltip.md`
- **Não alterar**: backend, `context="header"`, botões só-texto (Substituir/Remover/+ Anexar, badges DH), libs de tooltip novas

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte; sem app novo, sem dependência nova

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e [contracts/ui-acoes-tabela-tooltip.md](./contracts/ui-acoes-tabela-tooltip.md): só `ActionButton` `context="row"` + wrappers de ações de linha; portas 5193/8001 inalteradas; não tocar backend nem botões de header

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Padrão central ícone + tooltip — bloqueia todas as histórias

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Em `frontend/src/components/ActionButton.tsx`, para `context === 'row'`: não renderizar o `<span>{label}</span>` visível; manter ícone; garantir `aria-label={label}`; definir `title` com o nome da ação usando `label`, **preservando** `title` explícito do chamador se existir (ex. Excluir em Fornecedores); `context === 'header'` permanece ícone + texto
- [x] T003 Em `frontend/src/utils/actionButtonStyles.ts`, ajustar `ROW_BASE` (e variantes row se necessário) para botão compacto só-ícone (padding/gap adequados, sem depender de texto ao lado), mantendo cores/variantes existentes

**Checkpoint**: Qualquer página com `ActionButton` row já mostra só ícone + tooltip nativo; header intacto

---

## Phase 3: User Story 1 - Ver ações mais compactas na tabela (Priority: P1) 🎯 MVP

**Goal**: Nas listagens principais, ações ícone+texto ficam só ícone; controles alinhados horizontalmente sem quebra de linha; ações só-texto permanecem com texto

**Independent Test**: Abrir NFs e Contas como admin; coluna de ações sem textos “Editar”/“Excluir” etc. ao lado dos ícones; Substituir/Remover ainda com texto; ícones na mesma linha sem wrap

### Implementation for User Story 1

- [x] T004 [US1] Em `frontend/src/pages/NFs.tsx`, no wrapper da coluna de ações de linha (`flex gap-1 justify-end flex-wrap`), trocar para `flex-nowrap` (e `items-center` se couber); não alterar handlers nem botões só-texto de anexo
- [x] T005 [P] [US1] Em `frontend/src/pages/Contas.tsx`, no wrapper da coluna de ações (`flex gap-1 justify-end flex-wrap`), trocar para `flex-nowrap` (e `items-center` se couber); preservar Substituir/Remover/+ Anexar só-texto
- [x] T006 [US1] Validar visualmente NFs e Contas: sem texto permanente ao lado dos ícones `ActionButton` row; layout horizontal sem wrap; fluxos Editar/Excluir/Pagar intactos (FR-001, FR-003a, FR-009)

**Checkpoint**: MVP testável em NFs + Contas (SC-001, SC-006, SC-007 parciais)

---

## Phase 4: User Story 2 - Descobrir o nome da ação no hover (Priority: P1)

**Goal**: Hover em cada ícone de ação de linha revela o nome correto; clique preserva o fluxo; ações só-texto não dependem de tooltip

**Independent Test**: Em NFs/Contas, hover em cada ícone → tooltip com label correto em até ~1s; clique Editar abre o mesmo modal de antes

### Implementation for User Story 2

- [x] T007 [US2] Conferir em `frontend/src/components/ActionButton.tsx` e uso em `frontend/src/pages/NFs.tsx` / `frontend/src/pages/Contas.tsx` que o hover mostra o `label` (Recebido, Editar, Arquivar/Exibir, Excluir, Pagar, Anexar, etc.) via `title`; `aria-label` presente; `title` customizado de Fornecedores (se já existir) não é sobrescrito indevidamente
- [x] T008 [US2] Validar conforme [quickstart.md](./quickstart.md) seção US2: tooltip some ao sair do hover; ações só-texto continuam legíveis sem depender de tooltip (FR-002, SC-002, SC-003)

**Checkpoint**: US2 atendida sobre a base do `ActionButton` (sem lib nova)

---

## Phase 5: User Story 3 - Consistência em todas as tabelas (Priority: P2)

**Goal**: Mesmo padrão (ícone + tooltip, horizontal sem wrap; exceção só-texto) em todas as páginas com `ActionButton` row

**Independent Test**: Percorrer Fornecedores, Bonus, Férias, DH, Patrimônio, Fluxo de Caixa e confirmar padrão uniforme

### Implementation for User Story 3

- [x] T009 [P] [US3] Em `frontend/src/pages/Fornecedores.tsx`, trocar o wrapper da coluna de ações (`flex gap-1 justify-end flex-wrap`) para `flex-nowrap` (+ `items-center` se couber); manter botão de observação só-ícone/`title` legado intacto
- [x] T010 [P] [US3] Em `frontend/src/pages/Bonus.tsx`, trocar wrappers de ações de linha com `flex-wrap` (incl. coluna de ações ~`flex gap-1 justify-end flex-wrap`) para `flex-nowrap` onde agrupam `ActionButton` row
- [x] T011 [P] [US3] Em `frontend/src/pages/Ferias.tsx`, trocar o wrapper da coluna de ações (`flex gap-1 justify-end flex-wrap`) para `flex-nowrap`
- [x] T012 [P] [US3] Em `frontend/src/pages/DH.tsx`, no wrapper das ações de linha com `ActionButton` (`flex gap-1 flex-wrap` ~coluna Excluir), usar `flex-nowrap`; **não** alterar badges só-texto de envio Fin./CEO
- [x] T013 [P] [US3] Em `frontend/src/pages/Patrimonio.tsx`, trocar o wrapper da coluna de ações (`flex gap-1 justify-end flex-wrap`) para `flex-nowrap`
- [x] T014 [P] [US3] Em `frontend/src/pages/FluxoCaixa.tsx`, nos grupos de `ActionButton` `context="row"` (movimentos e cards de conta, ex. `flex gap-2 flex-wrap`), usar `flex-nowrap` (+ `items-center` se couber)
- [x] T015 [US3] Varredura: nenhuma página do escopo mantém `ActionButton` row com texto permanente; headers (`context="header"`) ainda com texto; ações só-texto intactas (FR-006, FR-007, SC-005, SC-007)

**Checkpoint**: Consistência cross-página (US3) completa

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e validação ponta a ponta

- [x] T016 Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T017 Executar o checklist completo de [quickstart.md](./quickstart.md) (NFs, Contas, demais páginas, header intacto, visualizador, SC-001–SC-007)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as histórias
- **US1 (Phase 3)**: Depende da Phase 2 — MVP
- **US2 (Phase 4)**: Depende da Phase 2 (e na prática valida após US1 nas mesmas páginas)
- **US3 (Phase 5)**: Depende da Phase 2; wrappers podem rodar em paralelo entre si
- **Polish (Phase 6)**: Depois das histórias desejadas

### User Story Dependencies

- **US1 (P1)**: Após Phase 2 — sem dependência de US2/US3
- **US2 (P1)**: Após Phase 2 — tooltip já vem do `ActionButton`; validação/confirmação
- **US3 (P2)**: Após Phase 2 — estende nowrap/consistência às demais páginas

### Within Each User Story

- Implementação antes da validação da história
- Não misturar mudanças de header ou backend

### Parallel Opportunities

- T005 em paralelo com preparação de T004 (arquivos diferentes) após Phase 2
- T009–T014 em paralelo (páginas distintas) após Phase 2
- T002 e T003 sequenciais no mesmo fluxo de componente/estilo (T003 pode seguir T002 de imediato)

---

## Parallel Example: User Story 3

```bash
# Após Phase 2, wrappers em paralelo:
Task: "Fornecedores.tsx flex-nowrap na coluna de ações"
Task: "Bonus.tsx flex-nowrap nos wrappers ActionButton row"
Task: "Ferias.tsx flex-nowrap na coluna de ações"
Task: "DH.tsx flex-nowrap nas ações ActionButton (sem tocar badges)"
Task: "Patrimonio.tsx flex-nowrap na coluna de ações"
Task: "FluxoCaixa.tsx flex-nowrap nos grupos context=row"
```

---

## Implementation Strategy

### MVP First (User Story 1 + fundação)

1. Phase 1 → Phase 2 (`ActionButton` + estilos)
2. Phase 3 (NFs + Contas + nowrap)
3. **STOP e VALIDAR** quickstart parcial (ícone, layout, só-texto)
4. Seguir US2 (confirmação hover) e US3 (demais páginas)

### Incremental Delivery

1. Setup + Foundational → todas as listagens já ícone + tooltip
2. US1 → NFs/Contas com nowrap (MVP demo)
3. US2 → validação hover/fluxo
4. US3 → demais páginas alinhadas
5. Polish → lint + quickstart completo

### Parallel Team Strategy

1. Dev A: Phase 2 (`ActionButton` + styles)
2. Após Phase 2: Dev B páginas NFs/Contas (US1); Dev C páginas US3 em paralelo
3. Qualquer um: US2 validação + Polish

---

## Notes

- [P] = arquivos diferentes, sem dependência incompleta
- Labels `[USn]` só nas fases de história
- Sem tarefas de teste automatizado (não pedidas)
- Commit por tarefa ou grupo lógico, se o usuário pedir
- Evitar: mudar `flex-wrap` de headers/filtros/modais que não são coluna de ações de linha
