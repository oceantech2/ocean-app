# Feature Specification: Painel do consultor em domínio próprio (consultantpanel)

**Feature Branch**: `099-consultant-panel-dominio`

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: "Proposal deve chamar proposal apenas a aba que o cliente acessa para visualizar a proposta, o restante deve mudar consultantpanel.ocea..."

## Contexto

Hoje tudo fica em `proposal.oceantalentsolutions.com`: a página que o cliente abre para ver e aceitar a proposta (`/p/<código>`) e o painel interno dos consultores (login, lista, nova proposta, detalhe, edição, perfil, convite e entrada vinda do ERP). O nome "Proposal" aparece no cabeçalho e na aba do navegador do painel.

A empresa quer que o endereço e o nome "Proposal" fiquem só para o que o cliente vê. O painel interno passa para `consultantpanel.oceantalentsolutions.com` e se apresenta como "Consultant Panel".

## Clarifications

### Session 2026-10-20

- Q: O pedido é trocar o domínio ou só o nome exibido? → A: Trocar o domínio: o cliente continua em `proposal.oceantalentsolutions.com` e o painel do consultor vai para `consultantpanel.oceantalentsolutions.com`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cliente continua vendo a proposta em "proposal" (Priority: P1)

O cliente recebe o link da proposta, abre em `proposal.oceantalentsolutions.com/p/<código>`, vê a proposta, baixa o PDF e aceita, exatamente como hoje. Nesse domínio não existe mais nada do painel interno.

**Why this priority**: Os links já enviados aos clientes não podem quebrar; é o fluxo que gera receita.

**Independent Test**: Abrir um link de proposta já enviado antes da mudança e um link gerado depois; ambos abrem a página do cliente, o PDF funciona e o aceite é registrado.

**Acceptance Scenarios**:

1. **Given** um link de proposta enviado antes da mudança, **When** o cliente o abre, **Then** a proposta aparece normalmente e pode ser aceita.
2. **Given** uma proposta nova criada no painel, **When** o consultor copia o link do cliente, **Then** o link aponta para `proposal.oceantalentsolutions.com/p/<código>`.
3. **Given** alguém acessa `proposal.oceantalentsolutions.com/` ou qualquer endereço do painel nesse domínio (ex.: `/login`, `/nova`, `/propostas/10`), **When** a página carrega, **Then** é levado ao endereço equivalente em `consultantpanel.oceantalentsolutions.com`.
4. **Given** a página do cliente, **When** exibida, **Then** a aba do navegador mostra o título da proposta (como hoje) e o ícone da Ocean.

---

### User Story 2 - Consultor usa o painel em "consultantpanel" (Priority: P1)

O consultor acessa `consultantpanel.oceantalentsolutions.com`, entra com seu usuário e usa lista, nova proposta, detalhe, edição, modelos e perfil. O cabeçalho e a aba do navegador mostram "Consultant Panel".

**Why this priority**: É a mudança pedida; sem ela o domínio do cliente continua misturado com o painel interno.

**Independent Test**: Entrar no painel pelo novo endereço, criar e editar uma proposta, copiar o link do cliente e sair; conferir o nome "Consultant Panel" no cabeçalho e na aba.

**Acceptance Scenarios**:

1. **Given** o consultor em `consultantpanel.oceantalentsolutions.com`, **When** faz login, **Then** acessa todas as telas do painel com as mesmas permissões de hoje.
2. **Given** o painel, **When** qualquer tela é exibida, **Then** o cabeçalho e o título da aba do navegador dizem "Consultant Panel" e não "Proposal".
3. **Given** o consultor que estava logado no endereço antigo, **When** é levado ao novo endereço, **Then** precisa entrar novamente uma única vez (a sessão antiga não é reaproveitada) e depois segue normalmente.
4. **Given** o ERP Ocean, **When** o usuário clica no atalho de acesso ao painel, **Then** entra direto em `consultantpanel.oceantalentsolutions.com`, sem digitar senha, como hoje.
5. **Given** um convite de acesso enviado a um fornecedor/consultor, **When** ele abre o link do convite, **Then** cria a senha em `consultantpanel.oceantalentsolutions.com`.

---

### User Story 3 - Consultor confere a página do cliente sem marcá-la como vista (Priority: P2)

Do detalhe da proposta, o consultor usa "Abrir página do cliente" para conferir como o cliente verá a proposta. Isso não pode mudar o status para "Visualizada", porque só a abertura pelo cliente conta.

