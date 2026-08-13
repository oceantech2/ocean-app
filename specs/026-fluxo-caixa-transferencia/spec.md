# Feature Specification: Fluxo de Caixa — Transferência entre Caixas

**Feature Branch**: `026-fluxo-caixa-transferencia`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "na tela de fluxo de caixa Remover botão Incluir receita, Remover botão Incluir despesa, Remover botão Registrar saldo, Adicionar botão Transferência com cálculo automático entre caixas"

## Clarifications

### Session 2026-08-13

- Q: Como o saldo visível de cada caixa deve reagir à transferência? → A: O saldo visível de cada caixa recalcula automaticamente com a transferência (origem − valor, destino + valor).
- Q: E se o valor da transferência for maior que o saldo visível da origem? → A: Recusar: valor não pode ultrapassar o saldo visível da origem; nada é gravado.
- Q: Depois de tirar “Registrar saldo”, o que sobra para gravar saldo nesta tela? → A: Manter consulta da tabela histórica; sem importar, criar, editar ou excluir saldo nesta tela.
- Q: De onde vem o “saldo visível” usado no card e no limite da transferência? → A: Último saldo histórico da conta + movimentos posteriores; sem histórico, parte de zero.
- Q: Na lista, como o usuário vê de qual caixa para qual caixa foi a transferência? → A: Na descrição (ou texto da linha), indicar automaticamente o caixa contraposto (de/para).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Transferir valor entre caixas em uma ação (Priority: P1)

O administrador, na tela **Fluxo de Caixa**, usa o botão **Transferência** para mover um valor de um caixa para o outro (**Conta corrente** ↔ **Conta investimento**). Informa origem, destino, data e valor (descrição livre é opcional). Ao confirmar, o sistema aplica **cálculo automático**: o mesmo valor sai do caixa de origem e entra no caixa de destino, o **saldo visível** de cada caixa atualiza sozinho, e cada linha recebe texto automático de/para o outro caixa.

**Why this priority**: É o único caminho novo de escrita nesta tela; substitui o uso de receita/despesa manuais para “passar” dinheiro entre caixas.

**Independent Test**: Com os dois caixas visíveis no período, registrar uma transferência de um valor conhecido da corrente para o investimento; conferir saída na origem, entrada no destino e totais atualizados pelo mesmo valor.

**Acceptance Scenarios**:

1. **Given** um administrador no Fluxo de Caixa, **When** olha as ações da tela, **Then** vê o botão **Transferência** e **não** vê **Incluir receita**, **Incluir despesa** nem **Registrar saldo**.
2. **Given** o administrador acionou **Transferência**, **When** informa origem Conta corrente, destino Conta investimento, data, valor positivo e confirma, **Then** o caixa de origem registra uma **saída** daquele valor e o de destino uma **entrada** do **mesmo** valor, na mesma data.
3. **Given** uma transferência salva, **When** o usuário consulta o fluxo Conta corrente, **Then** vê o lado correspondente (saída ou entrada) nos movimentos e nos totais daquele fluxo, e o saldo visível da corrente já reflete a variação (histórico + movimentos, ou só movimentos se não houver histórico). **When** troca para Conta investimento, **Then** vê o outro lado, com o mesmo valor, e o saldo visível do investimento já inclui o acréscimo (ou o decréscimo, se foi a origem), sem relançar nem registrar saldo.
4. **Given** um visualizador, **When** abre o Fluxo de Caixa, **Then** **não** vê o botão Transferência e permanece em somente leitura.
5. **Given** o administrador informando valor maior que o saldo visível da origem, **When** tenta confirmar, **Then** a transferência é recusada, nenhum caixa muda e o usuário recebe mensagem compreensível.

---

### User Story 2 - Remover inclusão avulsa de receita, despesa e saldo (Priority: P1)

Quem opera o caixa deixa de criar receita manual, despesa manual ou **qualquer** registro novo de saldo nesta tela (botão, CSV ou edição na tabela). A tabela de saldos históricos, se existir, fica **somente consulta**. Entradas e saídas automáticas de Contas a Receber e Contas a Pagar continuam aparecendo. A escrita nova nesta tela é a transferência entre os dois caixas.

**Why this priority**: O pedido remove três ações de escrita; sem isso, a tela continua oferecendo caminhos que o negócio não quer mais.

