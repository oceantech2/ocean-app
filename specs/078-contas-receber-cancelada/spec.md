# Feature Specification: Status "Cancelada" em Contas a Receber

**Feature Branch**: `078-contas-receber-cancelada`

**Created**: 2026-10-01

**Status**: Draft

**Input**: User description: "em contas a pagar inserir além de Pendente e recebida adicionar cancelada. UMA VEZ CANCELADO NENHUM VALOR SEJA IMPOSTO RECEITA COMISSÃO ENTRE SEJA CONSIDERADO NOS CÁLCULOS."

## Clarifications

### Session 2026-10-01

- Q: Pode-se cancelar uma Conta a Receber que já está Recebida? → A: **Não.** É preciso primeiro voltar a conta para **Pendente** (o que remove a data de pagamento e o caixa) e só então cancelar.
- Q: Comissões já pagas vinculadas a uma conta cancelada também saem dos cálculos? → A: **Sim.** **Todas** as comissões vinculadas à conta cancelada saem dos cálculos, pagas ou não (os registros são preservados).
- Q: Quando a importação de planilha marca como cancelada uma conta que já está Recebida no Ocean, o que acontece? → A: A importação **não** cancela contas Recebidas; a conta permanece como está e aparece no resultado da importação como conflito ("Recebida no Ocean, cancelada na planilha").
- Q: Comissões de conta cancelada continuam aparecendo na tela de Comissões? → A: **Sim**, continuam na listagem com aviso "Conta cancelada" e visual esmaecido, mas não entram em nenhum total.
- Q: O `admin` pode reverter uma conta cancelada pela importação de planilha? → A: **Sim**, e as próximas importações respeitam a decisão do Ocean (não cancelam a conta de novo).
- Q: O que fazer com contas já canceladas antes desta feature que mantêm data de pagamento e caixa? → A: **Não alterar automaticamente**; continuam como estão e o sistema as destaca para o `admin` revisar uma a uma.
  - *Nota do plano (2026-10-01)*: o levantamento do código mostrou que essas contas **já ficam fora** do Fluxo de Caixa e dos saldos hoje; "continuar como estão" mantém esse comportamento (FR-017 ajustado).

**Baseline**: O pedido cita "contas a pagar", mas as opções **Pendente / Recebida** e os valores **imposto, receita e comissão** pertencem ao módulo **Contas a Receber** (em Contas a Pagar as opções são Pendente / Pago e não há comissão). Esta spec trata, portanto, de **Contas a Receber**. Hoje o status "Cancelada" já existe no produto, mas só é atribuído automaticamente pela importação de planilha; o usuário não consegue cancelar um lançamento manualmente pelo cadastro, e as comissões vinculadas a um lançamento cancelado continuam sendo somadas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cancelar uma Conta a Receber pelo cadastro (Priority: P1)

Como `admin`, ao editar uma Conta a Receber, escolho **Cancelada** no campo de situação (além de **Pendente** e **Recebida**) e salvo. O lançamento passa a exibir o status **Cancelada** na listagem.

**Why this priority**: Sem a opção no cadastro, o usuário não tem como registrar que um fechamento/NF foi cancelado; é a base de toda a feature.

**Independent Test**: Editar um lançamento Pendente, escolher Cancelada, salvar e conferir o badge **Cancelada** na listagem e no detalhe.

**Acceptance Scenarios**:

