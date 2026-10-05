# Feature Specification: Editar Proposta Antes da Assinatura

**Feature Branch**: `079-proposta-editar-antes-assinatura`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: "preciso mudar uma coisa no menu de proposal, preciso que seja possível editar uma proposta antes do cliente assinar"

**Baseline**: Hoje, no Proposal (spec `077-plataforma-propostas`), a proposta é **imutável depois de gerada** (FR-015 da spec 077): cliente, CNPJ, valor, imposto, alíquota e validade não podem ser alterados. Para corrigir qualquer dado, o usuário precisa cancelar a proposta e criar outra a partir de uma cópia, o que gera um **link novo** que precisa ser reenviado ao cliente, e o link antigo passa a mostrar "proposta não disponível". Esta feature substitui essa regra: enquanto o cliente não assinar, a proposta pode ser editada, e o **mesmo link** passa a mostrar os dados atualizados.

## Clarifications

### Session 2026-10-02

- Q: O que acontece com o status de uma proposta **Visualizada** quando ela é editada? → A: Volta para **Aguardando assinatura**; quando o cliente abrir o link de novo, passa a **Visualizada** com a nova data. O detalhe mantém a data da primeira visualização do link, anterior à edição.
- Q: Propostas **Expiradas** podem ser editadas? → A: Sim, com todos os campos editáveis; ao salvar com validade posterior a hoje, a proposta volta a aceitar assinatura no mesmo link.
- Q: Que registro das edições o sistema deve manter? → A: Histórico de todas as edições, exibido no detalhe da proposta: quando, quem e quais campos mudaram (valor anterior → novo valor).
- Q: A página pública do cliente deve indicar que a proposta foi atualizada? → A: Sim, com "Atualizada em dd/mm/aaaa" junto da data de emissão, sem detalhar o que mudou.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Corrigir uma proposta pendente sem trocar o link (Priority: P1)

O usuário do Proposal percebe um erro ou precisa renegociar uma proposta que ainda não foi assinada (por exemplo, o cliente pediu desconto ou o CNPJ foi digitado errado). Ele abre o detalhe da proposta, aciona **Editar**, altera os dados no mesmo formulário usado na criação, já preenchido com os valores atuais, e salva. O link que o cliente já recebeu continua o mesmo e passa a mostrar os dados novos.

**Why this priority**: É o pedido central. Evita o retrabalho de cancelar, recriar e reenviar o link, e evita que o cliente abra um link antigo e encontre "proposta não disponível".

**Independent Test**: Criar uma proposta, abrir o link em janela anônima, editar o valor e o CNPJ no Proposal, recarregar a página do cliente e conferir que o mesmo link mostra os dados novos e continua permitindo assinar.

**Acceptance Scenarios**:

1. **Given** uma proposta **Aguardando assinatura** ou **Visualizada**, **When** o usuário abre o detalhe, **Then** vê a ação **Editar**.
2. **Given** o usuário acionou **Editar**, **When** o formulário abre, **Then** todos os campos (nome do cliente, CNPJ, valor, toggle de imposto, alíquota e validade) vêm preenchidos com os valores atuais da proposta.
3. **Given** o formulário de edição, **When** o usuário altera o valor, liga ou desliga o imposto ou muda a alíquota, **Then** o imposto e o total são recalculados e exibidos antes de salvar, com a mesma regra da criação.
4. **Given** o usuário salvou a edição com dados válidos, **When** o cliente abre (ou recarrega) o link que já tinha, **Then** vê os dados atualizados, a indicação "Atualizada em dd/mm/aaaa" junto da data de emissão, e pode assinar normalmente.
5. **Given** o formulário de edição com dados inválidos (CNPJ inválido, valor vazio/zero/negativo, imposto ligado sem alíquota ou com alíquota fora do intervalo, validade igual ou anterior a hoje), **When** o usuário tenta salvar, **Then** o sistema bloqueia e indica o campo com erro, com as mesmas regras e mensagens da criação.
6. **Given** o usuário abriu a edição, **When** desiste e sai sem salvar, **Then** a proposta permanece exatamente como estava.
7. **Given** uma proposta **Visualizada**, **When** o usuário salva uma edição, **Then** a proposta volta para **Aguardando assinatura**, e o detalhe continua mostrando a data da primeira visualização do link.
8. **Given** uma proposta editada e de volta a **Aguardando assinatura**, **When** o cliente abre o link de novo, **Then** a proposta passa a **Visualizada**, e o detalhe mostra a data e a hora em que a versão atual foi visualizada.
9. **Given** uma proposta editada uma ou mais vezes, **When** o usuário abre o detalhe, **Then** vê o histórico de edições, da mais recente para a mais antiga, cada uma com data e hora, quem editou e os campos alterados (valor anterior → novo valor).

