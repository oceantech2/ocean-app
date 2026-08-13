# Feature Specification: Fluxo de Caixa — Importar Contas a Receber e Contas a Pagar

**Feature Branch**: `024-fluxo-caixa-importar`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "em fluxo de caixa importar dados de Contas a Receber + Contas a Pagar"

## Clarifications

### Session 2026-08-13

- Q: Como o Fluxo de Caixa deve obter os dados de Contas a Receber e Contas a Pagar? → A: Reflexão automática: ao abrir ou mudar mês/ano, o caixa já traz Contas a Receber recebidas e Contas a Pagar pagas do período. Sem botão de importar.
- Q: Dá para omitir um item do caixa sem mudar a origem? → A: Não omitir: todo recebido/pago do período aparece no caixa.
- Q: Como o usuário distingue a origem na lista? → A: Coluna Origem com os rótulos canônicos Contas a Receber, Contas a Pagar e Manual.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver recebimentos e pagamentos no Fluxo de Caixa (Priority: P1)

Qualquer usuário autenticado com acesso ao **Fluxo de Caixa**, ao abrir a página ou mudar mês/ano, vê automaticamente as **Contas a Receber recebidas** e as **Contas a Pagar pagas** daquele período como movimentos do caixa — sem botão de importar e sem redigitar valores. Entradas, saídas, totais e exportação da página usam esses dados, somados aos lançamentos manuais do próprio caixa, se houver.

**Why this priority**: É o valor central do pedido: o caixa deve refletir o dinheiro que de fato entrou (Contas a Receber) e saiu (Contas a Pagar), a partir dos módulos oficiais, sempre alinhado ao período em tela.

**Independent Test**: Ter ao menos uma conta a receber recebida e uma conta a pagar paga no período; abrir o Fluxo de Caixa nesse período; confirmar que os dois registros aparecem como entrada e saída com data, descrição e valor coerentes com a origem — sem acionar importação.

**Acceptance Scenarios**:

1. **Given** um usuário no Fluxo de Caixa com período selecionado e ao menos um recebimento em Contas a Receber e um pagamento em Contas a Pagar nesse período, **When** abre a página ou muda mês/ano, **Then** vê esses registros nos movimentos do caixa do mesmo período, sem botão de importar.
2. **Given** o período carregado, **When** o usuário consulta a lista de movimentos, **Then** cada Conta a Receber recebida aparece como **entrada** e cada Conta a Pagar paga aparece como **saída**, com a **data de pagamento** da origem.
3. **Given** o período carregado, **When** o usuário observa os totais de entradas e saídas, **Then** os totais incluem os valores das origens (somados aos lançamentos manuais do próprio Fluxo de Caixa, se houver).
4. **Given** um visualizador, **When** abre o Fluxo de Caixa, **Then** vê os mesmos movimentos automáticos do período em somente leitura; não há ação de importar.
5. **Given** o período sem nenhum recebimento nem pagamento nas origens, **When** o usuário abre a página, **Then** não há movimentos automáticos inventados; a lista automática fica vazia (manuais, se existirem, continuam visíveis).

---

### User Story 2 - Permanecer alinhado às origens sem duplicar (Priority: P1)

O Fluxo de Caixa é um **espelho** do período: na próxima abertura ou mudança de filtro, novos recebimentos/pagamentos entram, alterações de valor/data/descrição na origem passam a valer no caixa, e registros que deixaram de estar recebidos/pagos saem dos movimentos automáticos — **sem duplicar** o mesmo título.

**Why this priority**: Totais inflados ou caixa desatualizado tornam a tela inutilizável para decisão financeira.

**Independent Test**: Ver um movimento automático; alterar valor ou data de pagamento na origem; voltar ao Fluxo de Caixa (reabrir ou mudar e retornar o período); conferir um único movimento atualizado. Marcar a conta como pendente de novo; conferir que o movimento automático desapareceu.

**Acceptance Scenarios**:

