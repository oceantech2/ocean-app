# Feature Specification: Seleção de conta corrente

**Feature Branch**: `036-selecao-conta-corrente`

**Created**: 2026-08-18

**Status**: Draft

**Input**: User description: "anteriormente removemos o campo de conta corrente, porém deve voltar pois agora ele poderá selecionar qual conta corrente tendo em vista que terá mais de uma; além disso em fluxo de caixa em transferencia agora deve ser possível escolher a conta corrente desejada"

## Clarifications

### Session 2026-08-18

- Q: Onde o campo de conta corrente deve voltar? → A: Contas a Receber, NFs e também Contas a Pagar no pagamento
- Q: A lista do campo inclui investimento? → A: Não: só contas correntes; investimento só na transferência
- Q: Como fica a Transferência com várias contas? → A: Só listas de origem e destino, sem Inverter
- Q: Ao abrir Transferência, como inicia o par? → A: Origem = fluxo ativo; destino = investimento (se origem for corrente) ou conta padrão (se origem for investimento)
- Q: A listagem de NFs mostra a conta corrente? → A: Sim: coluna com o nome da conta (como em Receber e Pagar)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Escolher a conta corrente no recebimento (Priority: P1)

O administrador, em **Contas a Receber**, **NFs** e **Contas a Pagar**, volta a ver o campo de **conta corrente**. Com **mais de uma** conta corrente cadastrada, ele **escolhe qual** no recebimento (Recebido / formulário, inclusive criar já recebida) e no **pagamento** (Contas a Pagar). A lista mostra **somente** contas correntes **ativas**, pelo nome — **não** inclui Conta investimento. Para mover valor de/para investimento, usa-se **Transferência** no Fluxo de Caixa. O visualizador vê a classificação e não a altera.

**Why this priority**: Sem o campo, recebimento e pagamento caem na conta padrão e o administrador não consegue indicar a conta certa no ato, que é o motivo de restaurar o campo agora que há várias contas.

**Independent Test**: Com duas contas correntes ativas, marcar uma Conta a Receber, uma NF e uma Conta a Pagar (pago) escolhendo a conta B (não a padrão); conferir que a entrada ou saída aparece só no fluxo da conta B.

**Acceptance Scenarios**:

1. **Given** um administrador na página Contas a Receber, **When** abre criação, edição ou o modal **Recebido**, **Then** vê o campo para escolher entre as contas correntes ativas (pelo nome) e **não** vê Conta investimento nessa lista.
2. **Given** o administrador marcando uma conta a receber como recebida, **When** seleciona a conta corrente B e informa a data de pagamento, **Then** o recebimento grava essa conta e a entrada no Fluxo de Caixa aparece **somente** em B.
3. **Given** o administrador marcando uma NF como recebida, **When** escolhe a conta corrente desejada (incluindo no primeiro recebimento, não só depois de já recebida), **Then** a entrada aparece só nessa conta.
4. **Given** o administrador marcando uma Conta a Pagar como paga (ação rápida ou formulário, inclusive criar já paga), **When** escolhe a conta corrente B e confirma, **Then** a saída aparece **somente** no fluxo de B.
5. **Given** o campo aberto sem o usuário ter escolhido, **When** o formulário inicia, **Then** a opção pré-selecionada é a conta corrente **padrão**; o administrador pode trocar antes de confirmar.
6. **Given** um visualizador, **When** consulta Contas a Receber, NFs ou Contas a Pagar, **Then** vê qual conta está associada (quando houver) e **não** altera o campo.

---

### User Story 2 - Ver a conta corrente na listagem (Priority: P1)

Qualquer usuário com acesso a **Contas a Receber**, **Contas a Pagar** ou **NFs** identifica, na tabela, em qual **conta corrente** cada item está classificado, pelo **nome** — sem abrir o registro. A exportação gerada nessas páginas inclui a mesma informação.

**Why this priority**: Com várias contas, a listagem sem a coluna força abrir cada item para conferir de qual caixa o dinheiro entrou ou saiu.

**Independent Test**: Ter registros na padrão e em outra conta corrente; abrir as listagens de Receber, Pagar e NFs e as exportações e conferir os nomes.

**Acceptance Scenarios**:

1. **Given** NFs, contas a receber e contas a pagar classificadas em contas correntes distintas, **When** o usuário abre cada listagem, **Then** cada linha mostra o nome da conta correspondente (não um rótulo genérico único “corrente” para todas).
2. **Given** uma NF ainda **não recebida**, uma conta a receber ainda **não recebida** ou uma conta a pagar ainda **não paga** sem classificação, **When** aparece na lista, **Then** a célula fica vazia ou com traço (“—”), sem inventar conta.
3. **Given** a exportação da página NFs, Contas a Receber ou Contas a Pagar, **When** o usuário exporta, **Then** o resultado inclui o nome da conta corrente de cada registro, alinhado ao que a tela mostra.
4. **Given** um visualizador, **When** lê as listagens, **Then** vê a coluna e não a edita.

---

### User Story 3 - Escolher contas na transferência do Fluxo de Caixa (Priority: P1)

