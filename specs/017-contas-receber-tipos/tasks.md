# Tasks: Contas a Receber — Novos nomes dos tipos

**Input**: Design documents from `/specs/017-contas-receber-tipos/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados no spec — validação manual via [quickstart.md](./quickstart.md) + `npm run lint` / `npm run type-check`

**Organization**: Tasks agrupadas por user story para entrega incremental e teste independente

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: User story (US1–US6)
- Incluir caminhos de arquivo exatos nas descrições

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`
- Contratos: `specs/017-contas-receber-tipos/contracts/`
- Modelo: `specs/017-contas-receber-tipos/data-model.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline (enum de dois valores + abertura/fechamento) e o mapeamento oficial antes de editar código

- [x] T001 Revisar `specs/017-contas-receber-tipos/plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api-contas-receber-tipos.md` e `contracts/ui-contas-receber-tipos.md` e confirmar escopo (três tipos oficiais; Maggo antigo na entrada; Calendário no-op; e-mails novos só)
- [x] T002 [P] Inspecionar labels, `tipo_combined`, select e export em `frontend/src/pages/NFs.tsx` e opções/totais/assunto em `frontend/src/pages/DH.tsx`
- [x] T003 [P] Inspecionar `TipoFechamento`, `_parse_tipo_maggo`/`_parse_tipo_create`, `fechamentos_por_tipo` e labels nativos do enum PG (`SELECT enumlabel FROM pg_enum`) em `backend/app/models/__init__.py`, `backend/app/api/routes/nfs.py`, `backend/app/api/routes/relatorios.py` e `backend/app/main.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Enum + schema aceitam `parcelamento`; Maggo converte na entrada — bloqueia US1–US6 (sem isso o merge Maggo gravaria o sucesso antigo em cima do Sucesso novo)

**⚠️ CRITICAL**: Nenhuma story de UI/relatório até o enum existir e o parse Maggo gravar só valores oficiais

- [x] T004 [P] Em `backend/app/models/__init__.py`, adicionar `TipoFechamento.PARCELAMENTO = "parcelamento"` (manter `RETAINER` e `SUCESSO`)
- [x] T005 [P] Em `backend/app/main.py` (`_migrar`), no bloco AUTOCOMMIT já usado para `statusnf`, adicionar `ALTER TYPE tipofechamento ADD VALUE IF NOT EXISTS` com o **mesmo estilo de label** já gravado no PG (R-008 em [research.md](./research.md)) — **ainda sem** os UPDATEs de dados (US2)
- [x] T006 [P] Em `backend/app/schemas.py`, documentar/validar `tipo` e `tipo_fechamento` como `retainer` \| `sucesso` \| `parcelamento`; create/update manuais não exigem `tipo_abertura_fechamento`
- [x] T007 Em `backend/app/api/routes/nfs.py`, alterar `_parse_tipo_maggo` para devolver só o enum oficial e `tipo_ab=None` (abertura→retainer, fechamento→sucesso, sucesso antigo→parcelamento; tipo desconhecido → não inventar); `_parse_tipo_create` aceita os três valores oficiais — [contracts/api-contas-receber-tipos.md](./contracts/api-contas-receber-tipos.md)
- [x] T008 [P] Em `frontend/src/types/index.ts`, estender `NF.tipo` e `DH.tipo_fechamento` com `'parcelamento'`

**Checkpoint**: Banco aceita `parcelamento`; POST manual pode enviar os três tipos; Maggo stub antigo já grava classificação oficial

---

## Phase 3: User Story 1 — Ver e escolher os tipos com os novos nomes (Priority: P1) 🎯 MVP

**Goal**: Na página Contas a Receber, listagem, create e edit manual usam só **Retainer / Sucesso / Parcelamento**; Maggo readonly com nome novo; visualizador só consulta

**Independent Test**: Abrir `/nfs`; badges e select sem “Abertura/Fechamento”; criar uma conta de cada tipo; Maggo readonly; visualizador sem edit — [quickstart.md](./quickstart.md) passo UI 1

### Implementation for User Story 1

- [x] T009 [US1] Em `backend/app/api/routes/nfs.py` (`criar_nf` / `atualizar_nf` manual): persistir `tipo` oficial e forçar `tipo_abertura_fechamento=None`; Maggo continua recusando alteração de `tipo` (campo de negócio)
- [x] T010 [US1] Em `frontend/src/pages/NFs.tsx`, substituir `tipoLabel`/`tipoColor`/`tipoToCombined` e o select (`retainer|abertura` etc.) pelos três valores oficiais; default create `retainer`; payload sem `tipo_abertura_fechamento`; Maggo readonly com rótulo canônico — [contracts/ui-contas-receber-tipos.md](./contracts/ui-contas-receber-tipos.md)

