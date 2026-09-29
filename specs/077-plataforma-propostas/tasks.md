# Tasks: Plataforma de Propostas (Proposal)

**Input**: Design documents from `/specs/077-plataforma-propostas/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec, então não há fase TDD. A validação é feita pelo [quickstart.md](./quickstart.md), incluindo a checagem de isolamento com `curl` (SC-001), mais `npm run lint`, `npm run type-check` e `npm run build`.

**Organization**: Infraestrutura multi-page e dependências (Setup) → acesso separado e bloqueio no servidor (Foundational) → US1 liberação e login próprio (MVP) → US2 criar proposta → US3 página pública e assinatura → US4 acompanhamento, cancelamento e expiração → Polish/deploy.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US4 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/` (`main.py`, `config.py`, `models/__init__.py`, `schemas.py`, `services/`, `api/routes/`)
- Frontend ERP: `frontend/src/` (`pages/`, `services/api.ts`, `types/index.ts`)
- Frontend Proposal: `frontend/src/proposal/` (não importa nada de `frontend/src/pages/`, `components/Layout.tsx`, `store/` nem `services/api.ts` do ERP)
- Contratos: `specs/077-plataforma-propostas/contracts/`
- **Não alterar**: portas (8001/5433/6380/5193); fallback `USUARIOS_DEV` do login do ERP (fora do escopo, ver research R4); regras de `permissoes` de página

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Segundo ponto de entrada do frontend, roteamento por domínio e dependências.

- [X] T001 [P] Adicionar `tzdata` em `backend/requirements.txt` (necessário para `zoneinfo("America/Sao_Paulo")` na imagem `python:3.11-slim`, research R7)
- [X] T002 [P] Criar `frontend/proposal.html` (lang `pt-BR`, título "Proposal · Ocean", favicon `/logo.png`, `<div id="root">`, script `/src/proposal/main.tsx`)
- [X] T003 Configurar multi-page e roteamento de dev em `frontend/vite.config.ts`: `build.rollupOptions.input = { main: 'index.html', proposal: 'proposal.html' }` e um plugin com `configureServer` que, quando o `Host` começa com `proposal.` e a requisição é de navegação (sem extensão de arquivo, fora de `/@`, `/src`, `/node_modules`, `/api`), reescreve `req.url` para `/proposal.html`. Manter `port: 5193` e `strictPort: true` (research R1, R2)
- [X] T004 [P] Incluir `"./proposal.html"` em `content` de `frontend/tailwind.config.js`
- [X] T005 [P] Criar `frontend/vercel.json` com `rewrites`: 1) `{ "source": "/(.*)", "has": [{ "type": "host", "value": "proposal.oceantalentsolutions.com" }], "destination": "/proposal.html" }`; 2) catch-all `{ "source": "/(.*)", "destination": "/index.html" }` (contrato [ui-proposal.md](./contracts/ui-proposal.md) §1)
- [X] T006 [P] Incluir `"http://proposal.localhost:5193"` em `_DEFAULT_CORS` de `backend/app/config.py`
- [X] T007 [P] Extrair `validarCNPJ` e `formatarCNPJ` de `frontend/src/pages/Fornecedores.tsx` para `frontend/src/utils/documento.ts` (exportadas) e importar de lá em `Fornecedores.tsx`, sem mudar comportamento (research R11)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Campos de acesso, claim `app` no token e bloqueio do ERP no servidor. Também o esqueleto do app do Proposal.

**⚠️ CRITICAL**: Nenhuma história começa antes desta fase.

