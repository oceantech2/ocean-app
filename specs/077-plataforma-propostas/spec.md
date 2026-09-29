# Feature Specification: Plataforma de Propostas (Proposal)

**Feature Branch**: `077-plataforma-propostas`

**Created**: 2026-09-29

**Status**: Draft

**Input**: User description: "Uma interface onde os usuários são os mesmos do ERP, porém sem nenhum acesso ao ERP. Aproveitar o mesmo servidor e o mesmo repositório, em outro domínio (proposal.oceantalentsolutions.com). No ERP a gente libera acesso para essa outra plataforma. A plataforma é simples: o usuário coloca o nome do cliente, o CNPJ, o valor cobrado e um toggle de imposto para inserir o imposto ou deixar sem. Isso gera uma página em um link aleatório, que ele manda para o cliente. O cliente pode clicar em assinar e a proposta volta para a Ocean como assinada."

**Baseline**: Hoje o Ocean App é um único sistema (ERP) acessado em `app.oceantalentsolutions.com`, com usuários cadastrados em Configurações > Usuários, papéis `admin` e `visualizador` e permissões por página que controlam o que aparece no menu. Não existe emissão de propostas comerciais nem páginas públicas acessíveis sem login. Esta feature cria uma **segunda ferramenta**, o **Proposal**, em domínio próprio (`proposal.oceantalentsolutions.com`), que reaproveita o cadastro de usuários do ERP, mas é **totalmente isolada** dos dados do ERP.

## Clarifications

### Session 2026-09-29

- Q: Quais campos a proposta deve ter além de cliente, CNPJ, valor e imposto? → A: Na v1, só cliente, CNPJ, valor e imposto. O usuário vai enviar depois o HTML completo da proposta e a lista definitiva de campos, e aí o formulário e o modelo de dados serão ajustados.
- Q: Como o imposto é calculado quando o toggle está ligado? → A: O usuário informa uma alíquota em %, e o imposto é somado ao valor (total = valor + valor × alíquota).
- Q: Quais dados o cliente informa para assinar? → A: Nome completo e e-mail válido, mais a marcação da declaração de aceite. Sem CPF, sem cargo e sem confirmação por código.
- Q: Quem vê quais propostas? → A: Cada usuário vê só as propostas que criou; usuários com papel `admin` no ERP e acesso ao Proposal veem todas.
- Q: O link da proposta expira? → A: Sim. A validade padrão é de 30 dias a partir da emissão, editável na criação. Depois dela, a proposta passa a **Expirada** e não aceita assinatura.
- Q: Como funciona o login do Proposal e a liberação pelo ERP? → A: O Proposal fica em outro domínio, com tela de login própria (sem nenhum elemento do ERP) e as mesmas credenciais do cadastro de usuários. A liberação é feita no ERP por um campo de permissão separado, "Acesso ao Proposal", independente das permissões de página do ERP.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Liberar acesso ao Proposal sem expor o ERP (Priority: P1)

O administrador do ERP abre o cadastro de usuários e, para cada usuário, define a quais ferramentas ele tem acesso: **ERP**, **Proposal** ou ambas. Um usuário só com acesso ao Proposal entra em `proposal.oceantalentsolutions.com` com o mesmo login e senha e não consegue ver, nem acessar de nenhuma forma, qualquer informação do ERP.

**Why this priority**: É a condição para a ferramenta existir. Sem o isolamento, entregar logins a quem só emite propostas exporia dados financeiros sensíveis (NFs, colaboradores, contas, folha).

**Independent Test**: Criar um usuário só com acesso ao Proposal, entrar com ele no domínio do Proposal (sucesso), tentar entrar no ERP (negado) e tentar obter dados do ERP usando a sessão do Proposal (negado em 100% das tentativas).

**Acceptance Scenarios**:

