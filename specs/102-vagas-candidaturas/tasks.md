# Tasks: Vagas cadastradas no painel do consultor e candidatura pelo site

**Input**: Documentos de design em `/specs/102-vagas-candidaturas/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados na spec; validação por verificações estáticas e roteiro do [quickstart.md](./quickstart.md).

**Organization**: Tarefas agrupadas por user story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[Story]**: user story da spec (US1…US5)

---

## Phase 1: Setup

- [X] T001 Adicionar `SHEETS_WEBHOOK_URL` e `SHEETS_WEBHOOK_SECRET` (padrão vazio) e `http://site.localhost:5193` nos CORS de dev em `backend/app/config.py`

---

## Phase 2: Foundational (bloqueia todas as histórias)

- [X] T002 Criar modelos `Vaga` e `Candidatura` (colunas, CHECKs de status/área/nível, FKs, índices) conforme data-model.md em `backend/app/models/__init__.py`
- [X] T003 Criar `backend/app/services/vagas.py`: dicionários de áreas, níveis, inglês, disponibilidade e mobilidade (rótulos pt), `slug_titulo`, `validar_vaga` (obrigatórios, tamanhos, cliente obrigatório sem código, código normalizado), `pode_alterar(vaga, user)`, `serializar_painel`, `serializar_publica` (sem cliente/código/autor)
- [X] T004 Adicionar schema `VagaIn` em `backend/app/schemas.py`
- [X] T005 Em `backend/app/main.py` (`_migrar`): habilitar RLS em `vagas` e `candidaturas`
- [X] T006 [P] Em `backend/app/services/anexo_nf.py`: `validar`/`gravar` com `extensoes` e `max_bytes` opcionais (padrões atuais), mensagens de formato/tamanho derivadas, `.doc`/`.docx` em `MEDIA_TYPE`
- [X] T007 [P] Em `frontend/src/site/dados/vagas.ts`: remover a lista fixa `VAGAS`; manter `AREAS`/`NIVEIS`; tipo `Vaga` passa a ser o da API pública (texto simples); adicionar rótulos pt/en de inglês, disponibilidade e mobilidade

**Checkpoint**: banco e serviços base prontos.

---

## Phase 3: User Story 1 — Consultor publica uma vaga pelo painel (P1) 🎯 MVP

**Goal**: menu "Vagas" no painel com lista, criação, detalhe, edição, encerrar/reabrir e excluir.

**Independent Test**: quickstart passos 2, 3, 8 (painel) e 9.

- [X] T008 [US1] Criar `backend/app/api/routes/proposal_vagas.py`: listar (filtros `status`, `busca`; contagens de candidaturas), obter, criar, editar, encerrar, reabrir, excluir (409 com candidaturas), com `get_proposal_user`, permissão autor/admin e `registrar_auditoria`
- [X] T009 [US1] Registrar o roteador em `backend/app/main.py` com prefixo `/api/proposal/vagas`
- [X] T010 [P] [US1] Tipos e funções de vagas (listar, obter, criar, editar, encerrar, reabrir, excluir) em `frontend/src/proposal/services/proposalApi.ts`
- [X] T011 [US1] Criar `frontend/src/proposal/components/VagaForm.tsx` (campos da vaga, textareas com "um item por linha", erros por campo, cliente obrigatório sem código)
- [X] T012 [US1] Criar `frontend/src/proposal/pages/Vagas.tsx` (lista com filtro de status e busca, contagem de candidaturas, autor, status, botão "Nova vaga")
- [X] T013 [US1] Criar `frontend/src/proposal/pages/VagaEditor.tsx` (nova/editar, usa `VagaForm`, toast e volta ao detalhe)
- [X] T014 [US1] Criar `frontend/src/proposal/pages/VagaDetalhe.tsx` (dados da vaga, link "Ver no site", ações editar/encerrar/reabrir/excluir só com `pode_editar`, `window.confirm`)
- [X] T015 [US1] Rotas `/vagas`, `/vagas/nova`, `/vagas/:id`, `/vagas/:id/editar` em `frontend/src/proposal/App.tsx` e menu "Vagas" em `frontend/src/proposal/components/ProposalLayout.tsx`

**Checkpoint**: vagas gerenciáveis no painel.

---

## Phase 4: User Story 2 — Candidato vê a página da vaga (P1)

**Goal**: site lista as vagas abertas da API e abre a página da vaga com todos os pré-requisitos.

**Independent Test**: quickstart passos 4 e 8 (site).

