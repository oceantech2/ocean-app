# Tasks: Notícias pelo painel, MCP e página no site

**Input**: Documentos de design em `/specs/106-noticias-painel-mcp/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados na spec; validação por verificações estáticas e roteiro do [quickstart.md](./quickstart.md).

**Organization**: Tarefas agrupadas por user story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[Story]**: user story da spec (US1…US4)

---

## Phase 1: Setup

- [x] T001 Confirmar branch `106-noticias-painel-mcp` e artefatos em `specs/106-noticias-painel-mcp/`

---

## Phase 2: Foundational (bloqueia todas as histórias)

**Purpose**: modelo, serviço e schema compartilhados.

- [x] T002 Criar modelo `Noticia` (colunas bilíngues, CHECK status/segmento, índice, FKs) conforme data-model.md em `backend/app/models/__init__.py`
- [x] T003 [P] Adicionar schema `NoticiaIn` em `backend/app/schemas.py`
- [x] T004 Criar `backend/app/services/noticias.py`: `SEGMENTOS`, `STATUS_*`, `slug_titulo` (reuso/adaptado), `validar_noticia`, `hoje_sp`, `elegivel_publica`, `pode_alterar`/`exigir_alteracao`, `serializar_painel`, `serializar_publica`
- [x] T005 Em `backend/app/main.py` (`_migrar`): habilitar RLS em `noticias`

**Checkpoint**: banco e serviço base prontos.

---

## Phase 3: User Story 1 — Consultor publica notícia pelo painel (P1) 🎯 MVP

**Goal**: menu Notícias no painel com lista, criação, detalhe, edição, publicar/despublicar e excluir.

**Independent Test**: quickstart passos 2, 5 e 6 (painel).

- [x] T006 [US1] Criar `backend/app/api/routes/proposal_noticias.py`: listar (`status`, `segmento`, `busca`), obter, criar, editar, publicar, despublicar, excluir; `get_proposal_user`; auditoria
- [x] T007 [US1] Registrar roteador em `backend/app/main.py` com prefixo `/api/proposal/noticias`
- [x] T008 [P] [US1] Tipos e funções de notícias em `frontend/src/proposal/services/proposalApi.ts`
- [x] T009 [US1] Criar `frontend/src/proposal/components/NoticiaForm.tsx` (campos PT/EN, segmento, data, erros por campo)
- [x] T010 [US1] Criar `frontend/src/proposal/pages/Noticias.tsx` (lista, filtros, botão Nova)
- [x] T011 [US1] Criar `frontend/src/proposal/pages/NoticiaEditor.tsx` (nova/editar)
- [x] T012 [US1] Criar `frontend/src/proposal/pages/NoticiaDetalhe.tsx` (dados, link site, ações com `pode_editar`, `window.confirm`)
- [x] T013 [US1] Rotas `/noticias`… em `frontend/src/proposal/App.tsx` e menu em `ProposalLayout.tsx`

**Checkpoint**: notícias gerenciáveis no painel.

---

## Phase 4: User Story 2 — Visitante abre a página da notícia (P1)

**Goal**: site lista notícias elegíveis e abre página própria ao clicar.

**Independent Test**: quickstart passos 1, 3 e 4.

- [x] T014 [US2] Criar `backend/app/api/routes/public_noticias.py` (`GET /`, `GET /{id}` só elegíveis) e registrar em `main.py` com `/api/public/noticias`
- [x] T015 [P] [US2] Criar `frontend/src/site/dados/noticias.ts` (tipo público + rótulos de segmento)
- [x] T016 [P] [US2] Funções `listarNoticias` / `obterNoticia` em `frontend/src/site/api.ts`
- [x] T017 [US2] Em `frontend/src/site/rotas.ts`: `caminhoNoticia`, `noticiaDoCaminho`; reconhecer detalhe em `paginaDoCaminho` se necessário
- [x] T018 [US2] Reescrever `frontend/src/site/pages/Noticias.tsx`: API, loading/erro/vazio, card/`Ler mais` como Link, sem placeholders
- [x] T019 [US2] Criar `frontend/src/site/pages/NoticiaDetalhe.tsx` (conteúdo no idioma da página, indisponível, slug)
- [x] T020 [US2] Rotas de detalhe pt/en em `frontend/src/site/App.tsx` e troca de idioma preservando a notícia (`navegacao.ts` / cabeçalho)

**Checkpoint**: site mostra notícias reais com página própria.

---

## Phase 5: User Story 3 — MCP criar/listar/ver/editar (P1)

**Goal**: Claude conectado gerencia notícias sem despublicar/excluir.

**Independent Test**: quickstart passo 7.

- [x] T021 [US3] Em `backend/app/services/mcp_ferramentas.py`: handlers e `Ferramenta` para `listar_noticias`, `ver_noticia`, `criar_noticia`, `editar_noticia` (campos bilíngues; sem publicar/despublicar/excluir)
- [x] T022 [US3] Atualizar `INSTRUCOES` em `backend/app/api/routes/mcp_servidor.py` e contrato `specs/103-mcp-claude-desktop/contracts/mcp-ferramentas.md` (ou referência em `contracts/mcp-noticias.md`)
- [x] T023 [P] [US3] Estender `backend/scripts/smoke_mcp.py` com smoke mínimo de notícia (criar + listar), se o script existir

**Checkpoint**: MCP espelha o painel para CRUD de conteúdo (sem destruição).

---

## Phase 6: User Story 4 — Remoção dos placeholders (P2)

**Goal**: zero cards fixos no código da lista.

**Independent Test**: quickstart passo 1.

- [x] T024 [US4] Garantir remoção completa de `POSTS` / `RESUMO_PROVISORIO` em `Noticias.tsx` e ausência de dados fictícios em `dados/noticias.ts` (pode coincidir com T018)

---

## Phase 7: Polish

- [x] T025 [P] `python -m compileall -q app` no backend; `npx tsc --noEmit` no frontend
- [x] T026 Conferir auditoria e roteiro do [quickstart.md](./quickstart.md)
- [x] T027 [P] `npm run site:css` se houver classes Tailwind novas no site

---

## Dependencies

```text
T001 → T002–T005 → US1 (T006–T013) → US2 (T014–T020) → US3 (T021–T023)
                              ↘ US4 (T024, em geral junto com T018)
Polish (T025–T027) por último
```

**MVP**: Phase 2 + US1 + US2 (painel publica e site abre a página).

## Parallel examples

- Após T002: T003 ∥ T004 (schema e serviço)
- Após T007: T008 ∥ início do form
- US2: T015 ∥ T016 enquanto T014 no backend
- Polish: T025 ∥ T027

## Implementation strategy

1. Fundação (modelo + serviço)
2. MVP = painel + API pública + lista/detalhe no site
3. MCP
4. Validação quickstart
