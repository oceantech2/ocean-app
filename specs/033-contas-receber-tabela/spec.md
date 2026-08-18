# Feature Specification: Tabela Contas a Receber — Cabeçalho em Duas Linhas e Coluna/Cabeçalho Fixos

**Feature Branch**: `033-contas-receber-tabela`

**Created**: 2026-08-18

**Status**: Draft

**Input**: User description: "na tela de contas a receber o titulo dos itens na tabela esta ocupando muito espaço, quero que ele fique mais alto e entao caiba o titulo em duas linhas ai pode quebrar a linha. além disso a primeira coluna e o titulo devem ser fixo e entao ter um scroll tanto vertical quanto horizontal (o scroll horizontal deve ser no titulo)"

## Clarifications

### Session 2026-08-18

- Q: O que cabe nas duas linhas da primeira coluna? → A: “Título” não é o texto do item (projeto/razão social). São os **nomes das colunas do cabeçalho** da tabela (ex.: Projeto, Origem, Método de pagamento, Bruto, Imposto). A quebra em até duas linhas e o aumento de altura aplicam-se à **linha de cabeçalho**, para as colunas poderem ser mais estreitas.
- Q: A coluna Ações fica fixa à direita? → A: Sim — **Ações** permanece fixa à direita, além da primeira coluna à esquerda e do cabeçalho no topo.
- Q: Onde fica o scroll vertical? → A: A **tabela** tem área própria: o cabeçalho fica fixo no topo dessa área e só as linhas de dados rolam na vertical dentro dela. Não é o cabeçalho grudado no topo da janela nem a ausência de scroll vertical da tabela.
- Q: Qual a altura da área da tabela? → A: Ocupa o **espaço restante da tela** (abaixo de título e filtros); se as linhas não couberem, o scroll é interno.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ler os nomes das colunas em duas linhas sem alargar o cabeçalho (Priority: P1)

Na página **Contas a Receber**, o usuário vê a linha de cabeçalho da tabela (nomes como Projeto, Origem, Método de pagamento, Bruto, Imposto, etc.). Essa linha fica **mais alta** para que cada nome de coluna caiba em **até duas linhas**, com quebra de linha. Nomes curtos (ex.: NF, Bruto) permanecem em uma linha; nomes longos (ex.: Método de pagamento) quebram na segunda linha em vez de forçar uma coluna larga só para o rótulo.

**Why this priority**: Cabeçalhos em uma linha larga consomem largura que deveria servir aos dados e empurram colunas para fora da tela.

**Independent Test**: Abrir Contas a Receber e confirmar que a linha de nomes das colunas é mais alta que as linhas de dados típicas, que rótulos longos quebram em no máximo duas linhas e que as colunas não se alargam só para caber o rótulo em uma linha.

**Acceptance Scenarios**:

1. **Given** um nome de coluna que cabe em uma linha na largura daquela coluna (ex.: Bruto, NF), **When** o usuário vê o cabeçalho, **Then** o nome aparece em uma única linha dentro da célula do cabeçalho.
2. **Given** um nome de coluna que não cabe em uma linha (ex.: Método de pagamento), **When** o usuário vê o cabeçalho, **Then** o nome quebra e ocupa até duas linhas, sem expandir a coluna só para manter o rótulo em uma linha.
3. **Given** um nome de coluna que ultrapassaria duas linhas na largura da coluna, **When** o usuário vê o cabeçalho, **Then** o texto visível limita-se a duas linhas e o nome completo permanece acessível (por exemplo ao passar o cursor ou foco).
4. **Given** a tabela com várias colunas, **When** o usuário compara com o cabeçalho anterior (rótulos em uma linha, sem quebra), **Then** as colunas ocupam menos largura por causa dos rótulos e mais colunas cabem na área visível.

---

### User Story 2 - Manter primeira coluna e cabeçalho visíveis ao rolar (Priority: P1)

