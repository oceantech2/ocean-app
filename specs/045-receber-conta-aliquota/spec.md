# Feature Specification: Contas a Receber — Conta, Alíquota e cards líquidos

**Feature Branch**: `045-receber-conta-aliquota`

**Created**: 2026-08-29

**Status**: Draft

**Input**: User description: "em CONTAS A RECEBER - \"Nova conta a receber\": inserir campo \"Conta\" (selecionar entre contas existentes, manter \"Conta Corrente 1\" como padrão) - \"Nova conta a receber\": inserir campo \"Alíquota (imposto)\" - \"Nova conta a receber\": automatizar cálculo de Impostos [Valor Bruto * (1-Alíquota)] - \"Nova conta a receber\": automatizar cálculo de Valor Líquido [Valor Bruto - Impostos] - Cards \"Pendente\" e \"Vencido\": confirmar se a lógica está aplicada ao valor líquido e renomear para \"Líquido Pendente\" e \"Líquido Vencido\""

## Clarifications

### Session 2026-08-29

- Q: Qual fórmula o cadastro “Nova conta a receber” deve usar para Impostos? → A: Impostos = Valor bruto × Alíquota; Valor líquido = Valor bruto − Impostos. O `Bruto × (1 − Alíquota)` é o próprio líquido, não o imposto.
- Q: Depois do cálculo automático, o administrador pode alterar Impostos ou Valor líquido à mão? → A: Não. Os dois campos são somente conferência: atualizam com bruto/alíquota e não aceitam digitação.
- Q: Alíquota e cálculo automático valem só na criação ou também na edição? → A: Também na edição — Alíquota visível; Impostos e Líquido somente conferência e recalculam se bruto ou alíquota mudarem. Histórico não é recalculado em massa; só ao abrir e alterar esses campos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Escolher a Conta já na criação (Priority: P1)

O administrador, ao acionar **“Nova conta a receber”**, vê o campo **Conta** e escolhe entre as **contas correntes existentes** (ativas). O formulário inicia com **Conta Corrente 1** pré-selecionada; ele pode trocar antes de salvar. A conta escolhida fica gravada no registro — inclusive se o pagamento nascer **Pendente** — para o recebimento posterior ir à caixa certa sem recadastro. O visualizador não cria contas a receber.

**Why this priority**: Sem o campo na criação, o lançamento novo não indica destino de caixa até ser marcado como recebido; o pedido é escolher a conta no ato do cadastro, com padrão explícito.

**Independent Test**: Abrir “Nova conta a receber” com ao menos duas contas correntes ativas; conferir padrão “Conta Corrente 1”; salvar em outra conta ainda como Pendente; reabrir e ver a conta escolhida.

**Acceptance Scenarios**:

1. **Given** um administrador na página Contas a Receber, **When** aciona **“Nova conta a receber”**, **Then** vê o campo **Conta** listando as contas correntes ativas existentes (pelo nome) e **não** precisa marcar o pagamento como Recebida para o campo aparecer.
2. **Given** o formulário recém-aberto, **When** o administrador ainda não alterou a Conta, **Then** a opção pré-selecionada é **Conta Corrente 1**.
3. **Given** o administrador seleciona outra conta corrente ativa (não a padrão) e salva com pagamento **Pendente**, **When** o registro é gravado e reaberto, **Then** a Conta permanece a escolhida.
4. **Given** o administrador cria já **Recebida**, **When** salva, **Then** a entrada de caixa usa a Conta selecionada no formulário (não substitui silenciosamente pela padrão).
5. **Given** um visualizador, **When** consulta a página, **Then** não aciona “Nova conta a receber” e, na listagem, vê a conta associada quando houver, sem alterá-la.

---

### User Story 2 - Informar Alíquota e ver Impostos e Líquido calculados (Priority: P1)

No formulário **“Nova conta a receber”** e na **edição** de uma conta existente, o administrador informa ou altera **Alíquota (imposto)** e **Valor bruto**. O sistema preenche **Impostos** e **Valor líquido** sozinho. Os dois valores ficam visíveis **somente para conferência**: não aceitam digitação. Alterar bruto ou alíquota atualiza Impostos e Líquido na hora. Contas antigas **não** são recalculadas em massa — só quando o administrador abre a edição e muda bruto ou alíquota. O visualizador não edita.

**Why this priority**: Hoje bruto, imposto e líquido são digitados em separado; erro de conta distorce o que entra no caixa e nos cards. O pedido é automatizar a conta a partir da alíquota.

**Independent Test**: Criar conta com bruto e alíquota conhecidos; reabrir edição, alterar alíquota e conferir recálculo sem digitar Impostos/Líquido; abrir conta antiga sem editar bruto/alíquota e confirmar que valores permanecem até haver alteração.

**Acceptance Scenarios**:

1. **Given** o formulário **“Nova conta a receber”** ou **edição** aberto, **When** o administrador o lê, **Then** vê o campo **Alíquota (imposto)** além de Valor bruto, Impostos e Valor líquido.
2. **Given** Valor bruto R$ 10.000,00 e Alíquota 6%, **When** o administrador informa ou altera qualquer um dos dois, **Then** Impostos passa a R$ 600,00 e Valor líquido a R$ 9.400,00, sem o usuário precisar digitá-los.
3. **Given** Alíquota vazia ou zero e Valor bruto válido, **When** o cálculo corre, **Then** Impostos fica zero e Valor líquido iguala o Valor bruto.
4. **Given** Impostos e Valor líquido preenchidos pelo cálculo, **When** o administrador tenta digitá-los ou colar outro valor, **Then** o sistema não aceita a alteração; os valores permanecem os calculados.
5. **Given** os valores calculados visíveis, **When** o administrador salva com os demais obrigatórios válidos, **Then** Impostos e Valor líquido gravados são os calculados (não um valor antigo deixado em branco).
6. **Given** o administrador tenta salvar com Valor bruto ausente ou inválido, **When** confirma, **Then** o sistema impede a gravação e indica o que corrigir; não grava líquido/imposto inventados.
7. **Given** um visualizador, **When** procura o formulário de criação, **Then** a ação continua indisponível.
8. **Given** um administrador editando uma conta existente sem alterar bruto nem alíquota, **When** salva outras alterações (ex.: vencimento), **Then** Impostos e Valor líquido permanecem os já gravados.
9. **Given** um administrador editando uma conta existente, **When** altera Valor bruto ou Alíquota e salva, **Then** Impostos e Valor líquido gravados são os recalculados (somente conferência, sem digitação manual).

---

### User Story 3 - Ler Líquido Pendente e Líquido Vencido nos cards (Priority: P1)

Qualquer usuário com acesso à página **Contas a Receber** vê os cards de resumo. Os que hoje se chamam **Pendente** e **Vencido** passam a se chamar **Líquido Pendente** e **Líquido Vencido**. O valor de cada um é a soma do **valor líquido** das contas naquela situação (pendentes ainda não vencidas; vencidas ainda não recebidas), no mesmo recorte de filtros já usado pelos cards. Os cards **Bruto Recebido** e **Líquido Recebido** não mudam de nome nem de base nesta feature.

**Why this priority**: Os cards Pendente e Vencido hoje somam valor bruto, enquanto o card ao lado já mostra líquido recebido; o time precisa conferir o líquido em aberto e o nome precisa deixar isso explícito.

**Independent Test**: Ter ao menos uma conta pendente e uma vencida, com bruto ≠ líquido; abrir a página no recorte e conferir rótulos novos e totais iguais à soma dos líquidos (não dos brutos).

**Acceptance Scenarios**:

1. **Given** a página Contas a Receber com o resumo visível, **When** o usuário lê os cards, **Then** vê **Líquido Pendente** e **Líquido Vencido** no lugar de **Pendente** e **Vencido**.
2. **Given** contas pendentes (não recebidas e não vencidas) no recorte, **When** o usuário lê **Líquido Pendente**, **Then** o valor é a soma dos **valores líquidos** dessas contas — não a soma dos brutos.
3. **Given** contas vencidas (não recebidas, vencimento já passado) no recorte, **When** o usuário lê **Líquido Vencido**, **Then** o valor é a soma dos **valores líquidos** dessas contas — não a soma dos brutos.
4. **Given** uma conta cujo bruto é diferente do líquido, **When** ela entra só em Pendente ou só em Vencido, **Then** o card correspondente aumenta pelo líquido, não pelo bruto.
5. **Given** os cards **Bruto Recebido** e **Líquido Recebido**, **When** o usuário os compara com o estado anterior desta feature, **Then** nomes e bases (bruto recebido / líquido recebido) permanecem os mesmos.
6. **Given** um visualizador, **When** abre a página, **Then** vê os mesmos rótulos e as mesmas bases de valor que o administrador (recurso de leitura).

---

### Edge Cases

