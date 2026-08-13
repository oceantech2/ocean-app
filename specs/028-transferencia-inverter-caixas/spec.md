# Feature Specification: Fluxo de Caixa — Inverter origem e destino da transferência

**Feature Branch**: `028-transferencia-inverter-caixas`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "na tela de fluxo de caixa tem um botao de transferencia, lá pede para selecionar a origem e o destino, porém tem apenas 2 opções, logo se vc seleciona uma em origem obrigatoriamente a outra será o destino, poderia fazer uma UI que basicmente vc consegue apenas inverter ambos"

## Clarifications

### Session 2026-08-13

- Q: Como o par e a inversão devem aparecer? → A: Origem e destino em texto (somente leitura); um controle **Inverter** troca os dois.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver o par e inverter origem e destino em um gesto (Priority: P1)

O administrador abre **Transferência** no Fluxo de Caixa. Origem e destino aparecem em **texto somente leitura** (nomes dos caixas), sem listas de escolha. Como só existem **Conta corrente** e **Conta investimento**, o destino é sempre o outro caixa. Um controle **Inverter** troca os dois papéis: o que era origem vira destino e o que era destino vira origem.

**Why this priority**: É o pedido principal. Duas escolhas independentes são redundantes e permitem combinação inválida (origem = destino) ou destino desalinhado.

**Independent Test**: Abrir Transferência, anotar origem e destino, acionar **Inverter**, conferir que os dois textos trocaram de lugar; valor, data e observação (se preenchidos) permanecem.

**Acceptance Scenarios**:

1. **Given** o administrador no Fluxo de Caixa, **When** abre **Transferência**, **Then** vê origem e destino em texto somente leitura (Conta corrente e Conta investimento) e o controle **Inverter**, sem listas para escolher as contas.
2. **Given** origem Conta corrente e destino Conta investimento, **When** o administrador aciona **Inverter**, **Then** origem passa a ser Conta investimento e destino Conta corrente.
3. **Given** o par já invertido, **When** aciona **Inverter** de novo, **Then** o par volta ao sentido anterior.
4. **Given** valor, data e observação já preenchidos, **When** aciona **Inverter**, **Then** esses campos **não** são apagados; só os textos de origem e destino trocam.

---

### User Story 2 - Confirmar a transferência no sentido visível (Priority: P1)

Depois de ajustar o sentido (incluindo **Inverter**), o administrador informa valor e data (observação opcional) e confirma. A transferência continua movendo o valor **da origem visível para o destino visível**, com as mesmas regras de negócio já vigentes (saldo da origem, caixas distintos, papéis).

**Why this priority**: A nova UI não pode alterar o significado da operação; só reduz atrito para escolher o sentido.

**Independent Test**: Abrir Transferência, acionar **Inverter** no par padrão, confirmar um valor válido; conferir saída no caixa que estava visível como origem e entrada no que estava visível como destino.

**Acceptance Scenarios**:

1. **Given** o par invertido em relação ao padrão da abertura, **When** o administrador confirma um valor válido, **Then** a saída ocorre no caixa mostrado como origem e a entrada no mostrado como destino.
2. **Given** o administrador acionando **Inverter**, **When** olha o saldo visível da origem, **Then** o valor apresentado corresponde ao caixa **atual** de origem (não ao de antes da inversão).
3. **Given** um visualizador, **When** abre o Fluxo de Caixa, **Then** continua sem o botão Transferência; esta feature não muda permissões.

---

### User Story 3 - Abrir a transferência já com um sentido coerente (Priority: P2)

Ao abrir **Transferência**, o par já vem preenchido de forma válida (dois caixas distintos). O sentido inicial pode seguir o fluxo que está na tela (origem = fluxo ativo, destino = o outro), e o administrador só aciona **Inverter** se quiser o sentido contrário.

**Why this priority**: Melhora o primeiro uso; o MVP já existe se o par for visível e inversível.

**Independent Test**: Com o fluxo Conta corrente ativo, abrir Transferência e ver origem corrente e destino investimento; repetir com investimento ativo.

**Acceptance Scenarios**:

1. **Given** o fluxo ativo Conta corrente, **When** o administrador abre Transferência, **Then** origem é Conta corrente e destino é Conta investimento.
2. **Given** o fluxo ativo Conta investimento, **When** abre Transferência, **Then** origem é Conta investimento e destino é Conta corrente.
3. **Given** o formulário aberto, **When** o administrador tenta deixar origem e destino iguais, **Then** isso **não** é oferecido: o destino permanece sempre o outro caixa.