- [X] T008 Adicionar `acesso_erp = Column(Boolean, nullable=False, default=True, server_default=text("true"))` e `acesso_proposal = Column(Boolean, nullable=False, default=False, server_default=text("false"))` ao modelo `UsuarioApp` em `backend/app/models/__init__.py` ([data-model.md](./data-model.md) §1)
- [X] T009 Em `_migrar()` de `backend/app/main.py`, no bloco transacional principal, adicionar `ALTER TABLE usuarios_app ADD COLUMN IF NOT EXISTS acesso_erp BOOLEAN NOT NULL DEFAULT TRUE` e `... acesso_proposal BOOLEAN NOT NULL DEFAULT FALSE`
- [X] T010 [P] Em `backend/app/schemas.py`: `UsuarioAppCreate` ganha `acesso_erp: bool = True` e `acesso_proposal: bool = False`; `UsuarioAppUpdate` ganha `acesso_erp: Optional[bool] = None` e `acesso_proposal: Optional[bool] = None`; `UsuarioAppResponse` ganha `acesso_erp: bool` e `acesso_proposal: bool`
- [X] T011 Em `backend/app/api/routes/auth.py`: login do ERP passa a emitir `app: "erp"` no JWT; criar helper `_exigir_app(payload, app)` que levanta 403 quando `payload.get("app", "erp") != app` (`detail` "Token não autorizado para o ERP" ou "Token não autorizado para o Proposal"); `get_current_user`, `get_current_papel` e `require_admin` passam a exigir `app == "erp"`; criar dependência `require_erp(token=Depends(oauth2_scheme))` com a mesma regra (contrato [api-erp-alteracoes.md](./contracts/api-erp-alteracoes.md) §1–2, research R3)
- [X] T012 Em `backend/app/api/routes/auth.py`, extrair a verificação de 2FA do `login` para um helper reutilizável `verificar_2fa(db, usuario, totp_code)` (mesmas mensagens `2FA_REQUIRED` e `Código 2FA inválido`) e usá-lo no login do ERP sem mudar o comportamento
- [X] T013 Em `backend/app/main.py`, incluir **todos** os routers do ERP, exceto `auth` (colaboradores, fornecedores, nfs, contas, bonus, ferias, dh, relatorios, auditoria, metas, documentos, alertas, configuracoes, saldos, impostos, historico, fluxo_movimentos, fluxo_transferencias, contas_correntes, patrimonio, arquivos_nfs e dev_wipe), com `dependencies=[Depends(require_erp)]`
- [X] T014 [P] Criar `frontend/src/proposal/services/proposalApi.ts`: instância Axios própria (`baseURL` = `import.meta.env.VITE_API_URL`), token na chave `proposal_access_token` do `localStorage`, interceptor de 401 que limpa a chave e redireciona para `/login` (exceto nas chamadas públicas); e uma segunda instância **sem** token para as rotas `/public/*` (research R5)
- [X] T015 [P] Criar `frontend/src/proposal/store.ts` com `useProposalAuthStore` (Zustand): `isAuthenticated`, `usuario`, `papel`, `login(token, usuario, papel)` e `logout()`, persistidos em `proposal_access_token`, `proposal_usuario` e `proposal_papel`
- [X] T016 [P] Criar `frontend/src/proposal/components/ProposalLayout.tsx`: cabeçalho com `/logo.png`, título "Proposal", usuário logado e botão "Sair" (limpa a store e vai para `/login`), área de conteúdo; sem nenhum link, menu ou texto do ERP (FR-007)
- [X] T017 Criar `frontend/src/proposal/main.tsx` (monta `App` com `index.css` e `React.StrictMode`) e `frontend/src/proposal/App.tsx` com `BrowserRouter`, `Toaster` e um `ProtectedRoute` que usa `useProposalAuthStore` e redireciona para `/login`; rotas iniciais: `/login` (placeholder) e `/` (placeholder dentro de `ProposalLayout`)

**Checkpoint**: `npm run dev` abre o ERP em `localhost:5193` sem regressão e o esqueleto do Proposal em `proposal.localhost:5193`; o ERP continua funcionando com tokens novos (`app: "erp"`) e antigos (sem claim).

---

## Phase 3: User Story 1 - Liberar acesso ao Proposal sem expor o ERP (Priority: P1) 🎯 MVP

**Goal**: O admin do ERP libera "Acesso ao ERP" e "Acesso ao Proposal" por usuário; o Proposal tem login próprio no seu domínio; nenhuma sessão do Proposal lê dados do ERP.

**Independent Test**: Seções 1, 2 e 3 do [quickstart.md](./quickstart.md): criar `vendedor1` só com Proposal, logar no Proposal (ok), no ERP (403) e rodar o loop de `curl` contra rotas do ERP (403 em todas).

### Implementation for User Story 1

