# Tasks: Contas a Pagar — Taxonomia de Categorias

**Input**: Design documents from `/specs/021-contas-pagar-taxonomia/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados no spec — validação manual via [quickstart.md](./quickstart.md) + `npm run lint` / `npm run type-check`

**Organization**: Tasks agrupadas por user story para entrega incremental e teste independente

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: User story (US1, US2, US3, US4)
- Incluir caminhos de arquivo exatos nas descrições

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`
- Contratos: `specs/021-contas-pagar-taxonomia/contracts/`
- Modelo: `specs/021-contas-pagar-taxonomia/data-model.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline vs spec 021 antes de editar código (sem migration, sem converter legado)

- [ ] T001 Revisar `specs/021-contas-pagar-taxonomia/plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api-contas-pagar-taxonomia.md` e `contracts/ui-contas-pagar-taxonomia.md` e confirmar: 8 categorias; RH com 4 subs; sem UPDATE em massa; PUT aceita par legado inalterado; import rejeita RH + Benefícios
- [ ] T002 [P] Inspecionar `CATEGORIAS`, `SUBCATEGORIAS_RH`, `validar_classificacao`, `label_categoria`, `_IMPORT_*` e `inferir_de_descricao` em `backend/app/services/categorias_contas.py`
- [ ] T003 [P] Inspecionar `CATEGORIAS_OPCOES`, `SUB_RH_OPCOES`, `categoriaLabel`, filtros, modal e import em `frontend/src/pages/Contas.tsx`; `CENTRO_LABEL` / `CENTRO_COR` em `frontend/src/pages/Dashboard.tsx`; `criar_conta` / `atualizar_conta` / `listar_contas` em `backend/app/api/routes/contas.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Catálogo e validação de **create/import** — bloqueia POST, labels e inferência de todas as stories

**⚠️ CRITICAL**: Nenhuma story de UI até o catálogo oficial existir no backend

- [ ] T004 Em `backend/app/services/categorias_contas.py`: adicionar `CATEGORIA_BENEFICIOS = "beneficios"` em `CATEGORIAS` **após** RH e **antes** de Tecnologia; remover `beneficios` de `SUBCATEGORIAS_RH` (manter constante `SUB_BENEFICIOS` só para legado); `label_categoria` deve exibir "Recursos Humanos / Benefícios" quando RH + sub `beneficios` **sem** usar `categoria_pendente`; aliases de import de **categoria** incluem benefícios/`beneficios`; aliases de **sub** RH **não** incluem Benefícios; `inferir_de_descricao` (vr, vt, plano de saúde, benefício) → `(beneficios, None)`; `validar_classificacao` no create: 8 categorias; RH exige uma das 4 subs; `categoria=beneficios` com sub `null`; **rejeitar** RH + `beneficios`; expor helper `eh_legado_rh_beneficios(categoria, subcategoria)` — [data-model.md](./data-model.md) · [research.md](./research.md) §1–4

**Checkpoint**: Restart API; POST `categoria=beneficios` → 201; POST RH + `beneficios` → 422; POST RH + `salario` → 201. **Não** rodar SQL de conversão.

---

## Phase 3: User Story 1 — Classificar despesa nas categorias estruturadas (Priority: P1) 🎯 MVP

**Goal**: Formulário e listagem com as 8 categorias na ordem oficial; Benefícios, Tecnologia e Impostos como primeiro nível; salvar sem subcategoria nessas categorias.

**Independent Test**: Abrir criar/editar; conferir ordem do select; criar conta em Benefícios e em Marketing; visualizador só consulta — [quickstart.md](./quickstart.md) UI 1, 3, 9

### Implementation for User Story 1

- [ ] T005 [US1] Em `frontend/src/pages/Contas.tsx`, atualizar `CATEGORIAS_OPCOES` para a ordem: Adm/Financeiro, Operações, Marketing, Comercial, Recursos Humanos, Benefícios (`beneficios`), Tecnologia, Impostos; ao escolher não-RH, limpar subcategoria — [contracts/ui-contas-pagar-taxonomia.md](./contracts/ui-contas-pagar-taxonomia.md)
- [ ] T006 [P] [US1] Em `frontend/src/pages/Dashboard.tsx`, adicionar `beneficios` em `CENTRO_LABEL` (**Benefícios**) e `CENTRO_COR` (cor distinta de RH) — [contracts/ui-contas-pagar-taxonomia.md](./contracts/ui-contas-pagar-taxonomia.md)

