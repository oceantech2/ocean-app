# Contrato de endereços

| Host | Caminhos atendidos | Demais caminhos |
|------|--------------------|-----------------|
| `proposal.oceantalentsolutions.com` | `/p/<código>` (incl. `?pdf=1`) | Redireciona para o mesmo caminho + query + hash no painel (quando a separação estiver ativa) |
| `consultantpanel.oceantalentsolutions.com` | `/`, `/login`, `/entrar`, `/convite`, `/nova`, `/propostas/...`, `/modelos/...`, `/perfil`, `/p/<código>` (pré-visualização) | — |

## Variáveis de ambiente

| Variável | Onde | Uso | Vazia |
|----------|------|-----|-------|
| `VITE_PROPOSAL_PUBLIC_URL` | Vercel | Links do cliente (`/p/<código>`) | Origem atual (ou `proposal.<domínio>` se estiver no painel) |
| `VITE_CONSULTANT_PANEL_URL` (nova) | Vercel | Ativa a separação; base do painel para ERP, convites e redirecionamento | Sem separação em produção; em `*.localhost` vira `consultantpanel.localhost:<porta>` |
| `PROPOSAL_PUBLIC_URL` | Render | Links "ver"/"PDF" do e-mail de aceite | `http://proposal.localhost:5193` |
| `CONSULTANT_PANEL_URL` (nova) | Render | Botão "Abrir no Consultant Panel" do e-mail | Usa `PROPOSAL_PUBLIC_URL` (que redireciona) |
| `CORS_ORIGINS` | Render | Deve incluir `https://consultantpanel.oceantalentsolutions.com` | Padrão de dev já inclui `consultantpanel.localhost:5193` |

## Links gerados

- Copiar link / e-mail ("ver", "PDF"): `<URL do cliente>/p/<código>`
- Abrir página do cliente (detalhe): `<origem do painel>/p/<código>`
- ERP → painel: `<URL do painel>/entrar#c=<código>`
- Convite: `<URL do painel>/convite#t=<token>`
- E-mail de aceite → detalhe: `<URL do painel>/propostas/<id>`
