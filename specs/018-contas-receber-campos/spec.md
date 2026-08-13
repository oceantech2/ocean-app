# Feature Specification: Contas a Receber — Campos Maggo e Ocean

**Feature Branch**: `018-contas-receber-campos`

**Created**: 2026-08-12

**Status**: Draft

**Input**: User description: "em contas a receber tem alguns campos, e deles campos vindo da maggo: vaga, empresa, metodo de pagamento (vai ser o retainer, sucesso...), valor bruto, imposto, valor liquido, data ent. pgto; e depois tem os campos que a ocean vai preencher: Nf e se possível vendo a nota já preencher número dela, data de emissao; depois tem campos que a ocean vai preencher vencimento, pagamento e status"

## Clarifications

### Session 2026-08-12

- Q: Status sem vencimento e sem pagamento? → A: Pendente até haver vencimento ou pagamento; só vira vencida depois que a Ocean lança o vencimento e a data já passou
- Q: Quais campos são obrigatórios no cadastro manual? → A: Obrigatórios só empresa, método de pagamento, valor bruto e valor líquido; vaga, imposto, data ent. pgto, NF, emissão, vencimento e pagamento opcionais na criação
- Q: NF preenchida exige data de emissão? → A: Se informar o número da NF, a data de emissão vira obrigatória; sem número, a emissão continua opcional
- Q: Maggo muda valores depois da NF? → A: Maggo sempre atualiza o grupo Maggo (valores inclusive), mesmo depois da NF; campos Ocean permanecem intactos

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver a conta com campos Maggo separados dos campos Ocean (Priority: P1)

Usuário autenticado abre **Contas a Receber** e distingue dois grupos de dados em cada registro:

**Campos da Maggo** (origem da receita/fechamento):

| Campo                    | Significado |
|--------------------------|-------------|
| Vaga                     | Posição/vaga do fechamento |
| Empresa                  | Cliente/empresa |
| Método de pagamento      | **Retainer**, **Sucesso** ou **Parcelamento** |
| Valor bruto              | Valor bruto |
| Imposto                  | Valor de imposto |
| Valor líquido            | Valor líquido |
| Data ent. pgto           | Data de entrada de pagamento informada pela Maggo |

**Campos da Ocean** (financeiro da nota e da quitação):

| Campo           | Significado |
|-----------------|-------------|
| NF              | Número da nota (opcional até existir) |
| Data de emissão | Data de emissão da nota |
| Vencimento      | Data de vencimento da nota |
| Pagamento       | Data / estado de recebimento (Pendente ou Recebido) |
| Status          | Situação da conta (derivada de vencimento e pagamento) |

Em registro **Maggo**, o primeiro grupo é somente leitura. O segundo grupo é o que o administrador preenche no Ocean. Em registro **manual**, o administrador informa os dois grupos.

**Why this priority**: Sem essa divisão, a tela continua tratando NF, emissão e vencimento como se viessem da Maggo, e não mostra imposto nem data de entrada de pagamento da fonte.

**Independent Test**: Abrir a listagem (e a edição) com ao menos um registro Maggo e um manual; conferir os sete campos Maggo e os cinco campos Ocean; no Maggo, tentar alterar um campo Maggo e confirmar bloqueio.

**Acceptance Scenarios**:

1. **Given** um registro de origem **Maggo**, **When** o usuário abre a listagem ou a edição, **Then** vê vaga, empresa, método de pagamento, valor bruto, imposto, valor líquido e data ent. pgto preenchidos pela fonte, sem poder alterá-los.
2. **Given** o mesmo registro Maggo, **When** o administrador abre a edição, **Then** consegue informar ou alterar NF, data de emissão, vencimento e pagamento; o status reflete vencimento e pagamento.
3. **Given** um registro de origem **manual**, **When** o administrador cria ou edita, **Then** informa tanto os campos do grupo Maggo (equivalentes) quanto os da Ocean; na criação, só empresa, método de pagamento, valor bruto e valor líquido são obrigatórios.
4. **Given** um visualizador, **When** consulta, **Then** vê os dois grupos e não altera nenhum campo.

---

### User Story 2 - Preencher NF, emissão, vencimento, pagamento e status na Ocean (Priority: P1)