- [X] T018 [US1] Em `login` de `backend/app/api/routes/auth.py`, depois da senha e do 2FA, recusar com 403 "Usuário sem acesso ao ERP" quando o usuário do banco tiver `acesso_erp = False` (contrato [api-erp-alteracoes.md](./contracts/api-erp-alteracoes.md) §1)
- [X] T019 [US1] Em `backend/app/api/routes/configuracoes.py`: `criar_usuario` grava `acesso_erp` e `acesso_proposal`; `atualizar_usuario` aplica os dois campos quando enviados e recusa com 400 "Não pode remover o próprio acesso ao ERP" quando o admin logado tenta `acesso_erp = False` em si mesmo (usar `require_admin` para obter o login atual)
- [X] T020 [US1] Criar `backend/app/api/routes/proposal_auth.py`: `POST /token` (form OAuth2 + `totp_code`; só usuários do banco com `ativo` e `acesso_proposal`, sem `USUARIOS_DEV` nem seed; usa `verificar_2fa`; JWT com `sub`, `uid`, `papel`, `app: "proposal"`); `GET /me`; e a dependência `get_proposal_user` que decodifica o token, exige `app == "proposal"` e recarrega o usuário no banco a cada requisição (403 "Usuário sem acesso ao Proposal" se inativo ou sem acesso), retornando `{id, usuario, papel}` (contrato [api-proposal.md](./contracts/api-proposal.md), research R4)
- [X] T021 [US1] Registrar `proposal_auth.router` em `backend/app/main.py` com `prefix="/api/proposal/auth"`, sem `require_erp`
- [X] T022 [P] [US1] Adicionar `acesso_erp: boolean` e `acesso_proposal: boolean` ao tipo de usuário em `frontend/src/types/index.ts` e aos payloads de `configuracoesService.criar`/`atualizar` em `frontend/src/services/api.ts`
- [X] T023 [US1] Em `frontend/src/pages/Configuracoes.tsx`: `FORM_INICIAL` com `acesso_erp: true` e `acesso_proposal: false`; no modal, seção "Ferramentas" com dois toggles ("Acesso ao ERP" e "Acesso ao Proposal"), separada das permissões de página e visível também para papel `admin`; enviar os campos no criar/editar; tabela com coluna "Ferramentas" mostrando badges "ERP"/"Proposal"; erros com o `detail` da API via toast (contrato [ui-proposal.md](./contracts/ui-proposal.md) §4)
- [X] T024 [US1] Criar `frontend/src/proposal/pages/Login.tsx`: logo + título "Proposal", usuário e senha, campo 2FA quando a API responde `2FA_REQUIRED` (mesmo fluxo de `frontend/src/components/Login.tsx`), `POST /proposal/auth/token` em `x-www-form-urlencoded`, grava a store e navega para `/`; toasts com o `detail`; nenhuma referência ao ERP
- [X] T025 [US1] Em `frontend/src/proposal/App.tsx`, trocar o placeholder de `/login` por `Login.tsx` (usuário já logado → `/`)
- [X] T026 [US1] Validar as seções 1, 2 e 3 do [quickstart.md](./quickstart.md): migração com defaults, toggles no ERP, matriz de login e loop de `curl` (403 em todas as rotas do ERP com token do Proposal; 403 em `/api/proposal/auth/me` com token do ERP; revogação imediata)

**Checkpoint**: Liberação pelo ERP, login próprio e isolamento funcionando: entregável sozinho.

---

## Phase 4: User Story 2 - Criar uma proposta e gerar o link (Priority: P1)

**Goal**: O usuário cria a proposta (cliente, CNPJ, valor, imposto opcional, validade) e copia o link público.

**Independent Test**: Seção 4 do [quickstart.md](./quickstart.md): criar com e sem imposto, conferir prévia e totais, erros de validação e link copiado.

**Depende de**: US1 (login do Proposal e `get_proposal_user`).

### Implementation for User Story 2

