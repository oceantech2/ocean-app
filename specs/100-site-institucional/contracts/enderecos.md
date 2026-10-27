# Contrato: endereços do site

## Hosts

| Host | Entrada servida | App |
|------|-----------------|-----|
| `landing.oceantalentsolutions.com` (teste) · `oceantalentsolutions.com`, `www.oceantalentsolutions.com` (prod) · `site.localhost:5193` (dev) | `site.html` | Site institucional (este) |
| `proposal.oceantalentsolutions.com`, `consultantpanel.oceantalentsolutions.com` · `proposal.localhost:5193`, `consultantpanel.localhost:5193` | `proposal.html` | Proposal / Consultant Panel (inalterado) |
| Qualquer outro (`app.oceantalentsolutions.com`, `localhost:5193`, `*.vercel.app`) | `app.html` (prod) · `index.html` (dev) | ERP (inalterado) |

## Rotas do site

| Caminho | Conteúdo |
|---------|----------|
| `/` | Home |
| `/#contato` | Home, rolada até a seção Contato |
| `/solucoes` | Soluções, aba Executive Search |
| `/solucoes#executive-search` · `#offshore` · `#outsourcing` · `#development` | Soluções com a aba correspondente aberta |
| `/vagas` | Vagas |
| qualquer outro | Redireciona para `/` |

## Links externos

| Destino | Endereço |
|---------|----------|
| WhatsApp (flutuante e Contato) | `https://wa.me/5521966326588?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20Ocean%20e%20gostaria%20de%20saber%20mais.` |
| E-mail | `mailto:contato@oceantalentsolutions.com` |
| LinkedIn da Ocean | `https://www.linkedin.com/company/oceantalentsolutions` |
| LinkedIn da equipe | Os 8 perfis da exportação, em nova aba |

## Variáveis de ambiente

Nenhuma nova. O site não chama a API.
