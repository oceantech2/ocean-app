# Feature Specification: Dashboard — Gráfico DRE Empilhado

**Feature Branch**: `003-dashboard-dre-chart`

**Created**: 2026-07-26

**Status**: Draft

**Input**: User description: "na dashboard preciso criar um novo gráfico abaixo de Saldo conta corrente e conta investimento — esse gráfico deve ser referente a DRE - Gráfico (barra) – DRE (ano vigente): Opção de label quais aspectos quero visualizar (Receita bruta [azul], Custo* [vermelho], Impostos [cinza], Lucro [verde]) — basicamente deve ser aquele gráfico de barra onde na mesma barra tem diferentes cores para mostrar a diferença de origem"

**Baseline**: Referencia `specs/001-ocean-app-baseline` (visão gerencial no dashboard). Esta feature adiciona um bloco de gráfico DRE imediatamente abaixo dos cards de saldo (conta corrente e conta investimento), sem alterar os demais blocos da dashboard.

## Clarifications

### Session 2026-07-26

- Q: Como os aspectos se relacionam visualmente nas barras? → A: Por mês, **duas barras lado a lado**: (1) pilha/barra de **Receita bruta**; (2) pilha de **Despesa + Impostos + Lucro** (segmentos empilhados na segunda barra). Assim a composição da aplicação da receita fica comparável à barra de receita, sem somar receita dentro da mesma pilha de despesas.
- Q: O que entra em “Despesa” (Custo*)? → A: Todas as despesas **exceto impostos** (inclui salário, bônus, administrativo, reembolsos, evento, **retirada de lucro** e demais centros que não sejam impostos).
- Q: Quais contas entram em Despesa e Impostos? → A: Todas as contas do centro no mês da **data de vencimento** (pagas e pendentes), alinhado à visão de Impostos existente.
- Q: Como mostrar Lucro negativo (prejuízo)? → A: Pilha da direita só com Despesa + Impostos; Lucro negativo aparece no tooltip/rótulo (ex.: “Lucro: −R$ …”) sem segmento empilhado negativo.
- Q: Eixo do gráfico — quantos meses mostrar? → A: No **ano corrente**, só meses **até o mês atual**; em **anos anteriores**, os **12 meses** (jan–dez).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver DRE do ano vigente em duas barras por mês (Priority: P1)

Um usuário autenticado com acesso à dashboard abre a tela e, logo abaixo dos cards de Saldo Conta Corrente e Conta Investimento, vê um gráfico de barras do **DRE do ano vigente**. Para cada mês há **duas barras lado a lado**: a da esquerda (ou primeira) mostra a **Receita bruta** (azul); a da direita (ou segunda) é uma **pilha** com **Despesa** (vermelho), **Impostos** (cinza) e **Lucro** (verde), permitindo comparar a origem da receita com a composição de despesas + impostos + resultado.

**Why this priority**: É o pedido central — visualizar o resultado do exercício do ano corrente mês a mês, com receita isolada e a aplicação/resultado empilhados ao lado.

**Independent Test**: Abrir a dashboard no ano vigente com dados; confirmar posição (abaixo dos saldos), pares de barras por mês e cores corretas nos segmentos.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado com acesso à dashboard, **When** a tela carrega, **Then** existe um bloco de gráfico intitulado de forma clara como DRE do ano vigente, posicionado imediatamente abaixo dos cards de saldo (conta corrente e conta investimento).
2. **Given** o ano em exibição com pelo menos um mês com valores, **When** o usuário visualiza o gráfico, **Then** cada mês do eixo (conforme FR-007) apresenta duas barras lado a lado: uma de Receita bruta (azul) e outra empilhada com Despesa (vermelho), Impostos (cinza) e Lucro (verde) conforme os aspectos ativos e as regras de Lucro negativo.
3. **Given** o gráfico visível, **When** o usuário passa o cursor (ou equivalente) sobre um segmento ou barra, **Then** vê o valor monetário formatado do aspecto correspondente e o mês.
4. **Given** o filtro/contexto de ano da dashboard, **When** o ano vigente é o ano em exibição, **Then** o gráfico DRE reflete exclusivamente esse ano (não mistura anos anteriores).
5. **Given** um mês em que Receita bruta = Despesa + Impostos + Lucro e o Lucro é **≥ 0**, **When** o usuário compara as duas barras do mês, **Then** as alturas totais das duas barras são visualmente equivalentes (permitindo leitura de composição vs. receita).
6. **Given** um mês com Lucro **&lt; 0**, **When** o usuário inspeciona a pilha da direita (com label Lucro ativa), **Then** não há segmento verde empilhado negativo; Despesa/Impostos ativos aparecem na pilha e o prejuízo é legível no tooltip/rótulo.

