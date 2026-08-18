# Tasks: Contas a Pagar — Cadastro de Nova Categoria

**Input**: Design documents from `/specs/032-cadastro-categoria-pagar/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/rest-contas-categorias.md](./contracts/rest-contas-categorias.md), [contracts/ui-contas-categorias.md](./contracts/ui-contas-categorias.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (P1 US1 → P1 US2 → P2 US3). Sem `[P]` quando o mesmo arquivo seria editado em paralelo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte; sem app novo e sem dependência nova

- [x] T001 Confirmar portas 8001/5193/5433 e que o cadastro vive em `frontend/src/pages/Contas.tsx` + `backend/app/api/routes/contas.py` (sem item de menu em `frontend/src/components/Layout.tsx`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tabela, modelo, schemas, GET do catálogo e tipos — bloqueia todas as histórias

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Em `backend/app/main.py` (`_migrar`): `CREATE TABLE IF NOT EXISTS categorias_pagar_cadastradas` (`id`, `codigo`, `nome`, `criado_em`, `criado_por` opcional) + UNIQUE `codigo` + índice UNIQUE `LOWER(nome)` conforme [data-model.md](./data-model.md)
- [x] T003 Adicionar modelo `CategoriaPagarCadastrada` em `backend/app/models/__init__.py`
- [x] T004 [P] Adicionar schemas de catálogo (`CategoriaCatalogoItem`, listagem oficiais+cadastradas+subs RH, `CategoriaCadastradaCreate`/`CategoriaCadastradaResponse`) em `backend/app/schemas.py` conforme [contracts/rest-contas-categorias.md](./contracts/rest-contas-categorias.md)
- [x] T005 Implementar `listar_catalogo(db)` em `backend/app/services/categorias_contas.py` (oficiais na ordem vigente do módulo; cadastradas `ORDER BY nome` case-insensitive; `subcategorias_rh`)
- [x] T006 Registrar `GET /categorias` **antes** das rotas `/{id}` em `backend/app/api/routes/contas.py` (`get_current_user`; admin e visualizador)
- [x] T007 [P] Tipos do catálogo em `frontend/src/types/index.ts` e `GET` em `frontend/src/services/api.ts` (`contasService` ou serviço irmão)

**Checkpoint**: `GET /api/contas/categorias` devolve oficiais + lista vazia de cadastradas; frontend tipado

---

## Phase 3: User Story 1 - Cadastrar categoria no formulário (Priority: P1) 🎯 MVP

**Goal**: Admin cria categoria a partir do campo Categorias; fica selecionada; visualizador não cadastra; listagem sem botão avulso

**Independent Test**: Abrir criar/editar conta, **Nova categoria…**, gravar `Frota`; o select fica em Frota; visualizador não vê a sentinela; listagem sem ação de cadastro

### Implementation for User Story 1

- [x] T008 [US1] Implementar `validar_nome_nova` + `criar_cadastrada` (trim, persistir `nome`, gerar `codigo=cat_{id}`) em `backend/app/services/categorias_contas.py`
- [x] T009 [US1] `POST /categorias` com `require_admin`, 201, 403 visualizador, `registrar_auditoria` e 422 básicos em `backend/app/api/routes/contas.py` conforme [contracts/rest-contas-categorias.md](./contracts/rest-contas-categorias.md)
- [x] T010 [US1] Carregar catálogo; no select de criar/editar (admin) oficiais + cadastradas + sentinela **Nova categoria…**; campo nome + confirmar/cancelar; POST; toast; selecionar `codigo` retornado; cancelar restaura categoria anterior; sem botão na listagem — em `frontend/src/pages/Contas.tsx` conforme [contracts/ui-contas-categorias.md](./contracts/ui-contas-categorias.md)
- [x] T011 [US1] Ocultar sentinela para `visualizador` e não persistir valor `__nova__` no submit em `frontend/src/pages/Contas.tsx`

**Checkpoint**: SC-001, SC-003, SC-004; FR-001, FR-002, FR-003

---

## Phase 4: User Story 2 - Classificar, filtrar e consultar (Priority: P1)

**Goal**: Conta usa categoria cadastrada; filtro e custo por categoria mostram o nome; import aceita; Impostos/Retiradas inalterados

**Independent Test**: Salvar conta em Frota; filtrar; donut do período com fatia Frota; import linha Frota ok; contas antigas iguais

### Implementation for User Story 2

- [x] T012 [US2] Estender `validar_classificacao`, `resolver_import_categoria` e `label_categoria` para aceitar `db` e códigos/nomes cadastrados (cadastrada sem subcategoria) em `backend/app/services/categorias_contas.py`
- [x] T013 [US2] POST/PUT/import de contas em `backend/app/api/routes/contas.py` validar com catálogo (cadastrada + sub → 422; filtro `?categoria=cat_N`)
- [x] T014 [P] [US2] `label` de `cat_{id}` em `GET /relatorios/custo-por-categoria` em `backend/app/api/routes/relatorios.py`
- [x] T015 [US2] Filtro, coluna, edição e import CSV da página usarem catálogo (rótulo `nome`, não `cat_1`) em `frontend/src/pages/Contas.tsx`
- [x] T016 [P] [US2] Confirmar donut em `frontend/src/pages/Dashboard.tsx` usa `c.label` para cadastradas (ajuste mínimo se ainda cair no código cru)

**Checkpoint**: SC-005, SC-006, SC-007 (ordem já no GET); FR-004, FR-007, FR-008, FR-009, FR-012, FR-013

---

## Phase 5: User Story 3 - Nomes inválidos e duplicados (Priority: P2)

**Goal**: Recusar vazio, >20, charset, duplicata oficial/cadastrada/sub RH e código reservado, com mensagem clara

**Independent Test**: Tentativas da tabela do [quickstart.md](./quickstart.md) §3 → 422/toast; nenhum registro extra; nome válido curto grava uma vez

### Implementation for User Story 3

- [x] T017 [US3] Completar `validar_nome_nova` em `backend/app/services/categorias_contas.py`: 1–20 após trim; só letras Unicode/dígitos/espaço/`-`/`/`; unicidade case-insensitive vs labels oficiais, cadastradas e subs RH; recusar `normalizar_codigo(nome)` reservado
- [x] T018 [US3] Mapear 422 com `detail` em pt-BR no `POST /categorias` em `backend/app/api/routes/contas.py` (vazio, tamanho, charset, duplicata, reservado)
- [x] T019 [US3] Validação local + toasts alinhados à API no fluxo Nova categoria em `frontend/src/pages/Contas.tsx`; erro não deixa `__nova__` selecionado

**Checkpoint**: SC-002; FR-005, FR-006, FR-010, FR-011 (sem delete/rename)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Conferência final e qualidade

- [ ] T020 Percorrer [quickstart.md](./quickstart.md) (papéis, feliz, rejeições, ordem, donut, import)
- [x] T021 Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T022 Confirmar que `backend/app/api/routes/impostos.py` e a página de Retiradas não mudaram recorte; `frontend/src/components/Layout.tsx` sem menu novo

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependência
- **Foundational (Phase 2)**: após Setup — **bloqueia** US1–US3
- **US1 (Phase 3)**: após Foundational — MVP
- **US2 (Phase 4)**: após US1 (precisa de categoria persistida e catálogo no front)
- **US3 (Phase 5)**: após US1 (endurece o mesmo POST/UI); pode sobrepor US2 se o POST já existir
- **Polish (Phase 6)**: após as histórias desejadas

### User Story Dependencies

- **US1 (P1)**: após Phase 2 — cadastro + seleção
- **US2 (P1)**: após US1 — lançar/filtrar/relatório/import
- **US3 (P2)**: após US1 — matriz de recusa de nome

### Parallel Opportunities

- T004 e T007 em paralelo na Phase 2 (schemas vs frontend types/api)
- T014 e T016 em paralelo na US2 (relatorio vs Dashboard)
- Não paralelizar T010/T011/T015/T019 (mesmo `Contas.tsx`)
- Não paralelizar T005/T008/T012/T017 (mesmo `categorias_contas.py`)

---

## Parallel Example: Phase 2

```bash
Task: "Schemas de catálogo em backend/app/schemas.py"
Task: "Tipos e GET em frontend/src/types/index.ts e frontend/src/services/api.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2
2. Phase 3 (US1)
3. **STOP**: validar sentinela, POST 201, seleção automática, visualizador
4. Seguir US2 (senão a categoria não entra na conta/filtro/donut)

### Incremental Delivery

1. Setup + Foundational → GET catálogo
2. US1 → demo cadastro no formulário
3. US2 → classificação operacional
4. US3 → recusas
5. Polish → quickstart + lint

### Parallel Team Strategy

Um dev: ordem T001→T022. Dois devs após Phase 2: A = US1/US3 (API+Contas.tsx cadastro); B = US2 (validar contas + relatorio) sincronizando `categorias_contas.py`.

---

## Notes

- `[P]` só com arquivos distintos e sem dependência incompleta
- Oficiais continuam em `categorias_contas.py`; não migrar taxonomia oficial para a tabela
- Sem DELETE/PATCH de categoria; sem subcategoria nova; sem botão na listagem
- Validação: [quickstart.md](./quickstart.md), não suíte TDD
