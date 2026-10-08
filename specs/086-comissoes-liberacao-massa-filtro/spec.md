# Feature Specification: Correção da liberação em massa e filtro por status de liberação em Bônus e Comissão

**Feature Branch**: `086-comissoes-liberacao-massa-filtro`

**Created**: 2026-10-08

**Status**: Draft

**Input**: User description: "temos um problema Liberação em massa na tela de bonus/comissão nao está funcionando. rode todo fluxo do specki para corrigir" + "além disso Filtro para saber o que está com o status \"Liberado\" ou não"

**Baseline**: Na tela **Bônus e Comissão** (abas Bônus e Comissão), o `admin` marca itens por checkbox (linha ou grupo do fornecedor) e uma barra com **Liberar em massa** e **Pagar em massa** aparece **acima do gráfico**, longe da lista. A confirmação usa a caixa de diálogo nativa do navegador. Não existe filtro por status de liberação: os itens liberados e não liberados aparecem misturados, e só dá para distinguir pela coluna "Liberado". Complementa `044`, `048` e `062`.

**Diagnóstico (2026-10-08)**:

- Em produção há 11 comissões não liberadas. A auditoria mostra que **todas** as liberações recentes (05/10) foram feitas **uma a uma**, com segundos de intervalo, e não há nenhuma liberação em massa registrada.
- Nos logs de produção **não existe nenhuma chamada** de liberação em massa: o clique nunca chega ao servidor.
- O usuário relata que, ao clicar em **Liberar em massa**, **nada acontece**: não aparece confirmação nem mensagem.
- O mesmo código, executado localmente, chama a confirmação normalmente. Duas causas de uso real explicam o "nada acontece" sem nenhuma requisição:
  1. **Caixa de diálogo nativa bloqueada**: após várias confirmações nativas seguidas (as liberações uma a uma), o navegador oferece "impedir que esta página crie caixas de diálogo adicionais". Marcada essa opção, toda confirmação nativa passa a ser recusada em silêncio, e a ação morre sem aviso.
  2. **Barra de ações fora de vista**: a barra fica no topo da página, acima do gráfico. Quem marca itens na lista (abaixo do gráfico) não a vê, ou ela fica sob o cabeçalho fixo de título/filtros.
- Agravante: a seleção inclui itens já liberados, e o retorno "0 liberado(s), N ignorado(s)" não explica o motivo.

## Clarifications

### Session 2026-10-08

- Q: O que acontece ao clicar em "Liberar em massa" em produção? → A: **Nada acontece** (sem confirmação, sem mensagem)
- Q: Quais opções o filtro de status deve oferecer? → A: **Todos**, **Liberados** e **Não liberados** (pedido: "saber o que está com o status Liberado ou não"); padrão **Todos**

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Liberar comissões/bônus em massa com confiabilidade (Priority: P1)

Como `admin`, na tela Bônus e Comissão, marco vários itens (de um ou mais fornecedores), clico em **Liberar em massa**, vejo uma confirmação **dentro do sistema** com quantos itens e qual valor serão liberados, confirmo, e todos os itens elegíveis passam a "Liberado", com uma mensagem clara do resultado.

**Why this priority**: É o defeito reportado; hoje o financeiro libera item a item, o que é lento e propenso a erro.

**Independent Test**: Marcar 3 itens não liberados de fornecedores diferentes, clicar em Liberar em massa, confirmar na janela do sistema; os 3 passam a "Liberado", a auditoria registra 3 liberações e aparece a mensagem "3 liberado(s)".

**Acceptance Scenarios**:

1. **Given** o `admin` com 1 ou mais itens marcados, **When** ele observa a tela em qualquer posição de rolagem, **Then** a barra de ações em massa fica **sempre visível** (sem ficar escondida sob o cabeçalho fixo nem fora da tela)
2. **Given** itens marcados com ao menos 1 não liberado, **When** o `admin` clica em **Liberar em massa**, **Then** abre uma confirmação **do próprio sistema** (não a caixa nativa do navegador) mostrando a quantidade e o valor total dos itens que serão liberados
3. **Given** a confirmação aberta, **When** o `admin` confirma, **Then** todos os itens elegíveis passam a "Liberado" com a data de hoje, a lista recarrega, a seleção é limpa e aparece a mensagem "N liberado(s)"
4. **Given** a confirmação aberta, **When** o `admin` cancela (botão, Esc ou clique fora), **Then** nada é alterado e a seleção é mantida
5. **Given** uma seleção que mistura itens liberados e não liberados, **When** o `admin` vê a barra, **Then** ela informa quantos estão elegíveis para liberar, e apenas esses são enviados
6. **Given** uma seleção em que todos os itens já estão liberados, **When** o `admin` vê a barra, **Then** **Liberar em massa** fica desabilitado, com a indicação "nenhum item a liberar"
7. **Given** a liberação em processamento, **When** o `admin` tenta clicar de novo, **Then** os botões ficam desabilitados até o fim (sem envio duplicado)
8. **Given** falha de comunicação ou de permissão, **When** a liberação termina, **Then** aparece uma mensagem de erro clara e nenhum item é marcado indevidamente

---

### User Story 2 - Filtrar por status de liberação (Priority: P1)

Como usuário autenticado (`admin` ou `visualizador`), na barra de filtros da tela Bônus e Comissão escolho **Status: Todos / Liberados / Não liberados** e a lista mostra só os itens daquele status, para saber rapidamente o que falta liberar.

**Why this priority**: Pedido explícito; combinado à US1, permite filtrar "Não liberados", marcar tudo e liberar de uma vez.

**Independent Test**: Com itens liberados e não liberados no período, escolher "Não liberados": só aparecem itens com "Liberado" vazio; escolher "Liberados": só aparecem itens liberados; "Todos" restaura a lista completa.

**Acceptance Scenarios**:

1. **Given** a barra de filtros, **When** o usuário a observa, **Then** existe o filtro **Status** com as opções Todos (padrão), Liberados e Não liberados
2. **Given** "Não liberados" selecionado, **When** a lista é exibida, **Then** só aparecem itens não liberados, agrupados por fornecedor; fornecedores sem itens nesse status não aparecem
3. **Given** "Liberados" selecionado, **When** a lista é exibida, **Then** só aparecem itens liberados (pagos ou não)
4. **Given** um status selecionado, **When** o usuário troca de aba (Bônus ↔ Comissão), fornecedor, ano ou recorte, **Then** o filtro de status continua aplicado
5. **Given** um status selecionado, **When** o usuário lê o total do título, os totais por fornecedor e exporta o CSV, **Then** eles refletem apenas os itens exibidos
6. **Given** itens marcados, **When** o usuário troca o filtro de status, **Then** a seleção é limpa (não se age sobre itens fora de vista)
7. **Given** nenhum item no status escolhido, **When** a lista é exibida, **Then** aparece uma mensagem de lista vazia que cita o filtro (ex.: "Nenhuma comissão não liberada encontrada")

---

### User Story 3 - Selecionar todos os itens exibidos (Priority: P2)

Como `admin`, marco de uma vez **todos os itens exibidos** (todos os fornecedores da página atual), para liberar o período inteiro sem marcar fornecedor por fornecedor.

**Why this priority**: Facilita o fluxo principal (filtrar "Não liberados" → marcar tudo → liberar), mas a liberação já funciona marcando por grupo.

**Independent Test**: Com "Não liberados" filtrado e 3 fornecedores na página, marcar "Selecionar todos exibidos": todos os itens dos 3 grupos ficam marcados e a barra mostra o total correto.

**Acceptance Scenarios**:

1. **Given** o `admin` com a lista carregada, **When** ele marca "Selecionar todos exibidos", **Then** todos os itens dos fornecedores da página atual ficam marcados
2. **Given** todos os exibidos marcados, **When** ele desmarca o controle, **Then** a seleção é limpa
3. **Given** o `visualizador`, **When** ele vê a tela, **Then** não há checkboxes nem barra de ações em massa (somente leitura)

---

### Edge Cases

