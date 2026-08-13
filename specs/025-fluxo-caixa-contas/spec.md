# Feature Specification: Fluxo de Caixa — Conta Corrente e Conta Investimento

**Feature Branch**: `025-fluxo-caixa-contas`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "na tela de fluxo de caixa Criar fluxo \"Conta corrente\" (padrão) e Criar fluxo \"Conta investimento\""

## Clarifications

### Session 2026-08-13

- Q: Como a tela deve apresentar os dois fluxos? → A: Visões exclusivas: seletor Conta corrente / Conta investimento; lista, totais e exportação mostram só o fluxo ativo.
- Q: Para onde vão as Contas a Pagar pagas? → A: Entram só na Conta corrente; sem campo Caixa em Contas a Pagar nesta feature.
- Q: Como ficam card, tabela de saldos e gráfico com visões exclusivas? → A: Recorte completo: card, tabela de saldos e gráfico só da conta do fluxo ativo.
- Q: Ao incluir receita/despesa, a conta pode ser outra? → A: Sem seletor: o lançamento manual vai sempre para o fluxo ativo; para a outra conta, o usuário troca o fluxo antes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Operar o fluxo Conta corrente por padrão (Priority: P1)

Qualquer usuário autenticado com acesso ao **Fluxo de Caixa**, ao abrir a tela, trabalha no fluxo **Conta corrente** (padrão). Nessa visão, vê saldo (card, tabela e gráfico), movimentos, totais de entradas/saídas/resultado e ações de inclusão/exportação **somente** da conta corrente — sem misturar com a conta investimento.

**Why this priority**: É o caminho diário do caixa operacional; o padrão precisa estar correto na primeira abertura, sem o usuário escolher nada.

**Independent Test**: Abrir o Fluxo de Caixa com movimentos nas duas contas no período; confirmar que a visão inicial é Conta corrente e que totais e lista não incluem itens da Conta investimento.

**Acceptance Scenarios**:

1. **Given** um usuário com permissão de Fluxo de Caixa, **When** abre a tela pela primeira vez na sessão, **Then** o fluxo ativo é **Conta corrente**.
2. **Given** o fluxo Conta corrente ativo e dados nas duas contas no período, **When** consulta card de saldo, tabela de saldos, gráfico, lista e totais, **Then** só aparecem saldo e movimentos da Conta corrente.
3. **Given** o fluxo Conta corrente ativo, **When** o administrador inclui receita ou despesa manual, **Then** o lançamento fica no fluxo Conta corrente e o formulário **não** oferece seletor de conta.
4. **Given** um visualizador, **When** abre a tela, **Then** vê o mesmo fluxo padrão Conta corrente em somente leitura.

---

### User Story 2 - Operar o fluxo Conta investimento (Priority: P1)

O usuário troca para o fluxo **Conta investimento** na mesma tela e passa a ver e operar só essa conta: saldo (card, tabela e gráfico), lista, totais, inclusão manual (admin) e exportação do que está visível. A troca não altera mês/ano já selecionados.

**Why this priority**: Sem a segunda visão, o pedido de dois fluxos não se completa; investimento misturado ao operacional impede decisão.

**Independent Test**: Com dados nas duas contas, selecionar Conta investimento e conferir lista/totais só dessa conta; incluir um manual (admin) e confirmar que ele não aparece na Conta corrente.

**Acceptance Scenarios**:

1. **Given** a tela aberta no padrão Conta corrente, **When** o usuário escolhe **Conta investimento**, **Then** card de saldo, tabela de saldos, gráfico, lista, totais e exportação passam a refletir só a Conta investimento, mantendo o mesmo mês/ano.
2. **Given** o fluxo Conta investimento ativo, **When** o administrador inclui receita ou despesa manual, **Then** o lançamento fica no fluxo Conta investimento e o formulário **não** oferece seletor de conta.
3. **Given** um lançamento na Conta investimento, **When** o usuário volta para Conta corrente, **Then** esse lançamento não aparece na lista nem nos totais da corrente.
4. **Given** um visualizador no fluxo Conta investimento, **When** consulta a tela, **Then** vê os movimentos da Conta investimento em somente leitura; não cria nem exclui lançamentos.

---

### User Story 3 - Classificar movimentos no fluxo certo (Priority: P2)

Movimentos automáticos de **Contas a Receber** entram no fluxo correspondente à **Caixa** da origem (corrente ou investimento). Movimentos sem classificação de caixa na origem e **Contas a Pagar** (sem Caixa) caem no fluxo **Conta corrente**. Lançamento manual fica **sempre** no fluxo ativo: não há seletor de conta no formulário; para lançar na outra conta, o administrador troca o fluxo antes.

**Why this priority**: Completa a separação com regra previsível; o MVP já existe se as duas visões filtram o que já estiver classificado e o padrão corrente absorver o restante.