O administrador abre **Transferência** no Fluxo de Caixa e **escolhe** origem e destino em **listas**. Com várias contas correntes, origem e destino são selecionáveis entre **todas** as contas correntes **ativas** e a **Conta investimento**. **Não** há controle **Inverter**: a troca de sentido é escolher outra origem e outro destino. Os nomes das contas correntes distinguem uma da outra. Origem e destino devem ser distintos. O visualizador continua sem Transferência.

**Why this priority**: A transferência entre caixas só tem valor operacional se o administrador puder indicar **qual** conta corrente entra no movimento, não só “a corrente” genérica.

**Independent Test**: Com duas contas correntes e o investimento, transferir da conta A para a B; depois da B para o investimento; conferir saída na origem escolhida e entrada no destino escolhido.

**Acceptance Scenarios**:

1. **Given** um administrador no Fluxo de Caixa com duas ou mais contas correntes ativas, **When** abre **Transferência**, **Then** escolhe origem e destino em listas (contas correntes pelo nome e Conta investimento) e **não** vê controle Inverter.
2. **Given** origem conta corrente A e destino conta corrente B, **When** confirma valor e data válidos, **Then** A registra a saída e B a entrada do mesmo valor na mesma data.
3. **Given** origem uma conta corrente e destino Conta investimento (ou o inverso), **When** confirma, **Then** o par grava nos dois caixas escolhidos, como já ocorre para transferência entre caixas distintos.
4. **Given** o fluxo ativo sendo a conta corrente A, **When** o administrador abre Transferência, **Then** origem inicia em A e destino inicia em **Conta investimento**; o administrador pode mudar os dois nas listas antes de salvar.
5. **Given** o fluxo ativo sendo Conta investimento, **When** abre Transferência, **Then** origem inicia em Conta investimento e destino inicia na conta corrente **padrão**.
6. **Given** origem igual ao destino, **When** tenta confirmar, **Then** a operação é recusada, nada é gravado e o usuário recebe mensagem compreensível.
7. **Given** um visualizador, **When** abre o Fluxo de Caixa, **Then** não vê Transferência nem escolha de contas nessa ação.

---

### Edge Cases

- Uma única conta corrente ativa: o campo lista só essa conta; a transferência lista essa conta **e** o investimento e exige origem ≠ destino.
- Campo na origem (NF, Receber, Pagar): MUST NOT oferecer Conta investimento; caminho para investimento é transferência.
- Registro legado classificado como investimento: a listagem pode mostrar investimento para conferência; o campo de edição **não** oferece investimento; ao salvar recebido/pago de novo, o administrador escolhe uma conta corrente e o movimento passa a essa conta (sem duplicar).
- Conta corrente desativada: **não** aparece como opção nova no campo nem como origem/destino de **nova** transferência; registros já classificados nela permanecem consultáveis.
- Recebimento sem escolher conta (campo vazio): recusa até haver uma conta válida; não grava “sempre a padrão” em silêncio quando o campo está visível e obrigatório no recebimento.
- Conta a receber ainda pendente ou conta a pagar ainda não paga: classificação pode ficar vazia até o recebimento/pagamento; nesse ato a conta passa a ser obrigatória.
- NF ou conta a receber já recebida, ou conta a pagar já paga: o administrador pode alterar a conta; o movimento no Fluxo de Caixa acompanha a nova escolha, sem duplicar a entrada ou a saída.
- Registro legado recebido/pago sem classificação: na listagem “—”; ao editar e salvar como recebido/pago, exige escolher a conta.
- Tentativa de inverter origem e destino por um botão: **não** existe; o administrador altera as duas listas.
- Falha ao gravar recebimento ou transferência: mensagem compreensível; estado anterior preservado.
- Papel visualizador: consulta conta na listagem/formulário; não altera; não transfere.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST voltar a apresentar o campo de escolha de conta (conta corrente / caixa) em **Contas a Receber** (criação, edição e modal Recebido), em **NFs** no momento de registrar o recebimento e em **Contas a Pagar** no momento de registrar o pagamento (criação, edição e ação de pagar). MUST NOT ocultar esse campo só porque existiu uma fase com uma única conta operacional.
- **FR-002**: O campo nas origens (NF, Contas a Receber, Contas a Pagar) MUST listar **somente contas correntes ativas**, pelo nome cadastrado. MUST NOT incluir Conta investimento nessa lista. MUST NOT oferecer só o rótulo genérico “Corrente” quando houver mais de uma conta corrente.
- **FR-003**: Ao marcar NF ou Conta a Receber como recebida (ou criar já recebida), e ao marcar Conta a Pagar como paga (ou criar já paga), o administrador MUST escolher a conta. O sistema MUST gravar essa escolha e MUST refletir a entrada ou a saída **somente** no fluxo correspondente. MUST NOT forçar sempre a conta padrão quando o usuário escolheu outra.
- **FR-004**: Na abertura do campo, o sistema MUST pré-selecionar a conta corrente **padrão**. O administrador MUST poder alterar antes de confirmar.
- **FR-005**: As listagens de **NFs**, Contas a Receber e Contas a Pagar MUST exibir a conta corrente escolhida pelo nome. Item sem classificação MUST aparecer vazio ou “—”. A exportação dessas páginas MUST incluir o mesmo dado. Item legado em investimento MAY aparecer na listagem para conferência, sem permitir escolher investimento no campo.
- **FR-006**: O visualizador MUST consultar a conta e MUST NOT alterá-la. MUST NOT usar Transferência.
- **FR-007**: No Fluxo de Caixa, a ação **Transferência** MUST permitir **escolher** origem e destino em listas entre as contas correntes ativas (pelo nome) e a Conta investimento. MUST NOT restringir a escolha a inverter um par fixo. MUST NOT exibir controle **Inverter**.
- **FR-008**: Transferência MUST recusar origem = destino, valor inválido ou valor acima do saldo visível da origem escolhida, sem gravar nenhum lado.
- **FR-009**: Regras já vigentes de par ligado (saída + entrada, mesmo valor e data), texto de/para o caixa contraposto, papéis e desfazer os dois lados MUST permanecer. Esta feature apenas torna a **escolha da conta corrente** explícita.
- **FR-010**: Contas correntes desativadas MUST NOT entrar como opção de novo recebimento, novo pagamento nem de nova transferência; histórico já classificado MUST permanecer visível no Fluxo de Caixa nos períodos em que existir.
- **FR-011**: Ao abrir Transferência, a origem MUST iniciar no **fluxo ativo**. Se a origem for uma conta corrente, o destino MUST iniciar em **Conta investimento**. Se a origem for Conta investimento, o destino MUST iniciar na conta corrente **padrão**. O administrador MUST poder alterar origem e destino nas listas antes de confirmar.

