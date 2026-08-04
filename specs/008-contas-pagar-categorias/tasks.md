# Tasks: Contas a Pagar — Categorias e Exclusão em Massa

**Input**: Design documents from `/specs/008-contas-pagar-categorias/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados no spec — validação manual via [quickstart.md](./quickstart.md) + `npm run lint` / `npm run type-check`

**Organization**: Tasks agrupadas por user story para entrega incremental e teste independente

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: User story (US1, US2, US3, US4, US5)
- Incluir caminhos de arquivo exatos nas descrições

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`
- Contratos: `specs/008-contas-pagar-categorias/contracts/`
- Modelo: `specs/008-contas-pagar-categorias/data-model.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contexto e limites antes de editar código

- [x] T001 Revisar `specs/008-contas-pagar-categorias/plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api-contas-pagar.md` e `contracts/ui-contas-pagar.md` e confirmar escopo (taxonomia Categorias, migração, sem Deletar todas, ajuste mínimo Impostos/Retiradas/custo, import só taxonomia nova)
- [x] T002 [P] Inspecionar UI Contas (filtros, modal, Deletar todas, import, grupos) em `frontend/src/pages/Contas.tsx`
- [x] T003 [P] Inspecionar model/schema/rotas de contas e usos de `CentroCusto` em `backend/app/models/__init__.py`, `backend/app/schemas.py`, `backend/app/api/routes/contas.py`, `backend/app/api/routes/impostos.py`, `backend/app/api/routes/relatorios.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Serviço de taxonomia, schema DB (`categoria` / `subcategoria` / `categoria_pendente`), schemas Pydantic e tipos TS — base para todas as stories

**⚠️ CRITICAL**: Nenhuma user story de CRUD/UI até o modelo e a migração de colunas existirem

- [x] T004 Criar `backend/app/services/categorias_contas.py` com catálogo (códigos/labels), validação create/update, mapeamento legado → novo e helpers de label (conforme [data-model.md](./data-model.md) e [research.md](./research.md))
- [x] T005 Em `backend/app/models/__init__.py`, atualizar `ContaPagar`: remover dependência de `centro_custo` Enum; adicionar `categoria` (String), `subcategoria` (String nullable), `categoria_pendente` (Boolean default False); deprecar/remover `CentroCusto` se ficar órfão
- [x] T006 Em `backend/app/main.py`, adicionar ALTERs (`categoria`, `subcategoria`, `categoria_pendente`) + migração one-shot dos valores de `centro_custo` (mapeáveis → novos códigos; não mapeáveis → `categoria_pendente=true` mantendo código antigo) e remoção/abandono seguro da coluna `centro_custo` (padrão runtime do projeto)
- [x] T007 [P] Atualizar `ContaPagarBase` / Create / Update / Response em `backend/app/schemas.py` para `categoria`, `subcategoria`, `categoria_pendente` (sem `centro_custo`); validar combinação via serviço de taxonomia
- [x] T008 [P] Atualizar interface `ContaPagar` em `frontend/src/types/index.ts` (`categoria`, `subcategoria?`, `categoria_pendente`) e remover `centro_custo`

**Checkpoint**: DB migrado; schemas/tipos alinhados; `categorias_contas` importável

---

## Phase 3: User Story 1 — Manter lançamento manual (Priority: P1) 🎯 MVP

**Goal**: Admin continua criando/editando/consultando contas a pagar manualmente com os novos campos; visualizador só lê

**Independent Test**: Criar conta Marketing e RH/Salário; editar; marcar paga; visualizador só consulta (quickstart V1, V7)

### Implementation for User Story 1

- [x] T009 [US1] Em `backend/app/api/routes/contas.py`, ajustar `POST` / `PUT` / `GET` / `GET {id}` para ler/gravar `categoria`/`subcategoria`/`categoria_pendente`; validar taxonomia no create e quando categoria é enviada no update; update parcial de pagamento/descrição sem forçar reclassificação
- [x] T010 [US1] Em `frontend/src/services/api.ts`, atualizar `contasService.listar` / `criar` / `atualizar` para params/payload `categoria`/`subcategoria` (remover `centro_custo`)
- [x] T011 [US1] Em `frontend/src/pages/Contas.tsx`, adaptar form/estado inicial e `salvar` para enviar `categoria`/`subcategoria`; manter fluxo manual criar/editar/pagar funcionando com selects básicos da taxonomia nova
- [x] T012 [US1] Garantir que visualizador continua sem ações de escrita em `frontend/src/pages/Contas.tsx` (padrão `papel === 'admin'`)

