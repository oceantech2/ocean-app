# Feature Specification: Contas a Pagar — Edição em massa de datas

**Feature Branch**: `067-contas-pagar-datas-massa`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "permitir editar campos de data de pagamento e vencimento em massa em contas a pagar"

## Clarifications

### Session 2026-09-14

- Q: O lote permite limpar data de pagamento (e/ou vencimento)? → A: Sem limpeza no lote: só definir/substituir datas; limpar pagamento só na edição individual.
- Q: Como organizar a ação na interface? → A: Uma ação **Editar datas em massa** (ambos os campos no mesmo fluxo; preenche um ou os dois).
- Q: Como funciona a seleção na listagem agrupada? → A: Seleção por linha **e** seleção do grupo visível (ex.: todas as contas do mês/ano agrupado); sem “marcar todas as contas do filtro” fora da tela.
- Q: Há validação entre data de pagamento e data de vencimento no lote? → A: Sem regra entre as datas: qualquer data válida de calendário; não exige pagamento ≥ vencimento.
- Q: O que acontece com a seleção após um lote bem-sucedido? → A: Após sucesso, limpar a seleção automaticamente.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Alterar vencimento e/ou pagamento em várias contas de uma vez (Priority: P1)

O administrador, na página **Contas a Pagar**, seleciona uma ou mais contas na listagem e dispara a ação **Editar datas em massa**. Informa a nova **data de vencimento** e/ou a nova **data de pagamento** (pelo menos um dos dois) e confirma. Todas as contas selecionadas passam a exibir as datas aplicadas; cards, filtros e ordenação passam a refletir os novos valores. Após sucesso, a seleção é limpa. O visualizador não seleciona nem edita em massa.

**Why this priority**: É o valor central da feature — eliminar edição individual repetida ao recalendarizar ou registrar pagamento de um lote.

**Independent Test**: Criar ao menos três contas a pagar com datas distintas; selecionar duas; aplicar um novo vencimento e uma nova data de pagamento; conferir listagem, cards, reabertura individual e seleção limpa.

**Acceptance Scenarios**:

1. **Given** um administrador na listagem de Contas a Pagar com ao menos uma conta, **When** marca uma ou mais linhas e aciona **Editar datas em massa**, **Then** vê um fluxo que permite informar **data de vencimento** e/ou **data de pagamento**.
2. **Given** seleção com uma ou mais contas e pelo menos um dos campos de data preenchido no fluxo em massa, **When** o administrador confirma, **Then** todas as contas selecionadas passam a ter os valores informados nos campos correspondentes, a listagem atualiza e a seleção é limpa.
3. **Given** o administrador preenche só a data de vencimento (deixando pagamento em branco no fluxo), **When** confirma, **Then** apenas o vencimento das selecionadas muda; a data de pagamento existente de cada conta permanece.
4. **Given** o administrador preenche só a data de pagamento (deixando vencimento em branco no fluxo), **When** confirma, **Then** apenas a data de pagamento das selecionadas muda; o vencimento existente de cada conta permanece.
5. **Given** o administrador preenche ambos os campos, **When** confirma, **Then** vencimento e pagamento das selecionadas passam a ser os valores informados.
6. **Given** um visualizador, **When** abre Contas a Pagar, **Then** não consegue selecionar contas nem acionar edição em massa.

---

### User Story 2 - Selecionar contas na listagem para o lote (Priority: P1)

O administrador marca contas individualmente (caixa de seleção por linha) e também pode marcar/desmarcar o **grupo visível** (ex.: todas as contas do mês/ano agrupado na listagem). A ação em massa só fica disponível com ao menos uma conta marcada. Ao mudar filtros, mês/ano ou página (se houver), a seleção é limpa para evitar aplicar datas a um conjunto que o usuário não vê mais. Não há “selecionar todas as contas do filtro atual” além do que está no grupo/tela visível.

**Why this priority**: Sem seleção confiável, a edição em massa não é utilizável com segurança.

**Independent Test**: Marcar e desmarcar linhas; confirmar que a ação exige seleção; mudar um filtro e verificar que a seleção some.

**Acceptance Scenarios**:

1. **Given** a listagem com várias contas, **When** o administrador marca e desmarca linhas, **Then** a seleção reflete exatamente as contas escolhidas.
2. **Given** a listagem agrupada por mês/ano, **When** o administrador marca o grupo visível, **Then** todas as contas daquele grupo entram na seleção; ao desmarcar o grupo, todas saem.
3. **Given** nenhuma conta marcada, **When** o administrador procura a ação em massa, **Then** ela não dispara (desabilitada ou oculta).
4. **Given** contas marcadas, **When** o administrador altera filtro de status, intervalo, descrição, mês/ano ou página da listagem, **Then** a seleção é limpa.
5. **Given** seleção ativa, **When** o administrador vê a área de ações, **Then** consegue identificar quantas contas serão afetadas antes de confirmar.

---

### User Story 3 - Confirmar o lote e receber feedback claro (Priority: P2)

Antes de gravar, o administrador vê um resumo (quantidade de contas e quais datas serão aplicadas) e confirma. Após o processamento com sucesso, recebe feedback, a listagem/cards refletem o resultado e a seleção é limpa automaticamente. Em falha parcial/total, o feedback indica o que foi aplicado; a seleção pode permanecer ou ser limpa conforme coerência da tela, desde que o usuário consiga corrigir depois. Em caso de cancelamento, nenhuma data muda e a seleção permanece.

**Why this priority**: Datas de vencimento e pagamento afetam cards, alertas e fluxo de caixa; confirmação e feedback reduzem erro operacional.

**Independent Test**: Abrir o fluxo em massa, cancelar e conferir que nada mudou e a seleção permanece; confirmar um lote válido e conferir mensagem, dados atualizados e seleção limpa.

**Acceptance Scenarios**:

1. **Given** seleção e datas informadas, **When** o administrador inicia a confirmação, **Then** vê a quantidade de contas e quais campos serão alterados antes de efetivar.
2. **Given** o resumo exibido, **When** o administrador cancela, **Then** nenhuma conta selecionada tem data alterada e a seleção permanece.
3. **Given** confirmação de um lote válido, **When** o processamento termina com sucesso, **Then** o sistema informa que as datas foram atualizadas, a listagem/cards refletem o resultado e a seleção é limpa automaticamente.
4. **Given** falha em parte ou em todas as contas do lote, **When** o processamento termina, **Then** o administrador recebe feedback com o que foi aplicado e o que não foi, sem perder a capacidade de corrigir depois.

---

### Edge Cases