---

### User Story 2 - Impedir edição depois da assinatura e garantir o que foi assinado (Priority: P1)

Uma proposta assinada é um aceite formal do cliente e não pode mudar. O sistema bloqueia a edição de propostas assinadas ou canceladas e garante que a assinatura sempre corresponda exatamente à versão que o cliente viu na tela.

**Why this priority**: Sem essa trava, a edição colocaria em risco a validade do aceite: o cliente poderia assinar um valor e a proposta registrar outro.

**Independent Test**: Assinar uma proposta e confirmar que a ação **Editar** não aparece e que uma tentativa direta de edição é recusada; em seguida, abrir a página do cliente de outra proposta, editá-la no Proposal e tentar assinar a versão antiga que estava aberta, confirmando que a assinatura é recusada e o cliente é levado a ver a versão nova.

**Acceptance Scenarios**:

1. **Given** uma proposta **Assinada**, **When** o usuário abre o detalhe, **Then** a ação **Editar** não aparece, e qualquer tentativa de edição, inclusive feita diretamente ao servidor, é recusada.
2. **Given** uma proposta **Cancelada**, **When** o usuário abre o detalhe, **Then** a ação **Editar** não aparece, e qualquer tentativa de edição é recusada.
3. **Given** o cliente está com a página da proposta aberta, **When** o usuário edita e salva a proposta, e depois o cliente tenta assinar a versão que tinha na tela, **Then** a assinatura é recusada, o cliente vê o aviso de que a proposta foi atualizada e a página passa a mostrar os dados novos para que ele revise e assine de novo.
4. **Given** o usuário está editando, **When** o cliente assina antes de o usuário salvar, **Then** a edição é recusada com a mensagem de que a proposta já foi assinada, e os dados assinados permanecem intactos.
5. **Given** uma proposta assinada depois de uma ou mais edições, **When** o usuário abre o detalhe, **Then** a evidência da assinatura corresponde exatamente aos dados da versão que o cliente assinou.

---

### User Story 3 - Reativar uma proposta expirada ajustando a validade (Priority: P2)

O cliente não assinou a tempo e a proposta ficou **Expirada**. Em vez de criar uma nova, o usuário edita a proposta, define uma nova data de validade (e, se quiser, ajusta outros dados) e salva. A proposta volta a ficar disponível para assinatura no mesmo link.

**Why this priority**: É um caso frequente de "antes do cliente assinar" e aproveita a mesma ação de edição, mas a correção de propostas ainda válidas (US1) já entrega o valor principal.

**Independent Test**: Criar uma proposta com validade curta, aguardar (ou simular) a expiração, editar a validade para uma data futura e conferir que o link volta a mostrar os valores e o botão **Assinar**.

**Acceptance Scenarios**:

1. **Given** uma proposta **Expirada** (nunca assinada nem cancelada), **When** o usuário abre o detalhe, **Then** vê a ação **Editar**.
2. **Given** o usuário edita uma proposta expirada e informa uma validade posterior a hoje, **When** salva, **Then** a proposta deixa de ser **Expirada**, passa a **Aguardando assinatura** (como qualquer proposta editada) e o link volta a exibir os dados e o botão **Assinar**.
3. **Given** o usuário edita uma proposta expirada sem informar uma validade posterior a hoje, **When** tenta salvar, **Then** o sistema bloqueia e indica o campo de validade com erro.

---

### Edge Cases

