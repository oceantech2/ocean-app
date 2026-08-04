# Feature Specification: Dashboard — Gráfico Donut de Custo por Categoria

**Feature Branch**: `004-dashboard-custo-donut`

**Created**: 2026-07-26

**Status**: Draft

**Input**: User description: "Gráfico (donut) – Custo: % entre cada categoria no total de despesas"

**Baseline**: Referencia `specs/001-ocean-app-baseline` (visão gerencial no dashboard) e alinha-se a `specs/003-dashboard-dre-chart` (mesma fonte de despesas por centro de custo e contexto de ano). Esta feature adiciona um gráfico donut de composição percentual do custo por categoria, sem alterar metas, saldos ou o gráfico DRE já especificados.

## Clarifications

### Session 2026-07-26

- Q: O que entra no total de despesas usado para os percentuais do donut? → A: Todos os centros de custo, incluindo impostos e retirada de lucro.
- Q: Qual período o donut agrega? → A: Ano da dashboard — YTD até o mês atual se for o ano corrente; ano completo se for ano anterior.
- Q: O miolo do donut deve mostrar o total de despesas? → A: Sim — exibir o total de despesas (R$) no centro do donut.
- Q: Em que ordem as fatias (e a legenda) aparecem? → A: Por valor decrescente (maior fatia primeiro).
- Q: Qual a largura do bloco do donut no desktop? → A: Metade da largura no desktop (ex.: lado a lado com outro slot); largura total no mobile.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver a composição percentual do custo por categoria (Priority: P1)

Um usuário autenticado com acesso à dashboard abre a tela e vê um gráfico **donut** intitulado de forma clara como visão de **Custo** (composição do total de despesas). Cada fatia representa uma **categoria de despesa** (centro de custo), e o tamanho da fatia corresponde ao **percentual** daquela categoria sobre o **total de despesas** do período em exibição. O usuário identifica rapidamente quais categorias concentram o gasto.

**Why this priority**: É o pedido central — compreender a participação relativa de cada categoria no total de despesas.

**Independent Test**: Abrir a dashboard em um ano com despesas em mais de uma categoria; confirmar donut, fatias proporcionais e percentuais que somam ~100%.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado com acesso à dashboard, **When** a tela carrega em viewport desktop (a partir de ~768px), **Then** existe um bloco de gráfico donut de Custo por categoria, posicionado abaixo do gráfico DRE, ocupando **metade** da largura da área de conteúdo (o outro meio pode ficar reservado/vazio ou para outro bloco futuro), acima dos demais blocos que já vinham depois do DRE.
2. **Given** viewport estreita (mobile, abaixo de ~768px), **When** a dashboard carrega, **Then** o bloco do donut usa a **largura total** da área de conteúdo, mantendo a posição abaixo do DRE.
3. **Given** o ano em exibição com despesas em duas ou mais categorias, **When** o usuário visualiza o donut, **Then** cada categoria com valor &gt; 0 aparece como fatia cuja proporção visual reflete sua participação no total de despesas daquele período, e as fatias/legenda seguem ordem do maior para o menor valor.
4. **Given** o donut visível, **When** o usuário lê a legenda ou rótulos, **Then** identifica o nome de cada categoria e o percentual correspondente (ex.: “Salário 35%”).
5. **Given** o donut com dados, **When** o usuário olha o centro do gráfico, **Then** vê o total de despesas do período em valor monetário formatado (padrão brasileiro).
6. **Given** o filtro/contexto de ano da dashboard, **When** o ano em exibição muda, **Then** o donut recalcula percentuais, fatias e o total do centro apenas com despesas desse ano (e, no ano corrente, só até o mês atual — ver FR-006).
7. **Given** categorias com valores positivos, **When** o usuário soma os percentuais exibidos das fatias, **Then** o total é 100% (arredondamento aceitável de ±0,1 p.p. entre fatias, sem inventar categoria “outros” só para fechar arredondamento).

---

### User Story 2 - Inspecionar valor e percentual de uma categoria (Priority: P1)

Ao interagir com uma fatia (hover/toque conforme o padrão da dashboard), o usuário vê o **nome da categoria**, o **valor monetário** formatado e o **percentual** sobre o total de despesas, para cruzar leitura relativa com valor absoluto.

**Why this priority**: Percentual sozinho não basta para decisão gerencial; o valor absoluto completa a leitura.

**Independent Test**: Passar o cursor sobre cada fatia e confirmar nome, valor em R$ e % coerentes com o total.

**Acceptance Scenarios**:

1. **Given** o donut com pelo menos uma fatia, **When** o usuário inspeciona uma fatia, **Then** vê nome da categoria, valor monetário no padrão brasileiro e percentual sobre o total de despesas do período.
2. **Given** duas categorias A e B com valores conhecidos, **When** o usuário inspeciona A, **Then** o percentual mostrado é valor(A) / total × 100, arredondado de forma legível (ex.: uma casa decimal).
3. **Given** o total de despesas do período, **When** o usuário compara as fatias, **Then** nenhuma fatia usa base diferente (todas usam o mesmo total).

