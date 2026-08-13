# Feature Specification: Contas a Pagar — Vincular nota fiscal por item

**Feature Branch**: `029-contas-nf-vinculo`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "em contas a pagar deve remover a pasta de comprovantes e então deve ser possível por item vincular o arquivo em pdf ou jpeg da nota fiscal"

## Clarifications

### Session 2026-08-13

- Q: O que acontece com os arquivos já enviados na pasta compartilhada de comprovantes? → A: A pasta some do produto (ninguém mais lista, envia ou baixa por esse caminho). Os arquivos soltos antigos ficam sem acesso na aplicação, sem exclusão em massa e sem vínculo automático a contas.
- Q: O que fazer com anexo antigo do item que não seja PDF/JPEG, e quais formatos novos aceitar? → A: Arquivo já vinculado ao item permanece visível e baixável. Novos envios (vínculo ou substituição) aceitam PDF, JPEG e PNG.
- Q: Onde o administrador vincula o arquivo da nota fiscal? → A: Nos dois caminhos: na listagem (linha do item) e no formulário de criar/editar conta.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Remover a pasta compartilhada de comprovantes (Priority: P1)

O administrador (e o visualizador) abre **Contas a Pagar** e **não** encontra mais o acesso à pasta/biblioteca compartilhada de comprovantes. Arquivos deixam de ser gerenciados em lote, desvinculados das contas.

**Why this priority**: É o primeiro passo explícito do pedido. Enquanto a pasta existir, o fluxo concorrente (arquivos soltos) compete com o vínculo por item e gera ambiguidade operacional.

**Independent Test**: Abrir Contas a Pagar e confirmar que o botão/modal da pasta de comprovantes não aparece; demais ações da página (listagem, filtros, nova conta) continuam disponíveis.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado na página Contas a Pagar, **When** visualiza as ações do cabeçalho, **Then** não há controle para abrir a pasta/biblioteca de comprovantes.
2. **Given** um administrador que antes usava a pasta para enviar arquivos soltos, **When** tenta o mesmo caminho na página, **Then** essa ação não está mais disponível nesta tela.
3. **Given** um visualizador na página, **When** consulta a tela, **Then** também não vê a pasta de comprovantes.
4. **Given** arquivos que existiam só na pasta compartilhada, **When** qualquer usuário autenticado tenta listá-los, enviá-los ou baixá-los pelo produto, **Then** esse caminho não existe mais; os arquivos não são apagados em massa nem associados a contas.

---

### User Story 2 - Vincular PDF, JPEG ou PNG da nota fiscal em cada conta (Priority: P1)

O administrador vincula um arquivo da **nota fiscal** nos formatos **PDF**, **JPEG** ou **PNG** em **cada conta**, de dois jeitos: na **listagem** (linha do item) e no **formulário** de criar ou editar. O vínculo vale para conta pendente, vencida ou paga. Depois, o item mostra que há arquivo e qualquer usuário autenticado pode abri-lo ou baixá-lo.

**Why this priority**: É o valor de negócio: a NF fica associada à despesa certa, não a uma pasta genérica.

**Independent Test**: Anexar PDF na linha de um item sem arquivo; anexar JPEG ao criar uma conta nova no formulário; anexar PNG ao editar outra conta; em todos os casos o arquivo aparece na listagem e pode ser aberto/baixado.

**Acceptance Scenarios**:

1. **Given** um administrador na listagem, **When** aciona vincular nota fiscal em um item sem arquivo (independente de estar pago ou não), **Then** pode escolher um arquivo PDF, JPEG ou PNG e, após o envio, o item passa a exibir o vínculo.
2. **Given** um administrador no formulário **Nova conta a pagar**, **When** escolhe um PDF, JPEG ou PNG válido e salva a conta, **Then** a conta nasce já com a nota fiscal vinculada.
3. **Given** um administrador no formulário de **editar** uma conta, **When** vincula, substitui ou remove o arquivo e salva (ou confirma a remoção), **Then** a listagem reflete o arquivo vigente daquele item.
4. **Given** um administrador selecionando arquivo (lista ou formulário), **When** escolhe um PDF, JPEG ou PNG válido, **Then** o sistema aceita e persiste o vínculo naquela conta.
5. **Given** um usuário autenticado e um item com nota fiscal vinculada, **When** aciona o arquivo, **Then** consegue visualizar ou baixar o arquivo correspondente.
6. **Given** um visualizador, **When** consulta a listagem ou o detalhe permitido, **Then** vê quais itens têm nota fiscal e pode abrir/baixar, mas **não** consegue vincular, substituir nem remover o arquivo.
7. **Given** um administrador criando ou editando uma conta, **When** salva sem arquivo de nota fiscal, **Then** a conta é gravada normalmente (vínculo opcional).

