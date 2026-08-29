# Feature Specification: Ocultar Páginas — Configuração em Settings

**Feature Branch**: `042-ocultar-paginas-config`

**Created**: 2026-08-27

**Status**: Draft

**Input**: User description: "DH (ocultar página) — Criar lista em settings com checkbox de páginas visualizadas/ocultas"

## Clarifications

### Session 2026-08-27

- Q: Administradores devem continuar acessando páginas ocultas globalmente? → A: Admin não vê no menu, mas acessa por URL direta.
- Q: O que acontece com alertas/notificações cujo destino é uma página oculta? → A: Suprimir completamente o alerta enquanto a página destino estiver oculta.
- Q: Onde a configuração de visibilidade deve ser armazenada? → A: Servidor — configuração global compartilhada por todos os usuários e sessões.
- Q: Qual o estado inicial de DH após a implantação desta feature? → A: DH oculta por padrão na implantação; admin pode reativar.
- Q: A Dashboard pode ser ocultada pela lista de visibilidade? → A: Não — Dashboard sempre visível; não ocultável.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Administrador oculta a página DH (Priority: P1)

Administrador acessa Configurações e encontra uma seção dedicada à visibilidade das páginas do sistema. Ele desmarca DH na lista, salva, e a página deixa de aparecer no menu para todos os usuários.

**Why this priority**: É o caso de uso imediato que motivou a feature — retirar DH da navegação sem remover o módulo do produto de forma permanente.

**Independent Test**: Entrar como admin, ocultar DH na nova seção, recarregar o app e confirmar que nenhum usuário vê DH no menu lateral nem na busca rápida.

**Acceptance Scenarios**:

1. **Given** um administrador autenticado em Configurações, **When** ele abre a seção de visibilidade de páginas, **Then** vê uma lista com todas as páginas navegáveis do produto e o estado atual de cada uma (visível ou oculta).
2. **Given** DH está marcada como visível, **When** o administrador desmarca DH e confirma a alteração, **Then** DH deixa de aparecer no menu lateral e na busca rápida para qualquer usuário autenticado.
3. **Given** DH foi ocultada, **When** um visualizador tenta abrir o endereço direto da página DH, **Then** é redirecionado para a Dashboard sem ver o conteúdo de DH.
4. **Given** DH foi ocultada, **When** um administrador abre o endereço direto da página DH, **Then** acessa normalmente o conteúdo de DH, mesmo sem item no menu.

---

### User Story 2 - Administrador reativa uma página oculta (Priority: P2)

Administrador que ocultou uma página pode voltar a exibi-la marcando novamente o checkbox correspondente, restaurando o comportamento anterior sem perda de dados do módulo.

**Why this priority**: A ocultação deve ser reversível; caso contrário, a equipe ficaria presa a uma remoção definitiva como a de Relatórios.

**Independent Test**: Ocultar uma página, salvar, recarregar, marcar como visível novamente e confirmar retorno ao menu.

**Acceptance Scenarios**:

1. **Given** DH está oculta, **When** o administrador marca DH como visível e salva, **Then** DH volta a aparecer no menu para usuários que tenham permissão de acesso a esse módulo.
2. **Given** uma página foi reativada, **When** o usuário navega até ela, **Then** o conteúdo e funcionalidades existentes continuam disponíveis como antes da ocultação.

---

### User Story 3 - Permissões por usuário respeitam páginas ocultas globalmente (Priority: P3)

Administrador que gerencia permissões de visualizadores não consegue conceder acesso a páginas que estejam ocultas globalmente, evitando configuração inconsistente.

**Why this priority**: Duas camadas de controle (global e por usuário) precisam ser coerentes para não confundir quem administra o sistema.

**Independent Test**: Ocultar DH globalmente, abrir o formulário de usuário visualizador e confirmar que DH não aparece como opção concedível ou aparece desabilitada com indicação de oculta.

**Acceptance Scenarios**:

1. **Given** DH está oculta globalmente, **When** um admin edita permissões de um visualizador, **Then** DH não pode ser habilitada até que a página seja reativada na configuração global.
2. **Given** um visualizador tinha permissão para DH antes da ocultação global, **When** DH é ocultada, **Then** o usuário deixa de ver DH no menu mesmo mantendo a permissão gravada no cadastro.

---

### Edge Cases

