# Research: Claude Desktop conectado ao Consultant Panel (MCP)

## 1. Implementação do protocolo MCP

- **Decision**: Implementar no FastAPI o subconjunto do transporte Streamable HTTP em modo sem sessão: `POST /api/mcp` recebe uma mensagem JSON-RPC 2.0 (ou um lote, por compatibilidade com 2025-03-26) e responde `application/json`; notificações e respostas recebem `202` sem corpo; `GET` e `DELETE` respondem `405` (sem fluxo SSE nem sessão). Métodos: `initialize`, `ping`, `tools/list`, `tools/call`; demais → erro `-32601`.
- **Rationale**: O SDK oficial `mcp` 2.3 exige `pydantic>=2.12`, `uvicorn>=0.31.1`, `python-multipart>=0.0.9`, `httpx2`, `sse-starlette>=3` — incompatível com `pydantic==2.5.0`, `uvicorn==0.24.0`, `python-multipart==0.0.6` e `httpx==0.25.2` fixados. O servidor não precisa de notificações do servidor, recursos, prompts nem amostragem; o subconjunto cabe em ~200 linhas e não guarda estado (bom para o Render, que reinicia instâncias).
- **Versões do protocolo**: aceitar `2025-11-25`, `2025-06-18`, `2025-03-26` e `2024-11-05`; responder no `initialize` a versão pedida pelo cliente quando suportada, senão `2025-06-18`.
- **Alternatives considered**: (a) atualizar o stack para usar o SDK — risco alto em todo o ERP; (b) rodar um serviço Node separado com o SDK TypeScript — mais um deploy e duplicação da autenticação; (c) SDK `fastmcp` — mesmas dependências do `mcp`.

## 2. Autorização: servidor OAuth próprio

- **Decision**: O backend é ao mesmo tempo servidor de recurso (MCP) e servidor de autorização OAuth 2.1, seguindo a especificação de autorização do MCP:
  - `GET /.well-known/oauth-protected-resource` e `/.well-known/oauth-protected-resource/api/mcp` (RFC 9728) apontando `authorization_servers: [issuer]`;
  - `GET /.well-known/oauth-authorization-server` (RFC 8414) com issuer = URL pública da API (sem caminho);
  - `POST /api/mcp/oauth/register` (registro dinâmico, RFC 7591);
  - `GET /api/mcp/oauth/authorize` (código + PKCE S256 obrigatório, parâmetro `resource` da RFC 8707);
  - `POST /api/mcp/oauth/token` (`authorization_code` e `refresh_token`);
  - `POST /api/mcp/oauth/revoke` (RFC 7009).
  - Respostas `401` do MCP com `WWW-Authenticate: Bearer resource_metadata="…/.well-known/oauth-protected-resource/api/mcp"`.
- **Rationale**: Conectores remotos do Claude só autenticam por OAuth com descoberta automática e registro dinâmico. Usuários, papéis, 2FA, revogação imediata e auditoria já vivem no backend; um provedor externo exigiria sincronizar tudo isso.
- **Alternatives considered**: Auth0/WorkOS/Stytch (sincronização de usuários e 2FA, custo, dependência externa); token pessoal em `claude_desktop_config.json` com `mcp-remote` (exige Node e edição manual em cada máquina; não funciona como conector remoto).

## 3. Login e consentimento pelo painel

- **Decision**: `/authorize` valida cliente, `redirect_uri`, PKCE e `resource`, gera um **pedido assinado** (JWT de 10 min com `app="mcp_pedido"` contendo client_id, redirect_uri, code_challenge, state e scope) e redireciona para `{CONSULTANT_PANEL_URL}/conectar-claude?pedido=…`. A página é uma rota protegida do painel: sem sessão, cai no Login existente (com 2FA) e volta ao mesmo endereço; com sessão, mostra "Permitir/Cancelar". O painel chama `GET /api/mcp/oauth/pedido` e `POST /api/mcp/oauth/consentir` com o token do Proposal; o backend devolve a URL de retorno (com `code` e `state`, ou `error=access_denied`) e o painel navega para ela.
- **Rationale**: Reaproveita a tela de login, o 2FA e a regra de acesso (`get_proposal_user`) sem duplicar formulários em HTML no backend; se o consultor já está logado no painel, conectar é um clique. O pedido assinado impede adulterar o `redirect_uri` entre o `/authorize` e o consentimento e dispensa tabela de pedidos.
- **Alternatives considered**: página de login renderizada pelo backend (duplica o Login e o 2FA, visual divergente); guardar pedidos em tabela (estado desnecessário).

## 4. Tokens e revogação

- **Decision**:
  - **Token de acesso**: JWT HS256 (SECRET_KEY existente), 1 hora, claims `sub` (login), `uid`, `cx` (id da conexão), `app="mcp"`, `aud` = URL do MCP, `iss`, `exp`, `iat`. O ERP e o Proposal já recusam tokens com `app` diferente do deles (`_exigir_app`); o MCP recusa qualquer token sem `app="mcp"` e `aud` correto.
  - **Código de autorização**: aleatório (`secrets.token_urlsafe(32)`), guardado só o SHA-256, 5 minutos, uso único (consumo atômico com `UPDATE … RETURNING`, como em `acesso_proposal.consumir_token`), ligado à conexão, ao `redirect_uri` e ao `code_challenge`.
  - **Refresh token**: aleatório, hash SHA-256, 30 dias a partir da emissão, rotação a cada uso; reapresentar um refresh já usado revoga a conexão inteira (detecção de reuso).
  - **Validação por chamada**: decodifica o JWT, carrega a conexão (não revogada) e o usuário (ativo, `acesso_proposal`, sem `senha_pendente`) — revogação imediata (FR-005). `ultimo_uso_em` da conexão é atualizado no máximo a cada 5 minutos.
