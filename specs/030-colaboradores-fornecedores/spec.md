# Feature Specification: Colaboradores e Fornecedores — cadastros separados

**Feature Branch**: `030-colaboradores-fornecedores`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "tela de Colaboradores — Separar cadastro de Colaboradores e Fornecedores. Campo Documento: opção CPF → inserir CPF. Campo Documento: opção CNPJ → inserir CNPJ + Razão Social. Adicionar campo Telefone. Adicionar campo Email."

## Clarifications

### Session 2026-08-13

- Q: Nos cadastros de colaborador e fornecedor, quem pode usar CPF e quem pode usar CNPJ? → A: Colaborador e fornecedor: Documento = CPF ou CNPJ (CNPJ exige Razão Social)
- Q: É permitido converter um registro de colaborador para fornecedor (ou o inverso) depois de criado? → A: Tipo imutável: não converte colaborador ↔ fornecedor
- Q: O cadastro de fornecedor entra em outras telas nesta feature? → A: Contas a Pagar e outras telas financeiras passam a usar fornecedor onde couber (não em telas de equipe)
- Q: O vínculo com fornecedor na conta a pagar é obrigatório? → A: Opcional: a conta pode ser gravada sem fornecedor
- Q: Como o usuário entra nos dois cadastros? → A: Um item de menu, duas visões/abas na mesma tela

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Separar cadastro de Colaboradores e Fornecedores (Priority: P1)

O administrador abre o item de menu **Colaboradores** (o mesmo de hoje) e, **na mesma tela**, alterna entre duas visões: **Colaboradores** e **Fornecedores**. Cada visão lista, cria, edita e desativa apenas o tipo correspondente. Não há segundo item de menu. O visualizador consulta as duas visões em somente leitura.

**Why this priority**: Misturar equipe e fornecedores no mesmo cadastro impede operação clara (RH vs contas a pagar) e é o pedido central da feature.

**Independent Test**: Abrir a tela, alternar entre Colaboradores e Fornecedores, criar um registro em cada visão e confirmar que um não aparece na lista do outro.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado, **When** usa o menu, **Then** encontra um único item para essa área (o de Colaboradores) e, ao abri-lo, escolhe a visão **Colaboradores** ou **Fornecedores** na mesma tela.
2. **Given** a visão Colaboradores, **When** lista os registros, **Then** vê apenas colaboradores (incluindo os já existentes no cadastro atual).
3. **Given** a visão Fornecedores, **When** lista os registros, **Then** vê apenas fornecedores; registros de colaboradores não aparecem.
4. **Given** um administrador, **When** cria um colaborador, **Then** o registro fica disponível só na visão Colaboradores e o tipo não pode ser alterado depois.
5. **Given** um administrador, **When** cria um fornecedor, **Then** o registro fica disponível só na visão Fornecedores e o tipo não pode ser alterado depois.
6. **Given** um visualizador, **When** consulta qualquer das visões, **Then** consegue ver os dados e **não** consegue criar, editar nem desativar.

---

### User Story 2 - Documento CPF ou CNPJ no cadastro (Priority: P1)

No formulário de criação ou edição (colaborador ou fornecedor), o administrador escolhe o tipo de **Documento**: **CPF** ou **CNPJ**. Com CPF, informa o número do CPF. Com CNPJ, informa o número do CNPJ **e** a **Razão Social**. O sistema valida o documento e impede gravar dados incompletos ou inválidos.

**Why this priority**: Identificação fiscal correta é o que distingue pessoa física de jurídica no cadastro e evita duplicidade ou dado ilegível.

**Independent Test**: Criar um registro com CPF válido; criar outro com CNPJ válido e razão social; tentar gravar CNPJ sem razão social e CPF inválido e confirmar que o sistema recusa com mensagem clara.

**Acceptance Scenarios**:

1. **Given** o formulário aberto, **When** o administrador escolhe Documento = CPF, **Then** aparece o campo para inserir o CPF e **não** aparece o campo Razão Social exigido pelo CNPJ.
2. **Given** Documento = CPF, **When** informa um CPF válido e os demais campos obrigatórios do tipo de cadastro, **Then** o registro é gravado com o CPF.
3. **Given** o formulário aberto, **When** o administrador escolhe Documento = CNPJ, **Then** aparecem os campos CNPJ e Razão Social.
4. **Given** Documento = CNPJ, **When** informa CNPJ válido e Razão Social e os demais campos obrigatórios, **Then** o registro é gravado com ambos.
5. **Given** Documento = CNPJ, **When** tenta gravar sem Razão Social ou com CNPJ inválido, **Then** o sistema recusa e informa o que falta ou o que está inválido.
6. **Given** Documento = CPF, **When** informa CPF inválido, **Then** o sistema recusa e informa que o CPF é inválido.
7. **Given** um registro já gravado, **When** o administrador abre a edição, **Then** o tipo de documento e os valores (CPF ou CNPJ + Razão Social) vêm preenchidos e podem ser alterados respeitando as mesmas regras.
8. **Given** um colaborador já existente (cadastro atual só com CPF), **When** a tela é aberta após a mudança, **Then** o registro aparece como colaborador com Documento = CPF e o CPF preservado.

