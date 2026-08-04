# Feature Specification: Calendário com Legenda de Status

**Feature Branch**: `006-calendario-legenda`

**Created**: 2026-07-26

**Status**: Draft

**Input**: User description: "Calendário (manter). Legenda: a receber (azul) + recebido (verde) + a pagar (laranja) + pago (verde)"

## Clarifications

### Session 2026-07-26

- Q: NFs canceladas no calendário → A: Ocultar canceladas — não exibir no Calendário
- Q: NFs com status `vencida` → A: `vencida` = a receber (azul), como `pendente`
- Q: Distinguir “recebido” e “pago” (ambos verdes) → A: Só texto/tipo (NF vs Conta); mesma cor verde
- Q: Formato dos rótulos na legenda → A: Inicial maiúscula: “A receber”, “Recebido”, “A pagar”, “Pago”

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar vencimentos no calendário existente (Priority: P1)

Usuário autenticado com permissão de calendário abre a página de Calendário e continua vendo a grade mensal de vencimentos de NFs e contas a pagar, com navegação entre meses, destaque do dia atual, seleção de dia e detalhe dos eventos — o comportamento operacional atual é mantido.

**Why this priority**: O pedido explícito é “manter” o Calendário; a legenda só tem valor se a visão de vencimentos continuar utilizável como hoje.

**Independent Test**: Abrir `/calendario`, navegar um mês para frente e para trás, selecionar um dia com eventos e confirmar lista de detalhe sem regressão das funções atuais (exportação inclusa, se já existir).

**Acceptance Scenarios**:

1. **Given** o usuário autenticado com acesso ao Calendário, **When** abre a página, **Then** vê a grade do mês corrente com vencimentos de NFs e contas a pagar posicionados pela data de vencimento.
2. **Given** a grade visível, **When** navega para o mês anterior ou seguinte, **Then** a grade e os eventos refletem o mês/ano selecionado.
3. **Given** um dia com um ou mais vencimentos, **When** o usuário seleciona esse dia, **Then** vê a lista detalhada dos eventos daquele dia (título, tipo e valor).
4. **Given** um dia sem vencimentos, **When** o usuário o seleciona, **Then** vê indicação clara de que não há vencimentos naquele dia.

---

### User Story 2 - Ler a legenda de status com as cores oficiais (Priority: P1)

Usuário identifica, pela legenda visível na página, o significado das cores dos marcadores: **A receber** (azul), **Recebido** (verde), **A pagar** (laranja) e **Pago** (verde).

**Why this priority**: É o único delta solicitado em relação ao Calendário mantido; sem legenda alinhada, o usuário interpreta mal os status.

**Independent Test**: Abrir o Calendário e conferir que a legenda exibe exatamente os quatro itens com as cores indicadas, independentemente de haver eventos no mês.

**Acceptance Scenarios**:

1. **Given** a página do Calendário carregada, **When** o usuário observa a área de legenda, **Then** vê quatro itens com inicial maiúscula: “A receber” em azul, “Recebido” em verde, “A pagar” em laranja e “Pago” em verde.
2. **Given** a legenda visível, **When** o usuário compara com os marcadores na grade ou no detalhe do dia, **Then** as cores dos eventos batem com a legenda (pendente de NF = azul; NF quitada = verde; conta pendente = laranja; conta paga = verde).

---

### User Story 3 - Distinguir status na grade e no detalhe (Priority: P2)

Usuário diferencia de relance, na grade mensal e no painel do dia, o que ainda está em aberto (a receber / a pagar) do que já foi quitado (recebido / pago), usando as cores da legenda.

**Why this priority**: Consolida o valor da legenda na leitura diária; a grade já existe, o alinhamento visual é o reforço necessário.

**Independent Test**: Com pelo menos uma NF pendente, uma NF paga, uma conta pendente e uma conta paga no mês, verificar que cada uma usa a cor correspondente na grade e no detalhe.

**Acceptance Scenarios**:

1. **Given** uma NF com vencimento no mês e status em aberto, **When** o usuário olha o dia correspondente, **Then** o marcador usa azul (a receber).
2. **Given** uma NF com vencimento no mês já quitada/recebida, **When** o usuário olha o dia correspondente, **Then** o marcador usa verde (recebido).
3. **Given** uma conta a pagar com vencimento no mês e ainda não paga, **When** o usuário olha o dia correspondente, **Then** o marcador usa laranja (a pagar).
4. **Given** uma conta a pagar com vencimento no mês já paga, **When** o usuário olha o dia correspondente, **Then** o marcador usa verde (pago).
5. **Given** o detalhe de um dia com eventos mistos, **When** o usuário lê a lista, **Then** cada item mantém a mesma cor de status usada na grade.
6. **Given** uma NF recebida e uma conta paga no mesmo dia (ambas verdes), **When** o usuário compara os dois itens, **Then** a distinção é pelo tipo/rótulo (NF vs Conta), não por cor ou ícone adicional.

---

### Edge Cases

