# Feature Specification: Headers Fixos em Tabelas com Scroll

**Feature Branch**: `073-tabelas-header-fixo`

**Created**: 2026-09-16

**Status**: Draft

**Input**: User description: "em todas tabelas quando elas tem scroll o ideal é o header da tabela ficar fixo igual no contas a pagar"

## Clarifications

### Session 2026-09-16

- Q: Em listagens que hoje rolam a página inteira (sem área interna com altura limitada), qual estratégia de scroll deve ser adotada para o cabeçalho fixo? → A: Em toda listagem tabular, usar área de scroll com altura limitada (como Contas a Pagar), para o cabeçalho ficar fixo dentro da tabela
- Q: As tabelas do Dashboard entram no escopo do padrão (área com altura limitada + cabeçalho fixo)? → A: No Dashboard, só cabeçalho fixo se a tabela já tiver scroll próprio; sem forçar altura limitada nos blocos da home
- Q: Tabelas dentro de modais devem seguir o padrão completo de Contas a Pagar? → A: Nos modais, só cabeçalho fixo quando já houver scroll (do modal ou da tabela); sem forçar altura limitada no estilo Contas a Pagar

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Identificar colunas ao rolar listas longas (Priority: P1)

Como usuário (admin ou visualizador) que consulta uma lista com muitas linhas, ao rolar verticalmente a área da tabela quero que o cabeçalho das colunas permaneça visível, no mesmo padrão já usado em Contas a Pagar, para não perder o contexto do significado de cada coluna.

**Why this priority**: Sem o cabeçalho fixo, o usuário precisa subir e descer repetidamente para associar valores às colunas; isso é o problema principal relatado e já tem referência de UX no produto.

**Independent Test**: Em qualquer tela com tabela de dados que permita rolagem vertical, rolar o conteúdo e verificar que os títulos das colunas continuam visíveis no topo da área rolável, como em Contas a Pagar.

**Acceptance Scenarios**:

1. **Given** uma tabela com linhas suficientes para gerar rolagem vertical, **When** o usuário rola o conteúdo para baixo, **Then** o cabeçalho da tabela permanece visível no topo da área de rolagem da tabela
2. **Given** a tela Contas a Pagar (referência), **When** o usuário compara o comportamento do cabeçalho com as demais tabelas de listagem do sistema, **Then** o comportamento visual e de uso é equivalente (cabeçalho acompanha a área rolável e não “some” com as linhas)

---

### User Story 2 - Cobertura consistente em todas as listagens tabulares (Priority: P1)

Como usuário que navega entre módulos de listagem (NFs, fornecedores, férias, DH, fluxo de caixa, auditoria, etc.), espero o mesmo padrão de cabeçalho fixo com área de scroll limitada, para não depender de memorizar layout por página. No Dashboard, o layout da home não deve ser forçado a esse padrão completo.

**Why this priority**: O pedido é explícito (“em todas as tabelas”); inconsistência entre telas reduz a percepção de qualidade e gera retrabalho de usabilidade.

**Independent Test**: Percorrer as telas que exibem tabelas de dados com scroll e confirmar cabeçalho fixo em cada uma; telas sem scroll suficiente podem ser validadas com volume de dados que force a rolagem.

**Acceptance Scenarios**:

1. **Given** qualquer tela de listagem/CRUD ou módulo de dados (exceto Dashboard) que apresente uma tabela de listagem de registros, **When** o usuário visualiza a listagem, **Then** as linhas rolam dentro de uma área com altura limitada e o cabeçalho permanece fixo no topo dessa área (padrão Contas a Pagar)
2. **Given** uma tabela que só rola horizontalmente (muitas colunas, poucas linhas), **When** o usuário rola horizontalmente, **Then** o cabeçalho acompanha as colunas (continua alinhado às células) e permanece útil para leitura

---

### User Story 3 - Não atrapalhar leitura nem ações na tabela (Priority: P2)

Como usuário que ordena, seleciona ou age sobre linhas, o cabeçalho fixo não deve cobrir conteúdo de forma confusa nem impedir o uso de controles já existentes no cabeçalho (quando houver, como ordenação ou seleção).

**Why this priority**: Melhoria de UX não pode regressar interações já disponíveis nas tabelas.

**Independent Test**: Em tabelas com controles no cabeçalho (ex.: ordenação ou checkbox), rolar e usar esses controles; confirmar que linhas sob o cabeçalho não ficam ilegíveis e que os controles continuam acionáveis.

**Acceptance Scenarios**:

1. **Given** uma tabela com controles no cabeçalho, **When** o usuário rola e aciona um controle do cabeçalho, **Then** o controle responde normalmente e o cabeçalho permanece legível sobre o conteúdo
2. **Given** tema claro ou escuro, **When** o usuário rola a tabela, **Then** o cabeçalho permanece legível (fundo opaco o suficiente para não misturar texto do cabeçalho com linhas que passam por baixo)

---

### Edge Cases

