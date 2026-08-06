# Feature Specification: Contas a Pagar — Input Manual de Valores

**Feature Branch**: `014-contas-pagar-manual`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "em contas a pagar, Input manual para inserir valores"

## Clarifications

### Session 2026-08-06

- Q: Como o administrador deve digitar o valor no formulário de criação/edição? → A: Campo com máscara monetária brasileira durante a digitação (ex.: R$ 1.234,56)
- Q: Depois que a conta já está marcada como paga, o administrador ainda pode alterar o valor? → A: Sim: valor pode ser editado mesmo com a conta paga
- Q: Qual deve ser o rótulo canônico do botão/formulário de criação? → A: “Nova conta a pagar” (alinhado ao padrão de Contas a Receber)
- Q: Na criação, como o administrador indica se a conta já nasce paga? → A: Só data de pagamento opcional (preenchida = paga; vazia = pendente)
- Q: Na edição, o administrador pode limpar a data de pagamento e devolver a conta ao status pendente? → A: Sim: limpar a data de pagamento torna a conta pendente de novo

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inserir conta a pagar com valor digitado (Priority: P1)

Administrador, na página **Contas a Pagar**, registra uma nova despesa digitando os dados necessários — em especial o **valor** monetário — em um formulário na própria página, sem depender de importação em lote. Após salvar, o registro passa a constar na listagem com o valor informado.

**Why this priority**: É o valor central do pedido: garantir entrada unitária e explícita de valores em Contas a Pagar, de forma operacional e imediata.

**Independent Test**: Como admin, abrir Contas a Pagar, acionar a criação manual, preencher descrição, categoria, valor e vencimento, salvar; confirmar que o registro aparece na lista com o valor correto, sem ter passado por importação.

**Acceptance Scenarios**:

1. **Given** um administrador na página Contas a Pagar, **When** aciona **“Nova conta a pagar”**, **Then** vê um formulário com: descrição, Categorias (e subcategoria de RH quando aplicável), **valor** (campo com máscara monetária brasileira), data de vencimento e, opcionalmente, data de pagamento.
2. **Given** o formulário aberto com dados válidos obrigatórios (descrição, categoria válida, valor positivo via máscara e data de vencimento), **When** o administrador salva, **Then** o registro é persistido e aparece na listagem com o valor informado.
3. **Given** o formulário aberto com valor em branco, zero, negativo ou inválido, **When** o administrador tenta salvar, **Then** o sistema impede a gravação e indica que o valor é inválido.
4. **Given** o formulário com campo obrigatório em branco (descrição, categoria ou vencimento), **When** o administrador tenta salvar, **Then** o sistema impede a gravação e indica o que precisa ser corrigido.
5. **Given** um visualizador na página, **When** procura a ação de inserção manual, **Then** ela não está disponível (somente leitura).
6. **Given** o formulário com data de pagamento preenchida (sem seletor Pendente|Pago), **When** o administrador salva, **Then** o registro nasce já como **pago**, com a data de pagamento persistida.
7. **Given** o formulário sem data de pagamento, **When** o administrador salva com demais dados válidos, **Then** o registro nasce como **pendente**.

---

### User Story 2 - Ver o valor na listagem e consultar (Priority: P1)

Após a inserção, o administrador (e o visualizador, em consulta) vê a conta na listagem de Contas a Pagar com o **valor** e demais dados informados no cadastro, misturada às contas já existentes (incluindo as vindas de importação, se houver).

**Why this priority**: Sem visibilidade imediata do valor na lista, o cadastro manual não entrega valor operacional.

**Independent Test**: Criar uma conta com valor conhecido, recarregar a página e confirmar presença na lista com o mesmo valor formatado de forma legível (moeda brasileira).

**Acceptance Scenarios**:

1. **Given** ao menos uma conta criada manualmente, **When** o usuário abre a listagem, **Then** a conta aparece com descrição, valor, vencimento e status corretos.
2. **Given** uma conta recém-criada, **When** o usuário recarrega a página, **Then** o registro permanece visível com o mesmo valor salvo.
3. **Given** filtros/exportação já existentes no módulo, **When** aplicados, **Then** contas criadas manualmente entram nas mesmas regras de filtro/exportação que as demais.

---

### User Story 3 - Corrigir valor e demais dados na edição (Priority: P2)

Administrador corrige o **valor** ou outros campos de uma conta a pagar já cadastrada (descrição, categoria, vencimento, pagamento), **inclusive quando a conta já estiver paga**. Exclusão em massa permanece indisponível (conforme regra já vigente); exclusão individual e demais ações existentes na página permanecem conforme o produto atual.

**Why this priority**: Cadastro sem correção de valor gera retrabalho e inconsistência financeira.

**Independent Test**: Abrir uma conta existente, alterar o valor, salvar e ver o valor atualizado na listagem; visualizador não consegue editar.