- Itens de conta a receber cancelada continuam visíveis e seguem as mesmas regras de liberação da ação individual; ficam fora dos totais como hoje
- Item liberado por outra pessoa entre a seleção e a confirmação: o servidor o ignora e a mensagem informa "N liberado(s), M ignorado(s) (já liberados)"
- Pagar em massa usa a mesma barra e a mesma confirmação do sistema; só itens liberados e não pagos são elegíveis
- Troca de página da paginação limpa a seleção (comportamento atual mantido)
- Telas estreitas: a barra de ações não cobre o último item da lista de forma permanente (há espaço ao final da lista)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Com 1 ou mais itens marcados, a barra de ações em massa DEVE permanecer visível em qualquer posição de rolagem, acima do conteúdo e abaixo de janelas modais
- **FR-002**: As ações **Liberar em massa** e **Pagar em massa** DEVEM pedir confirmação por uma janela do próprio sistema, nunca pela caixa de diálogo nativa do navegador
- **FR-003**: A confirmação DEVE exibir a ação, a quantidade de itens elegíveis e o valor total desses itens
- **FR-004**: Apenas itens elegíveis DEVEM ser enviados: para liberar, itens não liberados; para pagar, itens liberados e não pagos
- **FR-005**: A barra DEVE mostrar a quantidade selecionada e a quantidade elegível para cada ação; a ação sem itens elegíveis DEVE ficar desabilitada
- **FR-006**: Durante o processamento, as ações em massa DEVEM ficar desabilitadas; ao terminar, a lista DEVE recarregar e a seleção ser limpa
- **FR-007**: O resultado DEVE ser comunicado com mensagem de sucesso (quantidade processada e, se houver, ignorada e o motivo) ou de erro
- **FR-008**: Cada item liberado em massa DEVE gerar registro de auditoria igual ao da liberação individual (regra existente mantida)
- **FR-009**: A barra de filtros DEVE ter o filtro **Status** com Todos (padrão), Liberados e Não liberados, disponível para `admin` e `visualizador`
- **FR-010**: O filtro de status DEVE se aplicar à lista, aos totais do título e por fornecedor e à exportação CSV, nas duas abas
- **FR-011**: Trocar o filtro de status DEVE limpar a seleção e voltar para a primeira página
- **FR-012**: A lista vazia DEVE informar que não há itens no status escolhido
- **FR-013**: O `admin` DEVE poder selecionar/deselecionar de uma vez todos os itens exibidos na página atual
- **FR-014**: O `visualizador` NÃO DEVE ver checkboxes nem ações em massa (regra existente mantida)
- **FR-015**: O gráfico anual de evolução NÃO DEVE mudar com o filtro de status (continua mostrando todos os itens do ano)
- **FR-016**: Ações individuais (Liberar, Pagar, Editar) por linha e o comportamento do servidor NÃO DEVEM mudar

### Key Entities

- **Item de remuneração (bônus ou comissão)**: valor, fornecedor, mês/ano, status Liberado (sim/não, com data) e Pago (sim/não, com data); só pode ser pago depois de liberado
- **Seleção em massa**: conjunto de itens marcados pelo `admin` na página atual; dele derivam os elegíveis para liberar e os elegíveis para pagar
- **Filtro de status de liberação**: Todos, Liberados ou Não liberados; aplicado sobre os demais filtros (fornecedor, ano, recorte, aba)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes, clicar em Liberar em massa com itens elegíveis abre a confirmação do sistema, mesmo com as caixas de diálogo nativas bloqueadas no navegador
- **SC-002**: O `admin` libera 10 itens de um período em menos de 30 segundos (filtrar "Não liberados" → selecionar todos → liberar → confirmar), contra minutos item a item
- **SC-003**: Em 100% das liberações em massa, a quantidade de itens que passam a "Liberado" é igual à informada na confirmação (salvo itens alterados por terceiros, informados como ignorados)
- **SC-004**: Com o filtro "Não liberados", 100% dos itens exibidos estão não liberados; com "Liberados", 100% estão liberados
- **SC-005**: O usuário identifica em menos de 10 segundos o que falta liberar no período, sem conferir linha a linha

## Assumptions

- A regra do servidor para liberar/pagar em massa está correta e não muda; a correção é na tela (visibilidade da barra, confirmação e elegibilidade)
- O filtro de status é aplicado sobre os itens já carregados do ano; não exige mudança no servidor
- O filtro de status não é persistido entre sessões; vale enquanto a tela estiver aberta (padrão "Todos" ao reabrir)
- Os totais do título e por fornecedor seguem o que está exibido, como já ocorre com os filtros de fornecedor e recorte
- "Liberados" inclui os já pagos (pagar exige liberar antes)
- As confirmações nativas das ações individuais por linha ficam como estão (fora do escopo pedido)
