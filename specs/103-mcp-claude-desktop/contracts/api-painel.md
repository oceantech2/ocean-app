# Contrato: rotas usadas pelo painel

Todas exigem o token do Proposal (`Authorization: Bearer <proposal_access_token>`, dependência `get_proposal_user`).

## `GET /api/mcp/oauth/pedido?pedido=<jwt>`

Mostra o pedido na tela de autorização.

- `200`: `{"cliente_nome": "Claude", "usuario": "fulano@ocean…", "mcp_url": "{R}"}`
- `400`: `{"detail": "Pedido de conexão expirado ou inválido. Conecte novamente pelo Claude."}` (JWT inválido/expirado ou cliente removido)

## `POST /api/mcp/oauth/consentir`

Entrada: `{"pedido": "<jwt>", "aprovar": true|false}`

- `200`: `{"redirect_url": "<redirect_uri>?code=…&state=…"}` quando aprovado (cria conexão + código, audita `conectar`), ou `{"redirect_url": "<redirect_uri>?error=access_denied&state=…"}` quando recusado.
- `400`: pedido inválido/expirado (mesma mensagem acima).
- `403`: usuário sem acesso ao Proposal (vem de `get_proposal_user`).

## `GET /api/mcp/conexoes`

- `200`: `{"mcp_url": "{R}", "items": [{"id": 1, "cliente_nome": "Claude", "criado_em": "…Z", "ultimo_uso_em": "…Z" | null}]}` — só conexões do próprio usuário, ativadas, não revogadas e com refresh válido; mais recentes primeiro.

## `DELETE /api/mcp/conexoes/{id}`

- `204`: revoga a conexão (audita `desconectar`).
- `404`: `{"detail": "Conexão não encontrada"}` (inexistente, de outro usuário ou já revogada).
