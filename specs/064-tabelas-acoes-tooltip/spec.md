# Feature Specification: Ações de Tabela Só com Tooltip

**Feature Branch**: `064-tabelas-acoes-tooltip`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "tirar os textos do lado do botão de ação nas tabelas e colocar apenas o label ao deixar o mouse em cima (editar, arquivar, confirmar, excluir)"

**Baseline**: Nas listagens em tabela do Ocean App, as ações de linha (por exemplo editar, arquivar, confirmar, excluir) costumam exibir **ícone + texto** visível. Esta feature **remove o texto visível ao lado do ícone** e passa a revelar o nome da ação **somente ao passar o mouse** (tooltip). Ações que hoje são **apenas texto** (sem ícone) **permanecem com texto visível**. O comportamento de cada ação **não muda**.

## Clarifications

### Session 2026-09-14

- Q: Quais ações de linha entram no padrão ícone + tooltip? → A: Todas as ações da coluna de ações da linha que hoje mostram texto permanente **junto a um ícone** (não só Editar/Arquivar/Confirmar/Excluir); incluir correlatas como status, envio, etc., quando já tiverem ícone.
- Q (complemento do usuário): Como alinhar os controles na coluna? → A: Alinhar as ações **horizontalmente** na mesma linha; **não** quebrar linha entre os controles.
- Q: Ação que hoje é só texto (sem ícone)? → A: **Manter o texto visível** (exceção ao padrão ícone + tooltip); não introduzir ícone só para caber no padrão.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver ações mais compactas na tabela (Priority: P1)

O usuário autenticado abre qualquer página com tabela de registros e coluna de ações. Em cada linha, as ações que antes eram **ícone + texto** passam a mostrar **apenas o ícone**. Controles que já eram **só texto** continuam com o texto visível. Todos os controles da coluna ficam **alinhados horizontalmente na mesma linha**, sem quebra de linha. A coluna fica mais limpa onde havia rótulo duplicando o ícone.

**Why this priority**: É o valor principal pedido — despoluir as tabelas removendo rótulos permanentes ao lado dos ícones.

**Independent Test**: Abrir páginas com tabelas (ex.: NFs, Contas, Colaboradores, Bônus, Férias) e verificar que ações ícone+texto perderam o texto permanente; ações só-texto mantêm o rótulo; layout horizontal sem wrap.

**Acceptance Scenarios**:

1. **Given** um administrador em uma listagem com ações ícone + texto, **When** observa a coluna sem interagir, **Then** essas ações aparecem apenas como ícone (sem rótulo textual permanente ao lado).
2. **Given** uma ação de linha que hoje é só texto (sem ícone), **When** observa a coluna sem interagir, **Then** o texto dessa ação permanece visível (não vira ícone nesta entrega).
3. **Given** uma linha com várias ações, **When** observa a coluna sem interagir, **Then** os controles estão alinhados horizontalmente na mesma linha, sem quebra de linha entre eles.
4. **Given** a mesma listagem, **When** compara com o estado anterior, **Then** as mesmas ações da coluna continuam disponíveis na mesma ordem relativa; só o texto ao lado de ícones foi removido.
5. **Given** um visualizador com acesso somente leitura, **When** abre uma listagem, **Then** as ações que ele já podia ver (ou a ausência delas) seguem as regras de permissão vigentes; esta feature não altera permissões.

---

### User Story 2 - Descobrir o nome da ação no hover (Priority: P1)

Ao passar o mouse sobre um **ícone** de ação (que perdeu o texto permanente), o usuário vê um tooltip com o nome da ação em português (ex.: **Editar**, **Arquivar**, **Confirmar**, **Excluir**). Ao tirar o mouse, o tooltip desaparece. O clique no ícone executa a mesma ação de antes. Ações só-texto não dependem de tooltip para identificação, pois o rótulo permanece visível.

**Why this priority**: Sem o texto permanente ao lado do ícone, o tooltip é o meio de reconhecer essas ações sem tentar o clique.

**Independent Test**: Passar o mouse sobre cada ícone de ação em pelo menos duas páginas com tabelas e confirmar o rótulo correto; clicar e confirmar que o fluxo existente permanece; conferir que ações só-texto ainda mostram o texto.

