# Feature Specification: Acesso ao Proposal pelo ERP e liberação para fornecedores

**Feature Branch**: `088-proposal-acesso-erp-fornecedores`

**Created**: 2026-10-09

**Status**: Draft

**Input**: User description: "No ERP colocar um link de acesso ao proposal no menu lateral esquerdo (se possível já logado). Ferramenta para facilitar a liberação de acesso ao proposal para os fornecedores (já tendo o email deles basta apenas liberar acesso)."

**Baseline**: O Proposal (`077`) fica em domínio próprio, com login próprio e as mesmas credenciais do cadastro de usuários do ERP. Hoje o acesso é liberado só em Configurações > Usuários: o admin cria o usuário, digita uma senha, marca "Acesso ao Proposal" e repassa login e senha à pessoa. O Proposal não tem "trocar senha" nem "esqueci a senha". Quem já está no ERP precisa digitar o endereço do Proposal e fazer login de novo. Os fornecedores (consultores PJ cadastrados em Fornecedores, muitos com e-mail preenchido) são os principais usuários do Proposal.

## Clarifications

### Session 2026-10-09

- Q: Como o fornecedor recebe o acesso (senha)? → A: O admin libera e o sistema gera um **link de convite** com validade limitada, que o admin copia e envia pelo canal que preferir; o fornecedor abre o link e **cria a própria senha**. Não depende de envio de e-mail.
- Q: Qual é o login do fornecedor no Proposal? → A: O **próprio e-mail** do cadastro do fornecedor.
- Q: Onde fica a ferramenta de liberação? → A: Na página **Fornecedores**: ação por fornecedor + liberação em massa dos selecionados, com indicador de quem já tem acesso.
- Q: O que acontece com o acesso quando o fornecedor é desativado no ERP? → A: O acesso ao Proposal é **removido automaticamente**.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Abrir o Proposal pelo menu do ERP já autenticado (Priority: P1)

Um usuário do ERP que também tem acesso ao Proposal vê, no menu lateral esquerdo, o item **Proposal**. Ao clicar, o Proposal abre em uma nova aba já autenticado com o mesmo usuário, sem pedir login e senha de novo.

**Why this priority**: É o atalho do dia a dia para quem usa as duas ferramentas e elimina o login duplicado.

**Independent Test**: Entrar no ERP com um usuário que tem os dois acessos, clicar em **Proposal** no menu e conferir que a lista de propostas abre em nova aba, autenticada com o mesmo usuário; repetir com um usuário sem acesso ao Proposal e conferir que o item não aparece.

**Acceptance Scenarios**:

1. **Given** um usuário logado no ERP com acesso ao Proposal, **When** olha o menu lateral, **Then** vê o item **Proposal** (também com o menu recolhido, só com o ícone).
2. **Given** um usuário logado no ERP sem acesso ao Proposal, **When** olha o menu lateral, **Then** o item **Proposal** não aparece.
3. **Given** o item **Proposal** visível, **When** o usuário clica nele, **Then** o Proposal abre em nova aba, já autenticado com o mesmo usuário, e o ERP continua aberto na aba original.
4. **Given** o acesso ao Proposal do usuário foi removido depois que ele entrou no ERP, **When** ele clica no item, **Then** o login automático é recusado com a mensagem de que ele não tem acesso ao Proposal.
5. **Given** a aba do Proposal já estava aberta com outro usuário, **When** o usuário clica no item no ERP, **Then** o Proposal passa a usar o usuário vindo do ERP.
6. **Given** o login automático falhou por qualquer motivo (link usado, expirado ou inválido), **When** a aba do Proposal abre, **Then** o usuário vê a tela de login normal do Proposal com uma mensagem explicando que deve entrar manualmente.

---

### User Story 2 - Liberar o acesso de um fornecedor com um clique (Priority: P1)

O admin abre a página Fornecedores, encontra o fornecedor (que já tem e-mail cadastrado) e aciona **Liberar Proposal**. O sistema cria o acesso com o e-mail como login e gera um link de convite. O admin copia o link e envia ao fornecedor. O fornecedor abre o link, cria a própria senha e passa a entrar no Proposal com o e-mail e essa senha.

**Why this priority**: É o pedido central: liberar o acesso sem cadastrar usuário manualmente, sem inventar senha e sem repassar senha por mensagem.

**Independent Test**: Liberar um fornecedor com e-mail, copiar o link, abri-lo em janela anônima, definir a senha, entrar no Proposal com e-mail e senha (sucesso) e tentar entrar no ERP com as mesmas credenciais (recusado).

**Acceptance Scenarios**:

1. **Given** um fornecedor ativo com e-mail válido e sem acesso, **When** o admin aciona **Liberar Proposal**, **Then** o sistema cria o acesso (login = e-mail, somente Proposal, sem acesso ao ERP) e mostra o link de convite com uma ação de copiar.
2. **Given** um fornecedor sem e-mail ou com e-mail inválido, **When** o admin tenta liberar, **Then** a ação fica indisponível ou é recusada com a mensagem de que é preciso cadastrar um e-mail válido.
3. **Given** o link de convite válido, **When** o fornecedor o abre, **Then** vê o próprio login (e-mail) e um formulário para criar a senha (senha + confirmação), com a identidade do Proposal e sem nada do ERP.
4. **Given** o formulário de criar senha, **When** o fornecedor informa uma senha com pelo menos 8 caracteres e a confirmação igual, **Then** a senha é salva, o convite é consumido e ele entra no Proposal já autenticado.
5. **Given** um convite já usado, expirado ou substituído por um novo, **When** alguém abre o link, **Then** vê a mensagem de que o convite não é mais válido e deve pedir um novo ao administrador, sem revelar dados do usuário.
6. **Given** um fornecedor com convite pendente, **When** o admin aciona **Gerar novo convite**, **Then** um novo link é gerado e o anterior deixa de funcionar.
7. **Given** um fornecedor que já definiu a senha, **When** entra no Proposal, **Then** o perfil de consultor já vem preenchido com nome, cargo, telefone e e-mail do cadastro de fornecedor (podendo ser editado).
8. **Given** um usuário que não é admin no ERP, **When** abre Fornecedores, **Then** não vê nenhuma ação de liberar, revogar ou gerar convite.

---

### User Story 3 - Acompanhar e revogar acessos de fornecedores (Priority: P2)

Na lista de Fornecedores, o admin vê de relance quem tem acesso ao Proposal (**Sem acesso**, **Convite pendente**, **Convite expirado**, **Ativo**) e pode revogar o acesso de um fornecedor. Quando um fornecedor é desativado no ERP, o acesso dele ao Proposal é removido automaticamente.

**Why this priority**: Dá controle e segurança, mas a liberação (US2) já entrega valor sem esta visão.

**Independent Test**: Liberar dois fornecedores, deixar um com convite pendente e concluir o outro; conferir os indicadores; revogar o ativo e desativar o pendente; conferir que nenhum dos dois consegue mais entrar e que o convite pendente parou de funcionar.

**Acceptance Scenarios**:

1. **Given** a lista de Fornecedores, **When** o admin a abre, **Then** cada fornecedor mostra o status de acesso ao Proposal: **Sem acesso**, **Convite pendente**, **Convite expirado** ou **Ativo**.
2. **Given** um fornecedor com acesso **Ativo** ou convite pendente, **When** o admin aciona **Revogar Proposal** e confirma, **Then** o acesso é removido, convites pendentes deixam de funcionar e o status volta a **Sem acesso**.
3. **Given** um fornecedor com acesso ao Proposal, **When** ele é desativado no ERP, **Then** o acesso ao Proposal é removido automaticamente e convites pendentes deixam de funcionar.
4. **Given** um fornecedor desativado que é reativado, **When** volta à lista, **Then** aparece como **Sem acesso**; o admin precisa liberar de novo.
5. **Given** um fornecedor com acesso revogado que já tinha definido senha, **When** o admin libera de novo, **Then** o acesso volta com a mesma senha, sem precisar de novo convite (o admin pode gerar novo convite se o fornecedor não lembrar a senha).
6. **Given** um fornecedor com acesso revogado, **When** tenta usar a sessão que já estava aberta no Proposal, **Then** as próximas ações são recusadas.

---

### User Story 4 - Liberar vários fornecedores de uma vez (Priority: P3)

O admin marca vários fornecedores na lista e aciona **Liberar Proposal** em massa. O sistema libera todos os elegíveis e mostra uma lista com o link de convite de cada um, para copiar individualmente, e informa quais foram ignorados e por quê.

**Why this priority**: Agiliza o primeiro uso (liberar a equipe toda), mas a liberação individual cobre o fluxo contínuo.

**Independent Test**: Selecionar 5 fornecedores (3 com e-mail válido sem acesso, 1 sem e-mail, 1 já ativo), liberar em massa e conferir 3 convites gerados e 2 ignorados com o motivo.

**Acceptance Scenarios**:

1. **Given** vários fornecedores selecionados, **When** o admin aciona **Liberar Proposal** em massa e confirma, **Then** cada fornecedor elegível recebe acesso e um link de convite, exibidos em uma lista com ação de copiar por fornecedor.
2. **Given** a seleção inclui fornecedores sem e-mail válido, inativos ou já com acesso **Ativo**, **When** a liberação em massa termina, **Then** esses fornecedores são ignorados e aparecem no resumo com o motivo.

