# Tasks: Calendário com Legenda de Status

**Input**: Design documents from `/specs/006-calendario-legenda/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados no spec — validação manual via [quickstart.md](./quickstart.md) + `npm run lint` / `npm run type-check`

**Organization**: Tasks agrupadas por user story para entrega incremental e teste independente

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: User story (US1, US2, US3)
- Incluir caminhos de arquivo exatos nas descrições

## Path Conventions

- Frontend: `frontend/src/pages/Calendario.tsx`
- Contratos: `specs/006-calendario-legenda/contracts/ui-calendario-legenda.md`
- Modelo: `specs/006-calendario-legenda/data-model.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contexto e limites antes de editar código

- [x] T001 Revisar `specs/006-calendario-legenda/plan.md`, `spec.md`, `research.md`, `data-model.md` e `contracts/ui-calendario-legenda.md` e confirmar escopo (só frontend; sem API; legenda 4 status; ocultar canceladas)
- [x] T002 [P] Inspecionar legenda atual, mapeamento de cores (`pago` / `tipo`) e montagem de `eventosPorDia` em `frontend/src/pages/Calendario.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Filtro de canceladas + helper de cor — base para todas as stories

**⚠️ CRITICAL**: Não alterar legenda/UX de status antes do filtro e do mapeamento canônico

- [x] T003 Em `frontend/src/pages/Calendario.tsx`, ao montar eventos de NF, **não** incluir registros com `status === 'cancelada'` (FR-002; grade, detalhe e export herdam o mapa)
- [x] T004 Em `frontend/src/pages/Calendario.tsx`, centralizar (helper local ou tabela) o mapeamento `tipo` + `pago` → classes Tailwind azul / verde / laranja conforme `contracts/ui-calendario-legenda.md` e `data-model.md` (Recebido e Pago = mesmo verde; `pendente`/`vencida` via `pago === false`)

**Checkpoint**: Canceladas fora do mapa; cores derivadas de uma única regra

---

## Phase 3: User Story 1 — Consultar vencimentos (Priority: P1) 🎯 MVP

**Goal**: Calendário permanece utilizável — grade mensal, navegação, seleção de dia, detalhe, exportações; sem regressão após o filtro

**Independent Test**: Abrir `/calendario`, navegar meses, selecionar dia com/sem eventos, conferir detalhe e botões de exportação; NF cancelada ausente

### Implementation for User Story 1

- [x] T005 [US1] Em `frontend/src/pages/Calendario.tsx`, garantir que navegação mês/ano, destaque do dia atual, seleção de dia, empty state e truncamento “+N mais” continuam intactos após T003/T004
- [x] T006 [US1] Em `frontend/src/pages/Calendario.tsx`, garantir que Importar CSV (toast), Exportar CSV e Exportar PDF permanecem disponíveis e que o CSV só inclui eventos do mapa (sem canceladas)

**Checkpoint**: MVP — calendário operacional sem canceladas

---

## Phase 4: User Story 2 — Legenda de status (Priority: P1)

**Goal**: Legenda com quatro itens Title Case e cores oficiais

**Independent Test**: Abrir Calendário e ver “A receber” (azul), “Recebido” (verde), “A pagar” (laranja), “Pago” (verde); sem rótulos legados na legenda

### Implementation for User Story 2

- [x] T007 [US2] Em `frontend/src/pages/Calendario.tsx`, substituir a legenda de 3 itens (“NF” / “Conta a pagar” / “Quitado/Pago”) pelos 4 itens na ordem e grafia de FR-003: A receber, Recebido, A pagar, Pago
- [x] T008 [US2] Em `frontend/src/pages/Calendario.tsx`, aplicar bolinhas `bg-blue-500`, `bg-green-500`, `bg-orange-500`, `bg-green-500` (Recebido e Pago idênticos) mantendo o layout `flex gap-4 text-sm` existente

**Checkpoint**: Legenda alinhada ao contrato UI

---

## Phase 5: User Story 3 — Distinguir status na grade e no detalhe (Priority: P2)

**Goal**: Chips da grade e bolinhas do detalhe usam as cores da legenda; Recebido vs Pago só por tipo textual

**Independent Test**: Mês com NF aberta, NF paga, conta aberta e conta paga — cores corretas na grade e no detalhe; duas verdes distintas só por `(NF)` / `(Conta)`

### Implementation for User Story 3

- [x] T009 [US3] Em `frontend/src/pages/Calendario.tsx`, aplicar o helper/mapeamento de T004 nos chips da grade mensal (azul / verde / laranja conforme status visual)
- [x] T010 [US3] Em `frontend/src/pages/Calendario.tsx`, aplicar o mesmo mapeamento nas bolinhas do painel de detalhe do dia; manter rótulo `(NF)` / `(Conta)` sem ícone ou tom de verde extra
- [x] T011 [US3] Em `frontend/src/pages/Calendario.tsx`, confirmar que NF `vencida` (não paga) renderiza azul (A receber) e que NF `paga` / conta `pago` usam o mesmo verde

**Checkpoint**: Grade e detalhe coerentes com a legenda (SC-002)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e validação end-to-end

- [x] T012 Executar cenários V1–V6 de `specs/006-calendario-legenda/quickstart.md` em `http://localhost:5193/calendario`
- [x] T013 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/` e corrigir regressões introduzidas em `Calendario.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — começar imediatamente
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as user stories
- **US1 (Phase 3)**: Após Foundational — 🎯 MVP
- **US2 (Phase 4)**: Após Foundational (pode seguir US1; mesmo arquivo — sequencial recomendado)
- **US3 (Phase 5)**: Após T004; idealmente após US2 para validar legenda × marcadores juntos
- **Polish (Phase 6)**: Após US1–US3 desejadas

