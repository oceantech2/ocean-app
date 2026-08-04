# Tasks: Ocean App — Baseline do Produto

**Input**: Design documents from `/specs/001-ocean-app-baseline/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Nature**: Inventário **as-is**. Tarefas = verificar código existente vs especificação, registrar lacunas e fechar a documentação — **não** reimplementar o produto.

**Tests**: Não solicitados no spec (sem fase TDD).

**Organization**: Por user story (US1–US9) do `spec.md`.

**Verificação iniciada**: 2026-07-26T11:19:17-03:00  
**Branch/contexto**: working tree (git dir ausente ou não inicializado neste ambiente)  
**Concluída**: 2026-07-26 — todas as tarefas marcadas após auditoria as-is

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Paralelo (arquivos diferentes, sem dependência)
- **[Story]**: US1…US9
- Paths relativos à raiz do repo

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`
- Specs: `specs/001-ocean-app-baseline/`

---

## Phase 1: Setup (ambiente e docs base)

**Purpose**: Confirmar que o inventário Speckit e o ambiente local estão alinhados

- [x] T001 Confirmar artefatos presentes em `specs/001-ocean-app-baseline/` (spec.md, plan.md, research.md, data-model.md, quickstart.md, contracts/rest-api.md) e `.specify/feature.json`
- [x] T002 [P] Conferir portas e URLs em `docker-compose.yml`, `backend/app/config.py`, `frontend/vite.config.ts` e `CLAUDE.md` (8001 / 5433 / 6380 / 5193)
- [x] T003 [P] Registrar no topo de `specs/001-ocean-app-baseline/tasks.md` a data de início da verificação e o commit/branch atual

---

## Phase 2: Foundational (mapa código ↔ docs)

**Purpose**: Cruzar modelo, contratos e estrutura antes das histórias

**⚠️ CRITICAL**: Concluir antes das fases US

- [x] T004 Comparar entidades de `specs/001-ocean-app-baseline/data-model.md` com classes em `backend/app/models/__init__.py` e anotar divergências em `specs/001-ocean-app-baseline/research.md` (seção lacunas)
- [x] T005 [P] Conferir prefixes de `specs/001-ocean-app-baseline/contracts/rest-api.md` com `include_router` em `backend/app/main.py` e arquivos em `backend/app/api/routes/`
- [x] T006 [P] Conferir rotas SPA de `contracts/rest-api.md` com `frontend/src/App.tsx` e páginas em `frontend/src/pages/`
- [x] T007 [P] Conferir exports de serviços em `frontend/src/services/api.ts` vs prefixes do contrato
- [x] T008 Validar stack declarada em `specs/001-ocean-app-baseline/plan.md` contra `backend/requirements.txt` e `frontend/package.json`

**Checkpoint**: Mapa código↔docs consistente o bastante para auditar por história

---

## Phase 3: User Story 1 — Autenticar e acessar (P1) 🎯 MVP

**Goal**: Documentar/validar login, papéis, menus e 2FA admin (própria conta)

**Independent Test**: Login admin e visualizador; menus por permissão; 2FA só via Segurança admin

- [x] T009 [P] [US1] Auditar `POST /token`, `/me` e fluxo 2FA em `backend/app/api/routes/auth.py` vs FR-001/002 e clarificação 2FA do `spec.md`
- [x] T010 [P] [US1] Auditar `UsuarioApp` / `UsuarioAuth` em `backend/app/models/__init__.py` e seeds em `backend/app/main.py` (ou init relacionado)
- [x] T011 [US1] Auditar `frontend/src/components/Login.tsx`, `frontend/src/store/index.ts` (`useAuthStore`) e interceptor JWT em `frontend/src/services/api.ts`
- [x] T012 [US1] Auditar filtro de menus/papéis em `frontend/src/components/Layout.tsx` e gate de `/seguranca` em `frontend/src/App.tsx` / `frontend/src/pages/Seguranca.tsx`
- [x] T013 [US1] Registrar resultado US1 (ok / lacunas) em `specs/001-ocean-app-baseline/research.md`

**Checkpoint**: US1 verificável de ponta a ponta conforme spec

---

## Phase 4: User Story 2 — NFs / faturamento (P1)

**Goal**: Validar CRUD, status, arquivo, filtros, import/export de NFs

**Independent Test**: Criar/marcar paga/filtrar/arquivar/exportar NF

- [x] T014 [P] [US2] Auditar modelo `NF` e enums em `backend/app/models/__init__.py` vs `data-model.md`
- [x] T015 [P] [US2] Auditar CRUD/resumo/import-export/delete-all em `backend/app/api/routes/nfs.py` vs FR-006–010 e `contracts/rest-api.md`
- [x] T016 [US2] Auditar `frontend/src/pages/NFs.tsx` e `nfsService` em `frontend/src/services/api.ts` (filtros, status, arquivadas, papel visualizador)
- [x] T017 [US2] Registrar resultado US2 em `specs/001-ocean-app-baseline/research.md`