- Tabela com poucas linhas (sem scroll vertical): cabeçalho aparece normalmente; não há comportamento “preso” estranho fora da área da tabela
- Tabela vazia ou apenas com mensagem de “sem registros”: não há regressão de layout
- Telas que hoje rolam a página inteira: passam a ter área de scroll com altura limitada na listagem; o cabeçalho fica fixo no topo dessa área (não em relação à janela do navegador), no mesmo critério de Contas a Pagar
- Dashboard: sem altura limitada forçada nos blocos da home; se alguma tabela já tiver scroll próprio, o cabeçalho pode ficar fixo; caso contrário, o comportamento atual da home permanece
- Filtros, botões de ação e demais controles da página: permanecem fora da área rolável da tabela (como em Contas a Pagar), salvo quando já fizerem parte do cabeçalho da grade
- Scroll horizontal + vertical combinados: cabeçalho permanece alinhado às colunas e visível no topo da área rolável
- Modais ou painéis com tabelas: sem altura limitada forçada no estilo Contas a Pagar; cabeçalho fixo apenas quando já houver scroll do modal ou da tabela
- Impressão / área de impressão (quando existir): não exigir cabeçalho sticky na saída impressa; prioridade é a experiência na tela

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST manter o cabeçalho das colunas visível no topo da área de rolagem de toda tabela de listagem de dados, no mesmo padrão de experiência já adotado em Contas a Pagar
- **FR-001a**: Toda listagem tabular em página de módulo (fora do Dashboard e fora de modais) MUST usar uma área de scroll com altura limitada (equivalente ao padrão de Contas a Pagar), de modo que a rolagem das linhas ocorra dentro dessa área e o cabeçalho permaneça fixo no topo dela — inclusive nas telas que hoje só rolam a página inteira
- **FR-002**: O padrão completo (área com altura limitada + cabeçalho fixo) MUST ser aplicado de forma consistente nas telas de listagem/CRUD e demais módulos de dados do Ocean App (incluindo, sem limitar: NFs, contas a receber, fornecedores, férias, DH, bônus/comissões, fluxo de caixa, auditoria, patrimônio, impostos, retiradas, configurações e demais listagens tabulares existentes fora do Dashboard)
- **FR-002a**: No Dashboard, o sistema MUST NÃO forçar área com altura limitada nos blocos da home; cabeçalho fixo só se aplica se a tabela já tiver scroll próprio
- **FR-003**: Contas a Pagar MUST permanecer como referência de comportamento aceito; alterações nessa tela só são permitidas se forem necessárias para alinhar detalhes cosméticos sem piorar o comportamento atual
- **FR-004**: O cabeçalho fixo MUST permanecer legível em tema claro e tema escuro, sem sobreposição confusa do texto das linhas sobre o texto do cabeçalho
- **FR-005**: Controles já existentes no cabeçalho (ordenação, seleção em massa, filtros embutidos, quando houver) MUST continuar utilizáveis com o cabeçalho fixo
- **FR-006**: Em modais (e painéis semelhantes), o sistema MUST NÃO forçar área com altura limitada no estilo Contas a Pagar; cabeçalho fixo só se aplica quando já houver scroll do modal ou da tabela
- **FR-007**: O sistema MUST NÃO alterar regras de negócio, filtros, ordenação de dados, permissões ou conteúdo das colunas — apenas o comportamento de fixação do cabeçalho durante o scroll (e a área de scroll limitada nas listagens de página cobertas)
- **FR-008**: Telas que usam tabelas apenas decorativas ou sem listagem de registros (ex.: layouts sem grade de dados) estão fora do escopo; o escopo é tabelas de dados/listagem
- **FR-009**: O Dashboard está fora do escopo do padrão completo de Contas a Pagar; aplica-se apenas cabeçalho fixo oportunista quando já existir scroll próprio na tabela

### Key Entities

- **Tabela de listagem**: Grade de dados com cabeçalho de colunas e linhas de registros, tipicamente com scroll quando o volume ou a altura da área exigem
- **Cabeçalho de coluna**: Linha de títulos (e eventualmente controles) que identifica o significado de cada coluna; deve permanecer visível durante o scroll vertical da área da tabela
- **Área de rolagem da tabela**: Região em que o usuário rola o conteúdo da grade (referência: comportamento de Contas a Pagar), distinta da rolagem geral da página quando aplicável

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das telas de listagem/CRUD e módulos de dados cobertos (exceto Dashboard), o usuário consegue identificar os títulos das colunas sem precisar rolar de volta ao topo da tabela, com rolagem dentro de área de altura limitada
- **SC-002**: Em teste de usabilidade interno com pelo menos 3 telas distintas além de Contas a Pagar (fora do Dashboard), 100% dos avaliadores reconhecem o comportamento do cabeçalho como equivalente ao de Contas a Pagar
- **SC-003**: Em até 5 segundos após abrir uma listagem longa e rolar, um usuário familiarizado com Contas a Pagar consegue confirmar mentalmente “o cabeçalho ficou fixo” sem instrução adicional
- **SC-004**: Nenhuma regressão funcional reportada nos fluxos de ordenação, seleção ou ações de linha nas tabelas cobertas após a padronização (zero tickets internos relacionados a “perdi o controle do cabeçalho” ou “não consigo ordenar após o sticky”)
- **SC-005**: Em tema claro e escuro, o texto do cabeçalho permanece legível durante o scroll em todas as tabelas cobertas (verificação visual em amostra de pelo menos 5 telas)

## Assumptions

- A referência visual e de interação é a tabela de Contas a Pagar já existente no produto
- “Todas as tabelas” significa todas as tabelas de listagem de dados do aplicativo, não componentes gráficos (cards, gráficos, calendário)
- Não há mudança de regra de negócio, API ou modelo de dados
- Papéis `admin` e `visualizador` mantêm as mesmas permissões; apenas a apresentação do cabeçalho muda
- Toda listagem tabular fora do Dashboard deve adotar área de scroll com altura limitada no padrão Contas a Pagar (não basta cabeçalho fixo só onde o container já existir)
- No Dashboard: não forçar altura limitada; cabeçalho fixo apenas se a tabela já tiver scroll próprio
- Em modais: não forçar altura limitada no estilo Contas a Pagar; cabeçalho fixo apenas quando já houver scroll do modal ou da tabela
- Tabelas dentro de abas (ex.: bônus/comissões) em páginas de listagem entram no escopo do padrão completo quando forem listagens tabulares
- Impressão não é prioridade desta feature