1. **Given** um administrador do ERP em Configurações > Usuários, **When** cria ou edita um usuário, **Then** pode marcar de forma independente "Acesso ao ERP" e "Acesso ao Proposal".
2. **Given** um usuário com acesso somente ao Proposal, **When** entra em `proposal.oceantalentsolutions.com` com seu login e senha, **Then** acessa o Proposal normalmente.
3. **Given** um usuário com acesso somente ao Proposal, **When** tenta entrar em `app.oceantalentsolutions.com`, **Then** o login é recusado com a mensagem de que ele não tem acesso ao ERP.
4. **Given** um usuário autenticado no Proposal, **When** tenta, por qualquer meio, consultar ou alterar dados do ERP (NFs, colaboradores, contas, relatórios etc.), **Then** o sistema recusa a operação e nenhum dado do ERP é devolvido.
5. **Given** um usuário com acesso somente ao ERP, **When** tenta entrar no Proposal, **Then** o login é recusado com a mensagem de que ele não tem acesso ao Proposal.
6. **Given** um usuário com acesso às duas ferramentas, **When** entra em cada domínio, **Then** acessa ambas, cada uma com sua própria sessão.
7. **Given** um administrador remove o acesso ao Proposal de um usuário, **When** esse usuário tenta usar o Proposal, **Then** novos logins no Proposal são recusados imediatamente, e a sessão que já estava aberta deixa de funcionar no máximo quando expirar.

---

### User Story 2 - Criar uma proposta e gerar o link para o cliente (Priority: P1)

O usuário do Proposal preenche nome do cliente, CNPJ e valor cobrado. Se a proposta tiver imposto, liga o toggle de imposto e informa a alíquota; se não tiver, deixa o toggle desligado e o imposto não aparece. A data de validade vem preenchida com 30 dias a partir de hoje e pode ser alterada. Ao confirmar, o sistema gera a proposta e um link exclusivo e impossível de adivinhar, que o usuário copia e envia ao cliente pelo canal que preferir.

**Why this priority**: É o valor central da ferramenta: transformar três ou quatro dados em uma proposta apresentável, pronta para enviar.

**Independent Test**: Criar uma proposta com imposto e outra sem, copiar os links, abri-los em uma janela anônima e conferir que cada página mostra exatamente os dados informados.

**Acceptance Scenarios**:

1. **Given** o formulário de nova proposta, **When** o usuário preenche nome do cliente, CNPJ válido e valor, com o toggle de imposto desligado, e confirma, **Then** a proposta é criada, o link é exibido e há uma ação de copiar o link com um clique.
2. **Given** o toggle de imposto ligado, **When** o usuário informa a alíquota, **Then** o formulário mostra, antes de confirmar, o valor do imposto e o total (valor + imposto).
3. **Given** o toggle de imposto desligado, **When** a proposta é gerada, **Then** a página do cliente mostra apenas o valor, sem nenhuma linha ou menção a imposto.
4. **Given** um CNPJ com dígitos verificadores inválidos, **When** o usuário tenta confirmar, **Then** o sistema bloqueia e indica o campo com erro.
5. **Given** o valor vazio, zero ou negativo, ou o toggle ligado sem alíquota, **When** o usuário tenta confirmar, **Then** o sistema bloqueia e indica o campo com erro.
6. **Given** uma proposta já gerada, **When** o usuário tenta editar valor, imposto, validade ou dados do cliente, **Then** a edição não é permitida; para mudar algo, ele cancela a proposta e cria uma nova (podendo partir de uma cópia dos dados).
7. **Given** o formulário de nova proposta, **When** é aberto, **Then** a data de validade vem preenchida com a data de hoje + 30 dias e pode ser alterada.
8. **Given** uma data de validade igual ou anterior à data de hoje, **When** o usuário tenta confirmar, **Then** o sistema bloqueia e indica o campo com erro.

---

### User Story 3 - Cliente abre o link e assina (Priority: P1)

