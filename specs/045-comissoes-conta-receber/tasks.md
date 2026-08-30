# Tasks: Comissões vinculadas à Conta a receber

**Input**: Design documents from `/specs/045-comissoes-conta-receber/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/rest-comissoes-conta-receber.md](./contracts/rest-comissoes-conta-receber.md), [contracts/ui-comissoes-conta-receber.md](./contracts/ui-comissoes-conta-receber.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (US1 cadastro na conta → US2 listagem/status → US3 lote). Sem `[P]` quando o mesmo arquivo seria editado em paralelo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte, dependência da feature 044 e arquivos-alvo

- [x] T001 Confirmar portas 8001/5193/5433, branch `045-comissoes-conta-receber` e arquivos-alvo listados em [plan.md](./plan.md); confirmar que feature **044-comissoes-pagina** (rota `/comissoes`, nomenclatura) já está aplicada

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Migração, modelo, schemas e serviço de sync — bloqueia todas as histórias

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Adicionar migração inline em `backend/app/main.py`: colunas `nf_id`, `atividades`, `liberado`, `pago`, `data_liberacao`, `data_pagamento`, índice `ix_bonus_nf_id` e backfill `atividades` a partir de `etapa` conforme [data-model.md](./data-model.md)
- [x] T003 Estender modelo `Bonus` em `backend/app/models/__init__.py` com FK `nf_id`, campos de atividade/estado/datas e relationship opcional com `NF`
- [x] T004 [P] Criar schemas `ComissaoLinhaInput`, estender `BonusResponse`, `BonusCreate`/`BonusUpdate` e adicionar `comissoes: Optional[List[ComissaoLinhaInput]]` em `NFCreate`/`NFUpdate` em `backend/app/schemas.py` conforme [contracts/rest-comissoes-conta-receber.md](./contracts/rest-comissoes-conta-receber.md)
- [x] T005 Implementar `backend/app/services/comissoes_sync.py`: validar fornecedor ativo e atividades; calcular `valor_bonus = (percentual/100)*valor_liquido`; criar/atualizar/remover só linhas não liberadas; preservar liberadas omitidas; registrar auditoria

**Checkpoint**: Banco e serviço de sync prontos; endpoints e UI podem consumir o contrato

---

## Phase 3: User Story 1 - Cadastrar comissões ao lançar a Conta a receber (Priority: P1) 🎯 MVP

**Goal**: Bloco de comissões no modal de Conta a receber (criar/editar); valor calculado automaticamente; sync na mesma transação da NF

**Independent Test**: Criar conta com valor líquido conhecido e duas linhas de comissão; gravar; ver ambas em `/comissoes` com valores corretos; editar conta e incluir terceira linha não liberada

### Implementation for User Story 1

- [x] T006 [US1] Integrar `comissoes_sync.sincronizar` em `POST /api/nfs` e `PUT /api/nfs/{id}` em `backend/app/api/routes/nfs.py` (payload opcional `comissoes[]`, mesma transação)
- [x] T007 [P] [US1] Adicionar query `nf_id` em `GET /api/bonus` e serializar `atividades` como array JSON em `backend/app/api/routes/bonus.py`
- [x] T008 [P] [US1] Estender tipos `Bonus` e criar `ComissaoLinhaForm` em `frontend/src/types/index.ts`
- [x] T009 [P] [US1] Criar helper de preview `(percentual/100)*valorLiquido` em `frontend/src/utils/comissoesCalculo.ts`
- [x] T010 [P] [US1] Estender `nfsService.criar/atualizar` com `comissoes` e `bonusService.listar` com `nf_id` em `frontend/src/services/api.ts`
- [x] T011 [US1] Criar `frontend/src/components/ComissoesLinhasForm.tsx`: Fornecedor (ativos), Mês/Ano (default corrente), Atividade (checkboxes Lead/Venda/Condução/Placement), Percentual, Valor read-only, add/remove linha, linhas liberadas disabled
- [x] T012 [US1] Integrar bloco Comissões no modal criar/editar em `frontend/src/pages/NFs.tsx`: state de linhas, preview ao mudar líquido/percentual, validação antes de salvar, envio `comissoes` no payload, carregar linhas existentes via `bonusService.listar(..., nf_id)`

**Checkpoint**: SC-001, SC-002; FR-001 a FR-006, FR-016

---

## Phase 4: User Story 2 - Página Comissões: editar pela conta, liberar e ver Liberado/Pago (Priority: P1)

**Goal**: Remover Deletar e edição isolada; Editar abre conta; Liberar/Pagar individual; colunas Liberado (soma por fornecedor) e Pago (por linha)

**Independent Test**: Liberar linha → Liberado atualiza; Pagar só após Liberar; Editar navega para `/nfs?edit=`; sem botão Deletar; visualizador somente leitura

### Implementation for User Story 2

- [x] T013 [P] [US2] Implementar `POST /api/bonus/{id}/liberar` e `POST /api/bonus/{id}/pagar` com validação de estado e `data_*` automática em `backend/app/api/routes/bonus.py`
- [x] T014 [US2] Filtrar comissões cujo `nf_id` aponta para NF com `excluida_em` preenchido e enriquecer resposta com dados da NF (`cliente`, `posicao`, `numero_nf`) em `GET /api/bonus` em `backend/app/api/routes/bonus.py`
- [x] T015 [US2] Remover botão **Deletar**, modal de edição isolada e `bonusService.deletar` do fluxo UI em `frontend/src/pages/Bonus.tsx`
- [x] T016 [US2] Atualizar listagem em `frontend/src/pages/Bonus.tsx`: coluna **Atividade** (badges múltiplos, sem “Etapa”); coluna **Liberado** (soma por grupo fornecedor no recorte); coluna **Pago** (Pago/Pendente); filtro renomeado para **Fornecedor** listando todos ativos (`colaboradoresService.listar` sem `elegivel_equipe`)
- [x] T017 [US2] Adicionar ações **Liberar** / **Pagar** (confirm + toast + reload) e **Editar** → `navigate('/nfs?edit=' + nf_id)` ou toast se sem vínculo em `frontend/src/pages/Bonus.tsx`; respeitar papel `visualizador`
- [x] T018 [US2] Implementar deep-link `?edit={nfId}` em `frontend/src/pages/NFs.tsx`: abrir modal edição ao montar, carregar comissões, limpar query ao fechar

**Checkpoint**: SC-003, SC-004, SC-006; FR-007 a FR-012c, FR-014, FR-015

---

## Phase 5: User Story 3 - Seleção e ações em massa (Priority: P2)

**Goal**: Checkboxes por linha e por grupo; Liberar em massa e Pagar em massa com confirmação e feedback de contagem

**Independent Test**: Selecionar 3 linhas não liberadas → Liberar em massa; selecionar mix → Pagar em massa aplica só elegíveis; visualizador sem seleção

### Implementation for User Story 3

- [x] T019 [P] [US3] Implementar `POST /api/bonus/acoes/liberar` e `POST /api/bonus/acoes/pagar` retornando `{ processados, ignorados }` em `backend/app/api/routes/bonus.py`
- [x] T020 [P] [US3] Adicionar `bonusService.liberarLote` e `bonusService.pagarLote` em `frontend/src/services/api.ts`
- [x] T021 [US3] Adicionar checkboxes (linha + grupo), barra **Liberar em massa** / **Pagar em massa**, confirmação e toast com contagem em `frontend/src/pages/Bonus.tsx`; ocultar para visualizador

**Checkpoint**: SC-005; FR-013 a FR-013d

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e validação ponta a ponta

- [x] T022 [P] Executar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T023 Validar cenários de [quickstart.md](./quickstart.md) (cadastro na conta, Liberado/Pago, lote, sem Deletar, NF excluída, visualizador)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende de Phase 1 — **BLOQUEIA** US1, US2, US3
- **US1 (Phase 3)**: Depende de Phase 2
- **US2 (Phase 4)**: Depende de Phase 2; integração natural com US1 (linhas com `nf_id`)
- **US3 (Phase 5)**: Depende de US2 (ações Liberar/Pagar individuais já existem)
- **Polish (Phase 6)**: Depende das fases desejadas concluídas

### User Story Dependencies

```text
Phase 2 (Foundational)
        │
        ▼
   US1 (cadastro na conta) ──► US2 (listagem/status) ──► US3 (lote)