**Independent Test**: Uma Conta a Receber recebida como investimento aparece só no fluxo investimento; uma Conta a Pagar paga aparece só no fluxo corrente; um manual salvo no investimento não migra sozinho para a corrente.

**Acceptance Scenarios**:

1. **Given** uma Conta a Receber recebida com Caixa **corrente**, **When** o usuário está no fluxo Conta corrente, **Then** a entrada aparece nesse fluxo e **não** no de investimento.
2. **Given** uma Conta a Receber recebida com Caixa **investimento**, **When** o usuário está no fluxo Conta investimento, **Then** a entrada aparece nesse fluxo e **não** no corrente.
3. **Given** uma Conta a Pagar paga no período, **When** o usuário consulta os dois fluxos, **Then** a saída aparece no fluxo **Conta corrente** e não no de investimento.
4. **Given** uma Conta a Receber recebida **sem** Caixa, **When** o usuário consulta os fluxos, **Then** a entrada aparece no fluxo **Conta corrente** (padrão) e não no de investimento.
5. **Given** o administrador no fluxo Conta corrente incluindo um manual, **When** salva, **Then** o lançamento aparece só na Conta corrente. **Given** ele troca para Conta investimento e inclui outro manual, **When** salva, **Then** o segundo aparece só na Conta investimento; nenhum dos formulários tem seletor de conta.

---

### Edge Cases

- Abertura da tela: sempre **Conta corrente**, mesmo que a última visita tenha sido investimento (não há memória obrigatória entre sessões).
- Período sem movimentos no fluxo ativo: lista vazia e totais zerados daquela conta; a outra conta pode ter dados, mas não “vaza” para a visão atual.
- Sem saldo registrado no fluxo ativo: card e tabela dessa conta vazios; MUST NOT exibir o saldo da outra conta no lugar.
- Trocar mês/ano com fluxo investimento ativo: permanece em investimento; só o período muda.
- Mesmo título de Contas a Receber não aparece nos dois fluxos ao mesmo tempo.
- Lançamento manual com descrição igual em contas diferentes: convivem, um em cada fluxo.
- Visualizador troca entre os dois fluxos e consulta; não cria, edita nem exclui.
- Exportação: só o que a visão atual mostra (fluxo + período).
- Para lançar manual ou registrar saldo na outra conta: trocar o fluxo ativo antes; não há seletor de conta nos formulários.
- Registro de saldo: a conta gravada é a do fluxo ativo; o admin não escolhe a outra conta no modal.
- Tentativa de reclassificar um manual já salvo para o outro fluxo: fora desta versão (remover e lançar de novo no fluxo desejado).
- Falha ao carregar o período: mensagem compreensível; não inventar totais do fluxo; não misturar contas para “completar” a tela.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A tela Fluxo de Caixa MUST oferecer exatamente dois fluxos em **visões exclusivas**: **Conta corrente** e **Conta investimento**. MUST NOT listar os dois fluxos misturados na mesma tabela nem exibir dois blocos de movimentos ao mesmo tempo.
- **FR-002**: Ao abrir a tela, o sistema MUST ativar o fluxo **Conta corrente** como padrão.
- **FR-003**: O usuário MUST poder alternar o fluxo ativo (seletor **Conta corrente** / **Conta investimento**) sem sair da tela e sem perder o período (mês/ano) já selecionado.
- **FR-004**: Lista de movimentos, totais de entradas, saídas e resultado, e a exportação da tela MUST considerar somente o **fluxo ativo**.
- **FR-005**: Entradas automáticas de Contas a Receber com Caixa **corrente** MUST aparecer só no fluxo Conta corrente; com Caixa **investimento**, só no fluxo Conta investimento.
- **FR-006**: Entradas automáticas de Contas a Receber **sem** Caixa MUST aparecer só no fluxo **Conta corrente**.
- **FR-007**: Saídas automáticas de Contas a Pagar MUST aparecer só no fluxo **Conta corrente**. MUST NOT exigir nem gravar Caixa em Contas a Pagar para essa classificação. MUST NOT aparecer no fluxo Conta investimento.
- **FR-008**: Inclusão de receita ou despesa manual MUST gravar o lançamento no fluxo ativo. MUST NOT exibir seletor de conta nesse formulário.
- **FR-009**: Lançamento manual de um fluxo MUST NOT aparecer na lista nem nos totais do outro fluxo.
- **FR-010**: Usuário **visualizador** MUST consultar os dois fluxos em somente leitura; MUST NOT criar, alterar ou excluir movimentos ou saldos.
- **FR-011**: Administrador MUST incluir receita/despesa e registrar saldo no contexto do fluxo ativo. O registro de saldo MUST gravar a conta do fluxo ativo e MUST NOT oferecer seletor para a outra conta.
- **FR-012**: O sistema MUST identificar de forma visível qual fluxo está ativo (rótulos **Conta corrente** e **Conta investimento**).
- **FR-013**: Regras já definidas de espelho do período (só recebido/pago, sem duplicar, sem omitir só no caixa, coluna Origem) MUST continuar válidas **dentro de cada fluxo**.
- **FR-014**: Card de saldo, tabela de registros de saldo e gráfico de evolução MUST exibir somente a conta do **fluxo ativo**. MUST NOT mostrar ao mesmo tempo o card, as linhas de saldo ou a série do gráfico da outra conta.
- **FR-015**: Se o fluxo ativo não tiver movimentos ou saldos no período, o sistema MUST mostrar estado vazio daquela conta, sem puxar movimentos nem saldos da outra conta.
- **FR-016**: Saldos registrados de conta corrente e conta investimento MUST permanecer gravados de forma distinta; cada registro MUST aparecer só quando o fluxo correspondente estiver ativo.