---

### User Story 3 - Entender ausência ou falha de dados de custo (Priority: P2)

Quando não há despesas no período, ou quando a carga falha, o bloco do donut permanece no layout com mensagem clara, sem quebrar o restante da dashboard.

**Why this priority**: Mantém estabilidade da tela principal e evita leitura enganosa de um círculo vazio sem contexto.

**Independent Test**: Abrir um ano sem contas a pagar (ou simular falha) e verificar estado vazio/erro sem impacto em DRE, saldos e metas.

**Acceptance Scenarios**:

1. **Given** ano/período sem despesas, **When** a dashboard carrega, **Then** o bloco do donut aparece e indica ausência de dados de forma compreensível (sem fatias inventadas e sem total enganoso no centro).
2. **Given** falha ao obter os dados de custo por categoria, **When** a dashboard termina de carregar, **Then** o usuário vê feedback de erro no bloco do donut (ou equivalente ao padrão da página) e os demais blocos continuam utilizáveis.
3. **Given** despesas em apenas uma categoria, **When** o usuário visualiza, **Then** o donut mostra uma única fatia a 100% com o nome dessa categoria.

---

### Edge Cases

- Ano em exibição = ano civil corrente: incluir apenas despesas com vencimento de janeiro até o mês atual (inclusive); não incluir meses futuros.
- Ano em exibição anterior ao corrente: incluir o ano completo (jan–dez).
- Ano em exibição futuro (se o seletor permitir): tratar como sem dados úteis / mensagem de ausência — sem inventar valores.
- Contas sem data de vencimento: não entram no total nem nas fatias (não inventar período).
- Categoria com valor zero no período: não aparece como fatia (evita legenda poluída); categorias com valor &gt; 0 aparecem.
- Sem despesas no período: sem fatias; o centro não deve sugerir total positivo falso (ocultar total ou mostrar estado vazio / R$ 0,00 de forma explícita).
- Percentuais com muitas casas: exibir de forma legível (ex.: uma casa decimal); garantir que a soma percebida pelo usuário seja ~100%.
- Valores muito pequenos (&lt; 1% do total): ainda aparecem como fatia se valor &gt; 0; percentual e valor permanecem inspecionáveis (tooltip), mesmo que a fatia seja visualmente estreita; na ordenação, ficam após as fatias maiores.
- Viewport estreita (&lt; ~768px): o donut usa largura total; donut e legenda permanecem legíveis (legenda abaixo ou ao lado conforme o padrão visual da dashboard, sem sobrepor o DRE).
- Viewport ≥ ~768px: bloco do donut em metade da largura; o slot adjacente pode ficar vazio nesta versão (sem exigir outro gráfico no outro meio).
- Empate de valor entre categorias: ordem entre empatadas pode ser qualquer ordem estável (não precisa ser alfabética).
- Permissões: qualquer usuário que já vê a dashboard também vê o donut (somente leitura); não há edição neste escopo.
- Impostos: entram como **uma categoria** do total de despesas neste donut (diferente do aspecto “Despesa” do DRE, que exclui impostos — ver Assumptions).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A dashboard MUST exibir um gráfico donut de composição de Custo por categoria de despesa, posicionado imediatamente abaixo do bloco do gráfico DRE. Em viewport a partir de ~768px, o bloco do donut MUST ocupar **metade** da largura da área de conteúdo (lado a lado com espaço/slot adjacente); abaixo de ~768px, MUST ocupar a **largura total**.
- **FR-002**: Cada fatia do donut MUST representar uma categoria de despesa (centro de custo) com valor &gt; 0 no período, e o tamanho da fatia MUST ser proporcional à participação dessa categoria no total de despesas. Fatias e legenda MUST seguir ordem por **valor decrescente** (maior participação primeiro); empates podem usar ordem estável arbitrária.
- **FR-003**: O sistema MUST exibir, para cada fatia visível, identificação da categoria e o percentual sobre o total (na legenda e/ou rótulos do gráfico), na mesma ordem das fatias.
- **FR-004**: Ao interagir com uma fatia, o sistema MUST mostrar nome da categoria, valor monetário formatado (padrão brasileiro) e percentual sobre o total de despesas do período.
- **FR-005**: O donut MUST refletir o mesmo contexto de ano usado na dashboard.
- **FR-006**: Se o ano em exibição for o **ano civil corrente**, o período MUST incluir apenas despesas de janeiro até o mês atual (inclusive). Se o ano for **anterior** ao corrente, o período MUST ser o ano completo (jan–dez). Não há seletor de mês independente para este donut nesta versão.
- **FR-007**: O total de despesas do período MUST ser a soma dos valores de todas as categorias incluídas; o percentual de cada categoria MUST ser valor_categoria / total × 100.
- **FR-008**: As categorias MUST corresponder aos centros de custo de contas a pagar existentes no Ocean App (administrativo, retirada de lucro, salário, impostos, reembolsos, bônus, evento — e quaisquer outros centros já cadastrados no produto). O total de despesas do donut MUST incluir **todos** esses centros (impostos e retirada de lucro inclusive); nenhuma categoria cadastrada fica de fora da base percentual quando tiver valor &gt; 0.
- **FR-009**: Contas a pagar MUST entrar pelo **mês/ano da data de vencimento**, incluindo contas pagas e pendentes (mesma regra de temporalidade do DRE para despesas/impostos).
- **FR-010**: Na ausência de dados ou em erro de carga, o bloco do donut MUST permanecer no layout e comunicar o estado sem impedir o uso do restante da dashboard.
- **FR-011**: Esta feature MUST NÃO alterar o comportamento dos cards de meta, saldos, gráfico DRE nem demais blocos existentes (exceto o deslocamento vertical natural pelo novo bloco).
- **FR-012**: Categorias com valor zero no período MUST NÃO gerar fatia nem poluir a legenda.
- **FR-013**: Com exatamente uma categoria com valor &gt; 0, o donut MUST mostrar 100% nessa categoria.
- **FR-014**: O título/rótulo do bloco MUST deixar claro que se trata da composição percentual do custo (despesas) por categoria.
- **FR-015**: O centro (miolo) do donut MUST exibir o **total de despesas** do período em valor monetário formatado (padrão brasileiro), coerente com a soma das categorias incluídas.

