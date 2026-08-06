# Feature Specification: Contas a Receber — Inserção Manual

**Feature Branch**: `012-contas-receber-manual`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "em contas a receber deve ser possível inserir de forma manual uma receita/nota sem ser pela importação"

## Clarifications

### Session 2026-08-06

- Q: Se a Maggo enviar depois o mesmo número/identificação de um registro manual, o que prevalece? → A: Manual prevalece: Maggo com o mesmo número é ignorado no merge; admin pode ser avisado
- Q: Qual o rótulo canônico da ação de criação na interface? → A: Nova conta a receber
- Q: Pode informar pagamento/marcar como recebida já na criação? → A: Sim — pode marcar como recebida / informar data de pagamento na criação; Caixa obrigatória nesse caso
- Q: Quais campos no formulário “Nova conta a receber”? → A: NF; data de emissão; vencimento; pagamento com estados Pendente | Recebido; também razão social, valor bruto, valor líquido e tipo (obrigatórios); Caixa obrigatória se Recebido; posição/candidato/colaboradores fora da criação (só na edição)
- Q: Como mostrar a origem (manual vs Maggo) na interface? → A: Coluna “Origem” na listagem com rótulos “Manual” / “Maggo”

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inserir receita/nota manualmente (Priority: P1)

Administrador, na página **Contas a Receber**, registra uma nova receita/nota preenchendo os dados necessários em um formulário na própria página — sem usar importação em lote (Excel/CSV). Após salvar, o registro passa a constar na listagem como qualquer outra conta a receber.

**Why this priority**: É o valor central do pedido; hoje a página depende da fonte externa (Maggo/stub) e não permite cadastro pontual de receitas que não venham por essa fonte nem por importação.

**Independent Test**: Como admin, abrir Contas a Receber, acionar a criação manual, preencher e salvar; confirmar que o registro aparece na lista sem ter passado por importação.

**Acceptance Scenarios**:

1. **Given** um administrador na página Contas a Receber, **When** aciona **“Nova conta a receber”**, **Then** vê um formulário com: NF, razão social, valor bruto, valor líquido, data de emissão, data de vencimento, tipo, pagamento (**Pendente** | **Recebido**) e Caixa (quando aplicável).
2. **Given** o formulário aberto com dados válidos obrigatórios preenchidos e pagamento **Pendente**, **When** o administrador salva, **Then** o registro é persistido como pendente e aparece na listagem.
3. **Given** o formulário aberto com campo obrigatório em branco ou valor inválido, **When** o administrador tenta salvar, **Then** o sistema impede a gravação e indica o que precisa ser corrigido.
4. **Given** um visualizador na página, **When** procura a ação de inserção manual, **Then** ela não está disponível (somente leitura).
5. **Given** qualquer usuário na página, **When** procura importação Excel/CSV (ou equivalente em lote), **Then** essa funcionalidade continua indisponível — a inserção é apenas unitária/manual.
6. **Given** o formulário de criação com pagamento **Recebido** **sem** Caixa, **When** o administrador tenta salvar, **Then** o sistema impede a gravação e exige corrente ou investimento.
7. **Given** o formulário de criação com pagamento **Recebido**, Caixa válida e data de pagamento, **When** o administrador salva, **Then** o registro nasce já como recebido, com Caixa e data de pagamento persistidos.

---

### User Story 2 - Ver e distinguir registro manual na listagem (Priority: P1)

Após a inserção, o administrador (e o visualizador, em consulta) vê o registro manual na mesma listagem de Contas a Receber, misturado aos registros da fonte externa, com os dados informados no cadastro. O usuário consegue identificar que aquele registro foi criado manualmente no Ocean (origem local), sem confundir com registros vindos da fonte Maggo.

**Why this priority**: Sem visibilidade imediata na lista, o cadastro manual não entrega valor operacional; a distinção de origem evita dúvida sobre o que pode ser alterado depois.

**Independent Test**: Criar um registro manual, recarregar a página e confirmar presença na lista com indicação clara de origem manual.

**Acceptance Scenarios**:

1. **Given** ao menos um registro criado manualmente e registros da fonte externa, **When** o usuário abre a listagem, **Then** ambos os tipos aparecem na mesma visão de Contas a Receber.
2. **Given** um registro manual recém-criado, **When** o usuário recarrega a página, **Then** o registro permanece visível com os mesmos dados salvos.
3. **Given** um registro de origem manual e outro Maggo, **When** o usuário abre a listagem, **Then** a coluna **Origem** exibe **“Manual”** e **“Maggo”** respectivamente, de forma distinguível.
4. **Given** filtros/exportação já existentes no módulo, **When** aplicados, **Then** registros manuais entram nas mesmas regras de filtro/exportação que os demais (salvo restrições já existentes de arquivadas, período, etc.).

---

### User Story 3 - Editar e arquivar receita criada manualmente (Priority: P2)

