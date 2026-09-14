# Feature Specification: Página Bônus e Comissão com abas

**Feature Branch**: `062-bonus-comissao-abas`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "na sessao que refere a bonus. Além disso mudar para o nome de bonus e comissão e dentro da página ter 2 abas, uma de bonus e uma de comissão. Ação de Editar deve referenciar a Conta a receber; Inserir ação de Liberar; Remover ação de Deletar; Adicionar colunas Liberado (mostra automaticamente a comissão liberada de cada um) e Pago; Adicionar caixa de seleção para ações em massa"

## Clarifications

### Session 2026-09-14

- Q: O que distingue um registro de Bônus de um de Comissão? → A: Aba **Comissão** = listagem atual (comissões da Conta a receber). Aba **Bônus** = tipo novo de remuneração, separado. Os registros de hoje ficam todos em Comissão.
- Q: As ações Editar / Liberar / Pagar, as colunas Liberado e Pago e a seleção em massa aplicam-se às duas abas? → A: Nas **duas** abas, o mesmo pacote (Editar pela Conta a receber, Liberar, sem Deletar, Liberado, Pago, seleção e lote).
- Q: Como um registro novo de Bônus entra no sistema? → A: No fluxo da **Conta a receber**, em bloco paralelo ao de comissões (zero ou mais linhas de bônus no mesmo lançamento).
- Q: Como o valor da linha de bônus é informado? → A: **Fornecedor**, **Mês/Ano** e **valor em R$** digitado pelo administrador (sem percentual automático sobre o líquido; sem Atividade).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reconhecer a página Bônus e Comissão e alternar as abas (Priority: P1)

O usuário autenticado (admin ou visualizador) deixa de ver o menu e o título da sessão apenas como **Comissões** (nome atual) ou **Bônus** (nome legado). A mesma sessão do produto passa a chamar-se **Bônus e Comissão**. Dentro da página há duas abas: **Bônus** e **Comissão**. Trocar de aba não tira o usuário da página nem descarta os filtros de pessoa/fornecedor e de período já aplicados.

**Why this priority**: Sem o nome e as duas abas, bônus e comissão continuam misturados ou invisíveis como conceitos distintos — é o recorte desta feature.

**Independent Test**: Abrir a sessão pelo menu, confirmar o nome **Bônus e Comissão**, alternar as duas abas e conferir que filtros de período permanecem e que cada aba mostra só o conjunto correspondente.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado com acesso à página, **When** consulta o menu lateral, **Then** o item exibe **Bônus e Comissão** (não só **Bônus** nem só **Comissões**) e abre essa sessão.
2. **Given** a página aberta, **When** o usuário lê o título, **Then** vê **Bônus e Comissão**.
3. **Given** a página aberta, **When** o usuário olha a área principal, **Then** vê as abas **Bônus** e **Comissão**.
4. **Given** uma aba ativa, **When** o usuário seleciona a outra, **Then** passa a ver o conteúdo da aba escolhida sem sair da página e sem perder os filtros de pessoa/fornecedor, ano, mês ou trimestre já aplicados.
5. **Given** um administrador na tela de Configurações (visibilidade de páginas), **When** localiza esta sessão no catálogo, **Then** o rótulo visível é **Bônus e Comissão**.
6. **Given** papéis `admin` e `visualizador`, **When** cada um abre a página, **Then** ambos veem o mesmo nome e as mesmas abas (o visualizador permanece somente leitura nas ações de alteração).
7. **Given** a primeira visita à página na sessão, **When** a tela carrega, **Then** a aba **Comissão** está selecionada (continuidade da listagem operacional atual).

---

### User Story 2 - Operar a listagem: Editar pela conta, Liberar, sem Deletar, colunas Liberado e Pago (Priority: P1)