- [X] T027 [P] [US2] Criar os modelos `Proposta` e `PropostaAssinatura` em `backend/app/models/__init__.py`, conforme [data-model.md](./data-model.md) §2–3: `Numeric(14,2)`/`Numeric(5,2)`, `codigo` único, `criado_por_id` FK `ondelete="SET NULL"`, `proposta_id` único com `ondelete="CASCADE"`, CHECKs e índices; relação `Proposta.assinatura` (uselist=False)
- [X] T028 [US2] Em `_migrar()` de `backend/app/main.py`, adicionar `CREATE TABLE IF NOT EXISTS propostas (...)`, `CREATE TABLE IF NOT EXISTS propostas_assinaturas (...)` e os índices (`codigo` único; `(criado_por_id, emitida_em DESC)`; `status`), idênticos ao modelo
- [X] T029 [P] [US2] Em `backend/app/schemas.py`, criar `PropostaCreate` (`cliente_nome`, `cnpj`, `valor: Decimal`, `imposto_ativo: bool`, `aliquota: Optional[Decimal]`, `validade: Optional[date]`), `PropostaAssinaturaOut`, `PropostaOut` (detalhe completo, decimais serializados como string com 2 casas), `PropostaListItem` e `PropostaListResponse` (contrato [api-proposal.md](./contracts/api-proposal.md))
- [X] T030 [US2] Criar `backend/app/services/propostas.py` com: `TZ_SP`; `hoje_sp()`; `validade_padrao()` (hoje + 30); `calcular_valores(valor, imposto_ativo, aliquota)` com `Decimal` e `ROUND_HALF_UP`; `gerar_codigo()` (`secrets.token_urlsafe(24)`); `conteudo_canonico(p)` + `calcular_hash(p)` (SHA-256, [data-model.md](./data-model.md) §4); `status_efetivo(p, agora=None)` (expirada após 23:59:59 SP da validade); `pode_ver(p, user)` (admin ou dono); `validar_criacao(payload)` reaproveitando `validar_cnpj`/`normalizar_cnpj` de `backend/app/services/documento.py` e devolvendo as mensagens 422 do contrato
- [X] T031 [US2] Criar `backend/app/api/routes/proposal_propostas.py` com `POST /` (valida, calcula, gera código único, grava hash e `criado_por_id`/`criado_por_usuario`, 201 com `PropostaOut`) e `GET /{id}` (404 "Proposta não encontrada" se inexistente ou se `pode_ver` for falso; **não** marca visualização; `status` = status efetivo; `assinatura` incluída quando houver), ambos com `Depends(get_proposal_user)`
- [X] T032 [US2] Registrar `proposal_propostas.router` em `backend/app/main.py` com `prefix="/api/proposal/propostas"`, sem `require_erp`
- [X] T033 [P] [US2] Criar `frontend/src/proposal/utils/propostaCalculo.ts`: parse de moeda BR para centavos, alíquota em centésimos, `calcularImpostoCentavos` com arredondamento half-up em inteiros, `formatarMoeda`, `validadePadrao()` (hoje + 30 em `YYYY-MM-DD`) e `montarLinkPublico(codigo)` com `VITE_PROPOSAL_PUBLIC_URL || window.location.origin` (research R10, R15)
- [X] T034 [P] [US2] Em `frontend/src/proposal/services/proposalApi.ts`, adicionar os tipos `Proposta`/`PropostaListItem` e as funções `criarProposta(payload)` e `obterProposta(id)`
- [X] T035 [US2] Criar `frontend/src/proposal/pages/Nova.tsx`: campos Nome do cliente, CNPJ (máscara com `formatarCNPJ`, validação com `validarCNPJ` de `frontend/src/utils/documento.ts`), Valor (R$), toggle "Incluir imposto" → Alíquota (%), Validade (padrão hoje + 30); resumo ao vivo (valor, imposto e total, linhas de imposto só com o toggle ligado); erros por campo espelhando a API; ao confirmar, mostra o link com "Copiar link" (Clipboard API + toast), "Ver proposta" e "Nova proposta"; suporte a `?copiar={id}` pré-preenchendo a partir de `obterProposta` (contrato [ui-proposal.md](./contracts/ui-proposal.md) §3.3)
- [X] T036 [US2] Criar `frontend/src/proposal/pages/Detalhe.tsx` (versão base): carrega `obterProposta(id)`, mostra dados, valores, status, emissão e validade; ações "Copiar link", "Abrir página do cliente" (nova aba) e "Criar cópia" (`/nova?copiar={id}`); spinner `animate-spin` no carregamento; 404 → mensagem "Proposta não encontrada"
- [X] T037 [US2] Em `frontend/src/proposal/App.tsx`, adicionar `/nova` e `/propostas/:id` protegidas dentro de `ProposalLayout`; enquanto a US4 não existir, `/` redireciona para `/nova`
- [X] T038 [US2] Validar a seção 4 do [quickstart.md](./quickstart.md) (prévia 10.000 + 14,53% = 11.453,00; erros; link com 32 caracteres; imutabilidade; criar cópia)