- **Conta Corrente 1** inexistente ou inativa: o formulário inicia na conta corrente **padrão** ativa; o usuário ainda escolhe entre as contas ativas disponíveis. Não inventa uma conta com esse nome.
- Nenhuma conta corrente ativa: o sistema impede salvar e informa que não há conta disponível; não grava destino inventado.
- Conta investimento **não** entra na lista de **Conta** deste formulário (investimento continua só na transferência do Fluxo de Caixa).
- Alíquota negativa ou acima de 100%: recusa com feedback claro; não calcula nem grava.
- Alíquota com casas decimais (ex.: 6,5%): aceita no padrão percentual brasileiro; Impostos e Líquido arredondam para centavos (duas casas).
- Valor bruto zero: Impostos zero e Líquido zero, se a alíquota for válida; bruto negativo é recusado como já ocorre para valor inválido.
- Tentativa de editar Impostos ou Valor líquido no formulário: o campo não aceita digitação (somente conferência); o único jeito de mudá-los é alterar Valor bruto ou Alíquota.
- Arredondamento: Impostos = Valor bruto × Alíquota, arredondado para centavos; em seguida Valor líquido = Valor bruto − Impostos, para fechar em centavos (sem residual de 1 centavo inexplicável).
- Edição de conta já existente: Alíquota aparece no formulário; Impostos e Valor líquido são somente conferência, como na criação. **Não** há recálculo em massa do histórico — só quando o administrador abre a edição e altera Valor bruto ou Alíquota.
- Cards com recorte (mês/ano/status/cliente): as somas de Líquido Pendente e Líquido Vencido respeitam o mesmo recorte já usado pelo resumo; contas arquivadas continuam fora, como hoje.
- Conta pendente sem valor líquido gravado: o card não inventa líquido; trata como zero nesse total (não usa o bruto no lugar).
- Papel visualizador: lê cards e listagem; não cria nem altera Conta, Alíquota, Impostos ou Líquido.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: No formulário **“Nova conta a receber”**, o sistema MUST exibir o campo **Conta**, com lista das **contas correntes ativas** existentes (pelo nome). MUST NOT exigir pagamento Recebida para o campo aparecer.
- **FR-002**: Ao abrir o formulário de criação, o sistema MUST pré-selecionar **Conta Corrente 1**. Se essa conta não existir ou estiver inativa, MUST pré-selecionar a conta corrente **padrão** ativa.
- **FR-003**: A Conta escolhida MUST ser gravada no registro na criação, tanto com pagamento **Pendente** quanto **Recebida**. Se Recebida, o recebimento MUST usar essa Conta.
- **FR-004**: A lista do campo Conta MUST NOT incluir Conta investimento.
- **FR-005**: No formulário **“Nova conta a receber”** e na **edição**, o sistema MUST exibir o campo **Alíquota (imposto)**, em percentual (ex.: 6 para 6%).
- **FR-006**: Sempre que Valor bruto ou Alíquota mudarem na criação ou na edição, o sistema MUST recalcular Impostos e Valor líquido automaticamente e exibi-los. Impostos e Valor líquido MUST ser somente conferência: MUST NOT aceitar digitação, colagem nem ajuste manual. O único meio de alterá-los MUST ser mudar Valor bruto ou Alíquota. MUST NOT recalcular contas em massa sem edição explícita.
- **FR-007**: O sistema MUST calcular **Impostos** como **Valor bruto × Alíquota** (alíquota em fração, ex.: 6% = 0,06), arredondado para centavos. MUST NOT usar Valor bruto × (1 − Alíquota) para Impostos — essa identidade é a do Valor líquido.
- **FR-008**: O sistema MUST calcular **Valor líquido** como **Valor bruto − Impostos**, usando o Impostos já arredondado de FR-007 (equivalente a Valor bruto × (1 − Alíquota) após o arredondamento do imposto).
- **FR-009**: Alíquota vazia ou zero MUST produzir Impostos = 0 e Valor líquido = Valor bruto. Alíquota negativa ou maior que 100% MUST ser recusada.
- **FR-010**: Os valores de Impostos, Valor líquido e Alíquota gravados MUST ser os do momento do salvamento (calculados na criação ou recalculados na edição quando bruto/alíquota mudarem).
- **FR-011**: Os cards de resumo da página Contas a Receber MUST usar os rótulos **Líquido Pendente** e **Líquido Vencido** no lugar de **Pendente** e **Vencido**.
- **FR-012**: **Líquido Pendente** MUST somar o **valor líquido** das contas pendentes (não recebidas e não vencidas) no recorte do resumo. MUST NOT somar valor bruto nesse card.
- **FR-013**: **Líquido Vencido** MUST somar o **valor líquido** das contas vencidas (não recebidas, vencimento já passado) no recorte do resumo. MUST NOT somar valor bruto nesse card.
- **FR-014**: Os cards **Bruto Recebido** e **Líquido Recebido** MUST permanecer com os mesmos nomes e as mesmas bases de valor.
- **FR-015**: Visualizador MUST ver os cards e a Conta na listagem; MUST NOT criar registro nem alterar Conta, Alíquota, Impostos ou Líquido.
- **FR-016**: Demais regras já vigentes da página (papéis, NF opcional, tipo, origem Manual/Maggo, arquivar, exclusão por linha, status derivado) MUST permanecer, salvo o que esta spec altera.

### Key Entities