- [X] T016 [US2] Criar `backend/app/api/routes/public_vagas.py` com `GET /` (abertas) e `GET /{id}` (404 "Vaga não disponível") e registrar em `backend/app/main.py` com prefixo `/api/public/vagas`
- [X] T017 [P] [US2] Criar `frontend/src/site/api.ts` (`listarVagas`, `obterVaga`, `enviarCandidatura` com `fetch` e `VITE_API_URL`)
- [X] T018 [US2] Em `frontend/src/site/rotas.ts`: `caminhoVaga(vaga, idioma)`, `vagaDoCaminho(caminho)` (id e idioma) e `paginaDoCaminho` reconhecendo `/vagas/<slug>` como página "vagas"
- [X] T019 [US2] Reescrever `frontend/src/site/pages/Vagas.tsx`: busca na API com carregando/erro/vazio, filtros existentes, card inteiro como link para a página da vaga ("Ver vaga")
- [X] T020 [US2] Criar `frontend/src/site/pages/VagaDetalhe.tsx` (cabeçalho, descrição em parágrafos, listas de responsabilidades/pré-requisitos/diferenciais, vaga indisponível, correção do slug, título da aba, botão "Candidatar-me" para `#candidatura`)
- [X] T021 [US2] Rotas da página da vaga (pt/en) em `frontend/src/site/App.tsx` e troca de idioma preservando a vaga em `frontend/src/site/navegacao.ts`/`Cabecalho.tsx`

**Checkpoint**: site mostra vagas reais com página própria.

---

## Phase 5: User Story 3 — Candidatura chega à planilha (P1)

**Goal**: formulário completo grava a candidatura e a envia à planilha.

**Independent Test**: quickstart passos 5 e 6.

- [X] T022 [US3] Criar `backend/app/services/planilha_candidaturas.py`: `montar_payload(candidatura)`, `enviar(db, candidatura)` (httpx, `follow_redirects`, grava enviada/erro/tentativas), `enviar_em_segundo_plano(candidatura_id)` com sessão própria
- [X] T023 [US3] `POST /{id}/candidaturas` em `backend/app/api/routes/public_vagas.py` (multipart, campo isca, validação com erros por campo em 422, vaga aberta, grava candidatura + currículo via `anexo_nf.gravar` com prefixo `curriculos`, PDF/DOC/DOCX até 5 MB, `BackgroundTasks`)
- [X] T024 [US3] Criar `frontend/src/site/components/FormularioCandidatura.tsx` (campos obrigatórios/opcionais, listas, arquivo, consentimento LGPD, campo isca oculto, validação pt/en, erros da API por campo, confirmação e limpeza)
- [X] T025 [US3] Usar o formulário na página da vaga (`frontend/src/site/pages/VagaDetalhe.tsx`) e remover `frontend/src/site/components/ModalInteresse.tsx`

**Checkpoint**: candidaturas gravadas e enviadas.

---

## Phase 6: User Story 4 — Consultor acompanha candidaturas (P2)

**Goal**: candidaturas no detalhe da vaga, currículo protegido e reenvio à planilha.

**Independent Test**: quickstart passos 6 (reenvio) e 7.

- [X] T026 [US4] Em `backend/app/api/routes/proposal_vagas.py`: `GET /{id}/candidaturas`, `POST /{id}/reenviar-planilha`, `GET /candidaturas/{id}/curriculo` (via `anexo_nf.resposta_inline`)
- [X] T027 [P] [US4] Tipos e funções de candidaturas (listar, reenviar, baixar currículo como blob) em `frontend/src/proposal/services/proposalApi.ts`
- [X] T028 [US4] Seção "Candidaturas" em `frontend/src/proposal/pages/VagaDetalhe.tsx` (tabela, status Enviada/Pendente com erro, "Currículo", "Reenviar à planilha")
- [X] T029 [US4] Criar `frontend/src/proposal/pages/CurriculoAbrir.tsx`, rota `/candidaturas/:id/curriculo` em `frontend/src/proposal/App.tsx`, e retorno ao destino após login (`ProtectedRoute` guarda o caminho; `frontend/src/proposal/pages/Login.tsx` navega para ele)

---

## Phase 7: User Story 5 — Vagas de exemplo migradas (P3)

**Independent Test**: quickstart passo 1.

- [X] T030 [US5] Em `backend/app/main.py` (`_migrar`): inserir as 5 vagas (textos pt atuais do site, autor `sistema`, cliente "Confidencial") uma única vez, controlado pela chave `seed_vagas_102` em `configuracao_app`

---

## Phase 8: Polish

- [X] T031 Recompilar o CSS do site (`npm run site:css` em `frontend/`) para as classes novas
- [X] T032 Verificações estáticas: `python -m compileall -q app` (backend), `npx tsc --noEmit` e `npx vite build` (frontend)
- [X] T033 Validar o fluxo com a API local (criar vaga, página pública, candidatura, pendente sem planilha, currículo) conforme quickstart.md

---

## Dependencies & Execution Order

- Setup (T001) → Foundational (T002–T007) → histórias.
- US1 (T008–T015) e US2 (T016–T021) dependem só da fase 2; US2 precisa de vagas no banco (US1 ou US5) para o teste manual.
- US3 depende de US2 (página da vaga) e de T006.
- US4 depende de US1 (detalhe da vaga) e US3 (candidaturas existentes).
- US5 depende só de T002.
- Polish no fim.

### Parallel Opportunities

- T006 e T007 em paralelo com T002–T005.
- T010 (API do painel) em paralelo com T008; T017 em paralelo com T016; T027 em paralelo com T026.

## Implementation Strategy

1. MVP: Fases 1–3 (vagas no painel) + Fase 4 (site) — já substitui a lista fixa.
2. Fase 5 (candidatura + planilha) — objetivo de negócio principal.
3. Fases 6–7 (acompanhamento e migração), depois Polish.
