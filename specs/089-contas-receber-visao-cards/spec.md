# Feature Specification: Visão Líquido/Bruto e novos cards em Contas a Receber

**Feature Branch**: `089-contas-receber-visao-cards`

**Created**: 2026-10-13

**Status**: Draft

**Input**: User description: "Aplicar botão de líquido e bruto na tela de contas a receber" + "Modificar os cards de contas a receber (Receita Total + Recebido + Pendente + Vencido)"

**Baseline**: A tela **Contas a Receber** mostra 4 cards fixos que misturam bases: "Bruto Recebido", "Líquido Recebido", "Líquido Pendente" e "Líquido Vencido". Não há total geral do período, e o usuário não consegue ver Pendente/Vencido em valor bruto. A tabela mostra sempre as três colunas de valor (Bruto, Imposto, Líquido). O Dashboard já tem um botão **Líquido | Bruto** que troca a base de todos os valores.

## Clarifications

### Session 2026-10-13

- Q: O botão Líquido/Bruto afeta só os cards ou também a tabela? → A: **Cards e tabela**: a tabela mostra só a coluna do valor escolhido (Líquido ou Bruto)
- Q: Qual a visão padrão? → A: **Líquido** (mesmo padrão do Dashboard)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver os totais do período em uma única base (Priority: P1)

Como usuário autenticado (`admin` ou `visualizador`), na tela Contas a Receber vejo 4 cards — **Receita Total**, **Recebido**, **Pendente** e **Vencido** — todos na mesma base (líquida ou bruta), para entender de relance quanto entrou, quanto falta e quanto está atrasado no período.

**Why this priority**: É o pedido central; os cards atuais misturam bruto e líquido e não mostram o total.

**Independent Test**: Com o período Out/2026 contendo 1 conta recebida (líquido 900), 1 pendente (líquido 450) e 1 vencida (líquido 300), os cards mostram Receita Total 1.650, Recebido 900, Pendente 450 e Vencido 300, cada um com sua quantidade de registros.

**Acceptance Scenarios**:

1. **Given** a tela aberta, **When** o usuário observa a área de resumo, **Then** vê exatamente 4 cards na ordem Receita Total, Recebido, Pendente e Vencido
2. **Given** um período com contas recebidas, pendentes e vencidas, **When** os cards são exibidos, **Then** Receita Total é igual à soma de Recebido + Pendente + Vencido
3. **Given** contas canceladas no período, **When** os cards são exibidos, **Then** elas não entram em nenhum card
4. **Given** cada card, **When** exibido, **Then** mostra o valor e a quantidade de registros que o compõem
5. **Given** um período sem contas, **When** os cards são exibidos, **Then** todos mostram R$ 0,00 e 0 registro(s)

---

### User Story 2 - Alternar entre visão Líquida e Bruta (Priority: P1)

Como usuário autenticado, clico no botão **Líquido | Bruto** no cabeçalho da tela, e os cards e a tabela passam a mostrar os valores na base escolhida.

**Why this priority**: Pedido explícito; o financeiro analisa tanto o valor faturado (bruto) quanto o que efetivamente fica (líquido).

**Independent Test**: Com a visão Líquido ativa, os cards mostram valores líquidos e a tabela mostra a coluna "Líquido"; ao clicar em Bruto, os cards passam a mostrar valores brutos e a tabela troca a coluna para "Bruto".

**Acceptance Scenarios**:

1. **Given** a tela aberta pela primeira vez, **When** o usuário observa o botão, **Then** a visão **Líquido** está ativa
2. **Given** a visão Líquido, **When** o usuário clica em **Bruto**, **Then** os 4 cards passam a usar o valor bruto e o rótulo indica a visão (ex.: "Receita Total · bruto")
3. **Given** a visão Bruto, **When** a tabela é exibida, **Then** aparece a coluna **Bruto** e não aparece a coluna **Líquido**; na visão Líquido, o inverso
4. **Given** qualquer visão, **When** a tabela é exibida, **Then** a coluna **Imposto** continua visível
5. **Given** uma visão escolhida, **When** o usuário troca filtros de período/status ou navega para outra tela e volta, **Then** a visão escolhida é mantida
6. **Given** qualquer visão, **When** o usuário exporta CSV/Excel ou abre o formulário de edição, **Then** bruto, imposto e líquido continuam completos (a visão afeta só a exibição)
7. **Given** qualquer visão, **When** o usuário ordena pela coluna de valor exibida, **Then** a ordenação usa o valor dessa coluna

### Edge Cases

- Conta sem alíquota (imposto vazio): líquido igual ao bruto, como hoje; os cards somam normalmente
- Contas arquivadas continuam compondo os cards do período, como hoje
- Filtro de status "Sem NF": os cards seguem a regra atual (resumo sem período)
- Ordenação ativa pela coluna que some ao trocar a visão: a ordenação passa para a coluna de valor visível

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A tela DEVE exibir 4 cards: **Receita Total**, **Recebido**, **Pendente** e **Vencido**, nessa ordem
- **FR-002**: Receita Total DEVE ser a soma de Recebido + Pendente + Vencido; contas canceladas NÃO DEVEM compor nenhum card
- **FR-003**: Cada card DEVE exibir o valor e a quantidade de registros
- **FR-004**: A tela DEVE ter o botão **Líquido | Bruto**, com **Líquido** como padrão, visível para `admin` e `visualizador`
- **FR-005**: A visão escolhida DEVE definir a base de valor dos 4 cards
- **FR-006**: A visão escolhida DEVE definir qual coluna de valor aparece na tabela (Líquido ou Bruto); a coluna Imposto DEVE permanecer
- **FR-007**: A visão DEVE ser mantida ao trocar filtros e ao navegar entre telas na mesma sessão
- **FR-008**: Exportações (CSV/Excel), formulário de criação/edição e cálculos fiscais NÃO DEVEM mudar com a visão
- **FR-009**: Os cards DEVEM indicar a visão ativa no rótulo

### Key Entities

- **Conta a receber**: valor bruto, imposto, valor líquido, status (Recebida, Pendente, Vencida, Cancelada), data de fechamento (período)
- **Resumo do período**: totais e quantidades por status, em base bruta e líquida
- **Visão de valor**: Líquido ou Bruto; preferência de exibição da sessão

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos períodos testados, Receita Total = Recebido + Pendente + Vencido na visão ativa
- **SC-002**: O usuário troca a visão e vê cards e tabela atualizados em menos de 1 segundo, sem recarregar a página
- **SC-003**: O usuário responde "quanto falta receber no período, em bruto e em líquido" em menos de 10 segundos
- **SC-004**: A tabela tem uma coluna de valor a menos visível, reduzindo a largura horizontal da grade

## Assumptions

- Os cards continuam usando o resumo do período (mês/ano pela data de fechamento) já calculado pelo servidor, que já traz bruto e líquido por status; a busca por cliente e os filtros de lista não alteram os cards (comportamento atual mantido)
- "Pendente" são contas não recebidas e não vencidas; "Vencido" são as não recebidas com vencimento passado (regras atuais de status)
- A visão não é persistida entre sessões de login; vale enquanto a aplicação estiver aberta
- A remoção da seção de bônus do formulário de Contas a Receber foi entregue à parte (ajuste direto) e não faz parte desta spec
