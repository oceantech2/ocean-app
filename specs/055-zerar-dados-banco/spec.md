# Feature Specification: Zerar Dados do Banco (Preservar Login e Fornecedores)

**Feature Branch**: `055-zerar-dados-banco`

**Created**: 2026-09-07

**Status**: Draft

**Input**: User description: "preciso zerar todos os dados do banco da ocean menos a parte de fornecedores e login claro, o resto pode zerar todos os dados"

## Clarifications

### Session 2026-09-07

- Q: Como a limpeza deve ser disponibilizada? → A: Operação pontual controlada (procedimento/comando administrativo), sem tela permanente no app
- Q: O que fazer com cadastros estruturais (categorias, contas correntes, config de páginas)? → A: Zerar também categorias, contas correntes e config de páginas — manter só login e fornecedores
- Q: Depois de zerar a estrutura, o que deve ficar no lugar? → A: Deixar vazio (sem reseeding): após a limpeza, só login + fornecedores
- Q: Se a limpeza falhar no meio, qual comportamento esperado? → A: Tudo ou nada: se falhar, nada do escopo fica parcialmente aplicado (estado anterior preservado)
- Q: Backup antes da limpeza é obrigatório no procedimento? → A: Fora do procedimento: backup é responsabilidade do operador antes de executar; a feature não exige nem cria backup

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Limpar dados operacionais preservando acesso e fornecedores (Priority: P1)

Um operador autorizado precisa deixar o Ocean App com base limpa de dados financeiros e operacionais, sem perder o cadastro de fornecedores nem a capacidade de entrar no sistema com os usuários existentes, por meio de uma operação pontual (não há tela permanente no produto).

**Why this priority**: Sem esta limpeza controlada, o sistema permanece com histórico financeiro/operacional indesejado; preservar login e fornecedores evita retrabalho de cadastro e perda de acesso.

**Independent Test**: Com base populada (login, fornecedores, NFs, contas, categorias, contas correntes, etc.), executar o procedimento/comando de zerar; verificar que login e fornecedores permanecem e que todo o restante (incluindo estrutura) fica vazio.

**Acceptance Scenarios**:

1. **Given** o sistema possui usuários de login e fornecedores cadastrados, além de dados operacionais (NFs, contas, movimentos, etc.), **When** a operação pontual de zerar dados é executada com confirmação, **Then** os usuários continuam podendo autenticar e o cadastro de fornecedores permanece intacto
2. **Given** a operação foi concluída com sucesso, **When** alguém consulta os módulos financeiros, operacionais e de configuração no app, **Then** não há registros residuais nesses módulos — incluindo categorias, contas correntes e config de páginas (listagens vazias / totais zerados conforme o domínio)
3. **Given** a operação foi concluída, **When** o cadastro de fornecedores é aberto no app, **Then** os fornecedores existentes antes da limpeza ainda estão presentes com seus dados de cadastro

---

### User Story 2 - Confirmação explícita antes da limpeza irreversível (Priority: P1)

O operador precisa confirmar de forma inequívoca que deseja apagar os dados no procedimento pontual, para evitar limpeza acidental.

**Why this priority**: A operação é destrutiva e irreversível para os dados apagados; a confirmação é proteção mínima de negócio.

**Independent Test**: Iniciar o procedimento e cancelar na confirmação; verificar que nenhum dado foi removido. Em seguida confirmar e verificar que a limpeza ocorre.

**Acceptance Scenarios**:

1. **Given** o operador iniciou a operação pontual de zerar dados, **When** cancela na etapa de confirmação, **Then** nenhum dado é alterado
2. **Given** o operador iniciou a operação, **When** confirma explicitamente a limpeza, **Then** a operação é executada e o resultado (sucesso ou falha) é informado de forma clara

---

### User Story 3 - Operação fora do uso cotidiano do app (Priority: P2)

A limpeza NÃO fica exposta como funcionalidade permanente na interface do Ocean App; permanece como procedimento administrativo pontual, inacessível ao fluxo normal de usuários (incluindo visualizador).

**Why this priority**: Reduz risco de uso indevido e mantém o produto sem uma ação destrutiva recorrente na UI.

**Independent Test**: Percorrer as telas/menus do app como admin e como visualizador; verificar que não existe ação de “zerar dados”. A limpeza só ocorre via procedimento/comando administrativo acordado.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado no app (admin ou visualizador), **When** navega pelas telas disponíveis, **Then** não encontra ação de zerar/limpar a base de dados
2. **Given** um operador com acesso ao procedimento administrativo, **When** executa o fluxo com confirmação, **Then** a limpeza ocorre conforme o escopo

---

### Edge Cases

