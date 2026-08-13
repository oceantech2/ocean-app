# Tasks: Dashboard — Filtro de Ano Independente e Donut Anual

**Input**: Design documents from `/specs/015-dashboard-filtro-ano/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados no spec — validação manual via [quickstart.md](./quickstart.md) + `npm run lint` / `npm run type-check`

**Organization**: Tasks agrupadas por user story para entrega incremental e teste independente

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: User story (US1, US2, US3)
- Incluir caminhos de arquivo exatos nas descrições

## Path Conventions

- Frontend: `frontend/src/`
- Backend (somente inspeção): `backend/app/api/routes/relatorios.py`
- Contratos: `specs/015-dashboard-filtro-ano/contracts/`
- Modelo: `specs/015-dashboard-filtro-ano/data-model.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline e que o endpoint de custo já cobre os dois recortes — sem migration nem rota nova

- [x] T001 Revisar `specs/015-dashboard-filtro-ano/plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/rest-custo-por-categoria.md` e `contracts/ui-dashboard-filtro-ano.md` e confirmar escopo (mês `null` = “Todos os meses”; donut anual ignora mês; largura total sem mês; remover Próximas Ações; não usar `mes=0`)
- [x] T002 [P] Inspecionar filtro, `carregarDados`, donut único, slot vazio e bloco Próximas Ações em `frontend/src/pages/Dashboard.tsx`
- [x] T003 [P] Confirmar `relatoriosService.custoPorCategoria(ano, mesAte, mesDe?)` em `frontend/src/services/api.ts` e `GET /custo-por-categoria` (`mes_de`/`mes_ate`) em `backend/app/api/routes/relatorios.py` — **sem** alterar assinatura/rota nesta feature

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Estado de período com mês opcional e carga que não chama APIs mensais quando `mes === null` — bloqueia US1 e US2

**⚠️ CRITICAL**: Nenhuma story de UI vazia/donut duplo até o estado `mes: number | null` e o `carregarDados` respeitarem [data-model.md](./data-model.md)

- [x] T004 Em `frontend/src/pages/Dashboard.tsx`, trocar `mes` para `number | null` (abertura = mês civil corrente, **não** `null`); no select de mês, primeira opção **Todos os meses** (`value=""` → `null`); `alterarAno` mantém `null` ou faz clamp se o mês concreto for inválido, conforme [contracts/ui-dashboard-filtro-ano.md](./contracts/ui-dashboard-filtro-ano.md)
- [x] T005 Em `frontend/src/pages/Dashboard.tsx` (`carregarDados` / `useEffect`): se `mes === null`, **não** chamar `metasService.progresso(mes)` nem `resumoFinanceiro(ano, mes)`; saldos = mais recente do ano; séries anuais (DRE, faturamento, meta anual `progresso(0, ano)`) sempre pelo `ano`; nunca tratar `null` como `0`

**Checkpoint**: Select aceita “Todos os meses”; ano continua carregando blocos anuais; sem request de meta mensal com `mes=0`

---

## Phase 3: User Story 1 — Analisar o ano sem ser obrigado a escolher um mês (Priority: P1) 🎯 MVP

**Goal**: Visão só do ano utilizável: blocos anuais atualizam ao trocar o ano; meta mensal e KPIs de resumo ficam visíveis com orientação para selecionar um mês; saldos = mais recente do ano

**Independent Test**: Abrir Dashboard; escolher “Todos os meses” e outro ano; DRE/meta anual/faturamento mudam; meta mensal e KPIs pedem um mês; saldos mostram o registro mais recente do ano (quickstart itens 1, 5, 7)

### Implementation for User Story 1

- [x] T006 [US1] Em `frontend/src/pages/Dashboard.tsx`, card de **meta mensal**: se `mes === null`, manter o card no layout com título genérico (sem inventar mês) e texto “Selecione um mês para ver este indicador”; ocultar editar/criar meta mensal; se `mes` concreto, comportamento atual (título `{mês}/{ano}`)
- [x] T007 [US1] Em `frontend/src/pages/Dashboard.tsx`, cards de KPI (faturamento bruto/líquido / NFs pendentes): se `mes === null`, estado vazio/orientação “Selecione um mês…” sem totais anuais silenciosos; se `mes` concreto, `resumoFinanceiro(ano, mes)` como hoje
- [x] T008 [US1] Em `frontend/src/pages/Dashboard.tsx`, confirmar meta anual, DRE e faturamento líquido por mês reagem só ao `ano` com `mes === null`; rótulos anuais usam o ano selecionado (sem exigir mês)

**Checkpoint**: MVP — filtro de ano funciona sem mês concreto (FR-001 a FR-006, FR-016)

---

## Phase 4: User Story 2 — Ver o donut de custo do ano ao lado do donut do mês (Priority: P1)

**Goal**: Dois donuts (mês | ano) com mês selecionado; só o do ano em largura total sem mês; donut anual ignora o mês do filtro

**Independent Test**: Com mês: dois donuts lado a lado (desktop); trocar só o mês não altera o donut do ano; “Todos os meses” → um donut em largura total; voltar o mês → dois de novo (quickstart itens 2–6, 10)

### Implementation for User Story 2