**Checkpoint**: MVP — CRUD manual funciona com novos campos de categoria

---

## Phase 4: User Story 2 — Inabilitar “Deletar todas” (Priority: P1)

**Goal**: Exclusão em massa indisponível na UI; API retorna 403; exclusão individual permanece

**Independent Test**: Admin não vê “Deletar todas”; `DELETE /api/contas/todas` → 403; delete individual ok (quickstart V2)

### Implementation for User Story 2

- [x] T013 [US2] Em `backend/app/api/routes/contas.py`, fazer `DELETE /todas` retornar **403** com mensagem clara (contrato API); manter `DELETE /{id}`
- [x] T014 [US2] Em `frontend/src/pages/Contas.tsx`, remover botão “Deletar todas”, handler `deletarTodas` e imports/usos associados
- [x] T015 [P] [US2] Em `frontend/src/services/api.ts`, remover ou deixar de usar `contasService.deletarTodas` na superfície da página

**Checkpoint**: FR-002 atendido (UI + API)

---

## Phase 5: User Story 3 — Classificar por Categorias (Priority: P1)

**Goal**: Rótulo “Categorias”; 7 categorias + sub RH obrigatória; filtros superior e sub RH; import só taxonomia nova

**Independent Test**: Labels Categorias; criar/filtrar RH+sub; import inválido/legado falha (quickstart V3, V6)

### Implementation for User Story 3

- [x] T016 [P] [US3] Em `frontend/src/components/Layout.tsx`, ajustar `desc` do item Contas a Pagar (remover “centro de custo”; falar em categorias)
- [x] T017 [US3] Em `frontend/src/store/index.ts`, substituir/estender filtro `contasCentro` por `contasCategoria` + `contasSubcategoria` (ou equivalente) e wire em `usePageFilters`
- [x] T018 [US3] Em `frontend/src/pages/Contas.tsx`, renomear todos os rótulos “Centro de Custo/Centro” → **Categorias**; select de categoria (7 opções); select de subcategoria visível/obrigatório só para RH; limpar sub ao trocar categoria
- [x] T019 [US3] Em `frontend/src/pages/Contas.tsx`, filtros: categoria superior + sub RH opcional; listagem/grupos por categoria (e sub quando RH); chamada `listar` com novos params
- [x] T020 [US3] Em `backend/app/api/routes/contas.py`, filtros `categoria`/`subcategoria` na listagem (RH sem sub = todas as sub; com sub = AND) conforme contrato
- [x] T021 [US3] Em `backend/app/api/routes/contas.py` (e parser Excel se em `excel_io`), validar import XLSX/CSV só com taxonomia nova; RH exige sub; legado/inválido → erro na linha; atualizar exemplo em `ImportCSV` / modal em `frontend/src/pages/Contas.tsx`
- [x] T022 [US3] Em `frontend/src/pages/Contas.tsx`, atualizar export CSV headers/labels para Categorias (e sub quando aplicável)

**Checkpoint**: Taxonomia completa na UI/API + import restrito

---

## Phase 6: User Story 4 — Compatibilidade legada e pendência (Priority: P2)

**Goal**: Migrados listáveis; pendentes com aviso visual; pagar/editar sem bloquear; reclassificar limpa pendência

**Independent Test**: Pendente com badge; marcar paga ok; reclassificar remove pendência (quickstart V4) — migração já em T006

### Implementation for User Story 4

- [x] T023 [US4] Em `frontend/src/pages/Contas.tsx`, exibir indicação clara de `categoria_pendente` (badge/aviso) e label legível do valor legado
- [x] T024 [US4] Em `frontend/src/pages/Contas.tsx`, permitir pagar/editar campos não-categoria em pendentes sem exigir reclassificação; ao salvar categoria(+sub) válida, enviar payload que zera pendência (backend já em T009)
- [x] T025 [US4] Confirmar em `backend/app/api/routes/contas.py` que PUT com categoria válida seta `categoria_pendente=false` e que PUT só de pagamento não exige categoria nova

**Checkpoint**: FR-009 / SC-005 atendidos na UX

---

## Phase 7: User Story 5 — Impostos, Retiradas e custo por categoria (Priority: P2)

**Goal**: Telas auxiliares continuam corretas com a taxonomia nova (ajuste mínimo)

**Independent Test**: Conta Impostos em Impostos; RH/Retirada Sócios em Retiradas; donut/custo reflete categorias (quickstart V5)

### Implementation for User Story 5

