# Feature Specification: Carrossel da Equipe e logos de clientes em alta resolução no site

**Feature Branch**: `101-site-equipe-carrossel-logos`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User description: "Rode o fluxo completo do speckit para o que for crítico, o que não for apenas implemente: os quadros de Executive Search etc. ao passar o mouse o fundo deve se destacar; carrossel da equipe não está implementado; a logo das empresas está com baixa resolução; linkar LinkedIn."

## Contexto

O site institucional (feature 100) foi publicado reproduzindo a exportação aprovada. Na revisão, a Ocean apontou quatro ajustes. Dois são pequenos e foram feitos direto, fora desta spec:

- **Destaque dos cards de solução no hover** (Executive Search, Offshore Talent, Outsourcing, Development & Outplacement): o fundo do card passa para a cor da divisão, com textos claros, como já acontece nos cards da página Soluções.
- **LinkedIn da Ocean**: o endereço usado no site (`/company/oceantalentsolutions`) não é a página da empresa; passou a ser `/company/ocean-talent-solutions/`.

Esta spec cobre os dois ajustes que mudam o que a feature 100 entregou:

1. **Equipe em carrossel**: o protótipo aprovado previa a Equipe como carrossel (setas anterior/próximo e indicadores de página), mas o site mostra os 8 consultores numa grade fixa. Também no protótipo, a foto e o nome de cada consultor levam ao LinkedIn dele; hoje só o ícone pequeno faz isso.
2. **Logos dos clientes nítidas**: as 12 logos de "Empresas que confiam na Ocean" vieram da exportação com 74×45 pixels e aparecem esticadas e borradas nas caixas, principalmente em telas de alta densidade (celulares, notebooks retina). A exportação não tem versões melhores; é preciso obter as logos em boa resolução.

## Clarifications

### Session 2026-10-27

- Q: O carrossel da Equipe deve trocar de página sozinho? → A: Sim, a cada ~6 segundos, pausando quando o mouse está em cima ou o visitante interage; e o carrossel deve ser infinito (gira sem fim, sem "voltar ao começo" visível).
- Q: Como as logos dos clientes devem aparecer? → A: Coloridas, como na exportação aprovada, só que nítidas; se a versão da exportação não estiver nítida, buscar a logo no site oficial da empresa.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitante percorre a Equipe em carrossel (Priority: P1)

Na página inicial, o visitante chega à seção Equipe e vê alguns consultores por vez. O carrossel avança sozinho, um consultor por vez, girando sem fim. O visitante também pode usar as setas (anterior/próximo), os indicadores ou deslizar o dedo, e clica na foto ou no nome de um consultor para abrir o LinkedIn dele.

**Why this priority**: É o visual aprovado no protótipo e reduz a altura da seção, que hoje ocupa três linhas de cards no computador e oito cards empilhados no celular.

**Independent Test**: Abrir a página inicial no computador e no celular, esperar o carrossel avançar sozinho, navegar pela Equipe com as setas, com os indicadores e (no celular) deslizando o dedo, e conferir que os 8 consultores aparecem, que o giro é contínuo e que foto, nome e ícone abrem o LinkedIn certo em nova aba.

**Acceptance Scenarios**:

