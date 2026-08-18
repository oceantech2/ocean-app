# Feature Specification: Contas a Receber — Alíquota do Mês no Tooltip de Imposto

**Feature Branch**: `037-contas-receber-aliquota-tooltip`

**Created**: 2026-08-18

**Status**: Draft

**Input**: User description: "em contas a receber em impostos inserir a alíquota do mês dentro do tooltip"

## Clarifications

### Session 2026-08-18

- Q: Onde o tooltip deve aparecer? → A: Na célula **Imposto** da tabela de Contas a Receber (não nos gráficos nem na tabela da página Impostos).
- Q: De onde vem o percentual do tooltip? → A: Percentual **efetivo do mês** (o mesmo “% Imposto” do acompanhamento mensal), igual para todas as linhas daquele mês; não é cadastro à parte nem imposto da linha ÷ bruto da linha.
- Q: O que o tooltip mostra quando não há percentual efetivo? → A: O tooltip **abre** e exibe mensagem explícita de que a alíquota do mês não está disponível (não some e não inventa percentual).
- Q: Célula Imposto vazia (“—”)? → A: Se o mês tiver percentual efetivo, o tooltip **mostra a alíquota do mês** mesmo com Imposto “—”, rotulada como alíquota do mês (não como imposto da linha).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver a alíquota do mês ao passar o cursor em Imposto (Priority: P1)

Na página **Contas a Receber**, o usuário vê o valor de **Imposto** de cada lançamento na tabela. Ao passar o cursor (ou focar via teclado) sobre esse valor, um **tooltip** exibe a **alíquota do mês** correspondente àquele lançamento, sem sair da tela e sem abrir a página Impostos.

**Why this priority**: Hoje o valor em reais aparece na célula, mas a alíquota mensal usada no contexto fiscal não fica visível no mesmo ponto de leitura. Isso obriga o usuário a cruzar telas ou calcular de cabeça.

**Independent Test**: Abrir Contas a Receber com lançamentos que tenham imposto e mês com alíquota conhecida; passar o cursor na coluna Imposto e confirmar que o tooltip mostra a alíquota daquele mês.

**Acceptance Scenarios**:

1. **Given** um lançamento com valor de imposto preenchido e percentual efetivo do mês de competência disponível (o mesmo “% Imposto” do acompanhamento mensal), **When** o usuário passa o cursor ou foca a célula **Imposto**, **Then** o tooltip exibe essa alíquota (percentual) de forma legível (ex.: 6,00% ou 6%).
2. **Given** o tooltip aberto, **When** o usuário lê o conteúdo, **Then** a alíquota é a do **mês de competência** daquele lançamento e é a mesma para todos os lançamentos daquele mês (não é o percentual isolado da linha).
3. **Given** um visualizador ou um administrador, **When** consulta o tooltip, **Then** ambos veem a mesma informação (recurso de leitura).
4. **Given** o usuário move o cursor para fora da célula, **When** o tooltip some, **Then** a tabela permanece inalterada (sem navegação, sem edição).

---

### User Story 2 - Entender quando não há alíquota do mês (Priority: P2)

Quando o mês de competência não tem percentual efetivo disponível (o mesmo critério em que o acompanhamento de Impostos mostra “—” em “% Imposto”, inclusive percentual 0 por falta de faturamento), o usuário **ainda abre o tooltip** e lê uma **mensagem explícita** de que a alíquota do mês não está disponível. Nenhum percentual inventado aparece.

**Why this priority**: Evita decisão financeira com percentual falso e deixa claro que o tooltip funcionou.

**Independent Test**: Abrir um lançamento cujo mês não tenha percentual efetivo; acionar o tooltip em Imposto e confirmar a mensagem de indisponível, sem número percentual.

**Acceptance Scenarios**:

1. **Given** um lançamento cujo mês de competência não possui percentual efetivo, **When** o usuário aciona o tooltip de Imposto, **Then** o tooltip abre com mensagem explícita (ex.: “Alíquota do mês indisponível”) e **não** mostra um percentual inventado (zero “falso” como alíquota válida, ou percentual de outro mês/linha).
2. **Given** a célula Imposto com valor “—” (sem imposto informado) e percentual efetivo do mês disponível, **When** o usuário aciona o tooltip, **Then** o tooltip mostra a **alíquota do mês** (rotulada como tal, com mês/ano) e **não** apresenta esse percentual como se fosse o imposto da linha.
3. **Given** o mês da tela filtrada (se houver filtro de mês/ano) diferente do mês de competência do lançamento, **When** o usuário vê o tooltip, **Then** a alíquota (ou a mensagem de indisponível) refere-se ao **mês de competência do lançamento**, não ao filtro da página.

---

### Edge Cases