### User Story Dependencies

- **US1 (P1)**: Após Phase 2 — independente de US2/US3
- **US2 (P1)**: Após Phase 2 — independente de US3; mesmo arquivo que US1 → evitar edição paralela
- **US3 (P2)**: Depende de T004; valida coerência com US2

### Within Each User Story

- Foundational (filtro + helper) antes da UX da story
- Grade/detalhe (US3) depois do helper canônico
- Polish por último

### Parallel Opportunities

- T001 e T002 em paralelo (leitura)
- T012 e T013 em paralelo no polish (manual vs lint)
- **Não** paralelizar T003–T011: todos editam `frontend/src/pages/Calendario.tsx`

---

## Parallel Example: Setup

```bash
Task: "T001 Revisar artefatos em specs/006-calendario-legenda/"
Task: "T002 Inspecionar Calendario.tsx"
```

## Parallel Example: Polish

```bash
Task: "T012 Validar quickstart.md no browser"
Task: "T013 npm run lint && npm run type-check em frontend/"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 Setup  
2. Phase 2 Foundational (filtro canceladas + helper de cor)  
3. Phase 3 US1 — calendário utilizável sem canceladas  
4. **STOP e validar** V3/V4 do quickstart  

### Incremental Delivery

1. Setup + Foundational  
2. US1 → demo calendário limpo  
3. US2 → legenda oficial  
4. US3 → cores grade/detalhe  
5. Polish (quickstart + lint/type-check)  

### Parallel Team Strategy

Um único arquivo alvo — preferir **um implementador sequencial** (T003 → … → T011). Setup/polish de leitura/lint podem ser paralelos.

---

## Notes

- [P] só quando arquivos/tarefas realmente independentes
- Sem tasks de teste automatizado (não pedidas no spec)
- Sem mudanças em `api.ts`, backend ou Layout
- Commit por fase ou grupo lógico, se o time versionar
- Formato checklist: `- [ ] Txxx ...` com path em toda task de implementação
- Implementação 2026-07-26: T001–T013 concluídas em `Calendario.tsx`. `tsc` sem erros neste arquivo (erros pré-existentes em Bonus/DH/Retiradas). ESLint sem config no projeto — pré-existente. T012: validação por revisão de código vs contrato/quickstart (dev server não estava ativo nesta sessão — conferir V1–V6 no browser ao subir `npm run dev`).