O cliente recebe o link, abre no celular ou no computador, sem precisar de login, e vê uma página com a identidade da Ocean, os dados da proposta (cliente, CNPJ, valor, imposto quando houver, total, data de emissão e data de validade) e um botão **Assinar**. Para assinar, informa nome completo e e-mail e marca que concorda com os termos da proposta. Depois de assinar, vê uma confirmação, e quem voltar ao link vê a proposta como assinada.

**Why this priority**: Fecha o ciclo da proposta. Sem a assinatura, a ferramenta seria só um gerador de página.

**Independent Test**: Abrir o link de uma proposta pendente em janela anônima, assinar com nome e e-mail, recarregar a página e confirmar que ela aparece como assinada, com data e nome de quem assinou.

**Acceptance Scenarios**:

1. **Given** um link de proposta pendente, **When** o cliente o abre, **Then** vê os dados da proposta e o botão **Assinar**, sem precisar de login.
2. **Given** o cliente acionou **Assinar**, **When** informa nome completo e e-mail válido, marca o aceite e confirma, **Then** a proposta passa a assinada e ele vê uma mensagem de confirmação.
3. **Given** uma proposta já assinada, **When** alguém abre o link, **Then** vê a proposta como assinada, com a data e o nome de quem assinou, e o botão **Assinar** não aparece.
4. **Given** uma proposta cancelada, **When** alguém abre o link, **Then** vê a mensagem de que a proposta não está mais disponível, sem os valores.
5. **Given** uma proposta não assinada cuja data de validade já passou, **When** alguém abre o link, **Then** vê a mensagem de que a proposta expirou e deve procurar a Ocean, sem os valores e sem o botão **Assinar**.
6. **Given** um link inexistente ou alterado, **When** alguém o abre, **Then** vê uma mensagem genérica de proposta não encontrada, sem revelar se outras propostas existem.
7. **Given** a página da proposta, **When** aberta em um celular, **Then** todo o conteúdo e o botão **Assinar** são legíveis e utilizáveis sem zoom.

---

### User Story 4 - Acompanhar o status das propostas (Priority: P2)

O usuário do Proposal vê a lista das suas propostas com cliente, valor total, data de emissão, data de validade e status (**Aguardando assinatura**, **Visualizada**, **Assinada**, **Cancelada**, **Expirada**). Pode abrir o detalhe de cada uma para ver quando foi visualizada e os dados da assinatura, copiar o link de novo ou cancelar uma proposta ainda pendente (**Aguardando assinatura** ou **Visualizada**).

**Why this priority**: Dá visibilidade do retorno do cliente ("volta para a Ocean como assinada"), mas a proposta já funciona de ponta a ponta sem esta tela.

**Independent Test**: Criar três propostas, abrir o link de uma, assinar outra e cancelar a terceira; conferir na lista que cada uma mostra o status correto.

**Acceptance Scenarios**:

1. **Given** propostas criadas pelo usuário, **When** ele abre a lista, **Then** vê cada proposta com cliente, CNPJ, valor total, data de emissão, data de validade e status, da mais recente para a mais antiga.
2. **Given** uma proposta **Aguardando assinatura**, **When** o cliente abre o link pela primeira vez, **Then** o status passa a **Visualizada**, com a data e a hora da primeira visualização.
3. **Given** o cliente assinou, **When** o usuário atualiza a lista, **Then** a proposta aparece como **Assinada**, e o detalhe mostra nome e e-mail de quem assinou e a data e a hora da assinatura.
4. **Given** uma proposta **Aguardando assinatura** ou **Visualizada**, **When** o usuário a cancela e confirma, **Then** o status passa a **Cancelada** e o link deixa de exibir os valores.
5. **Given** uma proposta **Assinada** ou **Expirada**, **When** o usuário tenta cancelá-la, **Then** a ação não está disponível.
6. **Given** um usuário sem papel `admin`, **When** abre a lista, **Then** vê apenas as propostas que ele mesmo criou; um usuário `admin` com acesso ao Proposal vê as propostas de todos, com o nome de quem criou.
7. **Given** uma proposta **Aguardando assinatura** ou **Visualizada** cuja data de validade passou, **When** o usuário abre a lista, **Then** ela aparece como **Expirada**.