**Checkpoint**: MVP — categoria Benefícios gravável e visível no donut se houver valor

---

## Phase 4: User Story 2 — Classificar Recursos Humanos com subcategoria (Priority: P1)

**Goal**: RH exige uma das quatro subs oficiais; Benefícios **não** aparece como sub nova; toast/API alinhados.

**Independent Test**: RH sem sub bloqueia; as 4 subs salvam; Benefícios ausente da lista de sub no novo lançamento — [quickstart.md](./quickstart.md) UI 2

### Implementation for User Story 2

- [ ] T007 [US2] Em `frontend/src/pages/Contas.tsx`, reduzir `SUB_RH_OPCOES` a Salário, Bônus, Comissão, Retirada Sócios; ajustar toast/`salvar`/validação do ImportCSV para exigir só essas quatro quando RH; mensagem de erro alinhada a `validar_classificacao` (sem citar Benefícios como sub válida) — [contracts/ui-contas-pagar-taxonomia.md](./contracts/ui-contas-pagar-taxonomia.md)

**Checkpoint**: US1+US2 — taxonomia nova no formulário de criação

---

## Phase 5: User Story 3 — Filtrar a lista pela taxonomia nova (Priority: P2)

**Goal**: Filtro por categoria de primeiro nível; RH sem sub inclui legado; filtro Benefícios só a categoria nova; sub filtro RH só as 4 oficiais.

**Independent Test**: Filtro Benefícios vs RH (todas) vs RH+Salário conforme [quickstart.md](./quickstart.md) UI 4 e GET do smoke API

### Implementation for User Story 3

- [ ] T008 [US3] Em `frontend/src/pages/Contas.tsx`, garantir que o select de filtro usa `CATEGORIAS_OPCOES` na ordem oficial (com “Todas”); sub filtro só se `contasCategoria === 'recursos_humanos'` e só as 4 oficiais; ao filtrar Benefícios **não** enviar `subcategoria` — o `GET /api/contas?categoria=` em `backend/app/api/routes/contas.py` já inclui legado em RH sem sub e isola `categoria=beneficios` — [contracts/api-contas-pagar-taxonomia.md](./contracts/api-contas-pagar-taxonomia.md)

**Checkpoint**: Filtros batem com FR-006; sem mudar Impostos/Retiradas

---

## Phase 6: User Story 4 — Preservar contas já classificadas como RH / Benefícios (Priority: P2)

**Goal**: Sem migração e sem aviso de pendência; edição mostra o par legado; PUT de outros campos mantém; reclassificar só ao gravar categoria `beneficios`; import rejeita o par antigo.

**Independent Test**: Legado intacto após deploy; PUT só valor preserva par; PUT categoria Benefícios reclassifica; import RH+Benefícios falha — [quickstart.md](./quickstart.md) API ID_LEGADO + UI 5–6

### Implementation for User Story 4

- [ ] T009 [US4] Em `backend/app/api/routes/contas.py` (`atualizar_conta`): se o par `categoria`/`subcategoria` enviado (ou o persistido quando o campo não vem) for **idêntico** ao atual, **não** chamar `validar_classificacao` do catálogo novo (aceitar legado via `eh_legado_rh_beneficios`); se a classificação **mudar**, validar só o catálogo oficial; reclassificar para Benefícios persiste `subcategoria=None`; **não** setar `categoria_pendente` nesse par — [research.md](./research.md) §3 · [contracts/api-contas-pagar-taxonomia.md](./contracts/api-contas-pagar-taxonomia.md)
- [ ] T010 [US4] Em `frontend/src/pages/Contas.tsx`: `categoriaLabel` exibe **Recursos Humanos / Benefícios** para o par legado sem tratar como `categoria_pendente`; na edição, incluir opção de sub Benefícios **somente** se a conta já tem esse par; **não** mostrar badge de reclassificar; `salvar` reenvia o par legado se Categorias não mudou; ao trocar para categoria Benefícios, limpar sub — [contracts/ui-contas-pagar-taxonomia.md](./contracts/ui-contas-pagar-taxonomia.md)
- [ ] T011 [US4] Em `frontend/src/pages/Contas.tsx` (ImportCSV) e no caminho de import em `backend/app/api/routes/contas.py` (já usa `validar_classificacao`): rejeitar linha RH + Benefícios com erro de linha; aceitar `categoria=beneficios` (ou label) sem sub — [spec.md](./spec.md) Clarify Q3