- [x] T026 [P] [US5] Em `backend/app/api/routes/impostos.py`, filtrar contas por `categoria == impostos` e `categoria_pendente == false` (remover `CentroCusto.IMPOSTOS`)
- [x] T027 [P] [US5] Em `backend/app/api/routes/relatorios.py`, atualizar agregações DRE/custo-por-categoria para `categoria`/`subcategoria` (impostos vs demais; group by categoria; pendentes conforme [research.md](./research.md) §7); alinhar shape da resposta ao Dashboard
- [x] T028 [P] [US5] Em `frontend/src/pages/Retiradas.tsx`, filtrar/criar com `categoria=recursos_humanos` + `subcategoria=retirada_socios`; atualizar textos que citam “centro de custo / Retirada de Lucro”
- [x] T029 [US5] Em `frontend/src/pages/Impostos.tsx`, ajustar textos/ajuda se mencionarem centro de custo antigo; confirmar lista/totais com API nova
- [x] T030 [US5] Em `frontend/src/pages/Dashboard.tsx`, consumir fatias de custo por `categoria` (labels oficiais); mínimo necessário sem redesign

**Checkpoint**: SC-007 — sem sumiço de despesas migradas nas telas auxiliares

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Limpeza, consistência e validação end-to-end

- [x] T031 [P] Buscar e remover referências órfãs a `centro_custo` / `CentroCusto` / `contasCentro` em `frontend/src/` e `backend/app/` (exceto docs históricos em `specs/`)
- [x] T032 [P] Atualizar descricões em `frontend/src/pages/Configuracoes.tsx` se o módulo contas mencionar centro de custo
- [x] T033 Rodar validação manual de [quickstart.md](./quickstart.md) (V1–V7)
- [x] T034 Executar `cd frontend && npm run lint && npm run type-check` e corrigir erros introduzidos pela feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as user stories
- **US1 (Phase 3)**: Após Foundational — MVP
- **US2 (Phase 4)**: Após Foundational (pode paralelo a US1 se arquivos coordenados; `Contas.tsx` compartilha — preferir após ou junto com cuidado)
- **US3 (Phase 5)**: Após US1 (evolui a mesma página Contas)
- **US4 (Phase 6)**: Após US3 (pendência na UI de categorias)
- **US5 (Phase 7)**: Após Foundational + preferível após US1 (códigos estáveis); paralelo a US2/US3 se backend consumidores vs UI Contas
- **Polish (Phase 8)**: Após stories desejadas

### User Story Dependencies

- **US1 (P1)**: Após Phase 2 — sem dependência de outras stories
- **US2 (P1)**: Após Phase 2 — independente funcionalmente; mesmo arquivo UI que US1
- **US3 (P1)**: Depende de US1 (form/listagem base)
- **US4 (P2)**: Depende de US3 (rótulos/filtros) + migração T006
- **US5 (P2)**: Depende de Phase 2; independente da UI Contas completa, mas valida melhor após migração

### Parallel Opportunities

- T002 ∥ T003 (Setup)
- T007 ∥ T008 (após T005/T006 em andamento cuidadoso — preferir T005→T006→T007/T008)
- T016 ∥ partes de store (T017) se arquivos distintos
- T026 ∥ T027 ∥ T028 (consumidores backend/frontend distintos)
- T031 ∥ T032 (Polish)

---

## Parallel Example: User Story 5

```bash
# Após Phase 2, em paralelo:
Task: "T026 — impostos.py filtro categoria=impostos"
Task: "T027 — relatorios.py custo/DRE por categoria"
Task: "T028 — Retiradas.tsx RH/retirada_socios"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 Setup  
2. Phase 2 Foundational (migração + taxonomia)  
3. Phase 3 US1 — CRUD manual com categorias  
4. **STOP e VALIDAR** (quickstart V1)  
5. Seguir US2 → US3 → US4 → US5 → Polish  

### Incremental Delivery

1. Setup + Foundational → base pronta  
2. US1 → MVP operacional  
3. US2 → risco de exclusão em massa eliminado  
4. US3 → taxonomia + filtros + import  
5. US4 → pendências legadas tratadas na UX  
6. US5 → Impostos/Retiradas/Dashboard coerentes  
7. Polish + quickstart completo  

### Suggested MVP Scope

**US1 apenas** (após Foundational): lançamento manual com novos campos — já entrega valor se a migração rodou e o CRUD não quebrou.

---

## Notes

- [P] = arquivos diferentes, sem depender de tarefa incompleta no mesmo arquivo
- Sem tasks de teste automatizado (não pedidas no spec)
- Commit por tarefa ou grupo lógico a critério do implementador
- Validar cada checkpoint antes da próxima story quando possível
