# Feature Specification: Anexo de nota fiscal em Contas a Receber e Contas a Pagar

**Feature Branch**: `038-contas-anexo-nf`

**Created**: 2026-08-18

**Status**: Draft

**Input**: User description: "Em contas a receber e em contas a pagar deve ter um campo na tabela referente a NF e deve ser possível anexar a NF em cada linha para vincular ela aquele registro. As notas são ou png ou jpeg ou pdf e devem respeitar o tamanho máximo de 2mb"

## Clarifications

### Session 2026-08-18

- Q: O anexo em Contas a Receber permanece após atualizar/recarregar a lista da fonte Maggo? → A: Sim — permanece associado ao mesmo lançamento (origem Maggo ou manual).
- Q: Onde o administrador anexa/substitui/remove a NF em Contas a Receber? → A: Na coluna da tabela **e** no formulário de editar a conta a receber, com as mesmas regras.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver e anexar a NF na linha de Contas a Receber (Priority: P1)

Na página **Contas a Receber**, o usuário vê uma coluna **NF** na tabela. O administrador anexa o arquivo da nota fiscal daquele lançamento (PNG, JPEG ou PDF, até 2 MB) **na linha** e também no **formulário de edição**. Depois do envio, a linha mostra que há arquivo e qualquer usuário autenticado pode abri-lo ou baixá-lo. O visualizador só consulta e abre; não anexa.

**Why this priority**: Hoje o vínculo por item existe em Contas a Pagar, mas não em Contas a Receber. Sem a coluna e o anexo por linha (e no formulário, alinhado a Pagar), a receita fica sem o documento fiscal associado ao registro.

**Independent Test**: Abrir Contas a Receber, anexar um PDF válido de até 2 MB em uma linha sem arquivo e confirmar que a coluna NF passa a permitir abrir o arquivo; repetir o anexo pelo formulário de edição em outra linha.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado em Contas a Receber, **When** vê a tabela, **Then** existe uma coluna referente à NF visível em todas as linhas.
2. **Given** um administrador e uma linha sem arquivo, **When** anexa um PNG, JPEG ou PDF de até 2 MB, **Then** o arquivo fica vinculado só àquele registro e a coluna NF indica o vínculo.
3. **Given** um usuário autenticado e uma linha com NF anexada, **When** aciona o arquivo na coluna NF, **Then** consegue visualizar ou baixar o arquivo correspondente.
4. **Given** um visualizador, **When** consulta a tabela, **Then** vê quais linhas têm NF e pode abrir/baixar, mas **não** consegue anexar, substituir nem remover.
5. **Given** um administrador salvando ou consultando uma conta a receber, **When** a linha não tem arquivo, **Then** o registro permanece válido (anexo opcional) e a coluna indica ausência de forma discreta (ex.: ação de anexar para admin, traço para visualizador).
6. **Given** uma conta a receber (Maggo ou manual) com NF já anexada, **When** o usuário atualiza ou recarrega a lista a partir da fonte Maggo, **Then** o mesmo lançamento continua com o mesmo arquivo vinculado.
7. **Given** um administrador no formulário de **editar** uma conta a receber, **When** anexa, substitui ou remove um PNG, JPEG ou PDF válido de até 2 MB e confirma a ação, **Then** a coluna NF daquela linha reflete o arquivo vigente.

---

### User Story 2 - Coluna NF e anexo por linha em Contas a Pagar, com limite de 2 MB (Priority: P1)

Na página **Contas a Pagar**, a tabela continua (ou passa a ter, se ainda não estiver visível) uma coluna **NF**. O administrador anexa, na linha, o arquivo da nota daquele item (PNG, JPEG ou PDF, no máximo **2 MB**). Quem já tem arquivo continua podendo abri-lo. O visualizador só lê e baixa.

**Why this priority**: O pedido exige o mesmo comportamento nas duas páginas e um teto explícito de 2 MB. Sem o teto, arquivos grandes demais entram no mesmo fluxo.

