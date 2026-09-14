# Feature Specification: Ajuste de Modais no Viewport

**Feature Branch**: `072-ajuste-modais-viewport`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "ajuste as modais elas ficam batendo na borda superior e inferior esta muito feio"

## Clarifications

### Session 2026-09-14

- Q: Escopo das superfícies a ajustar → A: Todas as modais do padrão (fundo escurecido + painel central) em todo o produto
- Q: Como rolar conteúdo longo → A: Cabeçalho e botões de ação ficam fixos; só o miolo do formulário rola
- Q: Margem mínima em relação às bordas → A: Margem confortável padrão (~24px / ~1,5rem) em cima e embaixo

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Modal com margem confortável na tela (Priority: P1)

Como usuário (admin ou visualizador), ao abrir qualquer modal do sistema, quero ver o painel centralizado com espaço visível em relação às bordas superior e inferior da tela, para que a interface não pareça “colada” ou cortada.

**Why this priority**: É o problema principal reportado — impacto visual imediato em praticamente todas as telas de cadastro e edição.

**Independent Test**: Abrir um modal de conteúdo curto e um de conteúdo médio em uma janela de altura típica de notebook; verificar que há margem clara em cima e embaixo e que o painel não toca as bordas da janela.

**Acceptance Scenarios**:

1. **Given** o usuário está em qualquer página com ação que abre modal, **When** abre um modal cujo conteúdo cabe na tela, **Then** o painel aparece centralizado e com pelo menos ~24px (~1,5rem) de margem em relação às bordas superior e inferior da janela
2. **Given** o usuário abre um modal, **When** observa as bordas do painel, **Then** o painel não encosta nem é cortado pelas bordas superior ou inferior da área visível
3. **Given** o usuário redimensiona a altura da janela para um tamanho ainda utilizável, **When** o modal permanece aberto, **Then** as margens superior e inferior de pelo menos ~24px continuam presentes e o painel permanece utilizável

---

### User Story 2 - Modal com conteúdo longo permanece usável (Priority: P1)

Como usuário, ao abrir um modal com formulário ou lista longa, quero conseguir ver e rolar o conteúdo sem que o painel ultrapasse ou bata nas bordas da tela, com o título (cabeçalho) e os botões de ação sempre visíveis enquanto o miolo do formulário rola.

**Why this priority**: Várias telas (contas, NFs, patrimônio, etc.) têm modais densos; sem limite de altura com rolagem, o problema das bordas se agrava.

**Independent Test**: Abrir um modal conhecido por ter muitos campos (ex.: contas a pagar/receber) em altura de notebook; confirmar que o painel cabe na área visível com margem, que o cabeçalho e as ações permanecem visíveis sem rolar, e que o miolo pode ser rolado até o fim.

**Acceptance Scenarios**:

1. **Given** um modal cujo conteúdo é mais alto que a área útil da tela, **When** o usuário o abre, **Then** o painel respeita a área visível com margem superior e inferior e o excesso de conteúdo do miolo fica acessível por rolagem interna
2. **Given** o conteúdo longo do modal, **When** o usuário rola o miolo até o final do formulário, **Then** consegue alcançar todos os campos; o cabeçalho e os botões de ação permanecem visíveis (não sobem/descem com o miolo)
3. **Given** o modal aberto com rolagem do miolo, **When** o usuário interage com o fundo escurecido ou fecha o modal pelos controles existentes, **Then** o comportamento de fechar/cancelar permanece o mesmo de hoje

---

### User Story 3 - Consistência visual entre páginas (Priority: P2)

Como usuário, quero que as modais de diferentes páginas do Ocean App tenham o mesmo comportamento de enquadramento na tela, para não haver sensação de “umas cabem bem e outras batem na borda”.

**Why this priority**: Consolida a correção em todo o produto; evita regressão parcial em só algumas telas.

**Independent Test**: Abrir modais em pelo menos três módulos distintos (ex.: Contas, Férias, Fluxo de Caixa) e comparar visualmente margens e rolagem.

**Acceptance Scenarios**:

1. **Given** o usuário navega por páginas que usam modal, **When** abre qualquer modal do padrão (fundo escurecido + painel central) em módulos diferentes, **Then** todas respeitam margem superior/inferior e limite de altura com rolagem quando necessário
2. **Given** um modal que já tinha rolagem e margens adequadas, **When** a correção é aplicada, **Then** o comportamento permanece aceitável (sem regressão visual óbvia)

---

### Edge Cases