**Checkpoint**: Propostas criadas e links gerados, com valores idênticos entre prévia e backend.

---

## Phase 5: User Story 3 - Cliente abre o link e assina (Priority: P1)

**Goal**: A página pública mostra a proposta sem login e permite assinar uma única vez, com evidências.

**Independent Test**: Seção 5 do [quickstart.md](./quickstart.md): abrir em janela anônima, assinar, recarregar, testar links inválidos e duas abas assinando ao mesmo tempo.

**Depende de**: US2 (propostas existentes).

### Implementation for User Story 3

- [X] T039 [US3] Em `backend/app/services/propostas.py`, adicionar `ip_origem(request)` (1º endereço de `X-Forwarded-For`, fallback `request.client.host`), `serializar_publica(p)` (formatos `aguardando`/`visualizada`/`assinada`/`cancelada`/`expirada` de [api-public.md](./contracts/api-public.md), sem `id`, criador nem dados do ERP; em `cancelada`/`expirada` só `status`, `pode_assinar` e `mensagem`) e `validar_assinatura(payload)` (nome ≥ 3, e-mail via `validar_email` de `services/documento.py`, `aceite is True`)
- [X] T040 [US3] Criar `backend/app/api/routes/public_propostas.py` com `GET /{codigo}`: 404 com corpo idêntico para código inexistente; `UPDATE` condicional que grava `visualizada_em` e passa `aguardando` → `visualizada` só quando `visualizada_em IS NULL`; resposta via `serializar_publica` (research R9)
- [X] T041 [US3] Em `backend/app/api/routes/public_propostas.py`, adicionar `POST /{codigo}/assinar` numa transação: valida o payload (422); recalcula o hash e compara com `conteudo_hash` (409 se divergir); `UPDATE propostas SET status='assinada', assinada_em=now() WHERE id=:id AND status IN ('aguardando','visualizada') AND validade >= hoje_sp()`; se `rowcount == 0`, devolve 409 com o motivo (já assinada, não disponível, expirada); insere `PropostaAssinatura` (nome, e-mail em minúsculas, aceite, IP, user-agent truncado em 500, hash); commit; 200 com o estado `assinada` (research R8)
- [X] T042 [US3] Registrar `public_propostas.router` em `backend/app/main.py` com `prefix="/api/public/propostas"`, **sem** nenhuma dependência de autenticação
- [X] T043 [P] [US3] Em `frontend/src/proposal/services/proposalApi.ts`, adicionar `consultarPublica(codigo)` e `assinarPublica(codigo, {nome, email, aceite})` usando a instância **sem** token
- [X] T044 [US3] Criar `frontend/src/proposal/pages/PropostaPublica.tsx`: layout próprio, mobile-first, com a identidade Ocean (logo e cores `ocean-*`); carregamento em tela cheia com "Carregando proposta…"; estado pendente (dados, linhas de imposto só quando houver, validade, botão **Assinar** → nome completo, e-mail e checkbox "Li e aceito os termos desta proposta"); estado assinado ("Assinada em {data} por {nome}", sem botão); cancelada/expirada (só a `mensagem`); 404 ("Proposta não encontrada"); em 409, recarregar o estado e mostrar a mensagem (contrato [ui-proposal.md](./contracts/ui-proposal.md) §3.5)
- [X] T045 [US3] Em `frontend/src/proposal/App.tsx`, adicionar `/p/:codigo` **fora** do `ProtectedRoute` e do `ProposalLayout`
- [X] T046 [US3] Validar a seção 5 do [quickstart.md](./quickstart.md) (janela anônima, 375 px, valores idênticos, validações, links inválidos com a mesma resposta, concorrência em duas abas)

**Checkpoint**: Ciclo completo de ponta a ponta: criar, enviar, cliente assinar.

---

## Phase 6: User Story 4 - Acompanhar o status das propostas (Priority: P2)

**Goal**: Lista com status e filtro, detalhe com visualização e assinatura, cancelamento e expiração; visibilidade por dono ou `admin`.

**Independent Test**: Seções 6 e 7 do [quickstart.md](./quickstart.md): visualização, assinatura, cancelamento, expiração simulada no banco e visibilidade entre usuários.

