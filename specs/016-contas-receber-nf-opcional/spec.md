# Feature Specification: Contas a Receber — NF opcional

**Feature Branch**: `016-contas-receber-nf-opcional`

**Created**: 2026-08-12

**Status**: Draft

**Input**: User description: "tela de contas a receber - NF não deve ser obrigatória"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar conta a receber sem número de NF (Priority: P1)

Administrador, na página **Contas a Receber**, abre **“Nova conta a receber”**, preenche os demais dados obrigatórios (cliente, valores, datas, tipo e pagamento) e **deixa o campo NF em branco**. O sistema aceita o cadastro. A receita passa a constar na listagem mesmo sem número de nota.

**Why this priority**: Hoje o cadastro é recusado sem NF, o que impede registrar receitas reais que ainda não têm nota (ou nunca terão). É o valor central do pedido.

**Independent Test**: Como admin, criar uma conta a receber com NF vazia e demais campos válidos; confirmar persistência e presença na listagem após recarregar.

**Acceptance Scenarios**:

1. **Given** um administrador no formulário **“Nova conta a receber”** com razão social, valor bruto, valor líquido, data de emissão, data de vencimento, tipo e pagamento válidos, e **NF em branco**, **When** salva, **Then** o registro é persistido e aparece na listagem sem número de NF.
2. **Given** o mesmo formulário com NF em branco e um campo obrigatório **diferente de NF** em branco (ex.: razão social ou valor), **When** tenta salvar, **Then** o sistema impede a gravação e indica o que falta — sem exigir NF.
3. **Given** o formulário com NF preenchida e demais dados válidos, **When** salva, **Then** o cadastro continua sendo aceito (NF permanece permitida, apenas deixa de ser obrigatória).
4. **Given** um visualizador na página, **When** procura criar conta a receber, **Then** a ação continua indisponível (somente leitura).

---

### User Story 2 - Editar conta manual sem exigir NF (Priority: P1)

Administrador abre uma conta a receber de **origem manual** (com ou sem NF) e salva alterações **sem informar número de NF**. O sistema aceita. Também é possível **remover** um número de NF já informado em um registro manual, deixando o campo vazio.

**Why this priority**: Sem a mesma regra na edição, o usuário cadastra sem NF e depois não consegue corrigir ou completar o registro.

**Independent Test**: Editar um registro manual sem NF, alterar outro campo (ex.: valor) e salvar; em seguida, em outro registro manual com NF, limpar o número e salvar.

**Acceptance Scenarios**:

1. **Given** um administrador editando um registro **manual** sem NF, **When** altera um campo de negócio permitido e salva sem preencher NF, **Then** a alteração é persistida e a NF permanece vazia.
2. **Given** um administrador editando um registro **manual** que já possui NF, **When** apaga o número de NF e salva (demais dados válidos), **Then** o registro fica sem NF e a listagem reflete a ausência.
3. **Given** um administrador editando um registro de **origem Maggo**, **When** tenta alterar o número de NF (campo de origem externa), **Then** o sistema impede a alteração desse campo (regra de edição restrita já vigente).
4. **Given** um visualizador, **When** tenta editar qualquer registro, **Then** a ação continua bloqueada.

---

### User Story 3 - Ver contas sem NF na listagem e manter unicidade só quando houver número (Priority: P2)

Usuário autenticado vê, na listagem, contas sem NF de forma clara (campo vazio ou equivalente, sem valor inventado). Várias contas podem coexistir sem NF. Se o administrador **informar** um número, a regra de unicidade já existente continua valendo: não se cadastram duas contas com o mesmo número.

**Why this priority**: Garante operação diária (enxergar o que não tem nota) sem reabrir duplicidade quando o número existe.

**Independent Test**: Criar duas contas manuais sem NF e confirmar ambas na lista; tentar criar uma terceira com um número já usado e confirmar bloqueio.

**Acceptance Scenarios**:

1. **Given** ao menos uma conta sem NF na listagem, **When** o usuário abre Contas a Receber, **Then** identifica a ausência de número (vazio ou “—”), sem número fictício.
2. **Given** já existem duas ou mais contas **sem** NF, **When** o administrador cria outra também sem NF (demais dados válidos), **Then** o cadastro é aceito — ausência de número **não** é tratada como duplicidade.
3. **Given** já existe uma conta com o número “12345”, **When** o administrador tenta criar ou alterar outra para o mesmo número, **Then** o sistema bloqueia e informa a duplicidade, com o atalho já existente para o registro conflitante.
4. **Given** filtros, exportação e totais já existentes no módulo, **When** aplicados, **Then** contas sem NF entram nas mesmas regras (período, status, arquivadas, etc.) que as demais.

---

### Edge Cases