1. **Given** a seção Equipe no computador, **When** a página carrega, **Then** aparecem 3 consultores lado a lado, as setas anterior/próximo ao lado do título e um indicador por consultor abaixo dos cards, com o do primeiro consultor visível destacado.
2. **Given** a seção Equipe sem interação, **When** passam cerca de 6 segundos, **Then** o carrossel desliza um consultor para o lado, e continua assim indefinidamente.
3. **Given** o último consultor (Anna Luiza Reguffe) à direita, **When** o carrossel avança, **Then** o primeiro consultor (Fabio d'Ave) entra em seguida, deslizando no mesmo sentido, sem o carrossel voltar visivelmente ao começo (o mesmo vale para "anterior" a partir do primeiro).
4. **Given** o mouse sobre a seção Equipe, ou o foco do teclado dentro dela, ou o dedo tocando o carrossel, **When** essa condição dura, **Then** o carrossel não avança sozinho; ao sair, volta a avançar após ~6 segundos.
5. **Given** os indicadores, **When** o visitante clica num deles, **Then** o carrossel vai até aquele consultor (ele passa a ser o primeiro visível).
6. **Given** um celular, **When** a seção Equipe aparece, **Then** mostra 1 consultor por vez, e o visitante passa para o próximo ou o anterior pelas setas ou deslizando o dedo para o lado.
7. **Given** um tablet (tela média), **When** a seção Equipe aparece, **Then** mostra 2 consultores por vez.
8. **Given** um consultor visível, **When** o visitante clica na foto ou no nome, **Then** abre uma janela com foto, nome, cargo, bio e LinkedIn do consultor (como no protótipo); **When** clica no ícone do LinkedIn, **Then** o perfil abre em nova aba.
9. **Given** um visitante que navega pelo teclado, **When** usa Tab, **Then** alcança as setas, os indicadores e os links só dos consultores visíveis, e Enter aciona cada um.

---

### User Story 2 - Visitante vê as logos dos clientes nítidas (Priority: P1)

Na seção "Empresas que confiam na Ocean", o visitante vê as 12 logos de clientes nítidas, sem borrão ou serrilhado, no computador e no celular.

**Why this priority**: As logos são prova social para potenciais clientes; logos borradas passam imagem de descuido.

**Independent Test**: Abrir a página inicial num celular e num notebook com tela de alta densidade, aproximar a seção de clientes e conferir que as 12 logos estão nítidas, com as cores e proporções originais das marcas.

**Acceptance Scenarios**:

1. **Given** a seção de clientes, **When** a página carrega, **Then** aparecem as mesmas 12 empresas da exportação aprovada, na mesma ordem, coloridas, em caixas brancas do mesmo tamanho de hoje.
2. **Given** uma tela de alta densidade (2×), **When** o visitante olha uma logo, **Then** ela aparece nítida, sem borrão nem serrilhado visível.
3. **Given** logos de proporções diferentes (horizontais, quadradas), **When** exibidas, **Then** cada uma cabe inteira na caixa, centralizada, sem distorção, e com peso visual equilibrado entre elas.

---

### Edge Cases

- **Navegação muito rápida no carrossel** (cliques seguidos nas setas): cada clique avança um consultor, sem pular, travar ou mostrar espaço vazio.
- **Mudança de tamanho da janela** (ex.: girar o celular ou redimensionar o navegador): o número de consultores por vez se ajusta e o carrossel nunca mostra espaço vazio.
- **Fim da lista**: como o giro é infinito, depois do 8º consultor vem o 1º, sem cards vazios nem salto para trás.
- **Aba do navegador em segundo plano**: o carrossel não acumula avanços; ao voltar, continua de onde estava.
- **Visitante que prefere menos movimento** (configuração do sistema): o carrossel não avança sozinho e a troca manual acontece sem animação de deslize.
- **Imagem de logo que não carrega**: o nome da empresa aparece no lugar (texto alternativo), sem quebrar o layout da grade.
- **Logo de cliente sem versão nítida no site oficial**: usar a melhor versão oficial encontrada (site, kit de imprensa, perfil oficial da empresa), desde que fique nítida no tamanho exibido; se nenhuma ficar, a empresa é sinalizada para a Ocean fornecer o arquivo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A seção Equipe MUST exibir os 8 consultores em carrossel, com 3 por vez no computador, 2 em telas médias e 1 no celular.
- **FR-002**: O carrossel MUST avançar um consultor por vez e ser infinito: depois do último vem o primeiro (e antes do primeiro, o último), sempre deslizando no sentido da navegação, sem volta visível ao começo.
- **FR-003**: O carrossel MUST avançar sozinho a cada ~6 segundos e MUST pausar enquanto o mouse estiver sobre a seção, o foco do teclado estiver dentro dela ou o visitante estiver tocando o carrossel.
- **FR-004**: O carrossel MUST ter setas anterior/próximo e um indicador por consultor, com destaque no indicador do primeiro consultor visível; clicar num indicador leva até aquele consultor.
- **FR-005**: No celular e em telas sensíveis ao toque, o visitante MUST poder avançar ou voltar deslizando o dedo para os lados.
- **FR-006**: Foto e nome de cada consultor MUST abrir uma janela (modal) com foto, nome, cargo, bio (quando cadastrada) e o ícone do LinkedIn; o ícone do LinkedIn, no card e na janela, MUST abrir o perfil em nova aba. A janela fecha pelo X, pela tecla Esc ou clicando fora, e o carrossel não avança enquanto ela está aberta.
- **FR-007**: Setas, indicadores e links do carrossel MUST ser acessíveis por teclado e ter nomes compreensíveis para leitores de tela (ex.: "Anterior", "Próximo", "Ir para Raquel Haddad"); consultores fora da área visível MUST NOT receber foco.
- **FR-008**: Com a preferência do sistema por menos movimento, o carrossel MUST NOT avançar sozinho e MUST trocar sem animação de deslize.
- **FR-009**: A seção de clientes MUST exibir as mesmas 12 empresas, na mesma ordem, com logos coloridas em resolução suficiente para ficarem nítidas em telas de densidade 2× no tamanho em que são mostradas; a fonte da logo é o site oficial da empresa sempre que a versão da exportação não for nítida.
- **FR-010**: As logos MUST manter as cores e proporções originais de cada marca, sem distorção, centralizadas na caixa.
- **FR-011**: O visual das seções Equipe e Clientes (cores, cards, tipografia, fundo animado) MUST continuar o da exportação aprovada.
- **FR-012**: As novas logos MUST NOT aumentar perceptivelmente o tempo de carregamento da página inicial.

### Key Entities

- **Consultor**: pessoa da equipe exibida no site; tem nome, cargo, foto e endereço do LinkedIn. Lista fixa (8).
- **Cliente**: empresa exibida em "Empresas que confiam na Ocean"; tem nome e logo. Lista fixa (12).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sem nenhuma interação, os 8 consultores passam pela área visível em até 1 minuto, e o giro continua sem interrupção nem salto visível.
- **SC-002**: A seção Equipe ocupa no máximo a altura de uma linha de cards no computador e de um card no celular.
- **SC-003**: 12 de 12 logos usam o maior arquivo oficial disponível e aparecem sem borrão em telas comuns; numa tela de densidade 2×, pelo menos 10 de 12 ficam totalmente nítidas e as demais são sinalizadas à Ocean para envio do arquivo vetorial.
- **SC-004**: O peso total das 12 logos fica abaixo de 300 KB, mantendo os textos da página inicial visíveis em até 3 segundos numa conexão móvel comum.
- **SC-005**: 100% dos links de LinkedIn da seção Equipe (foto, nome e ícone) abrem o perfil correto.

## Assumptions

- As logos em alta resolução vêm dos sites oficiais das próprias empresas (ou, na falta, de outra fonte oficial da marca), mantendo a versão colorida usada na exportação; a Ocean já tem autorização para exibir as logos dos clientes (premissa da feature 100).
- O carrossel segue o visual do componente do protótipo aprovado (setas redondas à direita do título e indicadores abaixo dos cards), com as fotos da equipe já usadas no site; a troca automática e o giro infinito são acréscimos pedidos nesta feature.
- Os indicadores passam a ser um por consultor (8), porque o carrossel avança um consultor por vez.
- A ordem dos consultores e das empresas é a mesma de hoje.
- O cartão "Saiba mais" e as demais seções da página inicial não mudam nesta feature.
