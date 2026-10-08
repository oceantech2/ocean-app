# Feature Specification: Cards Total de Despesas e Impostos Pagos na seção Despesa

**Feature Branch**: `085-dashboard-despesa-total-impostos`

**Created**: 2026-10-08

**Status**: Draft

**Input**: User description: "na seção de despesa onde tem 3 cards de despesa fixas variaveis e pendentes - Inserir card com total de despesas (soma = despesas fixas + despesas variáveis) ao lado esquerdo de \"Despesas Fixas\" - Inserir card com total de impostos pagos no mês vigente (ou seja, replicar os impostos recolhidos do mês anterior)"

**Baseline**: No Dashboard, a seção **Despesa** exibe três cards: **Despesas Fixas** e **Despesas Variáveis** (pagas no período, por data de pagamento, excluindo Contas Tipo Imposto / DAS) e **Despesas Pendentes** (vencimento no período sem pagamento). Na seção **Receita**, aba **Por Caixa**, o card **Impostos** mostra os **impostos recolhidos** do período: a soma do imposto das NFs emitidas no período (data de emissão). Os impostos recolhidos sobre o faturamento de um mês são pagos no mês seguinte. Complementa `040`, `059` e `074`.

## Clarifications

### Session 2026-10-08

- Q: Onde fica o card Impostos Pagos na seção Despesa? → A: **Último card**, à direita de Despesas Pendentes (ordem: Total de Despesas, Fixas, Variáveis, Pendentes, Impostos Pagos)
- Q: No modo só-ano (sem mês selecionado), o que Impostos Pagos mostra? → A: **Soma do ano deslocada um mês**: impostos recolhidos de Dezembro/A−1 até Novembro/A
- Q: Qual o título do card de impostos? → A: **Impostos Pagos**

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver o total de despesas do período (Priority: P1)

Como usuário autenticado (`admin` ou `visualizador`), na seção **Despesa** do Dashboard vejo um novo card **Total de Despesas**, posicionado à **esquerda** de **Despesas Fixas**, com a soma de Despesas Fixas + Despesas Variáveis do período selecionado, sem precisar somar os cards de cabeça.

**Why this priority**: É o indicador-resumo da seção e o primeiro item pedido; dá a leitura imediata de quanto saiu de despesa no período.

**Independent Test**: Abrir o Dashboard em um mês com despesas fixas e variáveis conhecidas; conferir que o card Total de Despesas aparece antes de Despesas Fixas e que seu valor é exatamente a soma dos dois cards.

**Acceptance Scenarios**:

1. **Given** o Dashboard com um mês selecionado, **When** o usuário observa a seção Despesa, **Then** o primeiro card (à esquerda) é **Total de Despesas**, seguido de Despesas Fixas, Despesas Variáveis e Despesas Pendentes
2. **Given** Despesas Fixas = F e Despesas Variáveis = V no período, **When** o usuário lê Total de Despesas, **Then** o valor é F + V (± R$ 0,01)
3. **Given** Despesas Pendentes = P no período, **When** o usuário lê Total de Despesas, **Then** P **não** entra no total
4. **Given** o modo só-ano (sem mês selecionado), **When** o usuário lê Total de Despesas, **Then** o valor é a soma de Fixas + Variáveis do ano exibido nos respectivos cards, com o mesmo rótulo de ano usado pelos demais cards da seção
5. **Given** o usuário troca mês ou ano, **When** os dados recarregam, **Then** Total de Despesas acompanha os novos valores de Fixas e Variáveis

---

### User Story 2 - Ver os impostos pagos no período (Priority: P1)

Como usuário autenticado, na seção **Despesa** vejo um novo card **Impostos Pagos**, como **último** card (à direita de Despesas Pendentes), com o total de impostos pagos no mês selecionado. Como os impostos do faturamento de um mês são pagos no mês seguinte, o valor do card é o mesmo dos **impostos recolhidos do mês anterior** (card Impostos da aba Por Caixa daquele mês). O card informa de qual mês vêm os impostos.

**Why this priority**: Completa a visão de saídas do período com o desembolso fiscal, que hoje não aparece na seção Despesa.

**Independent Test**: Selecionar o mês M; anotar o valor do card Impostos (aba Por Caixa) no mês M−1; voltar para M e conferir que Impostos Pagos mostra esse mesmo valor.

**Acceptance Scenarios**:

1. **Given** o mês M/A selecionado, **When** o usuário lê Impostos Pagos, **Then** o valor é igual aos impostos recolhidos de M−1/A (o mesmo valor que o card Impostos da aba Por Caixa mostra para M−1/A)
2. **Given** **Janeiro**/A selecionado, **When** o usuário lê Impostos Pagos, **Then** o valor é igual aos impostos recolhidos de **Dezembro**/A−1
3. **Given** o card Impostos Pagos, **When** o usuário o observa, **Then** um texto auxiliar indica o mês de origem (ex.: "Recolhidos em Set/2026")
4. **Given** o modo só-ano A (sem mês selecionado), **When** o usuário lê Impostos Pagos, **Then** o valor é a soma dos impostos recolhidos de Dezembro/A−1 até Novembro/A, e o texto auxiliar indica essa janela (ex.: "Recolhidos de Dez/2025 a Nov/2026")
5. **Given** a seção Despesa, **When** o usuário observa a ordem dos cards, **Then** Impostos Pagos é o último, à direita de Despesas Pendentes
6. **Given** o toggle Bruto ↔ Líquido, **When** o usuário alterna, **Then** Impostos Pagos **não** muda (mesmo comportamento do card Impostos da Receita)
7. **Given** Impostos Pagos com valor X, **When** o usuário lê Total de Despesas e os cards de Resultado, **Then** X **não** é somado a nenhum deles

---

### Edge Cases

- Mês anterior sem NFs emitidas: Impostos Pagos = R$ 0,00
- Período sem despesas fixas e variáveis: Total de Despesas = R$ 0,00
- Falha ao carregar os impostos do mês anterior: o card Impostos Pagos mostra "—" e uma mensagem curta de erro; os demais cards da seção continuam normais
- NFs canceladas ou excluídas não entram nos impostos recolhidos (mesma regra do card Impostos da Receita)
- Telas estreitas: os cards quebram em linhas sem sobreposição de texto nem valores cortados

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A seção Despesa DEVE exibir um card **Total de Despesas** como **primeiro** card, à esquerda de Despesas Fixas
- **FR-002**: O valor de Total de Despesas DEVE ser igual a Despesas Fixas + Despesas Variáveis do mesmo período, com as mesmas regras desses cards; Despesas Pendentes e impostos NÃO DEVEM entrar no total
- **FR-003**: A seção Despesa DEVE exibir um card **Impostos Pagos** como **último** card, à direita de Despesas Pendentes; a ordem final DEVE ser Total de Despesas, Despesas Fixas, Despesas Variáveis, Despesas Pendentes, Impostos Pagos
- **FR-004**: Com o mês M/A selecionado, Impostos Pagos DEVE ser igual aos impostos recolhidos de M−1 (Janeiro usa Dezembro do ano anterior), calculados com a mesma regra do card Impostos da aba Por Caixa
- **FR-004a**: No modo só-ano A, Impostos Pagos DEVE ser a soma dos impostos recolhidos de Dezembro/A−1 até Novembro/A (janela de 12 meses deslocada um mês)
- **FR-005**: O card Impostos Pagos DEVE exibir texto auxiliar com o mês/ano de origem dos impostos (ou a janela, no modo só-ano)
- **FR-006**: Impostos Pagos NÃO DEVE variar com o toggle Bruto/Líquido
- **FR-007**: Impostos Pagos NÃO DEVE ser somado a Total de Despesas nem a Resultado Competência / Resultado Caixa
- **FR-008**: Os cards existentes (Despesas Fixas, Variáveis, Pendentes, Resultado e card Impostos da Receita) NÃO DEVEM mudar de regra nem de valor
- **FR-009**: Se a carga dos impostos do mês anterior falhar, o card Impostos Pagos DEVE indicar indisponibilidade sem quebrar a seção
- **FR-010**: `admin` e `visualizador` DEVEM ver os mesmos cards e valores (somente leitura)

### Key Entities

- **Total de Despesas**: Indicador derivado; Despesas Fixas + Despesas Variáveis do período
- **Impostos Pagos**: Indicador derivado; impostos recolhidos (imposto das NFs por data de emissão) do mês anterior ao período selecionado
- **Impostos recolhidos**: Valor já exibido no card Impostos da aba Por Caixa; soma do imposto das NFs emitidas no mês, sem canceladas/excluídas

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos períodos testados, Total de Despesas = Despesas Fixas + Despesas Variáveis (± R$ 0,01)
- **SC-002**: Em 100% dos meses testados (incluindo Janeiro), Impostos Pagos de M = card Impostos da aba Por Caixa de M−1 (± R$ 0,01); no modo só-ano A, Impostos Pagos = soma desse card de Dez/A−1 a Nov/A (± R$ 0,01)
- **SC-003**: O usuário identifica o total de despesas e os impostos pagos do período em menos de 10 segundos, sem somar cards nem trocar de aba
- **SC-004**: Em 100% das sessões de regressão, os valores de Fixas, Variáveis, Pendentes, Resultado e Impostos da Receita permanecem idênticos aos de antes da feature

## Assumptions

- "Mês vigente" = mês selecionado no filtro do Dashboard (não necessariamente o mês do calendário)
- "Impostos recolhidos do mês anterior" = valor do card Impostos da aba Por Caixa (imposto das NFs por data de emissão) do mês anterior ao selecionado
- Total de Despesas segue exatamente as regras de Fixas e Variáveis (data de pagamento, exclusão de Contas Tipo Imposto / DAS)
- Nenhuma mudança de cadastro, permissão ou fonte de dados; apenas novos indicadores no Dashboard
- Impostos Pagos é informativo; não altera Resultado nem o DRE