**Depende de**: US2 (e US3 para os estados Visualizada/Assinada).

### Implementation for User Story 4

- [X] T047 [US4] Em `backend/app/api/routes/proposal_propostas.py`, adicionar `GET /` com `status` opcional (filtro pelo status **efetivo**: `expirada` = persistido em `aguardando`/`visualizada` e `validade < hoje_sp()`; `aguardando`/`visualizada` excluem as vencidas), `page`/`page_size` (padrão 50, máx. 200), ordenação por `emitida_em` desc e visibilidade (admin vê todas; demais só `criado_por_id = user.id`); resposta `PropostaListResponse` com `criado_por_usuario`
- [X] T048 [US4] Em `backend/app/api/routes/proposal_propostas.py`, adicionar `POST /{id}/cancelar`: 404 se inexistente ou não visível; 409 "Proposta não pode ser cancelada" se o status efetivo não for `aguardando`/`visualizada`; grava `status='cancelada'` e `cancelada_em`; retorna `PropostaOut`
- [X] T049 [P] [US4] Em `frontend/src/proposal/services/proposalApi.ts`, adicionar `listarPropostas({status, page})` e `cancelarProposta(id)`
- [X] T050 [US4] Criar `frontend/src/proposal/pages/Lista.tsx`: botão "Nova proposta"; filtro de status (Todas, Aguardando assinatura, Visualizada, Assinada, Cancelada, Expirada); colunas Cliente, CNPJ, Total, Emissão, Validade, Status (badge), "Criado por" (só quando `papel === 'admin'`) e Ações (Copiar link, Ver); estados de carregamento (spinner), vazio ("Nenhuma proposta ainda") e erro (toast)
- [X] T051 [US4] Completar `frontend/src/proposal/pages/Detalhe.tsx`: datas de 1ª visualização e cancelamento; bloco "Assinatura" (nome, e-mail, data e hora, IP, navegador, hash) quando assinada; botão "Cancelar" só em `aguardando`/`visualizada`, com `window.confirm`, chamando `cancelarProposta` e atualizando a tela
- [X] T052 [US4] Em `frontend/src/proposal/App.tsx`, trocar o redirecionamento de `/` por `Lista.tsx` (protegida, dentro do `ProposalLayout`) e adicionar `*` → `/`
- [X] T053 [US4] Validar as seções 6 e 7 do [quickstart.md](./quickstart.md) (detalhe não conta visualização; Visualizada após abrir o link; cancelamento; expiração via `UPDATE` no banco de dev, inclusive com a página aberta antes; 404 para proposta alheia; admin vê todas; excluir o usuário criador mantém as propostas)

**Checkpoint**: Todas as histórias funcionando de forma independente.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Configuração de deploy, qualidade estática, regressão e segurança em produção.

- [X] T054 [P] Atualizar `.env.deploy.example`: `CORS_ORIGINS` com `https://proposal.oceantalentsolutions.com`; `VITE_PROPOSAL_PUBLIC_URL=https://proposal.oceantalentsolutions.com` na seção do Vercel; nota sobre adicionar o domínio no Vercel e rodar o RLS; itens novos no CHECKLIST. Sem valores secretos
- [X] T055 [P] Confirmar que nenhum arquivo em `frontend/src/proposal/` importa de `frontend/src/pages/`, `frontend/src/components/Layout.tsx`, `frontend/src/store/` ou `frontend/src/services/api.ts` (busca por imports) e que `dist/assets` do Proposal não contém nomes de páginas do ERP após o build
- [X] T056 Rodar `npm run lint`, `npm run type-check` e `npm run build` em `frontend/`; confirmar `dist/index.html` e `dist/proposal.html` — build OK com os dois HTMLs; `type-check` sem erros nos arquivos da feature (restam 3 erros preexistentes em `pages/Dashboard.tsx`, tipagem do Recharts); `lint` não roda porque o projeto não tem configuração do ESLint (preexistente)
- [X] T057 Executar a seção 8 do [quickstart.md](./quickstart.md) (regressão do ERP com `admin` e `visualizador`; token antigo sem claim continua válido)
- [ ] T058 Executar a seção 9 do [quickstart.md](./quickstart.md) em produção: domínio no Vercel + CNAME, `VITE_PROPOSAL_PUBLIC_URL`, `CORS_ORIGINS` no Render, `backend/scripts/enable_rls_supabase.sql` reexecutado com RLS ativo em `propostas` e `propostas_assinaturas`, e a seção 3 (isolamento) repetida contra a URL de produção

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende do Setup (T003/T002 para o esqueleto do app); **bloqueia todas as histórias**.
- **US1 (Phase 3)**: depende da Foundational.
- **US2 (Phase 4)**: depende da US1 (login do Proposal e `get_proposal_user`, T020/T024).
- **US3 (Phase 5)**: depende da US2 (propostas e serviço `propostas.py`).
- **US4 (Phase 6)**: depende da US2; os estados Visualizada/Assinada ficam testáveis de verdade depois da US3.
- **Polish (Phase 7)**: depende das histórias desejadas.

