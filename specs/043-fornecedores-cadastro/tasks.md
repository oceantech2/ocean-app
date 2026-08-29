# Tasks: Fornecedores — cadastro unificado e dados de pessoa física

**Input**: Design documents from `/specs/043-fornecedores-cadastro/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/rest-fornecedores-cadastro.md](./contracts/rest-fornecedores-cadastro.md), [contracts/ui-fornecedores-cadastro.md](./contracts/ui-fornecedores-cadastro.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (P1 US1 → US2 → US3, depois P2 US4 → US5). Sem `[P]` quando o mesmo arquivo seria editado em paralelo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US5 conforme spec.md (US4 = história 1b RH legado; US5 = história 4 continuidade)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte e arquivos-alvo; sem dependências novas

- [x] T001 Confirmar branch `043-fornecedores-cadastro`, portas 8001/5193/5433 e arquivos-alvo listados em [plan.md](./plan.md) (`Colaboradores.tsx`, `colaboradores.py`, `paginasCatalogo.ts`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Migração, modelo, schemas, listagem API e tipos TS — bloqueia todas as histórias

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Em `backend/app/main.py` (`_migrar`): adicionar `elegivel_equipe`, `tipo_fornecedor`, `pf_nome`, `pf_cpf`, `pf_endereco`, `pf_data_nascimento`; backfill (`elegivel_equipe=true` onde `tipo=colaborador`; `UPDATE tipo='fornecedor'`; `tipo_fornecedor='fixo'`); trocar índice único para `documento` ativo; criar `ux_colaboradores_pf_cpf_ativo` conforme [data-model.md](./data-model.md)
- [x] T003 Atualizar modelo `Colaborador` em `backend/app/models/__init__.py` com colunas novas
- [x] T004 Estender `ColaboradorBase`/`Create`/`Update`/`Response` em `backend/app/schemas.py` (`elegivel_equipe`, `tipo_fornecedor`, `pf_*`; defaults e literais `fixo`|`spot`)
- [x] T005 Em `backend/app/api/routes/colaboradores.py`: query `elegivel_equipe` opcional; deprecar filtro `tipo=colaborador` como alias de `elegivel_equipe=true`; listagem padrão retorna todos os fornecedores; `POST` força `tipo=fornecedor` e `elegivel_equipe=false`
- [x] T006 [P] Estender interface `Colaborador` em `frontend/src/types/index.ts` (`elegivel_equipe`, `tipo_fornecedor`, `pf_*`)
- [x] T007 Em `frontend/src/services/api.ts`, `colaboradoresService.listar` aceitar `elegivel_equipe?: boolean` e enviar/receber campos novos no create/update

**Checkpoint**: Banco migrado; API lista fornecedores unificados; frontend tipado

---

## Phase 3: User Story 1 - Página e cadastro unificados como Fornecedores (Priority: P1) 🎯 MVP

**Goal**: Menu **Fornecedores**, rota `/fornecedores`, redirect `/colaboradores`, listagem única sem abas

**Independent Test**: Menu e título dizem Fornecedores; `/colaboradores` redireciona; legados e novos na mesma lista; visualizador só lê

### Implementation for User Story 1

- [x] T008 [US1] Atualizar `label`, `path` e `desc` em `frontend/src/utils/paginasCatalogo.ts` (Fornecedores, `/fornecedores`; manter `key: colaboradores`)
- [x] T009 [US1] Adicionar redirect `/colaboradores` → `/fornecedores` em `frontend/src/App.tsx`
- [x] T010 [US1] Renomear `frontend/src/pages/Colaboradores.tsx` → `frontend/src/pages/Fornecedores.tsx` e atualizar lazy import em `frontend/src/App.tsx`
- [x] T011 [US1] Remover abas colaborador/fornecedor; listar todos com `colaboradoresService.listar` sem filtro de tipo; rótulos "Novo fornecedor" / "Editar fornecedor" em `frontend/src/pages/Fornecedores.tsx` conforme [contracts/ui-fornecedores-cadastro.md](./contracts/ui-fornecedores-cadastro.md)
- [x] T012 [US1] Garantir migração em `backend/app/main.py` preserva dados de ex-colaboradores visíveis na listagem (`elegivel_equipe=true` após backfill)

**Checkpoint**: SC-001, SC-006; FR-001, FR-001a, FR-002, FR-003

---

## Phase 4: User Story 2 - Classificação Tipo Fixo ou Spot (Priority: P1)

**Goal**: Campo **Tipo** obrigatório (Fixo/Spot) no cadastro e na listagem

**Independent Test**: Criar Fixo e Spot; gravar sem Tipo recusa; migrados aparecem como Fixo

### Implementation for User Story 2

- [x] T013 [US2] Validar `tipo_fornecedor` obrigatório (`fixo`|`spot`) em POST/PUT em `backend/app/api/routes/colaboradores.py` e `backend/app/schemas.py`
- [x] T014 [US2] Campo select **Tipo** (Fixo/Spot) no formulário e coluna na listagem em `frontend/src/pages/Fornecedores.tsx`
- [x] T015 [US2] Default `fixo` no formulário de criação; exibir valor migrado na edição em `frontend/src/pages/Fornecedores.tsx`

**Checkpoint**: SC-002, SC-004; FR-004, FR-005, FR-006

---

## Phase 5: User Story 3 - Dados de pessoa física quando documento é CNPJ (Priority: P1)

**Goal**: Seção PF (Nome, CPF, Endereço, Data de Nascimento) obrigatória no save de CNPJ; duplicidade de `pf_cpf`

**Independent Test**: CNPJ+PF grava; CNPJ sem PF recusa no save; CPF novo sem seção PF extra

### Implementation for User Story 3

- [x] T016 [US3] Validar PF completa quando `tipo_documento=cnpj` no save; checar `pf_cpf` duplicado entre ativos; limpar `pf_*` ao trocar para CPF em `backend/app/api/routes/colaboradores.py`
- [x] T017 [US3] Seção **Pessoa física do CNPJ** condicional no formulário em `frontend/src/pages/Fornecedores.tsx`
- [x] T018 [US3] CNPJ legado sem PF: permitir GET/listagem; bloquear PUT até PF completa (mensagem clara) em `backend/app/api/routes/colaboradores.py` — Contas a Pagar sem validação de PF em `backend/app/api/routes/contas.py`

**Checkpoint**: SC-003, SC-004; FR-007, FR-008 (parcial), FR-009, FR-012, FR-015

---

## Phase 6: User Story 4 - Campos de RH apenas em registros legados (Priority: P2)

**Goal**: Bloco RH só quando `elegivel_equipe=true`; novos fornecedores sem cargo/salário/data nascimento (CPF)

**Independent Test**: Editar legado mostra RH; novo fornecedor e ex-fornecedor puro não mostram RH

### Implementation for User Story 4

- [x] T019 [US4] Validar cargo/salário/data_nascimento apenas quando `elegivel_equipe=true` e CPF no PUT em `backend/app/api/routes/colaboradores.py`; strip campos RH no body quando `elegivel_equipe=false`
- [x] T020 [US4] Renderizar bloco RH (cargo, salário, datas, benefício, histórico, documentos) somente se `editando?.elegivel_equipe` em `frontend/src/pages/Fornecedores.tsx`
- [x] T021 [US4] Ocultar **Data de Nascimento** em novo fornecedor CPF (`elegivel_equipe=false`); manter obrigatória no bloco RH do legado CPF em `frontend/src/pages/Fornecedores.tsx`

**Checkpoint**: FR-008, FR-016, FR-017; história 1b da spec

---

## Phase 7: User Story 5 - Continuidade operacional em outras telas (Priority: P2)

**Goal**: Férias/bônus/patrimônio/NFs só `elegivel_equipe=true`; Contas a Pagar todos os fornecedores ativos

**Independent Test**: Legado em Férias; novo fornecedor não; ambos em Contas a Pagar

### Implementation for User Story 5

- [x] T022 [P] [US5] Filtrar `elegivel_equipe=true` em `frontend/src/pages/Ferias.tsx` na chamada `colaboradoresService.listar`
- [x] T023 [P] [US5] Idem em `frontend/src/pages/Bonus.tsx`
- [x] T024 [P] [US5] Idem em `frontend/src/pages/Patrimonio.tsx`
- [x] T025 [P] [US5] Atualizar selects de colaborador em `frontend/src/pages/NFs.tsx` para `elegivel_equipe=true` (se aplicável)
- [x] T026 [US5] Import/export xlsx: criar `tipo=fornecedor`, `tipo_fornecedor` (coluna Tipo opcional, default fixo), `elegivel_equipe` quando linha tem cargo+salário+nascimento em `backend/app/services/excel_io.py` e rotas em `backend/app/api/routes/colaboradores.py`
- [x] T027 [US5] Confirmar `frontend/src/pages/Contas.tsx` lista todos fornecedores ativos (sem filtro `elegivel_equipe`)

**Checkpoint**: SC-005; FR-011, FR-014, FR-015; FR-013 import

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e validação ponta a ponta

- [x] T028 [P] Alinhar label hardcoded em `frontend/src/components/Layout.tsx` se divergir do catálogo
- [x] T029 Executar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T030 Validar cenários de [quickstart.md](./quickstart.md) manualmente (admin e visualizador)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende de Setup — **bloqueia** todas as histórias
- **US1 (Phase 3)**: Depende de Foundational — **MVP**
- **US2 (Phase 4)**: Depende de Foundational; integra com `Fornecedores.tsx` após US1
- **US3 (Phase 5)**: Depende de Foundational; formulário após US1 (recomendado após US2)
- **US4 (Phase 6)**: Depende de US1 (página renomeada); pode paralelizar backend T019 com US3 backend
- **US5 (Phase 7)**: Depende de Foundational (`elegivel_equipe` na API); independente de US2/US3
- **Polish (Phase 8)**: Depois das histórias desejadas

### User Story Dependencies

| História | Depende de | Independente quando |
|----------|------------|---------------------|
| US1 | Phase 2 | Listagem unificada + rota |
| US2 | Phase 2, US1 (UI) | API valida Tipo sozinha |
| US3 | Phase 2, US1 (UI) | API valida PF sozinha |
| US4 | Phase 2, US1 | RH condicional no form |
| US5 | Phase 2 | Filtros em outras páginas |

### Parallel Opportunities

```bash
# Foundational — tipos em paralelo com API:
T006 frontend/src/types/index.ts
T007 frontend/src/services/api.ts
# (após T004 schemas)

