# Feature Specification: Comissões vinculadas à Conta a receber — cadastro, liberação e ações em massa

**Feature Branch**: `045-comissoes-conta-receber`

**Created**: 2026-08-29

**Status**: Draft

**Input**: User description: "na tela de comissoes (antiga bonus) - Mudar a lógica - ao inserir uma Conta a receber no sistema, já apresentar o cadastro de Comissão (pode adicionar quantas comissões forem necessárias), incluindo os seguintes campos: Fornecedor; Mês / Ano; Atividade (ao invés de Etapa, seleção múltipla: Lead, Venda, Condução, Placement); Percentual (%); Valor Bônus (R$): calcular automaticamente [Percentual * Valor Líquido]. Ação de Editar deve referenciar a Conta a receber. Inserir ação de Liberar. Remover ação de Deletar. Adicionar colunas Liberado (mostra automaticamente a comissão liberada de cada um) e Pago. Adicionar caixa de seleção para ações em massa."

## Clarifications

### Session 2026-08-29

- Q: Como a comissão passa a **Paga**? → A: Ação **Pagar** do administrador, **somente** em linha já **liberada** (mesmo padrão de Contas a Pagar: autorizar, depois quitar).
- Q: Quais **ações em massa** estão disponíveis? → A: **Liberar** e **Pagar** em massa (sobre linhas elegíveis de cada ação).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar comissões ao lançar a Conta a receber (Priority: P1)

O administrador, ao **criar** uma Conta a receber, vê no mesmo fluxo um bloco de **Comissões**. Pode incluir **quantas linhas quiser** (ou nenhuma). Cada linha pede: **Fornecedor**, **Mês/Ano**, **Atividade** (uma ou mais entre Lead, Venda, Condução e Placement), **Percentual (%)** e **Valor da comissão (R$)**, este último **calculado automaticamente** a partir do percentual e do **valor líquido** da conta. Ao gravar a conta, as comissões daquele lançamento passam a existir e aparecem na página **Comissões**, agrupadas pelo fornecedor.

Na **edição** da mesma Conta a receber, o administrador vê e ajusta as linhas de comissão ainda não liberadas (incluir, alterar ou retirar linha).

**Why this priority**: Sem o cadastro no ato da conta, a operação volta a lançar comissão avulsa e desconectada do recebimento — exatamente o que se quer abandonar.

**Independent Test**: Criar uma conta com valor líquido conhecido, adicionar duas linhas (fornecedores e atividades diferentes), gravar; abrir Comissões e conferir as duas linhas e os valores calculados. Editar a conta, incluir uma terceira linha e gravar.

**Acceptance Scenarios**:

1. **Given** um administrador em **Nova conta a receber**, **When** o formulário abre, **Then** há um bloco visível de **Comissão(ões)** com ação para **adicionar linha**, sem exigir sair da tela.
2. **Given** o bloco de comissões, **When** o administrador adiciona uma linha, **Then** vê os campos **Fornecedor**, **Mês/Ano**, **Atividade**, **Percentual (%)** e **Valor da comissão (R$)**.
3. **Given** valor líquido da conta preenchido e percentual informado (ex.: 10), **When** o percentual é informado ou o líquido muda, **Then** o valor da comissão é preenchido automaticamente como percentual sobre o líquido (10% de R$ 1.000,00 = R$ 100,00) e o administrador **não** edita esse valor à mão.
4. **Given** duas ou mais linhas no mesmo lançamento, **When** o administrador grava a conta, **Then** todas as linhas válidas são persistidas vinculadas àquela Conta a receber.
5. **Given** o administrador não adiciona nenhuma linha de comissão, **When** grava a conta, **Then** a conta é salva normalmente, sem comissão.
6. **Given** uma linha com Fornecedor, Mês/Ano, ao menos uma Atividade e Percentual válidos, **When** tenta gravar, **Then** a linha é aceita.
7. **Given** uma linha incompleta (faltando Fornecedor, Mês/Ano, Atividade ou Percentual), **When** tenta gravar a conta, **Then** o sistema recusa e indica o que falta na linha.
8. **Given** o campo **Atividade**, **When** o administrador escolhe, **Then** pode marcar **uma ou mais** opções entre **Lead**, **Venda**, **Condução** e **Placement**; não existe mais o rótulo **Etapa** nesse cadastro.
9. **Given** o campo **Fornecedor**, **When** o administrador seleciona, **Then** escolhe um fornecedor ativo do cadastro unificado (não há cadastro avulso de pessoa só nesta tela).
10. **Given** uma Conta a receber já gravada com comissões, **When** o administrador abre **Editar** nessa conta, **Then** vê as linhas existentes e pode incluir novas, alterar ou retirar linhas **ainda não liberadas**.
11. **Given** um visualizador, **When** cria ou edita conta, **Then** não altera comissões (somente leitura, como no restante do produto).

