# Tasks: Contas a Receber — Campos Maggo editáveis no Ocean

**Input**: Design documents from `/specs/051-contas-receber-maggo-editavel/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/rest-maggo-editavel.md](./contracts/rest-maggo-editavel.md), [contracts/ui-maggo-editavel.md](./contracts/ui-maggo-editavel.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (P1 US1 → US2, depois P2 US3). Sem `[P]` quando o mesmo arquivo seria editado em paralelo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 edição Maggo; US2 merge sem sobrescrita; US3 Ocean + regressões
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte e arquivos-alvo; sem dependências novas; sem migração de schema

- [x] T001 Confirmar feature `051-contas-receber-maggo-editavel`, portas 8001/5193/5433 e arquivos-alvo em [plan.md](./plan.md) (`backend/app/api/routes/nfs.py`, `backend/app/services/comissoes_sync.py`, `backend/app/schemas.py`, `frontend/src/pages/NFs.tsx`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Regras compartilhadas de PUT fiscal e sync Maggo — bloqueiam as histórias

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Em `backend/app/api/routes/nfs.py` (`atualizar_nf`): ao aplicar body, **ignorar** `valor_imposto` e `valor_liquido` do cliente; se `valor_bruto` e/ou `aliquota_imposto` vierem (ou após qualquer update desses campos), chamar `_aplicar_recalculo_fiscal`; continuar ignorando `origem` e `maggo_id` conforme [contracts/rest-maggo-editavel.md](./contracts/rest-maggo-editavel.md) e [data-model.md](./data-model.md)
- [x] T003 Em `backend/app/api/routes/nfs.py` (`_sync_maggo_stub`): garantir `continue` quando `maggo_id` já existe (visível **ou** excluída) — sem atualizar campos Maggo nem ressuscitar (base da US2)

**Checkpoint**: PUT deriva imposto/líquido no servidor; merge não sobrescreve existente

---

## Phase 3: User Story 1 - Corrigir no Ocean os dados que vieram da Maggo (Priority: P1) 🎯 MVP

**Goal**: Admin edita grupo Maggo (projeto, empresa, candidato, tipo, bruto, alíquota, data fechamento); imposto/líquido calculados RO; origem Maggo; sem escrever na Maggo; comissões existentes não recalculam; caixa não mexe

**Independent Test**: Quickstart V1 + V3 + V4 + V5 — editar Maggo, persistir, RO visualizador, caixa e comissões intactos

### Implementation for User Story 1

- [x] T004 [P] [US1] Em `backend/app/services/comissoes_sync.py`: remover/ajustar o loop final que recalcula todas as não liberadas só porque o líquido da NF mudou; ao atualizar linha existente com mesmo percentual/atividades, **preservar** `valor_bonus`; recalcular só em linha nova ou quando percentual/atividades mudarem — [research.md](./research.md) R-005 / FR-012
- [x] T005 [P] [US1] Em `backend/app/schemas.py`: alinhar `NFUpdate` ao contrato (alíquota editável; imposto/líquido não autoritativos no write — documentar/validar sem exigir digitação livre) conforme [contracts/rest-maggo-editavel.md](./contracts/rest-maggo-editavel.md)
- [x] T006 [US1] Em `frontend/src/pages/NFs.tsx`: `maggoEditavel = papel === 'admin'` também para origem Maggo; campos projeto, tipo, empresa, candidato, bruto, alíquota e data de fechamento editáveis; imposto e líquido `readOnly`/`disabled` com `aplicarCalculoFiscal` (ou equivalente vigente); texto de ajuda: correção só no Ocean, Maggo não atualizada — [contracts/ui-maggo-editavel.md](./contracts/ui-maggo-editavel.md)
- [x] T007 [US1] Confirmar em `backend/app/api/routes/nfs.py` (`atualizar_nf`) que mudança de bruto/alíquota **não** cria nem altera movimentos de Fluxo de Caixa (sem novos hooks em `fluxo_movimentos`); origem permanece Maggo após PUT

**Checkpoint**: SC-001, SC-002, SC-004, SC-005, SC-007, SC-008; FR-001, FR-002, FR-005, FR-006, FR-009, FR-010, FR-011, FR-012

---

## Phase 4: User Story 2 - Reenvio da Maggo não desfaz a correção local (Priority: P1)

**Goal**: Reenvio do mesmo `maggo_id` não sobrescreve campos Maggo; só cria fechamentos novos

**Independent Test**: Quickstart V2 — editar, sync/recarregar, valores Ocean permanecem; fechamento novo entra

### Implementation for User Story 2

- [x] T008 [US2] Validar e, se necessário, reforçar comentário/guarda em `_sync_maggo_stub` em `backend/app/api/routes/nfs.py` para o quadro do contrato (inédito → cria; existente visível → no-op Maggo; excluída → não recria; colisão manual vigente) conforme [contracts/rest-maggo-editavel.md](./contracts/rest-maggo-editavel.md)
- [x] T009 [US2] Smoke manual: após T006/T007, alterar stub/valores Maggo do mesmo `maggo_id` (ou recarregar listagem) e confirmar que campos Maggo no Ocean **não** revertem; origem continua Maggo

**Checkpoint**: SC-003; FR-003, FR-004

---

## Phase 5: User Story 3 - Campos Ocean continuam editáveis como hoje (Priority: P2)

**Goal**: Sem regressão nos campos Ocean (NF, emissão, vencimento, pagamento, Caixa) nem status derivado; manual continua editável

**Independent Test**: Quickstart V6 — editar Maggo + Ocean na mesma conta; status coerente; conta manual ok

### Implementation for User Story 3

- [x] T010 [US3] Em `frontend/src/pages/NFs.tsx`: garantir bloco Ocean (NF, emissão, vencimento, pagamento, Conta/caixa) permanece editável para admin em origem Maggo conforme regras vigentes; visualizador RO total — [contracts/ui-maggo-editavel.md](./contracts/ui-maggo-editavel.md)
- [x] T011 [US3] Smoke: editar conta **manual** (grupo Maggo + um campo Ocean) e conta Maggo (vencimento/NF + um campo Maggo); status derivado de vencimento/pagamento inalterado em regra; FR-007 / FR-008

**Checkpoint**: US3; FR-007, FR-008

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e validação ponta a ponta

- [x] T012 Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T013 Executar cenários V1–V6 de [quickstart.md](./quickstart.md) (Maggo editável, merge, Recebida/caixa, comissões, visualizador, manual/Ocean)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as histórias
- **US1 (Phase 3)**: Depende da Phase 2 — MVP
- **US2 (Phase 4)**: Depende da Phase 2; T009 após edição Maggo (T006/T007)
- **US3 (Phase 5)**: Depende da Phase 2; T010 no mesmo `NFs.tsx` após T006
- **Polish (Phase 6)**: Depois das histórias desejadas

### User Story Dependencies

- **US1 (P1)**: Independente após Phase 2 — MVP
- **US2 (P1)**: Independente na regra de merge (T003/T008); validação ponta a ponta após US1
- **US3 (P2)**: Regressão UI após T006

### Parallel Opportunities

- T004 e T005 em paralelo (arquivos diferentes) após Phase 2
- T006 depende de contrato UI; pode seguir em paralelo a T004/T005 até o smoke
- T008 pode rodar em paralelo a T004/T005 (mesmo `nfs.py` que T002/T003 — sequenciar se conflitar)

### Parallel Example: User Story 1

```bash
# Após Phase 2:
Task: "Ajustar comissoes_sync.py — preservar valor_bonus (T004)"
Task: "Alinhar NFUpdate em schemas.py (T005)"
# Depois:
Task: "UI Maggo editável em NFs.tsx (T006)"
Task: "Confirmar PUT sem tocar caixa (T007)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2
2. Phase 3 (US1) — edição Maggo + fiscal RO + comissões/caixa
3. **STOP**: validar V1, V3, V4, V5
4. Demo se pronto

### Incremental Delivery

1. Setup + Foundational
2. US1 → edição Maggo no Ocean (MVP)
3. US2 → merge não reverte
4. US3 → regressão Ocean/manual
5. Polish / quickstart completo

---

## Notes

- `[P]` = arquivos diferentes, sem dependência incompleta
- Sem migração de schema; sem escrita Maggo; sem badge “editado localmente”
- Gap crítico herdado: loop de recálculo em `comissoes_sync.py` (T004)
- Validar no browser (Contas a Receber, Fluxo de Caixa, Comissões)
- T012: `NFs.tsx` sem erros de type-check; falhas pré-existentes em `Dashboard.tsx`/`DH.tsx` e ESLint sem config no frontend — fora do escopo 051
- T009/T011/T013: validação por revisão de código + contratos (API local indisponível no momento da implement); recomenda-se rodar [quickstart.md](./quickstart.md) com stack no ar