1. **Given** um registro de origem já visível no caixa, **When** o usuário reabre ou refiltra o mesmo período sem mudanças na origem, **Then** o movimento continua único (não aparece duas vezes) e os totais não dobram.
2. **Given** um registro cujo valor, data de pagamento ou descrição mudou na origem, **When** o usuário reabre ou refiltra o Fluxo de Caixa, **Then** o movimento no caixa reflete os dados atuais da origem.
3. **Given** uma conta a receber que deixou de estar recebida ou uma conta a pagar que voltou a pendente, **When** o usuário reabre ou refiltra o Fluxo de Caixa, **Then** o movimento automático correspondente some daquele período.
4. **Given** um lançamento **manual** criado no próprio Fluxo de Caixa, **When** os movimentos automáticos são recarregados com o período, **Then** esse lançamento manual permanece intacto.
5. **Given** um movimento automático visível (recebido ou pago na origem), **When** o administrador procura ocultar, excluir ou omitir só no Fluxo de Caixa, **Then** a ação não está disponível; o movimento permanece até a origem deixar de estar recebida/paga (ou arquivada, no caso de Contas a Receber).

---

### User Story 3 - Distinguir origem e consultar no período (Priority: P2)

Qualquer usuário autenticado com acesso ao Fluxo de Caixa identifica, na listagem de movimentos, o que veio de Contas a Receber, o que veio de Contas a Pagar e o que foi lançado manualmente no caixa, pela coluna **Origem**. O filtro de mês/ano já existente limita o que é exibido.

**Why this priority**: Completa a operação gerencial (auditoria visual e recorte de período), mas o espelho correto e sem duplicidade já entrega o MVP.

**Independent Test**: Com os três tipos presentes no período, abrir o Fluxo de Caixa e conferir a coluna Origem com os três rótulos; mudar o mês e conferir que só aparecem movimentos daquele recorte.

**Acceptance Scenarios**:

1. **Given** movimentos de Contas a Receber, de Contas a Pagar e um lançamento manual no mesmo período, **When** o usuário abre a lista, **Then** a coluna **Origem** exibe **Contas a Receber**, **Contas a Pagar** e **Manual** respectivamente, de forma distinguível, sem abrir outro módulo.
2. **Given** um mês selecionado, **When** o usuário consulta o Fluxo de Caixa, **Then** só aparecem registros automáticos cuja **data de pagamento** pertence àquele mês e ano.
3. **Given** mês “Todos” e um ano selecionado, **When** o usuário consulta o Fluxo de Caixa, **Then** aparecem os registros automáticos cuja data de pagamento está naquele ano.
4. **Given** a exportação já existente do Fluxo de Caixa, **When** o usuário exporta, **Then** o resultado inclui os movimentos visíveis com data, tipo, origem, descrição e valor alinhados à tela.

---

### Edge Cases

