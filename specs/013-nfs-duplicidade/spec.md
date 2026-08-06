# Feature Specification: Validação de Duplicidade de NFs

**Feature Branch**: `013-nfs-duplicidade`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "Criar validação de duplicidade (bloquear inserção de 2 notas iguais)"

## Clarifications

### Session 2026-08-06

- Q: Um número de NF já usado em nota cancelada ou arquivada pode ser reutilizado em um novo cadastro? → A: Não — número permanece único para sempre (cancelada/arquivada ainda bloqueia)
- Q: Na importação em massa, se o número da linha já existir no cadastro, o que deve acontecer? → A: Perguntar ao admin, por lote, se deve rejeitar ou atualizar
- Q: Se o próprio arquivo de importação tiver duas ou mais linhas com o mesmo número (ainda inexistente no cadastro), qual linha vale? → A: Vale a primeira linha; as demais do mesmo número são rejeitadas
- Q: No bloqueio de criação/edição pelo formulário, o feedback deve só avisar a duplicidade ou também ajudar a localizar a NF já existente? → A: Mensagem + atalho/navegação direta para abrir a NF existente
- Q: Além de remover espaços no início/fim, o número da NF deve ser normalizado de mais alguma forma antes de comparar duplicidade? → A: Só trim — "00123" e "123" são diferentes

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bloquear cadastro de NF com número já existente (Priority: P1)

O administrador tenta cadastrar uma nova nota fiscal (NF) informando um número que já existe no sistema. O sistema impede a gravação e informa, de forma clara, que aquela nota já está cadastrada — sem criar um segundo registro.

**Why this priority**: Evita faturamento duplicado, distorção de totais (dashboard, fluxo de caixa, impostos, bônus) e retrabalho de limpeza de dados.

**Independent Test**: Com uma NF já cadastrada sob o número X, tentar criar outra com o mesmo número X e confirmar que a operação é rejeitada e nenhuma NF adicional é criada.

**Acceptance Scenarios**:

1. **Given** já existe uma NF com o número "12345", **When** o administrador tenta criar outra NF com o número "12345", **Then** o sistema bloqueia a inserção, exibe mensagem indicando duplicidade pelo número e oferece atalho/navegação para abrir a NF já existente.
2. **Given** o bloqueio por duplicidade ocorreu, **When** o administrador usa o atalho para a NF existente, **Then** é levado à visualização/edição dessa NF (conforme o padrão do módulo).
3. **Given** o bloqueio por duplicidade ocorreu, **When** o administrador consulta a listagem, **Then** continua existindo apenas um registro com aquele número.
4. **Given** o administrador tenta criar uma NF com número ainda não utilizado, **When** salva com dados válidos, **Then** a NF é criada normalmente.

---

### User Story 2 - Bloquear alteração que gere número duplicado (Priority: P1)

Ao editar uma NF existente, o administrador altera o número para um valor que já pertence a outra NF. O sistema impede salvar essa alteração e mantém os dados anteriores.

**Why this priority**: Duplicidade também pode surgir por edição, não só por criação; o bloqueio precisa cobrir os dois caminhos.

**Independent Test**: Existindo NFs A (número 100) e B (número 200), editar B para número 100 e confirmar rejeição sem alteração persistida.

**Acceptance Scenarios**:

1. **Given** duas NFs distintas com números diferentes, **When** o admin altera o número de uma para o número da outra, **Then** o sistema bloqueia o salvamento, informa a duplicidade e oferece atalho/navegação para a NF que já possui aquele número.
2. **Given** o admin edita uma NF mantendo o próprio número (ou alterando outros campos sem mudar o número), **When** salva, **Then** a operação é aceita.
3. **Given** o admin altera o número de uma NF para um valor livre (não usado por nenhuma outra), **When** salva, **Then** a alteração é aceita.

---

### User Story 3 - Tratar duplicidade na importação em massa (Priority: P2)

Ao importar NFs em lote, o sistema detecta linhas cujo número já exista no cadastro e **pergunta ao administrador, uma vez por lote**, se deve **rejeitar** essas linhas ou **atualizar** as NFs existentes com os dados importados. Em qualquer escolha, não se cria um segundo registro com o mesmo número. Linhas repetidas dentro do próprio arquivo também não geram duplicatas; o administrador recebe feedback do resultado.