---

### User Story 2 - Escolher quais aspectos do DRE visualizar (Priority: P1)

O usuário pode ligar ou desligar, via labels/legenda do gráfico, quais aspectos deseja ver: Receita bruta, Despesa, Impostos e Lucro. A barra de receita e/ou a pilha da direita atualizam-se para mostrar apenas os aspectos ativos, mantendo as cores.

**Why this priority**: O requisito explícito de “opção de label quais aspectos quero visualizar” é parte essencial da leitura gerencial.

**Independent Test**: Desmarcar e remarcar cada label; confirmar que o segmento/barra some ou reaparece e as cores dos restantes permanecem corretas.

**Acceptance Scenarios**:

1. **Given** o gráfico DRE carregado, **When** o usuário desmarca a label “Receita bruta”, **Then** a barra azul de receita deixa de aparecer e a pilha Despesa/Impostos/Lucro (aspectos ainda ativos) permanece.
2. **Given** o gráfico DRE carregado, **When** o usuário desmarca “Despesa”, **Then** o segmento vermelho some da pilha da direita e Impostos/Lucro ativos reempilham-se sem o segmento de despesa.
3. **Given** um ou mais aspectos desmarcados, **When** o usuário remarca um aspecto, **Then** o segmento ou barra correspondente reaparece na cor definida.
4. **Given** todos os aspectos desmarcados, **When** nenhuma série está ativa, **Then** o gráfico permanece no lugar com estado vazio/legível (sem erro) e as labels continuam disponíveis para reativar.
5. **Given** a primeira visita à dashboard (sem preferência salva), **When** o gráfico carrega, **Then** os quatro aspectos iniciam visíveis por padrão.

---

### User Story 3 - Entender ausência ou falha de dados do DRE (Priority: P2)

Quando não há dados suficientes para montar o DRE do ano, ou quando a carga falha, o usuário ainda encontra o bloco do gráfico no lugar esperado, com mensagem clara, sem quebrar o restante da dashboard.

**Why this priority**: Evita confusão e mantém a estabilidade da tela principal mesmo sem série completa de DRE.

**Independent Test**: Abrir a dashboard em um ano sem dados (ou simular falha de carga) e verificar mensagem/estado vazio sem impacto nos saldos e demais blocos.

**Acceptance Scenarios**:

1. **Given** ano vigente sem valores de DRE em nenhum mês, **When** a dashboard carrega, **Then** o bloco do gráfico aparece abaixo dos saldos e indica ausência de dados de forma compreensível.
2. **Given** falha ao obter os dados do DRE, **When** a dashboard termina de carregar, **Then** o usuário vê feedback de erro no bloco do gráfico (ou equivalente ao padrão da página) e os cards de saldo e demais seções continuam utilizáveis.
3. **Given** apenas alguns meses com dados no ano corrente, **When** o usuário visualiza, **Then** o eixo vai até o mês atual (meses sem lançamento podem aparecer com zero) e não há barras de meses futuros.

---

### Edge Cases

