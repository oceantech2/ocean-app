# Tasks: Página Comissões — nomenclatura, criação e filtro de período

**Input**: Design documents from `/specs/044-comissoes-pagina/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/rest-comissoes-pagina.md](./contracts/rest-comissoes-pagina.md), [contracts/ui-comissoes-pagina.md](./contracts/ui-comissoes-pagina.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história P1 (US1 nomenclatura/rota → US2 sem botão novo → US3 filtro mês/trimestre). Sem `[P]` quando o mesmo arquivo seria editado em paralelo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte e arquivos-alvo; sem dependências novas

- [x] T001 Confirmar portas 8001/5193/5433 e arquivos-alvo listados em [plan.md](./plan.md) (`Bonus.tsx`, `paginasCatalogo.ts`, `App.tsx`, `navIcons.tsx`, `store/index.ts`, Dashboard/Contas/Auditoria, `categorias_contas.py`, `bonus.py`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Garantir que persistência e REST não mudam — bloqueia hipóteses de rename de API

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Confirmar que `bonusService` em `frontend/src/services/api.ts` permanece em `/bonus` e que não há migração de tabela em `backend/app/main.py` / `backend/app/models/__init__.py` (entidade `Bonus` inalterada) conforme [research.md](./research.md) R4 e [contracts/rest-comissoes-pagina.md](./contracts/rest-comissoes-pagina.md)

**Checkpoint**: Contrato REST e modelo persistido estáveis; UI pode mudar sem rename de API

---

## Phase 3: User Story 1 - Reconhecer Comissões em todo o produto (Priority: P1) 🎯 MVP

**Goal**: Menu, página, Configurações, Dashboard, Contas a Pagar e Auditoria usam **Comissões**/**Comissão**; rota `/comissoes`; `/bonus` inexistente (sem redirect)

**Independent Test**: Menu Comissões abre `/comissoes`; textos da página e das outras telas sem “bônus”; `/bonus` não abre nenhuma tela do produto

### Implementation for User Story 1

- [x] T003 [P] [US1] Atualizar `label`, `path` (`/comissoes`) e `desc` em `frontend/src/utils/paginasCatalogo.ts`; manter `key: 'bonus'` conforme [research.md](./research.md) R1
- [x] T004 [P] [US1] Remapear ícone de `/bonus` para `/comissoes` em `frontend/src/components/navIcons.tsx`
- [x] T005 [P] [US1] Trocar rótulos `BONUS`/`bonus` para **Comissões** em `frontend/src/pages/Dashboard.tsx`
- [x] T006 [P] [US1] Trocar `bonus: 'Bônus (legado)'` para **Comissões (legado)** em `frontend/src/pages/Contas.tsx` (não alterar a subcategoria `comissao`)
- [x] T007 [P] [US1] Exibir **Comissão** no filtro/células de Auditoria mapeando valor interno `Bonus` em `frontend/src/pages/Auditoria.tsx`
- [x] T008 [P] [US1] Atualizar rótulos `SUBCATEGORIAS_RH`/`LABELS_LEGADO` da chave `bonus` para **Comissões** / **Comissões (legado)** em `backend/app/services/categorias_contas.py`; chave `comissao` inalterada ([research.md](./research.md) R6)
- [x] T009 [P] [US1] Trocar mensagens visíveis de `HTTPException` para vocabulário de comissão em `backend/app/api/routes/bonus.py`
- [x] T010 [P] [US1] Atualizar `tags=["Bônus"]` para **Comissões** no include do router em `backend/app/main.py`
- [x] T011 [US1] Renomear todos os textos visíveis da página (título, gráfico, estado vazio, modal editar, toasts, confirm, importar, exportar, rótulo de valor) em `frontend/src/pages/Bonus.tsx` conforme [contracts/ui-comissoes-pagina.md](./contracts/ui-comissoes-pagina.md)
- [x] T012 [US1] Confirmar em `frontend/src/App.tsx` que a rota vem do catálogo (`/comissoes`, `permKey` `bonus`) e que **não** existe `<Navigate>` nem `<Route>` de `/bonus`

**Checkpoint**: SC-001, SC-004, SC-005; FR-001, FR-002, FR-003, FR-014, FR-015, FR-016

---

## Phase 4: User Story 2 - Página sem o botão de nova comissão (Priority: P1)

**Goal**: Remover criação avulsa pelo botão; manter importar, editar e excluir para admin

**Independent Test**: Admin não vê Novo bônus/Nova comissão; import/editar/deletar funcionam; visualizador sem o botão

### Implementation for User Story 2

- [x] T013 [US2] Remover o botão de novo registro e `abrirCriar` em `frontend/src/pages/Bonus.tsx`; modal abre só com `editando` definido
- [x] T014 [US2] Manter Importar CSV (`bonusService.criar` em lote), editar, excluir, exportar CSV/PDF em `frontend/src/pages/Bonus.tsx`; eliminar ramo de UI “Novo” no modal

**Checkpoint**: SC-002; FR-004, FR-005

---

## Phase 5: User Story 3 - Filtrar comissões por mês ou trimestre (Priority: P1)

**Goal**: Recorte ano inteiro (padrão) ou mês ou trimestre; listagem/total/export seguem o recorte; gráfico permanece 12 meses do ano

**Independent Test**: Com registros em trimestres distintos, filtrar mês, 1º trimestre e ano inteiro; conferir listagem, total e gráfico anual

### Implementation for User Story 3

- [x] T015 [P] [US3] Criar helper de trimestre civil (1→1–3, 2→4–6, 3→7–9, 4→10–12) em `frontend/src/utils/comissoesPeriodo.ts` conforme [data-model.md](./data-model.md)
- [x] T016 [US3] Estender `usePageFilters` em `frontend/src/store/index.ts` com `bonusRecorte` (`ano`|`mes`|`trimestre`, padrão `ano`), `bonusMes`, `bonusTrimestre` e `setBonusFilters` atualizado; recortes mutuamente exclusivos
- [x] T017 [US3] Adicionar controles de recorte (ano inteiro / mês / trimestre) junto a pessoa e ano em `frontend/src/pages/Bonus.tsx`; padrão primeira carga = ano corrente + ano inteiro
- [x] T018 [US3] Aplicar recorte na listagem, total do cabeçalho e exportação em `frontend/src/pages/Bonus.tsx`; gráfico continua agregando os 12 meses de `bonusAno` (FR-012)

**Checkpoint**: SC-003; FR-006 a FR-013

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e validação ponta a ponta

- [x] T019 Executar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T020 Validar cenários de [quickstart.md](./quickstart.md) (nomenclatura, `/bonus`, sem botão novo, filtros, admin e visualizador)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende de Setup — **bloqueia** todas as histórias
- **US1 (Phase 3)**: Depende de Foundational — **MVP**
- **US2 (Phase 4)**: Depende de US1 (`Bonus.tsx` já com nomenclatura); mesmo arquivo
- **US3 (Phase 5)**: Depende de US1 (página em `/comissoes`); T016 antes de T017/T018; T015 pode paralelizar com T016
- **Polish (Phase 6)**: Depois das histórias desejadas

### User Story Dependencies

| História | Depende de | Independente quando |
|----------|------------|---------------------|
| US1 | Phase 2 | Menu, rota, rótulos globais, `/bonus` morto |
| US2 | US1 (mesmo `Bonus.tsx`) | Ausência do botão novo |
| US3 | Phase 2 + store T016; UI após US1 | Filtro mês/trimestre |

### Parallel Opportunities

```bash
# US1 — arquivos distintos em paralelo:
T003 paginasCatalogo.ts | T004 navIcons.tsx | T005 Dashboard.tsx
T006 Contas.tsx | T007 Auditoria.tsx | T008 categorias_contas.py
T009 bonus.py | T010 main.py
# Depois: T011 Bonus.tsx → T012 App.tsx

