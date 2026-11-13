# Implementation Plan: Claude Desktop conectado ao Consultant Panel (MCP)

**Branch**: `103-mcp-claude-desktop` | **Date**: 2026-11-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/103-mcp-claude-desktop/spec.md`

## Summary

O backend FastAPI passa a expor um servidor MCP remoto em `/api/mcp` (transporte Streamable HTTP, modo sem sessão, respostas JSON) e um servidor de autorização OAuth 2.1 próprio (descoberta por `/.well-known/*`, registro dinâmico de cliente, código de autorização com PKCE S256, renovação com rotação e revogação). A autorização reaproveita o login do Consultant Panel: `/api/mcp/oauth/authorize` valida o pedido e redireciona para a página `/conectar-claude` do painel, que exige a sessão do Proposal (login + 2FA já existentes) e mostra a tela "Permitir/Cancelar". O token de acesso é um JWT com `app="mcp"` e `aud` = URL do MCP, recusado pelo ERP e pelo Proposal; cada chamada reconfere no banco a conexão e o usuário. As ferramentas MCP chamam diretamente as funções das rotas do Proposal já existentes (mesmas validações, permissões e mensagens), com edição parcial por mesclagem sobre o registro atual, links do painel nas respostas e auditoria marcada "via Claude". O "Meu perfil" ganha a seção "Claude" com o endereço do conector e as conexões ativas (desconectar).

## Technical Context

**Language/Version**: Python 3.11 (FastAPI 0.104, SQLAlchemy 2.0, Pydantic 2.5, python-jose) + TypeScript 5 / React 18

**Primary Dependencies**: nenhuma nova. O SDK oficial `mcp` (2.x) exige Pydantic ≥ 2.12, Uvicorn ≥ 0.31, python-multipart ≥ 0.0.9 e outras versões incompatíveis com as fixadas no `requirements.txt`; o subconjunto do protocolo necessário (JSON-RPC: `initialize`, `ping`, `tools/list`, `tools/call`, notificações) é implementado direto no FastAPI (ver [research.md](./research.md) §1)

**Storage**: PostgreSQL — 3 tabelas novas via `create_all` (`mcp_clientes`, `mcp_conexoes`, `mcp_tokens`) com RLS habilitada em `_migrar` (padrão das features 088/098/102)

**Testing**: Sem suíte automatizada no repositório; validação por `python -m compileall`, script de fumaça do fluxo OAuth + MCP com `httpx` contra a API local, `npx tsc --noEmit`, `npx vite build` e roteiro manual em [quickstart.md](./quickstart.md) (incluindo Claude Desktop via túnel)

**Target Platform**: API no Render (`ocean-app-backend.onrender.com`); painel na Vercel (`consultantpanel.oceantalentsolutions.com`); cliente: Claude Desktop (conector personalizado remoto, chamadas originadas na nuvem da Anthropic)

**Project Type**: Aplicação web (backend + frontend; mudança no painel do Proposal)

**Performance Goals**: cada chamada de ferramenta responde no mesmo tempo da rota equivalente do painel (+ 1 consulta de validação da conexão); sem estado em memória entre requisições (compatível com reinícios do Render)

**Constraints**: credencial do conector isolada do ERP e do Proposal (claim `app` + `aud`); `redirect_uri` só para endereços do Claude, loopback e lista configurável (FR-008); segredos (SECRET_KEY) só em variável de ambiente; URL pública da API configurável (`MCP_PUBLIC_URL`) para montar issuer/resource; portas de dev inalteradas (API 8001)

**Scale/Scope**: dezenas de consultores, poucas conexões por consultor; 11 ferramentas; 2 roteadores + 2 serviços + 3 modelos no backend; 1 página nova + seção no Perfil no painel

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|-----------|-----------|--------|
| I. Idioma Português | Artefatos, telas e descrições das ferramentas (lidas pelo Claude) em pt-BR; nomes de ferramentas em português snake_case | ✅ |
| II. Domínio Financeiro Interno | Estende o Consultant Panel (fora do ERP financeiro, como 083–102); papéis preservados: as ferramentas reaproveitam as regras de autor/admin do painel | ⚠️ justificado (painel já fora do domínio financeiro desde 083) |
| III. Clareza Antes de Implementar | Canal, autenticação, escopo e exclusões decididos com o usuário e registrados em Clarifications | ✅ |
| IV. Consistência com o Produto | Tela de autorização no visual do Login; Perfil com seção nova, `window.confirm` ao desconectar, `react-hot-toast`, spinner; auditoria no `audit_logs` existente | ✅ |
| V. Simplicidade e Escopo Fechado | Sem dependências novas; protocolo mínimo (sem SSE, sem sessão); um único escopo OAuth; sem limite de taxa nesta fase; reaproveita rotas existentes em vez de duplicar regras | ✅ |

**Re-check pós-design**: sem novas violações. A implementação própria do protocolo é a opção mais simples dado o conflito de versões (ver Complexity Tracking).

## Project Structure

### Documentation (this feature)

```text
specs/103-mcp-claude-desktop/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── oauth.md               # descoberta, registro, authorize, token, revoke, consentimento
│   ├── mcp-protocolo.md       # endpoint /api/mcp (JSON-RPC, autenticação, erros)
│   ├── mcp-ferramentas.md     # 11 ferramentas: entradas, saídas, regras
│   └── api-painel.md          # rotas usadas pelo painel (pedido, consentir, conexões)
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/app/
├── config.py                         # + MCP_PUBLIC_URL, MCP_REDIRECT_URIS (CSV) e helpers mcp_base_url/mcp_resource_url
├── models/__init__.py                # + McpCliente, McpConexao, McpToken
├── main.py                           # RLS das 3 tabelas; include dos roteadores well-known, oauth e mcp
├── services/
│   ├── audit.py                      # + marcador de origem (ContextVar) que acrescenta "· via Claude" à descrição
│   ├── mcp_auth.py                   # NOVO: PKCE, pedido assinado, códigos/refresh (hash), JWT app=mcp, validação por requisição
│   └── mcp_ferramentas.py            # NOVO: registro das 11 ferramentas (schemas pt-BR) e execução sobre as rotas do Proposal
└── api/routes/
    ├── mcp_oauth.py                  # NOVO: /.well-known/*, /api/mcp/oauth/{register,authorize,token,revoke,pedido,consentir}, /api/mcp/conexoes
    └── mcp_servidor.py               # NOVO: POST/GET/DELETE /api/mcp (JSON-RPC)

frontend/src/proposal/
├── App.tsx                           # rota protegida /conectar-claude
├── pages/ConectarClaude.tsx          # NOVO: tela de autorização (Permitir/Cancelar)
├── pages/Perfil.tsx                  # + seção "Claude": endereço do conector e conexões (desconectar)
└── services/proposalApi.ts           # + tipos e chamadas do pedido, consentimento e conexões
```

**Structure Decision**: Backend segue o padrão de roteador por área (`proposal_*`, `public_*`), agora `mcp_*`; as ferramentas importam as funções das rotas `proposal_propostas`, `proposal_modelos` e `proposal_vagas` em vez de duplicar regras. Frontend só no painel (`src/proposal/`).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Servidor de autorização OAuth próprio (registro dinâmico, PKCE, rotação de refresh) | Conectores remotos do Claude Desktop só aceitam OAuth; a base de usuários, papéis e 2FA está em `usuarios_app` | Token pessoal colado na configuração não funciona em conector remoto; provedor externo (Auth0/WorkOS) exigiria sincronizar usuários e 2FA |
| Protocolo MCP implementado à mão (subconjunto) | Conflito de versões do SDK oficial com o stack fixado | Atualizar FastAPI/Pydantic/Uvicorn/httpx afetaria todo o ERP e o painel, fora do escopo |
