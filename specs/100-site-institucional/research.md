# Research: Site institucional da Ocean

Fontes analisadas: exportação estática aprovada (`ocean-talent-solutions (1).html`, ~20 MB com imagens e fontes em base64) e o protótipo publicado no Lovable (`finder-connect-suite.lovable.app`: páginas `/`, `/solucoes`, `/vagas`, `/noticias` e seus bundles JS/CSS).

## 1. Onde o site é servido

- **Decision**: Terceira entrada HTML (`frontend/site.html`) no mesmo projeto Vite e no mesmo deploy da Vercel, escolhida por host: `oceantalentsolutions.com` e `www.oceantalentsolutions.com` → `/site.html` (rewrite em `vercel.json`); em dev, `site.localhost:5193` (mesmo plugin que já faz isso para `proposal.` e `consultantpanel.`).
- **Rationale**: Repete o padrão já em produção para o Proposal (features 077 e 099). Sem novo projeto de hospedagem, sem mexer no ERP (que continua em `app.` e no catch-all `/app.html`).
- **Alternatives considered**: (a) publicar o HTML exportado como arquivo estático — 20 MB, formulários desativados, links apontando para o Lovable, sem página de Vagas; (b) colocar a landing na rota `/` do ERP — mistura site público com o app autenticado e o `index.html` do ERP não existe no build (plugin `erpHtmlSemIndex`); (c) projeto Vercel separado — duplica configuração e deploy sem ganho nesta fase.

## 2. Estilos

- **Decision**: Usar o CSS compilado da exportação (Tailwind 4 do Lovable, 142 KB) como arquivo estático `frontend/public/site/site.css`, referenciado direto no `site.html`, com as URLs base64 trocadas por arquivos em `/site/img/` e sem os `@font-face` embutidos. Os componentes React do site usam as mesmas classes do protótipo.
- **Rationale**: Fidelidade visual total (cores, `color-mix`, fundo com parallax, animações `ocean-dark-motion` e `sector-marquee`), zero colisão com o Tailwind 3 do ERP. O CSS da exportação já contém as classes de Home, Soluções, Vagas e do modal (conferido: `sector-deep-bg`, `tab-executive`, `grid-rows-[0fr]`, `bg-black/80`, `max-w-lg`, `h-28`).
- **Restrição aceita**: só funcionam classes existentes nesse CSS. Ajustes visuais futuros fora dele exigem CSS próprio. Fica registrado no `site.html`.
- **Por que em `public/` e não importado no bundle**: o PostCSS do projeto roda Tailwind 3, que rejeita `@layer base/utilities` sem as diretivas `@tailwind` correspondentes; o arquivo em `public/` não passa pelo PostCSS.
- **Alternatives considered**: (a) recriar os tokens no `tailwind.config.js` do ERP — Tailwind 3 não gera `color-mix`/opacidade sobre variáveis hex e várias classes v4 (`size-4`, `max-w-36`) mudam de nome; (b) migrar o frontend para Tailwind 4 — afeta o ERP inteiro; (c) usar o CSS do site publicado no Lovable (108 KB) — é anterior à exportação e não tem as classes das fotos da equipe.
- **Ajuste no ERP**: excluir `./src/site/**` do `content` do Tailwind do ERP, para o CSS do ERP não ganhar classes do site.

## 3. Fontes

- **Decision**: Google Fonts, Inter (400/500/600/700) e Poppins (300/400/500/600/700), como o `proposal.html` já faz.
- **Rationale**: ~100 KB em WOFF2 contra ~1,4 MB das TTF embutidas na exportação.
- **Alternatives considered**: extrair as TTF da exportação para `public/` — mais pesado e sem subset.

## 4. Imagens

- **Decision**: Extrair da exportação e otimizar para `frontend/public/site/img/`:
  - Logo (`ocean-logo-wordmark.png`) e favicon da exportação.
  - Fundo/hero (`home-hero.jpg`): JPEG ~1920 px, qualidade ~80.
  - 8 fotos da equipe: JPEG 224×224 (exibidas a 112 px; 2× para telas retina). Na exportação cada uma tem 1–1,7 MB.
  - 12 logos de clientes: PNG como estão (~5 KB cada).
  - Soluções (do protótipo publicado): imagem de topo (`solucoes-hero.jpg`) e 6 ilustrações de setores (816 px PNG ~1 MB cada → WebP 400 px).
- **Ferramenta**: Pillow num ambiente virtual temporário, fora do repositório. Só os arquivos finais entram no repositório.
- **Rationale**: SC-004 (texto visível em até 3 s no celular) e peso total da página; a exportação tem ~15 MB só de imagens.

## 5. Navegação e rotas

- **Decision**: `react-router-dom` (já é dependência) com `BrowserRouter`: `/` (Home), `/solucoes`, `/vagas`; qualquer outro caminho redireciona para `/`. Âncoras: `/#contato` (seção de contato) e `/solucoes#executive-search | #offshore | #outsourcing | #development` (aba aberta), iguais às do protótipo. Rolar para o topo ao trocar de página; rolar até `#contato` quando a âncora estiver presente.
- **Alternatives considered**: páginas HTML separadas por rota — triplicaria cabeçalho/rodapé.

## 6. Formulários

- **Decision**: Estado local do React + validação manual (regras do protótipo), confirmação com `react-hot-toast` (já usado no ERP). Nenhum envio, gravação ou log dos dados (FR-009). Sem novas dependências (o protótipo usava `react-hook-form` + `zod`; não se justifica para 2 formulários).
- **Textos**: os do protótipo (contrato [formularios.md](./contracts/formularios.md)).
- **Risco registrado**: a confirmação do contato no protótipo promete retorno "em até 1 dia útil", mas nada é entregue. Decisão do usuário (validação em andamento); a troca do destino é outra feature.

## 7. Componentes de interface

- **Decision**: Componentes próprios e pequenos, com as classes do protótipo: modal de interesse (overlay + painel, fecha com Esc, clique fora e botão), `select` nativo estilizado como os campos do protótipo (no lugar do Select do Radix), abas de Soluções com `role="tablist"`. Ícones Lucide copiados como SVG inline da exportação/protótipo.
- **Alternatives considered**: instalar Radix/shadcn e `lucide-react` — dependências novas só para o site.

## 8. Animações

- **Decision**: Manter as animações em CSS (brilho do fundo escuro, faixa de setores); não reproduzir as animações de entrada por rolagem (`framer-motion` no protótipo). O conteúdo aparece direto.
- **Rationale**: Princípio V (simplicidade) e SC-004. A exportação aprovada também foi gerada sem essas animações.

## 9. Metadados

- **Decision**: Título "Ocean Talent Solutions — Capital Humano e Executive Search", descrição, Open Graph e a meta `google-site-verification` da exportação; favicon da Ocean (`/favicon.ico`, `/favicon.png`, já no projeto).

## 10. Conteúdo do protótipo que muda

- WhatsApp flutuante: número de exemplo `5511999999999` → `5521966326588` (o da seção Contato).
- Seletor PT | EN e "Notícias" removidos (menu, menu do celular e rodapé).
- "Saiba mais" de cada card abre a aba da solução correspondente (no protótipo todos abriam a primeira aba).
