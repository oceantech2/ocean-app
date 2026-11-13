# Tasks: Claude Desktop conectado ao Consultant Panel (MCP)

**Input**: Documentos de design em `/specs/103-mcp-claude-desktop/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados na spec; validação por verificações estáticas, script de fumaça do fluxo OAuth + MCP contra a API local e roteiro do [quickstart.md](./quickstart.md).

**Organization**: Tarefas agrupadas por user story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[Story]**: user story da spec (US1…US4)

---

## Phase 1: Setup

- [X] T001 Adicionar `MCP_PUBLIC_URL` (padrão `http://localhost:8001`) e `MCP_REDIRECT_URIS` (CSV, padrão vazio) e os helpers `mcp_base_url()`, `mcp_resource_url()` e `mcp_redirect_uris_extra()` em `backend/app/config.py`

---

## Phase 2: Foundational (bloqueia todas as histórias)

- [X] T002 Criar modelos `McpCliente`, `McpConexao` e `McpToken` (colunas, FKs com CASCADE, CHECK de `tipo`, índices) conforme data-model.md em `backend/app/models/__init__.py`
- [X] T003 Em `backend/app/main.py` (`_migrar`): habilitar RLS em `mcp_clientes`, `mcp_conexoes` e `mcp_tokens` com log de falha (padrão da feature 102)
- [X] T004 [P] Em `backend/app/services/audit.py`: `ContextVar` de origem (`origem_auditoria`) e acréscimo de ` · via {origem}` à descrição em `registrar_auditoria` quando definido
- [X] T005 Criar `backend/app/services/mcp_auth.py`: hash SHA-256, validação de `redirect_uri` (Claude, loopback, extras), registro de cliente, autenticação do cliente no token (none/post/basic), PKCE S256, pedido assinado (emitir/ler), emissão de código e de refresh (hash, validade), consumo atômico, rotação com detecção de reuso, emissão do JWT de acesso (`app="mcp"`, `aud`, `cx`), validação do token por requisição (conexão + usuário) com atualização limitada de `ultimo_uso_em`, revogação de conexão, listagem das conexões ativas do usuário

**Checkpoint**: banco, auditoria e núcleo de autenticação prontos.

---

## Phase 3: User Story 1 — Consultor conecta o Claude Desktop (P1) 🎯 MVP

**Goal**: descoberta OAuth, registro, autorização pelo painel, tokens, revogação, endpoint MCP autenticado e seção "Claude" no Perfil.

**Independent Test**: quickstart passos 1, 2 e 4.

- [X] T006 [US1] Criar `backend/app/api/routes/mcp_oauth.py`: roteador raiz com `/.well-known/oauth-protected-resource` (+ `/api/mcp`) e `/.well-known/oauth-authorization-server`; roteador `/api/mcp/oauth` com `register`, `authorize` (erro HTML para cliente/redirect inválido, redirecionamento com erro para os demais, redirecionamento para `/conectar-claude`), `token` (authorization_code e refresh_token, `Cache-Control: no-store`), `revoke`, `pedido` e `consentir` (com `get_proposal_user`, auditoria `conectar`); roteador `/api/mcp/conexoes` (listar, revogar com auditoria `desconectar`)
- [X] T007 [US1] Criar `backend/app/api/routes/mcp_servidor.py`: `POST /api/mcp` (autenticação Bearer com `WWW-Authenticate` + `resource_metadata`, JSON-RPC individual e em lote, `initialize` com negociação de versão e `instructions` em pt-BR, `ping`, `tools/list`, `tools/call` delegando a `mcp_ferramentas`, notificações → 202, erros -32700/-32600/-32601/-32602), `GET`/`DELETE` → 405
- [X] T008 [US1] Criar `backend/app/services/mcp_ferramentas.py` com o registro de ferramentas (estrutura: nome, título, descrição, `inputSchema`, anotações, função), execução com conversão de `HTTPException`/erros de argumento em `isError`, origem de auditoria "Claude" durante a chamada e geração dos links (`link_painel`, `link_cliente`, `link_curriculo`)
- [X] T009 [US1] Registrar em `backend/app/main.py` os roteadores well-known (sem prefixo), `/api/mcp/oauth`, `/api/mcp/conexoes` e o servidor `/api/mcp`
- [X] T010 [P] [US1] Tipos e funções `obterPedidoClaude`, `responderPedidoClaude`, `listarConexoesClaude`, `desconectarClaude` em `frontend/src/proposal/services/proposalApi.ts`
- [X] T011 [US1] Criar `frontend/src/proposal/pages/ConectarClaude.tsx`: carrega o pedido, mostra aplicativo, usuário e o que o Claude poderá fazer, botões "Permitir"/"Cancelar", navega para `redirect_url`; estado de pedido expirado com orientação; spinner e toast
- [X] T012 [US1] Rota protegida `/conectar-claude` em `frontend/src/proposal/App.tsx`
- [X] T013 [US1] Seção "Claude" em `frontend/src/proposal/pages/Perfil.tsx`: endereço do conector com "Copiar", instruções curtas, lista de conexões (aplicativo, conectado em, último uso) e "Desconectar" com `window.confirm`

