# Tasks: Página Bônus e Comissão com abas

**Input**: Design documents from `/specs/062-bonus-comissao-abas/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Setup → Foundation (`tipo` + GET + isolamento do sync) → US1 (abas/nome) → US2 (listagem) → US4 (cadastro na NF) → US3 (lote) → Polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US4 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/main.py`, `backend/app/models/__init__.py`, `backend/app/schemas.py`, `backend/app/api/routes/bonus.py`, `backend/app/api/routes/nfs.py`, `backend/app/services/comissoes_sync.py`, `backend/app/services/bonus_sync.py`
- Frontend: `frontend/src/pages/Bonus.tsx`, `frontend/src/pages/NFs.tsx`, `frontend/src/components/BonusLinhasForm.tsx`, `frontend/src/utils/paginasCatalogo.ts`, `frontend/src/types/index.ts`, `frontend/src/services/api.ts`
- Contratos: `specs/062-bonus-comissao-abas/contracts/`
- **Não alterar**: Dashboard (`BONUS: 'Comissões'`), Contas a Pagar `Comissões (legado)`, path `/comissoes`, `key: 'bonus'` do catálogo, portas 5193/8001

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte da feature 062

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e [research.md](./research.md): sessão `/comissoes`; coluna `tipo` em `bonus`; sync isolado; nomenclatura só da sessão; valor de bônus informado; portas inalteradas

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Discriminador `tipo`, listagem filtrada e sync de comissões que não apaga bônus — bloqueia US1–US4

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 [P] Em `backend/app/main.py`, migration inline: `tipo VARCHAR(20) NOT NULL DEFAULT 'comissao'`, índice `ix_bonus_tipo`, `percentual` e `etapa` `DROP NOT NULL` — [data-model.md](./data-model.md)
- [x] T003 [P] Em `backend/app/models/__init__.py`, adicionar `Bonus.tipo` (`comissao`\|`bonus`, default `comissao`); permitir `percentual` e `etapa` nulos
- [x] T004 Em `backend/app/schemas.py`, estender `BonusResponse` com `tipo` e `percentual` opcional; em `backend/app/services/comissoes_sync.py`, incluir `tipo` em `serializar_bonus` — [contracts/rest-bonus-comissao-abas.md](./contracts/rest-bonus-comissao-abas.md)
- [x] T005 Em `backend/app/api/routes/bonus.py`, query `tipo` (default `comissao`; rejeitar valor inválido) e filtrar listagem — FR-005, [contracts/rest-bonus-comissao-abas.md](./contracts/rest-bonus-comissao-abas.md)
- [x] T006 Em `backend/app/services/comissoes_sync.py`, `sincronizar` MUST consultar/atualizar/apagar **somente** `tipo='comissao'` da NF — R2 [research.md](./research.md), FR-027
- [x] T007 [P] Em `frontend/src/types/index.ts`, adicionar `tipo?: 'comissao' | 'bonus'` em `Bonus`; tornar `percentual` opcional
- [x] T008 [P] Em `frontend/src/services/api.ts`, `bonusService.listar` aceitar `tipo` e enviá-lo na query

**Checkpoint**: `GET /api/bonus` e `GET /api/bonus?tipo=bonus` conjuntos disjuntos; histórico existente só em `comissao`; foundation liberada

---

## Phase 3: User Story 1 - Reconhecer a página e alternar as abas (Priority: P1) 🎯 MVP

**Goal**: Menu, título e catálogo dizem **Bônus e Comissão**; duas abas; padrão Comissão; filtros persistentes; total/gráfico/vazio da aba ativa

**Independent Test**: [quickstart.md](./quickstart.md) §1 — SC-001, SC-002

### Implementation for User Story 1

- [x] T009 [P] [US1] Em `frontend/src/utils/paginasCatalogo.ts`, label **Bônus e Comissão** e descrição alinhada; manter `key: 'bonus'` e `path: '/comissoes'` — FR-001, [contracts/ui-bonus-comissao-abas.md](./contracts/ui-bonus-comissao-abas.md)
- [x] T010 [US1] Em `frontend/src/pages/Bonus.tsx`, título **Bônus e Comissão**; abas **Bônus** | **Comissão** (estilo Dashboard); estado inicial **Comissão**; ao trocar aba: GET `tipo`, `pagina=0`, limpar `selecionados`; manter filtros Zustand — FR-002, FR-003, FR-004, FR-020
- [x] T011 [US1] Em `frontend/src/pages/Bonus.tsx`, total do cabeçalho, gráfico e empty state só da aba ativa (“Nenhum bônus encontrado” / “Nenhuma comissão encontrada”) — FR-006

