# Feature Specification: Dashboard — Filtro de Ano Independente e Donut Anual

**Feature Branch**: `015-dashboard-filtro-ano`

**Created**: 2026-08-12

**Status**: Draft

**Input**: User description: "na tela de dashboard - filtro do ano não funciona ta obrigatório ter um mês - donut do ano ao lado do donut do mês - remover próximas ações ultimo item da tela"

**Baseline**: Referencia o dashboard existente (`specs/001-ocean-app-baseline`, `002`–`004`, `009`–`010`). Hoje o filtro de **mês é sempre obrigatório** (não há visão só do ano) e existe um único donut de custo por categoria, restrito ao mês selecionado, com o espaço ao lado vazio. O bloco **Próximas Ações** aparece no final da tela. Esta feature torna o ano utilizável sem depender de mês, coloca o donut do **ano** ao lado do donut do **mês** (ou o donut do ano em largura total se não houver mês) e remove **Próximas Ações**.

## Clarifications

### Session 2026-08-12

- Q: O mês continua obrigatório? → A: Não. Mês é opcional; se não houver mês selecionado, o donut do ano ocupa toda a largura horizontal (o donut do mês não permanece no layout vazio).
- Q: O donut do ano usa o mês do filtro? → A: Não. Ignora o mês: ano corrente = janeiro até o mês civil de hoje; ano anterior = janeiro a dezembro.
- Q: Sem mês, o que acontece com os outros blocos mensais? → A: Só o donut do mês some. Meta mensal e demais blocos mensais permanecem visíveis, com estado vazio/orientação para selecionar um mês.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Analisar o ano sem ser obrigado a escolher um mês (Priority: P1)

Um usuário autenticado abre a dashboard e usa o filtro de **ano** para ver a visão anual (meta anual, DRE do ano, faturamento mês a mês, composição de custo do ano). Ele **não precisa** ter um mês selecionado para isso: o filtro de mês oferece a opção de não restringir o período (visão do ano inteiro). Quando quiser detalhar um mês, escolhe o mês; quando quiser só o ano, tira a restrição de mês. Trocar o ano atualiza imediatamente os blocos anuais, independentemente do mês.

**Why this priority**: É o problema central relatado — o filtro de ano não entrega valor porque o mês é obrigatório e a leitura anual fica presa a um mês.

**Independent Test**: Abrir a dashboard; selecionar “todos os meses” (ou equivalente) e outro ano; confirmar que os blocos anuais mudam para o ano escolhido sem exigir um mês concreto.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado na dashboard, **When** a tela carrega, **Then** existem no topo os filtros de **mês** e de **ano**, e o filtro de mês inclui uma opção explícita de **não restringir por mês** (visão do ano), além dos meses permitidos.
2. **Given** a dashboard com um mês concreto selecionado, **When** o usuário escolhe a opção de não restringir por mês, **Then** os blocos de **série/indicador anual** passam a refletir o **ano selecionado** (ano completo se for ano anterior; até o mês civil corrente se for o ano corrente), sem exigir um mês.
3. **Given** a visão sem mês (apenas ano), **When** o usuário altera o ano, **Then** todos os blocos anuais atualizam para o novo ano e a tela permanece utilizável.
4. **Given** a visão sem mês, **When** o usuário olha os blocos que só fazem sentido com um mês concreto (ex.: meta mensal), **Then** esses blocos (exceto o donut do mês, que some — ver US2) permanecem visíveis no layout e indicam de forma clara que é preciso selecionar um mês (sem dados inventados e sem quebrar a página).
5. **Given** a primeira visita à dashboard nesta sessão, **When** a tela carrega, **Then** o padrão continua sendo ano civil corrente **e** mês civil corrente (a opção de não restringir por mês é opt-in, não o padrão).
6. **Given** papéis `admin` e `visualizador`, **When** cada um usa os filtros, **Then** ambos podem escolher ano com ou sem mês; permissões de edição permanecem as já definidas no produto.

---

### User Story 2 - Ver o donut de custo do ano ao lado do donut do mês (Priority: P1)

Na área de custo por categoria (abaixo do DRE), com um **mês selecionado**, o usuário vê **dois** gráficos donut lado a lado no desktop: um com a composição de despesas do **mês** e outro com a do **ano**. Sem mês selecionado, vê **apenas o donut do ano**, ocupando **toda a largura** da área de conteúdo. Cada donut visível tem título, fatias, percentuais e total no centro, no mesmo padrão de leitura já usado no donut de custo.

**Why this priority**: Completa a leitura anual que o filtro de ano sozinho não entregava e usa o espaço já reservado ao lado do donut mensal.