---

### Edge Cases

- **Duas assinaturas simultâneas**: se o link for aberto em dois lugares e os dois tentarem assinar, apenas a primeira assinatura vale; a segunda vê a proposta como já assinada.
- **Cancelamento enquanto o cliente está com a página aberta**: ao tentar assinar uma proposta que acabou de ser cancelada, o cliente vê que ela não está mais disponível e a assinatura não é registrada.
- **Usuário desativado no ERP**: perde o acesso às duas ferramentas; as propostas que já criou continuam válidas e os links continuam funcionando.
- **Acesso ao Proposal removido**: as propostas já emitidas pelo usuário continuam válidas; `admin` com acesso ao Proposal continua vendo-as.
- **Tentativas de adivinhar links**: os links não podem ser sequenciais nem derivados de dados da proposta; tentativas repetidas de links inexistentes recebem sempre a mesma resposta genérica.
- **Valores com centavos e alíquotas fracionadas** (ex.: 14,53%): o imposto e o total são arredondados em centavos, e a página do cliente mostra exatamente os mesmos números vistos pelo usuário ao gerar.
- **Último dia de validade**: a proposta pode ser assinada até as 23h59 (horário de Brasília) da data de validade; a partir daí, está expirada.
- **Página aberta antes de expirar e assinada depois**: se o cliente abriu a página ainda válida, mas confirmou a assinatura depois do fim da validade, a assinatura é recusada e ele vê a mensagem de proposta expirada.
- **Mesmo CNPJ em várias propostas**: é permitido; cada proposta é independente.
- **Primeiro acesso após um período sem uso do servidor**: a página do cliente mostra um indicador de carregamento até os dados chegarem, em vez de uma tela em branco ou de erro.

## Requirements *(mandatory)*

### Functional Requirements

**Acesso e isolamento**

- **FR-001**: O cadastro de usuários do ERP MUST permitir definir, de forma independente por usuário, "Acesso ao ERP" e "Acesso ao Proposal". O "Acesso ao Proposal" MUST ser um campo de permissão próprio, separado das permissões de página do ERP: marcar ou desmarcar páginas do ERP não altera o acesso ao Proposal, e vice-versa.
- **FR-002**: Usuários já existentes MUST manter o acesso ao ERP e começar sem acesso ao Proposal; novos usuários MUST ser criados com os acessos que o administrador escolher.
- **FR-003**: Somente usuários com papel `admin` no ERP MUST poder conceder ou revogar os acessos ao ERP e ao Proposal.
- **FR-004**: O Proposal MUST ficar disponível em domínio próprio (`proposal.oceantalentsolutions.com`), separado do ERP (`app.oceantalentsolutions.com`), com tela de login própria, com a identidade do Proposal e sem links ou referências ao ERP, usando o mesmo login e senha do cadastro de usuários.
- **FR-005**: O sistema MUST recusar o login em cada ferramenta para quem não tem o acesso correspondente, com mensagem clara indicando a falta de acesso.
- **FR-006**: Uma sessão obtida no Proposal MUST NÃO permitir consultar nem alterar nenhum dado do ERP, mesmo que a solicitação seja feita diretamente ao servidor, fora da interface.
- **FR-007**: A interface do Proposal MUST NÃO exibir menus, páginas, links ou informações do ERP.
- **FR-008**: As regras de segurança de login já existentes (incluindo a verificação em duas etapas, quando ativada para o usuário) MUST valer também no login do Proposal.

**Criação da proposta**

