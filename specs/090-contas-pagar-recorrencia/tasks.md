# Tasks: Recorrência de contas a pagar nos próximos meses

**Input**: Design documents from `/specs/090-contas-pagar-recorrencia/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — validação via [quickstart.md](./quickstart.md).

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [x] T001 Confirmar escopo em [plan.md](./plan.md): campo opcional no endpoint existente, sem migration

## Phase 2: Foundational (backend)

- [x] T002 Em `backend/app/schemas.py`, adicionar `repetir_meses: Optional[int] = Field(None, ge=1, le=24)` em `ContaPagarCreate`
- [x] T003 Em `backend/app/api/routes/contas.py`, criar `_somar_meses(data, k)` (dia preservado ou último dia do mês)
- [x] T004 Em `backend/app/api/routes/contas.py` (`criar_conta`), retirar `repetir_meses` dos dados, exigir vencimento quando presente (422) e criar as N cópias pendentes na mesma transação, com auditoria por conta

## Phase 3: User Story 1 - Cadastrar conta recorrente (P1) 🎯 MVP

- [x] T005 [P] [US1] Criar `frontend/src/utils/recorrencia.ts` com `somarMesesISO` e `resumoRecorrencia(vencimento, n)`
- [x] T006 [P] [US1] Em `frontend/src/services/api.ts`, adicionar `repetir_meses?: number | null` em `ContaPagarCreatePayload`
- [x] T007 [US1] Em `frontend/src/pages/Contas.tsx`, adicionar estado `repetir`/`repetirMeses`, controles no modal (só criação, só `admin`) e o resumo dos vencimentos
- [x] T008 [US1] Em `frontend/src/pages/Contas.tsx` (`salvar`), validar 1–24, enviar `repetir_meses`, toast "Conta criada + N recorrência(s)" e reset da opção ao abrir/"+1"

## Phase 4: User Story 2 - Edição/exclusão isolada (P2)

- [x] T009 [US2] Confirmar que edição/exclusão seguem por conta (sem alteração) e que a opção não aparece em Editar

## Phase 5: Polish

- [x] T010 `npm run type-check` e `npm run build` em `frontend/`; `python -m py_compile` nos arquivos do backend
- [x] T011 Validar os cenários de [quickstart.md](./quickstart.md)

## Dependencies & Execution Order

- T002 → T003 → T004 (backend)
- T005, T006 em paralelo → T007 → T008
- T004 + T008 → T009 → T010 → T011