---

### Edge Cases

- **E-mail já usado como login de outro usuário** (ex.: um usuário interno do ERP cadastrado com esse e-mail): o sistema vincula o fornecedor a esse usuário existente e só liga o acesso ao Proposal, sem alterar senha, papel nem acesso ao ERP; nenhum convite é gerado e o admin vê a mensagem de que o usuário já existia e usa a senha atual.
- **Dois fornecedores com o mesmo e-mail**: o segundo não pode ser liberado; o admin vê a mensagem de que o e-mail já está vinculado a outro fornecedor.
- **E-mail do fornecedor alterado depois da liberação**: o login continua sendo o e-mail da liberação; para usar o novo e-mail, o admin revoga e libera de novo (o novo login exige novo convite).
- **E-mail com letras maiúsculas ou espaços**: o login é gravado em minúsculas e sem espaços; no login do Proposal, o e-mail digitado com maiúsculas também funciona.
- **Fornecedor tenta entrar antes de criar a senha**: o login é recusado como credenciais inválidas.
- **Convite aberto em dois lugares**: só a primeira definição de senha vale; a segunda vê convite inválido.
- **Login automático aberto com atraso** (aba lenta, servidor "acordando"): o link de entrada automática vale por tempo curto; se expirar, cai na tela de login com mensagem.
- **Link de entrada automática copiado/reutilizado**: funciona uma única vez; não pode ser usado por outra pessoa depois.
- **Usuário com verificação em duas etapas**: a entrada automática pelo ERP não pede o código de novo, pois a sessão do ERP já passou por ela; o login manual no Proposal continua pedindo o código.
- **Admin revoga o próprio acesso ao Proposal** pelo cadastro de usuários: o item some do menu na próxima vez que a sessão do ERP for verificada.

## Requirements *(mandatory)*

### Functional Requirements

**Link do Proposal no ERP (US1)**

- **FR-001**: O menu lateral do ERP DEVE exibir o item **Proposal** apenas para usuários com acesso ao Proposal, inclusive com o menu recolhido (só ícone, com dica do nome).
- **FR-002**: Ao clicar no item, o sistema DEVE abrir o Proposal em nova aba já autenticado com o mesmo usuário do ERP, sem pedir login e senha.
- **FR-003**: A entrada automática DEVE usar uma credencial temporária de **uso único** e com validade de **no máximo 2 minutos**; ela não DEVE ser a sessão do ERP nem permitir acesso ao ERP.
- **FR-004**: A entrada automática DEVE reconferir, no momento do uso, se o usuário continua ativo e com acesso ao Proposal; caso contrário, DEVE recusar com a mensagem de falta de acesso.
- **FR-005**: Quando a entrada automática falhar, o Proposal DEVE mostrar a tela de login normal com uma mensagem orientando a entrar manualmente.
- **FR-006**: A credencial temporária NÃO DEVE ficar visível no histórico do servidor nem ser enviada a terceiros como parte do endereço da página.

**Liberação para fornecedores (US2, US4)**

- **FR-007**: Na página Fornecedores, apenas usuários com papel `admin` DEVEM ver e usar as ações de liberar, gerar novo convite e revogar o acesso ao Proposal.
- **FR-008**: A liberação DEVE exigir fornecedor ativo com e-mail válido; o login criado DEVE ser o e-mail em minúsculas e sem espaços.
- **FR-009**: O usuário criado pela liberação DEVE ter acesso somente ao Proposal (sem acesso ao ERP, papel `visualizador`, sem permissões de páginas do ERP) e ficar vinculado ao fornecedor.
- **FR-010**: A liberação de um fornecedor sem usuário DEVE gerar um link de convite com validade de **7 dias**, exibido ao admin com ação de copiar.
- **FR-011**: Gerar um novo convite DEVE invalidar qualquer convite anterior do mesmo usuário.
- **FR-012**: O link de convite DEVE ser impossível de adivinhar na prática, de uso único, e NÃO DEVE conter a senha nem dados pessoais além do necessário para identificá-lo.
- **FR-013**: A página do convite DEVE mostrar o login (e-mail) e pedir senha e confirmação; a senha DEVE ter no mínimo 8 caracteres.
- **FR-014**: Ao definir a senha, o convite DEVE ser consumido e o fornecedor DEVE entrar no Proposal já autenticado.
- **FR-015**: Convites usados, expirados, substituídos ou de usuários sem acesso DEVEM exibir a mesma mensagem genérica de convite inválido.
- **FR-016**: Enquanto o fornecedor não definir a senha, nenhum login com aquele usuário DEVE ser aceito.
- **FR-017**: Se o e-mail já for login de um usuário existente não vinculado a outro fornecedor, a liberação DEVE vincular o fornecedor a esse usuário e apenas ligar o acesso ao Proposal, sem alterar senha, papel, permissões nem acesso ao ERP.
- **FR-018**: Se o e-mail já estiver vinculado a outro fornecedor, a liberação DEVE ser recusada com mensagem clara.
- **FR-019**: Ao criar o usuário pela liberação, o perfil de consultor do Proposal DEVE ser pré-preenchido com nome, cargo, telefone e e-mail do fornecedor, quando ainda não existir perfil.
- **FR-020**: A liberação em massa DEVE processar cada fornecedor selecionado de forma independente, exibir os links de convite gerados e listar os ignorados com o motivo (sem e-mail válido, inativo, já ativo, e-mail vinculado a outro fornecedor).
- **FR-024**: Liberar de novo um fornecedor vinculado a um usuário que já definiu senha DEVE apenas religar o acesso ao Proposal, sem gerar convite; o admin DEVE poder gerar um novo convite a qualquer momento para redefinir a senha.

