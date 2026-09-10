# Tasks: Alerta de Fluxo de Caixa no Dashboard

**Input**: Design documents from `/specs/061-dashboard-alerta-fluxo/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Setup → Foundation (limiar + próximo + util) → US1–US3 (P1) → US4 (P2) → Polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US4 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/schemas.py`, `backend/app/services/limiar_alerta_fluxo.py`, `backend/app/api/routes/configuracoes.py`, `backend/app/api/routes/relatorios.py`
- Frontend: `frontend/src/pages/Dashboard.tsx`, `frontend/src/services/api.ts`, `frontend/src/utils/alertaFluxoCaixa.ts`
- Contratos: `specs/061-dashboard-alerta-fluxo/contracts/`
- **Não alterar**: regras de Pipeline / Aging além do **consumo**; Configuração do Período (meta + alíquota); página Configurações (usuários); dismiss do banner; drill-down; notificações

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte da feature 061

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e [research.md](./research.md): Dashboard; limiar global inteiro 1–100 em `configuracao_app`; próximo ≥ hoje; % via Pipeline; Aging em atenção = `d60_90`; comparação precisão completa; falha parcial → “indisponível”; portas 5193/8001; sem migration DDL; sem Seção além do banner

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schemas, limiar (serviço + rotas), próximo-recebimento, client e util — bloqueia US1–US4

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 [P] Em `backend/app/schemas.py`, criar `LimiarAlertaFluxoResponse` / `LimiarAlertaFluxoPut` com `limiar_percentual` **inteiro** `1..100` (rejeitar float/decimal) alinhados a [contracts/rest-limiar-alerta-fluxo.md](./contracts/rest-limiar-alerta-fluxo.md)
- [x] T003 [P] Em `backend/app/schemas.py`, criar `ProximoRecebimentoResponse` (`referencia`, `encontrado`, `data_vencimento`, `valor_liquido`, `valor_bruto`, `nf_id`) alinhado a [contracts/rest-proximo-recebimento.md](./contracts/rest-proximo-recebimento.md)
- [x] T004 Em `backend/app/services/limiar_alerta_fluxo.py`, implementar `ler_limiar` / `salvar_limiar` com chave `limiar_alerta_fluxo`, default **60**, validação **inteiro** 1–100, upsert em `ConfiguracaoApp` — [data-model.md](./data-model.md), FR-008, FR-008c, FR-009
- [x] T005 Em `backend/app/api/routes/configuracoes.py`, expor `GET` limiar (admin + visualizador) e `PUT` limiar (**só** `require_admin`) — [contracts/rest-limiar-alerta-fluxo.md](./contracts/rest-limiar-alerta-fluxo.md)
- [x] T006 Em `backend/app/api/routes/relatorios.py`, implementar `GET /proximo-recebimento`: universo aberto + `data_vencimento >= date.today()`; empate estável → maior `valor_liquido`, depois maior `valor_bruto`, depois menor `id`; sem elegíveis → `encontrado: false`; **sem** filtro `ano`/`mes` — FR-004, FR-004a, FR-013, [contracts/rest-proximo-recebimento.md](./contracts/rest-proximo-recebimento.md), [data-model.md](./data-model.md)
- [x] T007 [P] Em `frontend/src/services/api.ts`, adicionar `configuracoesService.obterLimiarAlertaFluxo` / `salvarLimiarAlertaFluxo` e `relatoriosService.proximoRecebimento` tipados conforme os contratos REST
- [x] T008 [P] Em `frontend/src/utils/alertaFluxoCaixa.ts`, criar `calcularPctNaoRecebida` (fechado≤0 → null; recebido>fechado → 0), `deveExibirBanner` (`pct > limiar` com **precisão completa**), `normalizeProximoRecebimento`, `fmtPctAlerta` (só exibição), `rotuloSemProximo` / `rotuloIndisponivel`, `valorProximoPorVisao` — FR-001b, FR-002, FR-003, FR-003a, [research.md](./research.md)

**Checkpoint**: Smoke GET/PUT limiar (422 em decimal) + GET próximo-recebimento; util pronto; foundation liberada

---

## Phase 3: User Story 1 - Ver o banner quando % supera o limiar (Priority: P1) 🎯 MVP