Administrador corrige ou completa dados de uma receita/nota que ele mesmo cadastrou manualmente (campos de negócio do registro, além do enriquecimento já permitido: Caixa, pagamento, colaboradores, arquivar). Registros provenientes da fonte Maggo continuam com edição restrita ao enriquecimento Ocean, como hoje. Exclusão em massa, exclusão individual e pasta de arquivos de NF não voltam nesta feature; **arquivar** permanece o meio de ocultar.

**Why this priority**: Cadastro sem correção gera retrabalho; restringir edição plena aos manuais preserva a regra de não divergir da fonte Maggo.

**Independent Test**: Abrir um registro manual, alterar um campo de negócio (ex.: valor ou cliente), salvar e ver o valor atualizado; abrir um registro Maggo e confirmar que campos de origem Maggo seguem somente leitura.

**Acceptance Scenarios**:

1. **Given** um administrador editando um registro de **origem manual**, **When** altera campos de negócio permitidos no cadastro e salva, **Then** as alterações são persistidas e refletidas na listagem.
2. **Given** um administrador editando um registro de **origem Maggo**, **When** tenta alterar campos de origem Maggo (ex.: número, valores, cliente), **Then** o sistema impede a alteração desses campos (mantém a allowlist atual de enriquecimento).
3. **Given** um administrador com um registro manual, **When** arquiva o registro, **Then** ele some da lista padrão e pode ser reexibido via desarquivar / filtro de arquivadas.
4. **Given** um visualizador, **When** tenta editar ou arquivar qualquer registro, **Then** a ação é bloqueada.

---

### Edge Cases

- Tentativa de salvar sem NF, sem razão social, sem valores, sem data de emissão, sem vencimento ou sem tipo: gravação bloqueada com feedback claro.
- Número/identificação (NF) já existente na listagem (manual ou Maggo): sistema rejeita duplicidade ou exige correção antes de salvar.
- Fonte Maggo passa a enviar conta com o **mesmo número** de um registro **manual** já existente: o registro manual **prevalece**; o item Maggo duplicado é **ignorado no merge** (não sobrescreve); o administrador pode receber aviso da colisão.
- Pagamento **Pendente** na criação: Caixa pode ficar vazia; data de pagamento não se aplica.
- Pagamento **Recebido** na criação: Caixa (corrente/investimento) e data de pagamento são **obrigatórias**; sem elas, gravação bloqueada.
- Após criação, ao alterar pagamento para **Recebido** na edição, Caixa e data de pagamento continuam obrigatórias conforme regra já vigente.
- Falha ao salvar (indisponibilidade ou erro): feedback claro; lista não mostra sucesso falso.
- Fonte Maggo/stub indisponível: inserção manual e listagem de registros manuais já persistidos no Ocean continuam possíveis; registros Maggo seguem a regra de erro já definida para a fonte externa.
- Visualizador: consulta registros manuais e Maggo; nenhuma criação/edição/arquivamento.
- Tentativa de reabrir importação Excel/CSV, “Deletar Todas”, exclusão individual ou pasta de NFs: permanecem fora desta feature.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir ao administrador **inserir manualmente** uma receita/nota (conta a receber) pela página Contas a Receber, sem depender de importação em lote.
- **FR-002**: O sistema MUST NOT oferecer importação Excel/CSV (nem equivalente em massa) como meio de cadastro nesta feature; a inserção MUST ser unitária via formulário.
- **FR-003**: O formulário **“Nova conta a receber”** MUST incluir os campos: **NF** (número/identificação), **razão social**, **valor bruto**, **valor líquido**, **data de emissão** (da nota), **data de vencimento**, **tipo** (retainer/sucesso) e **pagamento** com exatamente dois estados: **Pendente** ou **Recebido**. Posição, candidato e colaboradores MUST NOT ser exigidos na criação (podem ser informados depois na edição).
- **FR-015**: Se pagamento for **Recebido** na criação (ou na edição), o sistema MUST exigir **Caixa** (corrente ou investimento) e **data de pagamento**; sem esses dados, o salvamento MUST ser recusado. Se pagamento for **Pendente**, Caixa e data de pagamento MAY permanecer vazios.
- **FR-004**: Ao salvar com sucesso, o sistema MUST persistir o registro e exibi-lo na listagem de Contas a Receber na mesma sessão (e após recarregar).
- **FR-005**: O sistema MUST impedir salvamento com dados obrigatórios ausentes ou inválidos e MUST informar o usuário de forma clara.
- **FR-006**: O sistema MUST rejeitar criação (ou atualização de identificação) que gere **duplicidade** de número/identificação já existente entre contas a receber.
- **FR-014**: Se a fonte Maggo enviar um registro cujo número/identificação já exista em uma conta de **origem manual**, o sistema MUST **preservar o registro manual**, **ignorar o item Maggo duplicado no merge** (sem sobrescrever) e MAY avisar o administrador da colisão.
- **FR-007**: A listagem de Contas a Receber MUST exibir a coluna **Origem** com os rótulos canônicos **“Manual”** (criação local) e **“Maggo”** (fonte externa/simulada), de forma distinguível por registro.
- **FR-008**: Usuários com papel **visualizador** MUST NOT criar, editar nem arquivar; apenas consultar.
- **FR-009**: Em registros de **origem manual**, o administrador MUST poder editar os campos de negócio cadastrados, além do enriquecimento já permitido (Caixa, pagamento, colaboradores, arquivar).
- **FR-010**: Em registros de **origem Maggo**, o sistema MUST manter a restrição atual: apenas enriquecimento Ocean editável; campos de origem Maggo somente leitura.
- **FR-011**: O sistema MUST NOT reintroduzir “Deletar Todas”, exclusão individual nem pasta/gerenciador de arquivos de NFs; **arquivar**/desarquivar permanece o mecanismo de ocultação.
- **FR-012**: Registros manuais MUST participar dos filtros, exportação e regras de Caixa/pagamento já existentes no módulo Contas a Receber, quando aplicáveis.
- **FR-013**: A ação de criação na interface MUST usar o rótulo canônico **“Nova conta a receber”** (título do botão/CTA e do formulário/modal alinhados); MUST NOT usar “Nova NF” como nome principal.