- [x] T009 [US2] Em `frontend/src/pages/Dashboard.tsx`, extrair helper/componente local `DonutCustoBloco` (título, erro, vazio, `PieChart`/miolo/legenda/tooltip) para reutilizar nos dois recortes, conforme [research.md](./research.md)
- [x] T010 [US2] Em `frontend/src/pages/Dashboard.tsx` (`carregarDados`): estados separados mês vs ano; chamar `relatoriosService.custoPorCategoria(ano, mesAteAno, 1)` para o ano (`mesAteAno` = `MES_ATUAL` no ano corrente, `12` em ano anterior; ano futuro sem request); se `mes !== null`, também `custoPorCategoria(ano, mes, mes)`; erros independentes; **não** alterar `frontend/src/services/api.ts`
- [x] T011 [US2] Em `frontend/src/pages/Dashboard.tsx`, layout abaixo do DRE: com mês, grid `md:grid-cols-2` (mês à esquerda, ano à direita; empilhados no mobile); sem mês, **não** renderizar o donut do mês e o do ano em largura total; remover o slot vazio `hidden md:block`
- [x] T012 [US2] Em `frontend/src/pages/Dashboard.tsx`, títulos `Custo por categoria — {mês}/{ano}` vs `Custo por categoria — {ano}`; mensagens vazias por período; falha de um donut não zera o outro (FR-010, FR-015)

**Checkpoint**: FR-007 a FR-012 / SC-002 / SC-003 — dois recortes visuais e independentes

---

## Phase 5: User Story 3 — Dashboard sem o bloco Próximas Ações (Priority: P2)

**Goal**: Remover o último bloco “Próximas Ações”; a tela termina no faturamento líquido por mês

**Independent Test**: Rolar até o fim da Dashboard (admin e visualizador) e confirmar ausência do título e dos itens (quickstart item 8)

### Implementation for User Story 3

- [x] T013 [US3] Em `frontend/src/pages/Dashboard.tsx`, remover o bloco JSX **Próximas Ações** (título e lista); não criar substituto; manter `resumo.quantidade_pendentes` apenas nos KPIs quando houver mês

**Checkpoint**: FR-013 / SC-004 — bloco ausente para ambos os papéis

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação E2E alinhada ao quickstart e qualidade do frontend

- [x] T014 Executar o checklist de [quickstart.md](./quickstart.md) (smoke das duas URLs de custo + UI itens 1–10, admin e visualizador)
- [x] T015 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T016 Revisar em `frontend/src/pages/Dashboard.tsx`: rótulo “Todos os meses”; `mes` nunca `0`; donut anual independente do mês; visualizador filtra mas não edita meta; nenhuma outra página alterada

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** US1 e US2
- **US1 (Phase 3)**: Depende da Foundational — MVP
- **US2 (Phase 4)**: Depende da Foundational (idealmente após US1 para testar largura total na visão sem mês)
- **US3 (Phase 5)**: Pode seguir a Foundational; mesmo arquivo `Dashboard.tsx` — executar **em série** com US1/US2 para evitar conflito
- **Polish (Phase 6)**: Depende das stories desejadas

### User Story Dependencies

- **User Story 1 (P1)**: Após Phase 2 — filtro de ano sem mês
- **User Story 2 (P1)**: Após Phase 2 — donuts; usa `mes === null` da US1 para o layout em largura total
- **User Story 3 (P2)**: Independente em comportamento; acoplada só pelo mesmo arquivo

### Within Each User Story

- Foundational (estado + carga) antes da UI vazia/donuts
- Helper de donut (T009) antes do layout (T011)
- Duas chamadas de custo (T010) antes dos títulos/estados (T012)
- Sem tarefas de teste automatizado (não pedidas)

### Parallel Opportunities

- T002 e T003 (inspeção de arquivos diferentes)
- T015 em paralelo com revisão T016 após o código estável
- **Não** paralelizar T004–T013: todas editam `frontend/src/pages/Dashboard.tsx`

---

## Parallel Example: Phase 1

```bash
# Inspeção em paralelo (arquivos diferentes):
Task: "Inspecionar Dashboard.tsx (T002)"
Task: "Confirmar api.ts + relatorios.py sem mudança de contrato (T003)"
```

US1–US3: executar em sequência no mesmo arquivo.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational (estado `mes | null` + carga)
3. Phase 3: US1 (estados vazios mensais + ano independente)
4. **STOP and VALIDATE**: “Todos os meses” + troca de ano (quickstart 1, 5, 7)
5. Demo se pronto

### Incremental Delivery

1. Setup + Foundational → período opcional
2. US1 → ano sem mês (MVP)
3. US2 → dois donuts / largura total
4. US3 → remover Próximas Ações
5. Polish → quickstart + lint/type-check

### Parallel Team Strategy

Um desenvolvedor: ordem T001 → … → T016. Dois desenvolvedores não ganham paralelismo nas stories (mesmo arquivo); no máximo T002∥T003 no setup.

---

## Notes

- [P] só quando arquivos diferentes; quase toda a feature é `Dashboard.tsx`
- Não alterar `frontend/src/services/api.ts` nem o backend salvo descoberta de bug de contrato
- `mes=0` é meta anual — nunca usar como “Todos os meses”
- Validar no checkpoint da US2 que trocar só o mês não muda o donut do ano
- Próximo comando: `/speckit-implement`