- **Conta a receber**: Lançamento da página Contas a Receber, com valor bruto, impostos, valor líquido, alíquota usada no cálculo, destino de **Conta** e status de pagamento/vencimento.
- **Conta (destino)**: Conta corrente ativa escolhida no cadastro; padrão **Conta Corrente 1**. Distinta de Conta investimento.
- **Alíquota (imposto)**: Percentual informado no formulário de criação para calcular Impostos e, em seguida, Valor líquido.
- **Impostos**: Valor em reais igual a Valor bruto × Alíquota (centavos).
- **Valor líquido**: Valor em reais igual a Valor bruto − Impostos.
- **Líquido Pendente**: Soma dos valores líquidos das contas ainda não recebidas e ainda não vencidas, no recorte.
- **Líquido Vencido**: Soma dos valores líquidos das contas não recebidas cujo vencimento já passou, no recorte.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das aberturas de “Nova conta a receber” com Conta Corrente 1 ativa, o campo Conta inicia nessa conta, sem o administrador selecioná-la.
- **SC-002**: Administrador cria uma conta pendente escolhendo uma conta corrente que não é a padrão e, após recarregar, vê essa mesma Conta no registro em menos de 1 minuto.
- **SC-003**: Em 100% dos testes com bruto e alíquota válidos no formulário de criação, Impostos = Valor bruto × Alíquota e Valor líquido = Valor bruto − Impostos, com diferença de no máximo 1 centavo por arredondamento; em 100% das tentativas de digitação nesses dois campos, o valor calculado permanece inalterado.
- **SC-004**: Em 100% das inspeções da página, os cards não usam mais os rótulos isolados **Pendente** e **Vencido**; os nomes visíveis são **Líquido Pendente** e **Líquido Vencido**.
- **SC-005**: Em recorte de teste com pelo menos uma pendente e uma vencida cujo bruto ≠ líquido, os dois cards novos coincidem com a soma manual dos líquidos (não dos brutos) em 100% das conferências.
- **SC-006**: Visualizador, em 100% das tentativas, não consegue criar conta a receber nem alterar Conta ou Alíquota.
- **SC-007**: Administrador completa o cadastro com Conta, Alíquota, bruto e demais obrigatórios em menos de 2 minutos na primeira tentativa com dados válidos.

## Assumptions

- A página **Contas a Receber** é a listagem de valores a receber (criação pelo botão **“Nova conta a receber”**).
- **Conta** neste pedido é conta **corrente** cadastrada (as mesmas do Fluxo de Caixa), não investimento. “Contas existentes” = correntes **ativas**.
- **Conta Corrente 1** é o nome/slot já usado no produto para a primeira conta corrente; se o nome cadastrado for outro, o padrão visual ainda é o slot 1 quando corresponder a essa conta, senão cai na conta corrente marcada como padrão.
- O campo Conta na criação **não** substitui o seletor já existente no modal **Recebido**; apenas passa a existir também no cadastro, inclusive com pagamento Pendente.
- Alíquota é percentual (6 = 6% = 0,06 no cálculo), no formato brasileiro, alinhado aos demais percentuais do produto.
- A fórmula pedida originalmente como Impostos = Bruto × (1 − Alíquota) foi interpretada como o cálculo do **líquido**; Impostos = Bruto × Alíquota (sessão 2026-08-29).
- Impostos e Valor líquido são **somente conferência** na criação e na edição: calculados a partir de bruto e alíquota, visíveis, sem digitação (sessão 2026-08-29).
- Contas já existentes **não** são recalculadas em massa; só novos cadastros e edições em que bruto/alíquota forem alterados (sessão 2026-08-29).
- Os cards Pendente/Vencido hoje somam **bruto**; o pedido é passar a somar **líquido** e deixar o nome explícito. Critérios de quem entra em pendente vs vencido (status já usado no resumo) **não** mudam.
- Bruto Recebido e Líquido Recebido ficam como estão.
- Papéis admin / visualizador, NF opcional, tipo (Retainer / Parcela / Sucesso) e origem Manual/Maggo permanecem.

## Out of Scope

- Incluir Conta investimento no seletor do formulário de Contas a Receber.
- Recalcular em massa Impostos e Líquido de registros históricos que não forem editados.
- Permitir ajuste manual de Impostos ou Valor líquido (exceção fiscal digitada à mão).
- Alterar nomes ou bases dos cards **Bruto Recebido** e **Líquido Recebido**.
- Alterar cards equivalentes no Dashboard (Receita Pendente, etc.).
- Enviar a alíquota da linha de volta à Maggo ou passar a usar a alíquota do mês (tooltip de Imposto) como padrão deste campo — o campo é informado pelo administrador no cadastro.
- Contas a Pagar, Fluxo de Caixa (além de respeitar a Conta gravada no recebimento) e página Impostos.
