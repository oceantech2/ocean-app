# Tasks: Página Contas a Receber

**Input**: Design documents from `/specs/007-contas-receber/`

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
- Contratos: `specs/007-contas-receber/contracts/`
- Modelo: `specs/007-contas-receber/data-model.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contexto e limites antes de editar código

- [x] T001 Revisar `specs/007-contas-receber/plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api-contas-receber.md` e `contracts/ui-contas-receber.md` e confirmar escopo (stub Maggo; sem Maggo real; sem criar/importar/excluir/pasta; Caixa; allowlist)
- [x] T002 [P] Inspecionar listagem, botões (Nova NF, Deletar Todas, import, pasta), modal de edição e `arquivar` em `frontend/src/pages/NFs.tsx`
- [x] T003 [P] Inspecionar rotas CRUD/import/delete e schemas NF em `backend/app/api/routes/nfs.py` e `backend/app/schemas.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Coluna `caixa`, schemas tipados e serviço stub Maggo — base para todas as stories

**⚠️ CRITICAL**: Nenhuma user story de UI/API de listagem/edição até o modelo e o stub existirem

- [x] T004 Adicionar coluna `caixa` (`Column(String(20), nullable=True)`) ao model NF em `backend/app/models/__init__.py`
- [x] T005 Em `backend/app/main.py`, adicionar `ALTER TABLE nfs ADD COLUMN IF NOT EXISTS caixa VARCHAR(20)` no bloco de migrations runtime (padrão do projeto)
- [x] T006 [P] Incluir `caixa: Optional[str] = None` em `NFResponse` / `NFUpdate` (e validação `corrente` \| `investimento` \| null) em `backend/app/schemas.py`
- [x] T007 [P] Adicionar `caixa?: 'corrente' | 'investimento' | null` à interface `NF` em `frontend/src/types/index.ts`
- [x] T008 Criar `backend/app/services/maggo_stub.py` com `listar_contas_receber()` retornando lista determinística no shape do stub ([data-model.md](./data-model.md)); se `MAGGO_STUB_FAIL=true`, levantar exceção controlada

**Checkpoint**: DB/schemas/`caixa` prontos; stub Maggo importável e falhável via env

---

## Phase 3: User Story 1 — Consultar Contas a Receber via stub Maggo (Priority: P1) 🎯 MVP

**Goal**: Lista da página vem da fonte simulada Maggo (merge com Ocean), com rótulos Contas a Receber; erro claro se stub falhar

**Independent Test**: Abrir menu Contas a Receber / `/nfs`, ver registros do stub sem criar NF; recarregar; com `MAGGO_STUB_FAIL=true` ver toast/erro sem lista falsa de sucesso (quickstart V1, V5)

### Implementation for User Story 1

- [x] T009 [US1] Em `backend/app/api/routes/nfs.py`, alterar `GET /` para: chamar stub → merge/upsert por `numero` na tabela `nfs` (atualizar campos Maggo; preservar enriquecimento) → filtrar mês/ano/status/arquivadas → retornar lista; em falha do stub responder **502/503** (não `[]` 200) conforme `contracts/api-contas-receber.md`
- [x] T010 [US1] Garantir que `GET /api/nfs/resumo/total` (se usado na página) reflita a visão pós-merge ou documentar/ajustar chamada em `frontend/src/pages/NFs.tsx` para não mostrar totais inconsistentes
- [x] T011 [P] [US1] Em `frontend/src/components/Layout.tsx`, alterar label do item de menu de `NFs` para **Contas a Receber** (manter `path: '/nfs'`, `permKey: 'nfs'`)
- [x] T012 [P] [US1] Em `frontend/src/pages/Configuracoes.tsx`, alterar label do módulo `nfs` para **Contas a Receber**
- [x] T013 [US1] Em `frontend/src/pages/NFs.tsx`, atualizar H1/títulos/textos principais para **Contas a Receber**; manter `carregarNFs` via `nfsService.listar` e toast de erro em falha (não esvaziar lista como sucesso)
- [x] T014 [US1] (Opcional) Em `frontend/src/App.tsx`, adicionar rota `/contas-receber` redirecionando para `/nfs`