A Maggo entrega a receita **sem** ser a fonte da nota fiscal. O administrador, no Ocean, completa o lado financeiro: número da NF (quando houver), data de emissão, vencimento e pagamento. O **status** atualiza sozinho a partir de vencimento e pagamento (pendente, recebido/paga, vencida — mesmos estados já usados no módulo). A NF continua **opcional**: a conta Maggo pode existir na lista antes da nota ser emitida.

**Why this priority**: É o fluxo operacional pedido — Maggo manda o fechamento; a Ocean lança a nota e acompanha vencimento, pagamento e status.

**Independent Test**: Partir de um registro Maggo sem NF; preencher emissão, vencimento e deixar pagamento pendente; conferir status; depois informar pagamento (e Caixa, se Recebido) e conferir status recebido.

**Acceptance Scenarios**:

1. **Given** uma conta Maggo ainda sem NF, **When** o usuário abre a listagem, **Then** a conta aparece com vaga, empresa, valores e data ent. pgto, e NF / emissão / vencimento / pagamento vazios ou não definidos — sem número inventado.
2. **Given** um administrador nessa conta, **When** informa data de emissão e vencimento (com ou sem número de NF) e salva, **Then** os dados persistem; se a Maggo atualizar o fechamento depois, os valores Maggo podem mudar e a NF/emissão/vencimento/pagamento da Ocean **não** são apagados.
3. **Given** pagamento **Pendente** e **sem** vencimento, **When** a conta é exibida, **Then** o status é **pendente** (não vencida).
4. **Given** pagamento **Pendente** e vencimento no futuro, **When** a conta é exibida, **Then** o status é pendente.
5. **Given** pagamento **Pendente** e vencimento já passado, **When** a conta é exibida, **Then** o status é vencida.
6. **Given** o administrador marca pagamento **Recebido** com data de pagamento e Caixa, **When** salva, **Then** o status passa a paga/recebido e permanece após recarregar (com ou sem vencimento).
7. **Given** um visualizador, **When** tenta preencher NF, emissão, vencimento ou pagamento, **Then** a ação é bloqueada.

---

### User Story 3 - Lançar número e data de emissão no mesmo passo, olhando a nota (Priority: P2)

Ao completar o lado da NF, o administrador informa **número** e **data de emissão** **juntos no mesmo passo** (os dois saem da nota). Assim ele consegue olhar a nota e preencher os dois campos de uma vez, sem ir a outra tela só para a emissão. Se, nesse passo, número e/ou emissão **já estiverem conhecidos** (já gravados ou já trazidos para o formulário), o Ocean **mostra os dois preenchidos** para conferência — não pede redigitar o que já existe. Extração automática a partir de arquivo (PDF, XML ou imagem) **não** faz parte desta entrega: o administrador informa os dados da nota; o sistema não “lê” o arquivo.

**Why this priority**: Atende o “vendo a nota já preencher número e emissão” no que é possível sem reabrir pasta de arquivos nem leitura automática de documento.

**Independent Test**: Abrir o preenchimento Ocean de uma conta; confirmar que número da NF e data de emissão estão no mesmo passo; salvar os dois; reabrir e ver os dois já preenchidos.

**Acceptance Scenarios**:

1. **Given** um administrador completando os campos Ocean de uma conta, **When** vai informar a nota, **Then** vê **número da NF** e **data de emissão** no mesmo passo, para preencher os dois olhando a nota.
2. **Given** número e/ou emissão já gravados nessa conta, **When** o administrador reabre a edição, **Then** os campos já vêm preenchidos para conferência, sem redigitar o que já existe.
3. **Given** NF em branco (nota ainda não emitida), **When** salva só com vencimento e/ou pagamento, ou só com emissão, **Then** o salvamento é aceito (NF continua opcional; emissão sem número é permitida).
4. **Given** o administrador informa o **número da NF** sem data de emissão, **When** tenta salvar, **Then** o sistema impede a gravação e exige a data de emissão.
5. **Given** número da NF e data de emissão preenchidos, **When** salva, **Then** os dois persistem e reaparecem na próxima edição.

---

### User Story 4 - Ver imposto e data ent. pgto na listagem (Priority: P2)

A listagem deixa visíveis **imposto** e **data ent. pgto** (Maggo), além de vaga, empresa, método de pagamento, bruto e líquido. Os campos Ocean (NF, emissão, vencimento, pagamento, status) também aparecem, para o financeiro ver o que ainda falta lançar.

**Why this priority**: Sem essas colunas, o usuário não opera o novo modelo no dia a dia.