Nas **duas** abas (**Bônus** e **Comissão**), o administrador **não** deleta linhas. **Editar** leva à **Conta a receber** vinculada, não a um formulário isolado da linha. Existe **Liberar** em linha ainda não liberada. A listagem mostra **Liberado** (valor já liberado de cada pessoa/fornecedor, de forma automática) e **Pago**. Linhas já liberadas e ainda não pagas podem ser marcadas como pagas pela ação **Pagar**.

**Why this priority**: É o jeito de operar a sessão: acompanhar, autorizar e quitar, editando no contexto do recebimento.

**Independent Test**: Em cada aba, em uma linha com Conta a receber associada, acionar Editar e abrir essa conta; Liberar e ver o valor em Liberado; confirmar ausência de Deletar; conferir a coluna Pago.

**Acceptance Scenarios**:

1. **Given** um administrador na listagem da aba **Bônus** ou da aba **Comissão** com linhas visíveis, **When** olha as ações de cada linha, **Then** **não** vê **Deletar** (nem Excluir/Remover equivalente) para admin nem para visualizador.
2. **Given** uma linha vinculada a uma Conta a receber, **When** o administrador aciona **Editar**, **Then** abre o fluxo/formulário dessa Conta a receber (não um formulário só da linha).
3. **Given** uma linha **sem** Conta a receber associada (registro legado), **When** o administrador aciona **Editar**, **Then** recebe mensagem clara de que não há Conta a receber associada e a edição isolada **não** é oferecida.
4. **Given** uma linha ainda não liberada, **When** o administrador aciona **Liberar** e confirma, **Then** a linha passa a liberada e o valor entra no **Liberado** daquela pessoa/fornecedor no recorte filtrado — **sem** exigir que a Conta a receber vinculada esteja recebida/quitada (e mesmo se não houver conta vinculada).
5. **Given** uma linha já liberada, **When** o administrador olha as ações, **Then** **Liberar** não se aplica de novo a essa linha.
6. **Given** o agrupamento por pessoa/fornecedor com algumas linhas liberadas e outras não, **When** o usuário lê o grupo, **Then** o indicador **Liberado** do grupo mostra a **soma automática** dos valores já liberados daquela pessoa no recorte visível, sem cálculo manual.
7. **Given** uma linha liberada e outra não no mesmo grupo, **When** o usuário lê a coluna **Liberado** de cada linha, **Then** a liberada exibe o **valor** da linha e a não liberada exibe vazio ou “—” (equivalente).
8. **Given** a coluna **Pago**, **When** o usuário lê cada linha, **Then** identifica se está **paga** ou **pendente**.
9. **Given** uma linha já liberada e ainda não paga, **When** o administrador aciona **Pagar** e confirma, **Then** a linha passa a paga e a coluna **Pago** reflete esse estado.
10. **Given** uma linha ainda **não** liberada, **When** o administrador procura **Pagar**, **Then** a ação **não** está disponível (só após Liberar).
11. **Given** uma linha já paga, **When** o administrador olha as ações, **Then** **Pagar** não se aplica de novo.
12. **Given** um visualizador, **When** usa a página, **Then** vê Liberado e Pago, mas **não** aciona Liberar, Pagar nem persiste edição pela ação Editar.
13. **Given** filtros já existentes (pessoa/fornecedor, ano, mês ou trimestre), **When** aplicados, **Then** listagem, totais, Liberado e Pago da **aba ativa** respeitam o mesmo recorte.
14. **Given** as duas abas, **When** o usuário compara o conteúdo, **Then** a aba **Comissão** mostra só as comissões (incluindo todo o histórico atual) e a aba **Bônus** mostra só bônus (tipo novo); nenhuma linha aparece nas duas.
15. **Given** um administrador na aba **Bônus** e depois na aba **Comissão**, **When** compara as ações e colunas, **Then** vê o mesmo pacote nas duas: Editar, Liberar (se elegível), Pagar (se elegível), Liberado, Pago e caixas de seleção; em nenhuma das duas vê Deletar.

---

