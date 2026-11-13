# Contrato: endpoint MCP

URL do conector: `{R}` = `{MCP_PUBLIC_URL}/api/mcp`. Transporte Streamable HTTP, sem sessão (`Mcp-Session-Id` não é emitido).

## Autenticação

Toda requisição exige `Authorization: Bearer <access_token>` emitido pelo [OAuth do conector](./oauth.md).

- Ausente → `401` com `WWW-Authenticate: Bearer resource_metadata="{B}/.well-known/oauth-protected-resource/api/mcp"`.
- Inválido, expirado, `app` ≠ `mcp`, `aud` ≠ `{R}`, conexão revogada ou usuário sem acesso → `401` com o mesmo cabeçalho + `error="invalid_token"`.
- Tokens do ERP e do Proposal são recusados aqui; o token do conector é recusado no ERP e no Proposal.

## `POST {R}`

Corpo: uma mensagem JSON-RPC 2.0 ou um lote (lista).

| Mensagem | Resposta HTTP |
|----------|---------------|
| Requisição (`id` + `method`) | `200 application/json` com a resposta JSON-RPC |
| Só notificações/respostas | `202` sem corpo |
| JSON inválido | `400` com `{"jsonrpc":"2.0","id":null,"error":{"code":-32700,…}}` |
| Mensagem sem `jsonrpc: "2.0"`/`method` | erro `-32600` |

### Métodos

- `initialize` → `{"protocolVersion": <pedida se suportada, senão "2025-06-18">, "capabilities": {"tools": {"listChanged": false}}, "serverInfo": {"name": "ocean-consultant-panel", "title": "Ocean · Consultant Panel", "version": "1.0.0"}, "instructions": "<orientações em pt-BR>"}`
- `ping` → `{}`
- `tools/list` → `{"tools": [ {name, title, description, inputSchema, annotations} … ]}` (ver [ferramentas](./mcp-ferramentas.md))
- `tools/call` (`params.name`, `params.arguments`) → `{"content": [{"type": "text", "text": "<JSON do resultado>"}], "isError": false}`; erros de negócio → `isError: true` com a mensagem do painel. Ferramenta inexistente → erro JSON-RPC `-32602`.
- Outros → `-32601 Method not found`.
- Notificações (`notifications/initialized`, `notifications/cancelled`…) → ignoradas (`202`).

## `GET {R}` / `DELETE {R}`

`405 Method Not Allowed` (sem fluxo SSE e sem sessão).
