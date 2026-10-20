# Research: Painel do consultor em domínio próprio

## R1 — Um bundle, dois hosts

- **Decision**: Manter um único `proposal.html` servido pelos dois hosts (rewrite por host na Vercel, plugin de host no Vite em dev); a decisão de redirecionar é feita no `main.tsx`, antes de montar o React.
- **Rationale**: Nenhuma duplicação de build; a página do cliente e o painel já compartilham código (modelos, PDF).
- **Alternatives considered**: Dois bundles separados (dobra build e configuração); redirect 301 na Vercel por host + caminho (não preserva o hash `#c=`/`#t=` de entrada SSO e convite, que nunca chega ao servidor).

## R2 — Ativação segura

- **Decision**: Em produção, a separação só vale com `VITE_CONSULTANT_PANEL_URL` definida. Sem ela, tudo continua como hoje no host atual. Em dev (`*.localhost`), o painel é derivado automaticamente (`consultantpanel.localhost:<porta>`).
- **Rationale**: Edge case da spec — publicar antes do DNS não pode derrubar o painel. Basta definir a variável e refazer o build quando o domínio estiver respondendo.

## R3 — Pré-visualização sem marcar "Visualizada"

- **Decision**: "Abrir página do cliente" no detalhe abre `<origem do painel>/p/<código>`. No painel há sessão em `localStorage`, então `consultarPublica` envia o token e o backend já ignora a visualização (`aberta_pela_ocean`). A página mostra uma faixa "Pré-visualização" (oculta na impressão/PDF).
- **Rationale**: Reaproveita a regra existente do backend; nenhum endpoint novo.
- **Alternatives considered**: Endpoint de pré-visualização autenticado (duplicaria a página pública).

## R4 — Sessão

- **Decision**: Não migrar sessão entre origens; o consultor entra de novo uma vez (ou chega pelo ERP com SSO).
- **Rationale**: Premissa aceita na spec; migração exigiria passar token pela URL.

## R5 — Backend

- **Decision**: `CONSULTANT_PANEL_URL` (vazia → usa `PROPOSAL_PUBLIC_URL`, que redireciona) para o botão do e-mail de aceite; `http://consultantpanel.localhost:5193` no CORS padrão de dev; em produção, `CORS_ORIGINS` precisa incluir `https://consultantpanel.oceantalentsolutions.com`.
- **Rationale**: O link antigo continua funcionando graças ao redirecionamento do frontend; a variável só deixa o link direto.

## R6 — Nome exibido

- **Decision**: "Consultant Panel" no cabeçalho, login, convite, título da aba e nos textos do ERP que se referem ao painel (menu, liberação de acesso, Configurações). A página do cliente mantém seus títulos.