**Independent Test**: Abrir a tela como administrador e confirmar a ausência dos três botões e a impossibilidade de abrir os formulários antigos de receita, despesa e registrar saldo por essas ações.

**Acceptance Scenarios**:

1. **Given** um administrador na tela, **When** procura **Incluir receita**, **Incluir despesa** ou **Registrar saldo**, **Then** essas ações **não** estão disponíveis.
2. **Given** um administrador na tela, **When** procura importar CSV de saldos ou criar/editar/excluir linha na tabela de saldos, **Then** essas escritas **não** estão disponíveis; a tabela histórica, se houver dados, permanece visível só para consulta.
3. **Given** movimentos automáticos de Contas a Receber recebidas e Contas a Pagar pagas no período, **When** o usuário abre ou refiltra o Fluxo de Caixa, **Then** esses movimentos continuam visíveis no fluxo correspondente (regras já vigentes de espelho e de conta).
4. **Given** lançamentos manuais antigos (receita/despesa) ainda gravados, **When** o usuário consulta o período, **Then** eles permanecem na lista para consulta; o administrador **não** cria novos por aqueles botões.
5. **Given** um visualizador, **When** abre a tela, **Then** também não vê os três botões removidos nem ações de gravar saldo.

---

### User Story 3 - Conferir origem, valor e impacto nos dois caixas (Priority: P2)

Qualquer usuário com acesso ao Fluxo de Caixa identifica uma transferência na lista (origem **Transferência**) e entende de qual caixa para qual caixa o valor foi. Totais de entradas, saídas e resultado de cada fluxo refletem só o lado daquele caixa. A exportação do que está visível inclui as transferências do fluxo ativo.

**Why this priority**: Completa auditoria e conferência; o MVP já existe se a transferência grava o par e some da UI os botões antigos.

**Independent Test**: Com uma transferência no período, abrir cada fluxo, conferir rótulo de origem, valor e totais; exportar o fluxo ativo e ver a linha correspondente.

**Acceptance Scenarios**:

1. **Given** uma transferência no período, **When** o usuário vê a lista no fluxo de origem, **Then** a coluna Origem indica **Transferência**, o tipo é **saída**, o valor é o informado e o texto da linha indica automaticamente **para** o caixa de destino (ex.: para Conta investimento).
2. **Given** a mesma transferência, **When** o usuário vê a lista no fluxo de destino, **Then** a coluna Origem indica **Transferência**, o tipo é **entrada**, o valor é o mesmo e o texto da linha indica automaticamente **de** o caixa de origem (ex.: de Conta corrente).
3. **Given** totais do fluxo ativo, **When** há transferências no período, **Then** entradas e saídas incluem apenas o lado daquele caixa (não somam origem e destino no mesmo total).
4. **Given** a exportação já existente, **When** o usuário exporta o fluxo ativo, **Then** as transferências visíveis entram com data, tipo, origem, descrição e valor alinhados à tela.

---

### Edge Cases