```

- **US1**: Independente após Foundational; entrega MVP (cadastro + listagem básica se T007/T012 ok)
- **US2**: Requer linhas com `nf_id` de US1 para testar Editar; Liberar/Pagar funcionam também em legado sem `nf_id`
- **US3**: Requer UI de Liberar/Pagar de US2

### Parallel Opportunities

| Grupo | Tarefas paralelas |
|-------|-------------------|
| Foundational | T004 ∥ T002→T003→T005 (T004 após T003 parcial ok) |
| US1 backend/frontend | T007 ∥ T008 ∥ T009 ∥ T010 (após T005); T011 após T008–T010 |
| US2 | T013 ∥ T015 (arquivos diferentes); T016–T017 sequenciais em `Bonus.tsx` |
| US3 | T019 ∥ T020 |
| Polish | T022 ∥ preparação T023 |

### Parallel Example: User Story 1

```bash
# Após T005 (comissoes_sync):
# Backend list by nf_id:
T007 — backend/app/api/routes/bonus.py

# Frontend tipos/util/api em paralelo:
T008 — frontend/src/types/index.ts
T009 — frontend/src/utils/comissoesCalculo.ts
T010 — frontend/src/services/api.ts

# Depois, sequencial:
T006 → T011 → T012
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 + Phase 2 (Foundational)
2. Phase 3 (US1) — cadastro na Conta a receber
3. **Validar**: quickstart §1–§2
4. Demo: comissões nascem junto com a conta

### Incremental Delivery

1. Foundational → US1 → demo MVP
2. US2 → operação Liberar/Pagar e colunas → demo
3. US3 → fechamento mensal em lote → demo
4. Polish → release

### Suggested MVP Scope

**US1 apenas** (T001–T012): atende o fluxo principal “comissão nasce na conta a receber” (SC-001, SC-002).

---

## Notes

- Prefixo REST `/api/bonus` e permKey `bonus` **não** renomear ([research.md](./research.md) R2)
- Import CSV em Comissões: **fora de escopo** — manter comportamento legado
- `DELETE /api/bonus/{id}` permanece no backend; UI remove Deletar (FR-008)
- Linhas **liberadas** são imutáveis no sync; valor congelado na liberação
- Recorte mês/trimestre (feature 044) continua no cliente; Liberado soma no recorte filtrado

---

## Task Summary

| Métrica | Valor |
|---------|-------|
| **Total de tarefas** | 23 |
| **Setup** | 1 |
| **Foundational** | 4 |
| **US1** | 7 |
| **US2** | 6 |
| **US3** | 3 |
| **Polish** | 2 |
| **Com [P]** | 11 |
