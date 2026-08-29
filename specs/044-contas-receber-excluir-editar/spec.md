# Feature Specification: Contas a Receber — Excluir linha, Tipo e campos Maggo editáveis

**Feature Branch**: `044-contas-receber-excluir-editar`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "CONTAS A RECEBER - Opção/Botão para excluir linha; Renomear 'Método de pagamento' para 'Tipo' e renomear opções ('Retainer', 'Parcela', 'Sucesso'); Se possível, deixar os campos que vêm da Maggo também editáveis (sem necessariamente mudar na Maggo)"

## Clarifications

### Session 2026-08-28

- Q: Exclusão de conta já recebida e efeito no caixa → A: Pode excluir qualquer conta (pendente ou recebida). Totais de Contas a Receber deixam de contar o registro; lançamentos de caixa já feitos permanecem.
- Q: O que a Maggo pode sobrescrever em conta já existente no Ocean → A: Maggo não atualiza campos Maggo de conta já existente. Só cria registros novos. O que está no Ocean (editado ou não) permanece.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Excluir uma linha da listagem (Priority: P1)

O administrador, na página **Contas a Receber**, encontra em cada linha uma ação clara para **excluir** aquele registro (além das ações já existentes, como editar e arquivar). Após confirmar, a linha some da listagem e não volta a aparecer no uso diário — inclusive se a conta era de origem **Maggo**. O visualizador continua só consultando: não vê a ação de excluir (ou ela não funciona).

**Why this priority**: Sem exclusão por linha, o financeiro não consegue retirar da lista contas indevidas, duplicadas ou que não devem mais ser acompanhadas; arquivar só oculta e não atende o pedido.

**Independent Test**: Como admin, excluir uma conta manual e uma Maggo (com confirmação); recarregar a página e confirmar ausência das duas. Como visualizador, confirmar que a exclusão não está disponível.

**Acceptance Scenarios**:

1. **Given** um administrador na listagem de Contas a Receber com ao menos uma linha visível, **When** observa a coluna de ações da linha, **Then** vê uma opção/botão de **excluir** distinta de arquivar.
2. **Given** um administrador aciona excluir em uma linha, **When** ainda não confirmou, **Then** o sistema pede confirmação e a linha permanece na lista até a confirmação.
3. **Given** o administrador confirma a exclusão, **When** a ação conclui com sucesso, **Then** a linha some da listagem na mesma sessão e após recarregar a página.
4. **Given** uma conta de origem **Maggo** excluída, **When** a fonte Maggo envia de novo o mesmo fechamento, **Then** a linha **não** reaparece na listagem (a exclusão no Ocean prevalece).
5. **Given** uma conta de origem **manual** excluída, **When** o usuário recarrega a página, **Then** o registro não reaparece.
6. **Given** um visualizador na página, **When** procura excluir uma linha, **Then** a ação não está disponível (somente leitura).
7. **Given** exclusão recusada pelo usuário na confirmação, **When** cancela, **Then** a linha permanece inalterada.
8. **Given** a exclusão falha (indisponibilidade ou erro), **When** o administrador tenta, **Then** recebe feedback claro e a linha continua na lista.
9. **Given** uma conta **Recebida** (com ou sem NF), **When** o administrador confirma a exclusão, **Then** a linha some das visões de Contas a Receber (listagem, totais, Dashboard, Relatórios, Calendário) e os **lançamentos de caixa já feitos permanecem** inalterados.

---

### User Story 2 - Ver e escolher Tipo (Retainer, Parcela, Sucesso) (Priority: P1)

Na página **Contas a Receber**, o rótulo **“Método de pagamento”** passa a se chamar **“Tipo”** (cabeçalho da tabela, formulário de criação, edição e exportação gerada por essa página). As três opções visíveis e selecionáveis passam a ser **Retainer**, **Parcela** e **Sucesso**. O que hoje aparece como **Parcelamento** passa a se chamar **Parcela**; **Retainer** e **Sucesso** permanecem com o mesmo significado de negócio. Contas já cadastradas como Parcelamento passam a ser exibidas e gravadas como **Parcela**, sem recadastro.

