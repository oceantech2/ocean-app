# Feature Specification: NF — Conflito de Duplicidade entre Origens

**Feature Branch**: `053-nf-duplicidade-origem`

**Created**: 2026-09-06

**Status**: Draft

**Input**: User description: "nota fiscal verificar se nao veio a mesma nota de duas origens diferentes, pode permitir mesmo número desde que venha da mesma origem"

## Clarifications

### Session 2026-09-06

- Q: Ao criar pelo formulário uma NF Manual com número que já existe em outra NF também Manual, o que deve acontecer? → A: Bloquear — no máximo um registro por número dentro da mesma origem; “permitir mesma origem” vale para reenvio/atualização/merge, não para criar outra NF
- Q: Na importação em massa, como tratar número já cadastrado? → A: Mesma origem: perguntar rejeitar ou atualizar (como na 013); origem diferente: sempre rejeitar e reportar conflito
- Q: Como o admin fica sabendo quando o Maggo conflita com NF Manual? → A: Apenas no resultado da sincronização/lote (linha rejeitada por conflito de origem)
- Q: O que fazer com pares históricos já duplicados entre origens? → A: Fora do escopo — só bloquear novas escritas conflitantes; sem listagem nem correção de pares já existentes

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bloquear a mesma NF vinda de origens diferentes (Priority: P1)

O administrador (ou um fluxo de entrada automático) tenta cadastrar ou atualizar uma nota fiscal cujo **número** já existe no sistema, porém com **origem diferente** da NF já cadastrada. O sistema impede a operação, deixa claro que a mesma nota não pode existir em duas origens e aponta a NF já existente.

**Why this priority**: Evita a mesma nota fiscal “duplicada” por fontes distintas (ex.: Maggo e cadastro manual), o que distorce faturamento, dashboard, impostos e contas a receber.

**Independent Test**: Com uma NF de número X na origem A, tentar criar/atualizar uma NF de número X na origem B e confirmar bloqueio sem segundo registro conflitante.

**Acceptance Scenarios**:

1. **Given** já existe uma NF com número "12345" e origem Maggo, **When** o administrador tenta cadastrar manualmente outra NF com número "12345", **Then** o sistema bloqueia a operação, informa conflito por origens distintas e oferece atalho/navegação para a NF já existente.
2. **Given** já existe uma NF com número "12345" e origem Manual, **When** uma entrada da origem Maggo tenta gravar a mesma nota "12345", **Then** o sistema bloqueia ou recusa a gravação conflitante e reporta o conflito (sem criar um segundo registro de origem diferente).
3. **Given** o bloqueio por conflito de origem ocorreu, **When** o administrador usa o atalho para a NF existente, **Then** é levado à visualização/edição dessa NF conforme o padrão do módulo.
4. **Given** o administrador consulta a listagem após a tentativa bloqueada, **When** filtra ou localiza o número, **Then** continua existindo apenas a NF da origem original (sem par Manual+Maggo para o mesmo número).

---

### User Story 2 - Permitir o mesmo número quando a origem é a mesma (Priority: P1)

Quando a origem **reenvia** ou **atualiza** uma NF com o **mesmo número** e a **mesma origem**, o sistema **não** trata isso como conflito de origens distintas e aplica o merge/atualização já previsto. Porém, **criar** um segundo registro com o mesmo número na mesma origem é **bloqueado** (no máximo um registro por número dentro de cada origem).

**Why this priority**: É o complemento da regra: o problema é cruzar origens **e** também impedir duplicata real dentro da mesma origem; só o reprocessamento pela mesma fonte permanece permitido.

**Independent Test**: Com NF número X na origem A, reenviar/atualizar X pela mesma origem A e confirmar aceite; tentar criar outra NF X na mesma origem A e confirmar bloqueio.

**Acceptance Scenarios**:

1. **Given** já existe uma NF com número "12345" e origem Maggo, **When** a origem Maggo reenvia a nota "12345", **Then** o sistema NÃO bloqueia por conflito de origens distintas e aplica o comportamento de atualização/merge já previsto para essa origem.
2. **Given** já existe uma NF com número "12345" e origem Manual, **When** o administrador tenta **criar** outra NF Manual com número "12345", **Then** o sistema bloqueia a criação (unicidade por número dentro da origem Manual) e aponta a NF já existente.
3. **Given** já existe uma NF com número "12345" e origem Manual, **When** o administrador edita essa mesma NF mantendo o número, **Then** a edição é aceita.
4. **Given** não existe nenhuma NF com o número "99999", **When** o administrador cria a NF "99999" pela origem Manual, **Then** a criação é aceita normalmente.

---

### User Story 3 - Feedback claro em criação, edição e importação/sync (Priority: P2)