1. **Given** uma Conta a Receber Pendente, **When** o `admin` escolhe **Cancelada** e salva, **Then** o lançamento passa a ter status **Cancelada** e aparece com o badge vermelho "Cancelada" na listagem
2. **Given** o campo de situação no formulário de edição, **When** o `admin` abre as opções, **Then** vê **Pendente**, **Recebida** e **Cancelada**
3. **Given** um usuário `visualizador`, **When** abre uma Conta a Receber, **Then** vê o status mas **não** consegue alterá-lo para Cancelada (somente leitura)
4. **Given** o filtro de Status da listagem, **When** o usuário escolhe **Cancelada**, **Then** vê somente os lançamentos cancelados (inclusive os cancelados manualmente)
5. **Given** uma Conta a Receber **Recebida**, **When** o `admin` tenta escolher **Cancelada**, **Then** o sistema não permite e informa que é preciso primeiro voltar a conta para **Pendente**
6. **Given** uma Conta a Receber Recebida que o `admin` voltou para Pendente e salvou, **When** ele escolhe **Cancelada** e salva, **Then** o cancelamento é aceito normalmente

---

### User Story 2 - Lançamento cancelado não entra em nenhum cálculo (Priority: P1)

Como usuário autenticado, depois que uma Conta a Receber é cancelada, nenhum valor dela — **receita** (bruta ou líquida), **imposto** ou **comissão** vinculada (paga ou não) — é considerado em totais, indicadores, relatórios ou saldos do sistema.

**Why this priority**: É a regra de negócio central pedida pelo usuário; sem ela, cancelar seria só um rótulo e os números financeiros ficariam inflados.

**Independent Test**: Anotar os totais de um período (Dashboard, DRE, Impostos, Comissões, Fluxo de Caixa, totais da listagem), cancelar um lançamento desse período com comissão vinculada e conferir que todos os totais diminuem exatamente no valor correspondente ao lançamento cancelado.

**Acceptance Scenarios**:

1. **Given** uma Conta a Receber de R$ 10.000 bruto / R$ 9.000 líquido no período, **When** ela é cancelada, **Then** a receita bruta e a líquida do período (Dashboard, DRE, metas, pipeline, totais da listagem) diminuem em R$ 10.000 e R$ 9.000, respectivamente
2. **Given** a mesma conta com imposto de R$ 1.000, **When** ela é cancelada, **Then** esse imposto deixa de compor o imposto do período em todas as telas e relatórios
3. **Given** comissões **não pagas** vinculadas a essa conta, **When** ela é cancelada, **Then** os valores dessas comissões deixam de compor totais de comissão, valores a pagar a colaboradores e despesas do período
4. **Given** uma comissão **já paga** vinculada a essa conta, **When** ela é cancelada, **Then** a comissão paga também deixa de compor os totais de comissão e as despesas do período
5. **Given** comissões (pagas ou não) vinculadas a uma conta cancelada, **When** o usuário abre a tela de Comissões, **Then** elas continuam na listagem com o aviso "Conta cancelada" e visual esmaecido, e não entram em nenhum total da tela
6. **Given** um período com contas canceladas e não canceladas, **When** o usuário compara os totais de diferentes telas, **Then** todas as telas excluem os mesmos lançamentos cancelados (números consistentes entre si)
7. **Given** contas canceladas pela importação de planilha (comportamento já existente), **When** os cálculos são feitos, **Then** recebem exatamente o mesmo tratamento das canceladas manualmente

---

### User Story 3 - Reverter um cancelamento feito por engano (Priority: P2)

Como `admin`, se cancelei uma Conta a Receber por engano, consigo voltar a situação para **Pendente** (ou **Recebida**, informando a data de pagamento), e o lançamento volta a ser considerado em todos os cálculos.

**Why this priority**: Evita perda de dados e retrabalho em caso de erro operacional, mas não é necessário para o primeiro uso.

**Independent Test**: Cancelar um lançamento, confirmar que saiu dos totais, voltar para Pendente e confirmar que os totais voltaram aos valores originais.

**Acceptance Scenarios**:

