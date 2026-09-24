# Feature Specification: Cabeçalho com Filtros Fixo no Scroll

**Feature Branch**: `076-cabecalho-filtro-fixo`

**Created**: 2026-09-23

**Status**: Draft

**Input**: User description: "fixar o cabeçalho da tela, basicamente nas telas que tem botao de filtrro no topo deve deixar ela fixa não deve descer no scroll"

## Clarifications

### Session 2026-09-23

- Q: Em telas com título/ações e filtros em blocos separados, o que fica fixo ao rolar? → A: Título/ações e barra de filtros ficam fixos (empilhados no topo)
- Q: O Dashboard (home) entra no escopo? → A: Incluir o Dashboard (filtros de período ficam fixos ao rolar)
- Q: Com título e filtros fixos, o que acontece com cards de KPI entre eles? → A: Cards de KPI rolam com o conteúdo; só título/ações + filtros ficam fixos

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ajustar filtros sem perder o contexto ao rolar (Priority: P1)

Como usuário (admin ou visualizador) que consulta uma listagem longa, ao rolar a página para baixo quero que a área do topo com os controles de filtro (e o título da tela quando estiver no mesmo bloco) permaneça visível, para eu poder mudar mês, status, categoria ou outros filtros sem precisar subir até o início da página.

**Why this priority**: É o problema central do pedido; hoje, em várias telas, os filtros somem com o scroll e o usuário perde tempo subindo e descendo.

**Independent Test**: Em qualquer tela com filtros no topo e conteúdo longo o bastante para rolar, rolar para baixo e confirmar que os controles de filtro continuam acessíveis sem subir a página.

**Acceptance Scenarios**:

1. **Given** uma tela com controles de filtro no topo e conteúdo que gera rolagem vertical, **When** o usuário rola o conteúdo para baixo, **Then** a área de cabeçalho com os filtros permanece fixa e utilizável
2. **Given** a área de filtros fixa após o scroll, **When** o usuário altera um filtro, **Then** o filtro aplica normalmente e o resultado da listagem/conteúdo abaixo atualiza sem exigir que o usuário volte ao topo
3. **Given** uma tela em que título/ações e filtros estão em blocos separados (ex.: Contas a Pagar), **When** o usuário rola a página, **Then** ambos os blocos permanecem fixos, empilhados no topo, e continuam utilizáveis
4. **Given** uma tela com cards de KPI entre o título e os filtros, **When** o usuário rola a página, **Then** os KPIs sobem e saem da vista, enquanto título/ações e filtros permanecem fixos e passam a ficar contíguos no topo

---

### User Story 2 - Padrão consistente nas telas com filtro no topo (Priority: P1)

Como usuário que navega entre módulos (NFs, Contas a Pagar, Contas a Receber, Férias, DH, Bônus, Auditoria, Fluxo de Caixa, Dashboard e demais telas com filtro no topo), espero o mesmo comportamento de cabeçalho fixo, no padrão já presente em Fluxo de Caixa, para não depender de memorizar qual tela “prende” os filtros.

**Why this priority**: O pedido é explícito para as telas que têm filtro no topo; inconsistência entre módulos reduz usabilidade.

**Independent Test**: Percorrer as telas com filtros no topo, forçar scroll e verificar cabeçalho fixo em cada uma; telas que já se comportam assim (ex.: Fluxo de Caixa) servem de referência de aceite.

**Acceptance Scenarios**:

1. **Given** qualquer tela operacional do Ocean App que exibe controles de filtro no topo da área de conteúdo (incluindo o Dashboard), **When** o usuário rola a página, **Then** o bloco de cabeçalho com filtros permanece fixo (não “desce” junto com o conteúdo)
2. **Given** a tela Fluxo de Caixa como referência de comportamento desejado, **When** o usuário compara com as demais telas no escopo (incluindo o Dashboard), **Then** o comportamento de fixação do cabeçalho com filtros é equivalente em usabilidade

---

### User Story 3 - Não cobrir conteúdo nem atrapalhar ações (Priority: P2)

Como usuário que lê tabelas, cards ou gráficos abaixo do cabeçalho, o bloco fixo não deve esconder o início do conteúdo de forma confusa nem impedir o uso de botões de ação que fazem parte do mesmo cabeçalho (criar, exportar, importar, etc.).

**Why this priority**: A melhoria de acesso aos filtros não pode regredir leitura nem ações já disponíveis no topo.

**Independent Test**: Com o cabeçalho fixo após scroll, acionar botões do cabeçalho e verificar que o conteúdo imediatamente abaixo permanece legível (não fica “por baixo” do bloco fixo de forma ilegível).

**Acceptance Scenarios**:

1. **Given** um cabeçalho fixo com botões de ação, **When** o usuário rola e clica em uma ação do cabeçalho, **Then** a ação responde normalmente
2. **Given** tema claro ou escuro, **When** o usuário rola o conteúdo sob o cabeçalho fixo, **Then** o cabeçalho permanece legível (fundo opaco o suficiente para não misturar texto do cabeçalho com o conteúdo que passa por baixo)

---

### Edge Cases