**Independent Test**: Com despesas conhecidas em um mês e no restante do ano, abrir a dashboard com mês e ano selecionados; confirmar dois donuts distintos. Remover o mês e confirmar um único donut do ano em largura total.

**Acceptance Scenarios**:

1. **Given** viewport desktop (a partir de ~768px) e um mês concreto selecionado, **When** a dashboard carrega, **Then** existem dois blocos donut de custo por categoria **lado a lado**: à esquerda o donut do **mês**, à direita o donut do **ano**.
2. **Given** viewport estreita (abaixo de ~768px), **When** a dashboard carrega, **Then** os dois donuts empilham na largura total, **mês primeiro** e **ano em seguida**, ambos abaixo do DRE.
3. **Given** mês e ano selecionados com despesas nos dois períodos, **When** o usuário compara os donuts, **Then** o donut do mês usa **somente aquele mês** no ano selecionado, e o donut do ano usa o **ano** (ano anterior: janeiro a dezembro; ano corrente: janeiro até o mês civil corrente), **sem** depender do mês do filtro.
4. **Given** cada donut com dados, **When** o usuário lê título, legenda, fatias e centro, **Then** identifica o período (mês/ano vs. ano), cada categoria com percentual, e o total de despesas daquele período no centro, em formato monetário brasileiro.
5. **Given** o usuário inspeciona uma fatia (hover/toque no padrão da tela), **When** a dica aparece, **Then** vê nome da categoria, valor em R$ e percentual sobre o total **daquele** donut (mês ou ano, sem misturar as bases).
6. **Given** a visão sem mês selecionado, **When** o usuário olha a área de custo, **Then** o donut do **mês** não aparece e o donut do **ano** ocupa **toda a largura horizontal** da área de conteúdo (desktop e mobile), com os dados do ano selecionado.
7. **Given** o usuário altera só o mês, **When** os dados atualizam, **Then** o donut do mês muda e o donut do ano **permanece o mesmo** (mesma composição anual).
8. **Given** o usuário altera só o ano, **When** os dados atualizam, **Then** o donut do ano muda para o novo ano e o donut do mês, se houver mês selecionado e ainda permitido, passa a ser daquele mês no novo ano.
9. **Given** a visão sem mês (donut do ano em largura total), **When** o usuário seleciona um mês concreto, **Then** o donut do mês reaparece e os dois voltam a ficar lado a lado no desktop (empilhados no mobile).

---

### User Story 3 - Dashboard sem o bloco Próximas Ações (Priority: P2)

O usuário percorre a dashboard até o final e **não** encontra o bloco **Próximas Ações**. A tela termina no último bloco útil de análise (hoje, o gráfico de faturamento líquido por mês), sem lista de lembretes genéricos.

**Why this priority**: Pedido explícito de remoção; reduz ruído no final da tela principal.

**Independent Test**: Abrir a dashboard, rolar até o fim e confirmar a ausência do título “Próximas Ações” e de seus itens.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado na dashboard, **When** a tela carrega e ele rola até o final, **Then** o bloco **Próximas Ações** não está presente (nem título, nem itens como NFs pendentes, prazos ou bônus).
2. **Given** a remoção do bloco, **When** o usuário usa o restante da dashboard, **Then** filtros, metas, saldos, DRE, donuts e faturamento por mês continuam disponíveis e na mesma ordem relativa, apenas sem esse último bloco.
3. **Given** `admin` e `visualizador`, **When** cada um abre a dashboard, **Then** nenhum dos dois vê **Próximas Ações**.

---

### Edge Cases