### Dentro de cada história

- Modelos → migração → schemas → serviço → rotas → registro no `main.py` → serviço do frontend → telas → rota no `App.tsx` → validação.
- Tarefas no mesmo arquivo são sequenciais: `backend/app/main.py` (T009, T013, T021, T028, T032, T042), `auth.py` (T011, T012, T018), `proposal_propostas.py` (T031, T047, T048), `public_propostas.py` (T040, T041), `proposalApi.ts` (T014, T034, T043, T049), `App.tsx` (T017, T025, T037, T045, T052), `Detalhe.tsx` (T036, T051).

### Parallel Opportunities

- **Setup**: T001, T002, T004, T005, T006 e T007 em paralelo; T003 isolada (`vite.config.ts`).
- **Foundational**: T010, T014, T015 e T016 em paralelo com a sequência do backend (T008 → T009 → T011 → T012 → T013).
- **US1**: T022 (tipos do ERP) em paralelo com o backend (T018–T021).
- **US2**: T027, T029, T033 e T034 em paralelo; depois T030 → T031 → T032 e, no frontend, T035/T036.
- **US3**: T043 em paralelo com o backend (T039–T042).
- **US4**: T049 em paralelo com T047/T048.
- **Polish**: T054 e T055 em paralelo.

---

## Parallel Example: User Story 2

```bash
# Backend e frontend em paralelo, arquivos diferentes:
Task: "T027 Criar modelos Proposta e PropostaAssinatura em backend/app/models/__init__.py"
Task: "T029 Criar schemas Proposta* em backend/app/schemas.py"
Task: "T033 Criar frontend/src/proposal/utils/propostaCalculo.ts"
Task: "T034 Adicionar criarProposta/obterProposta em frontend/src/proposal/services/proposalApi.ts"
```

## Parallel Example: User Story 1

```bash
Task: "T020 Criar backend/app/api/routes/proposal_auth.py"
Task: "T022 Tipos de acesso em frontend/src/types/index.ts e frontend/src/services/api.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 (Setup) + Phase 2 (Foundational).
2. Phase 3 (US1): liberação no ERP, login do Proposal e isolamento.
3. **PARAR e VALIDAR**: seção 3 do quickstart (loop de `curl`), com 403 em todas as rotas do ERP. Esse é o requisito de segurança que sustenta a ferramenta.
4. Pode ir para produção sozinho (usuários conseguem logar no Proposal, ainda sem propostas).

### Incremental Delivery

1. Setup + Foundational → fundação pronta, ERP sem regressão.
2. US1 → isolamento validado.
3. US2 → propostas e links.
4. US3 → assinatura do cliente (**primeiro ciclo de negócio completo**).
5. US4 → lista, cancelamento e expiração.
6. Polish → deploy com o domínio `proposal.oceantalentsolutions.com`.

### Quando o HTML de referência chegar

Rodar `/speckit-clarify` para encaixar os campos definitivos. O impacto esperado se concentra em `Proposta` (modelo + `_migrar()`), `PropostaCreate`/`PropostaOut`, `conteudo_canonico`, `Nova.tsx` e `PropostaPublica.tsx`.

---

## Notes

- [P] = arquivos diferentes, sem dependência incompleta.
- Commits por tarefa ou grupo lógico; parar em cada checkpoint para validar a história.
- Nunca incluir segredos em código, commits ou artefatos (constitution).
- Manter o padrão das páginas: toast para feedback, spinner `animate-spin`, `window.confirm` antes de cancelar.