- Janela com altura reduzida (ex.: notebook com zoom alto ou tela dividida): o modal deve continuar com margem mínima de ~24px e rolagem do miolo, sem cortar o topo/rodapé do painel fora da tela; cabeçalho e ações permanecem visíveis
- Modal com pouco conteúdo: deve permanecer centralizado, sem “esticar” artificialmente até as bordas; sem barra de rolagem desnecessária no miolo
- Modal com conteúdo dinâmico que cresce após abertura (mensagens de erro, seções extras): ao crescer, deve passar a respeitar o limite de altura e ativar rolagem do miolo, sem invadir as bordas
- Sobreposição com outros elementos fixos da interface (barra superior, toasts): o painel do modal não deve ficar visualmente colado nas bordas da janela por causa desses elementos
- Telas largas vs. estreitas: o ajuste de margem vertical não deve quebrar o enquadramento horizontal já existente (largura máxima e margem lateral)
- Modal sem estrutura clara de cabeçalho/rodapé: as ações principais ainda devem permanecer alcançáveis dentro da área útil (não sumir fora da tela)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exibir painéis de modal com margem mínima de aproximadamente 24px (~1,5rem) em relação às bordas superior e inferior da área útil da janela, de forma que o painel não encoste nem seja cortado por essas bordas
- **FR-002**: Quando o conteúdo do modal exceder a altura disponível (já descontadas as margens de ~24px), o sistema MUST permitir rolagem apenas do miolo (corpo) do formulário/lista, mantendo o cabeçalho e os botões de ação fixos e visíveis dentro do painel
- **FR-003**: O ajuste MUST se aplicar a **todas** as modais do padrão (fundo escurecido + painel central) em todo o produto — cadastro, edição, importação, documentos e equivalentes — de forma consistente; overlays menores fora desse padrão (ex.: menus/dropdowns) ficam fora do escopo
- **FR-004**: O sistema MUST preservar o comportamento funcional atual das modais (abrir, fechar, salvar, cancelar, confirmações e validação de campos), alterando apenas o enquadramento visual e a rolagem do miolo quando necessário
- **FR-005**: Em viewports de altura reduzida ainda utilizáveis, o usuário MUST conseguir concluir a tarefa do modal (ler conteúdo e acionar ações principais) sem partes essenciais ficarem inacessíveis fora da tela
- **FR-006**: Modais de conteúdo curto MUST permanecer centralizados verticalmente, com margem em cima e embaixo, sem colar nas bordas
- **FR-007**: Em modais cujo layout já distingue título/ações do corpo, o sistema MUST manter título e ações sempre visíveis durante a rolagem do miolo; em modais sem essa distinção estrutural, o mínimo aceitável é garantir que as ações principais permaneçam alcançáveis sem sair da área útil
### Key Entities

- **Modal / painel sobreposto**: janela flutuante sobre a página (cadastro, edição, importação, documentos, confirmações densas) que hoje aparece centralizada sobre fundo escurecido
- **Área útil da janela**: região visível da tela na qual o painel deve caber, incluindo margem de respiro superior e inferior

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das modais do padrão do produto verificadas em checklist de UA, o painel mantém pelo menos ~24px de margem em relação ao topo e ao rodapé da janela (não encosta nas bordas)
- **SC-002**: Em modais com conteúdo longo, 100% dos campos do miolo permanecem alcançáveis via rolagem interna e as ações principais (salvar/cancelar ou equivalentes) permanecem visíveis sem exigir rolagem do painel inteiro
- **SC-003**: Em uma amostragem de pelo menos 5 páginas distintas que usam modal, um revisor visual classifica o enquadramento como “aceitável / sem colar nas bordas” em todas as amostras
- **SC-004**: Não há regressão funcional reportada nos fluxos de abrir/fechar/salvar das modais amostradas após o ajuste (taxa de falha de tarefa atribuída ao layout = 0 nos testes manuais do checklist)

## Assumptions

- O problema reportado é de apresentação (margem e altura na tela), não de lógica de negócio dos formulários
- O escopo cobre **todas** as modais do padrão já usado no Ocean App (fundo escurecido + painel central); overlays menores (menus, dropdowns, painéis de notificação) e diálogos nativos do navegador (`confirm`/`alert`) ficam fora do escopo
- Margem vertical confortável = aproximadamente 24px (~1,5rem) em cima e embaixo — sem redesenhar tipografia, cores ou estrutura dos formulários
- Em conteúdo longo, cabeçalho e ações ficam fixos; apenas o miolo rola
- Telas muito pequenas (altura extrema de celular) não são o foco principal; o mínimo é respeitar a margem, não cortar o painel e manter rolagem do miolo
- Papéis `admin` e `visualizador` continuam com as mesmas permissões; esta feature não altera regras de acesso
- Não há mudança de dados, APIs ou persistência