**Why this priority**: Hoje isso funciona porque painel e página do cliente estão no mesmo domínio; com domínios separados, abrir o link do cliente a partir do painel passaria a contar como visualização do cliente.

**Independent Test**: Com uma proposta "Aguardando", abrir a página do cliente pelo painel e conferir que o status continua "Aguardando"; depois abrir o link em uma janela anônima e conferir que muda para "Visualizada".

**Acceptance Scenarios**:

1. **Given** uma proposta "Aguardando", **When** o consultor a abre pelo painel ("Abrir página do cliente"), **Then** vê a página exatamente como o cliente verá e o status continua "Aguardando".
2. **Given** a mesma proposta, **When** o cliente abre o link recebido, **Then** o status passa para "Visualizada", como hoje.
3. **Given** a conferência pelo painel, **When** exibida, **Then** não há botão de aceitar ativo para o consultor (ou fica claro que é uma pré-visualização).

---

### Edge Cases

- **E-mail de aceite (enviado ao consultor)**: o botão "abrir no Proposal" passa a apontar para o detalhe no `consultantpanel`; os links "ver proposta" e "PDF" continuam no `proposal`.
- **Links de entrada vindos do ERP já gerados e não usados**: expiram como hoje; o próximo clique no ERP já gera o link novo.
- **Convites enviados antes da mudança** (apontando para `proposal.../convite`): continuam funcionando, levando ao convite equivalente no `consultantpanel`.
- **Endereços de favoritos antigos** (`proposal.../propostas/10`): levam ao mesmo detalhe no `consultantpanel` (após login, se necessário).
- **Ambiente de desenvolvimento**: o painel e a página do cliente continuam acessíveis localmente com endereços equivalentes aos de produção.
- **Domínio novo ainda sem DNS configurado**: a publicação só é concluída depois que o novo endereço responde; até lá o painel continua no endereço antigo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `proposal.oceantalentsolutions.com` MUST servir apenas a página do cliente (ver, baixar PDF e aceitar a proposta).
- **FR-002**: O painel do consultor (login, lista, nova proposta, detalhe, edição, modelos, perfil, convite e entrada vinda do ERP) MUST ficar em `consultantpanel.oceantalentsolutions.com`.
- **FR-003**: Qualquer endereço do painel acessado em `proposal.oceantalentsolutions.com` MUST levar ao endereço equivalente no `consultantpanel`, preservando o caminho e os parâmetros (inclusive convites e entradas pendentes).
- **FR-004**: O painel MUST se identificar como "Consultant Panel" no cabeçalho e no título da aba do navegador.
- **FR-005**: Links do cliente gerados no painel (copiar link, abrir página do cliente, e-mail de aceite) MUST apontar para `proposal.oceantalentsolutions.com/p/<código>`.
- **FR-006**: O atalho do ERP para o painel e os convites de acesso MUST apontar para o `consultantpanel`.
- **FR-007**: Abrir a página do cliente a partir do painel MUST NOT mudar o status da proposta para "Visualizada".
- **FR-008**: Links de propostas já enviados a clientes MUST continuar funcionando sem alteração.
- **FR-009**: Permissões, sessão e regras do painel MUST permanecer as mesmas; só o endereço e o nome mudam.

### Key Entities

- **Endereço do cliente** (`proposal`): página pública da proposta.
- **Endereço do painel** (`consultantpanel`): área interna autenticada dos consultores.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos links de proposta enviados antes da mudança continuam abrindo a página do cliente.
- **SC-002**: 0 telas do painel acessíveis diretamente em `proposal.oceantalentsolutions.com` (todas levam ao `consultantpanel`).
- **SC-003**: 0 propostas marcadas como "Visualizada" por conferência feita pelo consultor no painel.
- **SC-004**: Um consultor vindo do ERP chega ao painel em 1 clique, sem digitar senha.

## Assumptions

- A Ocean configura o DNS de `consultantpanel.oceantalentsolutions.com` e adiciona o domínio ao projeto de hospedagem do frontend; a liberação do novo endereço no backend (origens permitidas) faz parte da publicação.
- O nome exibido no painel é "Consultant Panel" (em inglês, como o domínio); os textos internos continuam em português.
- A sessão do painel não migra entre os domínios; um novo login após a mudança é aceitável.
- A página do cliente não ganha nem perde funcionalidades nesta feature.