### Key Entities

- **Conta corrente**: Caixa operacional cadastrado (várias ativas); identificada pelo nome na escolha e no seletor do Fluxo de Caixa.
- **Conta investimento**: Caixa único selecionável **somente** na transferência (origem ou destino), não no campo das origens.
- **Padrão**: Conta corrente usada como valor inicial do campo e na abertura do Fluxo de Caixa; **não** substitui a escolha do administrador no recebimento nem na transferência.
- **Classificação de conta na origem**: Atributo da NF, da Conta a Receber ou da Conta a Pagar que define em **qual conta corrente** a entrada ou a saída aparece.
- **Transferência**: Movimento interno em que origem e destino são caixas distintos escolhidos pelo administrador.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das inspeções de Contas a Receber, NFs e Contas a Pagar (listagem, formulários e ações de recebido/pago), o campo e a coluna de conta corrente estão visíveis para o administrador.
- **SC-002**: Em 100% dos testes com duas contas correntes, o administrador conclui um recebimento ou um pagamento na conta não padrão em menos de 1 minuto e o movimento não aparece na conta padrão.
- **SC-003**: Em 100% das listagens de teste, o nome da conta na tabela coincide com a conta gravada; itens sem classificação mostram vazio ou “—”.
- **SC-004**: Em 100% das transferências de teste entre duas contas correntes distintas, origem e destino refletem o par escolhido (mesmo valor, lados opostos) e origem = destino é recusada.
- **SC-005**: Em menos de 1 minuto, o administrador escolhe origem, destino (incluindo a conta corrente desejada), data e valor válidos e confirma a transferência.
- **SC-006**: Em 100% das inspeções com visualizador, há consulta da conta na origem e não há alteração nem Transferência.
- **SC-007**: Pelo menos 90% dos usuários de teste identificam no campo e na transferência **qual** conta corrente está selecionada pelo nome, sem treinar.

## Assumptions

- Esta feature **reabre** a escolha de conta que a 019 ocultou em Contas a Receber e amplia a 031/028: recebimento e pagamento **não** são mais “sempre a padrão sem seletor”; transferência usa **listas** de origem e destino, **sem** Inverter.
- O cadastro de várias contas correntes (031) já existe ou entra em paralelo: o campo lista as contas ativas pelo nome.
- Conta investimento **não** entra no campo das origens; só na transferência entre caixas.
- Contas a Pagar **ganham** o mesmo campo no pagamento: a saída vai para a conta escolhida, não automaticamente para a padrão.
- Pré-seleção do campo nas origens = conta corrente padrão; o usuário confirma ou troca.
- Pré-seleção da Transferência: origem = fluxo ativo; destino = investimento se a origem for corrente, ou conta corrente padrão se a origem for investimento.
- Papéis admin (escreve) e visualizador (só lê) não mudam.
- Regras de saldo visível, recusa acima do saldo, par ligado e desfazer transferência permanecem.
- Rótulo do campo na origem pode ser o já conhecido **Caixa** ou **Conta corrente**, desde que a lista mostre os **nomes** das contas correntes.

## Out of Scope

- Escolher Conta investimento no campo de NF, Contas a Receber ou Contas a Pagar (investimento só via transferência).
- Controle **Inverter** na Transferência (sentido se define pelas listas de origem e destino).
- Cadastrar contas correntes (já coberto pela 031).
- Um card por conta na dashboard.
- Várias contas investimento.
- Extrato bancário, conciliação ou Open Banking.
- Alterar autenticação, papéis ou portas.
