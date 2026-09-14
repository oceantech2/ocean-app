# Feature Specification: Cabeçalho Fixo na Tabela de Contas a Pagar

**Feature Branch**: `066-contas-pagar-cabecalho-fixo`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "contas a pagar manter o cabeçalho da tabela fixo para que ao scrollar para baixo não perca o cabeçalho"

**Baseline**: Na página de Contas a Pagar, ao rolar a listagem para baixo, o cabeçalho das colunas some da área visível. O usuário perde a referência do significado de cada coluna. Esta feature mantém o **cabeçalho da tabela sempre visível** enquanto as linhas rolam **dentro de uma área rolável própria da tabela** (título, filtros e demais controles da página ficam fora dessa área).

## Clarifications

### Session 2026-09-14

- Q: Quando a listagem for longa, o cabeçalho fica fixo em relação a quê? → A: Fixo no topo de uma **área rolável só da tabela** (a página pode não rolar; só as linhas rolam). *(Substitui decisão anterior de “grudar no topo ao rolar a página”.)*

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manter o cabeçalho visível ao rolar a tabela (Priority: P1)

O usuário autenticado abre Contas a Pagar e vê uma listagem com várias linhas. A tabela ocupa uma **área rolável própria**. Ao rolar **somente as linhas** nessa área, a linha de cabeçalho das colunas permanece fixa no topo dessa área, permitindo identificar cada coluna sem voltar ao início da lista. Título, filtros e ações fora da tabela não entram nessa rolagem.

**Why this priority**: É o único pedido desta feature — eliminar a perda de contexto das colunas durante a rolagem.

**Independent Test**: Abrir Contas a Pagar com lista longa o suficiente para rolar **dentro da área da tabela**; rolar as linhas e confirmar que o cabeçalho continua no topo dessa área e alinhado às colunas.

**Acceptance Scenarios**:

1. **Given** um administrador na página Contas a Pagar com listagem que exige rolagem vertical **na área da tabela**, **When** rola para baixo nessa área, **Then** o cabeçalho das colunas permanece visível no topo da área rolável da tabela.
2. **Given** a mesma situação, **When** rola até o final da listagem na área da tabela, **Then** o cabeçalho continua visível e os rótulos das colunas permanecem legíveis e alinhados às respectivas colunas.
3. **Given** um visualizador com acesso à página, **When** rola a área da tabela, **Then** o mesmo comportamento de cabeçalho fixo ocorre (esta feature não altera permissões).
4. **Given** o cabeçalho fixo visível, **When** o usuário compara com o estado anterior, **Then** as colunas, dados e ações da listagem permanecem os mesmos; apenas a área rolável da tabela e a persistência visual do cabeçalho durante a rolagem mudam.
5. **Given** listagem longa com rolagem na área da tabela, **When** o usuário observa título/filtros da página, **Then** esses elementos permanecem fora da área que rola as linhas (não somem junto com o scroll das linhas).

---

### User Story 2 - Voltar ao topo sem estranheza visual (Priority: P2)

Após rolar a área da tabela, o usuário sobe de volta ao início da listagem. O cabeçalho não “duplica”, não fica sobreposto a conteúdo indevido e retoma a posição natural no topo da tabela.

**Why this priority**: Garante que o cabeçalho fixo não introduza regressão visual ao interagir com a rolagem nos dois sentidos.

**Independent Test**: Rolar a área da tabela para baixo e depois para cima até o início; verificar ausência de cabeçalho duplicado ou sobreposição incorreta.

**Acceptance Scenarios**:

1. **Given** a área da tabela já rolada para baixo com cabeçalho fixo, **When** o usuário rola de volta ao topo dessa área, **Then** o cabeçalho permanece uma única linha no topo da tabela, sem duplicação.
2. **Given** rolagem em qualquer posição na área da tabela, **When** o usuário observa o cabeçalho, **Then** ele não cobre de forma ilegível o conteúdo das linhas (as linhas passam por baixo ou ficam abaixo da faixa do cabeçalho de forma clara).

