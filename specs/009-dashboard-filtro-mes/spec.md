# Feature Specification: Dashboard — Filtro de Mês

**Feature Branch**: `009-dashboard-filtro-mes`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "em dashboard no topo deve aparecer um filtro de mês além do ano"

**Baseline**: Referencia o dashboard existente (`specs/001-ocean-app-baseline` e features `002`–`004`), que já oferece filtro de **ano** no topo. Esta feature adiciona o filtro de **mês** ao lado do ano e faz os indicadores mensais da dashboard respeitarem o período selecionado (mês + ano).

## Clarifications

### Session 2026-08-06

- Q: Ao mudar o filtro de mês, o que deve acontecer com os gráficos de série anual (DRE, faturamento líquido por mês)? → A: Só indicadores mensais mudam; gráficos anuais continuam com a série do ano selecionado.
- Q: Para custo por categoria e agregados mensais semelhantes, o mês selecionado significa o quê? → A: Apenas o mês selecionado (não acumulado YTD).
- Q: Nos cards de saldo, quando o mês selecionado não tem registro próprio, o que exibir? → A: Saldo mais recente até o mês selecionado no ano (fallback para meses anteriores).
- Q: No ano civil corrente, o usuário pode selecionar meses futuros? → A: Não: no ano corrente, só até o mês atual; anos anteriores permitem jan–dez.
- Q: Ao mudar o ano e o mês deixar de ser válido, o que fazer? → A: Manter o mês se ainda for permitido; senão ajustar para o máximo permitido no novo ano.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Selecionar mês e ano no topo da dashboard (Priority: P1)

Um usuário autenticado abre a dashboard e, no topo da página (na mesma área dos filtros de período já existentes), vê um seletor de **mês** além do seletor de **ano**. Ao escolher um mês e/ou um ano, a visão da dashboard passa a refletir aquele período, sem precisar sair da tela.

**Why this priority**: É o pedido central — controlar o período de análise diretamente no topo, com mês e ano juntos.

**Independent Test**: Abrir a dashboard; confirmar presença do filtro de mês ao lado do ano; alterar mês e ano e verificar que a tela atualiza para o período escolhido.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado com acesso à dashboard, **When** a tela carrega, **Then** existem no topo controles de filtro de **mês** e de **ano**, visíveis sem rolagem desnecessária no cabeçalho de filtros.
2. **Given** a dashboard carregada, **When** o usuário seleciona outro mês mantendo o mesmo ano, **Then** os indicadores mensais passam a refletir o mês escolhido no ano em exibição.
3. **Given** a dashboard carregada, **When** o usuário altera o ano, **Then** a visão atualiza para o novo ano e o mês permanece o selecionado se ainda for permitido nesse ano; caso contrário o mês é ajustado para o máximo permitido.
4. **Given** a primeira visita à dashboard (sem preferência prévia de período nesta sessão), **When** a tela carrega, **Then** o ano padrão é o ano civil corrente e o mês padrão é o mês civil corrente.
5. **Given** o ano civil corrente selecionado, **When** o usuário abre o filtro de mês, **Then** só consegue escolher meses de janeiro até o mês civil corrente (meses futuros não estão disponíveis).
6. **Given** um ano anterior ao ano civil corrente, **When** o usuário abre o filtro de mês, **Then** janeiro a dezembro estão disponíveis.
7. **Given** papéis `admin` e `visualizador`, **When** cada um abre a dashboard, **Then** ambos veem e podem usar os filtros de mês e ano (somente leitura dos dados para visualizador, sem mudança de permissões de edição).

---

### User Story 2 - Indicadores mensais seguem o período escolhido (Priority: P1)

Ao mudar o mês (e/ou o ano), os blocos da dashboard que representam um **período mensal** — em especial a meta de faturamento do mês e custos/agregados do mês — passam a mostrar dados **somente daquele mês/ano** (não acumulado de janeiro até o mês). Os **saldos** seguem regra própria: mais recente até o mês selecionado. Blocos cuja natureza é a **série do ano inteiro** (ex.: evolução mês a mês, DRE do ano) continuam exibindo a série do **ano selecionado**, coerentes com o filtro de ano.

**Why this priority**: Sem este comportamento, o filtro de mês seria apenas visual e não entregaria valor gerencial.

**Independent Test**: Com dados conhecidos em dois meses distintos, alternar o filtro de mês e confirmar que meta mensal / indicadores mensais mudam; confirmar que gráficos anuais (série de 12 meses) permanecem do ano selecionado.

**Acceptance Scenarios**:

1. **Given** metas de faturamento definidas para meses diferentes no mesmo ano, **When** o usuário troca o filtro de mês, **Then** o card de meta mensal exibe meta, realizado e progresso do mês selecionado (não do mês civil “de hoje”, se diferente).
2. **Given** saldos disponíveis em meses anteriores ao selecionado (mas não no mês exato), **When** o usuário seleciona esse mês/ano, **Then** os cards de saldo exibem o registro mais recente com mês ≤ mês selecionado no mesmo ano (e indicam o mês/ano do registro exibido).
3. **Given** nenhum saldo com mês ≤ mês selecionado no ano, **When** o usuário visualiza os cards de saldo, **Then** aparece estado vazio / “sem registro” compreensível.
4. **Given** o bloco de custo por categoria (ou agregado mensal equivalente), **When** o usuário escolhe um mês, **Then** o bloco exibe valores **apenas daquele mês** no ano selecionado (não soma janeiro até o mês; não ignora o filtro).
5. **Given** gráficos de evolução ao longo do ano (ex.: DRE anual, faturamento líquido por mês), **When** o usuário altera apenas o mês, **Then** a série anual do ano selecionado permanece intacta (sem colapsar, cortar ou destacar obrigatoriamente o mês); a alteração de **ano** continua trocando o ano da série.
6. **Given** o mês selecionado, **When** o usuário olha títulos/rótulos dos cards mensais, **Then** o mês/ano exibido no texto (ex.: “Meta de Faturamento — {mês}/{ano}”) coincide com o filtro do topo.

---

### User Story 3 - Entender período sem dados ou inválido (Priority: P2)

Quando o mês/ano selecionado não tem dados para algum bloco, ou quando o ano futuro torna o período sem sentido, a dashboard permanece utilizável: mensagens claras nos blocos afetados, sem quebrar o restante da tela nem os filtros.

**Why this priority**: Evita confusão ao navegar por períodos sem lançamentos.

**Independent Test**: Selecionar um mês/ano sem dados e um ano futuro; verificar estados vazios/feedback e filtros ainda operacionais.

**Acceptance Scenarios**:

1. **Given** um mês/ano sem lançamentos para um bloco mensal, **When** o usuário seleciona esse período, **Then** o bloco indica ausência de dados de forma compreensível e os demais blocos seguem utilizáveis.
2. **Given** ano selecionado posterior ao ano civil corrente, **When** a dashboard tenta montar séries/indicadores, **Then** o comportamento permanece previsível (estado vazio ou sem inventar meses futuros), alinhado às regras já usadas na dashboard para anos futuros.
3. **Given** falha ao carregar dados do período, **When** a carga termina, **Then** o usuário recebe feedback no bloco afetado (padrão da página) e pode alterar mês/ano novamente.

---

### Edge Cases

- Ano = ano civil corrente e mês = mês corrente: comportamento padrão de abertura.
- Ano = ano civil corrente: meses **posteriores** ao mês atual **não** são selecionáveis no filtro.
- Ano **anterior**: janeiro a dezembro selecionáveis.
- Ano **futuro** (se o seletor de ano permitir): sem inventar dados; séries/indicadores vazios conforme regras existentes.
- Troca de ano que torna o mês inválido (ex.: dezembro em ano passado → ano corrente em agosto): ajustar o mês para o máximo permitido nesse ano.
- Troca rápida de mês/ano: a visão final deve corresponder ao último período escolhido (sem misturar dados de períodos intermediários na UI final).
- Comparação de ano (quando existir controle de “comparar com”) continua independente do filtro de mês, afetando apenas a série de comparação anual.
- Custo/agregados mensais: trocar de março para janeiro troca o conjunto para **só janeiro** (não “até janeiro” vs “até março”).
- Saldos: se não houver registro no mês selecionado, usar o mais recente com mês ≤ selecionado no mesmo ano; nunca saldo de mês posterior ao filtro.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A dashboard MUST exibir, no topo, um filtro de **mês** além do filtro de **ano** já existente.
- **FR-002**: Os filtros de mês e ano MUST estar na mesma área de controles de período do topo, de forma clara e usável em desktop e mobile.
- **FR-003**: Na abertura padrão da dashboard, o sistema MUST pré-selecionar o ano civil corrente e o mês civil corrente.
- **FR-004**: Ao alterar o mês e/ou o ano, a dashboard MUST atualizar os indicadores **mensais** para o período selecionado (mês + ano).
- **FR-005**: O card de meta de faturamento **mensal** MUST refletir meta e progresso do mês selecionado no ano selecionado, e o rótulo MUST mostrar esse mês/ano.
- **FR-006**: O bloco de custo por categoria (e agregados mensais equivalentes, excluidos os saldos) MUST exibir dados **somente do mês selecionado** no ano selecionado (mês isolado — não acumulado “até o mês” / YTD).
- **FR-006a**: Os cards de saldo (conta corrente / investimento) MUST exibir o saldo mais recente com mês ≤ mês selecionado no ano selecionado; se não houver nenhum, MUST mostrar estado vazio / “sem registro”. O rótulo do card MUST indicar o mês/ano do registro efetivamente exibido quando houver fallback.
- **FR-007**: Blocos de **série anual** (evolução mês a mês no ano, DRE do ano, faturamento líquido por mês, etc.) MUST continuar baseados apenas no **ano** selecionado; a mudança isolada do mês NÃO deve colapsar, cortar nem obrigar destaque do mês nesses gráficos — somente os indicadores mensais reagem ao filtro de mês.
- **FR-008**: A meta de faturamento **anual** MUST continuar associada ao ano selecionado (não ao mês).
- **FR-009**: Usuários `admin` e `visualizador` MUST poder alterar os filtros de mês e ano; permissões de edição de metas/dados permanecem as já definidas no produto.
- **FR-010**: Em períodos sem dados, a dashboard MUST exibir estado vazio/legível nos blocos afetados, sem erro que impeça o uso dos filtros ou do restante da tela.
- **FR-011**: O conjunto de meses selecionáveis MUST cobrir janeiro a dezembro (rótulos em português) em anos **anteriores** ao ano civil corrente; no **ano civil corrente**, MUST oferecer apenas janeiro até o mês civil corrente (meses futuros não selecionáveis).
- **FR-012**: Ao mudar o ano de forma que o mês selecionado deixe de ser permitido, o sistema MUST ajustar automaticamente o mês para o maior mês permitido naquele ano.

