# Feature Specification: Barra Lateral Colapsável com Ícones

**Feature Branch**: `005-sidebar-collapse-icons`

**Created**: 2026-07-26

**Status**: Draft

**Input**: User description: "existe uma barra de navegacao lateral e nela voce deve inserir icones pois deve ser possivel colapsar ela e entao ficara so os icones e labels"

## Clarifications

### Session 2026-07-26

- Q: Qual o estado inicial da barra na primeira visita? → A: Expandida por padrão; depois respeita a preferência salva
- Q: Como a barra deve se comportar em telas estreitas / mobile? → A: Mesmo controle manual de colapso em qualquer largura (sem menu overlay / drawer)
- Q: Qual o escopo da preferência salva? → A: Por usuário logado no navegador (cada login tem sua preferência)
- Q: Clicar fora da barra deve fechar/colapsar? → A: Sim — clicar na área de conteúdo (fora da barra) colapsa para só ícones
- Q: Como exibir indicadores de notificação com a barra colapsada? → A: Manter o contador numérico visível também no modo colapsado

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegar com ícones e rótulos na barra expandida (Priority: P1)

Usuário autenticado vê a barra de navegação lateral expandida, com ícone e rótulo em cada item do menu, e consegue acessar qualquer página permitida como hoje.

**Why this priority**: Sem ícones, o modo colapsado não é utilizável; a barra expandida com ícone + rótulo é a base da feature e preserva a navegação atual.

**Independent Test**: Com a barra expandida, verificar que cada item do menu exibe ícone e rótulo e que o clique navega para a página correta.

**Acceptance Scenarios**:

1. **Given** o usuário está autenticado e a barra lateral está expandida, **When** ele visualiza o menu, **Then** cada item visível exibe um ícone e o rótulo correspondente.
2. **Given** a barra está expandida, **When** o usuário clica em um item do menu, **Then** a aplicação navega para a página associada e o item ativo permanece visualmente destacado.
3. **Given** o usuário tem permissões limitadas, **When** a barra é exibida expandida, **Then** apenas os itens permitidos aparecem, cada um com ícone e rótulo.

---

### User Story 2 - Colapsar a barra para ganhar espaço (Priority: P1)

Usuário colapsa a barra lateral para liberar área de conteúdo; no modo colapsado restam apenas os ícones (sem rótulos de texto ao lado), mantendo a navegação possível.

**Why this priority**: É o valor principal pedido — colapsar a barra e operar só com ícones.

**Independent Test**: Acionar o controle de colapso e confirmar que só ícones permanecem visíveis e que a navegação por clique continua funcionando.

**Acceptance Scenarios**:

1. **Given** a barra está expandida, **When** o usuário aciona o controle de colapsar, **Then** a barra reduz de largura e os rótulos de texto dos itens deixam de aparecer, restando os ícones.
2. **Given** a barra está colapsada, **When** o usuário clica em um ícone do menu, **Then** a aplicação navega para a página correspondente.
3. **Given** a barra está colapsada, **When** o usuário aciona o controle de expandir, **Then** ícones e rótulos voltam a ser exibidos juntos.
4. **Given** a barra está expandida, **When** o usuário clica na área de conteúdo principal (fora da barra), **Then** a barra colapsa para o modo só ícones.
5. **Given** a barra já está colapsada, **When** o usuário clica na área de conteúdo, **Then** a barra permanece colapsada (sem alteração de estado).

---

### User Story 3 - Identificar itens no modo colapsado (Priority: P2)

Com a barra colapsada, o usuário consegue identificar o destino de cada ícone (por exemplo, ao passar o mouse ou focar o item) sem precisar expandir a barra.

**Why this priority**: Melhora usabilidade e acessibilidade no modo só-ícones, sem bloquear o MVP de colapso.

**Independent Test**: Com a barra colapsada, interagir com um ícone (hover/foco) e verificar que o nome do item é revelado de forma clara.

**Acceptance Scenarios**:

1. **Given** a barra está colapsada, **When** o usuário passa o ponteiro ou foca um ícone do menu, **Then** o rótulo do item é apresentado de forma temporária e legível (ex.: dica visual).
2. **Given** a barra está colapsada e um item está ativo, **When** o usuário observa o menu, **Then** o item ativo permanece distinguível dos demais.

---

### User Story 4 - Preferência de colapso lembrada (Priority: P3)

Usuário que colapsa ou expande a barra volta a encontrar o mesmo estado na próxima visita, de forma específica ao usuário logado no mesmo navegador.

**Why this priority**: Conforto; a feature já entrega valor sem persistência, mas lembrar a preferência evita retrabalho.

**Independent Test**: Colapsar a barra, recarregar a página e verificar que o estado colapsado é restaurado para o mesmo usuário.

**Acceptance Scenarios**:

1. **Given** o usuário colapsou a barra, **When** ele recarrega a aplicação estando autenticado com o mesmo usuário, **Then** a barra permanece colapsada.
2. **Given** o usuário expandiu a barra novamente, **When** ele recarrega a aplicação com o mesmo usuário, **Then** a barra permanece expandida.
3. **Given** não há preferência salva para aquele usuário (primeira visita), **When** o usuário acessa a aplicação autenticado, **Then** a barra abre expandida.
4. **Given** o usuário A colapsou a barra neste navegador, **When** o usuário B faz login no mesmo navegador sem preferência própria, **Then** a barra abre no estado padrão de B (expandida), sem herdar o estado de A.

---

### Edge Cases

