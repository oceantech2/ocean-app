# Feature Specification: Fornecedores — cadastro unificado e dados de pessoa física

**Feature Branch**: `043-fornecedores-cadastro`

**Created**: 2026-08-27

**Status**: Draft

**Input**: User description: "COLABORADORES — Renomear página para Fornecedores e considerar todos os registros como Fornecedores. Inserir campo Tipo no cadastro de Fornecedor (opções: Fixo, Spot). Novo colaborador: Quando Fornecedor for CNPJ, incluir campos para pessoa física dele também (Nome, CPF, Endereço, Data de Nascimento)."

## Clarifications

### Session 2026-08-27

- Q: Após a unificação, quais registros do cadastro de Fornecedores podem ser selecionados nas telas de equipe (férias, DH, bônus, patrimônio)? → A: Apenas registros que eram colaboradores antes da migração (legado); novos fornecedores e ex-fornecedores puros não aparecem em telas de equipe.
- Q: No formulário de cadastro de Fornecedor, como devem se comportar os campos de RH (cargo, salário, admissão, etc.)? → A: Campos de RH visíveis e editáveis apenas em registros legados (ex-colaboradores); ocultos para novos fornecedores e ex-fornecedores puros.
- Q: Para fornecedores com Documento = CPF, a Data de Nascimento é obrigatória? → A: Obrigatória apenas em registros legados (ex-colaboradores); não exibida para novos fornecedores CPF.
- Q: Qual deve ser o endereço (URL) da página de cadastro unificado? → A: Mudar para `/fornecedores` com redirect automático de `/colaboradores` para a nova rota.
- Q: Fornecedor CNPJ sem dados de pessoa física completos pode ser vinculado em Contas a Pagar? → A: Sim — pode vincular normalmente; pendência de PF fica só no cadastro até a próxima edição.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Página e cadastro unificados como Fornecedores (Priority: P1)

O administrador acessa o menu **Fornecedores** (antes **Colaboradores**) e vê uma única listagem com todos os registros do cadastro, sem alternar entre visões de colaborador e fornecedor. Rótulos, títulos e ações da tela usam o termo **Fornecedor** (ex.: "Novo fornecedor", "Editar fornecedor"). Registros que antes eram colaboradores continuam acessíveis na mesma listagem, agora tratados como fornecedores.

**Why this priority**: Unificar nomenclatura e visão é a base para os novos campos e evita duplicidade conceitual entre colaborador e fornecedor.

**Independent Test**: Abrir o menu, confirmar o rótulo **Fornecedores**, listar registros antigos de colaborador e novos fornecedores na mesma tela, sem abas ou filtros de tipo de cadastro.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado, **When** consulta o menu lateral, **Then** o item exibe **Fornecedores** (não **Colaboradores**) e leva à rota **`/fornecedores`**.
2. **Given** um usuário acessa o endereço antigo **`/colaboradores`**, **When** a página carrega, **Then** é redirecionado automaticamente para **`/fornecedores`** sem perder autenticação.
3. **Given** a tela de Fornecedores aberta, **When** o usuário visualiza a listagem, **Then** não há abas, seletores ou filtros que separem colaborador de fornecedor.
4. **Given** registros existentes antes da mudança (incluindo os marcados como colaborador), **When** a listagem é carregada, **Then** todos aparecem como fornecedores, com dados preservados (nome, documento, contato, etc.).
5. **Given** um administrador, **When** cria um novo registro, **Then** o fluxo é rotulado como **Novo fornecedor** e o registro entra na listagem unificada.
6. **Given** um visualizador, **When** acessa a tela, **Then** consulta a listagem em somente leitura, sem criar, editar ou desativar.

---

### User Story 1b - Campos de RH apenas em registros legados (Priority: P2)

No formulário unificado de Fornecedor, campos de equipe (cargo, salário, datas de nascimento/admissão/desligamento, endereço, benefício, observação de RH, documentos e histórico de cargo) permanecem **visíveis e editáveis** somente em registros que eram **colaboradores** antes da migração. Para **novos fornecedores** e **ex-fornecedores puros**, esses campos de RH **não** são exibidos no formulário.

