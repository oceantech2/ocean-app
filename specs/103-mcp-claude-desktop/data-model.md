# Data Model: Claude Desktop conectado ao Consultant Panel (MCP)

Três tabelas novas criadas pelo `Base.metadata.create_all` e fechadas para a API pública do Supabase (`ENABLE ROW LEVEL SECURITY` em `_migrar`, como `tokens_acesso`).

## McpCliente (`mcp_clientes`)

Aplicativo que se registrou pelo registro dinâmico (ex.: Claude).

| Campo | Tipo | Regras |
|-------|------|--------|
| id | SERIAL PK | |
| client_id | VARCHAR(64) UNIQUE NOT NULL | aleatório (`secrets.token_urlsafe(24)`) |
| client_secret_hash | VARCHAR(64) NULL | SHA-256 do segredo; só para `client_secret_post`/`client_secret_basic` |
| auth_method | VARCHAR(30) NOT NULL | `none` \| `client_secret_post` \| `client_secret_basic` |
| client_name | VARCHAR(255) NOT NULL | padrão "Aplicativo MCP" quando ausente |
| redirect_uris | JSONB NOT NULL | lista não vazia; cada item validado (research §5) |
| criado_em | TIMESTAMP NOT NULL | UTC |

## McpConexao (`mcp_conexoes`)

Autorização dada por um consultor a um aplicativo (uma por clique em "Permitir").

| Campo | Tipo | Regras |
|-------|------|--------|
| id | SERIAL PK | vai no claim `cx` do token de acesso |
| usuario_id | INTEGER NOT NULL FK `usuarios_app(id)` ON DELETE CASCADE | índice |
| cliente_id | INTEGER NOT NULL FK `mcp_clientes(id)` ON DELETE CASCADE | |
| criado_em | TIMESTAMP NOT NULL | momento do "Permitir" |
| ativada_em | TIMESTAMP NULL | primeira troca de código por token; conexões nunca ativadas não aparecem no Perfil |
| ultimo_uso_em | TIMESTAMP NULL | atualizado no máximo a cada 5 min |
| revogada_em | TIMESTAMP NULL | desconectar no Perfil, revoke OAuth ou reuso de refresh |

**Estados**: pendente (`ativada_em` nulo) → ativa (`ativada_em` preenchido, `revogada_em` nulo) → revogada. Uma conexão ativa sem refresh válido (30 dias sem uso) é tratada como expirada: não aparece no Perfil e o Claude precisa conectar de novo.

**Conexão válida para uma chamada**: `revogada_em IS NULL` e usuário `ativo`, `acesso_proposal` e não `senha_pendente`.

## McpToken (`mcp_tokens`)

Credenciais temporárias de uma conexão (somente hash).

| Campo | Tipo | Regras |
|-------|------|--------|
| id | SERIAL PK | |
| conexao_id | INTEGER NOT NULL FK `mcp_conexoes(id)` ON DELETE CASCADE | índice |
| tipo | VARCHAR(10) NOT NULL | CHECK `tipo IN ('codigo','refresh')` |
| token_hash | VARCHAR(64) UNIQUE NOT NULL | SHA-256 |
| redirect_uri | TEXT NULL | só `codigo`; precisa bater na troca |
| code_challenge | VARCHAR(128) NULL | só `codigo`; PKCE S256 |
| criado_em | TIMESTAMP NOT NULL | |
| expira_em | TIMESTAMP NOT NULL | código: +5 min; refresh: +30 dias |
| usado_em | TIMESTAMP NULL | consumo atômico (`UPDATE … WHERE usado_em IS NULL AND expira_em > now RETURNING`) |

**Regras**:
- Reapresentar um `refresh` já usado → revoga a conexão (detecção de reuso).
- Troca de código: `client_id` precisa ser o do cliente da conexão; `redirect_uri` igual ao gravado; `BASE64URL(SHA256(code_verifier)) == code_challenge`.

## Token de acesso (JWT, não persistido)

| Claim | Valor |
|-------|-------|
| `sub` | login do usuário (`usuarios_app.usuario`) |
| `uid` | `usuarios_app.id` |
| `cx` | `mcp_conexoes.id` |
| `app` | `"mcp"` |
| `aud` | `{MCP_PUBLIC_URL}/api/mcp` |
| `iss` | `{MCP_PUBLIC_URL}` |
| `iat`/`exp` | emissão / +3600 s |

## Pedido de autorização (JWT, não persistido)

Assinado com SECRET_KEY, 10 minutos: `app="mcp_pedido"`, `cid` (client_id), `ru` (redirect_uri), `cc` (code_challenge), `st` (state, opcional), `sc` (scope).

## Auditoria (tabela existente `audit_logs`)

| Evento | acao | entidade | entidade_id | descricao |
|--------|------|----------|-------------|-----------|
| Permitir | `conectar` | `ConexaoClaude` | conexão | "{client_name}" |
| Desconectar (Perfil) | `desconectar` | `ConexaoClaude` | conexão | "{client_name}" |
| Criar proposta pelo Claude | `criar` | `Proposta` | proposta | "{codigo} — {cliente} · via Claude" |
| Editar proposta pelo Claude | `editar` | `Proposta` | proposta | "{codigo} — {cliente} (v{versao}) · via Claude" |
| Criar/editar vaga pelo Claude | `criar`/`editar` | `Vaga` | vaga | descrição da rota + " · via Claude" |