---

### User Story 2 - Página Comissões: editar pela conta, liberar e ver Liberado/Pago (Priority: P1)

Na página **Comissões**, o administrador deixa de **deletar** linhas. **Editar** abre a **Conta a receber** vinculada (o mesmo formulário em que as comissões foram lançadas), não um formulário isolado da comissão. Surge a ação **Liberar** em cada linha ainda não liberada e a ação **Pagar** em cada linha já liberada e ainda não paga. A listagem (ainda agrupada por pessoa/fornecedor) passa a mostrar as colunas **Liberado** e **Pago**: **Liberado** apresenta, **automaticamente**, o valor das comissões já liberadas **daquele fornecedor** no recorte visível; **Pago** indica se cada linha já foi quitada.

**Why this priority**: É o novo jeito de operar a tela: a comissão vive na conta; a página é para acompanhar, liberar e ver o que já saiu.

**Independent Test**: Com uma comissão vinculada a uma conta, acionar Editar e cair no formulário da conta; acionar Liberar e ver o valor na coluna Liberado do grupo; confirmar ausência de Deletar.

**Acceptance Scenarios**:

1. **Given** um administrador na página Comissões, **When** olha as ações de uma linha, **Then** vê **Editar** e **Liberar** (se ainda não liberada) ou **Pagar** (se já liberada e não paga), e **não** vê **Deletar**.
2. **Given** uma comissão vinculada a uma Conta a receber, **When** o administrador aciona **Editar**, **Then** abre o formulário dessa Conta a receber (com o bloco de comissões), e não um modal só da comissão.
3. **Given** uma comissão **sem** conta vinculada (registro antigo), **When** o administrador aciona **Editar**, **Then** recebe mensagem clara de que não há Conta a receber associada e a edição isolada **não** é oferecida.
4. **Given** uma linha ainda não liberada, **When** o administrador aciona **Liberar** e confirma, **Then** a linha passa a liberada e o valor entra no **Liberado** daquele fornecedor.
5. **Given** uma linha já liberada, **When** o administrador olha as ações, **Then** **Liberar** não se aplica de novo a essa linha e **Pagar** fica disponível enquanto a linha não estiver paga.
6. **Given** uma linha ainda **não** liberada, **When** o administrador procura **Pagar**, **Then** a ação **não** está disponível (só após Liberar).
7. **Given** uma linha já liberada e não paga, **When** o administrador aciona **Pagar** e confirma, **Then** a linha passa a paga e a coluna **Pago** reflete esse estado.
8. **Given** uma linha já paga, **When** o administrador olha as ações, **Then** **Pagar** não se aplica de novo a essa linha.
9. **Given** o agrupamento por fornecedor com algumas linhas liberadas e outras não, **When** o usuário lê o grupo, **Then** a coluna (ou indicador) **Liberado** mostra a **soma automática** dos valores já liberados daquele fornecedor no recorte filtrado, sem o usuário recalcular.
10. **Given** a coluna **Pago**, **When** o usuário lê cada linha (e o resumo do grupo, se houver), **Then** identifica se a comissão está paga ou pendente de pagamento.
11. **Given** um visualizador, **When** usa a página, **Then** vê Liberado e Pago, **não** aciona Liberar, Pagar nem Editar com persistência, e também **não** vê Deletar.
12. **Given** filtros já existentes da página (fornecedor/pessoa, ano, mês ou trimestre), **When** aplicados, **Then** listagem, total geral, Liberado e Pago respeitam o mesmo recorte.