**Why this priority**: Mantém operação de RH para quem já era da equipe sem poluir o cadastro de fornecedores novos ou pontuais.

**Independent Test**: Abrir edição de um registro legado (ex-colaborador) e confirmar campos de RH; abrir "novo fornecedor" e confirmar ausência desses campos.

**Acceptance Scenarios**:

1. **Given** um registro legado (ex-colaborador), **When** o administrador abre edição, **Then** os campos de RH (cargo, salário, datas, benefício, histórico etc.) estão visíveis e editáveis.
2. **Given** um novo fornecedor em criação, **When** o administrador abre o formulário, **Then** os campos de RH **não** são exibidos.
3. **Given** um ex-fornecedor puro (nunca colaborador), **When** o administrador abre edição, **Then** os campos de RH **não** são exibidos.
4. **Given** um registro legado com dados de RH preenchidos, **When** o administrador altera cargo ou salário e grava, **Then** os valores persistem e continuam disponíveis em telas de equipe.

---

### User Story 2 - Classificação Tipo Fixo ou Spot (Priority: P1)

No formulário de criação ou edição de fornecedor, o administrador informa o campo **Tipo** com uma das opções: **Fixo** ou **Spot**. O valor fica visível na listagem (coluna ou detalhe) para distinguir fornecedores recorrentes de fornecedores pontuais.

**Why this priority**: A classificação Fixo/Spot é requisito explícito de negócio para operação e relatórios futuros.

**Independent Test**: Criar um fornecedor Tipo Fixo e outro Spot; reabrir cada um e confirmar persistência; tentar gravar sem Tipo e confirmar recusa.

**Acceptance Scenarios**:

1. **Given** o formulário de novo fornecedor, **When** o administrador visualiza os campos, **Then** existe o campo **Tipo** com opções **Fixo** e **Spot**.
2. **Given** um fornecedor em criação ou edição, **When** o administrador seleciona **Fixo** ou **Spot** e grava, **Then** o valor persiste e reaparece na edição.
3. **Given** o formulário sem Tipo selecionado, **When** o administrador tenta gravar, **Then** o sistema recusa e informa que o Tipo é obrigatório.
4. **Given** a listagem de fornecedores, **When** o usuário consulta os registros, **Then** consegue identificar o Tipo (Fixo ou Spot) de cada item.
5. **Given** registros existentes migrados da versão anterior, **When** são exibidos pela primeira vez após a mudança, **Then** recebem **Fixo** como valor padrão de Tipo, editável pelo administrador.

---

### User Story 3 - Dados de pessoa física quando documento é CNPJ (Priority: P1)

Ao cadastrar ou editar um fornecedor com **Documento = CNPJ**, o administrador informa também os dados da **pessoa física** vinculada (representante ou responsável): **Nome**, **CPF**, **Endereço** e **Data de Nascimento**, além dos dados já exigidos de CNPJ e Razão Social. Com **Documento = CPF**, a seção adicional de pessoa física do CNPJ **não** é exibida. Em registros **legados** (ex-colaboradores), **Data de Nascimento** permanece visível e obrigatória no bloco de RH. Em **novos fornecedores CPF**, **Data de Nascimento não é exibida** nem exigida.

**Why this priority**: Fornecedores PJ precisam identificar o responsável físico para conformidade e contato operacional.

**Independent Test**: Criar fornecedor CNPJ preenchendo Razão Social e todos os campos de pessoa física; criar fornecedor CPF sem seção extra; tentar gravar CNPJ sem CPF da pessoa física e confirmar recusa.

**Acceptance Scenarios**:

1. **Given** Documento = **CNPJ** no formulário, **When** o administrador visualiza o cadastro, **Then** aparecem os campos de pessoa física: **Nome**, **CPF**, **Endereço** e **Data de Nascimento**, além de CNPJ e Razão Social.
2. **Given** Documento = **CNPJ** com todos os campos obrigatórios válidos, **When** o administrador grava, **Then** os dados da pessoa jurídica e da pessoa física são persistidos e reaparecem na edição.
3. **Given** Documento = **CNPJ**, **When** falta Nome, CPF, Endereço ou Data de Nascimento da pessoa física, ou o CPF é inválido, **Then** o sistema recusa a gravação com mensagem clara.
4. **Given** Documento = **CPF** em um **novo fornecedor**, **When** o administrador abre o formulário, **Then** **não** aparece seção de pessoa física do CNPJ nem campo **Data de Nascimento**; aplicam-se apenas os campos padrão do fornecedor PF (nome, CPF, contato etc.).
5. **Given** Documento = **CPF** em um registro **legado** (ex-colaborador), **When** o administrador abre o formulário, **Then** **Data de Nascimento** permanece visível e obrigatória no bloco de RH.
6. **Given** um fornecedor CNPJ já gravado, **When** o administrador altera para CPF na edição, **Then** os campos exclusivos de pessoa física do CNPJ deixam de ser exigidos; ao voltar para CNPJ, devem ser preenchidos novamente conforme as regras.
7. **Given** Data de Nascimento da pessoa física (CNPJ) ou legado (CPF) informada, **When** a data é futura ou inválida, **Then** o sistema recusa a gravação.

---

### User Story 4 - Continuidade operacional em outras telas (Priority: P2)

Registros que antes eram **colaboradores** (legado) continuam disponíveis em telas de equipe (férias, DH, bônus, patrimônio) e mantêm os vínculos existentes. **Novos fornecedores** criados após a unificação e **ex-fornecedores puros** (que nunca foram colaboradores) **não** aparecem nessas telas de equipe. Em **Contas a Pagar**, qualquer fornecedor ativo continua elegível para vínculo. A nomenclatura visível ao usuário nas telas de equipe pode permanecer "colaborador" onde já existia; a origem dos dados é o cadastro unificado de Fornecedores.

**Why this priority**: Evita quebra de processos financeiros e de RH ao renomear e unificar o cadastro.

**Independent Test**: Abrir férias/bônus e contas a pagar; selecionar um registro migrado; confirmar que o vínculo e os dados aparecem corretamente.

**Acceptance Scenarios**:

1. **Given** um registro que era colaborador antes da migração, **When** o administrador abre férias, DH, bônus ou patrimônio, **Then** o registro continua disponível para seleção como antes.
2. **Given** um fornecedor criado após a unificação ou um ex-fornecedor puro (nunca colaborador), **When** o administrador abre férias, DH, bônus ou patrimônio, **Then** esse registro **não** aparece para seleção.
3. **Given** um fornecedor ativo (legado ou novo), **When** o administrador vincula em Contas a Pagar, **Then** o vínculo funciona como na versão anterior, **mesmo** que o fornecedor CNPJ ainda não tenha dados de pessoa física completos no cadastro.
4. **Given** a unificação concluída, **When** qualquer usuário busca registros legados de colaborador no cadastro unificado, **Then** não há registros órfãos invisíveis por terem sido colaboradores antes da migração.

---

### Edge Cases