O mesmo nome **Parcela** (no lugar de Parcelamento) vale nas demais telas do produto que já mostram esse tipo (Dashboard, Relatórios, DH, Calendário e e-mails novos), para não haver dois nomes para o mesmo grupo.

**Why this priority**: O vocabulário atual (“método de pagamento” / “Parcelamento”) não é o que o time usa no dia a dia; sem o alinhamento de nomes, a exclusão e a edição de campos Maggo ainda deixariam a tela confusa.

**Independent Test**: Abrir Contas a Receber com um registro de cada tipo; conferir o cabeçalho **Tipo** e os três nomes; abrir criação e edição e confirmar as três opções (sem “Método de pagamento” nem “Parcelamento”); conferir uma tela que já mostrava Parcelamento (ex.: DH) e ver **Parcela**.

**Acceptance Scenarios**:

1. **Given** a listagem de Contas a Receber, **When** o usuário lê o cabeçalho da coluna que hoje se chama “Método de pagamento”, **Then** vê **Tipo** (não “Método de pagamento”).
2. **Given** contas dos três tipos atuais, **When** o usuário abre a listagem, **Then** vê **Retainer**, **Parcela** e **Sucesso** — e não vê **Parcelamento**.
3. **Given** um administrador no formulário **“Nova conta a receber”**, **When** abre o campo de tipo, **Then** o rótulo do campo é **Tipo** e as únicas opções são **Retainer**, **Parcela** e **Sucesso**.
4. **Given** um administrador editando uma conta (manual ou Maggo, com o campo agora editável), **When** altera o tipo, **Then** escolhe entre as três opções novas e, após salvar, a listagem mostra o nome correspondente.
5. **Given** uma conta que hoje é **Parcelamento**, **When** o usuário a consulta após a mudança, **Then** o tipo oficial visível e gravado é **Parcela**, sem recadastro.
6. **Given** a exportação gerada a partir de Contas a Receber, **When** o usuário exporta, **Then** a coluna usa o nome **Tipo** e os valores **Retainer**, **Parcela** e **Sucesso**.
7. **Given** Dashboard, Relatórios, DH ou Calendário (e e-mails **novos** que mencionem o tipo), **When** o usuário consulta um ponto que hoje mostra **Parcelamento**, **Then** vê **Parcela**; e-mails já enviados não são reescritos.
8. **Given** um visualizador, **When** consulta, **Then** vê **Tipo** e os três nomes novos, sem poder alterar o tipo.

---

### User Story 3 - Editar no Ocean os campos que vieram da Maggo (Priority: P2)

O administrador consegue **editar no Ocean** os campos do grupo Maggo de uma conta de origem Maggo (vaga, empresa, tipo, valor bruto, imposto, valor líquido e data ent. pgto), da mesma forma que já edita esses equivalentes em contas manuais. A alteração **permanece no Ocean** e **não** é enviada à Maggo. Depois que a conta já existe no Ocean, a Maggo **não** atualiza mais esses campos (tenham sido editados ou não); a fonte só entra com **fechamentos novos**. Os campos Ocean (NF, emissão, vencimento, pagamento, Caixa, etc.) continuam editáveis como hoje. O visualizador continua sem editar.

**Why this priority**: Valores ou classificação incorretos na fonte travam o financeiro; corrigir só no Ocean, sem mexer na Maggo, é o que o time pediu (“se possível”).

**Independent Test**: Abrir edição de uma conta Maggo, alterar ao menos um campo do grupo Maggo (ex.: valor bruto ou tipo), salvar, recarregar e confirmar o valor novo; confirmar que a origem continua Maggo; simular nova entrada Maggo do mesmo fechamento e confirmar que os campos Maggo no Ocean não mudam.

**Acceptance Scenarios**:

1. **Given** um administrador editando uma conta de origem **Maggo**, **When** vê os campos vaga, empresa, tipo, valor bruto, imposto, valor líquido e data ent. pgto, **Then** consegue alterá-los (não estão bloqueados).
2. **Given** o administrador altera um ou mais desses campos e salva com dados válidos, **When** recarrega a página, **Then** os valores novos persistem no Ocean.
3. **Given** essa alteração salva no Ocean, **When** o usuário consulta a Maggo (ou o fluxo de entrada da Maggo), **Then** a Maggo **não** foi atualizada por essa edição — a correção é só no Ocean.
4. **Given** uma conta Maggo já existente no Ocean (editada ou não), **When** a Maggo envia de novo o mesmo fechamento com valores diferentes nos campos Maggo, **Then** o Ocean **não** altera vaga, empresa, tipo, valor bruto, imposto, valor líquido nem data ent. pgto; os valores no Ocean permanecem.
5. **Given** um administrador editando uma conta **manual**, **When** altera os mesmos campos, **Then** o comportamento de edição já existente permanece (os dois grupos continuam editáveis).
6. **Given** campos Ocean (NF, emissão, vencimento, pagamento, status derivado, Caixa), **When** o administrador edita uma conta Maggo, **Then** as regras já vigentes desses campos não mudam.
7. **Given** um visualizador, **When** tenta alterar qualquer campo Maggo, **Then** a ação é bloqueada.
8. **Given** tentativa de salvar com campo obrigatório inválido (ex.: empresa vazia, tipo ausente, bruto ou líquido inválidos), **When** o administrador tenta gravar, **Then** o sistema impede e indica o que corrigir.

---

### Edge Cases

