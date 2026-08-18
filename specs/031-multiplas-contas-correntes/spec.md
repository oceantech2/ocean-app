# Feature Specification: Múltiplas contas correntes

**Feature Branch**: `031-multiplas-contas-correntes`

**Created**: 2026-08-17

**Status**: Draft

**Input**: User description: "deve ser possível permitir inserir mais de uma conta corrente"

## Clarifications

### Session 2026-08-17

- Q: NFs e demais origens automáticas escolhem conta corrente no recebimento? → A: Sempre entram na conta corrente padrão; se o usuário quiser outra conta, altera depois manualmente.
- Q: Como o administrador muda o caixa depois? → A: Reclassificar na origem (editar o caixa da NF ou da Conta a Receber).
- Q: Onde o administrador cadastra as contas correntes? → A: No Fluxo de Caixa, com ação de gerenciar contas na mesma tela.
- Q: Quais dados a conta corrente exige no cadastro? → A: Nome e banco obrigatórios; agência e número da conta opcionais.
- Q: Como fica o card de saldo de conta corrente na dashboard? → A: Um único card consolidado (soma das contas correntes ativas).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar mais de uma conta corrente (Priority: P1)

O administrador, **na tela Fluxo de Caixa**, usa a ação de **gerenciar contas** para cadastrar contas correntes adicionais. Cada conta tem **nome identificador** e **banco** obrigatórios (ex.: “Corrente Itaú” / Itaú); **agência** e **número da conta** são opcionais. Não há item de menu novo. Depois do cadastro, cada conta corrente é um caixa próprio no seletor da mesma tela, distinguida pelo nome. O visualizador consulta a lista em somente leitura e não cadastra, edita nem desativa contas.

**Why this priority**: Sem poder inserir a segunda conta corrente, o pedido não se cumpre; hoje existe apenas um caixa operacional chamado Conta corrente.

**Independent Test**: Com a conta corrente já existente, o administrador abre Gerenciar contas no Fluxo de Caixa, cria uma segunda com nome e banco distintos e as duas aparecem no seletor da mesma tela.

**Acceptance Scenarios**:

1. **Given** um administrador autenticado no Fluxo de Caixa, **When** abre gerenciar contas, cadastra uma nova conta corrente com nome identificador e banco válidos e confirma, **Then** a conta passa a existir e fica disponível no seletor da mesma tela, além da(s) já existente(s).
2. **Given** já existir pelo menos uma conta corrente, **When** o administrador cadastra outra com nome diferente e banco informado, **Then** o sistema aceita; MUST NOT impedir o cadastro só porque já existe uma conta corrente.
3. **Given** o administrador tenta cadastrar uma conta corrente sem nome, sem banco, ou com nome igual a outra conta corrente ativa, **When** confirma, **Then** o sistema recusa e informa o motivo; nada é gravado.
4. **Given** um visualizador no Fluxo de Caixa, **When** acessa gerenciar contas, **Then** vê a lista em somente leitura e **não** cria, altera nem desativa contas.

---

### User Story 2 - Operar cada conta corrente no Fluxo de Caixa (Priority: P1)

Qualquer usuário com acesso ao **Fluxo de Caixa** escolhe **qual** conta corrente está ativa (visão exclusiva, como hoje entre corrente e investimento). Saldo visível, lista de movimentos, totais e exportação mostram **somente** a conta corrente selecionada. A **Conta investimento** permanece um caixa único, separado. Na abertura da tela, o fluxo padrão é a conta corrente marcada como **padrão**.

**Why this priority**: Cadastrar várias contas sem poder operá-las isoladas misturaria o caixa operacional e anularia o valor do cadastro.

**Independent Test**: Com duas contas correntes e movimentos em cada uma, selecionar a primeira e conferir que a segunda não aparece; repetir o inverso; conferir que investimento continua acessível e isolado.

**Acceptance Scenarios**:

1. **Given** duas ou mais contas correntes cadastradas, **When** o usuário abre o Fluxo de Caixa, **Then** o fluxo ativo é a conta corrente **padrão** e o seletor lista cada conta corrente pelo nome, mais a Conta investimento.
2. **Given** o fluxo de uma conta corrente específica ativo, **When** o usuário consulta saldo visível, lista, totais e exportação, **Then** só entram movimentos e saldo daquela conta; as demais contas correntes e o investimento não misturam.
3. **Given** a tela na conta corrente A, **When** o usuário escolhe a conta corrente B, **Then** a visão passa a ser só de B, mantendo o mesmo mês/ano.
4. **Given** um visualizador, **When** troca entre as contas correntes e o investimento, **Then** consulta em somente leitura; não transfere nem altera cadastro de contas.