Em todos os caminhos de escrita de NF (formulário, importação em massa e sincronização da origem integrada), o administrador recebe feedback compreensível quando há duplicidade na mesma origem ou conflito com outra origem.

**Why this priority**: Sem mensagem adequada, o admin não distingue “número já usado nesta origem” de “mesma nota já veio de outra origem”.

**Independent Test**: Provocar duplicidade mesma origem e conflito Manual×Maggo no formulário e nos fluxos de entrada; confirmar mensagens distintas e identificação da NF existente.

**Acceptance Scenarios**:

1. **Given** conflito de número entre origens no formulário, **When** o admin tenta salvar, **Then** vê mensagem indicando que a nota já existe em outra origem e atalho para a NF existente.
2. **Given** duplicidade de número na mesma origem no formulário, **When** o admin tenta criar, **Then** vê mensagem de número já cadastrado nessa origem e atalho para a NF existente.
3. **Given** conflito de número entre origens na sincronização/entrada Maggo, **When** o lote ou a sincronização processa a linha, **Then** a linha conflitante é recusada e aparece **somente** no resultado da sincronização/lote como rejeitada por conflito de origem (sem toast/alerta dedicado nem notificação persistente nesta feature).
4. **Given** importação com linhas cujo número já existe na **mesma** origem, **When** o admin inicia a importação, **Then** o sistema pergunta uma vez por lote se deve **rejeitar** ou **atualizar** essas linhas (comportamento alinhado à 013).
5. **Given** importação com linhas cujo número já existe em **outra** origem, **When** a importação processa essas linhas, **Then** elas são **sempre rejeitadas** e reportadas como conflito de origem (sem opção de atualizar a NF da outra origem).
6. **Given** a importação conclui com ambos os tipos de conflito, **When** o admin vê o resultado, **Then** consegue distinguir linhas rejeitadas por duplicidade na mesma origem, atualizadas (se escolheu atualizar) e rejeitadas por conflito de origem.

---

### Edge Cases

- Comparação de número aplica apenas trim de espaços no início/fim (ex.: `" 123 "` e `"123"` são o mesmo número). Formatos como `"00123"` e `"123"` NÃO são tratados como iguais.
- NF arquivada ou cancelada continua ocupando o número para fins de conflito entre origens: não é permitido “reabrir” o mesmo número por outra origem.
- Tentativa simultânea de gravar o mesmo número em origens diferentes: no máximo um registro prevalece; a outra operação recebe erro de conflito de origem.
- Edição que altera apenas campos que não mudam número/origem não deve gerar falso conflito consigo mesma.
- Criação de segunda NF com o mesmo número na **mesma** origem é bloqueada (unicidade por número dentro da origem); apenas reenvio/atualização/merge pela mesma origem é permitido.
- Alterar a origem de uma NF existente está fora do escopo desta feature (origem permanece imutável, como já praticado no produto).
- Visualizador continua sem poder criar, editar ou importar NFs; a regra não altera permissões.
- Se o arquivo de importação não tiver nenhum número já existente na mesma origem, a escolha rejeitar/atualizar do lote para esse tipo de conflito não é exigida.
- A escolha rejeitar/atualizar da importação aplica-se **somente** a conflitos na mesma origem; conflitos entre origens são sempre rejeitados, sem escolha.
- Se existirem historicamente dois registros com o mesmo número e origens diferentes, esta feature prioriza impedir novos conflitos; saneamento em massa de duplicatas históricas fica fora do escopo, salvo bloqueio de novas escritas conflitantes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST detectar conflito quando uma operação de escrita de NF usa um **número** (após trim) que já existe em uma NF cuja **origem** é **diferente** da origem da operação.
- **FR-002**: O sistema MUST impedir a conclusão da escrita (criação, atualização conflitante, importação ou sincronização) quando FR-001 se aplica, de modo que o mesmo número NÃO fique associado a duas origens distintas.
- **FR-003**: O sistema MUST permitir **reenvio/atualização/merge** quando o número já existente pertence à **mesma origem** da operação (não classificar como conflito de origens distintas).
- **FR-003a**: O sistema MUST impedir a **criação** de um segundo registro com o mesmo número **dentro da mesma origem** (no máximo um registro por número por origem); no formulário, MUST informar a duplicidade e oferecer atalho para a NF já existente.
- **FR-004**: Em conflito de origens no formulário (criação/edição), o sistema MUST informar que a nota já existe em outra origem, que a operação não foi concluída, e MUST oferecer atalho/navegação para a NF já existente com aquele número.
- **FR-005**: Na sincronização/entrada da origem integrada (Maggo), linhas cujo número já exista em origem diferente MUST ser recusadas e reportadas **no resultado da sincronização/lote** como conflito de origem, sem criar segundo registro e sem sobrescrever a NF da outra origem; MUST NOT exigir canal adicional de alerta (toast dedicado ou notificação persistente) nesta feature.
- **FR-005a**: Na **importação em massa**, quando houver linhas cujo número já exista na **mesma** origem, o sistema MUST solicitar ao administrador, **uma vez por lote**, a escolha entre **rejeitar** essas linhas ou **atualizar** as NFs existentes (alinhado à 013); MUST NOT criar segundo registro com o mesmo número na mesma origem.
- **FR-005b**: Na **importação em massa**, linhas cujo número já exista em **outra** origem MUST ser **sempre rejeitadas** e reportadas como conflito de origem; MUST NOT oferecer atualizar a NF da origem diferente.
- **FR-006**: A comparação de número MUST usar apenas trim; MUST NOT aplicar zeros à esquerda, equivalência numérica ou outras normalizações.
- **FR-007**: A regra MUST aplicar-se a todas as formas de escrita de NF disponíveis no produto (formulário, importação e sincronização), para que não exista caminho que grave o mesmo número em duas origens.
- **FR-008**: Usuários com papel visualizador MUST continuar sem poder criar, editar ou importar NFs.
- **FR-010**: O sistema MUST NOT incluir, nesta feature, listagem nem correção de pares históricos com o mesmo número em origens distintas; o escopo limita-se a impedir e reportar novas escritas conflitantes.

