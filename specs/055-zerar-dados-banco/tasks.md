# Tasks: Zerar Dados do Banco (Preservar Login e Fornecedores)

**Input**: Design documents from `/specs/055-zerar-dados-banco/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Fase 2 ajusta seeds de startup e cria o esqueleto do script (bloqueia as histórias). US1 entrega o wipe completo (MVP). US2 fecha o gate de confirmação. US3 garante ausência de UI/API de wipe.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`, `backend/scripts/`
- Frontend: `frontend/src/` (somente verificação — sem feature de wipe)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline e preparar arquivos-alvo do plano

- [x] T001 Confirmar branch `055-zerar-dados-banco`, artefatos em `specs/055-zerar-dados-banco/` e presença de `backend/app/main.py`, `backend/app/database.py`, `backend/app/models/__init__.py`, `backend/scripts/` conforme [plan.md](./plan.md)
- [x] T002 Criar esqueleto `backend/scripts/zerar_dados.py` com docstring em pt-BR, `if __name__ == "__main__"`, argparse/`sys.argv` stub e exit codes alinhados a [contracts/cli-zerar-dados.md](./contracts/cli-zerar-dados.md) (ainda sem deletes)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Impedir reseeding estrutural no startup e expor helpers compartilhados do wipe — bloqueia todas as histórias

**⚠️ CRITICAL**: Nenhuma história de wipe até os seeds automáticos de estrutura estarem desligados do boot

- [x] T003 Em `backend/app/main.py`, remover/desligar no startup a inserção automática de conta corrente padrão (`corrente`), a chamada a `seed_subcategorias_rh` e o insert de `paginas_visibilidade`, conforme [research.md](./research.md) §6 e FR-011
- [x] T004 [P] Criar `backend/scripts/seed_estrutura.py` que, sob invocação explícita, reaplica seed de subcategorias RH (`app.services.categorias_contas.seed_subcategorias_rh`), conta corrente padrão e `paginas_visibilidade` para installs novos (não chamado pelo wipe nem pelo startup)
- [x] T005 Em `backend/scripts/zerar_dados.py`, adicionar constantes/helpers: frase de confirmação `ZERAR DADOS OCEAN`, critério de fornecedor puro (`tipo='fornecedor'` ∧ `elegivel_equipe=false`), lista de tabelas a zerar e função de baseline counts conforme [data-model.md](./data-model.md)

**Checkpoint**: Restart do backend não recria categorias/contas/config; script esqueleto e seed sob demanda existem

---

## Phase 3: User Story 1 - Limpar dados preservando login e fornecedores (Priority: P1) 🎯 MVP

**Goal**: Operação pontual zera dados operacionais/estruturais e preserva `usuarios_app`/`usuarios_auth` + fornecedores puros (com histórico/documentos deles) + limpeza de anexos pós-commit

**Independent Test**: Com base populada, executar wipe confirmado; login e fornecedores permanecem; demais módulos/tabelas vazios; sem reseeding no restart ([quickstart.md](./quickstart.md) §§1, 3, 4)

### Implementation for User Story 1

- [x] T006 [US1] Em `backend/scripts/zerar_dados.py`, implementar coleta de paths de anexos a remover (NF `anexo_path`, comprovantes `contas_pagar.comprovante_path`, `documentos_colaborador` de não-preservados; dirs `UPLOAD_DIR`/`NFS_DIR`/`COMPROVANTES_DIR` via `app.config.settings`) antes do commit
- [x] T007 [US1] Em `backend/scripts/zerar_dados.py`, implementar deletes em uma única transação SQLAlchemy (`SessionLocal`) na ordem de [data-model.md](./data-model.md): filhos → pais; preservar `usuarios_*` e fornecedores puros + histórico/docs vinculados
- [x] T008 [US1] Em `backend/scripts/zerar_dados.py`, após `commit` bem-sucedido, remover arquivos coletados (best-effort; warning em falha de FS sem reverter o banco), conforme [research.md](./research.md) §4
- [x] T009 [US1] Em `backend/scripts/zerar_dados.py`, em qualquer exceção durante a transação fazer `rollback`, mensagem de erro em pt-BR e exit code `2`; sucesso com resumo de contagens e exit `0`
- [x] T010 [US1] Validar smoke US1 conforme [quickstart.md](./quickstart.md) §§1, 3 e 4 (baseline → wipe → login + fornecedores + tabelas zeradas + restart sem reseed)

**Checkpoint**: SC-001, SC-002, SC-003, SC-006, SC-007 (parcial — falha coberta na polish); FR-001–004, FR-007–011

---

## Phase 4: User Story 2 - Confirmação explícita antes da limpeza (Priority: P1)

**Goal**: Sem confirmação válida, zero alterações; com frase correta (stdin ou `--confirm`), executa o wipe

**Independent Test**: Frase errada/cancelamento → exit `1`, baseline intacto; frase correta → limpeza ([quickstart.md](./quickstart.md) §2 e contrato CLI)

### Implementation for User Story 2

