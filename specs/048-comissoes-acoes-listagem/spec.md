# Feature Specification: Comissões — editar pela conta, liberar, colunas e ações em massa

**Feature Branch**: `048-comissoes-acoes-listagem`

**Created**: 2026-09-06

**Status**: Draft

**Input**: User description: "em BÔNUS - Ação de Editar deve referenciar a Conta a receber; Inserir ação de Liberar; Remover ação de Deletar; Adicionar colunas Liberado (mostra automaticamente a comissão liberada de cada um) e Pago; Adicionar caixa de seleção para ações em massa"

## Clarifications

### Session 2026-09-06

- Q: Como a comissão passa a Paga? → A: Ação **Pagar** (individual e em massa) só em linha já **liberada** e ainda não paga.
- Q: O que a coluna Liberado mostra exatamente? → A: Coluna por **linha** (valor se liberada, vazio/— se não) **e** soma automática no grupo da pessoa/fornecedor.
- Q: A seleção em massa vale para quais linhas? → A: Apenas linhas **visíveis na página atual** (paginação).
- Q: Há pré-requisito para Liberar? → A: Sem pré-requisito extra: admin libera qualquer linha ainda não liberada.
- Q: Ao mudar de página, o que acontece com a seleção? → A: **Limpar** a seleção ao mudar de página ou ao mudar filtros.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Editar pela Conta a receber e remover Deletar (Priority: P1)

Na página **Comissões** (antiga Bônus), o administrador deixa de **deletar** linhas pela listagem. A ação **Editar** deixa de abrir um formulário isolado da comissão e passa a levar à **Conta a receber** vinculada, onde os dados da comissão são tratados no contexto do recebimento.

**Why this priority**: Sem o vínculo na edição, a operação continua tratando comissão como lançamento avulso; remover Deletar evita apagar histórico operacional pela listagem.

**Independent Test**: Em uma linha com Conta a receber associada, acionar Editar e confirmar abertura dessa conta; confirmar ausência de Deletar em todas as linhas.

**Acceptance Scenarios**:

1. **Given** um administrador na página Comissões com linhas listadas, **When** olha as ações de cada linha, **Then** **não** vê **Deletar** (nem equivalente como Excluir/Remover) para admin nem para visualizador.
2. **Given** uma comissão vinculada a uma Conta a receber, **When** o administrador aciona **Editar**, **Then** abre o fluxo/formulário dessa Conta a receber (não um modal só da comissão).
3. **Given** uma comissão **sem** Conta a receber associada (registro legado), **When** o administrador aciona **Editar**, **Then** recebe mensagem clara de que não há Conta a receber associada e a edição isolada da comissão **não** é oferecida.
4. **Given** um visualizador, **When** consulta a listagem, **Then** também **não** vê Deletar e **não** persiste edição pela ação Editar.

---

### User Story 2 - Liberar e colunas Liberado / Pago (Priority: P1)

O administrador passa a **Liberar** comissões ainda não liberadas. A listagem exibe a coluna **Liberado**, que mostra **automaticamente** o valor das comissões já liberadas de cada pessoa/fornecedor no recorte visível, e a coluna **Pago**, que indica se cada linha já foi quitada. Linhas já liberadas e ainda não pagas podem ser marcadas como **Pagas** pela ação **Pagar**.

**Why this priority**: A operação precisa enxergar o que já foi autorizado e o que já foi quitado, e liberar sem depender de exclusão ou edição avulsa.

**Independent Test**: Liberar uma linha; conferir o valor na coluna Liberado do grupo daquela pessoa; marcar como paga e conferir a coluna Pago.

**Acceptance Scenarios**:

1. **Given** uma linha ainda não liberada, **When** o administrador aciona **Liberar** e confirma, **Then** a linha passa a liberada e o valor entra no **Liberado** daquela pessoa/fornecedor no recorte filtrado — **sem** exigir que a Conta a receber vinculada esteja recebida/quitada (e mesmo se não houver conta vinculada).
2. **Given** uma linha já liberada, **When** o administrador olha as ações, **Then** **Liberar** não se aplica de novo a essa linha.
3. **Given** o agrupamento por pessoa/fornecedor com algumas linhas liberadas e outras não, **When** o usuário lê o grupo, **Then** o indicador **Liberado** do grupo mostra a **soma automática** dos valores já liberados daquela pessoa no recorte visível, sem cálculo manual.
4. **Given** uma linha liberada e outra não no mesmo grupo, **When** o usuário lê a coluna **Liberado** de cada linha, **Then** a liberada exibe o **valor** da comissão e a não liberada exibe vazio ou “—” (equivalente).
5. **Given** a coluna **Pago**, **When** o usuário lê cada linha, **Then** identifica se a comissão está **paga** ou **pendente**.
6. **Given** uma linha já liberada e ainda não paga, **When** o administrador aciona **Pagar** e confirma, **Then** a linha passa a paga e a coluna **Pago** reflete esse estado.
7. **Given** uma linha ainda **não** liberada, **When** o administrador procura **Pagar**, **Then** a ação **não** está disponível (só após Liberar).
8. **Given** uma linha já paga, **When** o administrador olha as ações, **Then** **Pagar** não se aplica de novo.
9. **Given** um visualizador, **When** usa a página, **Then** vê Liberado e Pago, mas **não** aciona Liberar nem Pagar.
10. **Given** filtros já existentes (pessoa/fornecedor, ano, mês ou trimestre), **When** aplicados, **Then** listagem, totais, Liberado e Pago respeitam o mesmo recorte.