**Acceptance Scenarios**:

1. **Given** o cursor sobre o ícone de editar, **When** o usuário mantém o mouse parado, **Then** aparece o label **Editar** (ou o rótulo já usado para essa ação na tela).
2. **Given** o cursor sobre o ícone de arquivar, **When** o usuário faz hover, **Then** aparece o label **Arquivar**.
3. **Given** o cursor sobre o ícone de confirmar (quando essa ação for ícone + tooltip), **When** o usuário faz hover, **Then** aparece o label **Confirmar**.
4. **Given** o cursor sobre o ícone de excluir, **When** o usuário faz hover, **Then** aparece o label **Excluir**.
5. **Given** o tooltip visível, **When** o usuário clica no ícone, **Then** a ação correspondente ocorre como antes (modal de edição, arquivamento, confirmação de registro, exclusão com confirmação quando já existir, etc.).
6. **Given** o mouse sai do ícone, **When** o hover termina, **Then** o tooltip deixa de ser exibido.
7. **Given** uma ação só-texto na coluna, **When** o usuário observa sem hover, **Then** o nome da ação já está legível no próprio controle.

---

### User Story 3 - Consistência em todas as tabelas com ações de linha (Priority: P2)

O padrão “ícone sem texto permanente + tooltip no hover”, com controles **em linha horizontal sem wrap**, vale para **todas** as listagens em tabela do Ocean App cuja coluna de ações hoje combina ícone com texto. Ações só-texto seguem a mesma regra de exceção em todas as páginas. Não fica uma página removendo texto do ícone e outra mantendo ícone + texto para o mesmo tipo de controle.

**Why this priority**: Consistência de UX em todo o produto (princípio da constitution); evita mistura de padrões.

**Independent Test**: Percorrer as páginas com tabelas e ações de linha e confirmar o mesmo padrão (ícone+tooltip vs. exceção só-texto) e o alinhamento horizontal.

**Acceptance Scenarios**:

1. **Given** duas ou mais páginas com coluna de ações de linha, **When** o usuário compara o padrão, **Then** em todas o texto permanente ao lado de ícones está ausente e o nome dessas ações aparece no hover.
2. **Given** uma ação ícone+texto com nome diferente dos quatro exemplos (ex.: “Desarquivar”, “Reabrir”), **When** o usuário faz hover no ícone, **Then** o tooltip mostra o nome correto, sem texto permanente ao lado.
3. **Given** ações só-texto em páginas diferentes, **When** o usuário as observa, **Then** o texto permanece visível em todas (mesma exceção).

---

### Edge Cases