O usuário navega uma lista com muitas linhas e muitas colunas. A **primeira coluna** permanece visível à esquerda e a coluna **Ações** permanece visível à direita ao rolar na horizontal. A **linha de nomes das colunas** (cabeçalho) permanece visível ao rolar na vertical. Assim o usuário não perde o contexto de qual item está vendo, o nome de cada coluna nem os botões de ação da linha.

**Why this priority**: Sem âncora visual, a leitura da tabela larga e longa exige memorizar nomes de colunas e itens, o que aumenta erro e tempo de consulta.

**Independent Test**: Com a tabela preenchida além da área visível, rolar na vertical e na horizontal e confirmar que o cabeçalho, a primeira coluna e a coluna Ações continuam visíveis e alinhados às células correspondentes.

**Acceptance Scenarios**:

1. **Given** a tabela com mais linhas do que a altura visível da área da tabela, **When** o usuário rola na vertical, **Then** a linha de nomes das colunas permanece fixa no topo da área da tabela e as linhas de dados passam por baixo.
2. **Given** a tabela com mais colunas do que a largura visível, **When** o usuário rola na horizontal, **Then** a primeira coluna permanece fixa à esquerda, a coluna **Ações** permanece fixa à direita e as colunas do meio deslizam.
3. **Given** rolagem simultânea (vertical e horizontal), **When** o usuário observa os cantos, **Then** a célula de cabeçalho da primeira coluna permanece no canto superior esquerdo e a célula de cabeçalho de Ações no canto superior direito, alinhadas às respectivas colunas de dados.
4. **Given** um visualizador ou um administrador, **When** usa a tabela, **Then** o comportamento de fixação e rolagem é o mesmo (layout de leitura, sem mudança de permissão).

---

### User Story 3 - Rolar a tabela na vertical e na horizontal, com rolagem horizontal no cabeçalho (Priority: P1)

A **área da tabela** ocupa o **espaço restante da tela** abaixo do título da página e dos filtros. Nessa área há **rolagem vertical** para percorrer os itens e **rolagem horizontal** para percorrer as colunas. O cabeçalho permanece no topo **dessa área**; as linhas passam por baixo. O controle de rolagem horizontal fica associado à **linha de nomes das colunas** (cabeçalho), para que o usuário desloque as colunas sem precisar ir ao rodapé da tabela.

**Why this priority**: Em tabelas altas, a barra horizontal só no rodapé obriga a descer até o fim para mudar de coluna; colocar a rolagem no cabeçalho reduz esse deslocamento.

**Independent Test**: Com conteúdo que ultrapasse altura e largura da área da tabela, usar a rolagem vertical no corpo e a rolagem horizontal no cabeçalho e verificar que colunas e linhas se movem de forma sincronizada com a primeira coluna e o cabeçalho fixos conforme as histórias anteriores.

**Acceptance Scenarios**:

1. **Given** mais linhas do que a altura da área da tabela, **When** o usuário usa a rolagem vertical **dentro da área da tabela**, **Then** as linhas de dados se movem, o cabeçalho permanece no topo dessa área e o restante da página (filtros, título da tela) não precisa descer para o usuário percorrer as linhas visíveis nessa área.
2. **Given** mais colunas do que a largura da área da tabela, **When** o usuário usa a rolagem horizontal no cabeçalho, **Then** as colunas do meio se deslocam em conjunto com seus nomes; a primeira coluna e a coluna Ações permanecem fixas.
3. **Given** o usuário desloca as colunas pelo cabeçalho, **When** observa as células de dados, **Then** cada coluna de dado permanece alinhada ao respectivo nome no cabeçalho.
4. **Given** poucas linhas e poucas colunas que cabem na área visível, **When** o usuário vê a tabela, **Then** não é obrigado a interagir com barras de rolagem para ler o conteúdo visível (barras podem existir desabilitadas ou ocultas, desde que não atrapalhem a leitura).
5. **Given** a página com título e filtros visíveis, **When** o usuário observa o layout, **Then** a área da tabela preenche o espaço que sobra na tela abaixo desses elementos, sem altura fixa artificial (ex.: “sempre 10 linhas”).