**Checkpoint**: MVP — create/edit/listagem de Contas a Receber com nomes novos

---

## Phase 4: User Story 2 — Converter registros já cadastrados (Priority: P1)

**Goal**: Contas e DHs existentes passam à classificação oficial sem recadastro; conversão one-shot e idempotente

**Independent Test**: Restart da API com dados antigos; F5 em Contas a Receber e DH: abertura→Retainer, fechamento→Sucesso, sucesso antigo→Parcelamento; segundo restart não transforma o Sucesso novo em Parcelamento

### Implementation for User Story 2

- [x] T011 [US2] Em `backend/app/main.py` (`_migrar`), após o ADD VALUE, implementar o gate e os UPDATEs de `nfs.tipo` / `dh.tipo_fechamento` na ordem de [research.md](./research.md) R-002 e [data-model.md](./data-model.md); ao final `tipo_abertura_fechamento = NULL`; não reescrever `dh.assunto` antigo

**Checkpoint**: US1+US2 — dados legados e UI de Contas a Receber alinhados

---

## Phase 5: User Story 3 — Dashboard, Relatórios e DH (Priority: P1)

**Goal**: Mix de **três** grupos no Relatórios e no Dashboard; DH com as mesmas três opções/totais/rótulos (assunto de e-mail fica na US6)

**Independent Test**: Relatórios e Dashboard mostram Retainer / Sucesso / Parcelamento (não o par antigo); DH select e lista com os três nomes — quickstart passos 3–5

### Implementation for User Story 3

- [x] T012 [US3] Em `backend/app/api/routes/relatorios.py` (`fechamentos_por_tipo`), retornar `{ retainer, sucesso, parcelamento, total }` contando `nfs.tipo` oficial — [contracts/api-contas-receber-tipos.md](./contracts/api-contas-receber-tipos.md)
- [x] T013 [P] [US3] Em `frontend/src/pages/Relatorios.tsx`, pizza, totais e texto com três grupos (Retainer, Sucesso, Parcelamento)
- [x] T014 [P] [US3] Em `frontend/src/pages/Dashboard.tsx`, exibir o mix de três grupos a partir de `fechamentosPorTipo` (hoje o fetch existe e a UI descarta)
- [x] T015 [US3] Em `frontend/src/pages/DH.tsx`, trocar `TIPOS_DH` / `tipoLabel` / `tipoValue` / `tipoColor` e os dois cards de total pelas três opções oficiais; payload `tipo_fechamento` sem abertura/fechamento — [contracts/ui-contas-receber-tipos.md](./contracts/ui-contas-receber-tipos.md)

**Checkpoint**: Telas de mix e DH alinhadas aos nomes oficiais (Calendário permanece no-op)

---

## Phase 6: User Story 4 — Exportar sem os nomes antigos (Priority: P2)

**Goal**: CSV/export de Contas a Receber (e DH, se exportar tipo) usa só os rótulos canônicos

**Independent Test**: Exportar listagem com os três tipos; coluna Tipo = Retainer / Sucesso / Parcelamento

### Implementation for User Story 4

- [x] T016 [US4] Em `frontend/src/pages/NFs.tsx` (função de export), garantir que a coluna Tipo use o mesmo `tipoLabel` canônico da listagem; em `frontend/src/pages/DH.tsx`, alinhar a coluna Tipo do export aos rótulos canônicos

**Checkpoint**: Exportações das páginas afetadas sem rótulos antigos

---

## Phase 7: User Story 5 — Gravar o tipo Maggo já convertido (Priority: P2)

**Goal**: Stub Maggo permanece no payload antigo; merge grava oficial; item com tipo desconhecido é pulado

**Independent Test**: Após sync, MAGGO-002=`retainer`, MAGGO-003=`sucesso`, MAGGO-001/004/005=`parcelamento` (quickstart tabela Maggo)

### Implementation for User Story 5

- [x] T017 [US5] Confirmar que `backend/app/services/maggo_stub.py` **não** altera o payload antigo; em `backend/app/api/routes/nfs.py` (`_sync_maggo_stub`), persistir `tipo_abertura_fechamento=None` e pular item cujo tipo Maggo não mapeia (não falhar o lote inteiro nem inventar tipo)

**Checkpoint**: Entrada Maggo convertida; stub ainda na semântica antiga

---