- Registro existente com Documento CNPJ sem dados de pessoa física: na primeira **edição** do cadastro após a mudança, o administrador deve preencher Nome, CPF, Endereço e Data de Nascimento antes de gravar; a listagem continua exibindo o registro; **vínculo em Contas a Pagar permanece permitido** mesmo com PF pendente.
- Troca de CNPJ para CPF na edição: campos de pessoa física do CNPJ são ocultados e não persistidos no registro PF; dados de PJ anteriores não bloqueiam a gravação se os campos PF padrão estiverem válidos.
- CPF da pessoa física duplicado em outro fornecedor ativo: o sistema recusa e informa duplicidade (mesma regra já usada para documento principal).
- CNPJ duplicado entre fornecedores ativos: continua recusado como hoje.
- Fornecedor inativo: fora da listagem padrão; Tipo e dados de PF permanecem no registro; não aparece para novos vínculos em contas a pagar.
- Importação em lote existente na tela: passa a criar **fornecedores** (não colaboradores); Tipo padrão **Fixo** quando não informado na planilha.
- Novo fornecedor ou ex-fornecedor puro: não aparece em férias, DH, bônus nem patrimônio; continua elegível em Contas a Pagar; formulário sem campos de RH.
- Registro legado (ex-colaborador): permanece em telas de equipe mesmo após renomeação do cadastro para Fornecedores; campos de RH permanecem visíveis e editáveis no formulário.
- Visualizador: vê Tipo e dados de pessoa física do CNPJ, sem poder alterar.
- Razão Social só com espaços: tratada como vazia e recusada quando Documento = CNPJ.
- Novo fornecedor CPF: sem Data de Nascimento no formulário; gravação permitida com nome, CPF e demais campos padrão obrigatórios.
- Registro legado CPF: Data de Nascimento permanece obrigatória no bloco de RH.
- Endereço da pessoa física (CNPJ) só com espaços: tratado como vazio e recusado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir o item de menu e o título da página como **Fornecedores**, substituindo **Colaboradores** em toda a interface dessa área, e a rota principal DEVE ser **`/fornecedores`**.
- **FR-001a**: O endereço legado **`/colaboradores`** DEVE redirecionar automaticamente para **`/fornecedores`**.
- **FR-002**: O sistema DEVE manter uma única listagem de cadastro, sem visões ou abas que separem colaborador e fornecedor.
- **FR-003**: Todos os registros do cadastro (novos e existentes) DEVEM ser tratados como **fornecedor**; registros anteriormente marcados como colaborador DEVEM ser migrados para fornecedor sem perda de dados.
- **FR-004**: O formulário de fornecedor DEVE incluir o campo **Tipo** com opções **Fixo** e **Spot**, obrigatório em criação e edição.
- **FR-005**: A listagem ou detalhe do fornecedor DEVE exibir o **Tipo** (Fixo ou Spot).
- **FR-006**: Registros migrados sem Tipo definido DEVEM receber **Fixo** como valor padrão até que um administrador altere.
- **FR-007**: Com **Documento = CNPJ**, o formulário DEVE exigir **CNPJ** válido, **Razão Social** e os campos de pessoa física: **Nome**, **CPF** válido, **Endereço** e **Data de Nascimento** válida.
- **FR-008**: Com **Documento = CPF**, o sistema NÃO DEVE exigir nem exibir a seção adicional de pessoa física do CNPJ. Em registros **legados** (ex-colaboradores), **Data de Nascimento** DEVE permanecer visível e obrigatória no bloco de RH. Em **novos fornecedores CPF**, **Data de Nascimento NÃO DEVE ser exibida** nem exigida.
- **FR-009**: O sistema DEVE persistir e reapresentar na edição os dados de pessoa física vinculados a fornecedores CNPJ.
- **FR-010**: O administrador DEVE poder criar, editar e desativar fornecedores; o visualizador DEVE apenas consultar.
- **FR-011**: Vínculos existentes em férias, DH, bônus, patrimônio e contas a pagar DEVEM continuar válidos após a migração dos registros legados (ex-colaboradores).
- **FR-014**: Telas de equipe (férias, DH, bônus, patrimônio) DEVEM listar **apenas** registros que eram colaboradores antes da migração; novos fornecedores e ex-fornecedores puros NÃO DEVEM aparecer nessas telas.
- **FR-015**: Contas a Pagar DEVE continuar permitindo vínculo com **qualquer** fornecedor ativo, independentemente de ter sido colaborador legado ou não, **inclusive** fornecedores CNPJ com dados de pessoa física ainda incompletos no cadastro.
- **FR-016**: O formulário de fornecedor DEVE exibir campos de RH (cargo, salário, datas de equipe, benefício, histórico de cargo etc.) **apenas** em registros legados (ex-colaboradores); para novos fornecedores e ex-fornecedores puros, esses campos NÃO DEVEM ser exibidos.
- **FR-017**: Em registros legados, alterações nos campos de RH DEVEM persistir e permanecer acessíveis às telas de equipe vinculadas.
- **FR-012**: O sistema DEVE impedir documento principal (CPF ou CNPJ) duplicado entre fornecedores ativos, e CPF da pessoa física duplicado entre fornecedores ativos quando aplicável.
- **FR-013**: Importação em lote pela tela DEVE criar fornecedores com Tipo **Fixo** quando o Tipo não for informado na origem.