- Linha com várias ações: controles alinhados na horizontal, **sem quebra de linha**; ícones com tooltip próprio; ações só-texto mantêm rótulo e entram no mesmo alinhamento horizontal.
- Coluna estreita / muitas ações: priorizar manter todos os controles na mesma linha horizontal (sem wrap); o layout não deve empilhar ações em duas linhas na célula.
- Ação que já era só texto (sem ícone): **não** receber ícone novo nesta entrega; texto permanece; tooltip de hover **não** é obrigatório para identificação.
- Ação desabilitada ou oculta por permissão: continua desabilitada/oculta como hoje; se o ícone for visível mas inativo, o tooltip ainda identifica a ação (quando o controle for exibido).
- Dispositivos sem hover prolongado (ex.: toque): ícones permanecem acionáveis pelo toque; o nome da ação deve permanecer acessível por meio equivalente (ex.: nome acessível do controle), sem reintroduzir texto permanente ao lado do ícone; ações só-texto continuam legíveis pelo rótulo.
- Botões de ação **fora** de tabelas (cabeçalho da página, “Novo”, filtros): **fora do escopo** — esta feature altera apenas ações de **linha em tabelas**.
- Confirmações destrutivas (excluir): o diálogo ou confirmação já existente permanece; só muda a apresentação do botão na tabela quando for ícone + texto.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Em listagens tabulares, ações de linha que hoje exibem **ícone + texto** MUST NÃO exibir texto permanente ao lado do ícone.
- **FR-002**: Cada ação de linha reduzida a ícone MUST exibir o nome da ação em tooltip ao passar o mouse (hover), incluindo **Editar**, **Arquivar**, **Confirmar**, **Excluir** e correlatas quando aplicável.
- **FR-003**: O padrão ícone + tooltip MUST aplicar-se a **todas** as ações da coluna que hoje combinam ícone com texto permanente (inclui correlatas como status, envio, etc., quando já tiverem ícone).
- **FR-003a**: Ações de linha que hoje são **apenas texto** (sem ícone) MUST **manter o texto visível**; MUST NÃO introduzir ícone somente para aderir ao padrão nesta entrega.
- **FR-004**: O clique (ou acionamento) de cada ação MUST preservar o comportamento funcional já existente (abertura de formulário/modal, arquivamento, confirmação, exclusão com confirmação, etc.).
- **FR-005**: A ordem e a disponibilidade das ações por papel (`admin` / `visualizador`) MUST permanecer iguais às regras vigentes.
- **FR-006**: O padrão (e a exceção só-texto) MUST ser aplicado de forma consistente em todas as páginas do Ocean App que usam coluna de ações de linha em tabela.
- **FR-007**: Controles de ação que não sejam de linha em tabela (botões de página, filtros, CTAs) MUST permanecer inalterados nesta entrega.
- **FR-008**: Cada controle reduzido a ícone MUST permanecer identificável sem depender apenas da cor (ícone distinto e/ou nome acessível), para que o usuário reconheça a ação mesmo sem ler o tooltip imediatamente.
- **FR-009**: Na célula da coluna de ações, os controles MUST permanecer alinhados **horizontalmente** na mesma linha; MUST NÃO haver quebra de linha entre os controles de ação da mesma linha.

### Key Entities

- **Ação de linha em tabela**: controle associado a um registro da listagem. Pode ser (a) ícone com nome no tooltip, ou (b) controle só-texto com rótulo visível (exceção). Em ambos os casos o comportamento ao acionar permanece o já existente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das ações de linha que antes eram ícone + texto, o texto permanente ao lado do ícone deixa de aparecer; o nome dessas ações aparece no hover.
- **SC-002**: Em 100% dos ícones de ação de linha testados (padrão ícone + tooltip), o hover revela o nome correto da ação em até 1 segundo de permanência do cursor.
- **SC-003**: Em 100% dos acionamentos de teste das ações da coluna, o fluxo pós-clique é o mesmo de antes da mudança (mesmo destino de tela/modal/confirmação).
- **SC-004**: Usuários habituados ao sistema identificam e executam a ação desejada na primeira tentativa após a mudança (ícone/tooltip ou texto visível na exceção), sem treinamento formal.
- **SC-005**: Nenhuma página no escopo mantém o padrão antigo (ícone + texto) misturado ao novo (só ícone + tooltip) para o mesmo tipo de ação que antes tinha ícone e texto.
- **SC-006**: Em 100% das linhas com dois ou mais controles na coluna de ações, os controles permanecem na mesma linha horizontal (sem wrap/quebra de linha na célula).
- **SC-007**: Em 100% das ações que já eram só texto (sem ícone), o rótulo textual permanece visível após a entrega.

## Assumptions

- O escopo cobre **todas** as tabelas do Ocean App com ações de linha no padrão descrito, não apenas uma página isolada — alinhado à consistência de produto.
- Ações ícone + texto entram no padrão tooltip; ações só-texto são exceção explícita (confirmado na clarificação).
- Os quatro nomes citados (editar, arquivar, confirmar, excluir) são exemplos; correlatas com ícone seguem a mesma regra.
- Controles da mesma linha ficam em layout horizontal contínuo, sem quebra de linha.
- Ícones já existentes bastam para o padrão; não se criam ícones novos só para converter ações só-texto.
- Feedbacks existentes (`toast`, confirmação de exclusão, estados de loading) permanecem.
- Não há mudança de dados, permissões, API ou regras de negócio — apenas apresentação das ações na UI.
- Em contextos sem hover, o acionamento por toque no ícone continua válido; o nome da ação fica disponível de forma acessível no controle, sem reexibir texto ao lado do ícone.