### Key Entities

- **Conta a Receber**: Registro de valor a receber, com NF, razão social, valores, data de emissão, vencimento, tipo, pagamento (**Pendente** | **Recebido**), data de pagamento (quando recebido) e metadados de negócio do domínio.
- **Origem do registro**: Indica se a conta veio da **fonte Maggo** (externa/simulada) ou foi **criada manualmente** no Ocean. Em colisão de identificação, origem manual tem prioridade sobre Maggo.
- **Pagamento (estado)**: **Pendente** ou **Recebido** — controla se a conta já foi quitada; quando Recebido, exige Caixa e data de pagamento.
- **Identificação de Caixa**: Corrente ou investimento (ou não definida quando permitido), associada à conta.
- **Usuário**: Admin (criação e escrita permitidas) ou visualizador (somente leitura).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrador conclui o cadastro manual de uma receita/nota válida em menos de 2 minutos, sem usar importação.
- **SC-002**: Em 100% dos testes com dados válidos, o registro manual aparece na listagem imediatamente após salvar e permanece após recarregar a página.
- **SC-003**: Em 100% das inspeções da página, importação Excel/CSV, “Deletar Todas”, exclusão individual e pasta de NFs permanecem ausentes.
- **SC-004**: Em pelo menos 95% das tentativas com dados inválidos ou duplicados, o sistema bloqueia o salvamento e o usuário entende o motivo sem suporte técnico.
- **SC-005**: Visualizador não consegue criar receita manual em 100% das tentativas (ação ausente ou bloqueada).
- **SC-006**: Em inspeção lado a lado, 100% dos registros exibem a coluna **Origem** com “Manual” ou “Maggo” de forma correta e distinguível.

## Assumptions

- A inserção manual cria o mesmo tipo de registro de negócio já tratado como Conta a Receber (evolução do módulo de NFs), não um módulo paralelo.
- Importação em lote permanece **fora** desta feature (confirmado pelo pedido: inserção “sem ser pela importação”).
- A feature **reabre** apenas a criação unitária removida na 007; não reabre importação, exclusão em massa/individual nem pasta de arquivos.
- Campos do formulário de criação: NF, razão social, valor bruto, valor líquido, data de emissão, vencimento, tipo e pagamento (**Pendente** | **Recebido**); Caixa e data de pagamento obrigatórios somente se Recebido; posição/candidato/colaboradores ficam para a edição.
- Registros Maggo continuam vindos da fonte simulada/real conforme o estado atual do produto; manuais coexistem na mesma listagem.
- Regras de Caixa ao receber permanecem válidas para registros manuais, **inclusive na criação** quando pagamento = Recebido.
- A criação pode nascer **Pendente** ou **Recebido**; no segundo caso, Caixa e data de pagamento são obrigatórias no mesmo formulário.
- Papéis admin / visualizador seguem o produto existente.
- A ação de criação usa o rótulo canônico **“Nova conta a receber”** (não “Nova NF”).
- Em colisão de número entre manual e Maggo, o registro **manual prevalece** e o item Maggo duplicado é ignorado no merge (com aviso opcional ao admin).
- Posição, candidato e colaboradores **fora** do formulário de criação nesta entrega.
- A origem é exibida na listagem pela coluna **Origem** com rótulos **“Manual”** e **“Maggo”**.

## Out of Scope

- Reintrodução de importação Excel/CSV ou qualquer cadastro em massa.
- Exclusão em massa (“Deletar Todas”), exclusão individual permanente ou pasta/gerenciador de arquivos de NFs.
- Integração Maggo real (além do que já existir no produto).
- Alterar o modelo de edição restrita dos registros de origem Maggo (exceto coexistência com manuais editáveis).
- Fluxo de anexos/documentos da nota na criação manual (não solicitado).
- Campos posição, candidato e colaboradores no formulário de **criação** (permanecem disponíveis na edição, se já existirem no módulo).