**Goal**: Banner âmbar no topo quando `% calculado > limiar`; some quando `% ≤ limiar` ou % indisponível; sem dismiss

**Independent Test**: Quickstart §3 — período com % acima/abaixo do limiar; sem botão fechar; SC-001 / SC-009 / SC-014

### Implementation for User Story 1

- [x] T009 [US1] Em `frontend/src/pages/Dashboard.tsx`, no `carregarDados`, obter limiar (fallback default 60) e Pipeline já existente; calcular `%` via `calcularPctNaoRecebida` + `valorPorVisao`/`metricasCompetencia` na base ativa — FR-002, FR-007, FR-015
- [x] T010 [US1] Em `frontend/src/pages/Dashboard.tsx`, renderizar banner âmbar no **topo** somente se `deveExibirBanner(pct, limiar)`; **sem** controle de dismiss — FR-001, FR-001a, [contracts/ui-dashboard-alerta-fluxo.md](./contracts/ui-dashboard-alerta-fluxo.md)
- [x] T011 [US1] Em `frontend/src/pages/Dashboard.tsx`, ao trocar mês/ano (incl. só-ano), recalcular % do período; banner some/aparece conforme `% > limiar` — FR-001, SC-001; edge só-ano

**Checkpoint**: SC-001 / SC-009 / SC-012 / MVP do gatilho do banner

---

## Phase 4: User Story 2 - Três dados do alerta (Priority: P1)

**Goal**: No banner: % não recebida, próximo recebimento (≥ hoje ou sem previsão), Aging em atenção (`d60_90`); falha parcial → “indisponível”

**Independent Test**: Quickstart §6–§7 — data/valor do próximo; Aging ≈ card Aging; falha Aging ≠ R$ 0

### Implementation for User Story 2

- [x] T012 [US2] Em `frontend/src/pages/Dashboard.tsx`, no `carregarDados`, chamar `proximoRecebimento` e Aging (já existente) com catches isolados (`proximoErro` / `agingErro`) — FR-014, FR-015
- [x] T013 [US2] Em `frontend/src/pages/Dashboard.tsx`, no banner: exibir `%` formatado (`fmtPctAlerta`); próximo = data + valor **ou** “sem próximo / sem previsão” **ou** “indisponível”; Aging em atenção = `valorAging(d60_90)` **ou** “indisponível” (nunca zero falso em falha) — FR-004, FR-004a, FR-005, FR-014, [contracts/ui-dashboard-alerta-fluxo.md](./contracts/ui-dashboard-alerta-fluxo.md)
- [x] T014 [US2] Em `frontend/src/pages/Dashboard.tsx` (e/ou util), garantir empate de próximo refletido pela API (`nf_id` / valores dual-base) e mesma leitura `admin`/`visualizador` — FR-010, FR-013, SC-003, SC-004, SC-007

**Checkpoint**: SC-002–SC-004 / SC-011

---

## Phase 5: User Story 3 - Toggle Bruto/Líquido (Priority: P1)

**Goal**: Alternar toggle recalcula % e valores do banner na base ativa; pode ligar/desligar o banner; universo elegível inalterado

**Independent Test**: Quickstart §4 — Bruto ↔ Líquido; banner pode cruzar limiar; composição igual

### Implementation for User Story 3

- [x] T015 [US3] Em `frontend/src/pages/Dashboard.tsx`, aplicar `visaoReceita` a % (fechado/recebido), valor do próximo e Aging em atenção **sem** refetch ao alternar toggle — FR-006, FR-007, SC-005
- [x] T016 [US3] Em `frontend/src/pages/Dashboard.tsx`, garantir que `deveExibirBanner` usa o % **calculado** na base ativa (não o texto arredondado) após o toggle — FR-001b, SC-014

**Checkpoint**: SC-005 / SC-014

---

## Phase 6: User Story 4 - Configurar limiar (Priority: P2)

**Goal**: `admin` edita limiar **inteiro** 1–100 no Dashboard (sempre disponível); `visualizador` só lê; fora da Configuração do Período

**Independent Test**: Quickstart §5 — limiar 40 com % 50 → banner; decimal rejeitado; visualizador sem controle