- Origem e destino iguais: o sistema recusa; a transferência exige dois caixas distintos.
- Valor zero, negativo ou vazio: recusa com mensagem clara; nada é gravado em nenhum caixa.
- Valor maior que o saldo visível da origem: recusa; nenhum lado é gravado e os saldos visíveis não mudam.
- Data fora do mês/ano atualmente filtrado: a transferência é gravada na data informada; só aparece na lista quando o período da tela inclui essa data.
- Um dos caixas sem movimentos no período: a transferência ainda cria o par; o fluxo vazio passa a mostrar o lado correspondente.
- Falha ao gravar: nenhum dos dois lados fica persistido (não deixa só saída ou só entrada).
- Visualizador: consulta transferências já existentes; não cria nem desfaz.
- Administrador desfaz uma transferência: os dois lados saem juntos; não é permitido apagar só a saída ou só a entrada.
- Fluxo ativo no momento da ação: o seletor de origem/destino no formulário de transferência é explícito; não depende só do fluxo que está na tela, embora a origem possa iniciar no fluxo ativo.
- Descrição livre do admin: opcional; mesmo vazia, o sistema preenche o texto de/para do caixa contraposto. A coluna Origem continua **Transferência**.
- Tentativa de usar transferência para “inventar” receita ou despesa contra o mesmo caixa: bloqueada pela regra de caixas distintos.
- Saldo visível após transferência: origem mostra o valor anterior menos o montante; destino mostra o valor anterior mais o montante; a troca de fluxo ativo exibe o saldo já recalculado daquela conta.
- Sem saldo histórico na conta: o saldo visível parte de zero e soma os movimentos; transferência só é aceita até esse total.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A tela Fluxo de Caixa MUST NOT exibir os botões **Incluir receita**, **Incluir despesa** e **Registrar saldo** para nenhum papel.
- **FR-002**: A tela MUST NOT oferecer formulários ou ações para criar receita manual, despesa manual ou novo registro de saldo (incluindo importar CSV de saldos e criar, editar ou excluir saldo pela tabela).
- **FR-019**: A tabela de saldos históricos MUST permanecer disponível para **consulta**. MUST NOT permitir importar, criar, editar ou excluir saldo nesta tela.
- **FR-003**: O administrador MUST ver e usar o botão **Transferência** na tela Fluxo de Caixa.
- **FR-004**: O visualizador MUST NOT ver nem usar o botão Transferência.
- **FR-005**: Uma transferência MUST exigir caixa de **origem**, caixa de **destino**, **data** e **valor** positivo. Origem e destino MUST ser um de **Conta corrente** ou **Conta investimento**, e MUST ser diferentes.
- **FR-006**: Ao confirmar a transferência, o sistema MUST aplicar cálculo automático entre os caixas: gravar **saída** no caixa de origem e **entrada** no caixa de destino, **mesmo valor** e **mesma data**, em uma única operação do usuário.
- **FR-007**: O sistema MUST NOT exigir que o usuário lance os dois lados separadamente nem que registre saldo em cada caixa para refletir a transferência.
- **FR-017**: Após confirmar a transferência, o **saldo visível** de cada caixa MUST recalcular automaticamente: origem diminui e destino aumenta pelo mesmo valor. MUST NOT depender de um novo registro manual de saldo para essa atualização.
- **FR-018**: O valor da transferência MUST NOT ultrapassar o saldo visível da origem. Se ultrapassar, o sistema MUST recusar, MUST NOT gravar nenhum lado e MUST manter os saldos visíveis inalterados.
- **FR-020**: O saldo visível de um caixa MUST ser o **último saldo histórico** daquela conta (tabela, só consulta) **mais** os movimentos posteriores (Contas a Receber, Contas a Pagar, transferências e manuais legados). Se não houver saldo histórico, MUST partir de zero e somar os movimentos.
- **FR-008**: Cada lado da transferência MUST aparecer somente no fluxo correspondente (origem ou destino), com tipo entrada ou saída adequado.
- **FR-009**: Totais de entradas, saídas e resultado do fluxo ativo MUST incluir apenas o lado da transferência daquele caixa.
- **FR-010**: Na lista, a coluna Origem MUST identificar o movimento como **Transferência**.
- **FR-021**: Cada lado da transferência MUST exibir automaticamente o caixa contraposto no texto da linha (saída: **para** o destino; entrada: **de** a origem), sem exigir descrição preenchida pelo administrador. MUST NOT depender só do fluxo ativo e do tipo entrada/saída para essa conferência.
- **FR-011**: O par MUST permanecer ligado: criação e desfazimento MUST afetar os dois lados; MUST NOT persistir transferência incompleta (só um lado).
- **FR-012**: Movimentos automáticos de Contas a Receber e Contas a Pagar MUST continuar no caixa conforme regras já vigentes; esta feature MUST NOT removê-los.
- **FR-013**: Lançamentos manuais de receita/despesa já existentes MUST permanecer visíveis para consulta no período correspondente. MUST NOT haver caminho nesta tela para criar novos por Incluir receita/Incluir despesa.
- **FR-014**: Consulta, filtro de período, seletor de fluxo (Conta corrente / Conta investimento), exportação e demais regras de visão exclusiva MUST continuar válidos, passando a incluir transferências no recorte do fluxo ativo.
- **FR-015**: O administrador MUST poder desfazer uma transferência, removendo os dois lados após confirmação. MUST NOT desfazer só um lado.
- **FR-016**: O visualizador MUST consultar transferências em somente leitura.

### Key Entities