---

### User Story 3 - Entradas e saídas automáticas na conta corrente padrão (Priority: P2)

NFs recebidas, Contas a Receber recebidas e Contas a Pagar pagas entram **sempre** na conta corrente **padrão**, sem o usuário escolher a conta no momento do recebimento ou do pagamento. Se a NF ou a Conta a Receber deveria estar em outra conta corrente (ou no investimento), o administrador **edita o caixa na própria origem**; o movimento some da padrão e passa a aparecer só no caixa corrigido. Transferência no Fluxo de Caixa permanece para dinheiro que de fato mudou de caixa, não para corrigir classificação. Contas a Pagar não têm caixa na origem: permanecem na padrão (mover valor, se necessário, é transferência).

**Why this priority**: Evita passo extra no fluxo diário; a correção fica no documento que gerou a entrada.

**Independent Test**: Receber NF e Conta a Receber e pagar uma Conta a Pagar; as três linhas só na padrão. Editar o caixa da NF para a outra conta corrente e confirmar que a entrada saiu da padrão e entrou só na outra.

**Acceptance Scenarios**:

1. **Given** duas contas correntes ativas, **When** o administrador marca uma NF ou uma Conta a Receber como recebida, **Then** a entrada aparece somente no fluxo da conta corrente **padrão**; MUST NOT exigir escolha de conta nesse momento.
2. **Given** uma Conta a Pagar paga no período, **When** o usuário consulta os fluxos, **Then** a saída aparece somente na conta corrente **padrão**.
3. **Given** uma NF ou Conta a Receber já recebida na padrão, **When** o administrador edita o caixa da origem para a conta corrente B (ou investimento), **Then** a entrada deixa de aparecer na padrão e passa a aparecer só no caixa escolhido; MUST NOT criar um segundo movimento.
4. **Given** um administrador no Fluxo de Caixa, **When** transfere valor da conta corrente A para a conta corrente B (ou de/para investimento), **Then** a origem registra saída e o destino entrada do mesmo valor; origem e destino iguais são recusados.

---

### Edge Cases