---

### User Story 3 - Seleção e ações em massa (Priority: P2)

O administrador marca uma ou mais comissões com **caixa de seleção** (incluindo selecionar todas as visíveis de um grupo ou da listagem filtrada) e dispara **Liberar em massa** ou **Pagar em massa** sobre a seleção. O visualizador não seleciona nem dispara lote.

**Why this priority**: Liberar e pagar uma a uma não escala no fechamento mensal.

**Independent Test**: Marcar três linhas não liberadas, executar **Liberar em massa**, confirmar as três liberadas; marcar linhas liberadas e executar **Pagar em massa**, confirmando Pago atualizado.

**Acceptance Scenarios**:

1. **Given** um administrador na listagem de Comissões com linhas visíveis, **When** olha cada linha, **Then** há uma caixa de seleção.
2. **Given** um grupo de um fornecedor, **When** o administrador usa a seleção do grupo, **Then** marca ou desmarca todas as linhas visíveis daquele grupo.
3. **Given** ao menos uma linha marcada, **When** o administrador olha a área de ações, **Then** vê **Liberar em massa** e **Pagar em massa** (cada uma disponível conforme elegibilidade da seleção).
4. **Given** linhas marcadas para **Liberar em massa**, **When** algumas já estão liberadas, **Then** o lote aplica só às ainda não liberadas, informa quantas foram liberadas e quantas ignoradas, e não quebra a tela.
5. **Given** linhas marcadas para **Pagar em massa**, **When** algumas não estão liberadas ou já estão pagas, **Then** o lote aplica só às liberadas e não pagas, informa quantas foram pagas e quantas ignoradas, e não quebra a tela.
6. **Given** nenhuma linha marcada, **When** o administrador procura ação em massa, **Then** ela não dispara (desabilitada ou oculta).
7. **Given** um visualizador, **When** consulta a listagem, **Then** não há caixas de seleção operáveis nem barra de lote.

---

### Edge Cases