**Checkpoint**: MVP — lista Contas a Receber via stub + labels; falha do stub visível

---

## Phase 4: User Story 2 — Remover criar / importar / excluir / pasta (Priority: P1)

**Goal**: Superfície sem Nova NF, Deletar Todas, exclusão individual, importações e pasta; API bloqueia esses endpoints; arquivar permanece

**Independent Test**: Como admin, inspecionar página — ações ausentes; arquivar/desarquivar funciona; POST/DELETE/import retornam 403 (quickstart V2, V6, V8)

### Implementation for User Story 2

- [x] T015 [US2] Em `backend/app/api/routes/nfs.py`, fazer `POST /`, `DELETE /{id}`, `DELETE /todas` e `POST /importar-xlsx` retornarem **403** com mensagem clara (contrato API)
- [x] T016 [US2] Em `frontend/src/pages/NFs.tsx`, remover UI e handlers de: Nova NF, Deletar Todas, Deletar individual, Importar CSV, Importar Excel, botão pasta 📁 NFs e uso de `GerenciadorArquivos` / `ImportCSV` (manter exportações e Arquivar)
- [x] T017 [US2] Em `frontend/src/pages/NFs.tsx`, remover modal/modo “Nova NF” / `abrirCriar` e imports mortos (`arquivosNfsService` se não usado); confirmar que fluxo Arquivar / “Mostrar arquivadas” permanece
- [x] T018 [P] [US2] Em `frontend/src/services/api.ts`, deixar de expor na UI (ou marcar) `criar` / `deletar` / `deletarTodas` / `importarXlsx` se a página não os chama mais — sem quebrar outros consumidores se ainda existirem

**Checkpoint**: Página e API alinhadas a FR-003–005, FR-013; arquivar OK

---

## Phase 5: User Story 3 — Identificação de Caixa (Priority: P1)

**Goal**: Admin define/altera Caixa corrente ou investimento; lista exibe valor ou “não definido”; visualizador só lê

**Independent Test**: Editar Caixa corrente → investimento → não definido; persistir após reload; visualizador não altera (quickstart V3, V7)

### Implementation for User Story 3

- [x] T019 [US3] Em `backend/app/api/routes/nfs.py` (PUT), aceitar e persistir `caixa` (`corrente` \| `investimento` \| null); rejeitar valor inválido com 422
- [x] T020 [US3] Em `frontend/src/pages/NFs.tsx`, adicionar coluna **Caixa** na tabela (Corrente / Investimento / não definido)
- [x] T021 [US3] Em `frontend/src/pages/NFs.tsx`, no modal de edição (admin), adicionar select de Caixa (vazio = null, corrente, investimento) e incluir `caixa` no payload de `nfsService.atualizar`
- [x] T022 [US3] Garantir que visualizador vê a coluna Caixa mas não o controle de edição (padrão `papel === 'admin'` da página)

**Checkpoint**: Caixa persistido e visível (SC-003)

---

## Phase 6: User Story 4 — Campos editáveis allowlist (Priority: P2)

**Goal**: Só Caixa, pagamento, colaboradores e arquivar são editáveis; campos Maggo readonly na UI; PUT rejeita campos fora da allowlist

**Independent Test**: Modal com Maggo readonly; salvar pagamento/colaboradores; PUT com `numero`/`valor_bruto` → 422 (quickstart V4, V8)

### Implementation for User Story 4

- [x] T023 [US4] Em `backend/app/api/routes/nfs.py` e/ou `backend/app/schemas.py`, restringir PUT à allowlist: `caixa`, `data_pagamento`, `colaborador_lead_id`, `colaborador_conducao_id`, `colaborador_placement_id`, `arquivada` — ignorar ou rejeitar (422) demais campos Maggo
- [x] T024 [US4] Em `frontend/src/pages/NFs.tsx`, tornar readonly/disabled no modal: número, razão social, posição, candidato, valores, emissão, vencimento, tipo (e cancelada se ainda existir no form); manter editáveis: data pagamento, colaboradores, caixa
- [x] T025 [US4] Em `frontend/src/pages/NFs.tsx`, remover checkbox/fluxo de “cancelada” na criação (já sem criar) e garantir que título do modal seja “Editar…” (não “Nova NF”); fluxo **Pagar** rápido permanece se já existir
- [x] T026 [US4] Confirmar que `nfsService.atualizar` / tipagem em `frontend/src/services/api.ts` enviam apenas campos permitidos no payload de edição