- **FR-009**: O usuário do Proposal MUST poder criar uma proposta informando nome do cliente, CNPJ e valor cobrado, todos obrigatórios.
- **FR-010**: O formulário MUST ter um toggle de imposto; quando ligado, a alíquota (%) passa a ser obrigatória e o sistema calcula o imposto como valor × alíquota, somado ao valor para formar o total (total = valor + imposto). Com o toggle desligado, o total é igual ao valor.
- **FR-011**: O sistema MUST validar o CNPJ pelos dígitos verificadores e aceitar a digitação com ou sem máscara.
- **FR-012**: O sistema MUST exigir valor maior que zero e alíquota maior que zero e menor que 100% quando o imposto estiver ligado.
- **FR-013**: Ao confirmar, o sistema MUST gerar um link exclusivo por proposta, não sequencial e impossível de adivinhar na prática, apontando para a página pública da proposta no domínio do Proposal.
- **FR-014**: O usuário MUST poder copiar o link com uma ação de um clique, na confirmação e, depois, no detalhe da proposta.
- **FR-015**: Depois de gerada, a proposta MUST NÃO poder ter cliente, CNPJ, valor, imposto ou validade alterados; o usuário MUST poder criar uma nova proposta a partir de uma cópia dos dados.
- **FR-029**: Toda proposta MUST ter uma data de validade, preenchida por padrão com a data de emissão + 30 dias e editável na criação; a data informada MUST ser posterior à data de emissão.

**Página pública e assinatura**

- **FR-016**: A página pública MUST ser acessível sem login e exibir: identidade visual da Ocean, nome do cliente, CNPJ formatado, valor, imposto e alíquota (somente quando houver), total, data de emissão, data de validade e status.
- **FR-017**: A página pública MUST NÃO exibir nenhuma informação além da própria proposta: nem dados de outras propostas, nem login ou dados do usuário que a criou, nem dados do ERP.
- **FR-018**: Para assinar, o cliente MUST informar nome completo e e-mail válido e marcar a declaração de aceite dos termos da proposta.
- **FR-019**: Ao assinar, o sistema MUST registrar, como evidência do aceite: nome, e-mail, data e hora, endereço de rede de origem, identificação do navegador e uma impressão digital do conteúdo exato da proposta aceita.
- **FR-020**: Uma proposta MUST poder ser assinada uma única vez; tentativas posteriores MUST ser recusadas e a página MUST mostrar a proposta como assinada.
- **FR-021**: Propostas canceladas MUST exibir apenas a mensagem de indisponibilidade, sem valores, e MUST NÃO aceitar assinatura.
- **FR-030**: Propostas não assinadas MUST passar a **Expirada** após as 23h59 (horário de Brasília) da data de validade; propostas expiradas MUST exibir apenas a mensagem de expiração, sem valores, e MUST NÃO aceitar assinatura, inclusive quando a página tiver sido aberta antes do fim da validade.
- **FR-022**: Links inexistentes MUST receber uma resposta genérica de "proposta não encontrada", idêntica para qualquer link inválido.
- **FR-023**: A página pública MUST ser utilizável em telas de celular, sem zoom.

**Acompanhamento**

- **FR-024**: O sistema MUST registrar a primeira visualização do link pelo cliente e atualizar o status para **Visualizada**; visualizações pelo usuário criador dentro do Proposal MUST NÃO contar.
- **FR-025**: A lista de propostas MUST exibir cliente, CNPJ, valor total, data de emissão, data de validade e status, da mais recente para a mais antiga, com filtro por status.
- **FR-026**: Usuários sem papel `admin` MUST ver apenas as propostas que criaram; usuários `admin` com acesso ao Proposal MUST ver todas, com o nome de quem criou.
- **FR-027**: O usuário MUST poder cancelar uma proposta **Aguardando assinatura** ou **Visualizada**, com confirmação antes de concluir; propostas **Assinadas** ou **Expiradas** MUST NÃO poder ser canceladas.
- **FR-028**: O detalhe da proposta MUST mostrar a data e a hora da primeira visualização e, quando assinada, os dados da assinatura registrados no FR-019.