### User Story 3 - Caixa de seleção e ações em massa (Priority: P2)

O administrador marca uma ou mais linhas com **caixa de seleção** e dispara ações em massa (**Liberar em massa** e **Pagar em massa**) sobre a seleção da **página atual** da **aba ativa**. O visualizador não seleciona nem dispara lote.

**Why this priority**: Liberar e pagar uma a uma não escala no fechamento mensal.

**Independent Test**: Marcar várias linhas não liberadas na aba ativa, executar Liberar em massa; marcar linhas liberadas e executar Pagar em massa; confirmar feedback e colunas atualizadas.

**Acceptance Scenarios**:

1. **Given** um administrador na listagem da aba ativa com linhas visíveis, **When** olha cada linha, **Then** há uma caixa de seleção.
2. **Given** um grupo de uma pessoa/fornecedor, **When** o administrador usa a seleção do grupo (se houver), **Then** marca ou desmarca todas as linhas **visíveis na página atual** daquele grupo (não inclui linhas do mesmo grupo em outras páginas).
3. **Given** ao menos uma linha marcada, **When** o administrador olha a área de ações, **Then** vê **Liberar em massa** e **Pagar em massa** (cada uma conforme elegibilidade da seleção).
4. **Given** seleção mista para **Liberar em massa**, **When** o lote é confirmado, **Then** só linhas ainda não liberadas **da seleção (página atual, aba ativa)** são processadas; as demais são ignoradas com contagem no feedback.
5. **Given** seleção mista para **Pagar em massa**, **When** o lote é confirmado, **Then** só linhas liberadas e não pagas **da seleção (página atual, aba ativa)** são processadas; as demais são ignoradas com contagem no feedback.
6. **Given** nenhuma linha marcada, **When** o administrador procura ação em massa, **Then** ela não dispara (desabilitada ou oculta).
7. **Given** linhas elegíveis em outra página da listagem, **When** o administrador seleciona e dispara lote na página atual, **Then** as linhas das outras páginas **não** entram no lote.
8. **Given** linhas marcadas na página atual, **When** o administrador muda de página, altera filtros **ou troca de aba**, **Then** a seleção é **limpa**.
9. **Given** um visualizador, **When** consulta a listagem, **Then** não há caixas de seleção operáveis nem barra de lote.

---

### User Story 4 - Cadastrar bônus ao lançar a Conta a receber (Priority: P1)

O administrador, ao **criar** ou **editar** uma Conta a receber, vê no mesmo fluxo um bloco de **Bônus**, paralelo ao bloco já existente de **Comissões**. Pode incluir **quantas linhas de bônus quiser** (ou nenhuma). Cada linha pede **Fornecedor**, **Mês/Ano** e **valor em R$**, este último **informado pelo administrador** (não calculado a partir de percentual nem do valor líquido). Ao gravar a conta, as linhas de bônus válidas passam a existir vinculadas àquela conta e aparecem na aba **Bônus**. Linhas de comissão do mesmo lançamento continuam indo só para a aba **Comissão**. Na edição da conta, o administrador ajusta linhas de bônus **ainda não liberadas** (incluir, alterar ou retirar).

**Why this priority**: Sem o cadastro no ato da conta, a aba Bônus permanece vazia e a ação Editar pela Conta a receber não tem origem.

**Independent Test**: Criar uma conta com valor líquido conhecido, adicionar uma linha de bônus (fornecedor, mês/ano e valor em R$ informado) e uma de comissão; gravar; conferir o bônus na aba Bônus com o valor digitado (não o percentual do líquido) e a comissão na aba Comissão. Editar a conta, incluir outro bônus não liberado e gravar.

**Acceptance Scenarios**:

1. **Given** um administrador em **Nova conta a receber**, **When** o formulário abre, **Then** há um bloco visível de **Bônus** com ação para **adicionar linha**, sem exigir sair da tela, além do bloco de **Comissões** já existente.
2. **Given** o bloco de bônus, **When** o administrador adiciona uma linha, **Then** vê os campos **Fornecedor**, **Mês/Ano** e **Valor (R$)** e **não** vê percentual nem Atividade (Lead, Venda, Condução, Placement) nessa linha.
3. **Given** uma linha de bônus, **When** o administrador informa o valor em R$, **Then** esse valor é o que será gravado; **não** é recalculado a partir do valor líquido da conta.
4. **Given** o bloco de bônus, **When** o administrador não adiciona nenhuma linha e grava a conta, **Then** a conta é salva normalmente, sem bônus.
5. **Given** uma ou mais linhas de bônus válidas no lançamento, **When** o administrador grava a conta, **Then** todas as linhas válidas de bônus são persistidas vinculadas àquela Conta a receber e aparecem na aba **Bônus**.
6. **Given** o mesmo lançamento com linhas de comissão e de bônus, **When** o administrador grava, **Then** as comissões aparecem só na aba **Comissão** e os bônus só na aba **Bônus**.
7. **Given** uma linha de bônus incompleta (faltando Fornecedor, Mês/Ano ou valor maior que zero), **When** tenta gravar a conta, **Then** o sistema recusa e indica o que falta na linha.
8. **Given** uma Conta a receber já gravada com bônus, **When** o administrador abre **Editar** nessa conta, **Then** vê as linhas de bônus existentes e pode incluir novas, alterar ou retirar linhas **ainda não liberadas**.
9. **Given** um bônus **já liberado**, **When** o administrador edita a Conta a receber, **Then** essa linha de bônus não pode ser alterada nem retirada no formulário; novas linhas de bônus ainda podem ser adicionadas.
10. **Given** um visualizador, **When** cria ou edita conta, **Then** não altera bônus (somente leitura, como no restante do produto).
11. **Given** a aba **Bônus** após gravar, **When** o administrador aciona **Editar** na linha, **Then** abre a mesma Conta a receber em que o bônus foi lançado.

---

### Edge Cases

