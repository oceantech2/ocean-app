# Feature Specification: Filtros padronizados e compactos em Contas a Pagar e Contas a Receber

**Feature Branch**: `091-filtros-contas-pagar-receber`

**Created**: 2026-10-13

**Status**: Draft

**Input**: User description: "Filtros de conta a pagar e conta a receber, utilizar o de contas a pagar como referencia adicionar filtro de tipo e fornecedor e também melhorar a visualização pois está muito poluído na tela"

**Baseline**:

- **Contas a Pagar**: barra com 7–8 controles soltos (Categorias, Subcategoria RH, Status, caixa "Todos" + Mês + Ano, Descrição, Venc. de, Venc. até, "✕ Limpar"), sem filtro de Tipo nem de Fornecedor, apesar de a tabela ter as duas colunas.
- **Contas a Receber**: barra com Mês, Ano (campo numérico), Status, Cliente, legenda de cores, "Mostrar arquivadas" e "Exibir N por página", tudo na mesma linha; sem filtro de Tipo (Retainer, Sucesso, Parcela) nem de Fornecedor; a ordem é filtros → cards, diferente de Contas a Pagar (cards → filtros).

## Clarifications

### Session 2026-10-13

- Q: O que é "Fornecedor" em Contas a Receber (a conta tem cliente, não fornecedor)? → A: **Fornecedor com comissão ou bônus vinculado** à conta a receber
- Q: Como deixar a barra menos poluída? → A: **Linha compacta** com Período, Status, Tipo, Fornecedor e Busca + botão **"Mais filtros"** recolhível (datas, categoria, arquivadas etc.) + **"Limpar filtros"**, igual nas duas telas

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Filtrar por Tipo e Fornecedor (Priority: P1)

Como usuário autenticado (`admin` ou `visualizador`), filtro as contas por **Tipo** e por **Fornecedor** nas duas telas, para achar rapidamente, por exemplo, todas as despesas fixas de um fornecedor ou todas as contas a receber em que um consultor tem comissão.

**Why this priority**: Pedido explícito; hoje é preciso ordenar e procurar linha a linha.

**Independent Test**: Em Contas a Pagar, escolher Tipo "Fixo" e Fornecedor "Contabilidade X": só aparecem contas fixas desse fornecedor e os cards somam só elas. Em Contas a Receber, escolher Fornecedor "Maria": só aparecem contas a receber com comissão ou bônus de Maria.

**Acceptance Scenarios**:

1. **Given** Contas a Pagar, **When** o usuário abre o filtro **Tipo**, **Then** vê Todos, Fixo, Variável e Imposto / DAS
2. **Given** Contas a Pagar, **When** o usuário abre o filtro **Fornecedor**, **Then** vê Todos, Sem fornecedor e os fornecedores (incluindo inativos que tenham contas), em ordem alfabética
3. **Given** um Tipo e/ou Fornecedor escolhidos em Contas a Pagar, **When** a lista é exibida, **Then** só aparecem as contas que atendem a todos os filtros, e os cards (Total, Pago, A pagar, Vencido) refletem apenas essas contas
4. **Given** Contas a Receber, **When** o usuário abre o filtro **Tipo**, **Then** vê Todos, Retainer, Sucesso e Parcela
5. **Given** Contas a Receber, **When** o usuário escolhe um **Fornecedor**, **Then** só aparecem contas a receber que tenham ao menos uma comissão ou bônus desse fornecedor
6. **Given** filtros combinados, **When** a lista é exibida, **Then** aparece "X de Y" indicando quantos registros estão visíveis do total carregado
7. **Given** nenhum registro atende aos filtros, **When** a lista é exibida, **Then** aparece a mensagem de lista vazia

---

### User Story 2 - Barra de filtros compacta e igual nas duas telas (Priority: P1)

Como usuário, vejo nas duas telas a mesma barra de filtros: uma linha com **Período, Status, Tipo, Fornecedor e Busca**, um botão **"Mais filtros"** que abre os filtros secundários e um botão **"Limpar filtros"**, para usar as telas sem poluição visual.

**Why this priority**: Pedido explícito ("muito poluído"); a padronização reduz o aprendizado entre telas.

**Independent Test**: Abrir as duas telas e comparar: mesma ordem de controles na linha principal, mesmo botão "Mais filtros", mesmo "Limpar filtros", mesma posição (abaixo dos cards, acima da tabela).

**Acceptance Scenarios**:

1. **Given** qualquer das duas telas, **When** o usuário a abre, **Then** a ordem é título → cards → barra de filtros → tabela
2. **Given** a barra, **When** exibida, **Then** a linha principal tem, nesta ordem: Período (mês e ano), Status, Tipo, Fornecedor e Busca (Descrição em Pagar; Cliente em Receber)
3. **Given** a barra, **When** o usuário clica em **"Mais filtros"**, **Then** abre um painel com os filtros secundários: em Pagar, Categoria, Subcategoria RH (quando a categoria for Recursos Humanos), Vencimento de e Vencimento até; em Receber, Mostrar arquivadas
4. **Given** filtros secundários ativos com o painel fechado, **When** o usuário vê o botão, **Then** ele mostra a quantidade ativa (ex.: "Mais filtros (2)")
5. **Given** qualquer filtro diferente do padrão, **When** o usuário clica em **"Limpar filtros"**, **Then** o período passa a mostrar tudo (Pagar: "Todos os períodos"; Receber: "Todos os meses" do ano atual), os demais vão para "Todos"/vazio e o botão some quando não há nada a limpar
6. **Given** Contas a Receber, **When** a tela é exibida, **Then** a legenda de cores e o seletor "Exibir N por página" saem da barra de filtros e ficam numa faixa discreta no topo da tabela
7. **Given** telas estreitas, **When** a barra é exibida, **Then** os controles quebram linha sem sobrepor e o painel "Mais filtros" ocupa a largura disponível