- Tela com pouco conteúdo (sem scroll): o cabeçalho aparece normalmente; não há comportamento “preso” estranho
- Telas sem controles de filtro no topo: fora do escopo desta feature; layout atual permanece
- Dashboard (home): entra no escopo; filtros de período (e título/ações do topo, quando houver) permanecem fixos ao rolar
- Cabeçalho da aplicação (barra superior global / menu): permanece como está; esta feature trata do cabeçalho da *página* (título + filtros na área de conteúdo)
- Cabeçalho de colunas de tabela (já tratado em outra feature): permanece independente; esta feature não altera o comportamento do cabeçalho interno das tabelas
- Cards de resumo / KPIs entre o título e os filtros (ou logo abaixo dos filtros): rolam com o conteúdo e saem da vista; não fazem parte do cabeçalho fixo
- Título/ações e filtros em blocos separados: os dois blocos ficam fixos e, após os KPIs saírem da vista, passam a ficar empilhados de forma contígua no topo (sem espaço vazio residual dos cards)
- Viewport estreita (mobile / janela reduzida): o bloco fixo continua acessível; filtros e ações podem quebrar linha, mas não somem ao rolar
- Modal aberto sobre a página: o cabeçalho fixo da página não deve atrapalhar o uso do modal
- Impressão: não exigir cabeçalho fixo na saída impressa; prioridade é a experiência na tela

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Em toda tela do Ocean App que apresente controles de filtro no topo da área de conteúdo — incluindo o Dashboard — o sistema MUST manter fixo, durante a rolagem vertical, o bloco de cabeçalho que contém esses filtros
- **FR-002**: O bloco fixo MUST permanecer utilizável após o scroll (alterar filtros e acionar ações do mesmo bloco sem voltar ao topo)
- **FR-003**: O bloco fixo MUST incluir título da tela, controles de filtro e botões de ação principais do topo (criar, importar, exportar e equivalentes). Quando título/ações e filtros estiverem em blocos separados na página, AMBOS MUST permanecer fixos e empilhados no topo durante o scroll (não apenas a barra de filtros)
- **FR-003a**: Cards de resumo / KPIs MUST NÃO ficar fixos; ao rolar, saem da vista. Após saírem, título/ações e filtros MUST permanecer empilhados de forma contígua no topo (sem espaço vazio residual dos cards)
- **FR-004**: Telas sem filtros no topo MUST permanecer fora do escopo desta feature (sem mudança obrigatória de comportamento de scroll)
- **FR-005**: O cabeçalho fixo da página MUST NÃO substituir nem remover o comportamento de cabeçalho fixo das colunas de tabela quando este já existir
- **FR-006**: O cabeçalho fixo MUST permanecer legível sobre o conteúdo que rola por baixo (fundo opaco adequado em tema claro e escuro)
- **FR-007**: O sistema MUST preservar o funcionamento dos filtros e das ações do cabeçalho após a fixação (sem regressão de comportamento de filtragem ou de botões)

### Key Entities

- **Cabeçalho de página com filtros**: região superior da área de conteúdo de uma tela, composta pelo(s) bloco(s) de título, ações do topo e controles de filtro; quando esses elementos estão em blocos distintos, todos fazem parte do cabeçalho fixo empilhado
- **Tela com filtro no topo**: qualquer tela do Ocean App (incluindo Dashboard e módulos de listagem) em que o usuário filtra a listagem ou o conteúdo por controles posicionados no topo (ex.: mês, ano, status, categoria, colaborador)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das telas no escopo (com filtros no topo), após rolar o conteúdo, o usuário consegue alterar um filtro sem precisar rolar de volta ao início da página
- **SC-002**: Em teste manual com pelo menos 5 telas distintas no escopo (incluindo o Dashboard e pelo menos uma tela com KPIs entre título e filtros), o cabeçalho com título/ações e filtros permanece visível e acionável durante toda a rolagem vertical
- **SC-003**: Em validação com tema claro e escuro, o texto e os controles do cabeçalho fixo continuam legíveis (sem sobreposição ilegível com o conteúdo)
- **SC-004**: Usuários de teste conseguem completar o fluxo “rolar → mudar filtro → ver resultado” na primeira tentativa, sem procurar o filtro “sumido”
- **SC-005**: Em telas com KPIs entre título e filtros, após rolar o suficiente para os KPIs saírem da vista, não permanece faixa vazia entre o título fixo e os filtros fixos

## Assumptions

- A referência de comportamento desejado é a tela Fluxo de Caixa, onde o bloco de título e filtros já permanece fixo ao rolar; em telas com blocos separados, o efeito equivalente é título/ações + filtros fixos e empilhados
- “Botão de filtro” no pedido do usuário inclui qualquer controle de filtro no topo (selects, campos de período, status, etc.), não apenas um único botão rotulado “Filtro”
- Cards de resumo / KPIs abaixo (ou entre) título e filtros rolam com o conteúdo e não ficam fixos; após saírem da vista, título/ações e filtros ficam empilhados de forma contígua
- O Dashboard (home) está no escopo desta feature
- O escopo é apenas UX de layout na área de conteúdo das telas; não envolve novas regras de negócio, permissões ou persistência de filtros
- Papéis `admin` e `visualizador` veem o mesmo comportamento de fixação; diferenças de botões (ex.: criar só para admin) seguem as regras já existentes
- Não se exige mudança no cabeçalho global da aplicação (barra superior / sidebar)
- Impressão e PDF via impressão do navegador não precisam reproduzir o efeito de cabeçalho fixo
