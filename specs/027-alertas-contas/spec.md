# Feature Specification: Alertas de Contas (Vencer, Vencidas e NF Pendente)

**Feature Branch**: `027-alertas-contas`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "verificar se já existe, se não, criar — Alerta: contas a vencer em menos de 1 dia; Alerta: contas vencidas; Alerta: contas com nota fiscal pendente"

## Verificação de existência

Não existe spec dedicada a esses três alertas. O que já há no produto:

| Pedido | Situação atual |
|--------|----------------|
| Contas a vencer em menos de 1 dia | **Não** aparece no painel in-app. Há antecedência genérica só no envio por e-mail (janela de vários dias, não “menos de 1 dia”). |
| Contas vencidas | **Já existe** no painel in-app como “Contas atrasadas” (contas a pagar não pagas com vencimento anterior a hoje). Baseline FR-034. |
| Contas com nota fiscal pendente | **Não existe** como alerta. Há cadastro de receita sem número de NF, mas sem notificação. |

Esta feature **formaliza** o alerta de contas vencidas (rótulo alinhado ao pedido) e **adiciona** os dois que faltam, no mesmo painel de alertas já usado no topo.

## Clarifications

### Session 2026-08-13

- Q: O que significa “contas com nota fiscal pendente”? → A: Contas a receber ativas sem número de NF
- Q: Receita já recebida (paga) e sem número de NF entra no alerta? → A: Sim: toda conta a receber ativa sem NF, mesmo já recebida
- Q: Ao acionar um alerta, a tela de destino já mostra só o conjunto daquele alerta? → A: Sim: aplicar filtro (ou equivalente) para listar só o conjunto do alerta

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver contas a pagar vencidas no painel de alertas (Priority: P1)

Qualquer usuário autenticado abre o painel de alertas no topo e vê a quantidade de **contas a pagar vencidas**: não pagas cujo vencimento é **anterior ao dia corrente**. Ao acionar o alerta, vai para Contas a Pagar já filtrada para tratar essas contas.

**Why this priority**: Atraso de despesa é o risco de caixa mais urgente; o produto já cobre o caso, e esta spec garante o comportamento e o nome “Contas vencidas”.

**Independent Test**: Com uma conta a pagar não paga vencida ontem, outra não paga com vencimento hoje e outra já paga (mesmo vencida no passado), conferir que só a primeira entra no contador “Contas vencidas”.

**Acceptance Scenarios**:

1. **Given** ao menos uma conta a pagar **não paga** com vencimento **antes de hoje**, **When** o usuário abre o painel de alertas, **Then** vê o item **Contas vencidas** com a quantidade correta.
2. **Given** contas a pagar **pagas**, mesmo com vencimento passado, **When** consulta os alertas, **Then** elas **não** entram em Contas vencidas.
3. **Given** o usuário aciona **Contas vencidas**, **When** a navegação completa, **Then** chega em Contas a Pagar **já filtrada** para listar **somente** as contas vencidas (não pagas com vencimento anterior a hoje).
4. **Given** zero contas vencidas, **When** abre o painel (se houver outros alertas), **Then** o item Contas vencidas **não** aparece.

---

### User Story 2 - Ver contas a pagar que vencem em menos de 1 dia (Priority: P1)

O usuário vê, no mesmo painel, contas a pagar **não pagas** cujo vencimento é **hoje** (vence em menos de um dia civil). Esse conjunto é **distinto** das vencidas: vence hoje não conta como vencida.

**Why this priority**: Sem o aviso do dia, o time só descobre o vencimento depois que já virou atraso.

**Independent Test**: Criar uma conta a pagar não paga com vencimento hoje e outra com vencimento amanhã; só a de hoje entra em “a vencer em menos de 1 dia”; a de amanhã não entra neste alerta nem em vencidas.

**Acceptance Scenarios**:

1. **Given** uma conta a pagar **não paga** com vencimento **igual a hoje**, **When** o usuário abre o painel, **Then** vê **Contas a vencer em menos de 1 dia** com essa conta na contagem.
2. **Given** uma conta a pagar não paga com vencimento **amanhã** ou posterior, **When** consulta os alertas, **Then** ela **não** entra neste alerta nem em Contas vencidas.
3. **Given** uma conta a pagar **paga** com vencimento hoje, **When** consulta os alertas, **Then** ela **não** entra neste alerta.
4. **Given** o usuário aciona o alerta, **When** a navegação completa, **Then** chega em Contas a Pagar **já filtrada** para listar **somente** as contas que vencem hoje.
5. **Given** a mesma conta não pode ser vencida e “vence hoje” ao mesmo tempo, **When** o vencimento é hoje, **Then** conta só no alerta de menos de 1 dia; **When** o vencimento é anterior a hoje, **Then** conta só em Contas vencidas.

---

### User Story 3 - Ver contas a receber com nota fiscal pendente (Priority: P2)

O usuário vê no painel a quantidade de **contas a receber** (receitas) **ativas** que **ainda não têm número de nota fiscal**, **incluindo as já recebidas**. Ao acionar, vai para Contas a Receber **já filtrada** nas receitas sem número de NF.

**Why this priority**: Completa o trio pedido; a receita pode existir sem nota, mas o financeiro precisa de um lembrete para regularizar a NF.

**Independent Test**: Ter uma receita ativa sem número de NF e outra com número preenchido; só a primeira entra no alerta “nota fiscal pendente”.

**Acceptance Scenarios**:

1. **Given** ao menos uma conta a receber **ativa** (não cancelada e não arquivada) **sem** número de NF, **When** o usuário abre o painel, **Then** vê **Contas com nota fiscal pendente** com a quantidade correta — inclusive se o pagamento já estiver **recebido**.
2. **Given** uma conta a receber com número de NF preenchido, **When** consulta os alertas, **Then** ela **não** entra neste item.
3. **Given** uma conta a receber **cancelada** ou **arquivada** sem NF, **When** consulta os alertas, **Then** ela **não** entra neste item.
4. **Given** o usuário aciona o alerta, **When** a navegação completa, **Then** chega em Contas a Receber **já filtrada** para listar **somente** as receitas ativas sem número de NF.
5. **Given** zero receitas sem NF, **When** há outros alertas, **Then** o item de nota fiscal pendente **não** aparece.

---

### Edge Cases

- Conta a pagar **sem data de vencimento**: não entra em “vence hoje” nem em “vencidas” (não há vencimento para comparar).
- Virada de dia: o que era “vence hoje” passa a “vencidas” no dia seguinte, sem ação do usuário; o painel reflete o dia corrente.
- Uma mesma receita sem NF **e** uma conta a pagar vencida: os dois alertas coexistem; contagens são independentes.
- Receita **já recebida** sem NF: permanece no alerta de nota fiscal pendente até haver número (ou até cancelar/arquivar).
- Número de NF só com espaços: trata-se como **ausente** (nota fiscal pendente).
- Painel vazio: se nenhum dos alertas (incluindo os já existentes de NFs vencidas e férias, fora do delta desta spec) tiver quantidade maior que zero, o indicador de alertas permanece oculto como hoje.
- Visualizador: vê os mesmos alertas (somente leitura); o clique leva à consulta, sem novas ações de escrita.
- Falha ao obter os totais: o restante da interface continua utilizável; não se exibe contagem inventada.
- Após o clique: registros que **não** pertencem ao conjunto do alerta (ex.: conta a pagar paga, receita com NF) MUST NOT aparecer na lista filtrada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O painel de alertas in-app MUST exibir **Contas vencidas**: quantidade de contas a pagar **não pagas** com data de vencimento **anterior ao dia corrente**.
- **FR-002**: O painel MUST exibir **Contas a vencer em menos de 1 dia**: quantidade de contas a pagar **não pagas** com data de vencimento **igual ao dia corrente**.
- **FR-003**: Uma conta a pagar MUST pertencer a no máximo um dos dois alertas de vencimento (hoje **ou** vencida), nunca aos dois.
- **FR-004**: Contas a pagar **pagas** MUST NOT entrar nos alertas de vencimento, independentemente da data.
- **FR-005**: O painel MUST exibir **Contas com nota fiscal pendente**: quantidade de contas a receber ativas **sem** número de NF (vazio ou equivalente a em branco), **incluindo as já recebidas (pagas)**.
- **FR-006**: Contas a receber **canceladas** ou **arquivadas** MUST NOT entrar no alerta de nota fiscal pendente.
- **FR-007**: Cada item com quantidade maior que zero MUST ser acionável e levar o usuário à tela correspondente **já filtrada** no conjunto daquele alerta: Contas a Pagar só vencidas; Contas a Pagar só a vencer hoje; Contas a Receber só ativas sem número de NF. A lista MUST NOT misturar registros fora desse conjunto.
- **FR-008**: Itens com quantidade zero MUST NOT aparecer na lista do painel.
- **FR-009**: As quantidades MUST refletir o dia e os dados correntes após o ciclo normal de atualização da interface, sem exigir recarregar a página além desse ciclo.
- **FR-010**: Admin e visualizador autenticados MUST ver os mesmos três tipos de alerta (o visualizador permanece somente leitura nas telas de destino).
- **FR-011**: Alertas já existentes fora deste trio (NFs vencidas e férias aguardando aprovação) MUST permanecer no painel; esta feature não os remove.
- **FR-012**: Esta feature NÃO altera o envio de alertas por e-mail (fora de escopo).

