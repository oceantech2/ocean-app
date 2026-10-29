# Research: Carrossel da Equipe e logos de clientes em alta resolução

Fontes analisadas: código do protótipo (`ocean-talent-solutions.zip` → `src/components/TeamCarousel.tsx`, `ClientLogos.tsx`), exportação aprovada (`ocean-talent-solutions (1).html`), CSS estático do site (`frontend/public/site/site.css`) e os sites oficiais das 12 empresas clientes.

## 1. Mecânica do carrossel infinito

- **Decision**: Trilho horizontal com a lista de consultores repetida 3 vezes (`[cópia, original, cópia]`), deslocado com `transform: translateX(-índice × 100/porVez %)` e `transition: transform 500ms`. O índice começa no início do bloco do meio; ao terminar a transição, se o índice saiu do bloco do meio, ele é "teleportado" (sem transição) para a posição equivalente dentro do bloco do meio. Avança 1 consultor por vez.
- **Rationale**: Atende "infinito, sem volta visível" (FR-002) com 8 itens e qualquer número por vez (1/2/3), sem páginas incompletas; zero dependências.
- **Alternatives considered**: (a) páginas de 3 como no protótipo — 8 não fecha em páginas de 3 e o "loop" seria um salto de volta; (b) biblioteca (Embla, Swiper) — dependência nova para um único componente, contra o princípio V; (c) CSS `scroll-snap` com rolagem nativa — loop infinito exige o mesmo truque de clones, com controle pior da troca automática.

## 2. Consultores por vez

- **Decision**: `window.matchMedia` com os mesmos pontos de quebra do CSS do site: `(min-width: 1024px)` → 3, `(min-width: 640px)` → 2, senão 1. Atualiza ao redimensionar.
- **Rationale**: Mantém a grade visual do protótipo (`sm:grid-cols-2 lg:grid-cols-3`) e FR-001.

## 3. Troca automática e pausa

- **Decision**: `setTimeout` de 6 s reiniciado a cada mudança de índice; pausado enquanto houver mouse sobre a seção (`mouseenter/leave`), foco dentro dela (`focusin/focusout`), toque ativo, aba oculta (`document.visibilityState`) ou `prefers-reduced-motion: reduce` (aí também sem transição).
- **Rationale**: FR-003, FR-008 e o caso de borda da aba em segundo plano; reiniciar após cada interação evita avanço logo depois de um clique.
- **Alternatives considered**: `setInterval` fixo — acumula/atropela cliques do visitante.

## 4. Acessibilidade

- **Decision**: Região com `aria-roledescription="carrossel"` e `aria-label="Equipe"`; cada card visível com `aria-roledescription="slide"` e rótulo "N de 8"; cards fora da área visível com `aria-hidden` e links com `tabIndex=-1`; setas "Anterior"/"Próximo"; indicadores "Ir para {nome}" com `aria-current`. Região `aria-live="off"` durante troca automática e `polite` quando o visitante navega.
- **Rationale**: FR-007, padrão de carrossel do WAI-ARIA APG.

## 5. Classes disponíveis no CSS estático

- **Decision**: Reaproveitar só classes já presentes em `site.css` (conferido: `h-11 w-11`, `border-primary-foreground/40`, `hover:bg-accent`, `hover:text-accent-foreground`, `w-8`, `h-2`, `w-2`, `bg-accent`, `bg-primary-foreground/30`, `sm:flex-row`, `sm:items-end`, `sm:justify-between`, `group-hover:scale-105`, `group-hover:underline`, `cursor-pointer`, `overflow-hidden`, `transition-all`). Deslocamento, largura dos slides e transição vão em `style` inline.
- **Rationale**: O CSS do site é compilado e fixo (feature 100, research §2); classes novas não teriam efeito.

## 6. Fonte e tratamento de cada logo

A exportação aprovada só tem as logos em 74×45 px (conferido no HTML), então todas vêm dos sites oficiais. Caixa de exibição: até 144×64 px CSS → alvo ≥ 288 px de largura (2×); rasters reduzidos para no máximo 432×192 (3×).

| Empresa | Fonte oficial | Tratamento | Formato final |
|---|---|---|---|
| Equatorial | `ri.equatorialenergia.com.br` — `EQUATORIAL-ENERGIA-LOGO-01.jpg` (3100 px) | recorte das margens, redução | WebP |
| PRIO | `prio3.com.br` — `logo_prio.png` (735 px, branca) + `logo_verde.png` (gradiente oficial) | aplica o gradiente verde oficial na versão grande, mantendo o visual aprovado | WebP |
| Constellation | `theconstellation.com` — `logo_1.jpg` (238 px, maior versão colorida publicada) | recorte | WebP — **sinalizada**: ~1,65× |
| BW Energy | `bwenergy.no` — `logo.svg` | nenhum | SVG |
| Bunker One | `bunkerone.com` — `footer-logo.png` (392 px, texto preto) | recorte | WebP |
| Foresea | `foresea.com` — `logo.svg` (texto branco) | texto branco → azul-marinho da marca (`#0B0D38`) | SVG |
| V.Ships | `brand.v.group` (guia de marca da V.Group) — `Sub-brands-microsite.png` | recorte "V.SHIPS", cor única V. Green escuro (`#052E2B`) com transparência | WebP |
| Welltec | `welltec.com` — `logo-green.svg` | nenhum (cor oficial atual) | SVG |
| Salinas Gold | `salinasgold.com.br` — `logo-1-Hor--scaled.png` (2560 px) | recorte, redução | WebP |
| Cladtek | `cladtek.com` — `Cladtek-Main-Logo-No-Tag-scaled-cropped.png` (2560 px, azul) | recorte, redução | WebP |
| CNPC Brasil | `cnpcbrasil.com.br` — `CNPC-Brasil.png` (250 px, única versão publicada) | recorte | WebP — **sinalizada**: ~1,74× |
| Prosafe | `prosafe.com` — `footer-logotype.svg` (texto branco) | texto branco → preto | SVG |

- **Rationale**: SVG quando a empresa publica (nitidez em qualquer densidade, poucos KB); WebP para rasters (menor que PNG, transparência). Recolorir só textos brancos de versões "para fundo escuro" preserva a forma oficial e deixa legível sobre a caixa branca.
- **Alternatives considered**: sites agregadores de logos (não oficiais, contra a decisão do usuário); ampliar as 74×45 atuais com IA/upscale (inventa detalhes da marca).
- **Pendência**: Constellation e CNPC Brasil ficam nítidas no tamanho exibido em telas 1×, levemente suaves em 2×; se a Ocean tiver os arquivos vetoriais desses clientes, basta trocar os dois arquivos.