**Why this priority**: Importação é um caminho comum de entrada de dados; sem validação, duplicatas entram em volume — e às vezes o admin quer corrigir/atualizar em lote em vez de só descartar.

**Independent Test**: Importar arquivo com número já cadastrado; escolher rejeitar e confirmar que nada muda; repetir escolhendo atualizar e confirmar que a NF existente foi atualizada sem segundo registro. Incluir caso de número repetido no arquivo.

**Acceptance Scenarios**:

1. **Given** o arquivo contém ao menos um número já cadastrado, **When** o admin inicia a importação, **Then** o sistema apresenta a escolha do lote: rejeitar linhas conflitantes **ou** atualizar as NFs existentes.
2. **Given** a escolha do lote é **rejeitar**, **When** a importação conclui, **Then** as linhas com número já existente não criam nem alteram NFs, e o resultado indica rejeição por duplicidade.
3. **Given** a escolha do lote é **atualizar**, **When** a importação conclui, **Then** as NFs existentes com aqueles números são atualizadas com os dados das linhas, sem criar registros adicionais.
4. **Given** um arquivo com duas linhas com o mesmo número (ainda inexistente no sistema), **When** o admin importa, **Then** a **primeira** linha desse número é processada (cria a NF, se válida) e as linhas seguintes com o mesmo número são rejeitadas e reportadas como duplicidade no arquivo.
5. **Given** linhas do arquivo com números únicos e ainda não cadastrados, **When** o admin importa, **Then** essas linhas são processadas normalmente (respeitando demais validações já existentes), independentemente da escolha feita para os conflitos com o cadastro.

---

### Edge Cases

- Comparação de número aplica apenas trim de espaços no início/fim (ex.: `" 123 "` e `"123"` são o mesmo número). Formatos distintos como `"00123"` e `"123"` NÃO são tratados como iguais; não há equivalência numérica nem regra extra de maiúsculas/minúsculas além do valor textual após o trim.
- NF arquivada ou cancelada com determinado número continua ocupando esse número de forma permanente: não é permitido cadastrar outra NF com o mesmo número (o número nunca é liberado para reuso).
- Tentativa simultânea de dois usuários criarem a mesma NF (mesmo número): no máximo um registro é persistido; o outro recebe erro de duplicidade.
- Visualizador não cria nem edita NFs; a validação de duplicidade aplica-se às operações de escrita já restritas ao administrador.
- Edição que não altera o número da própria NF não deve ser tratada como conflito consigo mesma.
- Se o arquivo de importação não tiver nenhum número já existente no cadastro, a escolha rejeitar/atualizar do lote não é exigida (ou pode ser omitida).
- A escolha rejeitar/atualizar aplica-se ao lote inteiro para conflitos com o cadastro; não há decisão linha a linha nesta feature.
- Duplicidade **dentro do arquivo**: prevalece a **primeira** ocorrência do número; linhas posteriores com o mesmo número são rejeitadas (não sobrescrevem a primeira).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST considerar duas NFs iguais (duplicadas) quando compartilham o mesmo **número** de nota após trim de espaços; MUST NOT aplicar outras normalizações (zeros à esquerda, equivalência numérica ou case-folding além do valor textual resultante do trim).
- **FR-002**: O sistema MUST impedir a **criação** de uma NF cujo número já exista em qualquer NF cadastrada, inclusive arquivadas e canceladas; o número NÃO é liberado para reuso em nenhum estado do ciclo de vida.
- **FR-003**: O sistema MUST impedir a **edição** de uma NF quando o novo número informado já pertencer a **outra** NF.
- **FR-004**: Em criação e edição bloqueadas por duplicidade, o sistema MUST informar ao usuário que o número da nota já está em uso, que a operação não foi concluída, e MUST oferecer atalho/navegação direta para abrir a NF já existente com aquele número.
- **FR-005**: Na **importação em massa** de NFs, quando houver linhas cujo número já exista no cadastro, o sistema MUST solicitar ao administrador, **uma vez por lote**, a escolha entre **rejeitar** essas linhas ou **atualizar** as NFs existentes; em ambos os casos MUST NOT criar um segundo registro com o mesmo número.
- **FR-006**: Se a escolha do lote for **rejeitar**, o sistema MUST deixar as NFs existentes inalteradas e reportar as linhas conflitantes como rejeitadas por duplicidade.
- **FR-007**: Se a escolha do lote for **atualizar**, o sistema MUST aplicar os dados das linhas conflitantes às NFs já cadastradas com aquele número, sem inserir novos registros.
- **FR-008**: Linhas que se repetem **dentro do mesmo arquivo** (mesmo número em mais de uma linha) MUST processar apenas a **primeira** ocorrência e rejeitar as demais do mesmo número, reportando o conflito interno no resultado da importação.
- **FR-009**: O resultado da importação MUST permitir ao administrador identificar linhas aceitas, rejeitadas por duplicidade e, quando aplicável, atualizadas.
- **FR-010**: A validação de duplicidade MUST aplicar-se a todas as formas de inserção/alteração de NF disponíveis ao administrador no produto (formulário e importação), de modo que não exista caminho de escrita que crie dois registros com o mesmo número.
- **FR-011**: Usuários com papel visualizador MUST continuar sem poder criar, editar ou importar NFs; a regra de duplicidade não altera permissões existentes.