**Checkpoint**: Histórico preservado; taxonomia nova só em create/import/reclassificação explícita

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Conferir consumidores e validar o quickstart

- [ ] T012 [P] Confirmar que `frontend/src/pages/Impostos.tsx` e `frontend/src/pages/Retiradas.tsx` continuam filtrando só `impostos` e RH/`retirada_socios` (legado Benefícios **não** entra em Retiradas); sem redesign
- [ ] T013 Executar [quickstart.md](./quickstart.md) (smoke API + UI) e `cd frontend && npm run lint && npm run type-check`; **não** converter contas legado no banco

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as stories
- **US1 (Phase 3)**: Depende da Phase 2 — MVP
- **US2 (Phase 4)**: Depende de US1 (`Contas.tsx` compartilhado)
- **US3 (Phase 5)**: Depende de US1 (opções de filtro); convive com US2
- **US4 (Phase 6)**: Depende da Phase 2 (helper/catálogo); UI de edição no mesmo `Contas.tsx` após US2
- **Polish (Phase 7)**: Depende das stories desejadas

### User Story Dependencies

- **User Story 1 (P1)**: Após Phase 2 — catálogo + select de 8 categorias
- **User Story 2 (P1)**: Após US1 — mesmo arquivo `Contas.tsx` (subs RH)
- **User Story 3 (P2)**: Após US1 — filtros; API de listagem já correta com T004
- **User Story 4 (P2)**: Após Phase 2 para PUT; UI legado após US2 para não reintroduzir Benefícios no create

### Within Each User Story

- Catálogo backend (T004) antes de UI/PUT
- Sem testes automatizados (não pedidos)
- Story completa antes do próximo checkpoint

### Parallel Opportunities

- T002 e T003 após T001
- T006 (Dashboard) em paralelo com T005 (`Contas.tsx`)
- T012 em paralelo com T013 se o smoke UI já estiver ok
- **Não** paralelizar T005, T007, T008, T010, T011 — todos tocam `frontend/src/pages/Contas.tsx`

---

## Parallel Example: User Story 1

```bash
# Após T004:
Task: "Atualizar CATEGORIAS_OPCOES em frontend/src/pages/Contas.tsx"
Task: "Adicionar beneficios em CENTRO_LABEL/CENTRO_COR em frontend/src/pages/Dashboard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1 + Phase 2 (T004)
2. Completar Phase 3 (T005–T006)
3. **STOP**: criar conta Benefícios e conferir donut
4. Demo se suficiente para o time

### Incremental Delivery

1. Setup + Foundational → POST da taxonomia nova
2. US1 → 8 categorias na UI (MVP)
3. US2 → RH com 4 subs
4. US3 → filtros
5. US4 → legado + import + PUT
6. Polish → quickstart

### Parallel Team Strategy

Com duas pessoas, após T004: uma em `Contas.tsx` (US1→US2→US3→US4 UI), outra em Dashboard (T006) e depois `contas.py` PUT (T009).

---

## Notes

- [P] = arquivos diferentes, sem depender de tarefa incompleta no mesmo arquivo
- Sem migration SQL e sem job de conversão (Clarify Q1)
- Código `beneficios` em `categoria` ≠ legado em `subcategoria` com RH ([research.md](./research.md) §1)
- Commit após cada task ou grupo lógico, se o usuário pedir
- Validar cada checkpoint com [quickstart.md](./quickstart.md)