- NF preenchida só com espaços: o sistema trata como **ausente** (equivalente a em branco), não como número válido.
- Várias contas sem NF: permitidas; a unicidade aplica-se **somente** quando há número informado (após trim).
- Conta arquivada sem NF: arquivar/desarquivar continua funcionando; a ausência de número não impede ocultar ou reexibir.
- Pagamento **Recebido** sem NF: NF continua opcional; Caixa e data de pagamento permanecem obrigatórias quando recebido.
- Fonte Maggo envia registro com número: merge e colisão com manuais **que têm o mesmo número** seguem as regras já vigentes; contas manuais **sem** NF não entram nessa comparação por número.
- Falha ao salvar: feedback claro; a listagem não mostra sucesso falso.
- Visualizador: consulta contas com e sem NF; nenhuma criação/edição.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Na página **Contas a Receber**, o campo **NF** (número/identificação da nota) MUST ser **opcional** na criação e na edição de registros de origem manual.
- **FR-002**: O sistema MUST permitir salvar uma conta a receber **sem** NF quando os demais campos obrigatórios estiverem válidos.
- **FR-003**: Os demais campos obrigatórios do cadastro manual MUST permanecer obrigatórios: razão social, valor bruto, valor líquido, data de emissão, data de vencimento, tipo e, se pagamento for **Recebido**, Caixa e data de pagamento.
- **FR-004**: O sistema MUST NOT recusar salvamento apenas pela ausência de NF, nem exibir NF como campo obrigatório na interface (rótulo/indicação de obrigatoriedade).
- **FR-005**: O sistema MUST aceitar NF preenchida quando o administrador quiser informá-la; o campo permanece disponível.
- **FR-006**: Quando NF estiver preenchida (após remover espaços nas extremidades), o sistema MUST manter a validação de **unicidade** já vigente (bloqueio de duplicidade e atalho para o registro existente).
- **FR-007**: Quando NF estiver ausente (vazio ou só espaços), o sistema MUST NOT aplicar regra de duplicidade por número e MUST permitir múltiplas contas sem NF.
- **FR-008**: A listagem MUST exibir contas sem NF de forma explícita (célula vazia ou “—”), sem inventar número.
- **FR-009**: Em registros de **origem Maggo**, o número de NF MUST permanecer somente leitura (enriquecimento Ocean inalterado).
- **FR-010**: Usuários com papel **visualizador** MUST NOT criar nem editar; apenas consultar contas com ou sem NF.
- **FR-011**: Contas sem NF MUST participar de filtros, exportação, arquivamento e regras de Caixa/pagamento já existentes no módulo, quando aplicáveis.
- **FR-012**: O sistema MUST NOT reintroduzir importação em lote, “Deletar Todas”, exclusão individual nem pasta de arquivos de NFs.

### Key Entities

- **Conta a Receber**: Registro de valor a receber, com NF **opcional**, razão social, valores, datas, tipo, pagamento e metadados de negócio do domínio.
- **NF (número)**: Identificação da nota, quando existir. Ausência é um estado válido. Quando presente, continua única entre todas as contas a receber.
- **Origem do registro**: Manual (NF editável e opcional) ou Maggo (NF somente leitura, quando fornecida pela fonte).
- **Usuário**: Admin (criação e escrita permitidas) ou visualizador (somente leitura).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrador conclui o cadastro de uma conta a receber **sem NF** (demais dados válidos) em menos de 2 minutos, na primeira tentativa.
- **SC-002**: Em 100% dos testes com demais campos válidos e NF vazia, o salvamento (criação e edição manual) é aceito e o registro permanece após recarregar a página.
- **SC-003**: Em 100% das inspeções da listagem, contas sem NF aparecem sem número inventado e são distinguíveis das que têm NF.
- **SC-004**: Em 100% das tentativas de gravar um número de NF já existente, o sistema bloqueia a duplicidade; em 100% das tentativas de gravar **sem** número, a ausência não é tratada como conflito.
- **SC-005**: Visualizador não consegue criar nem editar conta (com ou sem NF) em 100% das tentativas.
- **SC-006**: Em inspeção do formulário, o campo NF não é apresentado como obrigatório em 100% dos casos (criação e edição manual).

## Assumptions

- Esta feature **altera apenas a obrigatoriedade da NF** na tela de Contas a Receber; não reabre o desenho do módulo (Maggo, Caixa, origem, papéis).
- Demais obrigatoriedades da inserção manual (spec 012) e a unicidade **quando há número** (spec 013) permanecem.
- Espaços no início/fim do número continuam sendo ignorados (trim); NF só com espaços = sem NF.
- Várias receitas sem nota são um cenário operacional esperado (adiantamento, acordo, nota ainda não emitida).
- Registros Maggo não são recadastrados por esta feature; a opcionalidade aplica-se ao fluxo **manual** na tela.
- Papéis admin / visualizador seguem o produto existente.
- Arquivar continua sendo o meio de ocultar registros; exclusão permanente permanece fora de escopo.

## Out of Scope

- Tornar opcionais outros campos (razão social, valores, datas, tipo).
- Alterar regras de Caixa/pagamento quando a conta está recebida.
- Alterar merge Maggo além do necessário para contas **sem** número não colidirem por NF.
- Reintrodução de importação Excel/CSV, exclusão em massa/individual ou pasta de arquivos de NFs.
- Mudança de papéis ou de permissões do módulo.