- Tentativa de cadastrar a segunda conta corrente: deve ser permitida; o sistema MUST NOT limitar a “apenas uma” conta corrente.
- Nome duplicado entre contas correntes ativas: recusa; nomes iguais a “Conta investimento” (ou ao nome visível do investimento) MUST NOT ser aceitos para evitar confusão no seletor.
- Cadastro ou edição sem nome ou sem banco: recusa; agência ou número vazios são aceitos.
- Desativar a conta corrente padrão: o sistema recusa até o administrador indicar outra como padrão, ou recusa se for a única conta corrente ativa.
- Desativar conta corrente que ainda tem movimentos ou saldo no histórico: a conta deixa de aparecer como opção para **novos** lançamentos, mas permanece consultável no Fluxo de Caixa para períodos em que houve movimento; MUST NOT apagar o histórico.
- Única conta corrente ativa: o seletor ainda lista essa conta e o investimento; o comportamento de visão exclusiva permanece.
- Dados já existentes classificados só como “corrente”: passam a pertencer à conta corrente **padrão** (a conta que já existia).
- Recebimento de NF ou Conta a Receber e pagamento de Conta a Pagar: sempre a padrão, mesmo que existam outras contas correntes; não há seletor de conta nessa hora.
- Correção posterior de NF ou Conta a Receber: o administrador edita o caixa na origem; o visualizador não. MUST NOT usar transferência só para “consertar” a classificação.
- Reclassificar para conta corrente desativada: recusa; só contas correntes ativas e o investimento.
- Conta a Pagar paga: não há reclassificação de caixa na origem nesta versão.
- Dashboard: o card de saldo de conta corrente mostra a **soma** dos saldos visíveis de todas as contas correntes ativas no recorte de mês/ano já vigente; o detalhe por conta continua no Fluxo de Caixa.
- Visualizador não cadastra contas nem transfere; consulta todas as contas correntes existentes.
- Falha ao salvar cadastro: mensagem compreensível; lista e fluxos permanecem no estado anterior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir cadastrar **duas ou mais** contas correntes ativas ao mesmo tempo. MUST NOT restringir o operacional a uma única conta corrente.
- **FR-002**: Cada conta corrente MUST ter **nome identificador** e **banco** obrigatórios. Agência e número da conta MUST ser opcionais. O nome MUST ser único entre contas correntes ativas e visível no seletor do Fluxo de Caixa.
- **FR-003**: Exatamente uma conta corrente ativa MUST ser a **padrão** (abertura do Fluxo de Caixa e destino de todos os movimentos automáticos de NF recebida, Conta a Receber recebida e Conta a Pagar paga).
- **FR-004**: No Fluxo de Caixa, o administrador MUST poder **gerenciar contas** (criar, editar nome/banco/agência/número, marcar como padrão e desativar contas correntes) **na mesma tela**, sem item de menu novo. O visualizador MUST consultar essa lista em somente leitura.
- **FR-005**: MUST NOT ser possível desativar a última conta corrente ativa nem desativar a padrão sem antes definir outra padrão.
- **FR-006**: O Fluxo de Caixa MUST listar cada conta corrente ativa (pelo nome) e a Conta investimento em visões exclusivas; lista, totais, saldo visível, gráfico e exportação MUST considerar só o caixa ativo.
- **FR-007**: Ao abrir o Fluxo de Caixa, o sistema MUST ativar a conta corrente **padrão**.
- **FR-008**: NFs recebidas e Contas a Receber recebidas MUST gravar a entrada na conta corrente **padrão**. MUST NOT exigir escolha de conta corrente (nem de investimento) no momento do recebimento.
- **FR-009**: Contas a Pagar pagas MUST gravar a saída na conta corrente **padrão**. MUST NOT exigir campo de caixa em Contas a Pagar nesta versão.
- **FR-015**: Depois do recebimento, o administrador MUST poder **editar o caixa na NF ou na Conta a Receber** para outra conta corrente ativa ou para o investimento. O movimento automático MUST mudar de caixa (sair da padrão e aparecer só no destino). MUST NOT duplicar a entrada. O visualizador MUST NOT editar o caixa. Contas a Pagar MUST NOT ganhar campo de caixa para essa correção.
- **FR-010**: Transferência MUST aceitar qualquer par de caixas distintos entre as contas correntes ativas e o investimento, com as regras já vigentes de valor (positivo, não superior ao saldo visível da origem) e recusa se origem = destino.
- **FR-011**: Movimentos e saldos históricos hoje associados ao caixa único “corrente” MUST permanecer visíveis na conta corrente **padrão**, sem exigir recadastro manual.
- **FR-012**: A dashboard MUST exibir **um único** card de saldo de conta corrente com a **soma** dos saldos visíveis de todas as contas correntes **ativas** no recorte de mês/ano já vigente. MUST NOT exibir um card por conta corrente nem omitir contas ativas da soma. MUST NOT substituir o card de investimento.
- **FR-013**: Conta investimento MUST permanecer um único caixa; esta feature MUST NOT exigir cadastro de várias contas investimento.
- **FR-014**: Contas correntes desativadas MUST NOT ser oferecidas para novos recebimentos, transferências de destino/origem de contas inativas, nem como nova padrão, mas MUST permanecer consultáveis onde já houver histórico.

### Key Entities