- Conta a receber **pendente** (sem data de pagamento / não recebida): não entra no Fluxo de Caixa.
- Conta a pagar **pendente** (sem data de pagamento): não entra no Fluxo de Caixa.
- Conta a receber **arquivada**: não aparece no caixa enquanto estiver ocultada da listagem padrão de origem; se o produto já exclui arquivadas dos totais de recebimento, o caixa segue a mesma regra.
- Recarregar ou refiltrar o mesmo período: permanece um movimento automático por registro de origem.
- Origem sem registros no período: lista automática vazia, sem movimentos fictícios; não há botão nem mensagem de “nada a importar”.
- Falha ao carregar o período: usuário recebe mensagem compreensível; lançamentos manuais já gravados não são apagados; a tela não mostra totais automáticos inventados.
- Valor zero ou inválido na origem: o registro não gera movimento no caixa; os demais seguem.
- Lançamento manual com descrição/valor parecidos aos de uma conta da origem: convivem; não são fundidos automaticamente.
- Visualizador: vê os mesmos movimentos automáticos do período; não há ação de importar.
- Identificação de Caixa da Conta a Receber (corrente / investimento / vazia): o movimento de entrada permanece associado ao significado de caixa da origem quando existir; ausência de Caixa não impede a entrada no fluxo (o movimento ainda é listado).
- Contas a Pagar não têm identificação de Caixa no produto: saídas automáticas entram no fluxo do período sem exigir classificação corrente/investimento no movimento.
- Tentativa de ocultar, excluir ou “não puxar” um movimento automático só no Fluxo de Caixa: ação inexistente; o registro continua no caixa enquanto a origem permanecer recebida/paga no período.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ao abrir o Fluxo de Caixa ou mudar mês/ano, o sistema MUST exibir automaticamente os dados de **Contas a Receber** e **Contas a Pagar** do período selecionado. MUST NOT exigir botão de importar para esses módulos.
- **FR-002**: Os movimentos automáticos MUST incluir somente Contas a Receber **recebidas** (com data de pagamento) e Contas a Pagar **pagas** (com data de pagamento).
- **FR-003**: Cada Conta a Receber recebida no período MUST aparecer como movimento de **entrada**; cada Conta a Pagar paga no período MUST aparecer como movimento de **saída**.
- **FR-004**: A data do movimento automático MUST ser a **data de pagamento** do registro de origem.
- **FR-005**: O valor do movimento automático MUST ser o valor de caixa da origem: em Contas a Receber, o **valor líquido**; em Contas a Pagar, o **valor** da conta.
- **FR-006**: A descrição do movimento automático MUST identificar o registro de origem de forma reconhecível (por exemplo número/cliente em Contas a Receber e descrição da despesa em Contas a Pagar).
- **FR-007**: O mesmo registro de origem MUST gerar no máximo um movimento automático no Fluxo de Caixa (sem duplicar ao reabrir ou refiltrar).
- **FR-008**: Na próxima abertura ou mudança de filtro, os movimentos automáticos MUST refletir valor, data de pagamento e descrição atuais da origem.
- **FR-009**: O sistema MUST deixar de exibir o movimento automático cuja origem deixou de atender FR-002 (pendente de novo, sem data de pagamento, ou fora do período).
- **FR-010**: Recarregar os movimentos automáticos MUST NOT apagar, alterar ou fundir **lançamentos manuais** do próprio Fluxo de Caixa.
- **FR-011**: Usuários com papel **visualizador** MUST consultar os movimentos automáticos e manuais do período em somente leitura; MUST NOT existir ação de importar Contas a Receber/Pagar nesta tela.
- **FR-012**: O recorte de período da página (mês e ano) MUST limitar a exibição dos movimentos automáticos com base na data de pagamento.
- **FR-013**: Totais de entradas, saídas e resultado do período MUST incluir movimentos automáticos e lançamentos manuais, sem contar o mesmo título duas vezes.
- **FR-014**: A listagem de movimentos MUST exibir a coluna **Origem** com os rótulos canônicos **Contas a Receber**, **Contas a Pagar** e **Manual**.
- **FR-015**: Se não houver dados elegíveis no período, o sistema MUST NOT inventar movimentos automáticos.
- **FR-016**: Se o período não puder ser carregado, o sistema MUST informar o usuário e MUST NOT apresentar totais automáticos inventados; lançamentos manuais já gravados MUST permanecer.
- **FR-017**: A exportação já existente do Fluxo de Caixa MUST incluir os movimentos automáticos e manuais alinhados ao que a tela exibe no momento da exportação, inclusive a **Origem**.
- **FR-018**: O sistema MUST NOT exigir que o usuário recadastre no Fluxo de Caixa um recebimento ou pagamento que já existe em Contas a Receber ou Contas a Pagar para que ele entre no caixa.
- **FR-019**: A origem canônica das **entradas** automáticas MUST ser **Contas a Receber** (módulo oficial de receitas). MUST NOT haver uma segunda lista paralela de notas/receitas no mesmo período que some o mesmo título duas vezes.
- **FR-020**: O sistema MUST NOT permitir ocultar, excluir ou omitir um movimento automático somente no Fluxo de Caixa. Todo registro recebido/pago do período MUST aparecer; para deixar de aparecer, a origem MUST deixar de atender FR-002 (ou, em Contas a Receber, permanecer arquivada conforme a listagem padrão).

### Key Entities