**Checkpoint**: FR-008 / SC-004 — enriquecimento só; Maggo protegido

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade, validação end-to-end e higiene

- [x] T027 Executar cenários V1–V8 de `specs/007-contas-receber/quickstart.md` (API 8001, frontend 5193)
- [x] T028 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/` e corrigir regressões desta feature
- [x] T029 Revisar que Dashboard/Calendário/Bônus que leem `/api/nfs` não quebram após merge do stub (smoke manual rápido)
- [x] T030 Remover dead code/imports em `frontend/src/pages/NFs.tsx` e confirmar ausência de strings CTA “Nova NF” / “Deletar Todas” / pasta na página

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as user stories
- **US1 (Phase 3)**: Após Foundational — MVP
- **US2 (Phase 4)**: Após Foundational; ideal após US1 (mesma página), mas testável sozinha (ações ausentes + 403)
- **US3 (Phase 5)**: Após Foundational (`caixa` no model); precisa de listagem/edição (US1) para validar UI
- **US4 (Phase 6)**: Após US3 (modal já com Caixa) ou em paralelo no backend allowlist vs UI readonly
- **Polish (Phase 7)**: Após stories desejadas

### User Story Dependencies

| Story | Depende de | Notas |
|-------|------------|-------|
| US1 | Phase 2 | Stub + merge + labels |
| US2 | Phase 2 (UI independente; API 403) | Melhor após US1 na mesma página |
| US3 | Phase 2 + listagem/modal | Coluna + select Caixa |
| US4 | Modal de edição | Allowlist API + readonly Maggo |

### Parallel Opportunities

- T002 ∥ T003 (inspeção front/back)
- T006 ∥ T007 (schemas TS / Python) após T004/T005 iniciados
- T011 ∥ T012 (labels Layout / Configurações)
- T015 (API 403) ∥ início de T016 (remoção UI) em arquivos diferentes
- T028 ∥ T029 no polish

---

## Parallel Example: User Story 1

```bash
# Após T009 (merge na API):
Task: "T011 Layout label Contas a Receber"
Task: "T012 Configuracoes label Contas a Receber"
# Depois:
Task: "T013 NFs.tsx títulos + tratamento de erro do stub"
```

## Parallel Example: User Story 2

```bash
Task: "T015 403 nos endpoints de create/import/delete em nfs.py"
Task: "T016 Remover botões/fluxos na UI NFs.tsx"  # após ou em paralelo cuidadoso
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup  
2. Phase 2 Foundational (`caixa` + stub)  
3. Phase 3 US1 (listagem Maggo stub + rótulos)  
4. **STOP e VALIDAR** quickstart V1 (+ V5 se possível)  
5. Demo: Contas a Receber lista do stub

### Incremental Delivery

1. Setup + Foundational → base pronta  
2. US1 → lista stub + labels (MVP)  
3. US2 → remoção de ações perigosas + 403  
4. US3 → Caixa  
5. US4 → allowlist / readonly  
6. Polish → quickstart completo + lint/type-check

### Parallel Team Strategy

- Dev A: stub + merge listagem (US1 backend)  
- Dev B: labels + tratamento de erro UI (US1 frontend)  
- Após US1: Dev A API 403 + allowlist; Dev B remoções UI + Caixa + readonly  

---

## Notes

- [P] = arquivos diferentes, sem depender de tarefa incompleta no mesmo arquivo  
- Manter `permKey: 'nfs'` e prefixo `/api/nfs` nesta entrega  
- Maggo real fora de escopo — só `maggo_stub.py`  
- Não reintroduzir criar/importar/excluir/pasta  
- Validar com [quickstart.md](./quickstart.md) antes de considerar a feature pronta  
- Próximo comando sugerido: `/speckit-implement`