### Implementation for User Story 4

- [x] T017 [US4] Em `frontend/src/pages/Dashboard.tsx`, controle de limiar **sempre visível** para `admin` (banner on/off); `visualizador` não vê o controle — FR-008, FR-008a, FR-008b, [contracts/ui-dashboard-alerta-fluxo.md](./contracts/ui-dashboard-alerta-fluxo.md)
- [x] T018 [US4] Em `frontend/src/pages/Dashboard.tsx`, validar save: só **inteiro** 1–100 (`Number.isInteger` após parse); rejeitar decimal/vazio com toast; chamar `salvarLimiarAlertaFluxo`; atualizar estado local e reaplica banner — FR-008c, SC-006, SC-013
- [x] T019 [US4] Confirmar em `frontend/src/pages/Dashboard.tsx` (UI Configuração do Período) que **não** há campo limiar misturado com meta/alíquota — FR-008a, Out of Scope

**Checkpoint**: SC-006 / SC-013 / US4 completa

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade, alinhamento contrato e validação E2E

- [x] T020 [P] Alinhar `backend/app/schemas.py` + `limiar_alerta_fluxo.py` se ainda aceitarem `float`: forçar inteiro (422 em `60.5`) conforme [contracts/rest-limiar-alerta-fluxo.md](./contracts/rest-limiar-alerta-fluxo.md)
- [x] T021 [P] Em `frontend/src/utils/alertaFluxoCaixa.ts` / `Dashboard.tsx`, revisar mensagens de erro do limiar (“inteiro entre 1 e 100”) e exibição do limiar sem casas desnecessárias
- [x] T022 Executar validação manual de [quickstart.md](./quickstart.md) (smoke limiar/próximo, banner, toggle, papéis, falha parcial opcional)
- [x] T023 Em `frontend/`, rodar `npm run lint` e `npm run type-check` e corrigir regressões introduzidas por esta feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup — **bloqueia** todas as US
- **US1 (Phase 3)**: após Foundation — MVP
- **US2 (Phase 4)**: após Foundation; ideal após US1 (banner já existe)
- **US3 (Phase 5)**: após US1 (e preferencialmente US2 para ver os três campos)
- **US4 (Phase 6)**: após Foundation; pode paralelizar com US2/US3 se o banner base (US1) existir
- **Polish (Phase 7)**: após US desejadas

### User Story Dependencies

| Story | Depende de | Independente para testar? |
|-------|------------|---------------------------|
| US1 | Foundation (limiar GET + Pipeline) | Sim — banner on/off |
| US2 | Foundation (próximo + Aging) + banner US1 | Sim — conteúdo do banner |
| US3 | US1 (+ US2 para valores) | Sim — só toggle |
| US4 | Foundation (PUT limiar) + US1 | Sim — editar limiar |

### Parallel Opportunities

- T002 ∥ T003 (schemas)
- T007 ∥ T008 (api.ts ∥ util)
- T020 ∥ T021 (polish backend ∥ frontend copy)

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 + Phase 2 (limiar GET + util %)
2. Phase 3 US1 — banner on/off
3. **STOP** e validar SC-001

### Incremental Delivery

1. US1 → gatilho do banner  
2. US2 → três dados + falha parcial  
3. US3 → toggle  
4. US4 → edição limiar inteiro  
5. Polish + quickstart  

### Suggested MVP scope

**US1 apenas** (banner quando `% > limiar` com limiar default 60), desde que Foundation entregue GET limiar + cálculo de %.

---

## Notes

- `/speckit-tasks` regenerado 2026-09-10: T006 alinhado ao desempate estável do plano (líquido → bruto → `id`).
- `/speckit-implement` 2026-09-10: código T001–T023 já presente e conferido (sem gaps); checklist requirements 16/16 PASS.
- `tsc`: erros pré-existentes em Label DRE (`Dashboard.tsx`) e `DH.tsx` — fora do escopo 061.
- Smoke HTTP do [quickstart.md](./quickstart.md) **não** rodou nesta sessão (API/Docker off). Subir `docker compose up -d` + frontend e validar limiar/próximo/banner quando possível.
- Spec em pt-BR; IDs/caminhos em inglês técnico.