**Checkpoint**: US2 alinhada ao baseline ou lacunas explícitas

---

## Phase 5: User Story 3 — Contas a pagar (P1)

**Goal**: Validar centros de custo, pagamento, comprovantes e atrasos

**Independent Test**: CRUD conta, marcar paga, comprovante, alerta de atraso

- [x] T018 [P] [US3] Auditar `ContaPagar` / `CentroCusto` em `backend/app/models/__init__.py` e rotas em `backend/app/api/routes/contas.py`
- [x] T019 [US3] Auditar `frontend/src/pages/Contas.tsx` e comprovantes (`comprovantesService` / upload na conta) em `frontend/src/services/api.ts`
- [x] T020 [US3] Verificar origem de “conta atrasada” em alertas (`backend/app/api/routes/alertas.py` e badge em `frontend/src/components/Layout.tsx`)
- [x] T021 [US3] Registrar resultado US3 em `specs/001-ocean-app-baseline/research.md`

**Checkpoint**: US3 verificada

---

## Phase 6: User Story 4 — Dashboard e metas (P1)

**Goal**: Validar cockpit e metas financeiras

**Independent Test**: Dashboard do ano + editar meta mensal/anual (admin)

- [x] T022 [P] [US4] Auditar `backend/app/api/routes/metas.py` e modelo `MetaFinanceira` em `backend/app/models/__init__.py`
- [x] T023 [US4] Auditar `frontend/src/pages/Dashboard.tsx` e `metasService` em `frontend/src/services/api.ts` vs FR-028/029
- [x] T024 [US4] Registrar resultado US4 em `specs/001-ocean-app-baseline/research.md`

**Checkpoint**: US4 verificada

---

## Phase 7: User Story 5 — Fluxo de caixa (P2)

**Goal**: Validar saldos, movimentos auto e manuais

**Independent Test**: Registrar saldo + movimento manual; ver entradas/saídas do período

- [x] T025 [P] [US5] Auditar `backend/app/api/routes/saldos.py` e `backend/app/api/routes/fluxo_movimentos.py` + modelos `Saldo`/`FluxoMovimento`
- [x] T026 [US5] Auditar `frontend/src/pages/FluxoCaixa.tsx` (entradas de NFs/contas pagas vs manuais) e serviços em `frontend/src/services/api.ts`
- [x] T027 [US5] Registrar resultado US5 em `specs/001-ocean-app-baseline/research.md`

**Checkpoint**: US5 verificada

---

## Phase 8: User Story 6 — Bônus por etapa (P2)

**Goal**: Validar bônus lead/condução/placement e cálculo por NF

**Independent Test**: Criar bônus com % e número NF; filtrar por colaborador/ano

- [x] T028 [P] [US6] Auditar `backend/app/api/routes/bonus.py` e modelo `Bonus` em `backend/app/models/__init__.py`
- [x] T029 [US6] Auditar `frontend/src/pages/Bonus.tsx` e `bonusService` (cálculo % × líquido) em `frontend/src/services/api.ts` / página
- [x] T030 [US6] Registrar resultado US6 em `specs/001-ocean-app-baseline/research.md`

**Checkpoint**: US6 verificada

---

## Phase 9: User Story 7 — Colaboradores, férias, patrimônio (P2)

**Goal**: Validar RH leve, docs, férias e ativos

**Independent Test**: Cadastro, soft-desligar, documento, férias com aprovação, patrimônio

- [x] T031 [P] [US7] Auditar `backend/app/api/routes/colaboradores.py`, `historico.py`, `documentos.py` e modelos relacionados
- [x] T032 [P] [US7] Auditar `backend/app/api/routes/ferias.py` e `backend/app/api/routes/patrimonio.py`
- [x] T033 [US7] Auditar `frontend/src/pages/Colaboradores.tsx`, `Ferias.tsx`, `Patrimonio.tsx` e `frontend/src/components/DocumentosModal.tsx`
- [x] T034 [US7] Confirmar lacuna de permissão `patrimonio` em `frontend/src/pages/Configuracoes.tsx` vs `Layout.tsx` e anotar em `research.md`
- [x] T035 [US7] Registrar resultado US7 em `specs/001-ocean-app-baseline/research.md`

**Checkpoint**: US7 verificada

---

## Phase 10: User Story 8 — DH, calendário, impostos, retiradas, relatórios (P3)

**Goal**: Validar módulos analíticos/operacionais secundários

**Independent Test**: DH marcar enviado; calendário do mês; impostos/retiradas; um relatório exportável