1. **Given** uma Conta a Receber cancelada manualmente, **When** o `admin` muda a situação para **Pendente** e salva, **Then** o status volta a ser calculado normalmente (Pendente ou Vencida conforme vencimento) e os valores voltam a todos os cálculos
2. **Given** uma Conta a Receber cancelada, **When** o `admin` muda para **Recebida** sem informar data de pagamento, **Then** o sistema bloqueia o salvamento com a mesma mensagem já usada hoje ("Informe a data de pagamento para marcar como recebido.")
3. **Given** uma Conta a Receber cancelada pela importação de planilha, **When** o `admin` a volta para Pendente e salva, **Then** ela é reativada como qualquer cancelada manualmente, e uma nova importação em que a planilha ainda a traga como cancelada **não** a cancela de novo
4. **Given** comissões vinculadas a uma conta reativada, **When** a conta volta a Pendente ou Recebida, **Then** as comissões voltam a compor os totais, preservando os valores que tinham antes do cancelamento

---

### User Story 4 - Confirmação antes de cancelar (Priority: P3)

Como `admin`, ao salvar uma Conta a Receber como **Cancelada**, o sistema pede confirmação informando que receita, imposto e comissões deixarão de ser considerados nos cálculos.

**Why this priority**: Reduz cancelamentos acidentais; segue o padrão de confirmação já usado em ações destrutivas.

**Independent Test**: Escolher Cancelada e salvar; conferir que aparece a confirmação e que, ao recusar, nada muda.

**Acceptance Scenarios**:

1. **Given** o `admin` escolheu Cancelada no formulário, **When** clica em salvar, **Then** o sistema exibe uma confirmação explicando o impacto nos cálculos
2. **Given** a confirmação exibida, **When** o `admin` recusa, **Then** o lançamento permanece com a situação anterior e nenhum total é alterado
3. **Given** o cancelamento confirmado, **When** o salvamento termina, **Then** o usuário recebe a mensagem de sucesso no padrão do produto

---

### Edge Cases

