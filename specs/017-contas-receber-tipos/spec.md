# Feature Specification: Contas a Receber — Novos nomes dos tipos

**Feature Branch**: `017-contas-receber-tipos`

**Created**: 2026-08-12

**Status**: Draft

**Input**: User description: "na tela de contas a receber mudar os campos para os respectivos: retainer abertura = retainer; retainer fechamento = sucesso; sucesso = parcelamento"

## Clarifications

### Session 2026-08-12

- Q: Onde os novos nomes devem valer? → A: Contas a Receber e todas as telas que mostram o tipo (Dashboard, Relatórios, DH, Calendário)
- Q: Os nomes novos são só o que a pessoa vê, ou passam a ser a classificação gravada? → A: Gravar os nomes novos como classificação oficial, inclusive nos registros já existentes
- Q: Quando a Maggo mandar o tipo antigo, o que o Ocean deve gravar? → A: Converter na entrada (abertura → Retainer, fechamento → Sucesso, sucesso antigo → Parcelamento) e gravar o nome novo
- Q: Os e-mails que o Ocean envia também usam os nomes novos? → A: Sim: e-mails novos usam Retainer, Sucesso e Parcelamento; e-mails já enviados não mudam

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver e escolher os tipos com os novos nomes (Priority: P1)

Na página **Contas a Receber**, o administrador (e o visualizador, em consulta) deixa de ver os rótulos **Retainer - Abertura**, **Retainer - Fechamento** e **Sucesso**. No lugar, os três tipos passam a se chamar, respectivamente:

| Nome anterior              | Nome novo     |
|----------------------------|---------------|
| Retainer - Abertura        | Retainer      |
| Retainer - Fechamento      | Sucesso       |
| Sucesso                    | Parcelamento  |

Na listagem, no formulário de **Nova conta a receber**, na edição de registro manual e na exportação gerada por essa página, o tipo exibido e as opções selecionáveis usam **somente** os nomes novos. Cada conta existente permanece no mesmo grupo de negócio; a **classificação oficial gravada** passa a ser o nome novo conforme a tabela (não é só um rótulo na tela).

**Why this priority**: Sem os novos nomes na tela, o pedido não entrega valor. É a mudança visível do dia a dia.

**Independent Test**: Abrir Contas a Receber com ao menos um registro de cada tipo antigo; conferir os três novos rótulos na lista; abrir criação e edição manual e confirmar as três opções novas (e a ausência das antigas).

**Acceptance Scenarios**:

1. **Given** a listagem de Contas a Receber com contas dos três tipos atuais, **When** o usuário abre a página, **Then** vê **Retainer**, **Sucesso** e **Parcelamento** no lugar de **Retainer - Abertura**, **Retainer - Fechamento** e **Sucesso**, respectivamente — sem inventar tipo nem misturar os grupos.
2. **Given** um administrador no formulário **“Nova conta a receber”**, **When** abre o campo de tipo, **Then** as únicas opções são **Retainer**, **Sucesso** e **Parcelamento**; as opções **Retainer - Abertura**, **Retainer - Fechamento** e o **Sucesso** no sentido antigo não aparecem.
3. **Given** um administrador editando um registro **manual**, **When** altera o tipo, **Then** escolhe entre as três opções novas e, após salvar, a listagem mostra o nome novo correspondente.
4. **Given** um administrador editando um registro de origem **Maggo**, **When** vê o tipo, **Then** o campo permanece somente leitura e exibe a classificação oficial nova (não o rótulo antigo).
5. **Given** um visualizador, **When** consulta a listagem, **Then** vê os nomes novos e continua sem poder alterar o tipo.

---

### User Story 2 - Converter registros já cadastrados para a classificação oficial nova (Priority: P1)

Contas já existentes (e registros de DH com tipo de fechamento) não precisam ser recadastradas pelo usuário. O sistema **grava** a classificação nova: o que era abertura de retainer passa a ser **Retainer**; o que era fechamento de retainer, **Sucesso**; o que era sucesso, **Parcelamento**. Depois de recarregar a página, o tipo oficial é o nome novo. Filtros, totais, arquivadas e demais regras do módulo passam a usar esses três valores oficiais.