---

### User Story 3 - Caixa de seleção e ações em massa (Priority: P2)

O administrador marca uma ou mais comissões com **caixa de seleção** e dispara ações em massa sobre a seleção (**Liberar em massa** e **Pagar em massa**). O visualizador não seleciona nem dispara lote.

**Why this priority**: Liberar e pagar uma a uma não escala no fechamento mensal.

**Independent Test**: Marcar várias linhas não liberadas, executar Liberar em massa; marcar linhas liberadas e executar Pagar em massa; confirmar feedback e colunas atualizadas.

**Acceptance Scenarios**:

1. **Given** um administrador na listagem com linhas visíveis, **When** olha cada linha, **Then** há uma caixa de seleção.
2. **Given** um grupo de uma pessoa/fornecedor, **When** o administrador usa a seleção do grupo (se houver), **Then** marca ou desmarca todas as linhas **visíveis na página atual** daquele grupo (não inclui linhas do mesmo grupo em outras páginas).
3. **Given** ao menos uma linha marcada, **When** o administrador olha a área de ações, **Then** vê **Liberar em massa** e **Pagar em massa** (cada uma conforme elegibilidade da seleção).
4. **Given** seleção mista para **Liberar em massa**, **When** o lote é confirmado, **Then** só linhas ainda não liberadas **da seleção (página atual)** são processadas; as demais são ignoradas com contagem no feedback.
5. **Given** seleção mista para **Pagar em massa**, **When** o lote é confirmado, **Then** só linhas liberadas e não pagas **da seleção (página atual)** são processadas; as demais são ignoradas com contagem no feedback.
6. **Given** nenhuma linha marcada, **When** o administrador procura ação em massa, **Then** ela não dispara (desabilitada ou oculta).
7. **Given** linhas elegíveis em outra página da listagem, **When** o administrador seleciona e dispara lote na página atual, **Then** as linhas das outras páginas **não** entram no lote.
8. **Given** linhas marcadas na página atual, **When** o administrador muda de página ou altera filtros, **Then** a seleção é **limpa** (nenhuma linha permanece marcada).
9. **Given** um visualizador, **When** consulta a listagem, **Then** não há caixas de seleção operáveis nem barra de lote.

---

### Edge Cases