- Lançamento sem data de competência utilizável: o tooltip abre e informa que a alíquota do mês não está disponível (não inventa mês nem percentual).
- Percentual efetivo 0 (ex.: sem faturamento no mês, o mesmo “—” de “% Imposto” no acompanhamento): trata-se como **indisponível**, com a mensagem explícita — não como “0%” válido, salvo se o acompanhamento passar a exibir 0% como alíquota real daquele mês.
- Célula Imposto “—” com percentual efetivo do mês disponível: o tooltip mostra a alíquota do mês, claramente identificada; não infere um valor em reais de imposto.
- Teclado / leitores de tela: a alíquota permanece acessível (não só ao passar o mouse).
- Tema claro e escuro: o tooltip permanece legível.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Na tabela de Contas a Receber, a célula da coluna **Imposto** DEVE oferecer um tooltip (ou equivalente acessível) que inclua a **alíquota do mês** de competência do lançamento.
- **FR-002**: A alíquota exibida DEVE ser o **percentual efetivo do mês** já usado no acompanhamento de Impostos (o “% Imposto” daquele mês/ano), compartilhado por todos os lançamentos daquele mês. NÃO DEVE ser o percentual isolado da linha (imposto da linha ÷ bruto da linha) nem uma alíquota cadastrada distinta desse percentual efetivo.
- **FR-003**: O valor em reais de Imposto na célula permanece visível como hoje; a alíquota entra **dentro do tooltip**, não substitui o valor da célula.
- **FR-004**: O sistema DEVE identificar o mês/ano de competência do lançamento pela **data de emissão**; se a emissão estiver vazia, usa a **data de vencimento**; se ambas estiverem vazias, a alíquota do mês não é determinada (ver FR-006).
- **FR-005**: O texto do tooltip DEVE identificar que o percentual é a alíquota do mês (não apenas um número solto), por exemplo incluindo o mês/ano de referência.
- **FR-006**: Se o percentual efetivo do mês não existir, for o equivalente a “—” no acompanhamento de Impostos, ou o mês não puder ser determinado, o tooltip DEVE abrir com mensagem explícita de indisponibilidade e NÃO DEVE apresentar um percentual de outro mês nem um valor inventado.
- **FR-007**: Visualizador e administrador veem o tooltip; a feature NÃO altera permissões de edição de imposto.
- **FR-008**: Esta feature aplica-se **somente** à coluna **Imposto** da tabela da página **Contas a Receber**. Não altera a página Impostos (gráficos ou tabela), o Dashboard nem Contas a Pagar, salvo reutilização silenciosa da mesma fonte de alíquota mensal já existente.
- **FR-009**: Se a célula Imposto estiver vazia (“—”) e o percentual efetivo do mês de competência existir, o tooltip DEVE mesmo assim exibir essa alíquota do mês, identificada como percentual do mês (não como imposto da linha). Se o percentual não existir, aplica-se o FR-006.

### Key Entities

- **Conta a receber (lançamento)**: item da lista com valor de imposto, datas (emissão, vencimento) e demais campos já existentes.
- **Alíquota do mês**: percentual **efetivo** associado a um par mês/ano no acompanhamento de Impostos (o mesmo “% Imposto” daquele mês), compartilhado por todos os lançamentos daquele mês.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos lançamentos com mês de competência determinado e alíquota do mês disponível (incluindo células Imposto “—”), o usuário obtém essa alíquota no tooltip de Imposto sem abrir outra página.
- **SC-002**: O usuário consegue ler a alíquota em até 2 segundos após passar o cursor ou focar a célula Imposto (sem busca extra).
- **SC-003**: Em testes com pelo menos 10 lançamentos de meses diferentes, nenhuma célula mostra alíquota de um mês que não seja o de competência daquela linha.
- **SC-004**: Usuários deixam de precisar ir à tela Impostos só para conferir o percentual do mês enquanto analisam a tabela de Contas a Receber (tarefa de conferência feita no próprio tooltip).

## Assumptions

- A página **Contas a Receber** é a lista de valores a receber (notas/lançamentos) com coluna **Imposto**.
- “Alíquota do mês” é o percentual efetivo já exibido como “% Imposto” no acompanhamento mensal (mesmo mês/ano), não um cadastro novo nem o percentual da linha.
- A competência do lançamento segue a data de emissão (padrão já usado no faturamento mensal de Impostos), com vencimento como fallback.
- Formato do percentual: padrão brasileiro (vírgula decimal) com até duas casas, acompanhado do símbolo %.
- Não entra no escopo cadastrar ou editar alíquota a partir deste tooltip.
- Tooltip de gráficos da página Impostos, da tabela da página Impostos e de outras telas permanece fora desta entrega (confirmado na sessão de esclarecimento).