**Acceptance Scenarios**:

1. **Given** um administrador editando uma conta a pagar (pendente ou paga), **When** altera o valor (ou outros campos permitidos) e salva, **Then** as alterações são persistidas e refletidas na listagem.
2. **Given** um administrador editando com valor inválido (vazio, zero, negativo ou inválido na máscara), **When** tenta salvar, **Then** o sistema bloqueia e informa o problema.
3. **Given** um visualizador, **When** tenta editar qualquer conta, **Then** a ação é bloqueada ou ausente.
4. **Given** um administrador editando uma conta **já paga**, **When** altera apenas o valor e salva, **Then** o novo valor é persistido e o status continua pago (sem exigir reabrir o pagamento).
5. **Given** um administrador editando uma conta paga, **When** limpa a data de pagamento e salva, **Then** a conta volta ao status **pendente**.

---

### Edge Cases

- Tentativa de salvar sem descrição, sem categoria, sem valor ou sem vencimento: gravação bloqueada com feedback claro.
- Valor zero, negativo ou inválido (incluindo entrada que a máscara não consiga interpretar como montante positivo): gravação bloqueada.
- No formulário, o campo valor usa máscara monetária brasileira durante a digitação (ex.: R$ 1.234,56); na listagem o valor permanece formatado em moeda brasileira.
- Categoria Recursos Humanos sem subcategoria: gravação bloqueada (regra já vigente da taxonomia).
- Data de pagamento informada na criação: conta nasce como paga; sem data de pagamento, nasce pendente (sem seletor Pendente|Pago).
- Após criação, ao marcar como paga na listagem ou na edição, data de pagamento permanece obrigatória conforme regra já vigente do módulo.
- Conta já paga: administrador pode alterar o valor (e demais campos editáveis) sem precisar desmarcar o pagamento; o status permanece pago enquanto a data de pagamento estiver preenchida.
- Na edição, limpar a data de pagamento e salvar: a conta volta a **pendente**.
- Falha ao salvar (indisponibilidade ou erro): feedback claro; lista não mostra sucesso falso.
- Visualizador: consulta contas e valores; nenhuma criação/edição/exclusão.
- Importação CSV/Excel permanece disponível como caminho alternativo; esta feature não a remove nem a substitui — o foco é o input unitário de valores.
- Exclusão em massa (“Deletar todas”) permanece indisponível.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir ao administrador **inserir manualmente** uma conta a pagar pela página Contas a Pagar, digitando o **valor** e os demais dados obrigatórios, sem depender de importação em lote.
- **FR-002**: O formulário **“Nova conta a pagar”** MUST incluir: **descrição**, **Categorias** (taxonomia oficial já vigente), **subcategoria** quando Recursos Humanos, **valor**, **data de vencimento** e, opcionalmente, **data de pagamento**.
- **FR-003**: O sistema MUST exigir **valor** numérico **maior que zero** na criação e na edição; valores ausentes, zero, negativos ou inválidos MUST ser rejeitados com mensagem clara.
- **FR-013**: No formulário de criação e de edição, o campo **valor** MUST usar **máscara monetária brasileira** durante a digitação (ex.: R$ 1.234,56), de modo que o administrador informe o montante já no formato local.
- **FR-014**: A ação de criação na interface MUST usar o rótulo canônico **“Nova conta a pagar”** (título do botão/CTA e do formulário/modal alinhados); MUST NOT usar **“Nova Conta”** como nome principal.
- **FR-004**: Ao salvar com sucesso, o sistema MUST persistir o registro e exibi-lo na listagem de Contas a Pagar na mesma sessão (e após recarregar), com o valor corretamente refletido.
- **FR-005**: O sistema MUST impedir salvamento com dados obrigatórios ausentes ou inválidos (descrição, categoria, valor, vencimento; subcategoria RH quando aplicável) e MUST informar o usuário de forma clara.
- **FR-006**: O status pago/pendente na criação e na edição MUST ser derivado da **data de pagamento**: se a data estiver preenchida, a conta MUST ser **paga**; se estiver vazia (inclusive após limpar na edição), MUST ser **pendente**. NÃO há seletor explícito Pendente|Pago no formulário desta feature.
- **FR-007**: Em contas existentes, o administrador MUST poder **editar o valor** e os demais campos de negócio permitidos no formulário de edição, **inclusive quando a conta já estiver paga** (sem exigir reabrir/desmarcar o pagamento somente para corrigir o valor).
- **FR-015**: Na edição, o administrador MUST poder **limpar a data de pagamento**; ao salvar sem data de pagamento, o sistema MUST tornar a conta **pendente** novamente.
- **FR-008**: Usuários com papel **visualizador** MUST NOT criar, editar nem excluir; apenas consultar valores e demais dados.
- **FR-009**: A listagem MUST exibir o valor de cada conta de forma legível para o usuário (formato monetário brasileiro).
- **FR-010**: Contas criadas manualmente MUST participar dos filtros, exportação, agrupamento por categoria e demais regras já existentes no módulo Contas a Pagar, quando aplicáveis.
- **FR-011**: O sistema MUST NOT reintroduzir exclusão em massa (“Deletar todas”); importação CSV/Excel MAY permanecer disponível como caminho complementar, sem substituir o input manual.
- **FR-012**: A taxonomia de Categorias (e subcategorias de RH) MUST permanecer a já definida no produto; esta feature NÃO altera a lista oficial de categorias.