- **Edição sem nenhuma alteração**: salvar sem mudar nenhum campo não altera a proposta nem registra uma nova edição.
- **Duas edições simultâneas** (o mesmo usuário em duas abas, ou o criador e um `admin`): vale a última edição salva; a página do cliente e o detalhe sempre mostram a versão mais recente.
- **Edição no último dia de validade**: se a validade original vence hoje, o usuário pode editar e definir uma nova validade posterior a hoje; se mantiver a validade de hoje, o salvamento é bloqueado (mesma regra da criação: validade posterior à data de hoje).
- **Data de emissão**: a edição não altera a data de emissão exibida ao cliente; ela continua sendo a data em que a proposta foi gerada.
- **Primeira visualização**: a edição não apaga o registro de quando o cliente abriu o link pela primeira vez; uma proposta **Visualizada** volta para **Aguardando assinatura** e só passa a **Visualizada** de novo quando o cliente abrir a versão atual.
- **Várias edições seguidas**: cada edição volta a proposta para **Aguardando assinatura**; o status **Visualizada** sempre indica que o cliente abriu a versão vigente, e a data da primeira visualização do link nunca muda.
- **Visualizações pelo usuário**: abrir a página do cliente a partir do Proposal (ação "Abrir página do cliente") não conta como visualização, nem antes nem depois da edição.
- **Proposta editada e depois cancelada**: o cancelamento segue as regras atuais; o link passa a mostrar apenas a mensagem de indisponibilidade.
- **Cliente com a página aberta durante a edição**: a página não se atualiza sozinha; a versão nova aparece ao recarregar ou na tentativa de assinar (ver US2, cenário 3).
- **Mesmos dados de outra proposta**: editar uma proposta para ficar com o mesmo CNPJ ou valor de outra é permitido; cada proposta continua independente.

## Requirements *(mandatory)*

### Functional Requirements

**Permissão para editar**

- **FR-001**: O usuário do Proposal MUST poder editar uma proposta cujo status seja **Aguardando assinatura**, **Visualizada** ou **Expirada**.
- **FR-002**: Propostas **Assinadas** ou **Canceladas** MUST NÃO poder ser editadas; a ação **Editar** MUST NÃO aparecer para elas e qualquer tentativa de edição, inclusive feita diretamente ao servidor, MUST ser recusada com mensagem clara.
- **FR-003**: Só MUST poder editar uma proposta quem pode vê-la: o usuário que a criou ou um usuário `admin` com acesso ao Proposal (mesma regra de visibilidade da spec 077).

**Formulário e validação**

- **FR-004**: A edição MUST permitir alterar nome do cliente, CNPJ, valor, toggle de imposto, alíquota e data de validade, usando o mesmo formulário da criação, preenchido com os valores atuais.
- **FR-005**: A edição MUST aplicar exatamente as mesmas validações e mensagens da criação (CNPJ válido, valor maior que zero, alíquota maior que 0 e menor que 100% quando o imposto estiver ligado, validade posterior à data de hoje).
- **FR-006**: O imposto e o total MUST ser recalculados com a mesma regra e o mesmo arredondamento da criação, e exibidos antes de salvar; ao desligar o toggle de imposto, a alíquota MUST ser descartada e o total MUST ser igual ao valor.
- **FR-007**: O usuário MUST poder sair da edição sem salvar, sem nenhuma alteração na proposta.

**Efeitos da edição**

- **FR-008**: A edição MUST manter o mesmo link público da proposta; o link MUST passar a exibir os dados atualizados imediatamente após o salvamento.
- **FR-009**: A edição MUST NÃO alterar a data de emissão, o usuário criador, nem a data da primeira visualização do link.
- **FR-010**: Toda edição salva MUST deixar a proposta como **Aguardando assinatura**, seja ela **Aguardando assinatura**, **Visualizada** ou **Expirada** (neste caso, desde que a nova validade seja posterior a hoje).
- **FR-017**: Após uma edição, a próxima abertura do link pelo cliente MUST mudar o status para **Visualizada** e registrar a data e a hora da visualização da versão atual. O detalhe da proposta MUST exibir a data da primeira visualização do link e, quando houver edição, a data da visualização da versão atual (ou indicar que a versão atual ainda não foi visualizada).
- **FR-011**: O sistema MUST registrar cada edição salva no histórico da proposta, com data e hora, usuário que editou e, para cada campo alterado, o valor anterior e o novo valor (incluindo imposto e total recalculados quando mudarem). O detalhe da proposta MUST exibir esse histórico, da edição mais recente para a mais antiga; propostas nunca editadas não exibem histórico.
- **FR-012**: Salvar uma edição sem nenhuma alteração MUST NÃO modificar a proposta nem gerar registro no histórico.
- **FR-018**: O histórico de edições MUST ser somente leitura: nenhum usuário pode alterar ou apagar registros, e ele MUST continuar disponível depois que a proposta for assinada, cancelada ou expirar. O histórico MUST NÃO aparecer na página pública do cliente (lá aparece apenas a data da última edição, conforme FR-019).
- **FR-019**: Quando a proposta tiver sido editada, a página pública MUST exibir "Atualizada em dd/mm/aaaa" (data da última edição, horário de Brasília) junto da data de emissão, sem indicar quais campos mudaram nem quem editou. Propostas nunca editadas MUST NÃO exibir essa indicação.