- **Fluxo de Caixa**: Visão do período com saldos de conta corrente e investimento, totais de entradas/saídas e lista de movimentos.
- **Movimento automático**: Entrada ou saída exibida no Fluxo de Caixa a partir de um registro de Contas a Receber ou Contas a Pagar, vinculada de forma estável à origem (espelho do período, sem cópia congelada, sem flag de ocultação só no caixa).
- **Movimento manual**: Receita ou despesa lançada diretamente no Fluxo de Caixa, independente dos movimentos automáticos.
- **Conta a Receber**: Registro de valor a receber (módulo de receitas do Ocean); só gera entrada no caixa quando **recebida**, com data de pagamento e valor líquido.
- **Conta a Pagar**: Registro de despesa; só gera saída no caixa quando **paga**, com data de pagamento e valor.
- **Usuário**: Admin (mantém manuais e saldos; vê o espelho das origens) ou visualizador (somente leitura), conforme papéis do produto.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuário autenticado vê os movimentos automáticos de um período típico (dezenas de recebimentos e pagamentos) em menos de 1 minuto após abrir ou filtrar o Fluxo de Caixa, sem redigitar valores e sem botão de importar.
- **SC-002**: Em 100% dos casos de teste, Contas a Receber recebidas no período aparecem como entradas e Contas a Pagar pagas no período aparecem como saídas, com data de pagamento e valor iguais aos da origem.
- **SC-003**: Em 100% das reaberturas/refiltros sem mudança na origem, não há movimento duplicado nem inflação de totais.
- **SC-004**: Em 100% dos casos em que valor ou data mudam na origem, a próxima abertura ou filtro do caixa exibe um único movimento com os dados atualizados.
- **SC-005**: Em 100% dos testes com contas pendentes (receber ou pagar), esses registros não geram movimento no Fluxo de Caixa.
- **SC-006**: Em 100% das inspeções com papel visualizador, não há ação de importar Contas a Receber/Pagar; a consulta dos movimentos do período permanece disponível.
- **SC-007**: Em pelo menos 95% das exportações de teste, o arquivo/resultado contém os mesmos movimentos (data, tipo, origem, descrição, valor) visíveis na tela.
- **SC-008**: Em 100% das inspeções de listagem de teste com os três tipos presentes, a coluna Origem mostra **Contas a Receber**, **Contas a Pagar** ou **Manual** de forma correta e distinguível.
- **SC-009**: Em 100% das tentativas de omitir um movimento automático só no caixa, a ação é inexistente ou bloqueada e o movimento permanece visível.

## Assumptions

- No Ocean App, **Contas a Receber** é o módulo oficial de receitas (a listagem operacional de notas/receitas); o caixa usa esse módulo, não um cadastro paralelo.
- Só entram registros **liquidados** (recebidos / pagos) com **data de pagamento**; pendentes e vencidas sem pagamento ficam de fora.
- Valor de entrada = **valor líquido** da Conta a Receber (dinheiro que efetivamente entra); valor de saída = **valor** da Conta a Pagar.
- A visão ocorre **no Fluxo de Caixa** (não nas páginas de origem). Cadastro, edição, receber/pagar continuam nos módulos de origem.
- Não há botão **Importar** para Contas a Receber/Pagar nesta tela; o caixa espelha as origens ao abrir ou mudar o período. A importação de **saldos** por arquivo (já existente) é outro fluxo e permanece.
- Não se exige edição do movimento automático dentro do Fluxo de Caixa: correção é na origem.
- Não há omissão seletiva: recebido/pago no período aparece no caixa; ocultar só no caixa está fora.
- A distinção canônica de origem na lista (e na exportação) é a coluna **Origem** com os rótulos **Contas a Receber**, **Contas a Pagar** e **Manual**; não depende só da descrição nem só de cor/ícone.
- Lançamentos manuais do Fluxo de Caixa e registro de saldos corrente/investimento permanecem; esta feature não os substitui.
- Papéis admin / visualizador e permissão de acesso ao menu Fluxo de Caixa seguem o produto.
- Arquivadas em Contas a Receber seguem a mesma exclusão da listagem padrão da origem (não entram no caixa enquanto arquivadas).
- Contas a Pagar não exigem Caixa; entradas de Contas a Receber carregam a classificação de Caixa da origem quando existir, só para contexto, sem redesenhar os cards de saldo.

## Out of Scope

- Botão ou lote de **Importar** que grave uma cópia congelada de Contas a Receber/Pagar no Fluxo de Caixa.
- Recadastrar recebimentos ou pagamentos manualmente no Fluxo de Caixa como substituto do espelho das origens.
- Alterar regras de cadastro, status, categorias ou formulários de Contas a Receber e Contas a Pagar.
- Incluir no caixa NFs/receitas pendentes ou contas a pagar pendentes.
- Fundir automaticamente lançamento manual com registro de origem “parecido”.
- Recalcular ou sobrescrever os **saldos** registrados de conta corrente e investimento a partir dos movimentos automáticos.
- Importar arquivo externo (planilha/CSV) de Contas a Receber ou Contas a Pagar **nesta** tela como caminho principal (a origem é o dado já gravado nos módulos).
- Dashboard, calendário, impostos, bônus, DH ou outros menus.
- Exigir que o visualizador (ou o admin) acione importação para ver o período.
- Distinguir origem só por cor/ícone ou só por prefixo na descrição, sem a coluna **Origem**.
- Ocultar, excluir ou marcar exceção de movimento automático somente no Fluxo de Caixa.
