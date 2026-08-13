# Tasks: Correção do cálculo de férias

**Input**: Design documents from `/specs/023-ferias-calculo/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas agrupadas por história de usuário (P1 → P2).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US4 conforme spec.md
- Caminhos de arquivo explícitos

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Criar os módulos onde as regras de domínio vão viver (sem lógica ainda além de esqueleto tipado)

- [x] T001 Criar esqueleto exportando tipos/funções vazias em `frontend/src/utils/feriasCalculo.ts`
- [x] T002 [P] Criar esqueleto do serviço de regras em `backend/app/services/ferias_calculo.py`
- [x] T003 [P] Adicionar interface `ResumoFeriasAno` em `frontend/src/types/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fórmulas canônicas de direito/saldo (max e soma) usadas por todas as histórias

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T004 Implementar `direitoAnual`, `totalTirado`, `saldoAnual` e `agruparResumos` (grupo `colaborador_id`+`ano`; direito = max; tirados = soma de pendentes e aprovados) em `frontend/src/utils/feriasCalculo.ts`
- [x] T005 [P] Implementar as mesmas funções (`direito_anual`, `total_tirado`, `saldo_anual`, `destino_transferencia`) em `backend/app/services/ferias_calculo.py` conforme [data-model.md](./data-model.md)

**Checkpoint**: Fórmulas disponíveis em TS e Python; UI ainda não ligada

---

## Phase 3: User Story 1 - Saldo anual correto na lista (Priority: P1) 🎯 MVP

**Goal**: Resumo por colaborador/ano (direito, total tirado, saldo) e linhas só com a parcela; banner de pendência sem exigir saldo > 0

**Independent Test**: Direito 30 + parcelas 10 e 8 → resumo 30 / 18 / 12; linhas mostram 10 e 8 sem colunas Direito/Saldo; período pendente de 30 dias → saldo 0 e banner visível

### Implementation for User Story 1

- [x] T006 [US1] Substituir `resumoPorAno`/`saldoColab` (soma de `dias_direito`) por `agruparResumos` em `frontend/src/pages/Ferias.tsx`
- [x] T007 [US1] Renderizar bloco de resumo (nome, direito, tirados, saldo com cores) em `frontend/src/pages/Ferias.tsx` conforme `contracts/ui-ferias-calculo.md`
- [x] T008 [US1] Remover colunas Direito e Saldo da tabela de parcelas em `frontend/src/pages/Ferias.tsx`
- [x] T009 [US1] Ajustar `feriasComAviso` para um item por colaborador/ano com qualquer `aprovado === false` (sem `saldo > 0`) e atualizar o texto do banner em `frontend/src/pages/Ferias.tsx`
- [x] T010 [US1] Exportar CSV só com colunas de parcela (sem Direito/Saldo por linha) na função `exportar` em `frontend/src/pages/Ferias.tsx`

**Checkpoint**: Lista e resumo conferem SC-001/SC-004/SC-005; sino do menu permanece como está (`useNotificacoes.ts`)

---

## Phase 4: User Story 2 - Dias tirados coerentes com as datas (Priority: P1)

**Goal**: Dias corridos inclusivos; intervalo invertido não sugere dias positivos e não salva (UI + API 422)

**Independent Test**: 01/03–10/03 → 10 dias; mesmo dia → 1; fim &lt; início → aviso e Salvar desabilitado; PUT invertido → 422

### Implementation for User Story 2

- [x] T011 [US2] Implementar `parseDateLocal`, `diasCorridos` e `intervaloInvertido` em `frontend/src/utils/feriasCalculo.ts`
- [x] T012 [P] [US2] Implementar `datas_validas` / equivalência em `backend/app/services/ferias_calculo.py` e validator Pydantic (POST/PUT: ambas as datas ⇒ `data_fim >= data_inicio`, senão 422 em pt-BR) em `backend/app/schemas.py`
- [x] T013 [US2] Usar `diasCorridos` no modal; desabilitar Salvar quando `intervaloInvertido`; não preencher `dias_tirados` positivo nesse caso em `frontend/src/pages/Ferias.tsx`
- [x] T014 [US2] Garantir que create/update em `backend/app/api/routes/ferias.py` passam pelo schema validado (merge no PUT: datas finais após update não invertidas)

**Checkpoint**: US1 continua válida; datas cobrem SC-002

---

## Phase 5: User Story 3 - Fracionamento sem duplicar o direito (Priority: P2)

**Goal**: Primeiro período sugere 30 e disponível = 30; seguintes não somam direito; avisos de excesso e sobreposição sem bloquear save (exceto invertido)