- Página oculta com favorito ou link direto: visualizador é redirecionado para a Dashboard; administrador acessa o conteúdo normalmente pela URL.
- Administrador com página oculta: item some do menu e da busca rápida, mas URL direta continua funcionando (diferente do visualizador).
- Administrador oculta a página em que está: após salvar, a navegação seguinte não deve deixar o usuário preso em rota inexistente; redirecionar para a Dashboard.
- Configurações permanece sempre acessível a administradores, mesmo que outras páginas sejam ocultadas — a própria tela de Configurações não pode ser ocultada por esta lista.
- **Dashboard** permanece sempre visível no menu e **não pode ser ocultada** (destino padrão de redirecionamento e landing page).
- Páginas exclusivas de admin (Auditoria, Segurança) podem ser ocultadas globalmente, mas Configurações não entra na lista de ocultáveis.
- Estado inicial na implantação: **DH já vem oculta**; demais páginas elegíveis permanecem visíveis até o admin alterar.
- Usuário visualizador sem permissão a um módulo continua sem vê-lo mesmo que a página esteja globalmente visível (regra atual mantida).
- Alertas/notificações cujo destino é página oculta (ex.: férias → `/ferias`): não exibir enquanto a página permanecer oculta, para qualquer papel.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST apresentar em Configurações uma seção dedicada à visibilidade das páginas do produto, acessível somente a administradores.
- **FR-002**: A seção MUST listar todas as páginas navegáveis do menu lateral (Dashboard, Calendário, Contas a Receber, Contas a Pagar, Fluxo de Caixa, Impostos, Retiradas, Bônus, DH, Colaboradores, Férias, Patrimônio, Auditoria, Segurança), com checkbox ou equivalente indicando **visível** ou **oculta**.
- **FR-003**: **Dashboard** e **Configurações** MUST NOT ser ocultáveis. Dashboard permanece sempre visível; Configurações não entra na lista de páginas ocultáveis.
- **FR-004**: O administrador MUST poder alterar o estado de visibilidade de uma ou mais páginas e salvar a configuração de forma persistente no **servidor**, compartilhada por todos os usuários e sessões.
- **FR-005**: Páginas marcadas como ocultas MUST deixar de aparecer no menu lateral e na busca rápida do menu para **todos** os usuários autenticados, inclusive administradores.
- **FR-006**: Acesso direto por endereço a uma página oculta MUST redirecionar **visualizadores** para a Dashboard, sem exibir o conteúdo; **administradores** MUST poder acessar o conteúdo normalmente pela URL direta.
- **FR-007**: A ocultação global MUST ter precedência sobre permissões individuais de visualizador: página oculta globalmente não aparece no menu mesmo que o usuário tenha permissão gravada.
- **FR-008**: Ao editar permissões de um visualizador, páginas ocultas globalmente MUST NOT ser concedíveis (desabilitadas ou ausentes da lista, com indicação clara de que estão ocultas no sistema).
- **FR-009**: Reativar uma página oculta MUST restaurar sua exibição no menu conforme as permissões já existentes de cada usuário, sem exigir recadastro de permissões.
- **FR-010**: A alteração de visibilidade MUST NOT apagar dados ou funcionalidades do módulo oculto; apenas controla descoberta e navegação.
- **FR-011**: Na implantação desta feature, **DH** MUST iniciar como **oculta**; as demais páginas elegíveis MUST iniciar visíveis. O administrador MUST poder reativar DH ou ocultar outras páginas a qualquer momento.
- **FR-012**: Alertas e notificações do menu cujo destino seja uma página oculta MUST NOT ser exibidos enquanto essa página permanecer oculta, para todos os papéis.

### Key Entities

- **Configuração de visibilidade de páginas**: Conjunto persistido **no servidor** de flags por página (visível/oculta), compartilhado globalmente e gerenciado por administradores.
- **Página navegável**: Item do menu lateral identificado por rótulo e rota, sujeito à configuração global de visibilidade.
- **Permissão de menu por usuário**: Controle existente que define quais módulos um visualizador pode acessar; permanece válido, mas subordinado à visibilidade global.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrador consegue ocultar DH em menos de 1 minuto a partir de Configurações, sem suporte técnico.
- **SC-002**: Após ocultar uma página, 100% dos usuários autenticados deixam de vê-la no menu e na busca rápida em inspeção visual completa.
- **SC-003**: 100% das tentativas de acesso direto a página oculta por **visualizadores** resultam em redirecionamento para a Dashboard; administradores acessam o conteúdo pela URL em 100% das tentativas válidas.
- **SC-004**: Reativar uma página oculta restaura sua presença no menu em uma única ação de configuração, sem perda de dados do módulo.
- **SC-005**: Em Configurações de usuário, nenhuma página globalmente oculta pode ser habilitada para visualizadores enquanto permanecer oculta.
- **SC-006**: Com uma página oculta, 100% dos alertas cujo destino seria essa página deixam de aparecer no painel de notificações.

## Assumptions

- A feature adiciona controle **global** de visibilidade, distinto das permissões por usuário já existentes; ambos coexistem, com a visibilidade global tendo precedência.
- A configuração é **centralizada no servidor** (não por navegador): qualquer alteração por um administrador vale para todos os usuários após sincronização/recarregamento.
- DH é o primeiro caso de uso e **inicia oculta** na implantação; demais páginas navegáveis permanecem configuráveis pela lista em Configurações.
- Páginas ocultas permanecem no produto (dados, rotas internas); apenas deixam de ser descobertas via navegação — diferente da remoção definitiva de Relatórios.
- Visualizadores continuam sem acesso a Configurações, Auditoria e Segurança conforme regras atuais de papel; esta feature não altera essas restrições de admin-only.
- Administradores seguem sem ver páginas ocultas no menu, mas mantêm acesso operacional via URL direta (ex.: revisar DH oculta sem reativá-la globalmente).
- Alertas cujo destino é página oculta são suprimidos integralmente (não aparecem no painel), alinhado à intenção de ocultar o módulo da operação diária.