- Ano em exibição = ano civil corrente: eixo só até o mês atual (inclusive); não inventar meses futuros.
- Ano em exibição anterior ao corrente: eixo completo jan–dez (meses sem lançamento com zero explícito).
- Ano em exibição futuro (se o seletor permitir): tratar como sem dados úteis / eixo vazio ou só mensagem de ausência — sem inventar valores.
- Valores negativos (ex.: prejuízo no Lucro): não empilhar segmento negativo; manter pilha com Despesa + Impostos (se ativos) e exibir Lucro negativo no tooltip/rótulo.
- Contas sem data de vencimento: não entram nos totais mensais de Despesa/Impostos (não inventar mês).
- Com Lucro negativo, as alturas das duas barras do mês **não** precisam ser equivalentes (FR-014 / US1 cenário 5 aplica-se a Lucro ≥ 0).
- Apenas Receita ativa: permanece só a barra azul por mês; a pilha da direita some ou fica vazia de forma legível.
- Apenas um segmento da pilha direita ativo: a segunda barra vira barra simples na cor desse aspecto.
- Viewport estreita: o gráfico permanece abaixo dos saldos, com eixo e labels legíveis (scroll horizontal ou redução de ticks conforme o padrão visual já usado na dashboard).
- Permissões: qualquer usuário que já vê a dashboard e os saldos também vê o gráfico DRE (somente leitura); não há edição de DRE neste escopo.
- Preferência de labels: nesta versão, a seleção de aspectos não precisa persistir entre sessões (padrão: todos ligados a cada carga).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A dashboard MUST exibir um gráfico de barras do DRE do ano vigente imediatamente abaixo dos cards de Saldo Conta Corrente e Conta Investimento.
- **FR-002**: Para cada mês, o gráfico MUST exibir **duas barras lado a lado**: (1) barra de **Receita bruta**; (2) barra **empilhada** com os segmentos ativos de **Despesa**, **Impostos** e **Lucro** (nessa composição na mesma pilha).
- **FR-003**: O gráfico MUST oferecer labels/legenda interativa para ligar e desligar independentemente: Receita bruta, Despesa, Impostos e Lucro.
- **FR-004**: As cores dos aspectos MUST ser: Receita bruta = azul; Despesa = vermelho; Impostos = cinza; Lucro = verde.
- **FR-005**: Por padrão, na carga inicial, os quatro aspectos MUST estar visíveis.
- **FR-006**: O gráfico MUST refletir apenas o ano vigente (o mesmo contexto de ano usado na dashboard).
- **FR-007**: Cada par de barras MUST corresponder a um mês do ano em exibição. Se o ano em exibição for o **ano civil corrente**, o eixo MUST incluir apenas os meses de janeiro até o mês atual (inclusive). Se o ano em exibição for **anterior** ao ano corrente, o eixo MUST incluir os 12 meses (jan–dez).
- **FR-008**: Ao interagir com barra/segmento, o sistema MUST mostrar o valor monetário do aspecto de forma formatada (padrão brasileiro de moeda).
- **FR-009**: Na ausência de dados ou em erro de carga, o bloco do gráfico MUST permanecer no layout e comunicar o estado sem impedir o uso do restante da dashboard.
- **FR-010**: Esta feature MUST NÃO alterar o comportamento dos cards de saldo nem dos demais gráficos/cards já existentes na dashboard (exceto o deslocamento vertical natural pelo novo bloco).
- **FR-011**: Os valores de cada aspecto MUST ser derivados dos dados financeiros já existentes no Ocean App (NFs, contas/centros de custo e visão de impostos), conforme as regras documentadas em Assumptions — sem cadastro manual de linhas de DRE neste escopo.
- **FR-012**: O aspecto “Receita bruta” MUST aparecer somente na primeira barra do par mensal (não como segmento da pilha Despesa/Impostos/Lucro).
- **FR-013**: O aspecto “Despesa” (equivalente ao “Custo*” do pedido original) MUST agregar todas as contas dos centros de custo **exceto** impostos (inclui retirada de lucro e demais centros), usando a **data de vencimento** para o mês e incluindo contas pagas e pendentes.
- **FR-014**: O aspecto “Lucro” MUST ser o resultado derivado do mês (Receita bruta − Despesa − Impostos). Quando o Lucro for **≥ 0**, MUST aparecer como segmento verde na pilha da direita, de modo que (com valores coerentes) a altura dessa pilha seja comparável à barra de Receita bruta. Quando o Lucro for **&lt; 0** (prejuízo), MUST **não** empilhar segmento negativo; a pilha mostra apenas Despesa + Impostos ativos, e o valor negativo MUST ser comunicado no tooltip/rótulo (ex.: “Lucro: −R$ …”).
- **FR-015**: O aspecto “Impostos” MUST agregar apenas as contas do centro de custo impostos (sem misturar com Despesa), usando a **data de vencimento** para o mês e incluindo contas pagas e pendentes (mesma regra da visão de Impostos).
- **FR-016**: Com Lucro negativo e label de Lucro ativa, o usuário MUST ainda conseguir identificar o prejuízo via tooltip ou indicação textual no gráfico, mesmo sem segmento empilhado.

