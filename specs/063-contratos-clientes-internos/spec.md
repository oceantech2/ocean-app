# Feature Specification: Renomear Atalhos da Página Contratos

**Feature Branch**: `063-contratos-clientes-internos`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "em contratos renomear o de cima “Contratos Clientes” de baixo “Contratos Internos”"

**Baseline**: A página Contratos já existe e exibe exatamente dois atalhos para pastas externas, nesta ordem visual: o de cima e o de baixo. Esta feature **apenas substitui os rótulos** desses atalhos. Destinos, quantidade de atalhos, título da página, item de menu, permissões e visibilidade **não mudam**.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Identificar os atalhos pelos novos nomes (Priority: P1)

O usuário autenticado com acesso a Contratos abre a página e reconhece, de imediato, dois atalhos na mesma ordem de sempre: o de cima como **Contratos Clientes** e o de baixo como **Contratos Internos**. Os nomes antigos (**Contratos ativos** e **Contratos arquivados**) não aparecem mais nessa tela.

**Why this priority**: É o único valor desta entrega — alinhar a nomenclatura da tela ao uso real das pastas (clientes vs. internos).

**Independent Test**: Abrir Contratos e conferir os dois rótulos na ordem de cima para baixo; confirmar que os nomes antigos não estão visíveis.

**Acceptance Scenarios**:

1. **Given** um administrador autenticado na página Contratos, **When** observa os atalhos, **Then** o atalho de cima exibe exatamente **Contratos Clientes** e o de baixo exatamente **Contratos Internos**.
2. **Given** um visualizador com permissão à página Contratos, **When** abre a mesma tela, **Then** vê os mesmos dois rótulos, na mesma ordem (não há diferença de nomenclatura por papel).
3. **Given** a página Contratos aberta, **When** o usuário procura os textos **Contratos ativos** ou **Contratos arquivados**, **Then** esses rótulos **não** aparecem na página.
4. **Given** a página Contratos aberta, **When** o usuário observa o restante da tela, **Then** o título da página e o item de menu continuam **Contratos** (esta entrega não os altera).

---

### User Story 2 - Abrir as mesmas pastas com os novos nomes (Priority: P1)

Ao acionar cada atalho, o usuário chega ao mesmo destino de sempre: o de cima continua levando à pasta que antes se chamava Contratos ativos; o de baixo, à pasta que antes se chamava Contratos arquivados. Só o texto visível muda.

**Why this priority**: A troca de nome não pode quebrar o acesso já conhecido às pastas.

**Independent Test**: Acionar o atalho de cima e o de baixo e confirmar que cada um abre o mesmo destino anterior, em nova aba, sem sair da sessão do Ocean App.

**Acceptance Scenarios**:

1. **Given** o atalho **Contratos Clientes** (o de cima), **When** o usuário o aciona, **Then** abre em nova aba o mesmo destino que o atalho de cima já abria antes desta mudança.
2. **Given** o atalho **Contratos Internos** (o de baixo), **When** o usuário o aciona, **Then** abre em nova aba o mesmo destino que o atalho de baixo já abria antes desta mudança.
3. **Given** o usuário acionou um atalho, **When** a nova aba abre, **Then** a aba do Ocean App permanece na página Contratos.

---

### Edge Cases

- Usuário sem sessão no serviço de pastas externas: o destino pode pedir login; isso já ocorre hoje e permanece fora do escopo do Ocean App.
- Usuário sem permissão na pasta de destino: o serviço externo exibe o próprio aviso; o Ocean App não altera esse comportamento.
- Página oculta ou visualizador sem permissão: o acesso a Contratos segue as regras já vigentes; esta feature não muda visibilidade nem permissões.
- Texto de apoio da página (instrução breve para abrir a pasta): permanece; só os rótulos dos dois atalhos mudam.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A página Contratos MUST exibir o atalho de cima com o rótulo **Contratos Clientes**.
- **FR-002**: A página Contratos MUST exibir o atalho de baixo com o rótulo **Contratos Internos**.
- **FR-003**: A página Contratos MUST NÃO exibir os rótulos **Contratos ativos** nem **Contratos arquivados**.
- **FR-004**: A ordem visual MUST permanecer a mesma: **Contratos Clientes** acima de **Contratos Internos**.
- **FR-005**: Os destinos dos dois atalhos MUST permanecer os mesmos de antes desta mudança; apenas o texto visível é alterado.
- **FR-006**: Título da página, item de menu, catálogo de visibilidade, permissões e quantidade de atalhos MUST permanecer inalterados nesta entrega.

### Key Entities

- **Atalho de pasta de contratos**: referência externa já existente na página Contratos, composta por rótulo de exibição e destino fixo. Nesta feature, apenas o rótulo muda: o de cima passa a **Contratos Clientes** e o de baixo a **Contratos Internos**.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das aberturas da página Contratos por usuários com acesso, o atalho de cima aparece como **Contratos Clientes** e o de baixo como **Contratos Internos**.
- **SC-002**: Em 100% dos testes, acionar cada atalho abre o mesmo destino de antes da mudança, em nova aba, sem substituir a aba do Ocean App.
- **SC-003**: Usuários com acesso identificam o atalho correto na primeira visita após a mudança, sem treinamento adicional (os novos nomes descrevem o tipo de contrato).
- **SC-004**: Nenhum outro texto da página, menu ou configurações passa a usar os nomes antigos **Contratos ativos** / **Contratos arquivados** após a entrega.

## Assumptions

- A ordem “de cima” e “de baixo” é a ordem visual atual dos dois atalhos na página Contratos.
- Os destinos das pastas não mudam; só a nomenclatura visível no Ocean App.
- O título da página e o item de menu continuam **Contratos**.
- Não há cadastro interno de contratos nesta página; continuam existindo apenas os dois atalhos.
- Papéis `admin` e `visualizador` (com permissão) veem os mesmos rótulos.
- Não há outros pontos do produto que listem os nomes antigos dos atalhos; se existirem, devem seguir os novos nomes apenas se estiverem visíveis ao usuário na página Contratos (escopo fechado nesta tela).