- Abertura padrão: ano corrente + mês corrente (mês ainda pré-selecionado; “todos os meses” é escolha consciente).
- Ano corrente sem mês: blocos anuais usam janeiro até o mês civil corrente (não inventar meses futuros); donut do mês **não é exibido**; donut do ano em **largura total**; meta mensal em estado vazio/orientação.
- Ano anterior sem mês: blocos anuais usam janeiro a dezembro; donut do mês **não é exibido**; donut do ano em **largura total**; meta mensal em estado vazio/orientação.
- Ano futuro (se o seletor permitir): donut do ano e demais blocos anuais em estado vazio previsível; sem inventar valores.
- Troca de ano com mês selecionado inválido no novo ano (ex.: dezembro → ano corrente em agosto): ajustar o mês para o máximo permitido, como já definido na dashboard; se a visão era “todos os meses”, permanecer em “todos os meses”.
- Ano corrente com mês selecionado: donut do mês = só aquele mês; donut do ano = janeiro até o mês civil corrente (não até o mês do filtro, se este for anterior ao mês atual).
- Mês selecionado sem despesas e ano com despesas: donut do mês vazio; donut do ano com dados.
- Ano sem despesas e mês sem despesas: ambos os donuts em estado vazio, cada um com mensagem do respectivo período.
- Uma única categoria com valor no período: donut correspondente em 100% nessa categoria.
- Fatias com valor zero: não aparecem na legenda daquele donut.
- Viewport estreita com mês selecionado: dois donuts empilhados, legíveis, sem sobrepor o DRE.
- Viewport qualquer sem mês: um único donut (ano) em largura total; não deixar coluna vazia ao lado.
- Troca rápida de mês/ano: a visão final corresponde ao último período escolhido (sem misturar totais de períodos intermediários nos donuts).
- Comparação de ano (controle “Comparar”) permanece independente e não alimenta os donuts de custo.
- Saldos com “todos os meses”: exibir o saldo mais recente do ano selecionado; se não houver, estado vazio.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O filtro de **ano** da dashboard MUST funcionar de forma independente do mês: alterar o ano MUST atualizar todos os blocos de natureza anual mesmo que nenhum mês concreto esteja selecionado.
- **FR-002**: O filtro de **mês** MUST oferecer, além dos meses permitidos, uma opção explícita de **não restringir por mês** (visão do ano). Essa opção MUST NÃO ser o padrão de abertura.
- **FR-003**: Na abertura padrão da dashboard, o sistema MUST pré-selecionar o ano civil corrente e o mês civil corrente.
- **FR-004**: Com um mês concreto selecionado, os indicadores **mensais** (meta mensal, donut do mês, agregados mensais equivalentes) MUST continuar refletindo **somente aquele mês** no ano selecionado, nas regras já vigentes da dashboard (saldos: mais recente até o mês no ano).
- **FR-005**: Sem mês concreto (visão do ano), a **meta mensal** e os demais indicadores que exigem mês (exceto o donut do mês — ver FR-007/FR-008) MUST permanecer visíveis no layout com estado vazio/orientação para selecionar um mês; MUST NÃO ser escondidos, MUST NÃO inventar um mês implícito nem copiar a meta anual no card mensal.
- **FR-006**: Sem mês concreto, os **saldos** MUST exibir o registro mais recente do ano selecionado; se não houver, estado vazio / “sem registro”.
- **FR-007**: Com **mês concreto selecionado**, a dashboard MUST exibir **dois** donuts de custo por categoria abaixo do DRE: um do **mês** e um do **ano**, lado a lado a partir de ~768px (mês à esquerda, ano à direita) e empilhados abaixo de ~768px (mês acima, ano abaixo). **Sem mês selecionado**, MUST exibir **somente o donut do ano**, ocupando **toda a largura horizontal** da área de conteúdo (sem coluna vazia ao lado).
- **FR-008**: O donut do **mês** MUST agregar despesas **somente do mês selecionado** no ano selecionado. Se não houver mês selecionado, o donut do mês MUST **não ser exibido** (o do ano assume largura total — FR-007). Se houver mês selecionado mas sem despesas nesse mês, o donut do mês MUST permanecer no layout (metade da largura no desktop) com estado vazio compreensível.
- **FR-009**: O donut do **ano** MUST agregar despesas do **ano selecionado** assim: ano civil corrente = janeiro até o mês civil corrente (inclusive); ano anterior = janeiro a dezembro; MUST **ignorar** o mês do filtro (trocar o mês NÃO altera totais nem fatias desse donut). Ano futuro: estado vazio.
- **FR-010**: Cada donut MUST seguir o padrão de leitura já usado no donut de custo: fatias por categoria com valor &gt; 0, ordem por valor decrescente, percentual sobre o **total daquele donut**, total em R$ no centro, inspeção com nome + valor + percentual, título que deixa claro o período (mês vs. ano).
- **FR-011**: O total e as categorias de cada donut MUST incluir todos os centros de custo já usados no donut de custo da dashboard (incluindo impostos e retirada de lucro), com a mesma regra de temporalidade por vencimento já vigente.
- **FR-012**: Alterar só o mês MUST NÃO recalcular o donut do ano; alterar o ano MUST recalcular o donut do ano e, se houver mês selecionado e permitido, o donut do mês no novo ano.
- **FR-013**: A dashboard MUST NÃO exibir o bloco **Próximas Ações** (título e itens). Nenhum bloco substituto é exigido nesta feature.
- **FR-014**: Usuários `admin` e `visualizador` MUST ver os donuts conforme o período (dois com mês; só o do ano em largura total sem mês), usar ano com ou sem mês, e não ver **Próximas Ações**; edição de metas permanece só para `admin`.
- **FR-015**: Em ausência de dados ou falha de carga de um donut, o bloco afetado MUST comunicar o estado sem impedir o uso do outro donut nem do restante da tela.
- **FR-016**: As regras de meses selecionáveis no ano corrente (até o mês atual) e o ajuste de mês inválido ao trocar o ano MUST permanecer; a opção “não restringir por mês” MUST continuar válida após troca de ano.
- **FR-017**: Esta feature MUST limitar-se à **dashboard**; outras telas com filtro de mês/ano não entram no escopo.