## Phase 8: User Story 6 — E-mails novos com os nomes novos (Priority: P2)

**Goal**: Assunto de DH **novo** usa Retainer / Sucesso / Parcelamento; assuntos já gravados intocados

**Independent Test**: POST `/api/dh` com `tipo_fechamento=sucesso` → assunto contém `Sucesso` (não `retainer (fechamento)`); DH antigo inalterado — quickstart smoke DH

### Implementation for User Story 6

- [x] T018 [US6] Em `backend/app/api/routes/dh.py` (`criar_dh`), gerar `assunto` com os nomes canônicos (`DH :: {empresa} :: {posição} :: {Retainer|Sucesso|Parcelamento}`); não atualizar `assunto` de linhas existentes
- [x] T019 [US6] Em `frontend/src/pages/DH.tsx` (`gerarAssunto` / preview), usar os mesmos nomes canônicos do backend

**Checkpoint**: E-mails/assuntos novos alinhados; histórico intacto

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Varredura de rótulos antigos, lint e validação do quickstart

- [x] T020 Grep em `frontend/src` e `backend/app` por `Retainer - Abertura`, `Retainer - Fechamento`, `retainer|abertura` e `retainer (` no assunto; corrigir residual **exceto** payload do stub Maggo e comentários de mapeamento
- [x] T021 [P] Rodar `cd frontend && npm run lint && npm run type-check`
- [x] T022 Executar o fluxo de [quickstart.md](./quickstart.md) (smoke API + UI admin/visualizador) e confirmar SC-001 a SC-008

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **BLOQUEIA** todas as stories
- **US1 (Phase 3)**: Depende da Phase 2 — MVP
- **US2 (Phase 4)**: Depende da Phase 2 (idealmente após T007 para o Maggo não regravar legado)
- **US3 (Phase 5)**: Depende da Phase 2; T013/T014 dependem de T012; T015 pode paralelo a T012
- **US4 (Phase 6)**: Depende de US1 (mesmo `tipoLabel` em `NFs.tsx`)
- **US5 (Phase 7)**: Parse Maggo já em T007; esta fase só fecha stub + skip
- **US6 (Phase 8)**: Depende de T015 (opções DH) para o preview bater com o POST
- **Polish (Phase 9)**: Depende das stories desejadas

### User Story Dependencies

- **US1 (P1)**: Após Phase 2 — MVP da tela Contas a Receber
- **US2 (P1)**: Após Phase 2 — conversão de dados; complementar à US1 para listagem legada
- **US3 (P1)**: Após Phase 2 — Relatórios/Dashboard/DH UI; independente da US1 no backend de relatório
- **US4 (P2)**: Após US1 (export da mesma página)
- **US5 (P2)**: T007 já converte; T017 valida stub/skip
- **US6 (P2)**: Após UI DH (T015)

### Parallel Opportunities

- T002 e T003 (inspect) em paralelo
- T004, T005, T006, T008 em paralelo; T007 depois de T004
- T013 e T014 em paralelo após T012
- T021 em paralelo a T020

---

## Parallel Example: User Story 3

```bash
# Após T012 (API de mix com 3 chaves):
Task: "Em frontend/src/pages/Relatorios.tsx, pizza e totais com três grupos"
Task: "Em frontend/src/pages/Dashboard.tsx, exibir mix de três grupos"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational (enum + Maggo parse + schemas)
3. Phase 3: US1 (Contas a Receber)
4. **STOP and VALIDATE**: create/listagem com nomes novos
5. Demo se pronto

### Incremental Delivery

1. Setup + Foundational
2. US1 → MVP tela Contas a Receber
3. US2 → dados legados corretos
4. US3 → Relatórios, Dashboard, DH
5. US4 → export
6. US5 → fechar Maggo skip/stub
7. US6 → assunto/e-mail novo
8. Polish + quickstart

### Parallel Team Strategy

1. Time fecha Setup + Foundational
2. Dev A: US1 + US4 (`NFs.tsx`)
3. Dev B: US2 (`main.py`) + US5 (`nfs.py` sync)
4. Dev C: US3 (Relatórios/Dashboard) + US6 (DH assunto)

---

## Notes

- [P] = arquivos diferentes, sem dependência de tarefa incompleta
- Sem tarefas de teste automatizado (spec não pediu TDD)
- Calendário: sem tarefa de implementação (não exibe tipo de fechamento)
- Não reescrever `dh.assunto` nem auditoria já gravados
- Stub Maggo permanece no formato antigo de propósito
- Commit por tarefa ou grupo lógico, se o usuário pedir