### Key Entities

- **Conta a Pagar**: Despesa lançada no Ocean; atributos relevantes incluem descrição, valor, data de vencimento, data de pagamento (quando paga), status pago/pendente e categoria (com subcategoria quando RH).
- **Valor**: Montante monetário da despesa; obrigatório, numérico e maior que zero; informado no formulário com máscara monetária brasileira e exibido na listagem em formato monetário.
- **Categoria**: Classificação gerencial já vigente (Adm/Financeiro, Operações, Marketing, Comercial, Recursos Humanos, Tecnologia, Impostos; subcategorias de RH quando aplicável).
- **Usuário**: Admin (criação e escrita permitidas) ou visualizador (somente leitura).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrador conclui o cadastro manual de uma conta a pagar válida (com valor) em menos de 2 minutos, sem usar importação.
- **SC-002**: Em 100% dos testes com dados válidos, a conta aparece na listagem imediatamente após salvar, com o valor correto, e permanece após recarregar a página.
- **SC-003**: Em 100% das tentativas com valor inválido (vazio, zero, negativo ou inválido na máscara), o sistema bloqueia o salvamento e o usuário entende o motivo sem suporte técnico.
- **SC-004**: Visualizador não consegue criar nem editar conta (incluindo alterar valor) em 100% das tentativas.
- **SC-005**: Em inspeção da listagem, 100% das contas exibem o valor de forma legível em formato monetário brasileiro.
- **SC-007**: Em 100% das sessões de criação/edição como admin, o campo valor apresenta máscara monetária brasileira durante a digitação.
- **SC-008**: Em 100% das inspeções da página, a ação de criação exibe o rótulo **“Nova conta a pagar”** (não “Nova Conta”).
- **SC-006**: Em pelo menos 95% das tentativas com demais campos obrigatórios inválidos, o salvamento é bloqueado com feedback claro.

## Assumptions

- Contas a Pagar já opera com lógica de lançamento manual no produto; esta feature formaliza e garante o **input unitário de valores** (criação/edição) como caminho principal e confiável, paralelo à importação.
- Importação CSV/Excel permanece **disponível** (diferente do foco de Contas a Receber manual, que excluiu importação); o pedido enfatiza input manual de valores, não a remoção da importação.
- Campos do formulário de criação: descrição, Categorias (+ subcategoria RH se aplicável), valor (máscara monetária), data de vencimento; data de pagamento **opcional** — preenchida implica nasce paga; vazia implica pendente (sem seletor Pendente|Pago).
- A ação de criação usa o rótulo canônico **“Nova conta a pagar”** (não “Nova Conta”).
- Correção de valor é permitida em contas pendentes e **também em contas já pagas**, sem fluxo obrigatório de reabrir pagamento.
- Limpar a data de pagamento na edição devolve a conta ao status **pendente** (regra simétrica: tem data = paga; sem data = pendente).
- Taxonomia de Categorias permanece a da feature de categorias já entregue; sem mudança de nomenclatura ou lista.
- Exclusão em massa permanece indisponível; exclusão individual, comprovantes e demais ações já existentes na página ficam fora do escopo de mudança desta feature (exceto na medida em que interagem com valor).
- Papéis admin / visualizador seguem o produto existente.
- Formato monetário de exibição na listagem segue o padrão brasileiro já usado no Ocean (ex.: R$ 1.234,56).
- No formulário, a digitação do valor usa máscara monetária brasileira (não apenas formatação na lista).
- Não há fonte externa (tipo Maggo) para Contas a Pagar; todos os registros são de origem local (manual ou importação).

## Out of Scope

- Remoção ou redesign da importação CSV/Excel.
- Reintrodução de exclusão em massa (“Deletar todas”).
- Alteração da taxonomia de Categorias / subcategorias de RH.
- Pagamento parcial / múltiplos valores por conta.
- Seletor explícito Pendente|Pago no formulário (status derivado da data de pagamento).
- Integração com fonte externa de despesas.
- Redesign completo da página Contas a Pagar (além do necessário para o formulário de valor e o rótulo “Nova conta a pagar”).
- Fluxo de comprovantes (anexar/baixar), salvo manter compatibilidade com contas criadas manualmente.
