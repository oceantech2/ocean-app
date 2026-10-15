# Feature Specification: Segurança de acesso ao ERP

**Feature Branch**: `093-seguranca-acesso-erp`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "tirar email e senha do forms de login do frontend; fluxo de liberar acesso ao ERP e excluir usuários não está funcionando, cadastramos um usuário e ao logar dá erro de email e senha incorreto (após logar no proposal deu certo de logar no ERP)"

## Contexto

Diagnóstico feito no ambiente de produção em 15/10/2026:

1. **Credenciais padrão expostas**: a tela de login do ERP exibe, abaixo do campo de senha, o usuário e a senha padrão de administrador. Além disso, o sistema recria automaticamente as contas padrão (administrador e visualizador, com a mesma senha conhecida) sempre que alguém tenta entrar e elas não existem, e aceita essas credenciais mesmo quando a conta correspondente está inativa. Na prática, qualquer pessoa que abra a tela de login consegue entrar como administrador do sistema financeiro.
2. **Excluir usuário "não funciona"**: as contas padrão excluídas voltam a existir no login seguinte (o banco mostra `admin` recriado em 13/10 e `visualizador` em 14/10); desativá-las também não impede o login com a senha padrão. Além disso, usuário excluído ou desativado continua usando o ERP até a sessão expirar (até 8 horas).
3. **Liberar acesso ao ERP falha**: usuários liberados como fornecedor na página Fornecedores nascem com "convite pendente" (sem senha própria) até aceitarem o convite do Proposal. Quando o administrador depois liga o acesso ao ERP e define uma senha em Configurações, a pendência não é removida e o ERP responde "Usuário ou senha incorretos". Só depois que o usuário aceita o convite no Proposal (definindo outra senha) o login no ERP passa a funcionar — exatamente o relato do usuário (caso confirmado no banco: usuário cadastrado em 13/10, convite aceito em 14/10 16:53, login no ERP liberado logo depois).
4. **Login por e-mail sensível a maiúsculas/espaços**: o login do Proposal normaliza o e-mail (minúsculas, sem espaços nas pontas); o do ERP não, e o mesmo usuário pode falhar em um e funcionar no outro.

## Clarifications

### Session 2026-10-15

- Q: O que fazer com as contas padrão (`admin`/`visualizador`) existentes? → A: Remover a criação automática e o aceite de credenciais fixas; as contas existentes ficam e o administrador troca as senhas.
- Q: Sessões de usuários excluídos/desativados e mudanças de papel devem valer imediatamente? → A: Sim; o ERP reconfere usuário, acesso e papel a cada ação.
- Q: Admin liga o acesso ao ERP de usuário com convite pendente sem definir senha? → A: Bloquear e avisar que é preciso definir uma senha ou aguardar o aceite do convite.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ninguém entra com credenciais padrão (Priority: P1)

A tela de login não exibe nenhuma credencial. O sistema não cria contas automaticamente nem aceita usuário/senha fixos: só entra quem tem uma conta cadastrada, ativa, com acesso ao ERP e com a senha correta.

**Why this priority**: É uma brecha de segurança ativa em um sistema financeiro em produção; qualquer pessoa com o endereço do sistema pode entrar como administrador.

**Independent Test**: Abrir a tela de login e confirmar que não há credenciais exibidas; excluir uma conta de teste chamada como uma das contas padrão, tentar entrar com a senha padrão e confirmar a recusa; repetir com a conta desativada.

**Acceptance Scenarios**:

1. **Given** a tela de login do ERP, **When** qualquer pessoa a abre, **Then** nenhum usuário, e-mail ou senha é exibido como dica ou texto de ajuda.
2. **Given** que a conta `admin` foi excluída, **When** alguém tenta entrar com `admin` e a senha padrão antiga, **Then** o login é recusado com "Usuário ou senha incorretos" e a conta não é recriada.
3. **Given** que a conta `visualizador` está inativa, **When** alguém tenta entrar com ela e a senha padrão antiga, **Then** o login é recusado.
4. **Given** qualquer tentativa de login, **When** ela termina (com sucesso ou não), **Then** nenhuma conta nova foi criada no sistema.

---

### User Story 2 - Usuário liberado pelo administrador entra no ERP com a senha definida (Priority: P1)

O administrador cadastra um usuário ou liga o acesso ao ERP de um usuário já existente (inclusive um fornecedor com convite do Proposal ainda não aceito), define a senha e o usuário entra no ERP imediatamente com essa senha, digitando o e-mail com ou sem maiúsculas.