- Conta a receber **sem** valor líquido (ou líquido zero): o valor da comissão fica zero enquanto o líquido não for positivo; percentual pode ser informado, mas o valor calculado acompanha o líquido.
- Alterar o **valor líquido** da conta atualiza automaticamente o valor das comissões **ainda não liberadas**; linhas **já liberadas** não recalculam (o valor liberado permanece o da liberação).
- Várias linhas para o **mesmo fornecedor** na mesma conta são permitidas (atividades ou percentuais diferentes).
- A soma dos percentuais da conta **pode** ultrapassar 100%; o sistema não bloqueia por isso (cada linha é independente).
- **Atividade** com várias opções selecionadas pertence à **mesma** linha (um percentual e um valor); não se desdobra em uma linha por atividade.
- Comissão **liberada**: não pode ser removida nem ter Fornecedor, Mês/Ano, Atividade, Percentual ou Valor alterados no formulário da conta; novas linhas ainda podem ser adicionadas na mesma conta.
- Comissão **liberada mas não paga**: **Pagar** fica disponível; **Liberar** não se repete.
- Comissão **paga**: **Pagar** não se repete; linha permanece imutável no cadastro (como a liberada).
- Tentativa de **Pagar** linha não liberada: ação indisponível ou recusada com mensagem clara.
- **Liberar em massa** com seleção mista: só linhas ainda não liberadas são processadas; demais ignoradas com contagem no feedback.
- **Pagar em massa** com seleção mista: só linhas liberadas e não pagas são processadas; demais ignoradas com contagem no feedback.
- Conta a receber **excluída** (feature já existente): as comissões vinculadas deixam de aparecer na página Comissões.
- Comissão antiga **sem** Conta a receber: permanece listada; Editar explica a ausência de vínculo; Liberar (e Pago, se aplicável) continuam possíveis; Deletar continua indisponível.
- Filtro sem resultados: estado vazio compreensível; totais e Liberado zerados; seleção em massa inativa.
- Papel `visualizador`: vê os mesmos dados e colunas; não cria, edita, libera, marca pago nem usa lote.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ao criar uma Conta a receber, o sistema MUST apresentar o cadastro de **Comissão** no mesmo fluxo, com possibilidade de **zero ou mais** linhas.
- **FR-002**: Cada linha de comissão MUST exigir **Fornecedor** (fornecedor ativo do cadastro), **Mês** e **Ano**, **Atividade** (ao menos uma das opções Lead, Venda, Condução, Placement), e **Percentual (%)**.
- **FR-003**: O campo visível ao usuário MUST ser **Atividade**, e MUST NOT usar o rótulo **Etapa** no cadastro nem na listagem de Comissões. Atividade MUST permitir **seleção múltipla** das quatro opções acima.
- **FR-004**: O **Valor da comissão (R$)** MUST ser calculado automaticamente como `(Percentual / 100) × Valor líquido` da Conta a receber vinculada, e MUST NOT ser editável pelo usuário.
- **FR-005**: O administrador MUST poder adicionar quantas linhas de comissão forem necessárias no mesmo lançamento ou na edição da conta.
- **FR-006**: Na edição da Conta a receber, o sistema MUST exibir as comissões vinculadas e MUST permitir incluir, alterar ou remover apenas linhas **não liberadas**.
- **FR-007**: Na página Comissões, a ação **Editar** MUST abrir a Conta a receber vinculada. Se não houver vínculo, MUST informar isso e MUST NOT abrir edição isolada da comissão.
- **FR-008**: A página Comissões MUST NOT oferecer ação **Deletar** (nem equivalente) para admin ou visualizador.
- **FR-009**: A página Comissões MUST oferecer ação **Liberar** ao administrador em cada linha ainda não liberada, com confirmação antes de efetivar.
- **FR-010**: Após Liberar, o sistema MUST tratar a linha como liberada: valor entra no **Liberado** do fornecedor; a linha deixa de ser alterável nos campos de cadastro.
- **FR-011**: A listagem (agrupada por fornecedor) MUST exibir a coluna **Liberado**, preenchida automaticamente com a soma das comissões já liberadas daquele fornecedor no recorte visível.
- **FR-012**: A listagem MUST exibir a coluna **Pago**, indicando por linha se a comissão está paga ou pendente de pagamento.
- **FR-012a**: O administrador MUST poder acionar **Pagar** em linha **já liberada** e ainda não paga, com confirmação antes de efetivar.
- **FR-012b**: **Pagar** MUST NOT estar disponível em linha ainda não liberada.
- **FR-012c**: Após **Pagar**, a linha MUST ser tratada como paga e **Pagar** MUST NOT se aplicar de novo a essa linha.
- **FR-013**: A listagem MUST oferecer **caixa de seleção** por linha e seleção do grupo, para o administrador executar **ações em massa** sobre o conjunto marcado.
- **FR-013a**: As ações em massa MUST incluir **Liberar em massa** e **Pagar em massa**.
- **FR-013b**: **Liberar em massa** MUST aplicar somente a linhas ainda não liberadas da seleção; linhas já liberadas MUST ser ignoradas com feedback de contagem.
- **FR-013c**: **Pagar em massa** MUST aplicar somente a linhas já liberadas e ainda não pagas; demais MUST ser ignoradas com feedback de contagem.
- **FR-013d**: Ações em massa MUST exigir confirmação antes de efetivar, no mesmo espírito das ações individuais.
- **FR-014**: Usuários `admin` alteram dados (cadastro na conta, Liberar, Pagar e lote conforme FR-012/FR-013); usuários `visualizador` permanecem somente leitura.
- **FR-015**: Filtros já existentes da página Comissões (pessoa/fornecedor, ano, mês ou trimestre) MUST continuar valendo para listagem, totais, Liberado, Pago e o conjunto elegível ao lote.
- **FR-016**: Rótulos visíveis MUST usar **Comissão/Comissões** (não Bônus), inclusive no nome do valor calculado (**Valor da comissão**), ainda que o pedido original tenha citado “Valor Bônus”.