### Key Entities

- **Usuário** (existente): o mesmo cadastro do ERP. Ganha dois atributos de acesso independentes: acesso ao ERP e acesso ao Proposal. Papel (`admin`/`visualizador`), status ativo e verificação em duas etapas continuam como hoje.
- **Proposta**: oferta comercial emitida por um usuário. Atributos: nome do cliente, CNPJ, valor, indicador de imposto, alíquota, valor do imposto, total, data de emissão, data de validade, usuário criador, código público do link, status (Aguardando assinatura, Visualizada, Assinada, Cancelada, Expirada), data da primeira visualização e data de cancelamento. Imutável após gerada, exceto status e datas de acompanhamento.
- **Assinatura**: registro único do aceite de uma proposta. Atributos: nome completo, e-mail, data e hora, endereço de rede de origem, identificação do navegador e impressão digital do conteúdo aceito. Pertence a exatamente uma proposta; cada proposta tem no máximo uma assinatura.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das tentativas, um usuário com acesso somente ao Proposal não obtém nenhum dado do ERP, nem pela interface nem por solicitações diretas ao servidor.
- **SC-002**: Um usuário do Proposal cria uma proposta e copia o link em menos de 2 minutos, a partir da tela inicial.
- **SC-003**: Um cliente abre o link e conclui a assinatura em menos de 1 minuto, inclusive no celular.
- **SC-004**: Em 100% das propostas, os valores exibidos ao cliente (valor, imposto e total) são idênticos aos exibidos ao usuário no momento da geração.
- **SC-005**: Depois que o cliente assina, o status **Assinada** aparece para o usuário na próxima atualização da lista.
- **SC-006**: Nenhum link de proposta pode ser obtido alterando ou incrementando outro link conhecido.
- **SC-007**: Para cada proposta assinada, é possível apresentar quem assinou, quando e qual conteúdo exato foi aceito.
- **SC-008**: Em 100% das tentativas, uma proposta com a validade vencida não é assinada.

## Assumptions

- **Domínio**: o Proposal usa `proposal.oceantalentsolutions.com`, e a página pública do cliente fica no mesmo domínio. As duas ferramentas ficam no mesmo repositório, no mesmo deploy e no mesmo servidor do ERP (decisão de infraestrutura já tomada).
- **Assinatura**: v1 usa aceite eletrônico simples (clique com nome, e-mail e declaração de aceite, mais registro das evidências). Integração com provedores de assinatura digital certificada fica fora do escopo.
- **Conteúdo da proposta**: v1 tem apenas os campos descritos (cliente, CNPJ, valor, imposto). O layout da página pública e os campos definitivos virão de um HTML de referência que o usuário vai enviar depois; quando chegar, o formulário, a página pública e a entidade Proposta serão ajustados. Até lá, descrição de serviço, múltiplos itens, condições de pagamento e anexos ficam fora do escopo.
- **Envio**: o usuário copia o link e envia pelo canal que preferir (WhatsApp, e-mail etc.). O envio automático por e-mail ao cliente fica fora do escopo.
- **Notificação**: o retorno "assinada" aparece no status da lista e no detalhe. Notificação ativa (e-mail/push) ao usuário fica fora do escopo.
- **Recusa**: o cliente não tem ação explícita de "recusar" na v1; propostas não aceitas permanecem pendentes até serem canceladas ou expirarem.
- **Integração com o ERP**: propostas assinadas não geram automaticamente contas a receber, NFs ou contratos no ERP na v1.
- **Consulta de CNPJ**: não há preenchimento automático de razão social a partir do CNPJ na v1; o nome do cliente é digitado.
- **Papéis no Proposal**: não há papéis próprios; o papel `admin` do ERP define apenas a visão de todas as propostas (FR-026) e a gestão de acessos (FR-003).
- **Identidade visual**: a página pública usa o logotipo e as cores já adotados pelo Ocean App.