**Why this priority**: Sem converter o que já está gravado, a tela e os relatórios misturariam classificação antiga e nova, e o nome **Sucesso** teria dois significados.

**Independent Test**: Recarregar a página com dados já gravados dos três tipos antigos e confirmar que cada um aparece e permanece como o nome novo correspondente, inclusive após arquivar/desarquivar.

**Acceptance Scenarios**:

1. **Given** uma conta que hoje é **Retainer - Abertura**, **When** o usuário abre a listagem (e a edição, se aplicável) após a mudança, **Then** o tipo oficial é **Retainer**.
2. **Given** uma conta que hoje é **Retainer - Fechamento**, **When** o usuário abre a listagem (e a edição, se aplicável) após a mudança, **Then** o tipo oficial é **Sucesso**.
3. **Given** uma conta que hoje é **Sucesso**, **When** o usuário abre a listagem (e a edição, se aplicável) após a mudança, **Then** o tipo oficial é **Parcelamento**.
4. **Given** contas arquivadas e registros de DH dos três tipos, **When** o usuário os consulta após a mudança, **Then** a classificação oficial nova também se aplica a eles.

---

### User Story 3 - Ver os mesmos nomes no Dashboard, Relatórios, DH e Calendário (Priority: P1)

O mesmo mapeamento vale em **todas** as telas do produto que mostram o tipo de fechamento/receita: **Dashboard**, **Relatórios**, **DH** e **Calendário**. O usuário não encontra **Retainer - Abertura**, **Retainer - Fechamento** nem o **Sucesso** no sentido antigo nesses módulos. Onde hoje há um mix ou contagem em dois grupos (retainer vs sucesso), a visão passa a distinguir os **três** nomes novos, para que **Sucesso** não signifique coisas diferentes em telas diferentes.

**Why this priority**: Sem alinhamento entre telas, **Sucesso** na listagem seria o antigo fechamento de retainer, enquanto no Dashboard/Relatórios continuaria sendo o grupo que agora se chama **Parcelamento**.

**Independent Test**: Abrir Dashboard, Relatórios, DH e Calendário com dados dos três tipos antigos e confirmar os três nomes novos (e a ausência dos antigos) em gráficos, totais, listas, formulários e legendas que mostrem o tipo.

**Acceptance Scenarios**:

1. **Given** dados dos três tipos antigos já convertidos, **When** o usuário abre o **Dashboard**, **Then** o mix/indicadores de tipo usam **Retainer**, **Sucesso** e **Parcelamento** conforme o mapeamento — não os dois rótulos antigos retainer vs sucesso.
2. **Given** os mesmos dados, **When** o usuário abre **Relatórios**, **Then** contagens, gráficos e textos de tipo usam os três nomes novos.
3. **Given** um administrador em **DH**, **When** cria, edita ou consulta um registro com tipo de fechamento, **Then** as opções e a classificação gravada são **Retainer**, **Sucesso** e **Parcelamento** (mesmo mapeamento).
4. **Given** eventos ou legendas de tipo no **Calendário**, **When** o usuário consulta a visão, **Then** os nomes novos aparecem no lugar dos antigos.
5. **Given** qualquer uma dessas telas, **When** o usuário procura **Retainer - Abertura** ou **Retainer - Fechamento**, **Then** esses rótulos não aparecem.

---

### User Story 4 - Exportar sem os nomes antigos (Priority: P2)

Quem exporta a listagem a partir de Contas a Receber (e qualquer exportação dessas telas que inclua o tipo) recebe **Retainer**, **Sucesso** ou **Parcelamento**. Não há rótulo antigo **Sucesso** com o significado anterior.

**Why this priority**: A exportação é o mesmo conjunto de dados da tela; nomes divergentes geram retrabalho e dúvida no financeiro.

**Independent Test**: Exportar a listagem de Contas a Receber com os três tipos presentes e conferir os três nomes novos na coluna de tipo, sem os rótulos antigos.

