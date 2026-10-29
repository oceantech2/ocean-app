# Contrato: endereços do site

## Hosts

| Host | Entrada servida | App |
|------|-----------------|-----|
| `landing.oceantalentsolutions.com` (teste) · `oceantalentsolutions.com`, `www.oceantalentsolutions.com` (prod) · `site.localhost:5193` (dev) | `site.html` | Site institucional (este) |
| `proposal.oceantalentsolutions.com`, `consultantpanel.oceantalentsolutions.com` · `proposal.localhost:5193`, `consultantpanel.localhost:5193` | `proposal.html` | Proposal / Consultant Panel (inalterado) |
| Qualquer outro (`app.oceantalentsolutions.com`, `localhost:5193`, `*.vercel.app`) | `app.html` (prod) · `index.html` (dev) | ERP (inalterado) |

## Rotas do site

| Português | Inglês | Conteúdo |
|-----------|--------|----------|
| `/` | `/en` | Home |
| `/#contato` | `/en#contato` | Home, rolada até a seção Contato |
| `/solucoes` | `/en/solutions` | Soluções, aba Executive Search |
| `/solucoes#executive-search` · `#offshore` · `#outsourcing` · `#development` | `/en/solutions#…` (mesmas âncoras) | Soluções com a aba correspondente aberta |
| `/vagas` | `/en/jobs` | Vagas |
| `/noticias` | `/en/news` | Notícias (lista provisória e assinatura sem envio) |
| qualquer outro | qualquer outro em `/en/…` | Redireciona para a Home do idioma |

O idioma vem da URL; o seletor PT | EN do cabeçalho leva à mesma página no outro idioma.

## Visual

O visual segue o projeto Lovable "Ocean Talent" (código-fonte exportado em 29/10/2026). O CSS do site é gerado com Tailwind 4 a partir de `frontend/scripts/site-css/site.css` (tema do Lovable) por `npm run site:css`, que precisa ser rodado sempre que classes novas forem usadas em `src/site/`.

## SEO

- No build, o plugin `site-prerender.ts` gera o HTML já renderizado de cada rota acima (`dist/site/paginas/…`), com título, descrição, canonical, hreflang, Open Graph e JSON-LD próprios; o `vercel.json` reescreve cada rota dos hosts do site para o seu arquivo.
- Canonical em `https://www.oceantalentsolutions.com` (constante `URL_SITE` em `src/site/seo.ts`); o domínio sem `www` deve redirecionar para ele na Vercel.
- `/robots.txt` e `/sitemap.xml` nos hosts de produção do site servem `site/robots.txt` e `site/sitemap.xml`; nos demais hosts (ERP, Proposal, `landing.` e previews), `/robots.txt` bloqueia tudo e `landing.` ainda envia `X-Robots-Tag: noindex`.

## Links externos

| Destino | Endereço |
|---------|----------|
| WhatsApp (flutuante e Contato) | `https://wa.me/5521975540224?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20Ocean%20e%20gostaria%20de%20saber%20mais.` |
| E-mail | `mailto:contato@oceantalentsolutions.com` |
| LinkedIn da Ocean | `https://www.linkedin.com/company/ocean-talent-solutions/` |
| LinkedIn da equipe | Os 8 perfis da exportação, em nova aba |

## Variáveis de ambiente

Nenhuma nova. O site não chama a API.