- Exclusão e arquivar coexistem: excluir tira a conta da operação; arquivar continua ocultando com opção de reexibir. Excluir uma conta arquivada também a remove (não reaparece no filtro de arquivadas).
- Exclusão em massa (“Deletar Todas”) permanece **fora** desta feature; só exclusão **por linha**.
- Conta já recebida (paga) ou com NF: a exclusão é permitida após confirmação (não é bloqueada). Totais e visões de Contas a Receber deixam de considerar o registro; lançamentos de caixa já feitos **não** são desfeitos nem alterados.
- Visualizador: vê os novos nomes e os campos Maggo; não exclui nem edita.
- Tipo vazio ou dado legado que não seja um dos três: o usuário identifica a ausência (vazio ou “—”); o sistema não inventa um tipo.
- Maggo envia classificação antiga (abertura/fechamento/sucesso antigo) em conta **nova**: o Ocean continua convertendo na entrada para **Retainer**, **Sucesso** ou **Parcela** (Parcelamento → Parcela).
- Maggo envia atualização de um fechamento **já excluído**: o registro **não** volta à listagem.
- Maggo envia de novo um fechamento **já existente** no Ocean: os campos Maggo no Ocean **não** mudam (editados ou não). Maggo **não** cria um segundo registro para o mesmo fechamento.
- Maggo envia um fechamento **novo** (ainda não existente no Ocean e não excluído): o Ocean cria o registro com os campos Maggo da fonte, convertendo o tipo na entrada se vier no formato antigo.
- Origem da conta permanece **Maggo** mesmo depois de editar campos Maggo no Ocean (não vira “Manual”).
- Status continua derivado de vencimento e pagamento; o administrador não escolhe status à mão.
- Falha ao salvar edição Maggo: feedback claro; a listagem não mostra o valor novo como se tivesse gravado.
- Papéis admin / visualizador, NF opcional, Caixa se Recebido, colaboradores e unicidade de NF **não** mudam nesta feature, salvo a posse de edição dos campos Maggo e a exclusão por linha.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Na página **Contas a Receber**, o sistema MUST oferecer ao administrador uma ação de **excluir** por linha, distinta de arquivar, com confirmação antes de efetivar.
- **FR-002**: Após exclusão confirmada com sucesso, o registro MUST desaparecer da listagem (incluindo filtro de arquivadas) e MUST NOT reaparecer após recarregar. MUST NOT reaparecer se a Maggo reenviar o mesmo fechamento. O sistema MUST permitir excluir contas **Pendente** ou **Recebida**, com ou sem NF. MUST NOT bloquear a exclusão por status de pagamento ou existência de NF. MUST NOT desfazer, alterar nem apagar lançamentos de caixa já feitos em razão dessa exclusão.
- **FR-003**: Usuários com papel **visualizador** MUST NOT excluir linhas nem editar campos Maggo.
- **FR-004**: O sistema MUST NOT reintroduzir exclusão em massa (“Deletar Todas”) nem importação em lote nesta feature. Arquivar/desarquivar MUST permanecer disponível.
- **FR-005**: Na página Contas a Receber, o sistema MUST usar o rótulo **Tipo** no lugar de **Método de pagamento** (listagem, criação, edição e exportação dessa página).
- **FR-006**: O sistema MUST exibir e permitir selecionar exatamente três tipos, com os nomes **Retainer**, **Parcela** e **Sucesso**. MUST NOT exibir **Parcelamento** nem **Método de pagamento** nessa página.
- **FR-007**: O sistema MUST tratar **Parcela** como o novo nome oficial do grupo que hoje se chama **Parcelamento**. Contas já cadastradas como Parcelamento MUST passar a **Parcela** automaticamente, sem recadastro.
- **FR-008**: O sistema MUST usar **Parcela** (não Parcelamento) em **Dashboard**, **Relatórios**, **DH**, **Calendário** e e-mails **novos** que mencionem o tipo. E-mails já enviados e auditoria já gravada MUST NOT ser reescritos.
- **FR-009**: Em registro de origem **Maggo**, o administrador MUST poder editar no Ocean: **vaga**, **empresa**, **tipo**, **valor bruto**, **imposto**, **valor líquido** e **data ent. pgto**.
- **FR-010**: Edições dos campos Maggo MUST persistir somente no Ocean. O sistema MUST NOT enviar essas alterações para a Maggo.
- **FR-011**: Quando a Maggo enviar um fechamento que **já existe** no Ocean, o sistema MUST NOT atualizar os campos Maggo (vaga, empresa, tipo, valor bruto, imposto, valor líquido, data ent. pgto), tenham ou não sido editados localmente. MUST NOT apagar campos Ocean (NF, emissão, vencimento, pagamento, Caixa, colaboradores, arquivamento). Maggo MUST continuar podendo criar apenas **fechamentos novos** (ainda inexistentes e não excluídos).
- **FR-012**: Na criação e na edição, o sistema MUST continuar exigindo, quando já exigidos hoje: empresa, tipo, valor bruto e valor líquido (e Caixa/data de pagamento se Recebido; emissão se houver número de NF).
- **FR-013**: A origem **Manual** / **Maggo** MUST permanecer visível e correta após editar campos Maggo ou excluir outras linhas.
- **FR-014**: Regras já vigentes de NF opcional, status derivado, papéis, colaboradores e unicidade de NF MUST permanecer, salvo o que esta spec altera (exclusão por linha, rótulo/opções de tipo e editabilidade dos campos Maggo).

### Key Entities

