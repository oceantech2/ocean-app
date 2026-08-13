# Feature Specification: Remover página de Relatórios

**Feature Branch**: `022-remover-pagina-relatorios`

**Created**: 2026-08-12

**Status**: Draft

**Input**: User description: "remover página de Relatórios"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Menu sem Relatórios (Priority: P1)

Usuário autenticado navega pelo menu lateral e não encontra o item Relatórios. A visão consolidada de indicadores permanece na Dashboard.

**Why this priority**: É o pedido central — a página deixa de existir como destino de navegação.

**Independent Test**: Entrar autenticado e conferir que o menu não lista Relatórios e que a Dashboard continua acessível.

**Acceptance Scenarios**:

1. **Given** o usuário está autenticado (admin ou visualizador), **When** ele observa o menu lateral, **Then** não há item Relatórios.
2. **Given** o usuário está autenticado, **When** ele usa a busca rápida do menu, **Then** Relatórios não aparece como resultado.

---

### User Story 2 - Link antigo não abre a página (Priority: P2)

Quem ainda tem favorito ou link para Relatórios não vê a tela antiga; é levado à Dashboard.

**Why this priority**: Evita tela vazia ou erro após a remoção, sem reintroduzir a página.

**Independent Test**: Acessar o endereço antigo da página de Relatórios autenticado e confirmar redirecionamento para a Dashboard.

**Acceptance Scenarios**:

1. **Given** o usuário está autenticado, **When** ele abre o endereço antigo de Relatórios, **Then** é levado à Dashboard.
2. **Given** o usuário não está autenticado, **When** ele abre o endereço antigo de Relatórios, **Then** o fluxo de login existente continua a valer (não há tela de Relatórios).

---

### User Story 3 - Permissões sem módulo Relatórios (Priority: P3)

Administrador que gerencia usuários não vê mais Relatórios como módulo concedível, pois a página não existe.

**Why this priority**: Evita permissão órfã na tela de Configurações.

**Independent Test**: Abrir Configurações como admin e confirmar que Relatórios não está na lista de permissões.

**Acceptance Scenarios**:

1. **Given** um admin abre o formulário de usuário, **When** ele vê as permissões de menu, **Then** Relatórios não aparece como opção.

---

### Edge Cases

- Chaves de permissão `relatorios` já gravadas em usuários existentes podem permanecer no cadastro; não precisam ser migradas, pois não controlam mais nenhum item de menu.
- Indicadores e gráficos que hoje residem na Dashboard permanecem; a remoção da página não apaga dados financeiros nem a visão da Dashboard.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST deixar de exibir Relatórios no menu de navegação para qualquer papel.
- **FR-002**: O sistema MUST deixar de apresentar a tela de Relatórios como página do produto.
- **FR-003**: Acesso ao endereço antigo de Relatórios MUST levar o usuário autenticado à Dashboard.
- **FR-004**: A tela de Configurações MUST deixar de listar Relatórios como permissão de módulo.
- **FR-005**: A Dashboard MUST continuar disponível com os indicadores financeiros já existentes (a remoção da página não reduz a visão principal).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos usuários autenticados deixam de ver Relatórios no menu em uma inspeção visual do menu completo.
- **SC-002**: Abrir o endereço antigo de Relatórios autentica (se preciso) e resulta na Dashboard, sem conteúdo da tela removida.
- **SC-003**: Em Configurações, a lista de módulos não inclui Relatórios.

## Assumptions

- A página de Relatórios é redundante em relação à Dashboard; o valor de negócio da visão consolidada permanece na Dashboard.
- Serviços internos usados pela Dashboard (agregações financeiras) continuam existindo; esta feature remove só a página e a navegação associadas.
- Não há necessidade de migration de banco para limpar a chave de permissão antiga.
- Documentação histórica de specs anteriores não precisa ser reescrita nesta feature.