**Independent Test**: Primeiro 30/14, segundo 10 → disponível 16 no segundo cadastro; datas cruzadas avisam e salvam; visualizador só lê

### Implementation for User Story 3

- [x] T015 [US3] Implementar `saldoDisponivelForm` (criação vs outros do grupo) em `frontend/src/utils/feriasCalculo.ts` conforme tabela do [data-model.md](./data-model.md)
- [x] T016 [US3] Implementar `intervalosSobrepoem` em `frontend/src/utils/feriasCalculo.ts` (e espelho opcional em `backend/app/services/ferias_calculo.py` — API **não** retorna 4xx por overlap)
- [x] T017 [US3] Ligar modal: primeiro do ano direito 30 editável; fracionamento direito 0 desabilitado; faixa de disponível; aviso de excesso (Salvar ok); aviso de sobreposição (Salvar ok) em `frontend/src/pages/Ferias.tsx`

**Checkpoint**: Fracionamento não infla direito; FR-004/005/010/014

---

## Phase 6: User Story 4 - Editar ou excluir período sem distorcer o saldo (Priority: P2)

**Goal**: Edição usa direito anual (incluindo o do registro-base); DELETE transfere o direito se o max sairia do grupo

**Independent Test**: Editar parcela dos 30 com outra de 10 → disponível 20; excluir a dos 30 → restante fica com `dias_direito` 30 e saldo 22; excluir a última some o grupo

### Implementation for User Story 4

- [x] T018 [US4] Incluir `dias_direito` opcional em `FeriasUpdate` em `backend/app/schemas.py`
- [x] T019 [US4] No `DELETE` de `backend/app/api/routes/ferias.py`, chamar `destino_transferencia` e persistir o direito na parcela de menor `id` restante na mesma transação antes de excluir
- [x] T020 [US4] Usar `saldoDisponivelForm` na edição (max dos outros e do form; tirados dos outros) em `frontend/src/pages/Ferias.tsx`

**Checkpoint**: FR-006 e FR-013; PUT persiste alteração de direito

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e conferência ponta a ponta

- [x] T021 Conferir impressão/PDF da tabela (cabeçalho sem Direito/Saldo enganosos) em `frontend/src/pages/Ferias.tsx`
- [x] T022 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T023 Executar o checklist de [quickstart.md](./quickstart.md) (resumo, datas, overlap, DELETE com transferência, visualizador)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup — **bloqueia** as histórias
- **US1 (Phase 3)**: após Phase 2 — MVP
- **US2 (Phase 4)**: após Phase 2; convive com US1 (mesmo `Ferias.tsx` — sequencial se um executor)
- **US3 (Phase 5)**: após T015 (util); melhor depois de US2 (modal já valida datas)
- **US4 (Phase 6)**: T018/T019 independentes do modal; T020 depois de T015
- **Polish**: depois das histórias desejadas

### User Story Dependencies

- **US1 (P1)**: só Phase 2 — MVP
- **US2 (P1)**: Phase 2; toca modal e schema
- **US3 (P2)**: aproveita modal da US2 e resumo da US1
- **US4 (P2)**: DELETE/schema independentes; fórmula do modal depende de T015 (US3)

### Parallel Opportunities

- T001 ∥ T002 ∥ T003
- T004 ∥ T005
- T011 ∥ T012
- T018 pode começar em paralelo com US3 se outro executor pegar só backend
- T022 ∥ preparação do quickstart

### Parallel Example: Setup + Foundational

```text
T001 frontend/src/utils/feriasCalculo.ts
T002 backend/app/services/ferias_calculo.py
T003 frontend/src/types/index.ts
# depois
T004 feriasCalculo.ts (fórmulas)
T005 ferias_calculo.py (fórmulas)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + 2
2. Phase 3 (US1)
3. **STOP**: conferir resumo 30/18/12 e tabela sem Direito/Saldo
4. Seguir US2 → US3 → US4

### Incremental Delivery

1. Setup + Foundational
2. US1 → demo do saldo correto
3. US2 → datas confiáveis
4. US3 → fracionamento
5. US4 → exclusão sem perder os 30 dias
6. Polish / quickstart

---

## Notes

- Não alterar `frontend/src/hooks/useNotificacoes.ts` nesta feature (research.md)
- Não criar `GET /ferias/resumo` nem migration
- Não validar mínimo 5 dias / parcela ≥ 14
- Import CSV: sem redesenho; resumo pós-import usa max/soma automaticamente (US1)