---

### User Story 3 - Telefone e e-mail no cadastro (Priority: P1)

No formulário de colaborador e de fornecedor, o administrador informa **Telefone** e **Email**. Os valores ficam visíveis na listagem (ou no detalhe do registro) para contato operacional.

**Why this priority**: Sem contato, o cadastro separado não atende o uso diário (cobrança, RH, fornecedor).

**Independent Test**: Gravar um colaborador e um fornecedor com telefone e e-mail; reabrir e conferir os valores; tentar e-mail malformado e conferir recusa.

**Acceptance Scenarios**:

1. **Given** o formulário de colaborador ou de fornecedor, **When** o administrador visualiza os campos, **Then** existem **Telefone** e **Email**.
2. **Given** telefone e e-mail preenchidos em formato válido (ou deixados em branco), **When** grava o registro, **Then** os valores persistem e reaparecem na edição.
3. **Given** um e-mail informado, **When** o formato não é de e-mail válido, **Then** o sistema recusa a gravação e informa o problema.
4. **Given** a listagem da visão correspondente, **When** o usuário consulta os registros, **Then** consegue identificar telefone e e-mail de cada item (na linha ou no detalhe acessível sem sair da tela).
5. **Given** um visualizador, **When** consulta a listagem ou o detalhe, **Then** vê telefone e e-mail e **não** consegue alterá-los.

---

### User Story 4 - Campos de equipe só no colaborador (Priority: P2)

O cadastro de **Colaborador** mantém os dados de equipe já usados hoje (cargo, salário, datas de nascimento/admissão/desligamento, endereço, benefício, observação, documentos, histórico de cargo). O cadastro de **Fornecedor** não pede nem exibe esses dados de RH; concentra-se em identificação, documento, contato e observação operacional.

**Why this priority**: Evita cadastro de fornecedor com salário e férias, que geraria dado sem sentido e risco operacional.

**Independent Test**: Abrir “novo colaborador” e ver os campos de equipe; abrir “novo fornecedor” e confirmar ausência de cargo, salário, admissão, desligamento, benefício e histórico de cargo.

**Acceptance Scenarios**:

1. **Given** o formulário de colaborador, **When** o administrador cadastra, **Then** os campos de equipe existentes continuam disponíveis e obrigatórios na mesma lógica atual (salvo documento, telefone e e-mail desta feature).
2. **Given** o formulário de fornecedor, **When** o administrador cadastra, **Then** não há cargo, salário, datas de RH, benefício nem histórico de cargo.
3. **Given** um colaborador, **When** o administrador usa documentos, desligamento ou histórico, **Then** o comportamento permanece o da tela atual.
4. **Given** um fornecedor, **When** o administrador consulta a visão Fornecedores, **Then** pode desativar/remover com confirmação, no padrão do produto, sem fluxo de “desligamento” de colaborador.

---

### User Story 5 - Usar fornecedor nas telas financeiras (Priority: P1)

O administrador, em **Contas a Pagar**, associa a despesa a um **fornecedor** cadastrado. O nome do fornecedor aparece na listagem da conta e nas telas financeiras que já mostram essa despesa (em especial o **Calendário** de vencimentos). Telas de equipe (férias, DH, bônus, patrimônio) e telas de cliente/sócio (contas a receber/NFs, retiradas) **não** passam a oferecer fornecedor.

**Why this priority**: Separar o cadastro só gera valor operacional se a despesa puder apontar para o fornecedor certo, sem misturar com RH.

**Independent Test**: Cadastrar um fornecedor, criar ou editar uma conta a pagar vinculando-o, conferir o nome na listagem de contas e no calendário; abrir férias/bônus e confirmar que o fornecedor não aparece na escolha de pessoa.

**Acceptance Scenarios**:

1. **Given** um fornecedor ativo, **When** o administrador cria ou edita uma conta a pagar, **Then** pode escolher esse fornecedor e gravar o vínculo, ou gravar a conta **sem** fornecedor.
2. **Given** uma conta a pagar vinculada a um fornecedor, **When** qualquer usuário autenticado consulta a listagem de Contas a Pagar, **Then** identifica o fornecedor daquela despesa.
3. **Given** uma conta a pagar **sem** fornecedor, **When** o administrador grava ou consulta, **Then** a conta permanece válida e utilizável como hoje.
4. **Given** uma conta a pagar vinculada a um fornecedor com vencimento visível no Calendário, **When** o usuário consulta o calendário, **Then** vê o fornecedor associado àquela despesa (além das informações que o calendário já mostra).
5. **Given** um visualizador, **When** consulta contas a pagar ou o calendário, **Then** vê o fornecedor e **não** consegue alterar o vínculo.
6. **Given** férias, DH, bônus ou patrimônio, **When** o administrador escolhe a pessoa da equipe, **Then** a lista contém apenas colaboradores; fornecedores não aparecem.
7. **Given** contas a receber (NFs) ou retiradas de sócios, **When** o usuário opera a tela, **Then** não há escolha de fornecedor (continuam cliente e sócio, respectivamente).

---

### Edge Cases

- Tentativa de mudar o tipo do cadastro (colaborador ↔ fornecedor) na edição: não é permitido; o tipo permanece o da criação. Correção operacional: criar no cadastro certo e desativar o registro errado.
- Troca de Documento de CPF para CNPJ (ou o inverso) na edição: os campos do tipo anterior deixam de ser exigidos; os do novo tipo passam a ser obrigatórios; não se grava CPF e CNPJ ao mesmo tempo no mesmo registro.
- CPF ou CNPJ duplicado em outro registro ativo do mesmo tipo de cadastro: o sistema recusa e informa que o documento já está em uso.
- Mesmo documento em tipos diferentes (ex.: CPF de um colaborador e de um fornecedor PF): permitido, pois são cadastros distintos.
- CNPJ com máscara ou só dígitos: ambos são aceitos na entrada; a validação usa os dígitos.
- Telefone vazio: permitido; se preenchido, aceita formato brasileiro usual (com DDD).
- E-mail vazio: permitido; se preenchido, exige formato válido.
- Razão Social só com espaços: tratado como vazio e recusado quando Documento = CNPJ.
- Colaborador inativo / fornecedor inativo: continua fora da listagem padrão e reaparece no filtro de inativos, no padrão já usado para colaboradores.
- Importação em lote existente da tela de colaboradores: permanece restrita a **colaboradores**; fornecedores não entram por essa importação nesta feature.
- Conta a pagar sem fornecedor: listagem e calendário funcionam como hoje, sem exigir o campo.
- Fornecedor inativo: não aparece para novo vínculo em contas a pagar; contas já vinculadas continuam mostrando o nome do fornecedor (indicando que está inativo, se a tela já distingue status).
- Férias, DH, bônus, patrimônio, NFs/contas a receber e retiradas: fornecedor não entra na escolha de pessoa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE oferecer cadastros separados de **Colaborador** e **Fornecedor**, com listagens que não misturam os dois tipos.
- **FR-002**: O administrador DEVE poder criar, editar e desativar registros em cada cadastro; o visualizador DEVE apenas consultar.
- **FR-003**: O formulário de **colaborador** e o de **fornecedor** DEVEM ter o campo **Documento** com as opções **CPF** e **CNPJ** (nenhum dos cadastros restringe a um único tipo de documento).
- **FR-004**: Com Documento = CPF, o sistema DEVE exigir o CPF e validá-lo; NÃO DEVE exigir Razão Social.
- **FR-005**: Com Documento = CNPJ, o sistema DEVE exigir CNPJ válido e **Razão Social**.
- **FR-006**: O sistema DEVE persistir o tipo de documento e os valores informados, e reapresentá-los na edição.
- **FR-007**: O formulário de ambos os cadastros DEVE incluir **Telefone** e **Email** (opcionais; e-mail validado quando preenchido).
- **FR-008**: A listagem (ou o detalhe na mesma tela) DEVE exibir telefone e e-mail para contato.
- **FR-009**: O cadastro de colaborador DEVE manter os campos e fluxos de equipe já existentes (exceto a substituição do CPF fixo pelo Documento CPF/CNPJ e a inclusão de telefone e e-mail).
- **FR-010**: O cadastro de fornecedor NÃO DEVE incluir campos de RH (cargo, salário, datas de equipe, benefício, histórico de cargo).
- **FR-011**: Registros já existentes DEVEM permanecer como colaboradores com Documento = CPF e o CPF atual preservado; telefone e e-mail iniciam vazios.
- **FR-012**: O sistema DEVE impedir documento duplicado entre registros **ativos do mesmo tipo** (colaborador vs colaborador, fornecedor vs fornecedor).
- **FR-013**: Telas de equipe (férias, DH, bônus, patrimônio) e telas de cliente/sócio (contas a receber/NFs, retiradas) DEVEM continuar listando apenas colaboradores ou o cadastro próprio atual; NÃO DEVEM oferecer fornecedor.
- **FR-014**: Depois de criado, o tipo do registro (colaborador ou fornecedor) NÃO DEVE poder ser alterado.
- **FR-015**: Em Contas a Pagar, o administrador DEVE poder vincular um fornecedor ativo à despesa **de forma opcional** (gravação permitida sem fornecedor); o visualizador DEVE ver o vínculo, quando houver, sem alterá-lo.
- **FR-016**: Telas financeiras que já exibem a conta a pagar (no mínimo o Calendário de vencimentos) DEVEM mostrar o fornecedor quando houver vínculo.
- **FR-017**: Os dois cadastros DEVEM ser acessados pelo **mesmo item de menu** já usado para Colaboradores, com duas visões na mesma tela; NÃO DEVE haver item de menu separado para Fornecedores.