- Dia com muitos eventos: a grade continua mostrando resumo limitado (como hoje) e o detalhe do dia lista todos; cores da legenda se aplicam a cada item.
- Mês sem nenhum vencimento: grade e legenda permanecem; mensagem de vazio só no detalhe do dia selecionado (ou equivalente já existente).
- NF e conta no mesmo dia, ambas quitadas: ambas aparecem em verde; a distinção de tipo (NF vs conta) permanece no texto/rótulo do item, não na cor de status quitado (sem ícone ou tom de verde extra).
- NF cancelada: não aparece no Calendário (grade nem detalhe), independentemente da data de vencimento.
- NF vencida (ainda não paga): aparece em azul (a receber), igual a pendente; sem cor ou status extra na legenda.
- Falha ao carregar dados: usuário recebe feedback de erro; a legenda pode permanecer visível, mas a grade não exibe eventos inventados.
- Usuário sem permissão de calendário: a página não fica acessível (mesmo comportamento de autorização do produto).
- Visualizador (somente leitura): visualiza calendário e legenda; não há CRUD no Calendário (criação/edição permanece nas páginas de NFs e Contas).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST manter a página de Calendário de vencimentos com grade mensal, navegação por mês/ano, destaque do dia atual, seleção de dia e lista de detalhe dos vencimentos do dia.
- **FR-002**: O Calendário MUST continuar exibindo vencimentos de NFs e de contas a pagar com base na data de vencimento de cada registro. NFs com status **cancelada** MUST NÃO aparecer na grade nem no detalhe do dia.
- **FR-003**: O sistema MUST exibir uma legenda visível na página do Calendário com exatamente estes quatro itens (inicial maiúscula) e cores associadas:
  - **A receber** — azul
  - **Recebido** — verde
  - **A pagar** — laranja
  - **Pago** — verde
- **FR-004**: NFs em aberto (não quitadas) MUST ser representadas com a cor azul (a receber) na grade e no detalhe do dia. Isso inclui status **pendente** e **vencida**.
- **FR-005**: NFs quitadas/recebidas (status **paga**) MUST ser representadas com a cor verde (recebido) na grade e no detalhe do dia.
- **FR-006**: Contas a pagar em aberto MUST ser representadas com a cor laranja (a pagar) na grade e no detalhe do dia.
- **FR-007**: Contas a pagar já pagas MUST ser representadas com a cor verde (pago) na grade e no detalhe do dia.
- **FR-008**: A legenda MUST substituir rótulos antigos baseados só em “tipo” (ex.: apenas “NF” / “Conta a pagar” / “Quitado”) pelos quatro status de negócio definidos em FR-003, alinhados às cores dos marcadores. “Recebido” e “pago” MUST usar a mesma cor verde; a distinção entre eles MUST ser apenas pelo texto/tipo do evento (NF vs Conta), sem ícone extra nem tons de verde diferentes.
- **FR-009**: Funções auxiliares já existentes no Calendário (ex.: exportação) MUST permanecer disponíveis; esta feature não as remove nem altera o escopo de negócio delas.
- **FR-010**: Papéis e permissões existentes (`admin` / `visualizador` e chave de permissão do calendário) MUST ser respeitados; o Calendário continua somente consulta nesta página.

### Key Entities

- **Evento de calendário**: ocorrência de vencimento em uma data; origem NF ou conta a pagar; atributos de negócio relevantes: data de vencimento, título/descrição, valor, status de quitação (em aberto vs quitado).
- **Status visual**:
  - **A receber** — NF em aberto (`pendente` ou `vencida`)
  - **Recebido** — NF quitada (`paga`)
  - **A pagar** — conta em aberto
  - **Pago** — conta paga
- **Legenda**: mapeamento fixo status → cor, exibido na página com os rótulos em inicial maiúscula para interpretação dos marcadores.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em inspeção da página, 100% dos usuários de teste identificam os quatro itens da legenda (“A receber”, “Recebido”, “A pagar”, “Pago”) e associam cada um à cor correta (azul, verde, laranja, verde) em até 10 segundos.
- **SC-002**: Em um mês de amostra com pelo menos um evento de cada status, 100% dos marcadores na grade e no detalhe do dia usam a cor prevista pela legenda (sem inconsistência legenda × evento).
- **SC-003**: Navegação mês a mês, seleção de dia e listagem de detalhe permanecem utilizáveis como antes; regressão funcional do fluxo principal do Calendário = 0 nos cenários de aceitação da User Story 1.
- **SC-004**: Pelo menos 90% dos usuários de teste distinguem corretamente, em uma pergunta objetiva, “ainda em aberto” vs “já quitado” a partir só das cores na grade (sem abrir outras páginas).

## Assumptions

- “Calendário (manter)” significa preservar o escopo e o fluxo atuais da página (grade, NFs + contas por vencimento, detalhe do dia, navegação, exportações existentes), alterando principalmente a legenda e o alinhamento semântico das cores aos quatro status.
- “Recebido” refere-se a NF com status `paga`; “a receber” cobre NFs `pendente` e `vencida` (ambas em azul). “Pago” refere-se a conta a pagar quitada — verde, como recebido; a distinção entre recebido e pago é pelo contexto/rótulo do evento (NF vs conta), não pela cor.
- NFs canceladas ficam fora do Calendário; não entram na legenda nem competem com “a receber” / “recebido”.
- Não há mudança de regras de negócio de cálculo de vencimento, status de NF/conta ou permissões nesta feature.
- Não se exige filtrar a grade por status nesta versão; a legenda é informativa e as cores já diferenciam os itens.
- Tom de azul/laranja/verde segue a paleta já usada no produto para esses significados (marcadores atuais), desde que a correspondência status ↔ cor da FR-003 seja respeitada.
- Rótulos da legenda usam inicial maiúscula (“A receber”, “Recebido”, “A pagar”, “Pago”), não minúsculas literais do pedido original.
- Fora de escopo: CRUD no Calendário, novos tipos de evento (bônus, férias, DH etc.), filtros por status, ou alteração de outras páginas.