**Why this priority**: É o bug relatado pelo time; hoje usuários liberados ficam bloqueados até aceitar o convite do Proposal.

**Independent Test**: Liberar um fornecedor na página Fornecedores (convite pendente), ir a Configurações, ligar "Acesso ao ERP" e definir uma senha; entrar no ERP com o e-mail e essa senha, sem passar pelo Proposal.

**Acceptance Scenarios**:

1. **Given** um usuário com convite do Proposal pendente, **When** o administrador liga o acesso ao ERP e define uma senha em Configurações, **Then** o usuário entra no ERP com essa senha na primeira tentativa.
2. **Given** o cenário anterior, **When** o usuário depois tenta usar o convite antigo do Proposal, **Then** o convite é informado como inválido (a senha já foi definida pelo administrador) e ele entra no Proposal com a mesma senha definida pelo administrador, se tiver acesso ao Proposal.
3. **Given** um usuário com convite pendente, **When** o administrador tenta ligar o acesso ao ERP sem definir senha, **Then** o sistema não salva e avisa que é preciso definir uma senha (ou aguardar o aceite do convite).
4. **Given** um usuário cadastrado como `fulano@empresa.com`, **When** ele digita `Fulano@Empresa.com ` (com maiúsculas e espaço no fim) no login do ERP, **Then** o login funciona.
5. **Given** o administrador cadastrando um novo usuário com e-mail digitado com maiúsculas ou espaços, **When** salva, **Then** o login é gravado em minúsculas e sem espaços nas pontas.
6. **Given** a lista de usuários em Configurações, **When** um usuário ainda tem convite pendente, **Then** a lista sinaliza "Convite pendente" para esse usuário.

---

### User Story 3 - Excluir ou desativar usuário corta o acesso de verdade (Priority: P2)

Ao excluir, desativar ou retirar o acesso ao ERP de um usuário, ele deixa de conseguir usar o ERP na próxima ação que fizer — inclusive se já estava com a sessão aberta — e a conta excluída não volta a existir. Mudanças de papel (admin ↔ visualizador) também passam a valer na próxima ação.

**Why this priority**: Completa a correção de "excluir usuários não funciona" e fecha a janela de até 8 horas em que um usuário removido continua operando o sistema.

**Independent Test**: Com um usuário de teste logado no ERP em outra janela, excluí-lo em Configurações; na janela do usuário, qualquer ação leva de volta ao login. Recarregar a lista de usuários e confirmar que ele não reaparece.

**Acceptance Scenarios**:

1. **Given** um usuário logado no ERP, **When** o administrador o exclui, **Then** a próxima ação do usuário no ERP é recusada e ele volta para a tela de login.
2. **Given** um usuário logado no ERP, **When** o administrador o desativa ou desliga seu acesso ao ERP, **Then** a próxima ação do usuário é recusada.
3. **Given** um administrador logado, **When** outro administrador muda seu papel para visualizador, **Then** a partir da próxima ação ele só tem permissões de visualizador.
4. **Given** um usuário excluído, **When** a lista de usuários é recarregada (inclusive após novos logins de outras pessoas), **Then** ele não reaparece.
5. **Given** um usuário vinculado a um fornecedor, **When** ele é excluído, **Then** a página Fornecedores mostra o fornecedor como "sem acesso" e permite liberá-lo novamente do zero.
6. **Given** um usuário excluído que tinha verificação em duas etapas, **When** uma nova conta é criada com o mesmo login, **Then** a nova conta não herda a verificação em duas etapas da antiga.

---

### Edge Cases

