# Contrato: OAuth 2.1 do conector

Base: `{B}` = `MCP_PUBLIC_URL` (ex.: `https://ocean-app-backend.onrender.com`). Resource: `{R}` = `{B}/api/mcp`.

## Descoberta

### `GET /.well-known/oauth-protected-resource` e `GET /.well-known/oauth-protected-resource/api/mcp`

```json
{
  "resource": "{R}",
  "authorization_servers": ["{B}"],
  "scopes_supported": ["painel"],
  "bearer_methods_supported": ["header"],
  "resource_name": "Ocean · Consultant Panel"
}
```

### `GET /.well-known/oauth-authorization-server`

```json
{
  "issuer": "{B}",
  "authorization_endpoint": "{B}/api/mcp/oauth/authorize",
  "token_endpoint": "{B}/api/mcp/oauth/token",
  "registration_endpoint": "{B}/api/mcp/oauth/register",
  "revocation_endpoint": "{B}/api/mcp/oauth/revoke",
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code", "refresh_token"],
  "code_challenge_methods_supported": ["S256"],
  "token_endpoint_auth_methods_supported": ["none", "client_secret_post", "client_secret_basic"],
  "revocation_endpoint_auth_methods_supported": ["none", "client_secret_post", "client_secret_basic"],
  "scopes_supported": ["painel"]
}
```

## `POST /api/mcp/oauth/register` (RFC 7591)

Entrada JSON: `redirect_uris` (obrigatório, lista), `client_name`, `token_endpoint_auth_method` (`none` padrão), demais campos ignorados.

- `201`: `{client_id, client_id_issued_at, client_name, redirect_uris, grant_types: ["authorization_code","refresh_token"], response_types: ["code"], token_endpoint_auth_method, scope: "painel"}` + `client_secret` e `client_secret_expires_at: 0` quando confidencial.
- `400`: `{"error": "invalid_redirect_uri" | "invalid_client_metadata", "error_description": "…"}`.

`redirect_uri` aceito: `https://claude.ai/api/mcp/auth_callback`, `https://claude.com/api/mcp/auth_callback`, `http://localhost[:porta]/…`, `http://127.0.0.1[:porta]/…`, ou presente em `MCP_REDIRECT_URIS`.

## `GET /api/mcp/oauth/authorize`

Parâmetros: `response_type=code`, `client_id`, `redirect_uri`, `code_challenge`, `code_challenge_method=S256`, `state` (opcional), `scope` (opcional), `resource` (opcional; se presente, precisa ser `{R}`, tolerando barra final).

- Cliente desconhecido ou `redirect_uri` não registrado → `400` HTML simples (não redireciona).
- Demais erros → `302` para `redirect_uri?error=invalid_request|unsupported_response_type|invalid_target&error_description=…&state=…`.
- Sucesso → `302` para `{CONSULTANT_PANEL_URL}/conectar-claude?pedido={JWT do pedido}`.

## `POST /api/mcp/oauth/token` (`application/x-www-form-urlencoded`)

Autenticação do cliente: `client_id` no corpo (público) ou `client_secret_post`/`client_secret_basic`.

### `grant_type=authorization_code`

Campos: `code`, `redirect_uri`, `client_id`, `code_verifier`, `resource` (opcional).

### `grant_type=refresh_token`

Campos: `refresh_token`, `client_id`.

### Sucesso `200` (`Cache-Control: no-store`)

```json
{"access_token": "…", "token_type": "Bearer", "expires_in": 3600, "refresh_token": "…", "scope": "painel"}
```

### Erros `400`/`401`

`{"error": "invalid_request" | "invalid_client" | "invalid_grant" | "unsupported_grant_type" | "invalid_target", "error_description": "…"}`. `invalid_grant` cobre: código/refresh inexistente, usado, expirado, de outro cliente, `redirect_uri` diferente, PKCE inválido, conexão revogada, usuário sem acesso. Refresh já usado → revoga a conexão.

## `POST /api/mcp/oauth/revoke` (RFC 7009)

Campos: `token`, `token_type_hint` (opcional), autenticação do cliente. Se for um refresh da conexão do cliente, a conexão é revogada. Sempre `200` (mesmo token desconhecido).