- [x] T011 [US2] Em `backend/scripts/zerar_dados.py`, implementar gate de confirmação interativo (prompt stdin) exigindo exatamente `ZERAR DADOS OCEAN`; cancelamento/EOF/frase errada → exit `1` sem abrir mutação
- [x] T012 [US2] Em `backend/scripts/zerar_dados.py`, implementar `--confirm="ZERAR DADOS OCEAN"` para modo não interativo; valor diferente ou ausência em modo não-TTY inadequado → exit `1`; não permitir wipe só com `--force`/`-y` sem a frase
- [x] T013 [US2] Em `backend/scripts/zerar_dados.py`, garantir que baseline/log informativo roda **antes** da confirmação, mas deletes só **depois** da confirmação aceita
- [x] T014 [US2] Validar smoke US2: cancelamento (§2 quickstart) e execução com `--confirm` (§3)

**Checkpoint**: SC-004; FR-005, FR-012 (sem backup automático)

---

## Phase 5: User Story 3 - Operação fora do uso cotidiano do app (Priority: P2)

**Goal**: Nenhuma tela, menu ou endpoint de wipe no produto; limpeza só via script ops

**Independent Test**: Navegar UI como admin/visualizador sem achar “zerar dados”; grep/API sem rota de wipe ([quickstart.md](./quickstart.md) §4 UI)

### Implementation for User Story 3

- [x] T015 [P] [US3] Verificar em `frontend/src/` (rotas em `App.tsx`, `Layout.tsx`, páginas e `services/api.ts`) que não existe ação/menu/serviço de zerar dados; não adicionar UI
- [x] T016 [P] [US3] Verificar em `backend/app/api/` e `backend/app/main.py` (routers) que não há endpoint HTTP de wipe; não registrar rota nova
- [x] T017 [US3] Documentar no cabeçalho/docstring de `backend/scripts/zerar_dados.py` que a operação é só CLI/ops e não faz parte da UI, citando [contracts/cli-zerar-dados.md](./contracts/cli-zerar-dados.md)
- [x] T018 [US3] Validar checklist SC-005 (0 telas/menus de wipe) conforme [quickstart.md](./quickstart.md)

**Checkpoint**: FR-006; SC-005

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Fechar atomicidade, UX do CLI e validação ponta a ponta

- [x] T019 [P] Em `backend/scripts/zerar_dados.py`, padronizar mensagens stdout/stderr em português e códigos de saída `0`/`1`/`2`/`3` conforme [contracts/cli-zerar-dados.md](./contracts/cli-zerar-dados.md)
- [x] T020 Em `backend/scripts/zerar_dados.py` (ou nota no quickstart), documentar procedimento de simulação de falha mid-transaction para SC-007 (ex.: flag interna de teste / instrução manual) e validar rollback = baseline
- [x] T021 Executar validação completa de [quickstart.md](./quickstart.md) (cancelar → executar → verificar UI → restart sem reseed) e anotar resultado
- [x] T022 [P] Revisar que `backend/scripts/zerar_dados.py` e `backend/scripts/seed_estrutura.py` não embutem credenciais/segredos e usam `settings.DATABASE_URL` / env do ambiente

**Checkpoint**: Feature pronta para uso ops; aceite alinhado à spec

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: sem dependências
- **Phase 2 (Foundational)**: depende de Phase 1 — **bloqueia** US1–US3
- **Phase 3 (US1)**: depende de Phase 2 — MVP
- **Phase 4 (US2)**: depende de T007–T009 (lógica de wipe) para o gate proteger deletes reais; pode esboçar o gate em paralelo após T005
- **Phase 5 (US3)**: independente de US1/US2 após Phase 2 (só verificação); ideal após MVP para checklist final
- **Phase 6 (Polish)**: após US1–US3

### User Story Dependencies

- **US1**: núcleo do wipe — não depende de US2/US3 para deletes, mas US2 deve estar integrado antes de uso real
- **US2**: envolve o núcleo de US1 com confirmação
- **US3**: verificação negativa (sem UI/API) — paralelizável com US1/US2

### Parallel Opportunities

- T003 ∥ T004 (após T002)
- T015 ∥ T016 (US3)
- T019 ∥ T022 (polish)

### Within US1

1. T006 (coleta paths) → T007 (deletes) → T008 (arquivos) → T009 (erros/resumo) → T010 (smoke)

### Within US2

1. T011 → T012 → T013 → T014

### Within US3

1. T015 ∥ T016 → T017 → T018

---

## Parallel Example: User Story 3

```bash
# Em paralelo:
Task: "T015 Verificar frontend sem wipe em frontend/src/"
Task: "T016 Verificar backend/api sem endpoint de wipe"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Phase 1–2 (seeds off + esqueleto)
2. Completar US1 (T006–T010) — wipe real preservando login/fornecedores
3. **Parar e validar** quickstart §§1, 3, 4
4. Em seguida US2 (confirmação) antes de qualquer execução em dado importante

### Incremental Delivery

1. Setup + Foundational → startup sem reseed
2. US1 → valor principal (base limpa)
3. US2 → segurança operacional
4. US3 → garantia de não exposição no produto
5. Polish → SC-007 + checklist final

### Notes

- Não criar rota REST nem tela de wipe
- Backup permanece responsabilidade do operador (`backend/scripts/backup.sh`)
- Após wipe, estrutura vazia até `python scripts/seed_estrutura.py` explícito

### Validation note (2026-09-07)

- `python -m py_compile` OK nos scripts
- Grep UI/API: zero ocorrências de wipe/zerar dados (SC-005)
- Smoke E2E no Postgres **não executado**: Docker Desktop indisponível neste ambiente; rodar [quickstart.md](./quickstart.md) localmente após `docker compose up -d`