---

### Edge Cases

- Listagem curta (sem necessidade de rolagem na área da tabela): o cabeçalho aparece normalmente no topo; não há comportamento estranho de “fixação” desnecessária.
- Poucas linhas que ainda assim cabem na área: cabeçalho e corpo permanecem estáticos, sem efeito colateral.
- Janela estreita / zoom alto: o cabeçalho fixo continua alinhado às colunas; se houver rolagem horizontal na tabela, o alinhamento cabeçalho–colunas se mantém coerente.
- Agrupamentos ou seções na listagem (se existirem na página): o cabeçalho de colunas permanece fixo no topo da área rolável; esta feature não altera a lógica de agrupamento.
- Título, filtros e ações fora da faixa de colunas: permanecem fora da área rolável da tabela e não dependem do scroll das linhas para ficarem visíveis.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Na página Contas a Pagar, a listagem MUST ter uma **área rolável própria** para as linhas, e o cabeçalho da tabela MUST permanecer visível no topo dessa área enquanto o usuário rola verticalmente as linhas.
- **FR-002**: Os rótulos do cabeçalho MUST permanecer alinhados às respectivas colunas durante e após a rolagem.
- **FR-003**: O cabeçalho fixo MUST NÃO duplicar-se nem sobrepor o conteúdo de forma que torne linhas ou rótulos ilegíveis.
- **FR-004**: Dados, filtros, ações e permissões da listagem MUST permanecer inalterados por esta feature (exceto a introdução da área rolável da tabela e do cabeçalho fixo nela).
- **FR-005**: O comportamento aplica-se a **admin** e **visualizador** que acessem a página Contas a Pagar.
- **FR-006**: Título, filtros e controles fora da tabela MUST permanecer fora da área que rola as linhas (não somem por causa do scroll do corpo da tabela).

### Key Entities

- **Tabela de Contas a Pagar**: listagem de contas na página Contas a Pagar, composta por cabeçalho de colunas, linhas de registros e uma área rolável própria para as linhas.
- **Cabeçalho de colunas**: faixa com os nomes das colunas que deve permanecer visível no topo da área rolável da tabela durante a rolagem vertical das linhas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes manuais com listagem que exige rolagem vertical na área da tabela em Contas a Pagar, o cabeçalho permanece visível no topo dessa área após rolar para baixo.
- **SC-002**: Em 100% dos mesmos testes, após voltar ao topo da área da tabela, não há cabeçalho duplicado nem sobreposição ilegível.
- **SC-003**: Usuários conseguem identificar o significado de qualquer coluna sem precisar rolar de volta ao início da listagem (validável por observação em teste de usabilidade informal: 0 necessidade de “voltar ao topo só para ler o cabeçalho”).
- **SC-004**: Nenhuma regressão funcional na listagem: criar/editar/excluir/filtrar (quando já existirem) continuam disponíveis e com o mesmo resultado de antes.
- **SC-005**: Em teste com listagem longa, título/filtros da página permanecem fora da área que rola as linhas em 100% das observações.

## Assumptions

- O escopo é **somente a página Contas a Pagar** (não outras tabelas do sistema nesta entrega).
- “Cabeçalho fixo” refere-se ao cabeçalho de **colunas da tabela de listagem**, não ao cabeçalho geral da página (título, filtros fora da tabela, etc.).
- A altura da área rolável da tabela segue o padrão visual da página (preencher o espaço útil disponível); o detalhe exato de layout fica para o plano técnico.
- Se a página Contas a Pagar tiver mais de uma tabela de listagem relevante (ex.: abas ou seções), o mesmo comportamento aplica-se à(s) tabela(s) de contas a pagar exibida(s) nessa página.
- Não há mudança de regras de negócio, persistência ou permissões.
- Comportamento em dispositivos móveis/touch segue o mesmo princípio (cabeçalho visível ao rolar a área da tabela), sem redesign de layout mobile nesta entrega.