- **Transferência entre caixas**: Operação única do administrador que move um valor de um caixa para o outro na mesma data.
- **Lado da transferência**: Movimento de saída (caixa de origem) ou de entrada (caixa de destino), sempre em par, mesmo valor, com texto automático de/para o outro caixa.
- **Caixa (fluxo)**: Conta corrente ou Conta investimento, visões exclusivas já existentes na tela.
- **Saldo visível**: Valor apresentado para o caixa do fluxo ativo e usado como teto da transferência. É o último saldo histórico daquela conta mais os movimentos posteriores; sem histórico, parte de zero.
- **Tabela de saldos históricos**: Consulta dos registros já gravados; nesta versão não recebe importação nem manutenção nesta tela.
- **Movimento do fluxo**: Entrada ou saída visível na lista (automático de origens, transferência, ou manual legado).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das inspeções da tela, os botões Incluir receita, Incluir despesa e Registrar saldo estão ausentes para admin e visualizador; não há importar CSV de saldos nem criar/editar/excluir saldo pela tabela.
- **SC-002**: Em 100% das transferências de teste bem-sucedidas, o valor informado aparece como saída na origem e entrada no destino, iguais, na mesma data, sem segundo lançamento do usuário; o saldo visível da origem cai e o do destino sobe pelo mesmo montante.
- **SC-003**: Em menos de 1 minuto, o administrador completa uma transferência válida (origem, destino, data, valor) e vê o impacto nos dois fluxos.
- **SC-004**: Em 100% das tentativas com origem = destino, valor inválido, dados obrigatórios faltando ou valor maior que o saldo visível da origem, nada é gravado em nenhum caixa, os saldos visíveis não mudam e o usuário recebe mensagem compreensível.
- **SC-005**: Em 100% das falhas simuladas na gravação, nenhum caixa fica com transferência pela metade.
- **SC-006**: Em 100% das inspeções com visualizador, não há botão Transferência nem ação de criar/desfazer.
- **SC-007**: Pelo menos 90% dos usuários de teste identificam na lista que o movimento é uma Transferência e para qual caixa (ou de qual caixa) o valor foi, sem treinar.
- **SC-008**: Em 100% dos casos de teste, o saldo visível de um caixa coincide com último histórico daquela conta mais movimentos posteriores, ou com a soma dos movimentos quando não há histórico; a recusa por saldo insuficiente usa exatamente esse valor.

## Assumptions

- Existem exatamente dois caixas nesta tela: **Conta corrente** e **Conta investimento** (feature 025). Transferência é só entre esses dois.
- “Cálculo automático entre caixas” significa: o usuário informa **um** valor; o sistema aplica esse valor nos dois caixas (sai na origem, entra no destino), atualiza movimentos e totais, e **recalcula o saldo visível** de cada caixa (origem − valor, destino + valor), sem lançamento duplo nem registro manual de saldo.
- O saldo visível de cada caixa é o último registro histórico daquela conta mais os movimentos posteriores; ausência de histórico equivale a ponto de partida zero.
- A transferência **não** substitui o espelho de Contas a Receber/Pagar; só cobre movimento interno entre os dois caixas.
- Papéis admin (escreve) e visualizador (só lê) seguem o produto.
- Manuais antigos de receita/despesa não são apagados; apenas deixa de existir o botão para criar novos nesta tela.
- Importação CSV de saldos e criar/editar/excluir saldo nesta tela ficam **desligados**; a tabela histórica permanece só para consulta.
- Edição pontual de saldo pela tabela não é caminho nesta versão.
- Origem no formulário pode iniciar no fluxo ativo e destino na outra conta; o usuário pode inverter antes de salvar.
- Não há transferência parcial, agendada ou para um terceiro caixa nesta versão.
- Transferência com valor igual ao saldo visível da origem é permitida (origem pode zerar; não pode ficar negativa).
- O texto de/para do outro caixa é gerado automaticamente na linha; descrição livre extra é opcional.

## Out of Scope

- Recriar Incluir receita, Incluir despesa, Registrar saldo, importar CSV de saldos ou editar/excluir saldo nesta tela.
- Transferência envolvendo contas além de corrente e investimento.
- Usar transferência para lançar receita ou despesa “solta” (sem o outro caixa).
- Recalcular ou reescrever automaticamente os **registros históricos de saldo** já gravados mês a mês como fonte da conferência; o saldo **visível** na tela recalcula com a transferência, mas isso não exige editar cada linha histórica da tabela de saldos.
- Alterar regras de Contas a Receber, Contas a Pagar, dashboard ou outros módulos.
- Permitir ao visualizador criar ou desfazer transferência.