**Acceptance Scenarios**:

1. **Given** a listagem com os três tipos, **When** o usuário exporta a partir de Contas a Receber, **Then** a coluna de tipo usa **Retainer**, **Sucesso** e **Parcelamento** conforme o mapeamento.
2. **Given** qualquer ponto da página Contas a Receber (lista, formulário, edição, exportação), **When** o usuário procura **Retainer - Abertura**, **Retainer - Fechamento** ou **Sucesso** no sentido antigo, **Then** esses rótulos não aparecem.

---

### User Story 5 - Gravar o tipo Maggo já convertido (Priority: P2)

A fonte Maggo pode continuar enviando a classificação **antiga** (retainer abertura, retainer fechamento, sucesso). Na entrada, o Ocean converte e **grava** a classificação oficial nova. O usuário só vê e consulta **Retainer**, **Sucesso** ou **Parcelamento**. O tipo Maggo permanece somente leitura na tela.

**Why this priority**: Sem converter na entrada, o **sucesso** antigo da Maggo seria gravado como o **Sucesso** novo (antigo fechamento), misturando os grupos.

**Independent Test**: Receber (ou simular) um registro Maggo de cada tipo antigo e confirmar que a conta persiste e aparece com o nome novo correspondente.

**Acceptance Scenarios**:

1. **Given** a Maggo envia uma conta **Retainer - Abertura**, **When** o Ocean incorpora o registro, **Then** a classificação oficial gravada é **Retainer**.
2. **Given** a Maggo envia **Retainer - Fechamento**, **When** o Ocean incorpora o registro, **Then** a classificação oficial gravada é **Sucesso**.
3. **Given** a Maggo envia **Sucesso** (sentido antigo), **When** o Ocean incorpora o registro, **Then** a classificação oficial gravada é **Parcelamento**.
4. **Given** um registro Maggo já incorporado, **When** o administrador abre a edição, **Then** o tipo continua somente leitura e mostra o nome novo.

---

### User Story 6 - E-mails novos com os nomes novos (Priority: P2)

E-mails que o Ocean envia a partir desta mudança (por exemplo o aviso de DH) usam **Retainer**, **Sucesso** ou **Parcelamento** no assunto e no corpo, no mesmo mapeamento das telas. Mensagens **já enviadas** não são alteradas.

**Why this priority**: Sem isso, a caixa de entrada continuaria falando “retainer abertura” enquanto a tela de DH já mostra **Retainer**.

**Independent Test**: Disparar um e-mail novo de DH para cada um dos três tipos e conferir os nomes novos; conferir que um e-mail antigo na caixa de entrada permanece como foi enviado.

**Acceptance Scenarios**:

1. **Given** um administrador dispara um e-mail novo de DH cujo tipo oficial é **Retainer**, **When** o destinatário lê a mensagem, **Then** o tipo aparece como **Retainer**, não como **Retainer - Abertura**.
2. **Given** e-mails novos para **Sucesso** e **Parcelamento**, **When** enviados, **Then** usam esses nomes (não **Retainer - Fechamento** nem o **Sucesso** antigo).
3. **Given** um e-mail já enviado antes da mudança, **When** o destinatário o reabre, **Then** o conteúdo permanece o original (não é reescrito).

---

### Edge Cases

