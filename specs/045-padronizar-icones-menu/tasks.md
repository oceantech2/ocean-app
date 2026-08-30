# Tasks: Padronizar ícones, menu aberto e botões

**Input**: Design documents from `/specs/045-padronizar-icones-menu/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados no spec — validação manual via [quickstart.md](./quickstart.md) + `npm run lint` / `npm run type-check`

**Organization**: Tasks agrupadas por user story para entrega incremental e teste independente

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: User story (US1, US2, US3)
- Incluir caminhos de arquivo exatos nas descrições

## Path Conventions

- Frontend: `frontend/src/components/`, `frontend/src/utils/`, `frontend/src/store/index.ts`, `frontend/src/pages/`
- Contratos: `specs/045-padronizar-icones-menu/contracts/ui-padronizar-icones-menu.md`
- **Fora do escopo de botões**: `frontend/src/pages/Dashboard.tsx`, `frontend/src/pages/Configuracoes.tsx`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contexto, escopo e baseline antes de editar código

- [X] T001 Revisar `specs/045-padronizar-icones-menu/spec.md`, `plan.md`, `research.md`, `data-model.md` e `contracts/ui-padronizar-icones-menu.md` (escopo: só frontend; Dashboard/Config fora de botões; sem API)
- [X] T002 [P] Mapear estado atual do menu em `frontend/src/components/Layout.tsx` (`handleMainClick`, `onClick` no `<main>`, controle de colapso) e `frontend/src/store/index.ts` (`sidebarKey`, `readSidebarCollapsed`, `writeSidebarCollapsed`)
- [X] T003 [P] Inventariar páginas no escopo com botões de cabeçalho/linha (`NFs.tsx`, `Contas.tsx`, `Fornecedores.tsx`, `Ferias.tsx`, `DH.tsx`, `Bonus.tsx`, `Patrimonio.tsx`, `FluxoCaixa.tsx`, `Retiradas.tsx`, `Impostos.tsx`, `Calendario.tsx`) e anotar divergências (NFs só-ícone, Contas “Deletar”, Nova antes dos exports)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Componentes compartilhados de ação — bloqueia US2 e US3

**⚠️ CRITICAL**: Não migrar páginas de listagem antes desta fase

- [X] T004 Criar `frontend/src/utils/actionButtonStyles.ts` com mapa `variant × context (header|row) → classes Tailwind` (editar, excluir, fluxo, auxiliar, arquivar, desativar, reativar, importar, exportar, criar) conforme `research.md` §4
- [X] T005 [P] Criar `frontend/src/components/actionIcons.tsx` extraindo SVGs de `frontend/src/pages/NFs.tsx` (`IconEditar`, `IconExcluir`, `IconPagar`, etc.) e adicionar ícones faltantes (importar, exportar, criar, docs, histórico, anexar, arquivar) no estilo stroke `currentColor`
- [X] T006 Implementar `frontend/src/components/ActionButton.tsx` com props `variant`, `context`, `label`, `onClick`, `disabled?`, `type?` — renderizar **ícone + rótulo** visível; aplicar estilos de `actionButtonStyles.ts`
- [X] T007 [P] Exportar constantes de ordem canônica (`HEADER_ACTION_ORDER`, `ROW_ACTION_ORDER`) em `frontend/src/utils/actionButtonStyles.ts` ou `frontend/src/components/ActionButton.tsx` para uso nas páginas (importar → exportar → criar; auxiliar → fluxo → editar → arquivar/desativar → excluir)

**Checkpoint**: `ActionButton` + ícones prontos — migração de páginas pode começar

---

## Phase 3: User Story 1 — Menu lateral aberto por padrão (Priority: P1) 🎯 MVP

**Goal**: Menu sempre expandido ao entrar/recarregar; clique no conteúdo não recolhe; recolhimento só na sessão via controle explícito

**Independent Test**: Com `localStorage` legado `ocean-sidebar-collapsed:admin=true`, reload abre expandido; clicar em `main` não colapsa; recolher + reload volta expandido

### Implementation for User Story 1

- [X] T008 [US1] Em `frontend/src/store/index.ts`, remover gravação em `localStorage` de `setSidebarCollapsed` e `toggleSidebarCollapsed` (estado só Zustand na sessão)
- [X] T009 [US1] Em `frontend/src/store/index.ts`, alterar `hydrateSidebarCollapsed` para sempre definir `sidebarCollapsed: false` e opcionalmente `localStorage.removeItem(sidebarKey(usuario))` para chaves legadas
- [X] T010 [US1] Em `frontend/src/components/Layout.tsx`, remover `handleMainClick` e `onClick={handleMainClick}` do `<main>` (FR-002)
- [X] T011 [US1] Em `frontend/src/components/Layout.tsx`, uniformizar tamanho de texto dos rótulos do menu expandido (`text-sm` ou classe única entre itens) conforme FR-010

**Checkpoint**: MVP — menu aberto por padrão e comportamento de sessão conforme quickstart §1–3

---

## Phase 4: User Story 2 — Ícones reconhecíveis no menu e nas ações (Priority: P1)

**Goal**: Mesmo ícone por ação em listagens; menu com ícones consistentes; ícone + rótulo visível nos botões

**Independent Test**: Comparar Editar/Excluir/Importar em ≥3 listagens — mesmo ícone e rótulo visível; menu com ícones uniformes

### Implementation for User Story 2

- [X] T012 [US2] Revisar `frontend/src/components/navIcons.tsx` — garantir tamanho/estilo uniforme (`w-5 h-5`, stroke) em todos os itens de `PAGINAS_MENU` usados em `Layout.tsx`
- [X] T013 [US2] Migrar `frontend/src/pages/NFs.tsx`: substituir ícones locais por imports de `actionIcons.tsx`; trocar botões só-ícone (`BTN_ICON`) por `ActionButton` com rótulos visíveis (Recebido, Editar, Arquivar, Excluir); remover definições duplicadas de `Icon*` do arquivo
- [X] T014 [P] [US2] Migrar cabeçalho de `frontend/src/pages/Contas.tsx` para `ActionButton` com ícones (Importar, Exportar CSV/XLSX/PDF) substituindo prefixos `↑`/`↓` no texto
- [X] T015 [P] [US2] Migrar ações de linha de `frontend/src/pages/Contas.tsx` para `ActionButton` (Pagar, Editar, Excluir) com ícones de `actionIcons.tsx`
- [X] T016 [P] [US2] Migrar botões de cabeçalho e linha de `frontend/src/pages/Fornecedores.tsx` para `ActionButton` com ícones compartilhados (Docs, Histórico, Editar, Desativar/Reativar, Excluir)

**Checkpoint**: Três listagens (NFs, Contas, Fornecedores) com ícones padronizados — atende amostragem parcial SC-005

---

## Phase 5: User Story 3 — Texto, ordem e estilo dos botões nas listagens (Priority: P1)

**Goal**: Ordem canônica de cabeçalho/linha; Novo por último; **Excluir** (nunca Deletar); fundo colorido suave nas linhas; modais Cancelar → Confirmar

**Independent Test**: NFs e Contas com ordem importar → exportar → Nova; Excluir sempre último na linha; Fluxo de Caixa sem botões só-borda; Dashboard/Config inalterados

### Implementation for User Story 3

- [X] T017 [US3] Em `frontend/src/pages/NFs.tsx`, reordenar cabeçalho para importar → exportar (CSV, XLSX, PDF) → **Nova conta a receber** por último (FR-011)
- [X] T018 [US3] Em `frontend/src/pages/Contas.tsx`, renomear rótulo **Deletar** → **Excluir** e garantir ordem de linha auxiliar → fluxo → editar → excluir (FR-012, FR-018)
- [X] T019 [P] [US3] Padronizar `frontend/src/pages/Ferias.tsx`: ordem cabeçalho, `ActionButton` em linha (Aprovar, Rejeitar, Editar, Excluir) com variantes e cores suaves
- [X] T020 [P] [US3] Padronizar `frontend/src/pages/DH.tsx`: cabeçalho (importar → exportar → Novo DH) e linha com `ActionButton`
- [X] T021 [P] [US3] Padronizar `frontend/src/pages/Bonus.tsx` (Comissões): cabeçalho e linha com `ActionButton`; ordem e rótulos conforme catálogo
- [X] T022 [P] [US3] Padronizar `frontend/src/pages/Patrimonio.tsx`: cabeçalho e linha com `ActionButton`
- [X] T023 [US3] Padronizar `frontend/src/pages/FluxoCaixa.tsx`: substituir botões de linha só-borda por `ActionButton` `context="row"` com fundo suave (FR-019)
- [X] T024 [P] [US3] Padronizar cabeçalhos de `frontend/src/pages/Retiradas.tsx`, `frontend/src/pages/Impostos.tsx` e `frontend/src/pages/Calendario.tsx` com `ActionButton` (importar/exportar onde existir; sem ações de linha se não houver tabela CRUD)
- [X] T025 [US3] Revisar rodapés de modais CRUD nas páginas migradas (ex.: `Contas.tsx`, `Fornecedores.tsx`, `Ferias.tsx`, `NFs.tsx`) — **Cancelar** antes de Salvar/Criar/Confirmar e `text-sm` uniforme (FR-013)
- [X] T026 [US3] Confirmar que `frontend/src/pages/Dashboard.tsx` e `frontend/src/pages/Configuracoes.tsx` **não** foram alterados nos botões de ação (FR-017); menu lateral segue US1

**Checkpoint**: Todas as listagens no escopo padronizadas; quickstart §4–8 passam

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade, tema escuro e validação ponta a ponta

- [X] T027 [P] Revisar contraste de ícones/botões em tema claro e escuro em `actionIcons.tsx`, `ActionButton.tsx` e `Layout.tsx` (FR-014)
- [X] T028 [P] Executar `npm run lint` e `npm run type-check` em `frontend/` e corrigir erros introduzidos
- [X] T029 Percorrer cenários 1–10 de `specs/045-padronizar-icones-menu/quickstart.md` (menu, ordem, Excluir, cores linha, fora de escopo, papéis)
- [X] T030 [P] Atualizar comentário ou doc inline em `frontend/src/store/index.ts` documentando que preferência de sidebar **não** persiste (delta vs feature `005-sidebar-collapse-icons`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** US2 e US3
- **US1 (Phase 3)**: Pode iniciar após Setup; **independente** de Phase 2 (arquivos distintos: Layout/store vs ActionButton)
- **US2 (Phase 4)**: Depende da Phase 2 (ActionButton/actionIcons)
- **US3 (Phase 5)**: Depende da Phase 2; idealmente após T013–T016 (US2) nas mesmas páginas, mas tarefas T019–T024 em arquivos diferentes podem paralelizar entre si
- **Polish (Phase 6)**: Depende de US1 + US2 + US3

### User Story Dependencies

- **US1 (P1)**: Independente — MVP do menu
- **US2 (P1)**: Requer Phase 2; independente de US1 para teste em listagens (menu pode estar no baseline)
- **US3 (P1)**: Requer Phase 2; complementa US2 nas mesmas páginas (ordem/estilo)

### Within Each User Story

- `actionButtonStyles.ts` antes de `ActionButton.tsx` (T004 → T006)
- `actionIcons.tsx` antes de migrar NFs (T005 → T013)
- NFs como referência antes de replicar padrão nas demais listagens

### Parallel Opportunities

- **Phase 1**: T002 ∥ T003
- **Phase 2**: T005 ∥ T004; T007 ∥ T006 (após T004)
- **Phase 3**: US1 inteira pode rodar **em paralelo com Phase 2** (equipes diferentes)
- **Phase 4**: T014 ∥ T015 ∥ T016 (após T013)
- **Phase 5**: T019 ∥ T020 ∥ T021 ∥ T022 ∥ T024 (após Phase 2; arquivos distintos)
- **Phase 6**: T027 ∥ T028 ∥ T030

---

## Parallel Example: User Story 3 (páginas distintas)

```bash
# Após T017–T018 (NFs + Contas ordem/rótulo):
Task: "Padronizar Ferias.tsx"
Task: "Padronizar DH.tsx"
Task: "Padronizar Bonus.tsx"
Task: "Padronizar Patrimonio.tsx"
Task: "Padronizar cabeçalhos Retiradas/Impostos/Calendario"
```

---

## Parallel Example: US1 + Foundational

```bash
# Desenvolvedor A — menu (sem ActionButton):
Task: "T008–T011 store + Layout.tsx"