**Independent Test**: Abrir a listagem com registros Maggo que tenham imposto e data ent. pgto e conferir as colunas; conferir ausência de valor inventado quando o dado não veio.

**Acceptance Scenarios**:

1. **Given** contas Maggo com imposto e data ent. pgto, **When** o usuário abre a listagem, **Then** vê esses valores, junto com vaga, empresa, método de pagamento, bruto e líquido.
2. **Given** uma conta Maggo sem imposto ou sem data ent. pgto, **When** é exibida, **Then** o campo vazio aparece como vazio ou “—”, sem valor inventado.
3. **Given** filtros, exportação e totais já existentes, **When** aplicados, **Then** os novos campos entram na exportação quando a listagem os exibe; totais de bruto/líquido continuam coerentes com as regras já vigentes.
4. **Given** a coluna de método de pagamento, **When** o usuário a consulta, **Then** os únicos nomes são **Retainer**, **Sucesso** e **Parcelamento** (classificação oficial já vigente).

---

### Edge Cases

- Conta Maggo recém-chegada: pode não ter NF, emissão, vencimento nem pagamento; mesmo assim entra na listagem com os campos Maggo.
- Atualização da Maggo no mesmo fechamento: atualiza o grupo Maggo (vaga, empresa, método, bruto, imposto, líquido, data ent. pgto) **mesmo depois** de a Ocean ter lançado a NF; **não** apaga nem altera NF, emissão, vencimento, pagamento, status, Caixa, colaboradores nem arquivamento já gravados na Ocean.
- Identificação da conta Maggo **não** depende do número da NF (a NF pode nascer depois). Cada fechamento Maggo tem identificação própria, estável entre atualizações.
- Colisão de número de NF: se o administrador informar um número já usado em outra conta, vale a unicidade já vigente; contas sem NF continuam podendo coexistir.
- Número de NF sem data de emissão: gravação bloqueada; emissão sem número é permitida.
- Imposto zero ou ausente: zero é valor válido; ausência (não enviado) é vazia/“—”, distinta de zero se a fonte não mandou o campo.
- Valor bruto, imposto e líquido: o Ocean **exibe** os três como vieram da Maggo; não recalcula líquido a partir de bruto − imposto nesta feature.
- Pagamento Recebido: Caixa e data de pagamento continuam obrigatórios (regra já vigente).
- Status: o administrador **não** escolhe o status à mão; ele resulta de vencimento + pagamento. Sem vencimento e sem pagamento → **pendente**; vencida só depois que existe vencimento e a data já passou.
- Registro manual: não há fonte Maggo; o administrador preenche vaga, empresa, método, valores, imposto, data ent. pgto (quando souber) e os campos Ocean. Na **criação**, só **empresa**, **método de pagamento**, **valor bruto** e **valor líquido** são obrigatórios; os demais podem ficar vazios e ser completados depois.
- Visualizador: consulta os dois grupos; nenhuma escrita.
- Fonte Maggo indisponível: registros já no Ocean (incluindo manuais) continuam listáveis conforme regra já vigente; campos Maggo já gravados permanecem.
- Papéis, arquivar, origem Manual/Maggo, NF opcional e nomes dos tipos **não** mudam de regra nesta feature, só a **posse** dos campos (quem preenche o quê).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Na página **Contas a Receber**, o sistema MUST tratar como **campos Maggo** (somente leitura em origem Maggo): **vaga**, **empresa**, **método de pagamento**, **valor bruto**, **imposto**, **valor líquido** e **data ent. pgto**.
- **FR-002**: O sistema MUST tratar como **campos Ocean** (preenchidos pelo administrador em origem Maggo e também no fluxo manual): **NF** (número), **data de emissão**, **vencimento** e **pagamento**. O **status** MUST ser derivado de vencimento e pagamento, sem edição direta.
- **FR-003**: Em registro de origem **Maggo**, o sistema MUST NOT permitir alterar os campos Maggo. MUST permitir ao administrador alterar os campos Ocean listados em FR-002 (exceto status, que é derivado).
- **FR-004**: A Maggo MUST NOT ser a fonte de NF, data de emissão, vencimento, pagamento nem status. Se a fonte enviar esses dados, o Ocean MUST ignorá-los para não sobrescrever o que a Ocean preenche (ou deixar em branco, se ainda não preenchidos).
- **FR-005**: O sistema MUST permitir que uma conta Maggo exista e seja listada **sem** NF, sem data de emissão, sem vencimento e sem pagamento.
- **FR-006**: O campo **NF** MUST permanecer **opcional**. Quando o número estiver preenchido, o sistema MUST exigir **data de emissão**; sem número, a emissão MAY permanecer vazia. Quando o número estiver preenchido, a unicidade já vigente MUST continuar valendo.
- **FR-007**: O sistema MUST exibir o campo **imposto** (grupo Maggo) na listagem e na edição/consulta. Ausência MUST ser visível (vazio ou “—”), sem valor inventado.
- **FR-008**: O sistema MUST exibir **data ent. pgto** (grupo Maggo) de forma distinta da **data de pagamento** Ocean (quando a conta foi de fato recebida).
- **FR-009**: O **método de pagamento** MUST usar exatamente os tipos oficiais **Retainer**, **Sucesso** e **Parcelamento**.
- **FR-010**: Número da NF e data de emissão MUST ser informados **no mesmo passo** (mesmo formulário de campos Ocean), para o administrador preencher os dois olhando a nota. Se já estiverem gravados, MUST reaparecer preenchidos na próxima edição. Se o número da NF estiver preenchido, a data de emissão MUST ser obrigatória. MUST NOT inventar número nem emissão. MUST NOT exigir leitura de arquivo (PDF/XML/imagem) nesta entrega.
- **FR-011**: Atualizações da Maggo MUST identificar a conta por identificador estável da fonte (**não** pelo número da NF) e MUST atualizar o grupo Maggo **sempre** (inclusive bruto, imposto e líquido), mesmo depois de a NF existir. MUST preservar o grupo Ocean e o enriquecimento já existente (Caixa, colaboradores, arquivar). MUST NOT congelar o grupo Maggo por causa da NF.
- **FR-012**: Em registro **manual**, o administrador MUST poder informar os campos dos dois grupos. Na criação, o sistema MUST exigir somente **empresa**, **método de pagamento**, **valor bruto** e **valor líquido**. Vaga, imposto, data ent. pgto, NF, data de emissão, vencimento e pagamento MUST ser opcionais na criação (completos depois na edição, se necessário). Visualizador MUST NOT criar nem editar.
- **FR-013**: Regras já vigentes de **Caixa** (obrigatória se Recebido), **colaboradores**, **arquivar**, **origem** (coluna Manual/Maggo) e papéis admin/visualizador MUST permanecer. Esta feature MUST NOT reintroduzir importação em lote, exclusão em massa/individual nem pasta de arquivos de NFs.
- **FR-014**: A listagem MUST tornar visíveis, no mínimo: vaga, empresa, método de pagamento, valor bruto, imposto, valor líquido, data ent. pgto, NF, data de emissão, vencimento, pagamento e status.
- **FR-015**: Status MUST ser derivado, sem edição direta: **paga/recebido** se houver pagamento; **vencida** somente se não houver pagamento **e** existir vencimento já passado; **pendente** nos demais casos sem pagamento — inclusive **sem vencimento**. Ausência de vencimento MUST NOT ser tratada como vencida.