**Checkpoint**: SC-001 / SC-002; aba Bônus vazia sem misturar histórico; MVP de nomenclatura

---

## Phase 4: User Story 2 - Operar a listagem (Priority: P1)

**Goal**: Nas duas abas: Editar→Conta a receber, Liberar, Pagar, sem Deletar, colunas Liberado/Pago; aba Bônus sem Atividade/Percentual

**Independent Test**: [quickstart.md](./quickstart.md) §3 — SC-003, SC-004, SC-006, SC-007 (na aba Comissão já parcialmente entregue em 048; repetir na aba Bônus após US4 ter dados)

### Implementation for User Story 2

- [x] T012 [US2] Em `frontend/src/pages/Bonus.tsx`, colunas da aba **Bônus** sem Atividade nem Percentual; Liberado (linha + soma do grupo) e Pago iguais à aba Comissão — FR-012, FR-013, FR-023
- [x] T013 [US2] Em `frontend/src/pages/Bonus.tsx`, reusar Editar (`/nfs?edit=` + toast sem NF), Liberar e Pagar; textos de confirmação/toast “bônus” vs “comissão” conforme a aba; **não** renderizar Deletar — FR-007–FR-011, FR-014–FR-016, FR-021

**Checkpoint**: Pacote de ações visível nas duas abas; SC-003 / SC-007 na Comissão imediatamente

---

## Phase 5: User Story 4 - Cadastrar bônus na Conta a receber (Priority: P1)

**Goal**: Bloco **Bônus** paralelo ao de Comissões; Fornecedor, Mês/Ano, valor R$ informado; linhas na aba Bônus; sync isolado

**Independent Test**: [quickstart.md](./quickstart.md) §2 e §5 — SC-008, SC-009, SC-010

### Implementation for User Story 4

- [x] T014 [P] [US4] Em `backend/app/schemas.py`, criar `BonusLinhaInput` (`colaborador_id`, `mes`, `ano`, `valor > 0`; rejeitar `percentual`/`atividades`) e campo opcional `bonus` em `NFCreate` / `NFUpdate` — [contracts/rest-bonus-comissao-abas.md](./contracts/rest-bonus-comissao-abas.md), FR-028, FR-030
- [x] T015 [US4] Em `backend/app/services/bonus_sync.py`, implementar `sincronizar_bonus`: criar/atualizar/remover só `tipo='bonus'` não liberadas; persistir `valor` em `valor_bonus`; **nunca** recalcular pelo líquido; `None` = no-op — FR-024–FR-029, [data-model.md](./data-model.md)
- [x] T016 [US4] Em `backend/app/api/routes/nfs.py`, após `sincronizar` de comissões, chamar `sincronizar_bonus` com `bonus` só se o campo veio no body (`model_fields_set`)
- [x] T017 [P] [US4] Em `frontend/src/types/index.ts`, criar `BonusLinhaForm` / input; em `frontend/src/services/api.ts`, incluir `bonus` no payload de criar/atualizar NF
- [x] T018 [US4] Em `frontend/src/components/BonusLinhasForm.tsx`, bloco **Bônus**: Fornecedor, Mês/Ano, Valor (R$) editável, adicionar/remover; linhas liberadas disabled + badge; sem % e sem Atividade — [contracts/ui-bonus-comissao-abas.md](./contracts/ui-bonus-comissao-abas.md)
- [x] T019 [US4] Em `frontend/src/pages/NFs.tsx`, estado `bonusLinhas`; carregar `GET /api/bonus?nf_id=&tipo=comissao` e `tipo=bonus` em blocos separados; validar valor > 0; enviar `comissoes` e `bonus` no save; montar `BonusLinhasForm` após `ComissoesLinhasForm`; deep-link `/nfs?edit=` popula os dois — FR-024–FR-027, SC-009

**Checkpoint**: SC-008–SC-010; gravar só comissão não apaga bônus (§5 do quickstart)

---

## Phase 6: User Story 3 - Caixa de seleção e ações em massa (Priority: P2)