---

### Edge Cases

- Inverter com valor maior que o saldo da **nova** origem: o formulário permanece aberto; a confirmação continua recusada pelas regras já vigentes, com mensagem compreensível; nada é gravado.
- Inverter com valor vazio ou zero: só troca o par; a validação de valor ocorre na confirmação, como hoje.
- Fechar e reabrir Transferência: o par volta ao sentido padrão da abertura (fluxo ativo → o outro), não “lembra” a última inversão desta sessão após fechar.
- Papel visualizador: sem Transferência, sem **Inverter**.
- Toque ou clique nos textos de origem/destino: **não** troca o sentido; só o controle **Inverter** troca.
- Esta feature **não** cria um terceiro caixa nem permite origem = destino.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: No formulário de Transferência, o sistema MUST apresentar origem e destino como um **par complementar** em **texto somente leitura**: um dos dois caixas é origem e o outro é destino.
- **FR-002**: O sistema MUST NOT oferecer listas (nem outro seletor) para escolher origem ou destino; MUST NOT exigir duas escolhas independentes com as mesmas duas contas.
- **FR-003**: O administrador MUST poder inverter origem e destino com um único controle explícito rotulado **Inverter**.
- **FR-011**: Origem e destino MUST NOT ser editáveis por digitação nem por toque que altere o caixa; a única forma de trocar o sentido MUST ser o controle **Inverter**.
- **FR-004**: Após inverter, origem MUST ser o caixa que era destino e destino MUST ser o caixa que era origem.
- **FR-005**: O destino MUST ser sempre o outro caixa; MUST NOT ser possível origem e destino iguais neste formulário.
- **FR-006**: Inverter MUST preservar valor, data e observação já preenchidos.
- **FR-007**: O saldo visível da origem exibido no formulário MUST refletir o caixa de origem **depois** da inversão.
- **FR-008**: Ao abrir Transferência, origem MUST iniciar no fluxo ativo da tela e destino no outro caixa.
- **FR-009**: Confirmar a transferência MUST continuar usando o par visível no momento da confirmação (saída na origem, entrada no destino), sem mudar as demais regras já vigentes (valor positivo, teto do saldo visível da origem, papéis admin/visualizador, desfazer o par).
- **FR-010**: O visualizador MUST NOT ver nem usar Transferência nem o controle **Inverter**.

### Key Entities

- **Par origem–destino**: Os dois caixas da tela (Conta corrente e Conta investimento) mostrados em texto somente leitura, com papéis invertíveis pelo controle **Inverter**.
- **Transferência entre caixas**: Operação já existente; esta feature altera só a forma de escolher o sentido, não o significado da gravação.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das aberturas do formulário, origem e destino são os dois caixas distintos; não há caminho na tela para selecionar o mesmo caixa nos dois papéis.
- **SC-002**: Em menos de 5 segundos, o administrador aciona **Inverter** e confirma visualmente origem e destino trocados nos textos, sem reescolher as duas contas.
- **SC-003**: Em 100% das inversões de teste, valor, data e observação preenchidos permanecem iguais.
- **SC-004**: Em 100% das transferências confirmadas após inverter, o valor sai do caixa mostrado como origem e entra no mostrado como destino.
- **SC-005**: Pelo menos 90% dos usuários de teste entendem, sem treinar, que origem e destino são textos fixos do par e que o controle **Inverter** troca o sentido.

## Assumptions

- Continuam existindo exatamente dois caixas nesta tela: **Conta corrente** e **Conta investimento** (features 025 e 026).
- As regras de cálculo, saldo visível, recusa por saldo insuficiente, gravação em par, desfazer e papéis da feature 026 **permanecem**.
- O problema atual é redundância de duas escolhas; a solução de negócio é mostrar origem e destino em texto somente leitura e permitir só **Inverter**.
- O rótulo do controle de troca é **Inverter** (não ícone sozinho nem toque nos nomes dos caixas).
- Data, valor e observação opcional continuam no mesmo formulário.
- Não é necessário lembrar a última inversão depois de fechar o formulário.

## Out of Scope

- Alterar cálculo da transferência, teto de saldo, textos de/para na lista ou exportação.
- Adicionar um terceiro caixa ou transferência para contas fora deste par.
- Recriar Incluir receita, Incluir despesa ou Registrar saldo.
- Permitir ao visualizador criar transferência.
- Mudar o seletor de fluxo da tela (Conta corrente / Conta investimento) fora do formulário de Transferência.