- Linha **sem** Conta a receber: permanece listada na aba correspondente; Editar informa a ausência de vínculo; Liberar e Pagar (quando elegíveis) continuam possíveis; Deletar permanece indisponível.
- **Liberar** não depende do status da Conta a receber vinculada (recebida ou não) nem da existência do vínculo.
- Linha **liberada mas não paga**: Pagar disponível; Liberar não se repete.
- Linha **paga**: Pagar não se repete; permanece na listagem com Pago indicando quitada.
- Tentativa de Pagar linha não liberada: ação indisponível ou recusada com mensagem clara.
- Aba sem resultados no recorte: estado vazio compreensível (próprio daquela aba); Liberado zerado; seleção em massa inativa.
- Aba **Bônus** sem nenhum bônus cadastrado (situação inicial): estado vazio próprio da aba; a aba **Comissão** continua com o histórico atual.
- Paginação: seleção e lote aplicam-se **somente** às linhas da página atual da aba ativa.
- Ao mudar de **página**, de **filtros** ou de **aba**, a seleção é limpa.
- Conta a receber excluída (quando o produto já remove o vínculo operacional): a linha deixa de aparecer na listagem correspondente, conforme regra já existente do domínio.
- Troca de aba **não** altera os filtros de pessoa/fornecedor e período; o total e o gráfico visíveis passam a refletir só a aba ativa.
- Conta a receber **sem** bônus e **sem** comissão: conta grava normalmente; abas mostram estado vazio para aquele lançamento.
- Mesma Conta a receber com **bônus e comissão**: cada tipo aparece só na aba correspondente.
- Bônus **liberado**: não pode ser removido nem ter os campos de cadastro alterados no formulário da conta; novas linhas de bônus ainda podem ser adicionadas na mesma conta.
- Alterar o **valor líquido** da conta **não** altera o valor das linhas de bônus (o valor do bônus é o informado, não um percentual).
- Valor de bônus zero ou negativo: a linha é recusada até haver valor **maior que zero**.
- Aba **Bônus**: listagem **não** exibe Atividade nem Percentual; exibe Mês/Ano, valor informado, Liberado, Pago e dados da Conta a receber vinculada (quando houver).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O menu, o título da página e o catálogo de páginas em Configurações MUST usar o nome **Bônus e Comissão** para esta sessão (não apenas Bônus nem apenas Comissões).
- **FR-002**: A página MUST exibir duas abas visíveis: **Bônus** e **Comissão**.
- **FR-003**: Ao abrir a página (primeira visita da sessão), a aba **Comissão** MUST estar selecionada.
- **FR-004**: Alternar abas MUST manter os filtros já existentes (pessoa/fornecedor, ano, mês ou trimestre) e MUST limpar a seleção em massa.
- **FR-005**: Cada aba MUST listar somente os registros do seu tipo, sem misturar Bônus e Comissão. A aba **Comissão** MUST exibir a listagem operacional já existente (comissões, inclusive o histórico atual). A aba **Bônus** MUST exibir somente o tipo novo de remuneração **Bônus**. MUST NOT reclassificar registros atuais para Bônus.
- **FR-006**: Totais, gráfico de evolução e estado vazio visíveis MUST refletir a **aba ativa**.
- **FR-007**: Nas abas **Bônus** e **Comissão**, a ação **Editar** MUST abrir a **Conta a receber** vinculada à linha.
- **FR-008**: Se a linha não tiver Conta a receber associada, **Editar** MUST informar isso ao usuário e MUST NOT abrir edição isolada da linha.
- **FR-009**: A página MUST NOT oferecer ação **Deletar** (nem equivalente) para admin ou visualizador, em nenhuma das abas.
- **FR-010**: A listagem MUST oferecer ação **Liberar** ao administrador em cada linha ainda não liberada, com confirmação antes de efetivar, **sem** pré-requisito de status da Conta a receber nem de existência de vínculo.
- **FR-011**: Após Liberar, a linha MUST ser tratada como liberada; a coluna **Liberado** da linha MUST exibir o valor; e esse valor MUST entrar na soma **Liberado** do grupo daquela pessoa/fornecedor no recorte visível.
- **FR-012**: A listagem MUST exibir a coluna **Liberado** por linha (valor se liberada; vazio ou “—” se não) e MUST exibir no grupo a **soma automática** das linhas já liberadas daquela pessoa/fornecedor no recorte filtrado.
- **FR-013**: A listagem MUST exibir a coluna **Pago**, indicando por linha se está paga ou pendente.
- **FR-014**: A coluna **Pago** MUST refletir apenas o resultado da ação **Pagar** (ou **Pagar em massa**); MUST NOT passar a paga automaticamente ao Liberar.
- **FR-015**: O administrador MUST poder acionar **Pagar** em linha já liberada e ainda não paga, com confirmação antes de efetivar.
- **FR-016**: **Pagar** MUST NOT estar disponível em linha ainda não liberada; após Pagar, MUST NOT se aplicar de novo à mesma linha.
- **FR-017**: A listagem MUST oferecer **caixa de seleção** por linha (e seleção de grupo, quando agrupada) para o administrador executar ações em massa, restritas às linhas **visíveis na página atual da aba ativa**.
- **FR-018**: As ações em massa MUST incluir **Liberar em massa** e **Pagar em massa**, cada uma aplicando somente às linhas elegíveis **selecionadas na página atual da aba ativa**, com feedback de processadas e ignoradas.
- **FR-019**: Ações em massa MUST exigir confirmação antes de efetivar e MUST NOT disparar sem linhas selecionadas.
- **FR-020**: Ao mudar de página da listagem, ao alterar filtros ou ao trocar de aba, o sistema MUST **limpar** a seleção atual.
- **FR-021**: Usuários `admin` executam Editar (navegação à conta), Liberar, Pagar e lote; usuários `visualizador` permanecem somente leitura (veem abas e colunas, sem seleção operável nem ações de alteração).
- **FR-022**: Filtros já existentes da página MUST continuar valendo para listagem, totais, Liberado, Pago e o conjunto elegível ao lote da aba ativa.
- **FR-023**: Os requisitos FR-007 a FR-022 MUST aplicar-se às **duas** abas quanto ao pacote de **ações** (Editar, Liberar, Pagar, sem Deletar, seleção e lote) e às colunas **Liberado** e **Pago**. A aba **Bônus** MUST NOT exigir as colunas Atividade nem Percentual da listagem de comissão.
- **FR-024**: Ao criar ou editar uma Conta a receber, o sistema MUST apresentar o cadastro de **Bônus** no mesmo fluxo, em bloco paralelo ao de Comissões, com possibilidade de **zero ou mais** linhas.
- **FR-025**: Cada linha de bônus válida gravada MUST ficar vinculada àquela Conta a receber e MUST aparecer somente na aba **Bônus**.
- **FR-026**: Na edição da Conta a receber, o sistema MUST exibir as linhas de bônus vinculadas e MUST permitir incluir, alterar ou remover apenas linhas de bônus **não liberadas**.
- **FR-027**: O bloco de **Comissões** no formulário da Conta a receber MUST permanecer; esta feature MUST NOT misturar linhas de bônus e de comissão no mesmo bloco.
- **FR-028**: Cada linha de bônus MUST exigir **Fornecedor** (fornecedor ativo do cadastro), **Mês** e **Ano**, e **Valor (R$)** informado pelo administrador, **maior que zero**.
- **FR-029**: O valor do bônus MUST ser o informado pelo administrador; MUST NOT ser calculado a partir de percentual nem do valor líquido da Conta a receber; MUST NOT recalcular se o líquido da conta mudar.
- **FR-030**: A linha de bônus MUST NOT usar o campo **Atividade** (Lead, Venda, Condução, Placement) nem **Percentual (%)**.