### Key Entities

- **Conta a Receber**: Receita a receber, com um grupo de dados do fechamento (Maggo ou equivalente manual) e um grupo financeiro da nota (Ocean).
- **Campos Maggo**: Vaga, empresa, método de pagamento (Retainer / Sucesso / Parcelamento), valor bruto, imposto, valor líquido, data ent. pgto. Identificados pela fonte Maggo de forma independente da NF.
- **Campos Ocean**: NF (opcional), data de emissão, vencimento, pagamento; status derivado. Persistidos no Ocean e não sobrescritos pela Maggo.
- **Data ent. pgto**: Data de entrada de pagamento **informada pela Maggo** (previsão/informação da fonte). Não substitui a data de pagamento Ocean.
- **Pagamento Ocean**: Quando a conta foi efetivamente recebida no financeiro (Pendente | Recebido), com data de pagamento e Caixa se Recebido.
- **Usuário**: Admin (preenche campos Ocean; preenche os dois grupos se manual) ou visualizador (somente leitura).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das inspeções de um registro Maggo, os sete campos Maggo estão visíveis e não são editáveis; NF, emissão, vencimento e pagamento são editáveis pelo admin.
- **SC-002**: Administrador completa NF (se houver), emissão, vencimento e pagamento de uma conta Maggo em menos de 2 minutos, na primeira tentativa com dados válidos.
- **SC-003**: Em 100% dos testes, uma nova atualização Maggo do mesmo fechamento (inclusive com NF já lançada) atualiza vaga/empresa/método/valores Maggo e **não** apaga NF, emissão, vencimento nem pagamento já gravados na Ocean.
- **SC-004**: Em 100% das contas Maggo de teste sem nota ainda emitida, a listagem mostra a conta com campos Maggo e NF vazia (sem número inventado).
- **SC-005**: Em 100% das inspeções da listagem, imposto e data ent. pgto aparecem (ou “—” se ausentes), e data ent. pgto não é confundida com a data de pagamento Ocean quando ambas existem.
- **SC-006**: Em 100% dos casos de teste, o status exibido corresponde à regra: paga se houver pagamento; vencida só com vencimento passado e sem pagamento; pendente nos demais casos sem pagamento (incluindo sem vencimento). O admin não consegue gravar um status avulso diferente dessa regra.
- **SC-007**: Visualizador não altera nenhum campo Maggo nem Ocean em 100% das tentativas.
- **SC-008**: Em 100% das inspeções do passo de completar a nota, número da NF e data de emissão estão no mesmo passo; em 100% das reaberturas com esses dados já gravados, os dois vêm preenchidos sem redigitação.