---

### Edge Cases

- Tabela vazia: não exibe área de rolagem enganosa; mantém o estado vazio já existente da página.
- Nome de coluna curto: a linha de cabeçalho permanece na altura de duas linhas (ou na altura mínima para acomodar o maior rótulo visível), sem comprimir rótulos longos.
- Nome de coluna com espaços ou palavras longas: a quebra ocorre de forma legível; palavra que não cabe na largura da coluna também quebra em vez de forçar alargamento.
- Ordenação pelo cabeçalho (quando já existir): continua disponível; o indicador de ordem não impede a leitura do nome em duas linhas.
- Janela estreita (ex.: notebook): primeira coluna fixa não cobre a maior parte da tela; as demais colunas continuam acessíveis pela rolagem horizontal no cabeçalho.
- Janela redimensionada: a área da tabela acompanha o espaço restante; cabeçalho, primeira coluna e Ações continuam fixos dentro da nova altura/largura.
- Rolagem da **página** (fora da tabela): filtros e título da tela permanecem acima da área da tabela; percorrer as linhas da lista usa o scroll **interno** dessa área, não o cabeçalho grudado no topo da janela do navegador.
- Células de **dados** da primeira coluna (projeto, razão social, etc.): não são o alvo da quebra de duas linhas desta feature; mantêm a apresentação já existente, salvo a fixação à esquerda.
- Coluna **Ações**: permanece fixa à direita na rolagem horizontal; o cabeçalho “Ações” também fica fixo no canto superior direito. Os botões da linha continuam utilizáveis e alinhados à coluna.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Na página Contas a Receber, cada **nome de coluna no cabeçalho** DEVE poder quebrar linha e ocupar no máximo duas linhas visíveis.
- **FR-002**: A linha de cabeçalho DEVE ser mais alta que uma linha simples de rótulo, de modo a acomodar nomes em duas linhas; as colunas NÃO DEVEM se alargar só para manter o nome em uma linha.
- **FR-003**: Nomes de coluna mais longos que duas linhas DEVEM ser truncados na segunda linha, com o texto completo disponível por indicação ao passar o cursor ou equivalente acessível.
- **FR-004**: A linha de nomes das colunas DEVE permanecer visível (fixa) enquanto o usuário rola as linhas de dados na vertical, dentro da área da tabela.
- **FR-005**: A primeira coluna DEVE permanecer visível (fixa à esquerda) enquanto o usuário rola as colunas do meio na horizontal.
- **FR-006**: A tabela DEVE ter uma **área própria** que ocupa o **espaço restante da tela** abaixo do título da página e dos filtros, com rolagem vertical (linhas de dados) e horizontal (colunas) quando o conteúdo ultrapassar essa área. O cabeçalho permanece no topo dessa área; a rolagem vertical das linhas ocorre **dentro** dela, não como cabeçalho fixo no topo da janela.
- **FR-007**: A rolagem horizontal DEVE estar disponível no cabeçalho (linha de nomes das colunas), de modo que o usuário não precise ir ao rodapé da tabela para deslocar as colunas.
- **FR-008**: Ao rolar na horizontal pelo cabeçalho, os nomes das colunas e as células de dados correspondentes DEVEM permanecer alinhados.
- **FR-009**: Filtros, ordenação, paginação, ações e demais comportamentos já existentes da página Contas a Receber DEVEM continuar funcionando; esta feature altera apenas a apresentação e a navegação da tabela.
- **FR-010**: O mesmo layout de tabela aplica-se a administrador e visualizador.
- **FR-011**: A quebra em duas linhas aplica-se somente aos **nomes do cabeçalho**, não ao conteúdo das células de dados (incluindo o texto de projeto na primeira coluna).
- **FR-012**: A coluna **Ações** DEVE permanecer visível (fixa à direita) enquanto o usuário rola as colunas do meio na horizontal, inclusive o nome “Ações” no cabeçalho.