### Key Entities

- **Fluxo de caixa (visão)**: Recorte exclusivo da tela; um de dois visível por vez: Conta corrente (padrão) ou Conta investimento.
- **Movimento do fluxo**: Entrada ou saída (automática ou manual) pertencente a **um** dos dois fluxos.
- **Conta a Receber**: Origem das entradas automáticas; a Caixa da origem define o fluxo (ausência de Caixa ⇒ Conta corrente).
- **Conta a Pagar**: Origem das saídas automáticas; neste recorte, sempre no fluxo Conta corrente.
- **Lançamento manual**: Receita ou despesa criada no Fluxo de Caixa, vinculada a um dos dois fluxos.
- **Saldo de conta**: Registro periódico já existente de saldo da conta corrente ou da conta investimento, alinhado ao fluxo correspondente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das aberturas de teste da tela, o fluxo inicial é Conta corrente, sem passo extra do usuário.
- **SC-002**: Em menos de 30 segundos, o usuário autenticado troca para Conta investimento e vê saldo (card, tabela e gráfico), lista e totais só dessa conta.
- **SC-003**: Em 100% dos casos de teste, um movimento de Contas a Receber com Caixa investimento não aparece no fluxo Conta corrente, e o inverso também não ocorre.
- **SC-004**: Em 100% dos casos de teste, Contas a Pagar pagas e Contas a Receber sem Caixa aparecem somente no fluxo Conta corrente.
- **SC-005**: Em 100% das inclusões manuais de teste, o lançamento fica no fluxo que estava ativo e o formulário não apresenta escolha de conta.
- **SC-006**: Em 100% das exportações de teste, o resultado contém apenas os movimentos visíveis do fluxo ativo e do período.
- **SC-007**: Em 100% das inspeções com visualizador, a troca entre fluxos funciona e não há ações de escrita.
- **SC-008**: Pelo menos 90% dos usuários de teste identificam qual fluxo está ativo sem treinar, pelo rótulo na tela.

## Assumptions

- Os dois fluxos vivem na **mesma** tela Fluxo de Caixa; não há menus novos.
- **Conta corrente** é o caixa operacional padrão; **Conta investimento** é o segundo caixa, separado.
- Papéis admin / visualizador e a permissão de menu Fluxo de Caixa seguem o produto.
- O espelho automático de Contas a Receber/Pagar (feature 024) permanece; esta feature **separa** esses movimentos por fluxo, não redefine o que é recebido/pago.
- Contas a Pagar continuam sem campo de Caixa; saídas automáticas entram somente no fluxo Conta corrente (decisão desta sessão).
- Contas a Receber sem Caixa não ficam de fora do caixa: vão para Conta corrente.
- Não é obrigatório lembrar o último fluxo entre sessões.
- Não há um terceiro modo “todas as contas” nesta versão.
- Transferência entre corrente e investimento, se necessária, é feita com lançamentos manuais em cada fluxo; não há tipo especial “transferência” nesta versão.
- O recorte exclusivo vale para movimentos, totais, card de saldo, tabela de saldos e gráfico (decisão desta sessão).
- Inclusão manual e registro de saldo não têm seletor de conta; a conta é a do fluxo ativo (decisão desta sessão).
- Reclassificar manual já salvo entre contas está fora; o caminho é remover e lançar de novo no fluxo certo.

## Out of Scope

- Criar um terceiro fluxo, lista misturada das duas contas, dois blocos de movimentos ao mesmo tempo, ou exibir card/tabela/gráfico das duas contas na mesma visão.
- Incluir campo Caixa em Contas a Pagar ou obrigar recadastro das contas já pagas.
- Impedir entrada no caixa de Contas a Receber sem Caixa (elas seguem no padrão corrente).
- Recalcular automaticamente o saldo registrado a partir dos movimentos.
- Tipo especial de transferência entre contas.
- Novos módulos, dashboard, calendário ou alteração das regras de pagamento em Contas a Receber/Pagar.
- Memória persistente do último fluxo escolhido (pode ser evolução futura).
- Seletor de conta nos formulários de receita, despesa ou saldo; reclassificar lançamento manual já gravado.