### Key Entities

- **Período da dashboard**: Ano obrigatório e mês opcional. Mês ausente = visão do ano; mês presente (1–12 permitido) = visão mensal sobre o mesmo ano.
- **Donut de custo do mês**: Composição percentual das despesas do mês selecionado; total = soma das categorias daquele mês.
- **Donut de custo do ano**: Composição percentual das despesas do ano selecionado (YTD no ano corrente; ano completo em anos anteriores); total = soma das categorias daquele recorte anual.
- **Indicador anual**: Bloco cuja base é só o ano (meta anual, DRE, faturamento por mês, donut do ano).
- **Indicador mensal**: Bloco que exige mês concreto (meta mensal, donut do mês); saldos têm fallback próprio.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes, o usuário consegue aplicar só o ano (sem mês concreto) e ver os blocos anuais daquele ano em até 10 segundos após a troca do filtro, sem ser bloqueado por exigência de mês.
- **SC-002**: Em 100% dos testes com mês e ano selecionados e despesas conhecidas nos dois períodos, os dois donuts aparecem lado a lado no desktop (empilhados no mobile) e os totais/percentuais do donut mensal correspondem só ao mês, e os do donut anual só ao recorte do ano. Em 100% dos testes **sem** mês selecionado, há um único donut (ano) ocupando a largura total da área de conteúdo.
- **SC-003**: Em 100% dos testes, trocar apenas o mês não altera o total nem as fatias do donut do ano.
- **SC-004**: Após a entrega, 100% das visitas à dashboard (admin e visualizador) não exibem o bloco **Próximas Ações** ao rolar até o final da tela.
- **SC-005**: Em períodos sem despesa em um dos recortes, o donut correspondente mostra estado vazio e o outro (se tiver dados) permanece utilizável; a página não quebra.
- **SC-006**: 9 em 10 usuários internos de teste distinguem donut do mês e donut do ano pelo título/período, sem treinamento além do que está na tela.
- **SC-007**: Admin e visualizador completam o fluxo de filtrar ano com e sem mês na primeira tentativa.

## Assumptions

- O pedido limita-se à **dashboard**; Relatórios e demais páginas não mudam.
- “Filtro do ano não funciona / está obrigatório ter um mês” significa: o usuário precisa poder analisar o **ano** sem mês concreto. A opção de mês continua existindo e o padrão de abertura permanece mês+ano correntes.
- Rótulo da opção sem mês: texto claro em português (ex.: “Todos os meses” ou “Ano inteiro”); o texto exato pode seguir o padrão visual dos demais seletores.
- Donut do **ano** ignora o mês do filtro (confirmado na clarificação 2026-08-12): ano corrente = janeiro até o mês civil de hoje; ano anterior = jan–dez. Não é acumulado “até o mês selecionado”. Ao limpar o mês, o recorte anual permanece o mesmo; só a largura do bloco muda.
- Donut do **mês** permanece mês isolado (não YTD), alinhado à feature de filtro de mês.
- Sem mês, só o donut do mês some (largura total para o donut do ano). Meta mensal e demais blocos mensais continuam visíveis com estado vazio/orientação (confirmado na clarificação 2026-08-12). Saldos seguem FR-006 (mais recente do ano).
- Posição com mês selecionado: o donut do mês fica à esquerda no desktop; o donut do ano ao lado. Sem mês: só o donut do ano, em largura total (confirmado na clarificação 2026-08-12). Não se exige outro gráfico além desses nessa fileira.
- Regras visuais de fatia, ordem, centro, tooltip, categorias e vencimento reutilizam o donut de custo já existente; não se cria uma taxonomia nova de categorias.
- Remoção de **Próximas Ações** é definitiva nesta feature: sem migrar os itens para outro bloco e sem substituir por outro widget no rodapé.
- Comparação com outro ano continua só nos gráficos de série que já a usam; os donuts de custo não ganham série comparativa nesta versão.
- Persistência do período entre sessões continua não obrigatória; o padrão na abertura basta.
- Falha ou vazio em um donut não esconde o outro.
- Usuários: quem já acessa a dashboard (`admin` e `visualizador`); somente leitura dos donuts e filtros para o visualizador.