### Key Entities

- **Sessão Bônus e Comissão**: Página única do produto que reúne os dois conceitos em abas.
- **Bônus**: Tipo **novo** de remuneração, distinto da comissão; listado só na aba Bônus; associado a um **Fornecedor**, **mês/ano** e **valor em R$ informado**; estados **liberada** e **paga**; operado com o mesmo pacote de ações da comissão (Editar pela Conta a receber, Liberar, Pago, lote). Não inclui o histórico hoje listado como comissão e não usa Atividade nem percentual.
- **Comissão**: Remuneração da listagem operacional já existente; listada só na aba Comissão; associada a uma pessoa/fornecedor, preferencialmente vinculada a uma Conta a receber, com valor e estados **liberada** e **paga**. Todo o histórico atual permanece neste tipo.
- **Conta a receber**: Lançamento de origem do cadastro das **comissões** (já existente) e dos **bônus** (bloco paralelo nesta feature); referenciado pela ação Editar nas duas abas.
- **Liberação**: Ato do administrador que autoriza a linha; alimenta o valor mostrado em **Liberado**.
- **Pagamento**: Ato do administrador que quita uma linha já liberada; reflete-se em **Pago**.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em revisão de menu, título da página e catálogo de Configurações, 100% das ocorrências desta sessão usam **Bônus e Comissão**; 0 ocorrências isoladas de “Bônus” ou “Comissões” como nome da sessão.
- **SC-002**: Um usuário autenticado alterna entre as abas **Bônus** e **Comissão** na primeira tentativa, em menos de 10 segundos, sem perder os filtros já aplicados.
- **SC-003**: Em revisão da listagem operacional, 0 ocorrências da ação **Deletar**; 100% das linhas com conta vinculada, ao acionar **Editar**, abrem essa Conta a receber.
- **SC-004**: Após liberar as linhas de uma pessoa no recorte da aba ativa, a coluna **Liberado** de cada linha liberada mostra o valor correto e a soma **Liberado** do grupo coincide com a soma dessas linhas em menos de 5 segundos, sem cálculo manual.
- **SC-005**: Um administrador marca e executa **Liberar em massa** ou **Pagar em massa** em pelo menos 5 linhas elegíveis **visíveis na mesma página da mesma aba** de uma vez, na primeira tentativa.
- **SC-006**: Visualizador consulta as duas abas, Liberado e Pago, sem conseguir liberar, pagar, deletar ou selecionar para lote, em 100% das tentativas.
- **SC-007**: Em 100% das linhas não liberadas da listagem operacional, **Pagar** permanece indisponível até após **Liberar**.
- **SC-008**: Nenhuma linha de Bônus aparece na aba Comissão e nenhuma linha de Comissão aparece na aba Bônus, em 100% dos recortes filtrados.
- **SC-009**: Um administrador cria uma Conta a receber com ao menos uma linha de bônus e uma de comissão no mesmo fluxo e, em menos de 3 minutos, vê o bônus só na aba Bônus e a comissão só na aba Comissão.
- **SC-010**: Em 100% das linhas de bônus gravadas, o valor exibido coincide com o valor em R$ informado no cadastro, e não com um percentual do valor líquido da conta.