- O que acontece se a limpeza falhar no meio do processo? Comportamento tudo ou nada: se falhar, o estado anterior do escopo é preservado (nenhuma aplicação parcial silenciosa) e a falha é informada de forma clara
- Como tratar colaboradores de equipe (não fornecedores)? Devem ser removidos junto com o restante dos dados operacionais
- Como tratar anexos e arquivos ligados a dados apagados (NFs, contas, documentos de equipe)? Devem ser removidos junto com os registros correspondentes
- Como tratar contas correntes, categorias e config de páginas? Também são zerados; a base preservada fica restrita a login e fornecedores
- Após zerar, deve-se recriar seeds/padrões automaticamente? Não — o estado final permanece vazio fora de login e fornecedores
- Como tratar histórico e documentos vinculados a fornecedores preservados? Permanecem
- O que acontece com logs de auditoria? São zerados junto com os demais dados (não fazem parte de login nem fornecedores)
- Não há tela permanente de limpeza no app; tentativas de “descobrir” a ação na UI devem falhar por inexistência da feature na interface

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST existir uma operação pontual controlada (procedimento/comando administrativo) para zerar os dados operacionais e financeiros do Ocean App, sem tela permanente no produto
- **FR-002**: A operação MUST preservar integralmente os dados de login (contas de usuário, credenciais e fatores de autenticação associados), de forma que os usuários existentes continuem autenticando após a limpeza
- **FR-003**: A operação MUST preservar integralmente o cadastro de fornecedores e os dados de cadastro a eles vinculados (incluindo documentos/histórico do próprio fornecedor, quando existirem)
- **FR-004**: A operação MUST remover todos os demais dados de negócio e configuração, incluindo no mínimo: notas fiscais, contas a pagar, contas a receber / comissões, férias, DH, movimentos e saldos de fluxo de caixa, bônus, impostos, metas, patrimônio, auditoria, colaboradores que não sejam fornecedores, categorias/subcategorias, contas correntes e configurações de páginas
- **FR-005**: A operação MUST exigir confirmação explícita do operador antes de efetivar a limpeza
- **FR-006**: A limpeza NÃO MUST aparecer como ação permanente na interface do Ocean App; usuários do app (incluindo visualizador) NÃO MUST conseguir dispará-la pelo uso normal do produto
- **FR-007**: Após a limpeza bem-sucedida, o sistema MUST permanecer utilizável para login e consulta de fornecedores; os demais módulos/configurações iniciam sem registros antigos
- **FR-008**: A operação MUST remover também anexos/arquivos associados aos registros apagados, evitando lixo órfão ligado a dados removidos
- **FR-009**: Em caso de falha, a operação MUST informar o erro de forma clara, MUST aplicar semântica tudo ou nada (nenhuma alteração parcial do escopo permanece aplicada) e NÃO MUST reportar sucesso se a limpeza não tiver sido concluída conforme o escopo
- **FR-010**: A operação MUST NÃO preservar categorias, contas correntes nem config de páginas — estes cadastros entram no escopo de limpeza junto com os dados operacionais
- **FR-011**: Após a limpeza, a operação MUST NÃO recriar automaticamente cadastros padrão (sem reseeding); o estado final esperado é apenas login + fornecedores, com o restante vazio
- **FR-012**: A operação NÃO MUST exigir nem criar backup automaticamente; backup, se desejado, fica sob responsabilidade do operador fora desta feature

### Key Entities

- **Usuário de login**: Conta de acesso ao Ocean App; permanece intacta após a limpeza
- **Fornecedor**: Cadastro preservado; não é removido pela operação
- **Colaborador de equipe**: Cadastro operacional distinto de fornecedor; é removido na limpeza
- **Dados operacionais/financeiros**: Conjunto de registros de NFs, contas, fluxo, férias, DH, bônus, impostos, metas, patrimônio e auditoria; alvo da limpeza
- **Cadastro estrutural**: Categorias, contas correntes e configurações de interface; também são alvo da limpeza (não preservados)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Após a limpeza confirmada, 100% dos usuários de login existentes antes da operação ainda conseguem autenticar com as mesmas credenciais
- **SC-002**: Após a limpeza, 100% dos fornecedores existentes antes da operação continuam listados no cadastro, sem perda dos dados essenciais de identificação
- **SC-003**: Após a limpeza, os módulos de dados operacionais/financeiros e os cadastros estruturais no escopo (categorias, contas correntes, config de páginas) apresentam zero registros residuais na verificação de aceite, sem recriação automática de padrões
- **SC-004**: Tentativa de limpeza sem confirmação explícita resulta em 0 registros removidos
- **SC-005**: Em verificação de aceite da UI do app, 0 telas/menus expõem ação permanente de zerar/limpar a base
- **SC-006**: Em um ambiente de teste com volume típico de operação interna, a limpeza completa e a verificação de aceite (login + fornecedores + módulos vazios) podem ser concluídas em até 15 minutos
- **SC-007**: Em simulação de falha durante a limpeza, 100% dos dados do escopo permanecem no estado anterior (0 aplicação parcial)

## Assumptions

- “Fornecedores” refere-se ao cadastro de fornecedores já existente no Ocean App; colaboradores de equipe (não fornecedores) entram no escopo de limpeza
- “Login” inclui contas de acesso e mecanismos de autenticação associados (incluindo segundo fator, se houver)
- A limpeza é uma operação pontual de administração (procedimento/comando), não funcionalidade permanente nem fluxo diário no app
- Além de login e fornecedores, nenhum outro cadastro é preservado — categorias, contas correntes e config de páginas também são zerados
- Não há reseeding automático após a limpeza; qualquer recadastro posterior é manual/fora desta feature
- Anexos ligados a dados apagados são removidos; anexos ligados a fornecedores preservados permanecem
- Não há exigência de exportar/backup automático dentro desta feature; backup, se necessário, é responsabilidade do operador antes de executar (fora do procedimento)
- Relatórios e telas derivadas (ex.: contratos a partir de NFs) passam a refletir a base vazia após a limpeza
- Fora de escopo: construir tela, botão ou menu no Ocean App para zerar dados; criar ou validar backup automático