### Key Entities

- **NF (Nota Fiscal)**: Registro de faturamento com **número** e **origem** (Manual ou Maggo). No máximo um registro por número por origem; o mesmo número não pode existir em origens distintas.
- **Origem da NF**: Identifica a fonte do lançamento (Manual ou Maggo). É o segundo eixo da regra, junto com o número.
- **Conflito de origem**: Situação em que uma escrita tenta associar um número já existente a uma origem diferente da NF cadastrada.
- **Resultado de importação/sincronização**: Resumo que identifica linhas aceitas, rejeitadas por duplicidade na mesma origem, atualizadas (quando o admin escolheu atualizar) e rejeitadas por conflito de origem.
- **Escolha de conflito do lote (mesma origem)**: Decisão única do administrador, por importação, entre rejeitar ou atualizar linhas cujo número já exista na mesma origem.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes de criação/edição com mesmo número e origem diferente da NF existente, nenhuma gravação conflitante é persistida.
- **SC-002**: Em 100% dos testes de reenvio/atualização com mesmo número e mesma origem, a operação NÃO é rejeitada por conflito de origens distintas.
- **SC-002a**: Em 100% dos testes de criação de segundo registro com mesmo número e mesma origem, a criação é bloqueada e nenhum registro adicional é persistido.
- **SC-003**: Em sincronizações/importações contendo números já vinculados a outra origem, zero registros com o mesmo número e origem divergente são criados, e nenhuma NF da outra origem é atualizada por essas linhas.
- **SC-003a**: Em 100% das importações com conflito de número na mesma origem, o administrador é solicitado a escolher rejeitar ou atualizar antes de concluir o tratamento desses conflitos.
- **SC-004**: Em pelo menos 95% dos bloqueios no formulário por conflito de origem, o administrador identifica a causa e consegue abrir a NF existente a partir do feedback/atalho, sem suporte.
- **SC-005**: Após a feature, listagens e totais padrão não passam a refletir o mesmo número de NF contabilizado sob duas origens distintas em novos lançamentos.

## Assumptions

- As origens relevantes no produto são **Manual** e **Maggo**, já existentes no cadastro de NF / Contas a Receber.
- “Permitir o mesmo número na mesma origem” significa: permitir **reenvio/atualização/merge** pela mesma fonte; **não** significa permitir um segundo registro com o mesmo número na mesma origem.
- Unicidade efetiva: no máximo **um registro por número por origem**, e o mesmo número **não** pode existir em duas origens distintas.
- Esta feature **estende** a regra de duplicidade da spec `013-nfs-duplicidade`: mantém bloqueio de segundo cadastro com o mesmo número e acrescenta o bloqueio explícito entre origens diferentes, sem impedir o reprocessamento pela mesma origem.
- Normalização do número limitada a trim; `"00123"` e `"123"` permanecem distintos.
- Na importação em massa, a decisão rejeitar vs. atualizar é **por lote** e **somente** para conflito na mesma origem; conflito entre origens é sempre rejeição.
- Saneamento automático de pares históricos já duplicados entre origens está fora do escopo; o foco é prevenir novos conflitos e falhar de forma clara nas escritas.
- Papéis e permissões existentes (`admin` / `visualizador`) permanecem inalterados.
- Não há tela dedicada de “busca de duplicatas históricas”; o valor está no bloqueio preventivo e no feedback na escrita.
- Feedback de conflito Maggo×Manual na sincronização limita-se ao **resultado do sync/lote**; canais extras de notificação ficam fora do escopo.