---

### User Story 3 - Substituir ou remover a nota fiscal do item (Priority: P2)

O administrador corrige um vínculo na **listagem** ou no **formulário de edição**: troca o arquivo da nota fiscal de um item ou remove o vínculo quando o arquivo foi anexado por engano. O visualizador permanece somente leitura.

**Why this priority**: Sem correção, um arquivo errado fica preso à despesa e o retrabalho operacional aumenta.

**Independent Test**: Em um item já com arquivo, substituir por outro PDF, JPEG ou PNG válido pela listagem e conferir que o novo é o que abre; repetir a substituição pelo formulário de edição; em seguida remover o vínculo e conferir que o item volta a permitir anexar.

**Acceptance Scenarios**:

1. **Given** um item com nota fiscal já vinculada, **When** o administrador envia outro PDF, JPEG ou PNG válido, **Then** o vínculo passa a ser o novo arquivo e o anterior deixa de ser o arquivo daquele item.
2. **Given** um item com nota fiscal vinculada, **When** o administrador remove o vínculo (após confirmação), **Then** o item fica sem arquivo e volta a permitir vincular um novo.
3. **Given** um visualizador, **When** tenta substituir ou remover o arquivo de um item, **Then** a ação não está disponível.
4. **Given** um item com anexo antigo em formato não aceito para novos envios, **When** um usuário autenticado aciona o arquivo, **Then** ainda consegue abrir ou baixar; um novo envio só aceita PDF, JPEG ou PNG.

---

### Edge Cases

- Arquivo em formato diferente de PDF, JPEG ou PNG (incluindo WebP, planilha ou documento de texto): o sistema recusa o vínculo e informa quais formatos são aceitos.
- Arquivo JPEG com extensão `.jpg` ou `.jpeg`: ambos são aceitos.
- Item que já tinha anexo em formato antigo não aceito para novos envios (ex.: WebP): o arquivo permanece visível e baixável até o administrador substituir ou remover.
- Arquivo vazio, corrompido ou acima do limite de tamanho razoável para documento fiscal digital: o sistema recusa e informa o problema, sem alterar o vínculo anterior (se houver).
- Conta sem nota fiscal: a listagem permanece utilizável; o item indica ausência de arquivo de forma discreta e o administrador pode anexar a qualquer momento.
- Exclusão da conta: o vínculo daquele item deixa de existir para o usuário (não permanece “solto” na página).
- Tentativa de vincular dois arquivos ao mesmo item: não há lista de múltiplos arquivos; o item tem no máximo **um** arquivo vigente (novo envio na lista ou no formulário substitui).
- Arquivos que existiam só na pasta compartilhada: não aparecem na listagem de contas, não são baixáveis pelo produto e não são apagados em massa nesta entrega.
- Formulário de criação: o arquivo escolhido só fica vinculado se a conta for salva com sucesso; cancelar o formulário não deixa arquivo órfão visível no produto.
- Formulário de criação ou edição com arquivo inválido: o sistema recusa o arquivo e informa os formatos aceitos; a conta pode ser salva sem o arquivo (vínculo continua opcional).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O produto MUST deixar de oferecer a pasta/biblioteca compartilhada de comprovantes: nenhum usuário autenticado lista, envia, baixa ou exclui arquivos por esse caminho.
- **FR-002**: O administrador MUST poder vincular, em cada conta a pagar, um arquivo da nota fiscal nos formatos PDF, JPEG ou PNG, tanto na **listagem** quanto no **formulário** de criar ou editar.
- **FR-003**: O vínculo MUST estar disponível por item independentemente do status da conta (pendente, vencida ou paga).
- **FR-004**: Cada conta a pagar MUST ter no máximo um arquivo de nota fiscal vigente.
- **FR-005**: O sistema MUST recusar novos envios que não sejam PDF, JPEG ou PNG e informar o motivo de forma compreensível.
- **FR-006**: Usuários autenticados MUST poder abrir ou baixar a nota fiscal vinculada ao item.
- **FR-007**: O visualizador MUST consultar e abrir/baixar a nota fiscal, sem permissão para vincular, substituir ou remover.
- **FR-008**: O administrador MUST poder substituir o arquivo vigente de um item por outro PDF, JPEG ou PNG válido, na listagem ou no formulário de edição.
- **FR-009**: O administrador MUST poder remover o vínculo da nota fiscal de um item, com confirmação antes da remoção, na listagem ou no formulário de edição.
- **FR-010**: Vincular nota fiscal MUST ser opcional: criar, editar, pagar ou filtrar contas não exige arquivo.
- **FR-011**: A listagem MUST indicar, por item, se há nota fiscal vinculada (incluindo identificação visível do arquivo, quando houver).
- **FR-012**: Arquivos que existiam apenas na pasta compartilhada MUST permanecer sem vínculo automático a contas, **sem exclusão em massa** nesta entrega, e MUST ficar inacessíveis pela aplicação.
- **FR-013**: Arquivo já vinculado a um item MUST permanecer visível e baixável mesmo que o formato não esteja na lista aceita para novos envios.
- **FR-014**: No formulário de **nova** conta, se o administrador escolher um arquivo válido, o sistema MUST persistir o vínculo junto com a criação da conta; se o formulário for cancelado, MUST NOT restar vínculo visível no produto.