### Key Entities

- **NF (Nota Fiscal)**: Registro de faturamento identificado de forma única pelo **número**; demais atributos (cliente, valores, datas, status, arquivamento) não definem duplicidade nesta feature.
- **Resultado de importação**: Resumo da carga em lote, incluindo linhas aceitas, rejeitadas por duplicidade, atualizadas (quando o admin escolheu atualizar) e demais erros já existentes.
- **Escolha de conflito do lote**: Decisão única do administrador, por importação, entre rejeitar ou atualizar linhas cujo número já exista no cadastro.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes de criação com número já existente, nenhuma NF adicional é persistida.
- **SC-002**: Em 100% dos testes de edição que tentam reutilizar número de outra NF, os dados anteriores permanecem inalterados.
- **SC-003**: Em importações contendo números já existentes ou repetidos no arquivo — independentemente da escolha rejeitar ou atualizar — zero registros duplicados pelo número são criados.
- **SC-004**: Em pelo menos 95% dos casos de bloqueio por duplicidade no formulário, o usuário identifica a causa e consegue abrir a NF existente a partir do feedback/atalho, sem precisar consultar suporte.
- **SC-005**: Após a feature, tentativas de cadastro duplicado por número deixam de gerar impacto nos totais de faturamento/listagens (nenhum segundo registro com o mesmo número aparece nas consultas padrão).
- **SC-006**: Em 100% das importações com conflito de número já cadastrado, o administrador é solicitado a escolher rejeitar ou atualizar antes de concluir o tratamento desses conflitos.

## Assumptions

- O critério de igualdade é o **número da NF**, alinhado à regra de negócio já descrita no baseline do Ocean App (“número único”). Outros campos iguais (mesmo cliente e valor, por exemplo) **sem** o mesmo número **não** são tratados como duplicata nesta feature.
- A feature abrange o módulo de **NFs / faturamento** (incluindo fluxos de Contas a Receber que operam sobre a mesma entidade de NF, se aplicável), e não outros cadastros (ex.: contas a pagar, patrimônio).
- Normalização limitada a trim de espaços; `"00123"` e `"123"` são números distintos para fins de duplicidade.
- Integrações/sincronizações externas que já fazem merge por número permanecem compatíveis com a regra de unicidade e não devem criar segunda NF com o mesmo número; a escolha rejeitar/atualizar desta feature aplica-se ao fluxo de **importação em massa** pelo administrador.
- Não há necessidade de tela dedicada de “busca de duplicatas históricas”; o foco é impedir novos registros duplicados e, na importação, permitir rejeitar ou atualizar conflitos com o cadastro. Tratamento de duplicatas já existentes no banco, se houver, fica fora do escopo desta feature.
- A decisão rejeitar vs. atualizar na importação é **por lote** (não por linha).
- Em duplicidade interna no arquivo de importação, a **primeira** linha do número prevalece; as seguintes são rejeitadas.
