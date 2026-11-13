# Quickstart: validar o conector do Claude (MCP)

## Pré-requisitos

- Infra local: `docker compose up -d` (API em `http://localhost:8001`, Postgres 5433).
- Painel: `cd frontend && npm run dev` → `http://consultantpanel.localhost:5193`.
- Um usuário com acesso ao Proposal (`docker exec -it ocean_backend python scripts/criar_admin.py <login>` e liberar o Proposal pelo ERP, se preciso).
- Variáveis (opcionais em dev): `MCP_PUBLIC_URL` (padrão `http://localhost:8001`), `CONSULTANT_PANEL_URL=http://consultantpanel.localhost:5193`.

Contratos: [oauth.md](./contracts/oauth.md), [mcp-protocolo.md](./contracts/mcp-protocolo.md), [mcp-ferramentas.md](./contracts/mcp-ferramentas.md), [api-painel.md](./contracts/api-painel.md).

## 1. Descoberta e proteção (sem login)

1. `curl -i http://localhost:8001/api/mcp -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"ping"}'` → `401` com `WWW-Authenticate: Bearer resource_metadata=".../.well-known/oauth-protected-resource/api/mcp"`.
2. `curl http://localhost:8001/.well-known/oauth-protected-resource/api/mcp` → `resource` = `http://localhost:8001/api/mcp`.
3. `curl http://localhost:8001/.well-known/oauth-authorization-server` → endpoints de authorize/token/register/revoke e `S256`.

## 2. Fluxo OAuth completo pelo navegador (MCP Inspector)

1. `npx @modelcontextprotocol/inspector` → transporte "Streamable HTTP", URL `http://localhost:8001/api/mcp`, "Connect".
2. O navegador abre o painel em `/conectar-claude`: sem sessão → Login (com 2FA se ativo) → volta à tela de autorização com o nome do aplicativo e o usuário.
3. "Permitir" → o Inspector conecta e lista as 11 ferramentas.
4. "Cancelar" (em nova tentativa) → o Inspector recebe `access_denied` e nenhuma conexão aparece no Perfil.

**Esperado**: em "Meu perfil", seção "Claude" mostra o endereço do conector e a conexão (aplicativo, data, último uso); auditoria registra `conectar`.

## 3. Ferramentas (pelo Inspector ou Claude)

- `listar_propostas` com `status=aguardando` → mesmas propostas da lista do painel com esse filtro, com `link_painel`.
- `criar_proposta` (Executive Search, 2 projetos, sem dados do consultor) → proposta criada; abrir `link_painel` e conferir consultor = Meu perfil; auditoria `criar` "· via Claude".
- `editar_proposta` só com `validade_dias` → versão +1, demais campos iguais, histórico em nome do usuário.
- `editar_proposta` numa proposta de outro consultor (usuário não admin) → `isError` "Apenas quem criou a proposta ou um administrador pode alterá-la".
- `criar_proposta` com `setor` inválido → `isError` "Selecione o setor" e nada gravado.
- `listar_modelos`, `ver_modelo` → mesmos dados da página Modelos.
- `criar_vaga` → vaga aberta no painel e no site; `editar_vaga` parcial; auditoria com "· via Claude".
- `listar_candidaturas` de uma vaga com candidaturas → dados + `link_curriculo`.

## 4. Isolamento e revogação

1. Usar o `access_token` do conector em `GET /api/proposal/auth/me` e em `GET /api/auth/me` → `401` ou `403`.
2. Usar o token do Proposal (localStorage `proposal_access_token`) no `/api/mcp` → `401`.
3. "Desconectar" no Perfil (confirmar) → próxima chamada do Inspector → `401`.
4. Retirar o acesso ao Proposal do usuário no ERP → próxima chamada → `401`.
5. Reapresentar um `refresh_token` já usado no `/api/mcp/oauth/token` → `invalid_grant` e a conexão some do Perfil.

## 5. Claude Desktop (via túnel)

1. `cloudflared tunnel --url http://localhost:8001` (ou ngrok) → URL `https://<tunel>`.
2. Reiniciar a API com `MCP_PUBLIC_URL=https://<tunel>` e `ALLOWED_HOSTS=localhost,127.0.0.1,<host do túnel>`.
3. Claude Desktop → Configurações → Conectores → "Adicionar conector personalizado" → `https://<tunel>/api/mcp` → "Conectar" → login/autorização no painel → volta conectado.
4. Pedir: "liste minhas propostas aguardando assinatura" e "crie uma vaga de CFO em São Paulo…" e conferir no painel.

## 6. Build

- `cd backend && python -m compileall -q app`
- `cd frontend && npx tsc --noEmit && npx vite build`