- **Conta já Recebida** sendo cancelada: **bloqueado**. O `admin` precisa primeiro voltar a conta para Pendente (removendo data de pagamento e caixa) e salvar; só então pode cancelar. Assim, uma conta cancelada a partir desta feature nunca tem entrada no Fluxo de Caixa nem no saldo das contas correntes
- **Comissão já paga** vinculada à conta cancelada: **também sai** dos totais de comissão e das despesas do período; o registro e a marcação de pago são preservados para histórico e voltam a contar se o cancelamento for revertido
- **Comissão de conta cancelada marcada como paga depois do cancelamento**: continua fora dos cálculos enquanto a conta estiver cancelada
- **Conta cancelada vencida**: o status Cancelada prevalece sobre o cálculo automático de Pendente/Vencida; ela **não** aparece como vencida, nem em alertas/notificações de vencimento, nem no aging de recebíveis
- **Planilha cancela uma conta já Recebida no Ocean**: a importação **não** aplica o cancelamento; a conta mantém status Recebida, data de pagamento e caixa, e o resultado da importação lista o caso como conflito ("Recebida no Ocean, cancelada na planilha") para o usuário decidir
- **Reimportação da planilha**: a decisão do Ocean prevalece sobre a planilha nos dois sentidos — uma conta cancelada manualmente continua cancelada mesmo que a planilha a traga como ativa, e uma conta reativada pelo `admin` continua ativa mesmo que a planilha a traga como cancelada (a situação definida no Ocean é dado do Ocean, como data de pagamento e caixa)
- **Canceladas antigas com recebimento** (canceladas pela importação antes desta feature, mas com data de pagamento e caixa): não são alteradas automaticamente. Mantêm gravados a data de pagamento e o caixa, mas continuam fora dos cálculos de receita, imposto, comissão, Fluxo de Caixa e saldos, como já acontece hoje com qualquer cancelada. A listagem as destaca com o aviso "Cancelada com recebimento — revisar". Na revisão, o `admin` escolhe: voltar para **Recebida** (a conta volta aos cálculos e ao Fluxo de Caixa) ou voltar para **Pendente** e cancelar de novo (a data de pagamento e o caixa são apagados)
- **Reversão de conta cancelada pela planilha**: a reversão não recupera automaticamente dados que a planilha tenha substituído ao cancelar (ex.: nome do cliente gravado como "Cancelada"); o `admin` corrige esses dados pela edição normal
- **Conta arquivada e cancelada**: continua fora dos cálculos; o arquivamento segue o comportamento atual
- **Conta excluída** (soft delete): continua fora de tudo, como hoje; cancelar não equivale a excluir — a cancelada permanece visível na listagem com o filtro adequado
- **Totais por coluna na listagem** (bruto, imposto, líquido): não somam linhas canceladas, mesmo quando elas aparecem na tabela
- **Contadores de registros**: o número de registros exibido na listagem pode incluir canceladas, mas indicadores financeiros e contagens de pipeline/metas não as incluem
- **Duplicidade de NF**: a regra atual de duplicidade de número de NF não muda nesta feature; canceladas manualmente seguem o mesmo tratamento já dado às canceladas pela importação

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O formulário de edição de Conta a Receber MUST oferecer a situação **Cancelada** além de **Pendente** e **Recebida**
- **FR-002**: Somente usuários `admin` MUST poder cancelar ou reverter o cancelamento de uma Conta a Receber; `visualizador` vê o status em modo somente leitura
- **FR-003**: Ao salvar como Cancelada, o sistema MUST pedir confirmação explicando que receita, imposto e comissões deixarão de ser considerados
- **FR-004**: Uma Conta a Receber cancelada MUST exibir o status **Cancelada** (badge vermelho, como já existe hoje) na listagem e no detalhe, e MUST aparecer no filtro de Status "Cancelada"
- **FR-005**: O status Cancelada MUST prevalecer sobre o cálculo automático de status (Pendente/Vencida/Recebida) enquanto o lançamento estiver cancelado
- **FR-006**: Nenhum valor de uma Conta a Receber cancelada — receita bruta, receita líquida e imposto — MUST ser considerado em qualquer total, indicador, gráfico, relatório, meta, pipeline, aging, alerta, DRE, apuração de impostos ou total de coluna da listagem
- **FR-007**: **Todas** as comissões vinculadas a uma Conta a Receber cancelada — pagas ou não — MUST deixar de compor totais de comissão, valores a pagar a colaboradores e despesas do período, enquanto a conta estiver cancelada
- **FR-007a**: Na tela de Comissões, as comissões vinculadas a uma Conta a Receber cancelada MUST continuar visíveis na listagem, com o aviso "Conta cancelada" e visual esmaecido, e MUST NOT entrar em nenhum total da tela
- **FR-008**: Contas canceladas pela importação de planilha e contas canceladas manualmente MUST receber exatamente o mesmo tratamento em todos os cálculos
- **FR-009**: Todas as telas e relatórios MUST excluir o mesmo conjunto de lançamentos cancelados, de modo que os números sejam consistentes entre telas para o mesmo período
- **FR-010**: O `admin` MUST poder reverter o cancelamento — feito manualmente ou pela importação — escolhendo Pendente ou Recebida; ao reverter, o lançamento e suas comissões MUST voltar a todos os cálculos com os valores que tinham antes do cancelamento
- **FR-011**: Ao reverter para Recebida, MUST valer a mesma exigência atual de data de pagamento
- **FR-012**: Cancelar MUST preservar todos os dados do lançamento e das comissões vinculadas (nada é apagado), permitindo a reversão sem retrabalho
- **FR-013**: Uma Conta a Receber cancelada MUST NOT aparecer em alertas, notificações ou contadores de vencidas
- **FR-014**: A reimportação da planilha MUST NOT alterar uma situação definida manualmente no Ocean: MUST NOT desfazer um cancelamento feito no Ocean nem cancelar de novo uma conta que o `admin` reativou
- **FR-015**: O sistema MUST NOT permitir cancelar uma Conta a Receber que esteja Recebida; o `admin` precisa primeiro voltar a conta para Pendente e salvar, e o sistema MUST informar essa exigência ao bloquear
- **FR-016**: A importação de planilha MUST NOT cancelar uma Conta a Receber que esteja Recebida no Ocean; nesse caso a conta permanece inalterada e o resultado da importação MUST listá-la como conflito ("Recebida no Ocean, cancelada na planilha")
- **FR-017**: Contas já canceladas antes desta feature que mantêm data de pagamento e caixa MUST NOT ser alteradas automaticamente; MUST manter gravados a data de pagamento e o caixa, MUST continuar fora de todos os cálculos (inclusive Fluxo de Caixa e saldos, como já ocorre hoje), e MUST ser destacadas na listagem com o aviso "Cancelada com recebimento — revisar" até que o `admin` as revise