## Assumptions

- **Método de pagamento** é o tipo oficial já definido: Retainer, Sucesso, Parcelamento (spec 017). Só muda o rótulo na tela de Contas a Receber para “método de pagamento”.
- **Empresa** é o cliente da conta (hoje visto como razão social / cliente). **Vaga** é a posição do fechamento (hoje “posição”).
- **Data ent. pgto** (Maggo) ≠ **pagamento** (Ocean): a primeira é informação da fonte; a segunda é a quitação no financeiro.
- **Status** não é combo editável: a Ocean “preenche” status automaticamente. Sem vencimento e sem pagamento = **pendente**; vencida só após a Ocean lançar o vencimento e a data já ter passado.
- Contas Maggo passam a nascer **sem** NF/emissão/vencimento; o administrador lança esses dados depois. Valores antigos já gravados nesses campos em registros Maggo existentes **permanecem** e passam a ser tratados como dados Ocean (a Maggo deixa de atualizá-los).
- A Maggo identifica cada fechamento com um identificador estável próprio; o número da NF deixa de ser a chave para reconhecer o mesmo registro Maggo. Atualizações da fonte **continuam** refletindo no grupo Maggo depois da NF (valores inclusive); o grupo Ocean não é sobrescrito.
- **Imposto** é um valor enviado pela Maggo (ou informado no cadastro manual). O Ocean não calcula imposto nesta feature.
- NF continua opcional (spec 016). Unicidade só quando há número (spec 013). Se houver número, a **data de emissão é obrigatória**; emissão sem número permanece permitida.
- Caixa, colaboradores, arquivar, origem Manual/Maggo e papéis admin/visualizador **permanecem**.
- “Vendo a nota já preencher” nesta entrega = número e data de emissão no **mesmo passo**, para o administrador olhar a nota e informar os dois; dados já gravados reaparecem preenchidos. **Não** inclui ler PDF/XML/imagem nem reabrir a pasta de arquivos de NFs.
- Cadastro manual: o administrador preenche os equivalentes Maggo (não há fonte) e os campos Ocean. Obrigatórios na criação: **empresa**, **método de pagamento**, **valor bruto** e **valor líquido**. Demais campos opcionais (mesmo ciclo das contas Maggo: receita primeiro, nota depois).
- Integração Maggo real continua fora de escopo; o stub/fonte simulada (ou o contrato já usado) deve passar a fornecer o grupo Maggo desta spec, **sem** ser autoridade de NF/emissão/vencimento.

## Out of Scope

- Extração automática de número/emissão a partir de PDF, XML, foto ou OCR.
- Reabrir pasta/gerenciador de arquivos de NFs, importação em lote ou exclusão em massa/individual.
- Tornar o status um campo escolhido manualmente (combo independente de vencimento/pagamento).
- Recalcular valor líquido a partir de bruto e imposto.
- Mudar nomes oficiais dos tipos (Retainer / Sucesso / Parcelamento) ou o mapeamento da spec 017.
- Mudar regras de Caixa, colaboradores, arquivar, papéis ou NF opcional (exceto a posse: NF passa a ser campo Ocean).
- Integração Maggo de produção além do ajuste do contrato/stub para os novos campos Maggo.