- Comissão **sem** Conta a receber: permanece listada; Editar informa a ausência de vínculo; Liberar e Pagar (quando elegíveis) continuam possíveis; Deletar permanece indisponível.
- **Liberar** não depende do status da Conta a receber vinculada (recebida ou não) nem da existência do vínculo.
- Comissão **liberada mas não paga**: Pagar disponível; Liberar não se repete.
- Comissão **paga**: Pagar não se repete; linha permanece na listagem com Pago indicando quitada.
- Tentativa de Pagar linha não liberada: ação indisponível ou recusada com mensagem clara.
- Filtro sem resultados: estado vazio compreensível; Liberado zerado; seleção em massa inativa.
- Paginação: seleção e lote aplicam-se **somente** às linhas da página atual; o lote não inclui o que não está na tela.
- Ao mudar de **página** ou de **filtros**, a seleção é limpa.
- Conta a receber excluída (quando o produto já remove o vínculo operacional): a comissão deixa de aparecer na listagem de Comissões, conforme regra já existente do domínio.
- Desfazer Liberar ou Pagar **não** é oferecido nesta versão.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Na página Comissões, a ação **Editar** MUST abrir a **Conta a receber** vinculada à comissão.
- **FR-002**: Se a comissão não tiver Conta a receber associada, **Editar** MUST informar isso ao usuário e MUST NOT abrir edição isolada da comissão.
- **FR-003**: A página Comissões MUST NOT oferecer ação **Deletar** (nem equivalente) para admin ou visualizador.
- **FR-004**: A página MUST oferecer ação **Liberar** ao administrador em cada linha ainda não liberada, com confirmação antes de efetivar, **sem** pré-requisito de status da Conta a receber (recebida/quitada) nem de existência de vínculo.
- **FR-005**: Após Liberar, a linha MUST ser tratada como liberada; a coluna **Liberado** da linha MUST exibir o valor da comissão; e esse valor MUST entrar na soma **Liberado** do grupo daquela pessoa/fornecedor no recorte visível.
- **FR-006**: A listagem MUST exibir a coluna **Liberado** por linha (valor se liberada; vazio ou “—” se não) e MUST exibir no grupo a **soma automática** das comissões já liberadas daquela pessoa/fornecedor no recorte filtrado.
- **FR-007**: A listagem MUST exibir a coluna **Pago**, indicando por linha se a comissão está paga ou pendente.
- **FR-007a**: A coluna **Pago** MUST refletir apenas o resultado da ação **Pagar** (ou **Pagar em massa**); MUST NOT passar a paga automaticamente ao Liberar.
- **FR-008**: O administrador MUST poder acionar **Pagar** em linha já liberada e ainda não paga, com confirmação antes de efetivar.
- **FR-009**: **Pagar** MUST NOT estar disponível em linha ainda não liberada; após Pagar, MUST NOT se aplicar de novo à mesma linha.
- **FR-010**: A listagem MUST oferecer **caixa de seleção** por linha (e seleção de grupo, quando a listagem for agrupada) para o administrador executar ações em massa, restritas às linhas **visíveis na página atual**.
- **FR-011**: As ações em massa MUST incluir **Liberar em massa** e **Pagar em massa**, cada uma aplicando somente às linhas elegíveis **selecionadas na página atual**, com feedback de processadas e ignoradas; MUST NOT incluir linhas de outras páginas.
- **FR-012**: Ações em massa MUST exigir confirmação antes de efetivar e MUST NOT disparar sem linhas selecionadas.
- **FR-012a**: Ao mudar de página da listagem ou ao alterar filtros, o sistema MUST **limpar** a seleção atual.
- **FR-013**: Usuários `admin` executam Editar (navegação à conta), Liberar, Pagar e lote; usuários `visualizador` permanecem somente leitura (veem colunas, sem seleção operável nem ações de alteração).
- **FR-014**: Filtros já existentes da página (pessoa/fornecedor, ano, mês ou trimestre) MUST continuar valendo para listagem, totais, Liberado, Pago e o conjunto elegível ao lote.
- **FR-015**: Rótulos visíveis MUST usar **Comissão/Comissões** (a página já não se chama Bônus na interface).

### Key Entities

- **Comissão**: Linha de remuneração na listagem, associada a uma pessoa/fornecedor, com valor e estados **liberada** e **paga**; preferencialmente vinculada a uma Conta a receber.
- **Conta a receber**: Lançamento de origem referenciado pela ação Editar.
- **Liberação**: Ato do administrador que autoriza a comissão; alimenta o valor mostrado em **Liberado**.
- **Pagamento**: Ato do administrador que quita uma comissão já liberada; reflete-se em **Pago**.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em revisão da página Comissões, 0 ocorrências da ação **Deletar**; 100% das linhas com conta vinculada, ao acionar **Editar**, abrem essa Conta a receber.
- **SC-002**: Após liberar as comissões de uma pessoa no recorte, a coluna **Liberado** de cada linha liberada mostra o valor correto e a soma **Liberado** do grupo dessa pessoa coincide com a soma dessas linhas em menos de 5 segundos, sem cálculo manual.
- **SC-003**: Um administrador marca e executa **Liberar em massa** ou **Pagar em massa** em pelo menos 5 comissões elegíveis **visíveis na mesma página** de uma vez, na primeira tentativa.
- **SC-004**: Visualizador consulta Liberado e Pago sem conseguir liberar, pagar, deletar ou selecionar para lote, em 100% das tentativas.
- **SC-005**: Em 100% das linhas não liberadas, **Pagar** permanece indisponível até após **Liberar**.

## Assumptions

- A página alvo é a de **Comissões** (nomenclatura já adotada no produto); o pedido citou “BÔNUS” como nome legado da tela.
- Cadastro de novas comissões no fluxo da Conta a receber (campos Fornecedor, Atividade, percentual automático etc.) **não** faz parte do escopo desta spec; fica em feature correlata já especificada (`045-comissoes-conta-receber`).
- **Pago** exige **Liberar** antes (fluxo em duas etapas: autorizar → quitar), alinhado a Contas a Pagar — confirmado na sessão de esclarecimento: só a ação **Pagar** (individual ou em massa) marca a linha como paga.
- **Liberar** não exige Conta a receber recebida/quitada nem vínculo obrigatório.
- Ações em massa confirmadas: **Liberar em massa** e **Pagar em massa**.
- Seleção e lote limitados à **página atual** da listagem (não ao filtro completo nem a outras páginas); ao mudar de página **ou** de filtros, a seleção é **limpa**.
- Agrupamento por pessoa/fornecedor e filtros de período já existentes permanecem; esta feature altera ações e colunas da listagem.
- Desfazer Liberar/Pagar e reintroduzir Deletar estão fora de escopo.
- Importação/exportação CSV existentes não são alteradas por esta feature, salvo refletir colunas Liberado/Pago na exportação quando já exibidas na tela.