- **Conta corrente**: Caixa operacional da empresa com nome, banco (obrigatórios) e agência/número (opcionais); pode haver várias ativas; uma delas é a padrão.
- **Conta investimento**: Caixa único já existente, distinto das contas correntes.
- **Padrão**: Atributo da conta corrente usada na abertura do Fluxo de Caixa e como destino inicial de todo movimento automático (NF, Conta a Receber, Conta a Pagar).
- **Caixa da origem**: Atributo da NF ou da Conta a Receber que define em qual caixa a entrada aparece no Fluxo de Caixa; no recebimento inicia na conta corrente padrão e pode ser reclassificado depois.
- **Movimento do fluxo**: Entrada ou saída (automática ou transferência) pertencente a **um** caixa (uma conta corrente específica ou o investimento).
- **Saldo visível**: Posição do caixa ativo (histórico + movimentos), calculada por conta, não misturada entre contas correntes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes, o administrador consegue cadastrar uma segunda conta corrente com nome e banco e vê as duas no seletor do Fluxo de Caixa em menos de 2 minutos.
- **SC-002**: Em 100% das aberturas de teste do Fluxo de Caixa, o fluxo inicial é a conta corrente padrão, sem passo extra.
- **SC-003**: Em 100% dos casos de teste com duas contas correntes, movimentos da conta A não aparecem na visão da conta B, e nenhum movimento de conta corrente aparece na visão de investimento (e o inverso também não).
- **SC-004**: Em 100% dos testes, NF recebida e Conta a Receber recebida aparecem somente na conta corrente padrão, sem passo de escolha de conta no recebimento.
- **SC-005**: Em 100% dos testes, Contas a Pagar pagas aparecem somente na conta corrente padrão.
- **SC-006**: Em 100% das transferências de teste entre duas contas correntes distintas, origem e destino refletem o mesmo valor em lados opostos e a operação com origem = destino é recusada.
- **SC-007**: Em 100% das inspeções com visualizador, há consulta às contas correntes e não há cadastro, transferência nem edição de caixa na origem.
- **SC-008**: Pelo menos 90% dos usuários de teste identificam no seletor qual conta corrente está ativa pelo nome cadastrado, sem treinar.
- **SC-009**: Em 100% dos testes de reclassificação, editar o caixa de uma NF ou Conta a Receber da padrão para outra conta faz a entrada aparecer só no destino, sem linha duplicada na padrão.
- **SC-010**: Em 100% dos testes com duas ou mais contas correntes ativas, a dashboard mostra exatamente um card de conta corrente cujo valor é a soma dos saldos visíveis dessas contas no recorte, e exatamente um card de investimento.

## Assumptions

- O pedido trata de **vários caixas operacionais** (várias contas correntes da empresa), não de vários registros de saldo no mesmo mês para o mesmo caixa único.
- A conta corrente que já existe no produto torna-se a primeira conta e a **padrão**, herdando movimentos e saldos hoje classificados como “corrente”; o administrador informa o banco (e, se quiser, agência/número) em gerenciar contas.
- Cadastro de contas correntes é feito pelo administrador na tela **Fluxo de Caixa** (ação gerenciar contas); não há novo item de menu.
- No cadastro, nome e banco são obrigatórios; agência e número da conta são opcionais. O seletor do fluxo continua usando o **nome**.
- Conta investimento continua única; múltiplas contas investimento estão fora.
- Regras vigentes de papéis (admin vs visualizador), visão exclusiva do Fluxo de Caixa, espelho de recebido/pago, recusa de transferência acima do saldo visível e dashboard (filtro mês/ano, card de investimento) permanecem, apenas estendidas a N contas correntes.
- NFs, Contas a Receber e Contas a Pagar não pedem conta no ato do recebido/pago: sempre a conta corrente padrão.
- Correção de classificação: editar o caixa na NF ou na Conta a Receber. Transferência não substitui essa correção.
- Contas a Pagar seguem sem campo de caixa no pagamento e sem reclassificação de caixa na origem.
- Dashboard: **um** card de conta corrente com a soma das contas correntes ativas; detalhe por conta só no Fluxo de Caixa. MUST NOT haver um card por conta na dashboard.
- Desativar é o caminho para “remover” conta com histórico; exclusão física de conta com movimentos está fora.

## Out of Scope

- Um card de saldo por conta corrente na dashboard (o consolidado é o recorte desta versão).
- Permitir várias contas investimento.
- Escolher conta corrente (ou investimento) no momento de receber NF, receber Conta a Receber ou pagar Conta a Pagar.
- Campo de caixa em Contas a Pagar no pagamento, reclassificação de caixa de Conta a Pagar, ou recadastro obrigatório de contas já pagas.
- Usar transferência apenas para corrigir classificação de NF ou Conta a Receber.
- Novo item de menu exclusivo só para contas bancárias.
- Exigir agência ou número da conta para gravar a conta corrente.
- Extrato bancário, conciliação automática, Open Banking ou importação de OFX.
- Alterar portas, autenticação ou papéis além do uso já estabelecido de admin e visualizador.