### Key Entities

- **Conta a pagar**: lançamento de despesa na página Contas a Pagar; pode ter no máximo um arquivo de nota fiscal vinculado.
- **Arquivo de nota fiscal**: documento PDF, JPEG ou PNG associado a uma única conta a pagar; substituível e removível pelo administrador. Anexos antigos de outros formatos, se já existirem no item, permanecem acessíveis até substituição ou remoção.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em até 1 minuto, um administrador conclui o vínculo de um PDF, JPEG ou PNG válido pela listagem **ou** pelo formulário, sem usar pasta compartilhada.
- **SC-002**: 100% das contas a pagar permitem o mesmo fluxo de vínculo de nota fiscal, independentemente de estarem pagas ou não.
- **SC-003**: 100% das tentativas de **novo envio** com formato diferente de PDF, JPEG ou PNG são recusadas com mensagem clara, sem gravar o arquivo no item nem alterar o vínculo anterior.
- **SC-004**: Após a mudança, nenhum usuário autenticado consegue listar, enviar ou baixar arquivos pela pasta compartilhada de comprovantes em qualquer ponto do produto.
- **SC-005**: Visualizadores conseguem abrir a nota fiscal de um item já vinculado na primeira tentativa, sem ações de escrita.
- **SC-006**: Substituir ou remover o arquivo de um item (pela listagem ou pelo formulário) é concluído em no máximo 3 ações do administrador (escolha do item + confirmação/envio).

## Assumptions

- O pedido refere-se exclusivamente à página **Contas a Pagar**; Contas a Receber, NFs e demais módulos não mudam neste escopo.
- “JPEG” inclui as extensões comuns `.jpg` e `.jpeg`. PNG é formato aceito para novos envios, além de PDF e JPEG.
- “Vincular” significa enviar o arquivo a partir do dispositivo do usuário para aquele item, pela listagem ou pelo formulário de criar/editar (não escolher de uma biblioteca compartilhada, que deixa de existir nesta tela).
- O anexo por item que hoje existe só para contas **pagas** (rótulo de comprovante) passa a ser o vínculo da **nota fiscal**, disponível em qualquer status. Novos envios: PDF, JPEG ou PNG. Anexos antigos de outros formatos permanecem acessíveis no item.
- Não há migração automática dos arquivos da pasta compartilhada para contas: não há regra confiável de correspondência item a item. Esta entrega não apaga em massa esses arquivos; eles apenas deixam de ser acessíveis no produto.
- Papéis seguem o produto: `admin` escreve; `visualizador` somente lê.
- Limite de tamanho segue prática razoável para documento fiscal digital; o valor exato é decisão de implementação, desde que o usuário receba feedback claro em recusa.
- Confirmação em exclusão do vínculo segue o padrão já usado no produto para exclusões.