- **Banco sem nenhum usuário** (ambiente novo ou local): ninguém consegue entrar até que o primeiro administrador seja criado por um procedimento técnico explícito, documentado e fora da tela de login; o sistema nunca cria esse administrador sozinho com senha conhecida.
- **Contas padrão já existentes em produção** (`admin`, `visualizador`): continuam existindo e funcionando com a senha atual; cabe ao administrador trocar as senhas (ou excluí-las) após a implantação. O sistema deixa de recriá-las.
- **Administrador tenta excluir, desativar ou tirar o próprio acesso ao ERP**: continua bloqueado, como hoje.
- **Usuário excluído com propostas criadas no Proposal**: as propostas permanecem e continuam mostrando o login do autor em "criado por".
- **Sessão aberta de usuário cujo acesso ao Proposal foi retirado**: já é recusada hoje no Proposal; o comportamento não muda.
- **Login digitado com espaços nas pontas**: os espaços são ignorados tanto no ERP quanto no Proposal.
- **Login que não é e-mail** (ex.: `admin1`): é comparado exatamente como cadastrado, apenas sem espaços nas pontas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A tela de login do ERP MUST NOT exibir usuário, e-mail ou senha (de exemplo, padrão ou de desenvolvimento) nem o aviso de "Ambiente de desenvolvimento".
- **FR-002**: O sistema MUST NOT criar contas de usuário automaticamente durante o login ou a inicialização.
- **FR-003**: O sistema MUST NOT aceitar credenciais fixas no código; o login do ERP só é aceito para conta cadastrada, ativa, com acesso ao ERP, sem convite pendente e com a senha correta.
- **FR-004**: MUST existir um procedimento técnico documentado para criar o primeiro administrador em um banco sem usuários, sem senha conhecida embutida no sistema.
- **FR-005**: Quando o administrador define a senha de um usuário (no cadastro ou na edição em Configurações), o sistema MUST considerar a senha definida (remover a pendência de convite) e invalidar os convites do Proposal ainda não usados desse usuário.
- **FR-006**: O sistema MUST recusar ligar o acesso ao ERP de um usuário com convite pendente quando nenhuma senha for definida na mesma operação, com mensagem clara.
- **FR-007**: A lista de usuários em Configurações MUST sinalizar os usuários com convite pendente.
- **FR-008**: O login do ERP MUST normalizar logins que são e-mail (minúsculas, sem espaços nas pontas) da mesma forma que o login do Proposal; logins que não são e-mail MUST ser comparados sem os espaços das pontas.
- **FR-009**: O cadastro de usuário em Configurações MUST gravar logins que são e-mail normalizados (minúsculas, sem espaços nas pontas) e recusar duplicidade considerando essa normalização.
- **FR-010**: A cada ação no ERP, o sistema MUST reconferir que o usuário da sessão ainda existe, está ativo e tem acesso ao ERP, recusando a ação caso contrário e levando o usuário de volta ao login.
- **FR-011**: O papel (admin/visualizador) usado para autorizar cada ação no ERP MUST ser o papel atual do usuário cadastrado, não o papel do momento do login.
- **FR-012**: Excluir um usuário MUST removê-lo definitivamente, sem que ele volte a existir por qualquer ação automática, e MUST remover também sua configuração de verificação em duas etapas.
- **FR-013**: A exclusão de um usuário vinculado a fornecedor MUST deixar o fornecedor apto a ser liberado novamente na página Fornecedores.
- **FR-014**: As alterações de usuários em Configurações (criar, editar acessos/papel/senha, desativar/reativar, excluir) MUST ser registradas na Auditoria com o administrador responsável, sem registrar senhas.

### Key Entities

- **Usuário do sistema (existente)**: login, papel, status ativo, acesso ao ERP, acesso ao Proposal, vínculo opcional com fornecedor e indicação de convite pendente (sem senha própria definida). Nenhum atributo novo é necessário.
- **Convite do Proposal (existente)**: link de uso único para o usuário definir a própria senha; passa a ser invalidado quando o administrador define a senha.
- **Verificação em duas etapas (existente)**: configuração ligada ao login do usuário; passa a ser removida junto com o usuário.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 credenciais visíveis na tela de login do ERP.
- **SC-002**: 0 logins aceitos com credenciais de contas inexistentes, inativas ou sem acesso ao ERP (verificado com as contas padrão excluídas e desativadas).
- **SC-003**: 100% dos usuários liberados pelo administrador com senha definida entram no ERP na primeira tentativa, sem precisar passar pelo Proposal.
- **SC-004**: Usuário excluído, desativado ou sem acesso ao ERP perde o acesso na próxima ação (em vez de até 8 horas depois).
- **SC-005**: 0 contas reaparecem após exclusão, mesmo depois de novos logins de outros usuários.

## Assumptions

- As contas `admin` e `visualizador` existentes em produção são mantidas (decisão do usuário em 15/10/2026); a troca de senha delas é ação do administrador logo após a implantação, fora do escopo do sistema.
- O ambiente local de desenvolvimento já tem usuários no banco; bancos novos usam o procedimento técnico de criação do primeiro administrador (FR-004).
- A regra do Proposal para sessões (reconferência no banco a cada ação) já existe e serve de referência para o ERP.
- O olho para mostrar/ocultar a senha é tratado em feature separada (096).
- O login continua aceitando usuário (ex.: `admin1`) ou e-mail; não há migração de logins existentes, que já estão normalizados no banco.