- Nenhuma data preenchida no fluxo em massa: o sistema recusa aplicar e informa que é preciso informar vencimento e/ou pagamento.
- Conta já paga recebendo nova data de pagamento: a data de pagamento é atualizada; o status pago permanece pago.
- Conta pendente recebendo data de pagamento: passa a constar como paga, alinhado ao comportamento da edição individual (preencher pagamento implica pago).
- Limpeza de data de pagamento ou de vencimento **não** está disponível no lote; quem precisar limpar pagamento usa a edição individual.
- Seleção de uma única conta: a ação em massa pode ser usada (mesmo efeito da edição do campo), desde que haja seleção.
- Datas inválidas ou incompletas no seletor: o sistema não grava o lote até que as datas informadas sejam válidas.
- Relação pagamento × vencimento: o lote **não** exige pagamento ≥ vencimento (nem o inverso); basta cada data informada ser válida no calendário.
- Contas removidas ou indisponíveis entre seleção e confirmação: o feedback indica quantas foram ignoradas; as demais elegíveis são atualizadas.
- Após lote **bem-sucedido**: a seleção é limpa automaticamente.
- Visualizador ou usuário sem permissão de escrita: sem seleção nem ação em massa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A página Contas a Pagar MUST permitir ao administrador selecionar uma ou mais contas na listagem para edição em massa das datas, por caixa de seleção **por linha** e por **grupo visível** (ex.: mês/ano agrupado).
- **FR-001a**: A seleção MUST NOT incluir “marcar todas as contas do filtro atual” além das linhas/grupos visíveis na listagem.
- **FR-002**: O administrador MUST poder aplicar em massa nova **data de vencimento** e/ou nova **data de pagamento** às contas selecionadas, por meio de **uma** ação **Editar datas em massa** (ambos os campos no mesmo fluxo).
- **FR-002a**: O produto MUST NOT expor ações em massa separadas só de vencimento ou só de pagamento nesta entrega.
- **FR-003**: O fluxo em massa MUST exigir pelo menos um dos dois campos preenchido; MUST NOT alterar um campo que o administrador deixou em branco no fluxo (preserva o valor atual daquela conta).
- **FR-003a**: O lote MUST NOT oferecer limpeza de data de pagamento nem de vencimento; limpar pagamento permanece exclusivo da edição individual.
- **FR-003b**: O lote MUST NOT validar relação entre pagamento e vencimento (não exige pagamento ≥ vencimento); MUST apenas garantir que cada data informada seja uma data de calendário válida.
- **FR-004**: Aplicar data de pagamento em massa MUST seguir a mesma regra de negócio da edição individual quanto ao status pago/pendente (preencher/substituir pagamento marca como paga; o lote não reabre conta paga).
- **FR-005**: A ação em massa MUST exigir confirmação explícita com resumo da quantidade de contas e dos campos que serão alterados.
- **FR-006**: Sem contas selecionadas, a ação em massa MUST NOT disparar.
- **FR-007**: Ao alterar filtros, recorte de mês/ano ou página da listagem, a seleção MUST ser limpa.
- **FR-007a**: Após um lote **bem-sucedido**, a seleção MUST ser limpa automaticamente.
- **FR-008**: Após o lote, o sistema MUST atualizar a listagem e os totais/cards afetados pelas datas e pelo status pago.
- **FR-009**: O visualizador MUST consultar as datas e MUST NOT selecionar nem editar datas em massa.
- **FR-010**: A edição individual de vencimento e pagamento MUST permanecer disponível; esta feature NÃO a substitui.
- **FR-011**: O escopo MUST limitar-se a Contas a Pagar; Contas a Receber e demais módulos ficam fora.
- **FR-012**: Em falha parcial ou total do lote, o sistema MUST informar quantas contas foram atualizadas e quantas não, sem simular sucesso indevido.

### Key Entities

- **Conta a Pagar**: Despesa com data de vencimento, data de pagamento (opcional) e status pago/pendente derivado das regras já usadas na edição individual.
- **Seleção em massa**: Conjunto temporário de contas marcadas na listagem atual, válido apenas enquanto filtros/página não mudarem.
- **Lote de datas**: Operação única (**Editar datas em massa**) que aplica os mesmos valores de vencimento e/ou pagamento a todas as contas da seleção confirmada.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um administrador atualiza vencimento e/ou pagamento de pelo menos 5 contas selecionadas em uma única confirmação, em menos de 1 minuto após a seleção.
- **SC-002**: Em 100% dos lotes cancelados antes da confirmação, nenhuma data das contas selecionadas é alterada.
- **SC-003**: Após um lote bem-sucedido, 100% das contas selecionadas elegíveis exibem as datas aplicadas na listagem e na reabertura individual, os cards refletem o novo estado e a seleção fica vazia.
- **SC-004**: Um visualizador não consegue iniciar nem confirmar edição em massa em nenhuma tentativa.
- **SC-005**: Em teste guiado, o administrador identifica corretamente, antes de confirmar, quantas contas e quais campos (vencimento e/ou pagamento) serão alterados, na primeira tentativa.

## Assumptions

- Papéis existentes: `admin` altera; `visualizador` só consulta.
- A listagem de Contas a Pagar já (ou passará a) oferecer caixa de seleção por linha para ações em massa, no mesmo espírito de outras páginas do produto.
- Preencher ou substituir data de pagamento no lote implica marcar a conta como paga — igual à edição unitária ao informar pagamento.
- Campo deixado em branco no formulário do lote significa “não alterar”, não “apagar”. Não há controle de limpeza no lote.
- Apenas os campos de data de vencimento e data de pagamento entram no lote; valor, categoria, fornecedor, conta corrente, tipo etc. ficam fora.
- Contas a Receber, bônus, comissões e demais módulos estão fora do escopo.
- Confirmação prévia e feedback pós-lote seguem o padrão operacional já usado em ações destrutivas ou em massa no Ocean App.
- Seleção limitada ao que está visível no recorte atual da listagem (linhas e grupos após filtros); não há “selecionar todas as contas do banco” nem todas as do filtro fora da tela nesta entrega.