- Conta retainer **sem** indicação de abertura/fechamento: trata-se como o antigo **Retainer - Abertura**, portanto a classificação oficial gravada passa a ser **Retainer**.
- Registro Maggo: tipo somente leitura na tela; a classificação oficial visível e gravada é a nova (convertida na entrada).
- Maggo envia classificação antiga e o registro já existe no Ocean: a conversão na entrada aplica o mesmo mapeamento; regras de merge/origem já vigentes (manual prevalece, unicidade de NF) não mudam.
- Maggo envia tipo que não corresponde a nenhum dos três grupos antigos: o sistema não inventa classificação; trata como falha de dado da fonte (feedback já previsto para erro da Maggo), sem gravar um tipo oficial falso.
- Conta sem tipo (dado incompleto): o usuário identifica a ausência (vazio ou “—”), sem receber um tipo inventado.
- Visualizador: vê os nomes novos; não cria nem edita.
- Falha ao salvar após troca de tipo (registro manual): feedback claro; a listagem não mostra o nome novo como se tivesse gravado.
- Papéis e demais campos (NF opcional, Caixa, pagamento, colaboradores, arquivar) não mudam por esta feature.
- Mix/gráfico que hoje agrega retainer (abertura + fechamento) contra sucesso: deixa de usar essa agregação de dois grupos; passa a apresentar os três nomes novos.
- Após a conversão, o sistema MUST NOT continuar gravando abertura/fechamento como classificação oficial; os únicos valores oficiais são **Retainer**, **Sucesso** e **Parcelamento**.
- E-mails já enviados: não são reescritos; apenas mensagens novas passam a usar os nomes novos.
- Histórico de auditoria já registrado: não é reescrito; eventos novos usam os nomes novos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Na página **Contas a Receber**, o sistema MUST exibir e permitir selecionar exatamente três tipos, com os nomes **Retainer**, **Sucesso** e **Parcelamento**.
- **FR-002**: O sistema MUST aplicar o mapeamento: antigo **Retainer - Abertura** → **Retainer**; antigo **Retainer - Fechamento** → **Sucesso**; antigo **Sucesso** → **Parcelamento**.
- **FR-003**: O sistema MUST NOT exibir, nas telas **Contas a Receber**, **Dashboard**, **Relatórios**, **DH** e **Calendário**, os rótulos **Retainer - Abertura**, **Retainer - Fechamento**, nem **Sucesso** com o significado anterior.
- **FR-004**: Contas já cadastradas e registros de DH com tipo de fechamento MUST ser convertidos automaticamente para a classificação oficial nova conforme FR-002; o usuário MUST NOT precisar recadastrar.
- **FR-005**: No formulário **“Nova conta a receber”**, o campo tipo MUST oferecer somente as três opções novas e continuar obrigatório.
- **FR-006**: Na edição de registro **manual**, o administrador MUST poder alterar o tipo entre as três opções novas; a classificação gravada e a listagem MUST refletir a escolha após salvar.
- **FR-007**: Na edição de registro **Maggo**, o tipo MUST permanecer somente leitura e MUST mostrar a classificação oficial nova.
- **FR-008**: A exportação gerada a partir da página Contas a Receber MUST usar os nomes novos na coluna de tipo.
- **FR-009**: Usuários com papel **visualizador** MUST ver os nomes novos e MUST NOT criar nem alterar o tipo.
- **FR-010**: O sistema MUST NOT alterar, nesta feature, as regras já vigentes de NF opcional, Caixa, pagamento, colaboradores, arquivar, origem Maggo vs manual, unicidade de NF nem papéis admin/visualizador.
- **FR-011**: O sistema MUST usar os mesmos três nomes novos (**Retainer**, **Sucesso**, **Parcelamento**) e o mesmo mapeamento em **Dashboard**, **Relatórios**, **DH** e **Calendário**, em todo ponto visível que hoje mostre o tipo (listas, formulários, gráficos, totais, legendas).
- **FR-012**: Onde Dashboard ou Relatórios hoje apresentam mix ou contagem em **dois** grupos (retainer vs sucesso), o sistema MUST passar a distinguir os **três** nomes novos, para que **Sucesso** tenha o mesmo significado em todas as telas.
- **FR-013**: O sistema MUST gravar **Retainer**, **Sucesso** e **Parcelamento** como a classificação oficial (criação, edição e registros já existentes convertidos). MUST NOT gravar abertura/fechamento nem o **Sucesso** antigo como classificação oficial após a conversão.
- **FR-014**: Quando a Maggo enviar a classificação antiga, o sistema MUST converter na entrada pelo mesmo mapeamento de FR-002 e MUST gravar o nome novo. MUST NOT gravar o **sucesso** antigo da Maggo como o **Sucesso** oficial novo.
- **FR-015**: E-mails **novos** enviados pelo Ocean que mencionem o tipo (incluindo DH) MUST usar **Retainer**, **Sucesso** ou **Parcelamento** conforme a classificação oficial. E-mails já enviados MUST NOT ser alterados.