### Edge Cases

- Contas a Pagar: os atalhos de status "Vence hoje", "Vence em menos de 7 dias" e "Vencida" continuam forçando o período "Todos" (regra atual)
- Contas a Pagar: o período "Todos" desabilita o ano (regra atual: todos os períodos)
- Contas a Receber: o status "Sem NF" continua desabilitando mês e ano (regra atual)
- Trocar qualquer filtro limpa a seleção em massa de Contas a Pagar e volta à primeira página em Contas a Receber
- Fornecedor inativo que tenha contas a pagar aparece na lista do filtro com "(inativo)"
- Conta a receber cancelada com comissão do fornecedor aparece no filtro por fornecedor, como as demais (o status é filtrado à parte)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Contas a Pagar DEVE ter filtro **Tipo** (Todos, Fixo, Variável, Imposto / DAS)
- **FR-002**: Contas a Pagar DEVE ter filtro **Fornecedor** (Todos, Sem fornecedor, fornecedores com ou sem contas, incluindo inativos com contas)
- **FR-003**: Contas a Receber DEVE ter filtro **Tipo** (Todos, Retainer, Sucesso, Parcela)
- **FR-004**: Contas a Receber DEVE ter filtro **Fornecedor**, que mantém apenas contas com ao menos uma comissão ou bônus do fornecedor escolhido
- **FR-005**: As duas telas DEVEM usar a mesma barra: linha principal (Período, Status, Tipo, Fornecedor, Busca), botão "Mais filtros" com contagem de filtros secundários ativos e botão "Limpar filtros"
- **FR-006**: "Mais filtros" DEVE ser organizado em três grupos — **Datas** (seletor do campo de data + De/Até), **Valor** (mínimo/máximo) e **Detalhes**. Datas em Pagar: Vencimento, Pagamento, Lançamento; em Receber: Fechamento, Emissão, Vencimento, Pagamento, Lançamento. Detalhes em Pagar: Categoria, Subcategoria RH (condicional), Conta, Nota fiscal (anexada/não anexada); em Receber: Origem, Conta corrente, Nota fiscal (anexada/não anexada), Incluir arquivadas. Em Receber, o valor filtrado segue a visão Líquido/Bruto
- **FR-006a**: Com o painel fechado, cada filtro de "Mais filtros" ativo DEVE aparecer como chip removível abaixo da linha principal
- **FR-006b**: A busca da linha principal DEVE procurar em Pagar: descrição e fornecedor; em Receber: cliente, projeto, candidato e número da NF
- **FR-007**: "Limpar filtros" DEVE restaurar todos os filtros ao padrão e só aparecer quando houver filtro diferente do padrão
- **FR-008**: As duas telas DEVEM seguir a ordem título → cards → filtros → tabela
- **FR-009**: Em Contas a Pagar, os cards DEVEM refletir todos os filtros (comportamento atual estendido aos novos filtros)
- **FR-010**: A indicação "X de Y" DEVE aparecer quando os filtros de lista reduzirem os registros carregados
- **FR-011**: Em Contas a Receber, legenda de cores e "Exibir N por página" DEVEM sair da barra de filtros e ir para o topo da tabela
- **FR-012**: Regras atuais de período, alertas de vencimento, "Sem NF", ordenação, seleção em massa e exportação DEVEM ser mantidas
- **FR-013**: Os filtros DEVEM estar disponíveis para `admin` e `visualizador`

### Key Entities

- **Conta a pagar**: tipo (Fixo, Variável, Imposto / DAS), fornecedor (opcional), categoria, vencimento, status
- **Conta a receber**: tipo (Retainer, Sucesso, Parcela), cliente, comissões e bônus vinculados (cada um com fornecedor), status
- **Filtro principal / secundário**: conjunto de critérios combinados por "E"; secundários ficam no painel "Mais filtros"

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A linha principal da barra tem no máximo 5 filtros + 2 botões nas duas telas (antes: até 9 controles em Pagar e 8 elementos em Receber)
- **SC-002**: O usuário encontra "todas as despesas fixas do fornecedor X no mês" em menos de 15 segundos
- **SC-003**: O usuário encontra "as contas a receber com comissão do fornecedor Y" em menos de 15 segundos
- **SC-004**: Em 100% dos casos, os registros exibidos atendem a todos os filtros ativos
- **SC-005**: As duas telas apresentam os filtros na mesma ordem e com o mesmo comportamento de "Mais filtros" e "Limpar filtros"

## Assumptions

- Os cards de Contas a Receber continuam baseados no resumo do período (spec 089); Tipo, Fornecedor e Cliente filtram apenas a lista, como a busca por cliente já faz hoje
- Novos filtros (Tipo, Fornecedor) valem enquanto a tela estiver aberta; Categoria e Status mantêm a persistência atual entre telas
- Em Contas a Receber, o filtro Fornecedor considera comissões e bônus vinculados à conta, inclusive os já liberados ou pagos
- A lista de fornecedores de Contas a Receber é a mesma usada no formulário de comissões