# US3:
T015 comissoesPeriodo.ts | T016 store/index.ts
# Depois: T017 → T018 em Bonus.tsx
```

**Não paralelizar** T011, T013, T014, T017, T018 — todos em `frontend/src/pages/Bonus.tsx`.

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 + Phase 2
2. Phase 3 (US1) — Comissões no produto + `/comissoes`
3. **Validar** quickstart itens 1–2
4. Demo se necessário

### Entrega incremental

1. Fundação → US1 (nomenclatura + rota) → **MVP**
2. US2 (sem botão novo)
3. US3 (filtro mês/trimestre)
4. Polish + quickstart completo

### Parallel Team Strategy

Com mais de um dev, após Phase 2:

- Dev A: T003–T010 (rótulos e rota)
- Dev B: espera T011 ou pega backend T008–T010 enquanto A faz frontend de catálogo
- US2 e US3 sequenciais no mesmo arquivo `Bonus.tsx`

---

## Notes

- `permKey` `bonus` e REST `/api/bonus` preservados
- Subcategoria RH `comissao` (**Comissão**) não se funde com ex-Bônus (**Comissões**)
- Sem testes automatizados nesta lista (spec não pediu)
- Validar formato: checkbox + ID + `[P]` opcional + `[USx]` nas histórias + caminho de arquivo