## Assumptions

- A sessão alvo é a página hoje chamada **Comissões** (antes **Bônus**); esta feature **não** cria uma segunda página no menu.
- A aba **Comissão** corresponde à listagem operacional já existente (comissões vinculadas à Conta a receber, agrupamento por pessoa/fornecedor, filtros de período, gráfico anual). **Bônus** é um tipo novo e separado; registros atuais **não** são migrados nem reclassificados.
- A aba padrão ao abrir é **Comissão**, para não esconder a listagem que a operação já usa; a ordem visual das abas é **Bônus** e depois **Comissão**, como no pedido.
- Nomenclatura desta feature restringe-se à **sessão** (menu, título, catálogo). Rótulos de Dashboard, Contas a Pagar “(legado)” e bloco de comissões no formulário da Conta a receber **permanecem** como estão, salvo outro pedido.
- Papéis `admin` (altera) e `visualizador` (somente leitura) permanecem.
- **Pago** exige **Liberar** antes (autorizar → quitar), no mesmo espírito de Contas a Pagar.
- **Liberar** não exige Conta a receber recebida/quitada nem vínculo obrigatório.
- Ações em massa: **Liberar em massa** e **Pagar em massa**; seleção e lote limitados à **página atual da aba ativa**; ao mudar de página, filtros **ou aba**, a seleção é **limpa**.
- Cadastro de novas **comissões** no fluxo da Conta a receber permanece como já especificado em feature correlata (`045-comissoes-conta-receber`); esta spec **não** reabre esse cadastro e **acrescenta** o bloco paralelo de **Bônus**.
- Não há botão de novo bônus avulso na aba Bônus; novos bônus nascem no fluxo da Conta a receber.
- Campos da linha de bônus: **Fornecedor**, **Mês/Ano** e **Valor (R$)** informado (> 0). Sem Atividade e sem percentual sobre o líquido; mudança do líquido da conta não altera o valor do bônus.
- Ações da listagem (Editar pela conta, Liberar, sem Deletar, Liberado, Pago, seleção e lote) valem nas **duas** abas; a aba Bônus não replica colunas Atividade/Percentual da comissão.
- Desfazer Liberar/Pagar e reintroduzir Deletar estão fora de escopo.
- Importação/exportação CSV existentes não são o foco desta feature; quando existirem, devem respeitar a aba ativa (exportar o conjunto visível daquela aba).
- Endereço da página e demais detalhes técnicos ficam para o plano; o usuário chega à sessão pelo mesmo item de menu, agora com o nome novo.