**Independent Test**: Em Contas a Pagar, anexar um JPEG válido de até 2 MB em uma linha; tentar um arquivo maior que 2 MB e confirmar recusa com mensagem clara, sem alterar o vínculo anterior.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado em Contas a Pagar, **When** vê a tabela, **Then** cada linha tem um campo/coluna referente à NF.
2. **Given** um administrador e uma linha sem arquivo, **When** anexa PNG, JPEG ou PDF de até 2 MB, **Then** o arquivo fica vinculado àquele item.
3. **Given** um administrador selecionando um arquivo maior que 2 MB, **When** tenta anexar, **Then** o sistema recusa, informa o limite de 2 MB e não grava o arquivo.
4. **Given** um visualizador, **When** consulta a listagem, **Then** vê e abre a NF vinculada, sem ações de escrita.
5. **Given** um item já com NF vinculada (incluindo vínculos anteriores a esta entrega), **When** um usuário autenticado aciona o arquivo, **Then** consegue abrir ou baixar.

---

### User Story 3 - Substituir ou remover a NF do registro (Priority: P2)

O administrador corrige o vínculo na **linha** ou no **formulário de edição**: troca o arquivo ou remove quando anexou o documento errado, em Contas a Receber e em Contas a Pagar. O visualizador permanece somente leitura.

**Why this priority**: Sem correção, um arquivo errado fica preso ao lançamento.

**Independent Test**: Em um item já com arquivo em cada página, substituir pela listagem e pelo formulário; em seguida remover o vínculo e conferir que a linha volta a permitir anexar.

**Acceptance Scenarios**:

1. **Given** uma linha com NF vinculada, **When** o administrador envia outro PNG, JPEG ou PDF válido de até 2 MB (pela tabela ou pelo formulário), **Then** o vínculo vigente passa a ser o novo arquivo.
2. **Given** uma linha com NF vinculada, **When** o administrador remove o vínculo (após confirmação, pela tabela ou pelo formulário), **Then** a linha fica sem arquivo e volta a permitir anexar.
3. **Given** um visualizador, **When** tenta substituir ou remover, **Then** a ação não está disponível.

---

### Edge Cases

- Formato diferente de PNG, JPEG ou PDF (incluindo WebP, planilha ou texto): recusa e informa os formatos aceitos; o vínculo anterior, se houver, permanece.
- JPEG com extensão `.jpg` ou `.jpeg`: ambos são aceitos.
- Arquivo exatamente 2 MB: aceito, se o formato for válido.
- Arquivo acima de 2 MB: recusa com mensagem que cita o limite de 2 MB; não altera o vínculo anterior.
- Arquivo vazio ou corrompido: recusa sem alterar o vínculo anterior.
- Tentativa de vários arquivos no mesmo item: no máximo **um** arquivo vigente por registro; novo envio substitui.
- Linha sem NF: a tabela permanece utilizável; anexo é opcional.
- Exclusão ou arquivamento do registro: o vínculo daquele item deixa de ser oferecido ao usuário na listagem ativa (não fica “solto” em outra linha).
- Contas a Pagar: o anexo no formulário de criar/editar permanece alinhado às mesmas regras de formato e 2 MB.
- Contas a Receber: o anexo no formulário de edição segue as mesmas regras da coluna da tabela; cancelar o formulário sem confirmar não deixa arquivo órfão visível no produto.
- Atualização/recarga da lista de Contas a Receber a partir da fonte Maggo: o arquivo já vinculado permanece no mesmo lançamento (Maggo ou manual); não some só porque a lista foi recarregada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A tabela de **Contas a Receber** MUST exibir um campo/coluna referente à NF em cada linha.
- **FR-002**: A tabela de **Contas a Pagar** MUST exibir um campo/coluna referente à NF em cada linha.
- **FR-003**: O administrador MUST poder anexar um arquivo de nota fiscal vinculado somente àquele registro: na **linha da tabela** em Contas a Receber e em Contas a Pagar, e também no **formulário de edição** em Contas a Receber (e no formulário de criar/editar em Contas a Pagar, quando existir).
- **FR-004**: Novos envios MUST aceitar apenas PNG, JPEG e PDF.
- **FR-005**: Novos envios MUST recusar arquivo com tamanho **maior que 2 MB** e informar o limite de forma compreensível.
- **FR-006**: Cada registro MUST ter no máximo um arquivo de NF vigente.
- **FR-007**: Usuários autenticados MUST poder abrir ou baixar a NF vinculada à linha.
- **FR-008**: O visualizador MUST consultar e abrir/baixar, sem anexar, substituir nem remover.
- **FR-009**: O administrador MUST poder substituir o arquivo vigente por outro PNG, JPEG ou PDF válido de até 2 MB, pela tabela ou pelo formulário de edição (Receber e Pagar).
- **FR-010**: O administrador MUST poder remover o vínculo da NF, com confirmação antes da remoção, pela tabela ou pelo formulário de edição.
- **FR-011**: Anexar NF MUST ser opcional: criar, editar, pagar, receber ou filtrar não exige arquivo.
- **FR-012**: A coluna NF MUST indicar, por linha, se há arquivo vinculado (incluindo identificação visível do arquivo, quando houver).
- **FR-013**: Recusa de formato ou tamanho MUST ocorrer **antes** de gravar o novo arquivo e MUST preservar o vínculo anterior, se existir.
- **FR-014**: O vínculo da NF em Contas a Receber MUST persistir após atualizar ou recarregar a lista da fonte Maggo, permanecendo associado ao mesmo lançamento (origem Maggo ou manual).
- **FR-015**: Em Contas a Receber, o formulário de edição MUST permitir anexar, substituir e remover a NF com as mesmas regras da coluna da tabela (formatos, 2 MB, um arquivo, papéis).