- Itens com indicador de alerta/notificação (ex.: NFs vencidas, contas atrasadas, férias aguardando) devem exibir o contador numérico também no modo colapsado.
- Em viewports estreitas, o mesmo controle manual de colapso/expansão permanece disponível; não há menu overlay/drawer distinto nesta feature.
- Clicar fora da barra (na área de conteúdo) colapsa a barra quando ela está expandida; não a reabre automaticamente.
- Interações dentro da própria barra (incluindo o controle de expandir/colapsar e itens do menu) não contam como “clique fora”.
- O estado ativo do item atual deve ser reconhecível tanto expandido quanto colapsado.
- Itens administrativos visíveis apenas para `admin` devem receber ícones e participar do mesmo comportamento de colapso.
- Alternar tema claro/escuro não deve quebrar contraste ou legibilidade de ícones e destaques.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A barra de navegação lateral MUST exibir um ícone distintivo para cada item do menu, associado ao respectivo rótulo.
- **FR-002**: Usuários MUST ser capazes de colapsar e expandir a barra lateral por meio de um controle explícito e acessível.
- **FR-003**: No estado expandido, a barra MUST mostrar ícone e rótulo de cada item.
- **FR-004**: No estado colapsado, a barra MUST mostrar apenas os ícones dos itens (sem rótulos de texto ao lado dos ícones).
- **FR-005**: No estado colapsado, o sistema MUST permitir identificar o nome do item ao interagir com o ícone (hover e/ou foco por teclado).
- **FR-006**: A navegação por clique (e ativação por teclado) MUST funcionar igualmente nos estados expandido e colapsado.
- **FR-007**: O destaque do item ativo MUST ser visível nos dois estados.
- **FR-008**: Indicadores de notificação/alerta nos itens do menu MUST permanecer visíveis no modo colapsado com o **mesmo contador numérico** usado no modo expandido (não substituir por ponto/marcador nem ocultar).
- **FR-009**: A preferência de estado (expandido/colapsado) MUST ser lembrada por usuário logado no mesmo navegador (usuários distintos no mesmo browser NÃO compartilham a preferência).
- **FR-010**: Regras de visibilidade por papel/permissão existentes MUST continuar a determinar quais itens aparecem; a feature não altera autorização.
- **FR-011**: A área de conteúdo principal MUST ganhar espaço horizontal quando a barra está colapsada, em relação ao estado expandido.
- **FR-012**: Na primeira visita (sem preferência salva **para aquele usuário**), a barra MUST abrir no estado expandido (ícone + rótulo).
- **FR-013**: O controle e o comportamento de colapso/expansão MUST ser os mesmos em qualquer largura de tela; esta feature NÃO introduz menu overlay/drawer específico para mobile.
- **FR-014**: Com a barra expandida, um clique na área de conteúdo principal (fora da barra lateral) MUST colapsar a barra para o modo só ícones.
- **FR-015**: Com a barra já colapsada, cliques na área de conteúdo NÃO MUST alterar o estado da barra; a expansão ocorre apenas pelo controle explícito.

### Key Entities

- **Item de Menu**: Entrada da navegação lateral com rótulo, destino, ícone, eventual indicador de alerta e restrições de visibilidade.
- **Estado da Barra Lateral**: Preferência expandido/colapsado associada ao usuário logado no navegador, lembrada entre visitas desse usuário.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em até 5 segundos, um usuário autenticado consegue localizar o controle de colapso/expansão e alternar o estado da barra.
- **SC-002**: Com a barra colapsada, 100% dos itens de menu visíveis para o usuário exibem apenas ícone (sem rótulo ao lado) e ainda permitem navegação correta.
- **SC-003**: Com a barra expandida, 100% dos itens de menu visíveis exibem ícone e rótulo.
- **SC-004**: Após colapsar a barra, a área útil do conteúdo principal aumenta de forma perceptível (barra claramente mais estreita que no modo expandido).
- **SC-005**: Em teste com usuários internos, pelo menos 90% identificam corretamente o destino de um ícone colapsado usando a dica de nome (hover/foco), sem expandir a barra.
- **SC-006**: Após recarregar a página, o estado expandido/colapsado escolhido pelo **mesmo usuário** é restaurado em 100% das tentativas no mesmo navegador.
- **SC-007**: Na primeira visita sem preferência salva para aquele usuário, a barra abre expandida em 100% dos casos.
- **SC-008**: Com a barra expandida, clicar na área de conteúdo colapsa a barra em 100% das tentativas; com a barra já colapsada, o mesmo clique não a reabre.
- **SC-009**: Com a barra colapsada, 100% dos itens que teriam contador no modo expandido exibem o mesmo contador numérico (não apenas um ponto).

## Assumptions

- A interpretação de “só os ícones e labels” é: no modo **expandido** aparecem ícones **e** rótulos; no modo **colapsado** ficam **somente os ícones** (rótulos ocultos ao lado, revelados sob demanda via dica).
- Na ausência de preferência salva, o estado padrão é **expandido**.
- O controle de colapso fica na própria barra ou em local adjacente óbvio no layout autenticado.
- Persistência da preferência é local ao navegador e **por usuário logado** (não sincroniza entre dispositivos nem via servidor; não é compartilhada entre logins distintos no mesmo browser).
- Clicar fora da barra (conteúdo principal) é um atalho para **colapsar**; não substitui o controle explícito de expandir.
- Não há redesign completo do layout; o escopo limita-se à barra lateral (ícones + colapso) e ao ajuste de espaço do conteúdo.
- Busca rápida, alertas do topo e demais elementos fora da barra lateral permanecem como estão, salvo ajustes mínimos necessários para o colapso.
- Ícones devem ser semanticamente relacionados ao destino (ex.: dashboard, calendário, NFs) e consistentes visualmente entre si.
- Em telas estreitas aplica-se o mesmo colapso manual do desktop; menu overlay/drawer fica fora do escopo desta feature.
- Posição exata do controle de colapso e detalhes de animação ficam para o planejamento visual, desde que o controle seja explícito e encontrável (SC-001).