- **Rationale**: Mesmo padrão de hashing e consumo atômico já usado em `tokens_acesso`; JWT curto evita consulta por token, mas a reconferência da conexão garante desconexão imediata.
- **Alternatives considered**: token de acesso opaco em tabela (uma consulta a mais, sem ganho, já que a conexão é consultada de qualquer forma); refresh sem rotação (menos seguro para clientes públicos, contra a recomendação do OAuth 2.1).

## 5. Registro dinâmico e endereços de retorno

- **Decision**: Registro aberto (exigência dos clientes MCP) com validação: `redirect_uris` obrigatórios, cada um precisa ser `https://claude.ai/api/mcp/auth_callback`, `https://claude.com/api/mcp/auth_callback`, loopback HTTP (`http://localhost:*`, `http://127.0.0.1:*`, para Claude Code/MCP Inspector) ou estar em `MCP_REDIRECT_URIS` (CSV). Métodos de autenticação no token: `none` (cliente público, padrão) e `client_secret_post`/`client_secret_basic` (segredo gerado e guardado em hash) quando pedidos. `client_name` limitado a 255 caracteres.
- **Rationale**: Impede que um aplicativo de terceiros use o registro aberto para receber códigos em endereços arbitrários (phishing); cobre Claude Desktop/claude.ai e as ferramentas locais de teste.
- **Alternatives considered**: lista fechada de clientes pré-registrados (o Claude exige registro dinâmico ou documento de metadados do cliente); aceitar qualquer `redirect_uri` (inseguro).

## 6. Escopos

- **Decision**: Um único escopo `painel`. Qualquer `scope` pedido é aceito e o concedido é sempre `painel`.
- **Rationale**: As permissões finas já vêm das regras do painel (autor/admin) aplicadas pelas próprias rotas; escopos por recurso não mudariam o que cada consultor pode fazer (constitution V).
- **Alternatives considered**: escopos `propostas:read`/`propostas:write` etc. — complexidade sem requisito.

## 7. Execução das ferramentas sobre as rotas existentes

- **Decision**: Cada ferramenta chama a função da rota do Proposal correspondente, passando `db` e o dicionário de usuário (mesmo formato de `get_proposal_user`) e **todos** os parâmetros explicitamente (os padrões `Query(...)` do FastAPI não podem ficar implícitos fora da injeção). `HTTPException` vira resultado com `isError: true` e o `detail` como texto (FR-019); erros de tipo dos argumentos viram mensagem em português. Edições parciais: lê o detalhe atual, monta o payload completo (`PropostaCreate`/`VagaIn`) a partir dele e sobrepõe só os campos informados.
- **Consultor da proposta**: campos `consultor_*` não informados na criação vêm do `PerfilConsultor` do usuário (FR-012).
- **Proposta simples**: edição recusada pela ferramenta com "Propostas simples só podem ser editadas pelo painel" (as rotas de modelo não criam simples; o formato antigo não tem mesclagem segura).
- **Links**: painel `{consultant_panel_url}/propostas/{id}`, `/vagas/{id}`, `/candidaturas/{id}/curriculo`; cliente `{PROPOSAL_PUBLIC_URL}/p/{codigo}` (mesma base de `email_aceite`).
- **Rationale**: Garante por construção "mesmas regras e mensagens do painel" (FR-004, FR-019) sem duplicar validação.
- **Alternatives considered**: chamar a API HTTP internamente com o token do usuário (precisaria emitir token do Proposal a partir do token MCP, mais latência); reescrever as regras nos serviços (duplicação).

## 8. Auditoria "via Claude"

- **Decision**: `services/audit.py` ganha um `ContextVar` de origem; o servidor MCP o define como `"Claude"` durante `tools/call`, e `registrar_auditoria` acrescenta ` · via Claude` à descrição. Vagas já auditam criar/editar nas rotas; para propostas (cujas rotas não auditam criação/edição — usam o histórico de versões) a camada MCP registra `criar`/`editar` em `Proposta`. Conectar/desconectar registram `conectar`/`desconectar` em `ConexaoClaude`.
- **Rationale**: Um ponto único marca a origem sem mudar a assinatura das rotas nem poluir `criado_por_usuario`.
- **Alternatives considered**: passar um usuário "fulano (Claude)" às rotas (gravaria autor errado); auditar só na camada MCP (duplicaria entradas de vagas).

## 9. Origem das requisições e CORS

- **Decision**: Sem CORS nem validação de `Origin` no `/api/mcp`: as chamadas do conector vêm dos servidores da Anthropic e a autenticação é por Bearer (sem cookies), o que neutraliza o risco de DNS rebinding apontado pela especificação para servidores locais.
- **Rationale**: Validar `Origin` arriscaria recusar o próprio Claude sem ganho de segurança neste cenário.

## 10. Configuração e implantação

- **Decision**: `MCP_PUBLIC_URL` (URL pública da API, sem barra final; padrão `http://localhost:8001`) define issuer (`MCP_PUBLIC_URL`) e resource (`MCP_PUBLIC_URL/api/mcp`); `MCP_REDIRECT_URIS` (CSV, opcional) acrescenta endereços de retorno. Em produção: `MCP_PUBLIC_URL=https://ocean-app-backend.onrender.com`. O conector no Claude Desktop usa `https://ocean-app-backend.onrender.com/api/mcp`. Em dev, um túnel HTTPS (cloudflared/ngrok) exige `MCP_PUBLIC_URL` = URL do túnel e o host do túnel em `ALLOWED_HOSTS`.