### Key Entities

- **Conta a receber**: lançamento na página Contas a Receber (origem Maggo ou manual); pode ter no máximo um arquivo de NF vinculado, que permanece no mesmo lançamento após recarga da fonte Maggo.
- **Conta a pagar**: lançamento na página Contas a Pagar; pode ter no máximo um arquivo de NF vinculado.
- **Arquivo de nota fiscal**: documento PNG, JPEG ou PDF de até 2 MB associado a um único lançamento; substituível e removível pelo administrador.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em até 1 minuto, um administrador anexa um PNG, JPEG ou PDF válido de até 2 MB em Contas a Receber (pela tabela **ou** pelo formulário de edição) **e** em uma linha de Contas a Pagar.
- **SC-002**: 100% das linhas visíveis nas duas tabelas apresentam o campo/coluna de NF.
- **SC-003**: 100% das tentativas de novo envio com formato diferente de PNG, JPEG ou PDF são recusadas com mensagem clara, sem gravar o arquivo.
- **SC-004**: 100% das tentativas de novo envio com arquivo maior que 2 MB são recusadas com mensagem que cita o limite, sem gravar o arquivo nem alterar o vínculo anterior.
- **SC-005**: Visualizadores abrem a NF de uma linha já vinculada na primeira tentativa, sem ações de escrita.
- **SC-006**: Substituir ou remover o arquivo de uma linha é concluído em no máximo 3 ações do administrador (escolha da linha + confirmação/envio).
- **SC-007**: Após anexar uma NF a uma conta a receber, 100% das recargas/atualizações da lista (fonte Maggo) mantêm o arquivo naquele mesmo lançamento.

## Assumptions

- O pedido cobre as páginas **Contas a Receber** e **Contas a Pagar**. Não reabre pasta compartilhada de NFs nem de comprovantes.
- Contas a Pagar já pode ter coluna e vínculo por item; esta entrega alinha as duas telas e fixa o teto de **2 MB** para novos envios nas duas.
- “JPEG” inclui `.jpg` e `.jpeg`. “PNG” e “PDF” são os demais formatos aceitos.
- Um arquivo por registro. Em **Contas a Receber**, anexar na linha da tabela **e** no formulário de edição é obrigatório nesta entrega. Em **Contas a Pagar**, a linha e o formulário de criar/editar seguem as mesmas regras.
- Papéis: `admin` escreve; `visualizador` somente lê.
- Confirmação na remoção do vínculo segue o padrão já usado no produto para exclusões.
- Vínculos já existentes em Contas a Pagar permanecem acessíveis; novos envios passam a respeitar formato e 2 MB.
- Recarregar Contas a Receber não apaga nem troca o anexo de um lançamento que continua existindo na lista.
