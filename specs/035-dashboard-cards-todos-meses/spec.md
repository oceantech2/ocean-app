# Feature Specification: Dashboard — Cards com Todos os Meses

**Feature Branch**: `035-dashboard-cards-todos-meses`

**Created**: 2026-08-18

**Status**: Draft

**Input**: User description: "em dashboard os cards quando o filtro tiver todos os meses deve aprensetar os dados de todos os meses"

**Baseline**: A dashboard já oferece filtro de **mês** com a opção **Todos os meses** (visão do ano, sem mês concreto) e filtro de **ano** (`specs/009-dashboard-filtro-mes`, `specs/015-dashboard-filtro-ano`). Com um mês concreto, os cards de indicador (faturamento bruto, faturamento líquido, NFs com pagamento pendente) e o card de meta mensal mostram números daquele mês. Com **Todos os meses**, esses cards de indicador hoje pedem para selecionar um mês e **não** exibem consolidado; o card de meta mensal também esvazia. Esta feature corrige isso: na visão **Todos os meses**, os cards de indicador apresentam os dados de **todos os meses** do recorte do ano selecionado, e o card de meta mensal **não é exibido** (a meta do ano permanece só no card anual).

## Clarifications

### Session 2026-08-18

- Q: Com **Todos os meses**, o que fazer com o card de meta mensal (ao lado da meta anual)? → A: Esconder o card de meta mensal nessa visão; só a meta anual permanece no topo.
- Q: Com o card mensal oculto, qual a largura do card de meta anual? → A: Meta anual em largura total; volta a metade da fileira quando há um mês concreto.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver consolidado nos cards com Todos os meses (Priority: P1)

Um usuário autenticado abre a dashboard, escolhe **Todos os meses** e um ano, e vê nos cards de indicador os totais daquele recorte anual — faturamento bruto, faturamento líquido e valor de NFs com pagamento pendente — em vez de uma mensagem pedindo para escolher um mês. Ele consegue ler o ano de uma vez só, sem ter que passar mês a mês só para somar mentalmente.

**Why this priority**: É o pedido central — o filtro **Todos os meses** só entrega valor se os cards acompanharem o recorte.

**Independent Test**: Com valores conhecidos em dois meses do mesmo ano, selecionar **Todos os meses** e confirmar que cada card de indicador mostra o consolidado do recorte (não um único mês e não a mensagem de “selecione um mês”).

**Acceptance Scenarios**:

1. **Given** a dashboard com um mês concreto selecionado e cards preenchidos, **When** o usuário escolhe **Todos os meses**, **Then** os cards de **Faturamento Bruto**, **Faturamento Líquido** e **NFs com pagamento pendente (R$)** passam a exibir os totais de **todos os meses** do recorte do ano selecionado (não a orientação para selecionar um mês).
2. **Given** a visão **Todos os meses** no ano selecionado, **When** o usuário lê os três cards, **Then** identifica que os números são do recorte anual (rótulo ou texto de apoio deixa o período claro, em português).
3. **Given** dois meses com faturamento conhecido no mesmo recorte, **When** o usuário está em **Todos os meses**, **Then** o faturamento bruto e o líquido dos cards equivalem à soma desses meses (e dos demais meses do recorte), não ao valor de um mês isolado.
4. **Given** NFs pendentes em meses diferentes do mesmo recorte, **When** o usuário está em **Todos os meses**, **Then** o card de NFs pendentes consolida quantidade e valor de todas as pendências daquele recorte (não só de um mês).
5. **Given** papéis `admin` e `visualizador`, **When** cada um usa **Todos os meses**, **Then** ambos veem os mesmos consolidados nos cards (somente leitura para o visualizador).

---

### User Story 2 - Meta mensal some na visão anual; volta com um mês concreto (Priority: P1)

Com **Todos os meses**, o usuário **não** vê o card de meta mensal (evita bloco vazio e evita repetir a meta anual). No topo de metas permanece só o card de **meta anual**, ocupando a **largura total** da área de conteúdo (sem coluna vazia ao lado). Quando escolhe um mês concreto, o card de meta mensal reaparece ao lado e a meta anual volta à metade da fileira, com meta, realizado e edição daquele mês, como já funciona hoje.

**Why this priority**: Sem essa regra, o topo ficaria com um card vazio ou duplicado; o consolidado do ano já está no card anual.

**Independent Test**: Selecionar **Todos os meses** e confirmar ausência do card de meta mensal, meta anual em largura total; selecionar um mês e confirmar o retorno dos dois cards lado a lado.

**Acceptance Scenarios**:

1. **Given** a dashboard com mês concreto (dois cards de meta lado a lado, cada um em metade da fileira no desktop), **When** o usuário escolhe **Todos os meses**, **Then** o card de meta mensal **não aparece** e o card de meta anual permanece visível, utilizável e em **largura total** (sem espaço vazio ao lado).
2. **Given** a visão **Todos os meses**, **When** o usuário cria ou edita meta, **Then** só consegue fazê-lo no card de meta **anual** (somente `admin`), nunca num card mensal oculto.
3. **Given** a visão **Todos os meses**, **When** o usuário seleciona um mês concreto, **Then** o card de meta mensal reaparece com meta, realizado e regras de edição **daquele mês**, e os dois cards voltam lado a lado (meta anual na metade da fileira).
4. **Given** papéis `admin` e `visualizador`, **When** cada um está em **Todos os meses**, **Then** nenhum vê o card de meta mensal e ambos veem a meta anual em largura total.

---

### User Story 3 - Voltar ao mês isolado sem misturar recortes (Priority: P2)

O usuário alterna entre um mês concreto e **Todos os meses** e sempre vê números coerentes com o filtro atual: mês isolado ou consolidado do ano, sem mistura residual do filtro anterior.

**Why this priority**: Garante confiança ao navegar o filtro; sem isso o consolidado parece “errado”.

**Independent Test**: Alternar mês concreto → Todos os meses → outro mês; conferir que cada estado mostra só o recorte correspondente.

**Acceptance Scenarios**:

1. **Given** **Todos os meses** com consolidados visíveis e meta anual em largura total, **When** o usuário seleciona um mês concreto, **Then** os três cards de indicador voltam a mostrar **somente aquele mês** no ano selecionado, o card de meta mensal reaparece para aquele mês e a meta anual volta à metade da fileira.
2. **Given** troca rápida entre meses e **Todos os meses**, **When** a tela estabiliza, **Then** os valores exibidos correspondem ao último filtro escolhido (sem misturar totais intermediários).
3. **Given** o usuário altera só o **ano** com **Todos os meses** ativo, **Then** os cards de indicador recalculam o consolidado do novo ano (recorte daquele ano) e o card de meta mensal permanece oculto.

---

### Edge Cases

- Ano civil corrente + **Todos os meses**: consolidado de janeiro até o **mês civil corrente** (inclusive); não incluir meses futuros.
- Ano anterior + **Todos os meses**: consolidado de janeiro a dezembro.
- Ano futuro (se o seletor permitir): cards de indicador em estado vazio previsível, sem inventar valores; card de meta mensal continua oculto.
- Recorte sem nenhum faturamento: cards de indicador mostram zero (ou estado vazio equivalente já usado na dashboard), não a mensagem de “selecione um mês”.
- Recorte sem NFs pendentes: card de pendentes com zero em valor e quantidade.
- Um único mês com dados no recorte: consolidado igual a esse mês (ainda assim é visão anual, não a mensagem de selecionar mês).
- Troca de ano com **Todos os meses** ativo: permanecer em **Todos os meses**, atualizar os cards de indicador, manter o card de meta mensal oculto e a meta anual em largura total.
- Viewport estreita com **Todos os meses**: meta anual em largura total (já empilhada); sem coluna vazia.
- Saldos: continuam com a regra já vigente (mais recente do ano na visão sem mês); esta feature não altera cards de saldo.
- Donut de custo do mês: continua **não** sendo exigido nesta visão (já some com **Todos os meses**); esta feature não reabre o donut mensal.
- Gráficos de série anual (DRE, faturamento por mês): já usam o ano; não mudam de regra nesta feature.
- Comparação de ano (“Comparar”): continua independente e não redefine o consolidado dos cards desta feature.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Com o filtro de mês em **Todos os meses**, os cards de **Faturamento Bruto**, **Faturamento Líquido** e **NFs com pagamento pendente (R$)** MUST exibir os totais consolidados de **todos os meses** do recorte do ano selecionado.
- **FR-002**: Com **Todos os meses**, esses cards MUST NÃO exibir orientação do tipo “selecione um mês para ver este indicador” (nem equivalente que esconda os números).
- **FR-003**: O recorte de “todos os meses” MUST ser: ano civil corrente = janeiro até o mês civil corrente (inclusive); ano anterior ao corrente = janeiro a dezembro; ano futuro = sem valores inventados (estado vazio).
- **FR-004**: Com um **mês concreto** selecionado, os mesmos cards MUST continuar mostrando **somente aquele mês** no ano selecionado (comportamento já vigente).
- **FR-005**: Com **Todos os meses**, o card de meta **mensal** MUST **não ser exibido** (nem vazio, nem repetindo a meta anual). O card de meta **anual** MUST permanecer visível e ocupar a **largura total** da área de conteúdo (sem coluna vazia ao lado).
- **FR-006**: Com um mês concreto selecionado, o card de meta mensal MUST reaparecer e voltar às regras já vigentes (meta, realizado e edição daquele mês); os dois cards de meta MUST voltar lado a lado (cada um na metade da fileira no desktop).
- **FR-007**: Os cards de indicador MUST deixar claro o período quando a visão for **Todos os meses** (ex.: indicação do ano ou de “todos os meses” / recorte do ano), para não parecerem um mês isolado.
- **FR-008**: Alterar o **ano** com **Todos os meses** ativo MUST atualizar os consolidados dos cards de indicador para o novo ano e MUST manter o card de meta mensal oculto; alterar de **Todos os meses** para um mês concreto MUST restringir os cards de indicador àquele mês e MUST reexibir o card de meta mensal.
- **FR-009**: Usuários `admin` e `visualizador` MUST ver os mesmos consolidados nos cards de indicador e MUST NÃO ver o card de meta mensal em **Todos os meses**; permissões de edição de meta permanecem as já definidas (só `admin`; meta mensal só com mês concreto).
- **FR-010**: Esta feature MUST limitar-se à **dashboard** e aos **cards de indicador** descritos, mais a visibilidade do card de meta mensal. Fora de escopo: outras páginas, donut mensal, DRE, série de faturamento, saldos e o conteúdo/cálculo do card de meta anual (que já é anual).
- **FR-011**: Em ausência de dados no recorte, os cards de indicador MUST mostrar zero ou estado vazio de “sem dados no período”, nunca bloquear o restante da tela nem os filtros.