**Integridade da assinatura**

- **FR-013**: A assinatura MUST ser registrada somente se o conteúdo que o cliente tinha na tela no momento de assinar for idêntico ao conteúdo atual da proposta; se a proposta tiver sido editada depois que o cliente abriu a página, a assinatura MUST ser recusada, o cliente MUST ver o aviso de que a proposta foi atualizada e a página MUST passar a mostrar a versão atual.
- **FR-014**: Se a proposta for assinada enquanto o usuário edita, o salvamento da edição MUST ser recusado com a mensagem de que a proposta já foi assinada, sem alterar nenhum dado.
- **FR-015**: A evidência da assinatura (impressão digital do conteúdo, conforme FR-019 da spec 077) MUST corresponder à versão da proposta efetivamente assinada, mesmo após edições anteriores.

**Alteração da regra existente**

- **FR-016**: Esta feature substitui a regra de imutabilidade da spec 077 (FR-015 e cenário 6 da User Story 2): a proposta passa a ser editável até a assinatura. A ação **Criar cópia** continua disponível para quem quiser gerar uma proposta nova a partir dos dados de outra.

### Key Entities

- **Proposta** (existente): deixa de ser imutável após gerada. Nome do cliente, CNPJ, valor, indicador de imposto, alíquota, valor do imposto, total e validade passam a ser editáveis enquanto a proposta não estiver assinada ou cancelada. Ganha o atributo **data e hora da visualização da versão atual** e passa a ter um histórico de edições. Código público do link, data de emissão, usuário criador e data da primeira visualização do link continuam inalterados pela edição; o status volta para **Aguardando assinatura** a cada edição.
- **Edição da proposta** (nova): registro imutável de uma edição salva. Atributos: proposta editada, data e hora, usuário que editou e a lista de campos alterados, cada um com valor anterior e novo valor. Uma proposta tem zero ou mais edições.
- **Assinatura** (existente): sem mudança de atributos; a impressão digital do conteúdo passa a garantir que o aceite corresponde à versão vigente no momento da assinatura.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuário do Proposal corrige um dado de uma proposta pendente e salva em menos de 1 minuto a partir do detalhe da proposta, sem precisar reenviar o link ao cliente.
- **SC-002**: Em 100% das edições salvas, o link já enviado ao cliente mostra os dados atualizados ao ser aberto ou recarregado.
- **SC-003**: Em 100% das tentativas, propostas assinadas ou canceladas não são alteradas, nem pela interface nem por solicitações diretas ao servidor.
- **SC-004**: Em 100% das propostas assinadas, os valores registrados na evidência da assinatura são idênticos aos que o cliente via na tela ao assinar, inclusive em propostas editadas.
- **SC-005**: O número de propostas canceladas apenas para recriar com dados corrigidos cai a zero após a entrega, já que a correção passa a ser feita por edição.

## Assumptions

- **Status após edição**: a edição volta a proposta para **Aguardando assinatura** para que **Visualizada** indique sempre que o cliente viu a versão vigente (ver Clarifications). Notificar o cliente sobre a alteração fica fora do escopo (o envio do link continua manual, como na spec 077).
- **Histórico de edições**: todas as edições ficam registradas e visíveis no detalhe da proposta (ver Clarifications). Restaurar uma versão anterior com um clique fica fora do escopo; para voltar a um valor antigo, o usuário edita de novo. A garantia legal do aceite continua vindo da impressão digital do conteúdo assinado.
- **Propostas expiradas**: são editáveis (todos os campos) porque nunca foram assinadas; a reativação acontece apenas quando a nova validade é posterior a hoje (ver Clarifications).
- **Campos editáveis**: são os mesmos campos da criação na v1. Se o formulário de criação ganhar novos campos (por exemplo, a partir do HTML de referência mencionado na spec 077), eles passam a ser editáveis pela mesma regra.
- **Permissões**: não há papel novo; quem pode ver uma proposta pode editá-la, seguindo a regra já existente do Proposal.
- **Local da ação**: a ação **Editar** fica no detalhe da proposta, ao lado das ações existentes (copiar link, abrir página do cliente, criar cópia, cancelar). Atalhos na lista são opcionais e não fazem parte dos critérios de aceite.