### Key Entities

- **Período da dashboard**: Combinação de mês (1–12) e ano usada como contexto de visualização no topo.
- **Indicador mensal**: Bloco cujo valor ou progresso se refere a um único mês isolado (ex.: meta mensal, custo só do mês) — não acumulado de janeiro até o mês. Saldos são indicadores de período com regra de fallback própria.
- **Série anual**: Bloco que apresenta vários meses do ano selecionado em sequência (ex.: DRE, faturamento por mês).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em até 10 segundos após abrir a dashboard, o usuário identifica e usa o filtro de mês junto ao de ano, sem treino adicional.
- **SC-002**: Em 100% dos testes manuais com dois meses distintos com dados conhecidos, ao trocar o filtro de mês o card de meta mensal e o custo do mês isolado mostram exclusivamente o período selecionado; saldos respeitam o fallback “mais recente até o mês”.
- **SC-003**: Em 100% dos testes, alterar só o mês deixa os gráficos de série anual do ano selecionado intactos (mesma série/ano; sem colapso, corte ou destaque obrigatório do mês).
- **SC-004**: Em períodos sem dados, nenhum bloco quebra a página: o usuário consegue mudar mês/ano novamente e seguir navegando.
- **SC-005**: Admin e visualizador conseguem filtrar por mês/ano; apenas as ações de edição já permitidas ao admin continuam exclusivas dele.
- **SC-006**: Em 100% dos testes no ano corrente, meses futuros não aparecem como opção selecionável no filtro de mês.
- **SC-007**: Em 100% dos testes em que a troca de ano invalida o mês, o mês resultante é o máximo permitido no novo ano (sem mês futuro implícito).

## Assumptions

- O pedido limita-se à **dashboard**; outras telas que já tenham filtro próprio de mês/ano não entram no escopo desta feature.
- “No topo” significa a barra de filtros de período já usada na dashboard (junto ao seletor de ano e, se houver, ao de comparação de ano), não um novo menu global do sistema.
- Filtro de mês afeta apenas indicadores **mensais**; gráficos de evolução **anual** (DRE, faturamento por mês) ignoram o mês e usam só o ano — confirmado na sessão de esclarecimento 2026-08-06.
- Indicadores mensais (custo por categoria e equivalentes) usam o **mês isolado** selecionado, não o acumulado janeiro–mês — confirmado na sessão 2026-08-06.
- Saldos usam fallback “mais recente até o mês selecionado” no ano — confirmado na sessão 2026-08-06 (exceção à regra de mês isolado estrito).
- No ano corrente, meses futuros não são selecionáveis — confirmado na sessão 2026-08-06.
- Ao trocar o ano, manter o mês se permitido; senão clamp para o máximo permitido — confirmado na sessão 2026-08-06.
- Não há opção “Todos os meses” nesta versão: o usuário sempre tem um mês concreto selecionado (padrão: mês corrente).
- Persistência do período entre sessões/navegação entre páginas não é obrigatória nesta feature; o padrão na abertura da dashboard basta (mês/ano correntes).
- Rótulos de mês seguem o padrão já usado no produto (ex.: Jan, Fev, … ou nome completo), em português.
- Comparação com outro ano (quando existir) permanece um controle separado e não substitui o filtro de mês.