**Goal**: Checkboxes e Liberar/Pagar em massa só na página atual da aba ativa; import CSV só na aba Comissão; export da aba ativa

**Independent Test**: [quickstart.md](./quickstart.md) §4 — SC-005

### Implementation for User Story 3

- [x] T020 [US3] Em `frontend/src/pages/Bonus.tsx`, confirmar barra de lote e seleção de grupo/linha só com ids da aba ativa; limpar seleção ao paginar/filtrar/trocar aba (reforço FR-017–FR-020); toasts de lote com “bônus”/“comissão”
- [x] T021 [US3] Em `frontend/src/pages/Bonus.tsx`, Importar CSV somente na aba **Comissão**; Exportar CSV/PDF do conjunto da aba ativa (CSV de bônus sem percentual/atividade) — [contracts/ui-bonus-comissao-abas.md](./contracts/ui-bonus-comissao-abas.md)

**Checkpoint**: SC-005; lote não cruza abas nem páginas

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e validação ponta a ponta

- [x] T022 [P] Garantir que `frontend/src/pages/Dashboard.tsx` e `frontend/src/pages/Contas.tsx` **não** trocam o rótulo Comissões (assumption da spec)
- [x] T023 Em `frontend/`, `npm run lint` e `npm run type-check`
- [x] T024 Percorrer [quickstart.md](./quickstart.md) §§1–5 com `admin` e conferir visualizador só leitura (SC-006)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as histórias
- **US1 (Phase 3)**: Após Phase 2 — MVP
- **US2 (Phase 4)**: Após US1 (mesma página `Bonus.tsx`); ações da Comissão já existem, precisam da estrutura de abas
- **US4 (Phase 5)**: Após Phase 2; pode seguir em paralelo a US1/US2 no backend (`bonus_sync` / schemas), mas o form NF e a aba Bônus com dados reais fecham juntos
- **US3 (Phase 6)**: Após US1 (abas + seleção); lote da Comissão já existe — adaptar à aba
- **Polish (Phase 7)**: Após as histórias desejadas

### User Story Dependencies

- **US1 (P1)**: Após foundation — independente para demo de nome/abas (aba Bônus vazia)
- **US2 (P1)**: Integra com US1 em `Bonus.tsx`; testável na aba Comissão sem US4
- **US4 (P1)**: Independente no backend após foundation; UI da NF independente da página de abas; ponta a ponta precisa de US1 para ver a aba Bônus
- **US3 (P2)**: Depende da seleção/abas da US1; ids de bônus no lote exigem US4 para o cenário completo

### Parallel Opportunities

- T002 / T003 em paralelo; T007 / T008 em paralelo após T005
- T009 em paralelo com início de T010
- T014 / T017 em paralelo; T018 depois de T017
- T022 em paralelo com T023

---

## Parallel Example: Foundation

```bash
Task: "Migration tipo em backend/app/main.py"
Task: "Bonus.tipo em backend/app/models/__init__.py"
```

## Parallel Example: User Story 4

```bash
Task: "BonusLinhaInput em backend/app/schemas.py"
Task: "BonusLinhaForm em frontend/src/types/index.ts + api.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2
2. Phase 3 (US1)
3. **STOP**: menu, título, abas, Comissão com dados atuais, Bônus vazio
4. Demo de nomenclatura

### Incremental Delivery

1. Foundation → GET `tipo` seguro
2. US1 → abas (MVP)
3. US2 → ações explícitas na UI das abas
4. US4 → bônus nascem na Conta a receber
5. US3 → lote na aba Bônus + CSV
6. Polish / quickstart

### Parallel Team Strategy

- Dev A: T002–T006 (backend foundation + US4 sync)
- Dev B: T007–T013 (tipos, catálogo, `Bonus.tsx`)
- Depois: Dev B `BonusLinhasForm` + `NFs.tsx` (T018–T019) com contrato REST já no ar

---

## Notes

- [P] = arquivos diferentes, sem depender de tarefa incompleta no mesmo arquivo
- Sem tarefas de teste automatizado (spec não pediu TDD)
- Commit por tarefa ou grupo lógico (só se o usuário pedir commit)
- `Bonus.tsx` concentra US1–US3: evitar dois agentes no mesmo arquivo ao mesmo tempo
- Isolamento do sync (T006) **antes** de criar linhas `tipo=bonus` (T015)
