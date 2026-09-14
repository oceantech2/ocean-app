# Feature Specification: Consistência de rótulos Bônus e Comissão

**Feature Branch**: `069-consistencia-rotulos-bonus`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "Após várias features no mesmo dia, o menu e a página já dizem Bônus e Comissão, mas em outros lugares (Dashboard, Auditoria, legado de Contas a Pagar) ainda aparece só Comissões — o usuário interpreta como se a rename tivesse revertido. Unificar os rótulos visíveis que ainda conflitam, sem misturar com a subcategoria RH Bônus nem com a coluna Comissão (singular) da Conta a receber."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dashboard alinhado ao nome da sessão (Priority: P1)

O usuário autenticado, ao olhar despesas/categorias no Dashboard, deixa de ver o rótulo isolado **Comissões** para o centro que representa a sessão de remuneração variável. Passa a ver **Bônus e Comissão**, o mesmo nome do menu e do título da página `/comissoes`.

**Why this priority**: É o lugar onde o usuário mais notou “voltou Comissões” e perdeu confiança de que a feature persistiu.

**Independent Test**: Abrir o Dashboard com dados de categoria `bonus`/`BONUS` e confirmar o texto **Bônus e Comissão** (não só **Comissões**).

**Acceptance Scenarios**:

1. **Given** um usuário autenticado no Dashboard, **When** visualiza o rótulo da categoria que corresponde à sessão de bônus/comissão, **Then** lê **Bônus e Comissão**.
2. **Given** o mesmo usuário, **When** compara menu lateral e Dashboard, **Then** o nome da sessão e o rótulo da categoria coincidem (**Bônus e Comissão**).
3. **Given** papéis `admin` e `visualizador`, **When** cada um abre o Dashboard, **Then** ambos veem o mesmo rótulo.

---

### User Story 2 - Auditoria usa o mesmo vocabulário (Priority: P2)

Na Auditoria, o filtro/entidade que hoje aparece como **Comissão** (referindo-se aos registros da sessão de bônus/comissão) passa a exibir **Bônus e Comissão**, alinhado ao produto.

**Why this priority**: Evita segunda fonte de “nome antigo” após corrigir o Dashboard.

**Independent Test**: Abrir Auditoria, localizar o filtro/opção da entidade Bonus e confirmar o rótulo **Bônus e Comissão**.

**Acceptance Scenarios**:

1. **Given** um usuário com acesso à Auditoria, **When** consulta as opções de entidade/filtro, **Then** vê **Bônus e Comissão** no lugar do rótulo isolado **Comissão** para essa entidade.
2. **Given** um log já existente dessa entidade, **When** o usuário filtra por ela, **Then** a filtragem continua funcionando com o novo rótulo (apenas texto de interface muda).

---

### User Story 3 - Legado de Contas a Pagar não confunde com a sessão (Priority: P3)

Na Contas a Pagar, o rótulo legado da subcategoria antiga `bonus` deixa de dizer só **Comissões (legado)** e passa a **Bônus e Comissão (legado)**, para não sugerir que a página do menu “voltou” ao nome antigo. A subcategoria RH oficial **Bônus** e a subcategoria **Comissão** (singular) permanecem distintas.

**Why this priority**: É texto residual; menos frequente que Dashboard, mas reforça a mesma confusão.

**Independent Test**: Na listagem/filtro de Contas a Pagar, localizar conta com classificação legado `bonus` e confirmar **Bônus e Comissão (legado)**.

**Acceptance Scenarios**:

1. **Given** uma conta a pagar com classificação legado `bonus`, **When** o usuário lê o rótulo na listagem ou filtro, **Then** vê **Bônus e Comissão (legado)**.
2. **Given** o catálogo RH atual, **When** o usuário escolhe subcategorias, **Then** continua vendo **Bônus** e **Comissão** como opções distintas (esta feature não as funde nem as renomeia).

---

### Edge Cases

- Bloco de linhas **Comissões** dentro da Conta a receber (formatação de percentual sobre o líquido) permanece com esse nome de bloco — é o conceito operacional da aba Comissão, não o nome da sessão do menu.
- Gráfico “Evolução de Comissões por Mês” **dentro da aba Comissão** pode continuar falando **Comissões** no contexto da aba; o título da página e o menu permanecem **Bônus e Comissão**.
- URLs (`/comissoes`), chaves internas (`bonus`) e códigos de categoria **não** mudam — só rótulos visíveis listados nesta spec.
- Subcategoria RH **Bônus** (Contas a Pagar) e sessão **Bônus e Comissão** (menu) continuam coexistindo com sentidos diferentes (despesa RH vs página de remuneração).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O Dashboard MUST exibir **Bônus e Comissão** como rótulo da categoria/centro que hoje aparece como **Comissões** para `bonus`/`BONUS`.
- **FR-002**: A Auditoria MUST exibir **Bônus e Comissão** no lugar do rótulo de interface **Comissão** associado à entidade de bônus/comissão da sessão.
- **FR-003**: Contas a Pagar MUST exibir **Bônus e Comissão (legado)** no lugar de **Comissões (legado)** para a classificação legado `bonus`.
- **FR-004**: A feature MUST NOT alterar o nome do menu/página já definido como **Bônus e Comissão**, nem a subcategoria RH **Bônus**, nem a subcategoria **Comissão** (singular).
- **FR-005**: A feature MUST NOT alterar URLs, chaves de catálogo, códigos de categoria nem comportamento de cálculo — apenas textos de interface listados.
- **FR-006**: Admin e visualizador MUST ver os mesmos rótulos atualizados.

### Key Entities

- **Sessão Bônus e Comissão**: página do produto acessível pelo menu (path estável `/comissoes`).
- **Categoria Dashboard `bonus`**: fatia de despesa/resultado que o usuário associa a essa sessão.
- **Classificação legado `bonus`**: contas a pagar antigas ainda rotuladas pelo código legado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em uma revisão guiada (menu → página → Dashboard → Auditoria → Contas legado), 100% desses pontos usam **Bônus e Comissão** (com sufixo “legado” só no legado), sem o rótulo isolado **Comissões** nesses pontos.
- **SC-002**: Um usuário que já viu o rename da página consegue confirmar em menos de 1 minuto que o Dashboard não “voltou” ao nome antigo.
- **SC-003**: Nenhuma regressão funcional: filtros, listagens e totais continuam corretos após a troca só de texto (verificado em smoke dos fluxos Dashboard, Auditoria e Contas a Pagar).

## Assumptions

- Menu, título da página e catálogo de visibilidade **já** estão como **Bônus e Comissão** no working tree; esta feature só fecha os resíduos que geram falsa impressão de revert.
- A subcategoria RH **Bônus** (feature de Contas a Pagar) permanece **Bônus** — não vira “Bônus e Comissão”.
- O bloco **Comissões** no formulário da Conta a receber permanece — é o bloco da aba Comissão.
- Nada desta entrega exige migração de dados nem alteração de API.
- Escopo **não** inclui reimplementar abas, sync de bônus, tooltips, férias, contratos nem edição em massa de datas.