### Key Entities

- **Conta a Receber**: Lançamento de receita (NF/fechamento) com valor bruto, imposto, valor líquido, datas de emissão, vencimento e pagamento, caixa e situação. Passa a aceitar a situação **Cancelada** definida manualmente pelo usuário, que tem precedência sobre o status calculado
- **Comissão**: Valor devido a colaborador vinculado a uma Conta a Receber. Quando a conta está cancelada, a comissão (paga ou não) deixa de compor os cálculos, mas o registro é preservado
- **Situação da Conta a Receber**: Pendente | Recebida | Cancelada (no formulário); o status exibido continua podendo ser Vencida quando a conta não está cancelada nem recebida

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O `admin` consegue cancelar uma Conta a Receber em menos de 30 segundos a partir da listagem
- **SC-002**: Em um período de teste, após cancelar um lançamento, 100% das telas que exibem receita, imposto ou comissão (Dashboard, DRE, Impostos, Comissões, Fluxo de Caixa, totais da listagem, metas e pipeline) mostram totais reduzidos exatamente no valor do lançamento e de todas as suas comissões (pagas ou não)
- **SC-003**: Em amostra com ≥10 lançamentos cancelados (manualmente e via importação), 0 deles é somado em qualquer total financeiro
- **SC-004**: Após reverter um cancelamento, 100% dos totais voltam aos valores anteriores ao cancelamento
- **SC-005**: 0 lançamentos cancelados aparecem em alertas ou contadores de contas vencidas
- **SC-006**: Usuários `visualizador` não conseguem alterar a situação para Cancelada em 100% das tentativas
- **SC-007**: 100% das tentativas de cancelar uma conta Recebida são bloqueadas com a orientação de voltar para Pendente, 100% das contas Recebidas marcadas como canceladas na planilha aparecem como conflito na importação sem serem alteradas, e nenhuma conta cancelada aparece no Fluxo de Caixa ou nos saldos
- **SC-008**: 100% das canceladas antigas com recebimento aparecem destacadas para revisão na listagem e deixam de ser destacadas assim que o `admin` as revisa

## Assumptions

- O pedido refere-se a **Contas a Receber** (tela que tem Pendente/Recebida, imposto, receita e comissão), não a Contas a Pagar; Contas a Pagar fica fora desta feature
- "Cancelada" reaproveita o status que já existe no produto (hoje atribuído pela importação), com o mesmo rótulo e cor
- Não é exigido motivo nem data de cancelamento nesta versão; o histórico de alterações segue o mecanismo de auditoria já existente
- O cancelamento é reversível pelo `admin`, para correção de erros operacionais, inclusive quando feito pela importação
- O cancelamento é feito lançamento a lançamento; ações em massa ficam fora do escopo
- Telas que hoje já excluem canceladas (ex.: relatórios de receita e metas) mantêm esse comportamento; o trabalho é garantir que **todas** as demais (inclusive comissões) façam o mesmo

## Out of Scope

- Status "Cancelada" em **Contas a Pagar**
- Cancelamento em massa
- Motivo obrigatório de cancelamento ou fluxo de aprovação
- Emissão de nota de cancelamento/estorno fiscal fora do sistema
- Novos papéis além de `admin` e `visualizador`