### Key Entities

- **Categoria de despesa**: Centro de custo usado nas contas a pagar (ex.: salário, impostos, administrativo); tem nome legível e valor agregado no período.
- **Total de despesas**: Soma dos valores de todas as categorias no período do donut; base dos percentuais.
- **Fatia do donut**: Representação visual de uma categoria com valor &gt; 0; atributos: proporção, percentual, valor monetário.
- **Total no centro**: Valor monetário do total de despesas do período, exibido no miolo do donut e alinhado à soma das fatias.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em até 5 segundos após o carregamento da dashboard (em condições normais de uso interno), o usuário vê o donut de custo ou um estado vazio/erro explícito no bloco correspondente.
- **SC-002**: Em 100% dos casos com despesas em N categorias (N ≥ 1), o usuário consegue identificar cada categoria com valor &gt; 0 e seu percentual (e o total no centro, quando houver dados) sem consultar outra tela.
- **SC-003**: Em verificação manual com dados conhecidos, os percentuais do donut batem com valor_categoria / total (±0,1 p.p. por arredondamento) em pelo menos 95% das categorias exibidas.
- **SC-004**: 9 em 10 usuários internos de teste localizam o donut abaixo do DRE (metade da largura no desktop; largura total no mobile) e compreendem que as fatias são participação no total de despesas, sem treinamento adicional além do título/legenda.
- **SC-005**: Falha ou ausência de dados no donut não impede o uso de metas, saldos e DRE na mesma visita à dashboard.

## Assumptions

- O gráfico fica na **dashboard** (mesmo contexto das features 002/003), não em Relatórios, nesta versão.
- Posição padrão: **logo abaixo do gráfico DRE**; se o DRE ainda não estiver implantado no ambiente, o donut fica abaixo dos cards de saldo (mesmo ponto relativo previsto para o DRE). Largura: **50% no desktop** (~768px+), **100% no mobile**; o outro meio no desktop pode permanecer vazio nesta versão.
- **Categorias** = centros de custo das contas a pagar já existentes no produto.
- Neste donut, o total inclui **todos** os centros de custo (**impostos** e **retirada de lucro** inclusive). Confirmado na clarificação: composição completa do gasto, distinta do aspecto “Despesa” do DRE (que exclui impostos).
- Temporalidade alinhada ao DRE e confirmada na clarificação: data de vencimento; contas pagas e pendentes; ano da dashboard — corrente = YTD até o mês atual; anterior = jan–dez completo. Sem filtro de mês isolado nesta versão.
- Não há toggle para ocultar categorias individuais nesta versão (diferente das labels do DRE); todas as categorias com valor &gt; 0 aparecem, ordenadas por valor decrescente.
- Sem despesas no período: não inventar fatias; o centro não deve sugerir um total positivo falso (ocultar total ou mostrar R$ 0,00 / estado vazio de forma explícita).
- Cores das fatias: paleta distinta e legível, consistente com o visual da dashboard; nomes oficiais das categorias seguem os rótulos já usados em Contas a Pagar.
- Miolo do donut: sempre que houver total &gt; 0, exibir o total em R$; quando não houver dados, seguir o estado vazio (sem total enganoso).
- Usuários: admin e visualizador com acesso à dashboard; somente leitura.
- Fonte de dados: contas a pagar / centros de custo já existentes — sem cadastro manual de “categorias de custo” paralelo.