### Key Entities

- **Colaborador**: Pessoa da equipe. Tipo de cadastro fixo e imutável após a criação. Documento (CPF ou CNPJ + Razão Social quando CNPJ), nome de exibição, telefone, e-mail, e demais dados de equipe já existentes.
- **Fornecedor**: Pessoa física ou jurídica prestadora/parceira. Tipo de cadastro fixo e imutável após a criação. Documento (CPF ou CNPJ + Razão Social quando CNPJ), nome de exibição, telefone, e-mail, observação; sem dados de RH. Pode ser vinculado a contas a pagar.
- **Documento cadastral**: Escolha CPF ou CNPJ ligada a um único registro; determina quais identificadores fiscais são obrigatórios.
- **Conta a pagar**: Despesa existente do produto; pode referenciar um fornecedor cadastrado; o vínculo não é obrigatório.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um administrador consegue cadastrar um colaborador e um fornecedor, cada um no cadastro correto, em menos de 2 minutos por registro (dados já em mãos).
- **SC-002**: Em 100% das tentativas com Documento = CNPJ sem Razão Social, a gravação é recusada com mensagem compreensível.
- **SC-003**: Em 100% das tentativas com CPF ou CNPJ inválido, a gravação é recusada com mensagem compreensível.
- **SC-004**: Após gravar telefone e e-mail, o usuário reencontra os mesmos valores ao reabrir o registro, sem retrabalho.
- **SC-005**: Usuários não encontram fornecedores na listagem de colaboradores, nem colaboradores na de fornecedores, em uma conferência de ponta a ponta da tela.
- **SC-006**: Um visualizador consulta os dois cadastros e os contatos sem conseguir alterar nada.
- **SC-007**: Todos os colaboradores existentes antes da mudança continuam localizáveis na visão Colaboradores, com o CPF original.
- **SC-008**: Em uma conferência ponta a ponta, uma conta a pagar vinculada a um fornecedor exibe esse fornecedor na listagem de contas e no calendário; férias/bônus não listam o mesmo registro como pessoa da equipe.

## Assumptions

- Colaborador pessoa jurídica (CNPJ) e fornecedor pessoa física (CPF) são cadastros válidos.
- A separação ocorre na **mesma área de navegação** hoje usada para Colaboradores (duas visões/abas), sem novo item de menu nesta feature (confirmado na sessão de esclarecimento).
- **Nome** continua sendo o nome de exibição (pessoa ou nome fantasia). **Razão Social** é campo extra obrigatório só com CNPJ.
- Telefone e e-mail são **opcionais**.
- Validação de CPF segue a regra já usada na tela; CNPJ usa dígitos verificadores padrão brasileiro.
- Não há migração automática de nenhum registro atual para fornecedor: tudo que existe hoje é colaborador.
- Cadastro no tipo errado se corrige criando no cadastro certo e desativando o registro errado; não há conversão de tipo.
- Fornecedor entra em **Contas a Pagar** e no **Calendário** (quando a despesa aparece lá). Não entra em férias, DH, bônus, patrimônio, contas a receber/NFs nem retiradas.
- Vínculo de fornecedor na conta a pagar é **opcional**; contas já existentes permanecem sem fornecedor até alguém vincular.
- Importação CSV/planilha da tela permanece só para colaboradores.
- Papéis `admin` e `visualizador` seguem o padrão do produto.
- Soft delete / inativos segue o padrão já usado em colaboradores, aplicado também a fornecedores.