### Key Entities

- **Período da dashboard**: Ano obrigatório e mês opcional. Mês ausente (**Todos os meses**) = visão consolidada do recorte anual nos cards de indicador; card de meta mensal oculto; meta anual em largura total.
- **Recorte anual dos cards**: Conjunto de meses somados na visão **Todos os meses** (YTD no ano corrente; ano calendário completo em anos anteriores).
- **Card de indicador**: Bloco de faturamento bruto, faturamento líquido ou NFs pendentes.
- **Card de meta mensal**: Bloco ao lado da meta anual visível **somente** com mês concreto; oculto em **Todos os meses**.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes com **Todos os meses**, os três cards de indicador exibem números do recorte anual em até 10 segundos após a troca do filtro, sem mensagem pedindo um mês.
- **SC-002**: Em 100% dos testes com valores conhecidos em dois ou mais meses, o consolidado de bruto e líquido com **Todos os meses** coincide com a soma desses meses no recorte (e o card de pendentes consolida todas as pendências do recorte).
- **SC-003**: Em 100% dos testes, ao selecionar de volta um mês concreto, os cards de indicador voltam a mostrar apenas aquele mês (não o consolidado) e o card de meta mensal reaparece.
- **SC-004**: Em 100% dos testes com **Todos os meses**, o card de meta mensal não está visível e o card de meta anual permanece visível em largura total; em 100% dos testes com mês concreto, os dois cards voltam lado a lado.
- **SC-005**: Admin e visualizador completam a leitura dos cards com **Todos os meses** na primeira tentativa, sem treinamento além do que está na tela.
- **SC-006**: Em recorte sem dados, nenhum card quebra a página; o usuário consegue mudar mês/ano em seguida.

## Assumptions

- O pedido refere-se à **dashboard**, não a outras telas com filtro de mês.
- “Cards” cujo conteúdo muda nesta feature são **Faturamento Bruto**, **Faturamento Líquido** e **NFs com pagamento pendente**. O card de meta mensal só muda de **visibilidade** (oculto em **Todos os meses**); o card de meta anual só muda de **largura** nessa visão. Saldos, donuts e gráficos já têm regra própria e não entram no escopo.
- O recorte “todos os meses” segue o mesmo critério anual já usado na dashboard (ano corrente até o mês de hoje; ano passado jan–dez), para não criar um terceiro significado de “ano”.
- Não se inventa um mês padrão ao escolher **Todos os meses**.
- Regras de negócio de o que entra em bruto, líquido e pendente (NFs pagas vs. pendentes, etc.) permanecem as já usadas quando há um mês; só o intervalo de meses muda.
- Persistência do filtro entre sessões continua não obrigatória.
- Rótulos em português, alinhados ao restante da dashboard.
