# Tasks: Contas a Receber — Conta, Alíquota e cards líquidos

**Input**: Design documents from `/specs/045-receber-conta-aliquota/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/rest-receber-conta-aliquota.md](./contracts/rest-receber-conta-aliquota.md), [contracts/ui-receber-conta-aliquota.md](./contracts/ui-receber-conta-aliquota.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (US1 → US2 → US3, todas P1). Sem `[P]` quando o mesmo arquivo seria editado em paralelo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte e dependências existentes (036, 037)

- [x] T001 Confirmar que Contas a Receber = `frontend/src/pages/NFs.tsx` (rota `/nfs`); coluna Conta corrente e select no recebido já existem (036); tooltip alíquota mensal na tabela Imposto permanece (037); portas 8001/5193/5433 inalteradas

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Coluna `aliquota_imposto`, helpers de cálculo e slot 1 — bloqueia US1 (slot 1) e US2 (alíquota)

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Em `backend/app/main.py` (`_migrar`): `ALTER TABLE nfs ADD COLUMN IF NOT EXISTS aliquota_imposto FLOAT NULL` conforme [data-model.md](./data-model.md)
- [x] T003 Campo `aliquota_imposto` em `NF` em `backend/app/models/__init__.py`
- [x] T004 Criar `calcular_imposto_liquido(bruto, aliquota_pct)` em `backend/app/services/nf_valores.py` (imposto = round(bruto × pct/100, 2); líquido = bruto − imposto; validar pct ∈ [0,100])
- [x] T005 Função `codigo_slot1(db)` em `backend/app/services/caixas.py` (primeira corrente ativa na ordem `padrao DESC, nome ASC`; fallback `codigo_padrao`)
- [x] T006 [P] `aliquota_imposto` em `NFCreate`, `NFUpdate`, `NFResponse` em `backend/app/schemas.py` conforme [contracts/rest-receber-conta-aliquota.md](./contracts/rest-receber-conta-aliquota.md)
- [x] T007 [P] Campo `aliquota_imposto?: number | null` em `NF` em `frontend/src/types/index.ts`
- [x] T008 [P] Criar `frontend/src/utils/nfValores.ts` com `calcularImpostoLiquido(bruto, aliquotaPct)` e `codigoSlot1(contas)` espelhando backend/research R1 e R7

**Checkpoint**: Modelo e tipos prontos; rotas e UI ainda sem comportamento novo

---

## Phase 3: User Story 1 - Escolher a Conta já na criação (Priority: P1) 🎯 MVP

**Goal**: Campo **Conta** sempre visível no criar/editar; default slot 1; `caixa` gravado também em Pendente; modal Recebido usa conta já gravada

**Independent Test**: Criar conta Pendente na segunda corrente; reabrir e ver mesma Conta; criar Recebida usa Conta escolhida no fluxo de caixa

### Implementation for User Story 1

- [x] T009 [US1] Em `backend/app/api/routes/nfs.py`: `POST` pendente persiste `caixa` (`exigir_conta_corrente` ou slot1/padrão); `PUT` pendente atualiza `caixa` sem zerar ao remover pagamento conforme [data-model.md](./data-model.md) e [contracts/rest-receber-conta-aliquota.md](./contracts/rest-receber-conta-aliquota.md)
- [x] T010 [US1] Em `frontend/src/pages/NFs.tsx`: campo **Conta** visível sempre (Pendente e Recebida) no criar/editar; default `codigoSlot1(contasCorrentes)` na criação; enviar `caixa` no POST/PUT mesmo pendente conforme [contracts/ui-receber-conta-aliquota.md](./contracts/ui-receber-conta-aliquota.md)
- [x] T011 [US1] Em `frontend/src/pages/NFs.tsx`: modal **Marcar como recebido** pré-seleciona `nf.caixa` quando já gravado no registro pendente

**Checkpoint**: SC-001, SC-002; FR-001 a FR-004; US1 testável sem alíquota/cards

---

## Phase 4: User Story 2 - Informar Alíquota e ver Impostos e Líquido calculados (Priority: P1)

**Goal**: Alíquota na criação/edição; Impostos e Líquido somente conferência; backend recalcula no POST/PUT; sem recálculo em massa

**Independent Test**: Bruto 10.000 + 6% → Impostos 600, Líquido 9.400; campos não editáveis; editar alíquota recalcula; legado sem edição permanece

### Implementation for User Story 2

- [x] T012 [US2] Em `backend/app/api/routes/nfs.py`: ao `POST`/`PUT`, recalcular e sobrescrever `valor_imposto`/`valor_liquido` via `nf_valores.py` quando `valor_bruto` e/ou `aliquota_imposto` presentes; recusar alíquota &lt; 0 ou &gt; 100 (400)
- [x] T013 [US2] Em `frontend/src/pages/NFs.tsx`: campo **Alíquota (imposto)** no criar/editar; Impostos e Valor líquido `readOnly`/`disabled` (`INPUT_RO`); recalcular em tempo real ao mudar bruto/alíquota via `nfValores.ts`
- [x] T014 [US2] Em `frontend/src/pages/NFs.tsx`: `FORM_INICIAL`, `abrirEditar`, `salvar` e payload `nfsService.criar`/`atualizar` incluem `aliquota_imposto`; validar 0–100 antes de salvar; remover `onChange` editável de imposto/líquido

**Checkpoint**: SC-003, SC-007; FR-005 a FR-010; US2 testável com US1 já entregue

---

## Phase 5: User Story 3 - Ler Líquido Pendente e Líquido Vencido nos cards (Priority: P1)

**Goal**: Cards renomeados; valores somam **líquido** (não bruto)

**Independent Test**: Com pendente/vencida bruto ≠ líquido, cards batem com soma manual dos líquidos; Bruto/Líquido Recebido inalterados

### Implementation for User Story 3

- [x] T015 [US3] Em `frontend/src/pages/NFs.tsx`: rótulos **Líquido Pendente** / **Líquido Vencido**; valores de `resumo.total_liquido_pendente` e `resumo.total_liquido_vencido` (substituir `total_bruto_pendente`/`total_bruto_vencido`) conforme [contracts/ui-receber-conta-aliquota.md](./contracts/ui-receber-conta-aliquota.md)

**Checkpoint**: SC-004, SC-005; FR-011 a FR-014; US3 independente do formulário (só leitura de resumo)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Consistência, qualidade e validação ponta a ponta

- [x] T016 Confirmar que tooltip alíquota **mensal** na coluna Imposto da tabela em `frontend/src/pages/NFs.tsx` (feature 037) permanece inalterado e distinto da alíquota por linha do formulário
- [x] T017 [P] Executar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T018 Executar cenários de [quickstart.md](./quickstart.md) (Conta pendente, cálculo 6%, cards líquidos, visualizador)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende de Setup — **bloqueia** US1/US2/US3
- **US1 (Phase 3)**: Depende de Foundational (T005, T008 para slot 1)
- **US2 (Phase 4)**: Depende de Foundational (T004, T006, T008); integra com US1 no mesmo `NFs.tsx`/`nfs.py`
- **US3 (Phase 5)**: Depende de Foundational apenas; **pode rodar em paralelo** com US1/US2 após Phase 2 (só `NFs.tsx` cards)
- **Polish (Phase 6)**: Depende das histórias desejadas concluídas

### User Story Dependencies

- **US1**: Independente de US2/US3 após Foundational
- **US2**: Independente de US3; compartilha `NFs.tsx` com US1 (sequencial no mesmo arquivo recomendado)
- **US3**: Independente de US1/US2 (apenas seção de cards)

### Within Each User Story

- Backend (`nfs.py`) antes ou junto com frontend da mesma história
- US2: T012 (API) antes de T013–T014 (UI confia no recálculo do servidor)

### Parallel Opportunities

- **Phase 2**: T006 ∥ T007 ∥ T008 (após T002–T005)
- **Phase 5**: US3 (T015) ∥ US1/US2 se desenvolvedores diferentes e merges coordenados em `NFs.tsx`
- **Phase 6**: T017 ∥ revisão manual T016

---

## Parallel Example: Foundational

```bash
# Após T002–T005 no backend:
Task T006: schemas.py — aliquota_imposto
Task T007: types/index.ts — NF.aliquota_imposto
Task T008: utils/nfValores.ts — cálculo e codigoSlot1
```

---

## Parallel Example: User Story 3 vs US1

```bash
# Após Phase 2, enquanto US1 edita formulário Conta:
Developer A: T009–T011 (caixa pendente)
Developer B: T015 (cards líquidos — bloco separado em NFs.tsx)
# Integrar antes de US2 se ambos tocaram NFs.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2
2. Phase 3 (US1 — Conta na criação pendente)
3. **Validar** quickstart cenários 1 e 4 parcialmente
4. Demo: destino de caixa definido no cadastro

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → Conta na criação ✓
3. US2 → Alíquota e cálculo automático ✓
4. US3 → Cards líquidos ✓ (pode ser entregue cedo por ser isolado)
5. Polish → quickstart completo

### Suggested MVP Scope

**User Story 1** (Phase 3) após Foundational — entrega valor imediato (Conta no cadastro pendente) sem depender de alíquota.

---

## Notes

- Não recalcular histórico em massa; legado `aliquota_imposto NULL` até edição explícita
- Investimento fora do select Conta (FR-004)
- Backend é autoridade fiscal: cliente pode enviar imposto/líquido, servidor sobrescreve (research R3)
- Total: **18 tarefas** (T001–T018)