### Key Entities

- **Alerta in-app**: Item no painel do topo, com rótulo, quantidade e destino de navegação.
- **Conta a pagar**: Despesa; para estes alertas importam status pago/não pago e data de vencimento.
- **Conta a receber**: Receita (nota/fatura); para o terceiro alerta importam número de NF, status cancelado e arquivamento.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos casos de teste com vencimento ontem / hoje / amanhã (não pagas), a conta entra exatamente no alerta esperado (vencida, menos de 1 dia, ou nenhum).
- **SC-002**: Em 100% dos casos de teste, conta a pagar paga não aparece em nenhum alerta de vencimento.
- **SC-003**: Em 100% dos casos de teste, receita ativa sem NF entra em “nota fiscal pendente” (recebida ou não); receita com NF, cancelada ou arquivada não entra.
- **SC-004**: Um usuário autenticado identifica os três tipos de alerta e, em menos de 30 segundos a partir do painel, chega à tela correspondente **já filtrada** no conjunto daquele alerta.
- **SC-005**: Com os três conjuntos vazios (e os demais alertas existentes também zerados), o indicador de alertas não aparece; com ao menos um item, o painel mostra só os tipos com quantidade > 0.

## Assumptions

- “Contas” nos dois primeiros alertas são **contas a pagar** (página Contas), alinhado ao alerta já existente de atraso.
- “Menos de 1 dia” usa o **dia civil corrente** (vence **hoje**), não uma janela de várias horas nem “vence amanhã”.
- “Contas com nota fiscal pendente” são **contas a receber ativas sem número de NF**, **mesmo já recebidas** (decisões confirmadas); não se cria campo novo de NF em contas a pagar nesta feature.
- O rótulo in-app “Contas atrasadas” passa a **Contas vencidas** (mesmo conjunto de dados).
- Não se exige lista detalhada de cada conta **dentro do painel**: quantidade + clique basta; o detalhamento ocorre na tela de destino **já filtrada**.
- Navegação do alerta aplica filtro (ou equivalente) para listar **somente** o conjunto correspondente.
- Não há alerta novo de “vence em N dias” além de hoje; a antecedência de e-mail permanece como está, fora desta spec.
- Papéis `admin` e `visualizador` seguem a constitution; não se cria papel novo.

## Escopo e limites

### Incluído

- Três tipos de alerta in-app: contas a pagar a vencer hoje; contas a pagar vencidas; contas a receber sem NF.
- Navegação do painel para as telas de contas correspondentes, **já filtradas** no conjunto do alerta.
- Manutenção dos alertas já existentes de NFs vencidas e férias.

### Explicitamente fora

- Alterar ou redesenhar o e-mail diário de alertas.
- Novos campos em contas a pagar (número de NF do fornecedor).
- Alertas de contas a receber vencidas (já cobertas, no produto, pelo alerta de NFs vencidas).
- Push, SMS ou configuração por usuário de quais alertas ver.