### Key Entities

- **Série DRE (aspecto)**: Uma das dimensões visualizáveis — Receita bruta, Despesa, Impostos ou Lucro — com cor fixa e valor monetário por mês.
- **Par mensal do DRE**: Para um mês do ano vigente: barra de Receita bruta + pilha Despesa/Impostos/Lucro.
- **Seleção de labels**: Estado transitório (por sessão) de quais aspectos estão visíveis no gráfico.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em até 5 segundos após o carregamento da dashboard (em uso normal), o usuário identifica o gráfico DRE abaixo dos saldos e reconhece as quatro cores/aspectos pela legenda.
- **SC-002**: Em menos de 3 cliques/toques, o usuário consegue ocultar ou reexibir qualquer combinação de aspectos e vê as barras atualizadas de imediato.
- **SC-003**: 100% dos meses com dados no ano vigente exibem valores coerentes com as fontes financeiras do produto (receita, despesa, impostos, lucro), verificáveis por amostragem contra as telas/origens já usadas no Ocean.
- **SC-004**: Em cenários sem dados ou com falha de carga, 100% das sessões de teste mantêm saldos e demais blocos da dashboard utilizáveis, com o bloco DRE em estado compreensível.
- **SC-005**: Usuários de teste conseguem, na primeira tentativa, comparar receita vs. composição (despesa + impostos + lucro) de um mês usando apenas o gráfico DRE.

## Assumptions

- O “ano vigente” é o ano civil corrente alinhado ao seletor/contexto de ano já usado na dashboard (quando houver).
- A granularidade é **mensal**; no ano civil corrente o eixo vai até o mês atual; em anos anteriores, jan–dez.
- Não há tela nova de cadastro de DRE: os valores são **calculados** a partir de dados já existentes (NFs para receita; contas/centros para despesas e impostos; lucro como resultado derivado).
- **Receita bruta**: alinhada ao conceito de faturamento bruto já usado no produto (NFs pagas/competência conforme regra já adotada nos resumos).
- **Impostos**: alinhados à visão de impostos já derivada de contas do centro impostos (e/ou regra equivalente já usada na página de Impostos).
- **Despesa**: soma das contas dos centros de custo do mês/ano **excluindo apenas impostos** (ex.: salário, bônus, administrativo, reembolsos, evento, retirada de lucro e quaisquer outros centros que não sejam impostos); competência pelo mês da **data de vencimento**; inclui pagas e pendentes.
- **Impostos**: apenas centro impostos; mesma regra de competência (vencimento) e status (pagas + pendentes) que Despesa / visão de Impostos.
- **Lucro**: resultado do mês derivado (receita − despesa − impostos), não um lançamento manual separado. Se negativo, não empilha; valor no tooltip/rótulo.
- O termo “Despesa” no modelo visual corresponde ao “Custo*” do pedido original (label vermelha).
- Preferência de labels não persiste entre sessões nesta versão.
- Visualizadores e admins com acesso à dashboard veem o mesmo gráfico (somente leitura).
- Escopo explícito fora desta feature: edição de metas, alteração dos cards de saldo, novos menus de DRE, exportação dedicada do gráfico e comparação com ano anterior.