# US5 — telas RH em paralelo:
T022 Ferias.tsx | T023 Bonus.tsx | T024 Patrimonio.tsx | T025 NFs.tsx

# Polish:
T028 Layout.tsx | T029 lint/type-check
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 + Phase 2 (fundação)
2. Phase 3 (US1) — página Fornecedores unificada
3. **Validar** quickstart itens 1–2
4. Entregar demo se necessário

### Entrega incremental

1. Fundação → US1 (navegação + lista) → **MVP**
2. US2 (Tipo Fixo/Spot)
3. US3 (PF do CNPJ)
4. US4 (RH legado) + US5 (outras telas) em paralelo
5. Polish + quickstart completo

### Escopo sugerido por sprint

| Sprint | Fases | Entrega |
|--------|-------|---------|
| 1 | 1–3 | Fornecedores unificados na UI |
| 2 | 4–5 | Tipo + PF CNPJ |
| 3 | 6–8 | RH legado, telas RH, import, QA |

---

## Notes

- Endpoint REST permanece `/api/colaboradores`; tabela `colaboradores` inalterada no nome
- `permKey` `colaboradores` preservado para ACL em Configurações
- Não renomear rótulo "colaborador" em Férias/Bônus nesta feature (spec)
- Evitar editar `Fornecedores.tsx` em paralelo entre US2, US3 e US4 — sequenciar ou uma PR por história
