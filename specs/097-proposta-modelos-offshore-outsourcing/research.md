# Research: Modelos Offshore Talent e Outsourcing e Fotos de Capa por Setor

## R1 — Como montar as divisões novas

- **Decision**: Uma pasta por divisão (`modelos/<id>/v1/`) com componente que monta `PaginaModelo` e conteúdo em `conteudo/{pt-BR,en-US}.ts`, igual a `outplacement-development`. "Áreas e cargos" e "Benefícios" usam `secaoMeio.tipo = 'metodologia'` com `id` e `titulo` próprios.
- **Rationale**: Os HTML usam a mesma marcação da Metodologia do Executive Search (`.steps` > `.step` com número, título e lista). O tipo existente já renderiza número, título e itens, e o CSS da grade de 3 colunas (3 + 2 com 5 itens) e da impressão já existe.
- **Alternatives considered**: Tipo de seção novo (`areas`/`beneficios`) — rejeitado, seria igual ao `metodologia` com outro nome.

## R2 — Texto de apresentação em dois parágrafos

- **Decision**: `ConteudoDivisao.textoServico` passa a `string[]`; `PaginaModelo` renderiza um `<p className="lead">` por item. Executive Search e Development & Outplacement passam a ter um array de um item, com o mesmo texto.
- **Rationale**: Os HTML novos têm dois `<p class="lead">`. Um tipo único evita ramificação no layout.
- **Alternatives considered**: `string | string[]` — rejeitado, deixa o layout com ramificação por tipo sem ganho.

## R3 — Largura da logo por divisão

- **Decision**: `logo.largura` (px, opcional) em `ConteudoDivisao`, aplicada pela variável CSS `--logo-largura` na `.div-logo`; padrão 220px (Executive Search). Development & Outplacement 290, Offshore Talent 240, Outsourcing 242 (valores dos HTML). No celular continua 190px para todas. Sai o booleano `larga`.
- **Rationale**: Com três larguras diferentes, um booleano não basta; a variável CSS mantém a regra do celular no CSS sem `!important`.
- **Alternatives considered**: Uma classe por divisão no CSS — rejeitado, espalha o dado da divisão entre CSS e conteúdo.

## R4 — Setor Tecnologia e foto por setor

- **Decision**: `tecnologia` em `SETORES` (backend, ordem de dicionário) e em `setores.ts` (frontend), antes de `industria-servicos`. Fotos de `externo/` copiadas para `frontend/public/propostas/setores/<chave>.jpg` **pelo conteúdo da imagem**, porque os nomes vieram trocados: `industria-servicos.jpg` (plataforma) → `oil-gas`; `infraestrutura.jpg` (turbinas) → `energia`; `mineracao.jpg` (aeroporto, idêntica à foto padrão atual) → `infraestrutura`; `oil-gas.jpg` (mina) → `mineracao`; `energia.jpg` (data center) → `tecnologia`. `setores.ts` aponta cada setor para a sua foto e Indústria & Serviços, sem foto, para a padrão. Na capa, `onError` troca para a foto padrão (em vez de esconder a imagem) e só esconde se a própria padrão falhar.
- **Rationale**: Instruções §2 (Tecnologia na posição 5; foto do setor; fallback para a foto embutida, que é a de Infraestrutura). As fotos já vêm tratadas, sem filtro extra; a camada azul `.cover::after` já existe.
- **Alternatives considered**: Hospedar no Supabase Storage — rejeitado, as fotos são estáticas e as logos/foto padrão já ficam em `public/`.

## R5 — Observações e Garantias

- **Decision**: Observações de Investimento dos dois modelos com o primeiro item único do HTML + "Valor mínimo de R$ 15.000,00 por projeto;" + `observacaoImpostos` com o percentual da proposta (feature 092). Observações de Garantias iguais às do Executive Search, `garantiasSempreVisivel: true`; no registro do frontend, `rotuloEscopo: 'Escopo'` e `garantiasSempreVisivel: true`.
- **Rationale**: Instruções: "Escopo, Investimento e Garantias e condições: iguais ao Executive Search", com o texto dos HTML novos.

## R6 — Traduções para inglês

- **Decision**: Tradução feita pela equipe, seguindo o estilo do Executive Search em inglês (ex.: "Minimum fee of BRL 15,000.00 per project;"). Nomes de serviço e cargos já em inglês no original não são traduzidos.
- **Rationale**: Regra da 083 (FR-005): todo conteúdo de divisão existe em pt-BR e en-US.

## R7 — Pasta `externo/`

- **Decision**: Depois de copiar as logos (extraídas dos HTML) e as 5 fotos, remover `externo/` (pedido do usuário). O conteúdo de texto já fica nos arquivos de conteúdo e nesta spec.