# Desenvolvedor B — infra de botões:
Task: "T004–T007 actionButtonStyles + actionIcons + ActionButton"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 3 (T001–T003, T008–T011)
2. **STOP e validar** quickstart §1–3 (menu sempre aberto)
3. Demo incremental do menu antes de migrar listagens

### Incremental Delivery

1. Setup + US1 → menu padronizado (MVP)
2. Phase 2 + US2 (NFs, Contas, Fornecedores) → ícones nas listagens principais
3. US3 → ordem, Excluir, cores em todas as listagens
4. Polish + quickstart completo

### Suggested MVP Scope

**User Story 1** (menu aberto, sem persistência, sem clique-fora). Valor completo da feature exige US2 + US3 nas listagens.

---

## Notes

- Sem tasks de teste automatizado (não pedidos no spec)
- Sem mudanças em `backend/`
- Não adicionar lib de ícones (`lucide`, etc.)
- `Auditoria.tsx` e `Seguranca.tsx`: incluir só se inventário (T003) encontrar botões de ação no escopo; caso contrário omitir
- Commit após cada tarefa ou grupo lógico, se solicitado pelo usuário

---

## Task Summary

| Phase | Story | Tasks | Count |
|-------|-------|-------|-------|
| 1 Setup | — | T001–T003 | 3 |
| 2 Foundational | — | T004–T007 | 4 |
| 3 US1 Menu | US1 | T008–T011 | 4 |
| 4 US2 Ícones | US2 | T012–T016 | 5 |
| 5 US3 Ordem/estilo | US3 | T017–T026 | 10 |
| 6 Polish | — | T027–T030 | 4 |
| **Total** | | **T001–T030** | **30** |