### Key Entities

- **Área da tabela**: região de consulta da lista que preenche o espaço restante da tela abaixo do título e dos filtros. Contém o cabeçalho fixo no topo e o corpo com as linhas; é nela que ocorrem as rolagens vertical e horizontal.
- **Cabeçalho da tabela**: linha de **nomes das colunas** (Projeto, Origem, Método de pagamento, Bruto, Imposto, e demais colunas já existentes). É o alvo da altura extra, da quebra em duas linhas, da fixação no topo da área da tabela e da rolagem horizontal.
- **Primeira coluna**: coluna mais à esquerda da tabela; permanece visível na rolagem horizontal. O conteúdo das células de dados dessa coluna não muda de regra nesta feature.
- **Coluna Ações**: coluna mais à direita da tabela, com os botões da linha; permanece visível na rolagem horizontal.
- **Item de Contas a Receber**: registro já existente exibido nas linhas da tabela. Não há novo cadastro nem alteração de dados persistidos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em uma sessão de consulta típica, o usuário lê os nomes das colunas visíveis (incluindo os longos, em até duas linhas) e vê ao menos três colunas de dados na mesma área, sem o cabeçalho forçar largura de uma linha por rótulo.
- **SC-002**: Nomes de coluna com até o equivalente a duas linhas na largura daquela coluna são lidos por completo no cabeçalho; nomes mais longos mostram duas linhas e o restante sob demanda (cursor/foco) em menos de 2 segundos.
- **SC-003**: Com mais linhas do que a altura da área da tabela (incluindo listas com 20 ou mais linhas a percorrer), o usuário sempre vê os nomes das colunas no topo **dessa área** enquanto percorre a lista pelo scroll interno; não precisa usar o scroll da página para manter o cabeçalho visível.
- **SC-004**: Com mais colunas do que a largura da tela, o usuário desloca as colunas pela rolagem horizontal no cabeçalho e, em 100% dos deslocamentos, a primeira coluna permanece visível à esquerda e a coluna Ações permanece visível à direita.
- **SC-005**: Usuários que já conhecem a página concluem a leitura de um item sem treinar um fluxo novo: a mudança é só de layout do cabeçalho e da navegação da tabela, sem novos passos de cadastro.
- **SC-006**: Em um monitor típico de trabalho, após título e filtros, a área da tabela usa o espaço restante da tela (não uma altura fixa de 10 ou 20 linhas); o usuário vê o máximo de linhas que couberem nessa área antes de rolar internamente.

## Assumptions

- O escopo é exclusivamente a **tabela da página Contas a Receber**. Outras tabelas (Contas a Pagar, Dashboard, etc.) ficam de fora.
- **Título** nesta feature significa sempre o **nome da coluna no cabeçalho** (a “planilha”: Projeto, Origem, Método de pagamento, Bruto, Imposto, …), nunca o texto do registro na célula de dados.
- “O scroll horizontal deve ser no título” significa que o controle de rolagem horizontal fica no **cabeçalho**, sincronizado com as colunas de dados.
- Limite de **duas linhas** para cada nome de coluna no cabeçalho; acima disso, truncar com acesso ao texto completo.
- Células de dados (incluindo projeto/razão social) mantêm a apresentação atual, exceto pela primeira coluna fixa e pelo alinhamento com o cabeçalho ao rolar.
- Não há mudança de regras de negócio, permissões, filtros, ordenação ou persistência.
- A coluna **Ações** permanece fixa à direita (comportamento já conhecido da página, agora obrigatório nesta feature).
- A rolagem vertical das linhas ocorre **dentro da área da tabela**; o cabeçalho não gruda no topo da janela do navegador.
- A altura da área da tabela **não é fixa em número de linhas**: acompanha o espaço restante da tela abaixo de título e filtros.
- Densidade visual permanece compatível com o restante do Ocean App (mesma página, mesmos papéis admin/visualizador).