### Key Entities

- **Fornecedor**: Cadastro unificado de pessoa física ou jurídica. Atributos: nome de exibição, documento (CPF ou CNPJ + Razão Social quando CNPJ), **Tipo** (Fixo | Spot), telefone, e-mail, observação, status ativo/inativo, e demais dados já existentes no cadastro (incluindo campos de equipe em registros legados). Registros legados (ex-colaboradores) permanecem elegíveis em telas de equipe; novos fornecedores e ex-fornecedores puros são elegíveis apenas em fluxos financeiros (ex.: Contas a Pagar).
- **Pessoa física do CNPJ**: Dados do responsável/representante quando o fornecedor é PJ — Nome, CPF, Endereço, Data de Nascimento — vinculados ao registro do fornecedor CNPJ.
- **Tipo de fornecedor**: Classificação operacional **Fixo** (recorrente/contratual) ou **Spot** (pontual/eventual); distinta do antigo tipo cadastral colaborador/fornecedor.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um administrador localiza qualquer registro legado (ex-colaborador) na tela **Fornecedores** em menos de 30 segundos, usando busca ou listagem.
- **SC-002**: Em 100% das tentativas de gravar fornecedor sem Tipo, a operação é recusada com mensagem compreensível.
- **SC-003**: Em 100% das tentativas de gravar fornecedor CNPJ sem um dos campos de pessoa física obrigatórios, a operação é recusada com mensagem compreensível.
- **SC-004**: Após cadastrar fornecedor CNPJ com dados completos, o usuário reencontra Tipo, Razão Social e todos os campos de pessoa física ao reabrir o registro, sem retrabalho.
- **SC-005**: Nenhum registro legado (ex-colaborador) fica inacessível em férias ou bônus após a migração; nenhum fornecedor ativo fica inacessível em contas a pagar, em verificação ponta a ponta com amostra de registros.
- **SC-006**: Usuários não encontram mais o rótulo **Colaboradores** no menu nem na página de cadastro unificada; acessos a **`/colaboradores`** redirecionam para **`/fornecedores`**.

## Assumptions

- **Fixo** e **Spot** são os únicos valores de Tipo nesta feature; não há terceira opção nem hierarquia entre elas.
- Tipo **Fixo** é o padrão para registros migrados e para importação sem coluna de Tipo.
- Campos de equipe já existentes (cargo, salário, datas de admissão/desligamento, benefício, histórico) permanecem nos registros legados e continuam **visíveis e editáveis** no formulário apenas para ex-colaboradores; novos fornecedores e ex-fornecedores puros **não** veem nem editam esses campos.
- **Nome** no cadastro CNPJ continua sendo o nome de exibição do fornecedor (fantasia ou uso operacional); **Nome** na seção de pessoa física refere-se ao responsável PF.
- **Endereço** da pessoa física do CNPJ é campo de texto livre (mesmo padrão do endereço já usado no cadastro), sem exigência de CEP separado nesta seção.
- **Data de Nascimento** em fornecedores CPF: obrigatória apenas para registros legados (ex-colaboradores), no bloco de RH; novos fornecedores CPF não possuem esse campo.
- Validação de CPF e CNPJ segue as regras já usadas no produto.
- Papéis `admin` (edição) e `visualizador` (somente leitura) seguem o padrão do Ocean App.
- Soft delete / filtro de inativos segue o padrão atual do cadastro.
- Renomear o menu não exige, nesta feature, renomear rótulos em todas as telas de equipe (férias, bônus etc.); apenas garantir que os vínculos por ID continuem funcionando para registros legados (ex-colaboradores).
- Telas de equipe filtram por elegibilidade legada (era colaborador), não por Tipo Fixo/Spot nem por tipo de documento.
- A rota principal da página é **`/fornecedores`**; **`/colaboradores`** redireciona automaticamente para manter compatibilidade com bookmarks e links antigos.
