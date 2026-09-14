# Tasks: Renomear Atalhos da Página Contratos

**Input**: Design documents from `/specs/063-contratos-clientes-internos/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (P1 US1 → P1 US2). Ambas tocam o mesmo arquivo — execução sequencial. `[P]` só quando aplicável.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US2 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Frontend: `frontend/src/pages/Contratos.tsx`
- Contrato UI: `specs/063-contratos-clientes-internos/contracts/ui-contratos-rotulos.md`
- **Não alterar**: `frontend/src/utils/paginasCatalogo.ts`, `frontend/src/App.tsx`, `frontend/src/components/navIcons.tsx`, backend, URLs dos atalhos, artefatos de `specs/052-pagina-contratos/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte; sem app novo, sem dependência nova

- [x] T001 Confirmar escopo só em `frontend/src/pages/Contratos.tsx`: dois `rotulo` do array `ATALHOS`; portas 5193/8001 inalteradas; não tocar `frontend/src/utils/paginasCatalogo.ts`, `frontend/src/App.tsx`, `frontend/src/components/navIcons.tsx` nem backend

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Mapa canônico de rótulos alinhado ao contrato — bloqueia US1/US2

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Conferir em [contracts/ui-contratos-rotulos.md](./contracts/ui-contratos-rotulos.md) e [research.md](./research.md) o mapa: cima **Contratos Clientes** → pasta `1pJGZNasVVx2pGdk0-mu6GA0L4x59gj9H`; baixo **Contratos Internos** → pasta `1t8HPQgoqgyG1wWy7CjJbDoEJoayi_PJ-`; grafia exata (sem “de”); proibição de **Contratos ativos** / **Contratos arquivados** na página; título e menu permanecem **Contratos**

**Checkpoint**: Mapa e proibições claros antes de editar `Contratos.tsx`

---

## Phase 3: User Story 1 - Identificar os atalhos pelos novos nomes (Priority: P1) 🎯 MVP

**Goal**: Na página Contratos, o atalho de cima exibe **Contratos Clientes** e o de baixo **Contratos Internos**; os nomes antigos não aparecem; título da página continua **Contratos**

**Independent Test**: Abrir `/contratos` autenticado e conferir os dois rótulos de cima para baixo; busca na página sem **Contratos ativos** nem **Contratos arquivados**; h1 e item de menu ainda **Contratos**

### Implementation for User Story 1

- [x] T003 [US1] Em `frontend/src/pages/Contratos.tsx`, alterar `ATALHOS[0].rotulo` de `'Contratos ativos'` para `'Contratos Clientes'` e `ATALHOS[1].rotulo` de `'Contratos arquivados'` para `'Contratos Internos'`; não alterar `url`, `h1`, texto de apoio nem markup dos `<a>`

**Checkpoint**: SC-001 e SC-004 (página); FR-001 a FR-004 e FR-006 (título/menu); US1 testável mesmo sem revalidar as URLs no navegador

---

## Phase 4: User Story 2 - Abrir as mesmas pastas com os novos nomes (Priority: P1)

**Goal**: Cada atalho continua apontando para o mesmo destino de antes, em nova aba, sem substituir a sessão do Ocean App

**Independent Test**: Acionar **Contratos Clientes** e **Contratos Internos**; cada um abre a URL do contrato em nova aba; aba Ocean permanece em `/contratos`

### Implementation for User Story 2

- [x] T004 [US2] Em `frontend/src/pages/Contratos.tsx`, confirmar que `ATALHOS[0].url` e `ATALHOS[1].url` permanecem `https://drive.google.com/drive/u/2/folders/1pJGZNasVVx2pGdk0-mu6GA0L4x59gj9H` e `https://drive.google.com/drive/u/2/folders/1t8HPQgoqgyG1wWy7CjJbDoEJoayi_PJ-` (nessa ordem) e que os `<a>` mantêm `target="_blank"` e `rel="noopener noreferrer"`; não reordenar o array nem mudar `key={atalho.url}`

**Checkpoint**: SC-002; FR-005; destinos e comportamento de nova aba intactos

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e validação ponta a ponta

- [x] T005 Rodar `npm run lint` e `npm run type-check` em `frontend/`; executar o checklist de [quickstart.md](./quickstart.md) (rótulos, URLs, nova aba, título/menu inalterados)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: imediato
- **Foundational (Phase 2)**: após Setup — **bloqueia** US1 e US2
- **User Story 1 (Phase 3)**: após Foundational — MVP
- **User Story 2 (Phase 4)**: após Foundational; preferir após US1 (mesmo arquivo `Contratos.tsx`)
- **Polish (Phase 5)**: após US1 + US2

### User Story Dependencies

- **US1 (P1)**: independente funcionalmente (só rótulos)
- **US2 (P1)**: independente funcionalmente (só destinos/comportamento de link); conflito de merge se paralelo no mesmo arquivo

### Parallel Opportunities

- Nenhuma: um único arquivo de código
- T001/T002 são sequenciais leves
- Não marcar US1 e US2 como `[P]` entre si

### Parallel Example

```text
# Não há modelos/arquivos distintos para paralelizar.
# Sequência recomendada: T001 → T002 → T003 (US1) → T004 (US2) → T005
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001–T002
2. T003 (rótulos)
3. **STOP e VALIDAR** textos na página Contratos
4. Seguir com US2 (destinos)

### Incremental Delivery

1. Setup + Foundational
2. US1 → demo da nomenclatura Clientes / Internos
3. US2 → confirmar mesmas pastas em nova aba
4. Polish / quickstart

### Parallel Team Strategy

Um único arquivo — um implementador por vez; segundo revisor no quickstart.

---

## Notes

- Sem testes automatizados (não pedidos na spec)
- Não reescrever `specs/052-pagina-contratos/`
- Formato checklist: todas as tarefas usam `- [ ] T00N ...` com caminho de arquivo