**Acompanhamento e revogação (US3)**

- **FR-021**: A lista de Fornecedores DEVE mostrar, para o admin, o status de acesso ao Proposal de cada fornecedor: **Sem acesso**, **Convite pendente**, **Convite expirado** ou **Ativo**.
- **FR-022**: O admin DEVE poder revogar o acesso ao Proposal de um fornecedor, com confirmação; a revogação DEVE desligar o acesso e invalidar convites pendentes, sem apagar o usuário nem as propostas que ele criou.
- **FR-023**: Desativar um fornecedor no ERP DEVE revogar automaticamente o acesso ao Proposal do usuário vinculado (como no FR-022), exceto se esse usuário também tiver acesso ao ERP, caso em que apenas o acesso ao Proposal é desligado e o acesso ao ERP permanece.
- **FR-025**: Reativar um fornecedor NÃO DEVE religar o acesso ao Proposal automaticamente.

### Key Entities

- **Usuário** (existente): ganha um vínculo opcional com um fornecedor (no máximo um usuário por fornecedor e um fornecedor por usuário) e a indicação de que ainda não definiu senha.
- **Fornecedor** (existente): cadastro em Fornecedores com nome, e-mail, cargo, telefone e status ativo. O status de acesso ao Proposal é derivado do usuário vinculado e dos convites.
- **Convite de acesso**: link de uso único para o usuário criar a senha. Atributos: usuário, data de criação, data de expiração (7 dias), data de uso, data de invalidação.
- **Credencial de entrada automática**: autorização temporária (máx. 2 minutos, uso único) emitida pelo ERP para abrir o Proposal já autenticado. Atributos: usuário, data de criação, data de expiração, data de uso.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuário com os dois acessos chega à lista de propostas a partir do ERP em 1 clique, sem digitar credenciais.
- **SC-002**: O admin libera o acesso de um fornecedor com e-mail cadastrado e copia o link de convite em menos de 30 segundos.
- **SC-003**: O fornecedor cria a senha e entra no Proposal em menos de 1 minuto a partir do link.
- **SC-004**: Em 100% das tentativas, um usuário criado pela liberação não consegue entrar no ERP nem obter dados do ERP.
- **SC-005**: Em 100% das tentativas, um convite ou uma credencial de entrada automática já usados, expirados ou substituídos não autenticam ninguém.
- **SC-006**: Em 100% dos casos, um fornecedor desativado ou com acesso revogado não consegue entrar no Proposal.

## Assumptions

- **Envio do convite**: o admin copia o link e envia pelo canal que preferir (WhatsApp, e-mail etc.). O envio automático por e-mail fica fora do escopo.
- **Troca e recuperação de senha**: fora do escopo como tela própria; o admin gera um novo convite para o fornecedor redefinir a senha.
- **Endereço do Proposal**: o ERP conhece o endereço do Proposal pela configuração já usada nos links públicos das propostas.
- **Configurações > Usuários**: continua funcionando como hoje; usuários criados pela liberação aparecem ali como qualquer outro usuário (somente Proposal).
- **Verificação em duas etapas**: usuários criados pela liberação começam sem ela; a entrada automática pelo ERP não pede o código de novo.
- **Escopo do ERP**: o item **Proposal** no menu não é uma página do ERP; não entra na configuração de visibilidade de páginas nem nas permissões por página.