- **Conta a Receber**: Registro de valor a receber na listagem, de origem Manual ou Maggo, passível de exclusão por linha pelo administrador.
- **Tipo**: Classificação oficial gravada em um de três valores: **Retainer**, **Parcela** ou **Sucesso**. **Parcela** substitui o nome **Parcelamento**. O rótulo de tela em Contas a Receber é **Tipo** (não “Método de pagamento”).
- **Campos Maggo**: Vaga, empresa, tipo, valor bruto, imposto, valor líquido e data ent. pgto. Editáveis no Ocean também em origem Maggo. A Maggo não recebe essas edições e, em conta já existente, também não as sobrescreve.
- **Exclusão de linha**: Remoção operacional de uma conta no Ocean, com confirmação. Distinta de arquivar. Impede reaparecimento pelo mesmo fechamento Maggo. Permitida em contas Pendente ou Recebida; não desfaz lançamentos de caixa.
- **Usuário**: Admin (exclui, edita tipo e campos Maggo) ou visualizador (somente leitura).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrador exclui uma linha (manual ou Maggo) em menos de 30 segundos, incluindo a confirmação, e a linha não reaparece após recarregar.
- **SC-002**: Em 100% das tentativas, visualizador não consegue excluir linha nem alterar campos Maggo.
- **SC-003**: Em 100% das inspeções da página Contas a Receber (lista, criação, edição, exportação), o rótulo **Método de pagamento** não aparece; o campo/coluna correspondente se chama **Tipo**.
- **SC-004**: Em 100% das inspeções de Contas a Receber, Dashboard, Relatórios, DH e Calendário, os únicos nomes de tipo visíveis são **Retainer**, **Parcela** e **Sucesso**; **Parcelamento** não aparece.
- **SC-005**: Em 100% dos registros de teste que hoje são Parcelamento, após a mudança o tipo oficial visível e gravado é **Parcela**, sem recadastro.
- **SC-006**: Administrador altera um campo Maggo (ex.: valor bruto ou tipo) de uma conta Maggo e, após recarregar, vê o valor novo em menos de 1 minuto na primeira tentativa com dados válidos.
- **SC-007**: Em 100% dos testes, a edição de campo Maggo no Ocean não altera o correspondente na Maggo. Em 100% dos testes em que a Maggo reenvia um fechamento já existente, **todos** os campos Maggo no Ocean permanecem iguais (inclusive os nunca editados).
- **SC-008**: Em 100% dos testes, um fechamento Maggo correspondente a uma conta já excluída não volta à listagem.
- **SC-009**: Em 100% dos testes de exclusão de conta já Recebida, a linha some das visões de Contas a Receber e os lançamentos de caixa existentes permanecem iguais (mesmo valor, data e conta).

## Assumptions

- A exclusão pedida é **por linha**, no mesmo espírito das outras telas financeiras do produto (ex.: Contas a Pagar): confirmação e retirada da lista. Não é exclusão em massa. Contas Recebidas (com ou sem NF) também podem ser excluídas; o caixa já lançado não é mexido.
- Arquivar permanece; excluir não substitui arquivar — atende quem precisa **remover**, não só ocultar.
- Contas Maggo excluídas no Ocean **não** devem voltar na próxima entrada da Maggo (senão a exclusão não teria efeito).
- **Parcela** é só o novo nome de **Parcelamento**; o mapeamento de negócio da spec 017 permanece (abertura → Retainer, fechamento → Sucesso, sucesso antigo → o grupo que agora se chama Parcela).
- O rótulo **Tipo** vale na página Contas a Receber; nas outras telas o campo já é tratado como tipo/tipo de fechamento e só troca **Parcelamento** → **Parcela**.
- “Sem necessariamente mudar na Maggo” significa: **nunca** escrever de volta na Maggo. Correção é só no Ocean.
- Depois que o fechamento já existe no Ocean, a Maggo **não** atualiza mais os campos Maggo. Só entra conta **nova**. Valores no Ocean (editados ou não) permanecem.
- Papéis admin / visualizador, NF opcional, Caixa se Recebido e status derivado permanecem.
- E-mails novos e telas que mostram o tipo acompanham **Parcela**; histórico de e-mail e auditoria já gravados não é reescrito.

## Out of Scope

- Exclusão em massa (“Deletar Todas”), importação em lote e pasta/gerenciador de arquivos de NFs.
- Enviar alterações do Ocean para a Maggo (escrita na fonte externa).
- Atualizar campos Maggo de contas já existentes a partir de reenvios da fonte (a Maggo só cria fechamentos novos).
- Criar um quarto tipo ou fundir Retainer/Sucesso/Parcela.
- Tornar o status um campo escolhido à mão.
- Recalcular valor líquido a partir de bruto e imposto.
- Restaurar (lixeira) de contas excluídas nesta entrega.
- Desfazer, estornar ou apagar lançamentos de caixa ao excluir uma conta a receber.
- Reescrever e-mails já enviados ou registros de auditoria já gravados.
- Alterar o contrato da Maggo para ela enviar o nome “Parcela”; a conversão na entrada cobre o formato antigo e o nome Parcelamento.