- [x] T036 [P] [US8] Auditar `backend/app/api/routes/dh.py` (sem e-mail real) e `frontend/src/pages/DH.tsx`
- [x] T037 [P] [US8] Auditar `frontend/src/pages/Calendario.tsx` (agregação NF/conta)
- [x] T038 [P] [US8] Auditar `backend/app/api/routes/impostos.py` + `frontend/src/pages/Impostos.tsx` e `frontend/src/pages/Retiradas.tsx`
- [x] T039 [US8] Auditar `backend/app/api/routes/relatorios.py` vs UI `frontend/src/pages/Relatorios.tsx` (propostas/contratos só API)
- [x] T040 [US8] Registrar resultado US8 e endpoints órfãos em `specs/001-ocean-app-baseline/research.md`

**Checkpoint**: US8 verificada

---

## Phase 11: User Story 9 — Governança (P3)

**Goal**: Validar usuários, auditoria e segurança

**Independent Test**: CRUD usuário visualizador; ver audit log; 2FA admin

- [x] T041 [P] [US9] Auditar `backend/app/api/routes/configuracoes.py` e `frontend/src/pages/Configuracoes.tsx` (menus FR-004)
- [x] T042 [P] [US9] Auditar `backend/app/api/routes/auditoria.py`, `backend/app/services/audit.py` e `frontend/src/pages/Auditoria.tsx`
- [x] T043 [US9] Confirmar restrição admin de Auditoria/Segurança/Configurações em `frontend/src/components/Layout.tsx`
- [x] T044 [US9] Registrar resultado US9 em `specs/001-ocean-app-baseline/research.md`

**Checkpoint**: US9 verificada

---

## Phase 12: Polish (fechamento do inventário)

**Purpose**: Consolidar lacunas e declarar baseline pronto para specs futuras

- [x] T045 [P] Atualizar seção “Lacunas conhecidas” em `specs/001-ocean-app-baseline/research.md` com achados das US1–US9
- [x] T046 [P] Ajustar `specs/001-ocean-app-baseline/contracts/rest-api.md` se algum endpoint/rota divergir do código
- [x] T047 [P] Ajustar `specs/001-ocean-app-baseline/data-model.md` se campos/enums divergirem de `backend/app/models/__init__.py`
- [x] T048 Executar cenários de `specs/001-ocean-app-baseline/quickstart.md` (docker + login + smoke) e anotar PASS/FAIL no próprio `quickstart.md`
- [x] T049 Atualizar `specs/001-ocean-app-baseline/checklists/requirements.md` notes com “verificação as-is concluída” e data
- [x] T050 Marcar Status do `specs/001-ocean-app-baseline/spec.md` como documentado/baseline pronto (ex.: Status: Baseline) se a verificação estiver completa

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup** → sem dependências
- **Phase 2 Foundational** → após Phase 1; **bloqueia** US
- **Phases 3–11 (US1–US9)** → após Phase 2; podem rodar em paralelo por história
- **Phase 12 Polish** → após histórias desejadas (idealmente todas)

### User Story Dependencies

| Story | Depende de | Notas |
|-------|------------|--------|
| US1 Auth | Phase 2 | MVP de verificação |
| US2 NFs | Phase 2 | Independente de outras US |
| US3 Contas | Phase 2 | Independente |
| US4 Dashboard | Phase 2 | Conceitualmente usa dados NF/contas; verificação de código é independente |
| US5 Fluxo | Phase 2 | Idem |
| US6 Bônus | Phase 2 | Idem |
| US7 Colab/Férias/Patrimônio | Phase 2 | Idem |
| US8 DH/Cal/Imp/Ret/Rel | Phase 2 | Idem |
| US9 Governança | Phase 2 | Idem |

### Parallel Opportunities

- T002–T003; T005–T007; pares [P] dentro de cada US
- Após Phase 2: US2–US9 em paralelo por pessoa/agente
- T045–T047 em paralelo no polish

### Parallel Example: User Story 2

```text
T014 Auditar modelo NF em backend/app/models/__init__.py
T015 Auditar rotas em backend/app/api/routes/nfs.py
# depois sequencial:
T016 Auditar frontend/src/pages/NFs.tsx
T017 Registrar em research.md
```

---

## Implementation Strategy

### MVP First (só inventário mínimo)

1. Phase 1 + Phase 2  
2. Phase 3 (US1 Auth)  
3. **STOP** — baseline mínimo “como entra no sistema” documentado  
4. Seguir US2–US4 (P1 financeiro) se quiser o núcleo de negócio

### Incremental

1. Setup + Foundational  
2. US1 → validar  
3. US2–US4 (P1) → validar  
4. US5–US7 (P2) → validar  
5. US8–US9 (P3) → validar  
6. Polish → baseline fechado para próximas features Speckit

### Parallel Team

- Após Phase 2: um agente/dev por user story (T014+, etc.)  
- Um owner consolida `research.md` no polish (T045+)

---

## Notes

- Não reescrever features existentes; só verificar e documentar deltas  
- Lacunas viram entrada para futuros `/speckit-specify`, não implementação nesta lista  
- Formato checklist obrigatório: `- [ ] Txxx ... path`