**Checkpoint**: Claude conecta, lista ferramentas e é desconectado pelo painel.

---

## Phase 4: User Story 2 — Consultas pelo Claude (P1)

**Goal**: ferramentas somente leitura de propostas, modelos, vagas e candidaturas.

**Independent Test**: quickstart passo 3 (itens de listagem/consulta).

- [X] T014 [US2] Em `backend/app/services/mcp_ferramentas.py`: `listar_propostas` (todos os filtros, página de 50, `link_painel`) e `ver_proposta` (`link_painel`, `link_cliente`) sobre `proposal_propostas`
- [X] T015 [US2] Em `backend/app/services/mcp_ferramentas.py`: `listar_modelos` e `ver_modelo` sobre `proposal_modelos`
- [X] T016 [US2] Em `backend/app/services/mcp_ferramentas.py`: `listar_vagas`, `ver_vaga` e `listar_candidaturas` (com `link_curriculo` e resumo da vaga) sobre `proposal_vagas`

**Checkpoint**: consultas equivalentes ao painel.

---

## Phase 5: User Story 3 — Criar e editar propostas pelo Claude (P1)

**Goal**: criação com consultor do perfil e edição parcial por mesclagem.

**Independent Test**: quickstart passo 3 (itens de criar/editar proposta).

- [X] T017 [US3] Em `backend/app/services/mcp_ferramentas.py`: `criar_proposta` (schema com enums de modelo, setor, idioma, moeda, tipos de investimento; consultor do `PerfilConsultor` quando omitido; `PropostaCreate`; auditoria `criar` em `Proposta`; links)
- [X] T018 [US3] Em `backend/app/services/mcp_ferramentas.py`: `editar_proposta` (recusa proposta simples; mescla campos informados sobre o detalhe atual; `editar_proposta` da rota; auditoria `editar` quando `alterada`; links)

**Checkpoint**: propostas criadas e editadas por conversa com as regras do painel.

---

## Phase 6: User Story 4 — Criar e editar vagas pelo Claude (P2)

**Goal**: criação e edição parcial de vagas.

**Independent Test**: quickstart passo 3 (itens de vaga).

- [X] T019 [US4] Em `backend/app/services/mcp_ferramentas.py`: `criar_vaga` e `editar_vaga` (schema com enums de área e nível; mesclagem parcial sobre a vaga atual; `VagaIn`; links)

**Checkpoint**: vagas criadas e editadas por conversa.

---

## Phase 7: Polish & Cross-Cutting

- [X] T020 [P] Documentar `MCP_PUBLIC_URL` e `MCP_REDIRECT_URIS` em `.env.deploy.example` (seção do backend) e o endereço do conector
- [X] T021 [P] Atualizar `CLAUDE.md` com a seção do conector MCP (endpoint, variáveis, como testar)
- [X] T022 Validação estática: `python -m compileall -q backend/app`, `npx tsc --noEmit` e `npx vite build` em `frontend/`
- [X] T023 Script de fumaça em `backend/scripts/smoke_mcp.py` (registro → authorize → consentir com token do Proposal → token → initialize → tools/list → tools/call de leitura → refresh → reuso de refresh revoga → isolamento de tokens) e execução contra a API local

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational (T002–T005)** → **US1 (T006–T013)**.
- **US2, US3, US4** dependem de T008 (registro de ferramentas) e podem seguir em qualquer ordem; todas editam `mcp_ferramentas.py`, então são sequenciais entre si.
- Frontend (T010–T013) depende só dos contratos; pode rodar em paralelo ao backend da US1.
- **Polish** após as histórias.

### Parallel Opportunities

- T004 em paralelo a T002/T003.
- T010 em paralelo a T006–T009.
- T020 e T021 em paralelo entre si.

## Implementation Strategy

- **MVP**: Phases 1–3 + US2 (conectar e consultar) já entregam valor sem risco de escrita.
- **Incremento 2**: US3 (propostas por conversa), principal ganho de produtividade.
- **Incremento 3**: US4 (vagas).