### Key Entities

- **Conta a receber**: Lançamento de recebimento já existente; passa a ser a origem do cadastro das comissões. O **valor líquido** alimenta o cálculo do valor da comissão.
- **Comissão**: Linha de remuneração vinculada a uma Conta a receber (novos registros) e a um **Fornecedor**, com mês/ano, atividades, percentual, valor calculado e estados de **liberada** e **paga**.
- **Fornecedor**: Destinatário da comissão, escolhido no cadastro unificado de Fornecedores.
- **Atividade**: Conjunto (um ou mais) entre Lead, Venda, Condução e Placement, no lugar da antiga Etapa de valor único.
- **Liberação**: Ato do administrador que autoriza a comissão; o valor liberado é o que a coluna **Liberado** soma por fornecedor.
- **Pagamento**: Ato do administrador que quita uma comissão já liberada; só então a coluna **Pago** da linha passa a indicar paga.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um administrador cria uma Conta a receber e duas comissões (fornecedores e atividades diferentes) no mesmo fluxo e conclui em menos de 3 minutos, sem abrir a página Comissões para “lançar na mão”.
- **SC-002**: Em 100% dos casos com valor líquido e percentual informados, o valor da comissão exibido coincide com `(percentual / 100) × valor líquido`, sem digitação do valor.
- **SC-003**: Em uma revisão da página Comissões, 0 ocorrências da ação **Deletar**; 100% das linhas com conta vinculada, ao acionar **Editar**, abrem essa Conta a receber.
- **SC-004**: Após liberar as comissões de um fornecedor no recorte, a coluna **Liberado** daquele fornecedor mostra a soma correta em menos de 5 segundos, sem cálculo manual.
- **SC-005**: Um administrador executa **Liberar em massa** ou **Pagar em massa** em pelo menos 5 comissões elegíveis de uma vez, na primeira tentativa, sem treinar o fluxo.
- **SC-006**: Visualizador consulta listagem, Liberado e Pago sem conseguir alterar, liberar, pagar ou selecionar para lote, em 100% das tentativas.

## Assumptions

- A página Comissões já existente (nomenclatura, filtros de período, agrupamento por pessoa, gráfico anual, papéis admin/visualizador) permanece a base; esta feature muda a **origem do cadastro**, os **campos da linha**, as **ações** e as **colunas Liberado/Pago**.
- Criação avulsa pela página Comissões continua **sem** botão de novo registro (feature anterior). Novos registros nascem no fluxo da Conta a receber.
- **Valor da comissão** = percentual como fração de 100 vezes o valor líquido (não é multiplicação crua “10 × líquido”).
- Comissões no lançamento da conta são **opcionais** (zero linhas permitidas).
- Destinatário é qualquer **Fornecedor ativo** do cadastro unificado, não só os antigos “elegíveis de equipe”.
- Cliente, posição e NF da listagem, quando existirem, vêm da Conta a receber vinculada; não são campos novos da linha de comissão.
- Linha já **liberada** é imutável no cadastro; a conta ainda pode ganhar **novas** linhas.
- Importação CSV avulsa de comissões **não** entra nesta feature (permanece como está até outro pedido).
- Desfazer Liberar ou Pagar **não** é oferecido nesta versão (não há Deletar; correção de valor só em linha ainda não liberada).
- Exclusão da Conta a receber remove as comissões da visão operacional de Comissões.
- **Pago** exige **Liberar** antes: fluxo em duas etapas (autorizar → quitar), alinhado a Contas a Pagar.
- Ações em massa confirmadas: **Liberar em massa** e **Pagar em massa**, cada uma respeitando elegibilidade da linha.
- **Pagar** (individual ou em massa) segue o padrão de Contas a Pagar: confirmação do administrador; data de pagamento registrada automaticamente (sem modal extra de data nesta versão).