### Key Entities

- **Conta a Receber**: Registro de valor a receber, com um **tipo** de negócio obrigatório.
- **Tipo da conta a receber / tipo de fechamento**: Classificação **oficial gravada** em um de três valores em todo o produto: **Retainer**, **Sucesso** ou **Parcelamento**. Substitui **Retainer - Abertura**, **Retainer - Fechamento** e **Sucesso** (sentido antigo). Abertura/fechamento deixa de ser classificação oficial.
- **Usuário**: Admin (criação e alteração de tipo em registros manuais e em DH, quando já permitido) ou visualizador (somente leitura).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das inspeções de Contas a Receber, Dashboard, Relatórios, DH e Calendário, os únicos nomes de tipo visíveis são **Retainer**, **Sucesso** e **Parcelamento**.
- **SC-002**: Em 100% dos registros de teste dos três tipos antigos, após a mudança o tipo **oficial gravado e exibido** corresponde à tabela de mapeamento, sem recadastro.
- **SC-003**: Administrador cria ou altera o tipo de uma conta manual para qualquer uma das três opções novas em menos de 1 minuto, e o nome permanece após recarregar a página.
- **SC-004**: Em 100% das tentativas, visualizador não consegue alterar o tipo; registro Maggo continua com tipo não editável.
- **SC-005**: Em inspeção das telas afetadas, 100% dos pontos deixam de mostrar **Retainer - Abertura** e **Retainer - Fechamento**.
- **SC-006**: Em 100% das inspeções de Dashboard e Relatórios, o mix/contagem de tipo apresenta três grupos nomeados **Retainer**, **Sucesso** e **Parcelamento**, sem o par antigo retainer vs sucesso.
- **SC-007**: Em 100% dos testes de entrada Maggo com os três tipos antigos, a classificação oficial gravada corresponde ao mapeamento (abertura → Retainer, fechamento → Sucesso, sucesso antigo → Parcelamento).
- **SC-008**: Em 100% dos e-mails novos de teste que mencionam o tipo, os nomes usados são **Retainer**, **Sucesso** ou **Parcelamento**; em 100% dos e-mails já enviados de teste, o conteúdo original permanece.

## Assumptions

- Os novos nomes valem em **Contas a Receber**, **Dashboard**, **Relatórios**, **DH** e **Calendário**.
- Os três tipos continuam sendo os mesmos três grupos de negócio; esta feature **converte a classificação oficial** desses grupos, não cria um quarto tipo nem funde dois em um.
- Retainer sem subtipo abertura/fechamento equivale ao antigo **Retainer - Abertura** (comportamento já usado na tela) e é gravado como **Retainer**.
- A obrigatoriedade do campo tipo no cadastro manual permanece.
- Papéis admin / visualizador e as regras de edição Maggo vs manual seguem o produto existente.
- A conversão dos registros existentes é automática e única (não exige ação do usuário).
- Nesta feature, a Maggo continua enviando a **semântica antiga** (retainer abertura / retainer fechamento / sucesso). O Ocean interpreta esse formato na entrada, converte e grava os nomes novos. A Maggo enviar os nomes novos no contrato dela fica fora desta entrega.
- E-mails novos seguem os nomes oficiais; o histórico de mensagens já enviadas e de auditoria já registrada não é reescrito.

## Out of Scope

- Criar tipos além de Retainer, Sucesso e Parcelamento.
- Mudar regras de Caixa, pagamento, NF, colaboradores, arquivar ou papéis.
- Recadastramento manual em massa pelo usuário (a conversão dos registros existentes é automática).
- Reintrodução de importação em lote, exclusão em massa/individual ou pasta de arquivos de NFs.
- Alterar o contrato da Maggo para ela enviar os nomes novos (a conversão na entrada cobre o formato antigo).
- Reescrever e-mails já enviados ou registros de auditoria já gravados.
