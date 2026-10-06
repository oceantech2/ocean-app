# Feature Specification: Modelo Development & Outplacement, Vários Projetos e Idioma Independente da Moeda

**Feature Branch**: `083-proposta-modelo-development-outplacement`

**Created**: 2026-10-06

**Status**: Draft

**Input**: User description: "utilize esse html de referencia @c:\Users\mathe\Downloads\Proposta_Comercial_Development_Outplacement.html e faça todo fluxo do speckit"

**Baseline**: O Proposal gera propostas por modelo (divisão) desde a feature `080-proposta-modelo-executive-search`, hoje com um único modelo disponível, **Executive Search** (versão 2, após a `082-proposta-escopo-projeto`). Nesse modelo a proposta tem **um único projeto** com 1 a 3 modelos de investimento, **garantia em meses** (número inteiro obrigatório), **Shortlist e SLA fixos** ("3 a 5 candidatos" e "5 a 10 dias úteis"), **validade como data** (padrão hoje + 30 dias) e a **moeda define o idioma** da página do cliente (Real → português, Dólar → inglês, spec `081-proposta-idioma-moeda`).

A Ocean enviou o modelo da divisão **Development & Outplacement** (`Proposta_Comercial_Development_Outplacement.html`). Além do conteúdo próprio da divisão, ele traz um contrato de campos que, segundo o próprio arquivo, "vale para as 4 divisões". Comparado com o Executive Search atual, as diferenças são:

1. **Conteúdo da divisão**: primeira seção "Development & Outplacement" com texto próprio, seção **Principais serviços** (Assessment, Outplacement e Soluções Personalizadas) no lugar de Metodologia, logo da divisão na capa, seção opcional de escopo com o título **Escopo** e Observações de Investimento próprias ("Valor mínimo de R$ 10.000,00 por projeto" e impostos). Não há caixa de Observações em Garantias e condições.
2. **Vários projetos por proposta**: cada projeto tem nome e os seus próprios 1 a 3 modelos de investimento, exibidos em blocos separados.
3. **Subtítulo da taxa**: taxas em percentual exibem abaixo o texto fixo "sobre a remuneração anual"; taxas em valor não.
4. **Garantias e condições editáveis e opcionais**: Shortlist, SLA e Garantia passam a ser texto livre opcional (Shortlist e SLA vêm com o texto padrão); campo vazio esconde a linha; todos vazios escondem a seção e o link do menu.
5. **Validade em dias**: o consultor informa a validade em dias e a página mostra a data final (data da proposta + dias).

Por decisão do usuário, as mudanças 2 a 5 valem **também para o Executive Search**, e o **idioma passa a ser escolhido separadamente da moeda** (qualquer combinação entre português/inglês e Real/Dólar), nos dois modelos.

## Clarifications

### Session 2026-10-06 (specify)

- Q: As regras novas do HTML (vários projetos, Garantias em texto livre opcional, subtítulo da taxa) valem só para o novo modelo ou também para o Executive Search? → A: Para os dois modelos.
- Q: O Development & Outplacement precisa de versão em inglês? → A: Sim, e a moeda deixa de determinar o idioma: a proposta passa a ter uma escolha de moeda (Real ou Dólar) e outra de idioma (português ou inglês), em qualquer combinação, nos dois modelos.
- Q: Como fica a validade? → A: Em dias; a validade da proposta passa a ser a data da proposta + o número de dias informado.

### Session 2026-10-06 (clarify)

- Q: A validade em dias vale também para o Executive Search? → A: Sim, nos dois modelos.
- Q: No Executive Search, se Shortlist, SLA e Garantia ficarem vazios, o que acontece com a caixa fixa de Observações de Garantias? → A: A seção e o link do menu continuam aparecendo, só com as Observações.
- Q: Numa proposta em Dólar, como aparecem as Observações que citam valor mínimo em reais? → A: Mantêm o valor em reais, apenas traduzidas conforme o idioma.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar uma proposta Development & Outplacement (Priority: P1)

Na **Nova proposta**, o consultor escolhe o modelo (divisão) entre **Executive Search** e **Development & Outplacement**. Escolhido Development & Outplacement, preenche os mesmos campos do Executive Search (empresa, data, setor, consultor, idioma, moeda, escopo, projetos com os seus investimentos, Garantias e condições e validade em dias) e confirma. A proposta é criada e o link é exibido, como hoje.

**Why this priority**: É o pedido central: disponibilizar a nova divisão para gerar propostas a partir do HTML de referência.

**Independent Test**: Criar uma proposta escolhendo Development & Outplacement com os dados de exemplo do HTML (Arxen, 24/10/2026, Infraestrutura, consultor Fábio Porto D'Ave, Projeto 1 com Retainer 15% e 40% de entrada, Sucesso 18% sem entrada e Valor fechado R$ 50.000 com 50% de entrada, Projeto 2 com Retainer 15% e 40% de entrada, Garantia "4 meses", validade de 30 dias) e confirmar que a proposta é criada, que o link é exibido e que a lista mostra o modelo "Development & Outplacement".

**Acceptance Scenarios**:

1. **Given** o consultor abre **Nova proposta**, **When** a tela carrega, **Then** a lista de modelos mostra **Executive Search** e **Development & Outplacement**, com Executive Search pré-selecionado.
2. **Given** o consultor troca o modelo para Development & Outplacement antes de confirmar, **When** o formulário é atualizado, **Then** os dados já digitados são mantidos, porque os campos são os mesmos nos dois modelos; muda apenas o nome da seção de escopo ("Escopo" em vez de "Escopo do Projeto").
3. **Given** uma proposta Development & Outplacement criada, **When** o consultor abre a lista ou o detalhe, **Then** vê o modelo "Development & Outplacement".
4. **Given** uma proposta existente, **When** o consultor a edita, **Then** o modelo aparece somente para leitura (regra da spec 080).

---

### User Story 2 - Cliente recebe a proposta no layout Development & Outplacement (Priority: P1)

O cliente abre o link e vê uma página igual ao HTML de referência: capa com a foto do setor e a logo **Development & Outplacement**, menu, seção "Development & Outplacement" com o texto da divisão, **Principais serviços** com três cartões, **Escopo** (quando houver), **Investimento** com um bloco por projeto, **Garantias e condições** (quando houver alguma linha preenchida), "Vamos avançar?" com a validade, Contato e rodapé. O aceite usa o fluxo atual do Proposal.

**Why this priority**: É o que o cliente efetivamente vê e o resultado pedido: gerar a página no formato do HTML com os dados preenchidos.

**Independent Test**: Abrir em janela anônima o link da proposta criada na US1 e comparar lado a lado com o HTML de referência preenchido com os mesmos dados: textos fixos, seções, ordem, cores, cartões de serviços, blocos de projeto e disposição iguais; nenhum marcador entre colchetes; aceitar a proposta e conferir que ela passa a Assinada.

**Acceptance Scenarios**:

1. **Given** uma proposta Development & Outplacement pendente, **When** o cliente abre o link, **Then** o menu mostra, nesta ordem: "Development & Outplacement", "Principais serviços", "Escopo" (só com escopo), "Investimento", "Garantias e condições" (só com alguma linha preenchida) e "Contato".
2. **Given** a página aberta, **When** o cliente chega à primeira seção, **Then** vê o título "Development & Outplacement" e o texto fixo da divisão do HTML de referência.
3. **Given** a página aberta, **When** o cliente chega a **Principais serviços**, **Then** vê três cartões com ícone, título e texto fixos: **Assessment**, **Outplacement** e **Soluções Personalizadas**, com os textos do HTML de referência.
4. **Given** a página aberta, **When** o cliente chega a **Investimento**, **Then** vê as Observações fixas da divisão: "Valor mínimo de R$ 10.000,00 por projeto;" e "Impostos (até 19,55%) serão adicionados a todos os valores informados."
5. **Given** a seção **Garantias e condições** do Development & Outplacement, **When** exibida, **Then** não há caixa de Observações.
6. **Given** a capa, **When** exibida, **Then** mostra a logo "Development & Outplacement" no lugar da logo do Executive Search, com a mesma posição e tamanho.
7. **Given** uma proposta Development & Outplacement pendente, **When** o cliente aciona **Aceitar proposta**, **Then** o aceite funciona exatamente como no Executive Search (nome completo, e-mail, declaração, evidências, mensagens e indicação de assinada).
8. **Given** a página aberta no celular, **When** o cliente navega, **Then** os cartões de serviços ficam empilhados e todo o conteúdo é legível sem zoom.
9. **Given** o cliente aciona **Baixar PDF**, **When** a impressão abre, **Then** o nome do arquivo e a versão impressa seguem as mesmas regras do Executive Search, sem menu nem botões.

---

### User Story 3 - Vários projetos por proposta, cada um com os seus investimentos (Priority: P1)

Nos dois modelos, o consultor pode incluir mais de um projeto na proposta. Cada projeto tem nome e os seus próprios 1 a 3 modelos de investimento (Retainer, Sucesso, Valor fechado), com taxa e forma de pagamento. Na página do cliente, cada projeto aparece como um bloco com o nome e os seus quadros de investimento. Taxas em percentual exibem abaixo o subtítulo "sobre a remuneração anual".

**Why this priority**: É a principal mudança de dados do contrato novo e vale para os dois modelos; sem ela, propostas com mais de uma posição precisam ser divididas em várias propostas.

**Independent Test**: Criar uma proposta (em qualquer modelo) com dois projetos — "Posição 1" com os três tipos de investimento e "Posição 2" só com Retainer — e conferir no formulário, no resumo, no detalhe e na página do cliente que cada projeto mostra apenas os seus quadros, na ordem dos projetos, com o subtítulo só nas taxas em percentual.

**Acceptance Scenarios**:

1. **Given** o formulário de proposta, **When** exibido, **Then** a seção de projetos começa com um projeto e permite **Adicionar projeto** e remover projetos, mantendo sempre pelo menos um.
2. **Given** um projeto no formulário, **When** o consultor preenche, **Then** informa o nome do projeto e marca de 1 a 3 tipos de investimento, cada um com taxa (percentual ou valor na moeda da proposta) e entrada opcional, com as mesmas regras de hoje.
3. **Given** dois projetos podem ter os mesmos tipos de investimento, **When** o consultor marca Retainer nos dois, **Then** o sistema aceita; a regra "cada tipo no máximo uma vez" vale dentro de cada projeto.
4. **Given** um projeto sem nome ou sem nenhum investimento marcado, **When** o consultor tenta confirmar, **Then** o sistema bloqueia e indica o erro no projeto correspondente.
5. **Given** uma proposta com N projetos, **When** o cliente abre o link, **Then** vê N blocos na seção Investimento, na ordem em que o consultor os cadastrou, cada um com o nome do projeto como título e os seus quadros na ordem Retainer, Sucesso, Valor fechado.
6. **Given** um quadro com taxa em percentual, **When** exibido ao cliente, **Then** mostra abaixo da taxa o subtítulo "sobre a remuneração anual" (em inglês, "of annual compensation"); quadros com taxa em valor não mostram o subtítulo.
7. **Given** o resumo lateral do formulário, **When** há vários projetos, **Then** os investimentos aparecem agrupados por projeto.
8. **Given** a lista de propostas, **When** uma proposta tem mais de um projeto, **Then** a coluna de projeto mostra o nome do primeiro projeto seguido da quantidade dos demais (ex.: "Posição 1 + 1").
9. **Given** o consultor reordena os projetos no formulário, **When** salva, **Then** a página do cliente segue a nova ordem.

---

### User Story 4 - Escolher idioma e moeda separadamente (Priority: P1)

Nos dois modelos, o consultor escolhe o **idioma** da apresentação (Português ou Inglês) e a **moeda** dos valores (Real ou Dólar) em campos separados, em qualquer combinação. O idioma define os textos fixos e os formatos de data e número da página do cliente; a moeda define o símbolo dos valores.

**Why this priority**: Pedido explícito do usuário, necessário para atender clientes estrangeiros que contratam em reais e clientes brasileiros que contratam em dólar.

**Independent Test**: Criar quatro propostas com as combinações Português+Real, Português+Dólar, Inglês+Real e Inglês+Dólar, cada uma com um quadro Valor fechado de 50.000, e conferir na página do cliente o idioma dos textos fixos, o formato das datas e o valor ("R$ 50.000", "US$ 50.000", "R$ 50,000" e "US$ 50,000").

**Acceptance Scenarios**:

1. **Given** o consultor abre **Nova proposta**, **When** a tela carrega, **Then** há o campo **Idioma da apresentação** (Português ou Inglês) e o campo **Moeda** (Real ou Dólar), com Português e Real pré-selecionados.
2. **Given** a moeda escolhida, **When** o consultor informa uma taxa em valor, **Then** o formulário, o resumo, o detalhe e a página do cliente usam o símbolo da moeda (R$ ou US$).
3. **Given** o idioma escolhido, **When** o cliente abre o link, **Then** todos os textos fixos, as datas e a separação de milhar e decimais seguem o idioma (português: "24/10/2026", "R$ 50.000,50"; inglês: "October 24, 2026", "R$ 50,000.50"), independentemente da moeda.
4. **Given** uma proposta criada, **When** o consultor a edita, **Then** idioma e moeda aparecem somente para leitura.
5. **Given** **Criar cópia**, **When** o formulário abre, **Then** vem com o idioma e a moeda da origem, e o consultor pode trocá-los antes de confirmar.
6. **Given** a lista e o detalhe, **When** exibidos, **Then** mostram o idioma e a moeda de cada proposta por modelo.
7. **Given** o consultor troca o idioma no formulário de uma nova proposta, **When** Shortlist e SLA ainda estão com o texto padrão, **Then** o texto padrão passa para o idioma escolhido; se o consultor já tiver alterado o texto, o sistema não o substitui.

---

### User Story 5 - Garantias e condições editáveis e opcionais (Priority: P2)

Nos dois modelos, Shortlist, SLA e Garantia passam a ser campos de texto livre opcionais no formulário. Shortlist e SLA vêm preenchidos com o texto padrão no idioma da proposta; Garantia vem vazia e aceita textos como "4 meses" ou "6 meses para Gerência; 4 meses para posições técnicas". Linhas vazias não aparecem para o cliente. No Development & Outplacement, se todas estiverem vazias, a seção e o link do menu também não aparecem; no Executive Search, a seção continua aparecendo só com a caixa fixa de Observações.

**Why this priority**: Dá flexibilidade a condições que variam por cliente, mas o padrão já atende a maioria das propostas.

**Independent Test**: Criar uma proposta Development & Outplacement com Shortlist apagado, SLA padrão e Garantia "6 meses para Gerência; 4 meses para posições técnicas" e conferir que a página mostra só SLA e Garantia; editar apagando os três e conferir que a seção e o link somem. Repetir no Executive Search e conferir que, com os três vazios, a seção fica só com as Observações.

**Acceptance Scenarios**:

1. **Given** uma nova proposta em português, **When** o formulário abre, **Then** Shortlist vem com "3 a 5 candidatos", SLA com "5 a 10 dias úteis" e Garantia vazia, todos editáveis e opcionais.
2. **Given** uma nova proposta em inglês, **When** o formulário abre, **Then** Shortlist vem com "3 to 5 candidates" e SLA com "5 to 10 business days".
3. **Given** um campo de Garantias e condições vazio (ou só com espaços), **When** o cliente abre o link, **Then** a linha correspondente não aparece.
4. **Given** uma proposta Development & Outplacement com os três campos vazios, **When** o cliente abre o link, **Then** a seção Garantias e condições e o link do menu não aparecem, sem deixar espaço vazio.
5. **Given** um texto digitado nesses campos, **When** exibido, **Then** aparece exatamente como digitado, sem tradução, inclusive caracteres especiais.
6. **Given** uma proposta Executive Search com alguma linha preenchida, **When** o cliente abre o link, **Then** a caixa de Observações de Garantias do Executive Search continua aparecendo abaixo das linhas.
7. **Given** uma proposta Executive Search com os três campos vazios, **When** o cliente abre o link, **Then** a seção Garantias e condições e o link do menu continuam aparecendo, só com a caixa de Observações.

---

### User Story 6 - Validade em dias (Priority: P2)

Nos dois modelos, o consultor informa a validade em **dias** (padrão 30). O formulário mostra a data final calculada (data da proposta + dias), e essa data é a validade da proposta: aparece na frase "Esta proposta é válida até dd/mm/aaaa." e controla a expiração, como hoje.

**Why this priority**: Simplifica o preenchimento conforme o contrato novo, sem mudar o comportamento de expiração.

**Independent Test**: Criar uma proposta com data 24/10/2026 e validade de 30 dias e conferir que o formulário, o detalhe e a página do cliente mostram a validade em 23/11/2026; editar a data para 25/10/2026 e conferir que a validade passa a 24/11/2026.

**Acceptance Scenarios**:

1. **Given** uma nova proposta, **When** o formulário abre, **Then** o campo **Validade (dias)** vem com 30 e o formulário mostra "Válida até dd/mm/aaaa" calculado a partir da Data.
2. **Given** o consultor altera a Data ou os dias, **When** o valor muda, **Then** a data final exibida é recalculada na hora.
3. **Given** dias fora do intervalo de 1 a 365 ou não inteiros, **When** o consultor tenta confirmar, **Then** o sistema bloqueia e indica o erro.
4. **Given** uma Data no passado cuja validade calculada já passou (data final igual ou anterior a hoje), **When** o consultor tenta confirmar, **Then** o sistema bloqueia com a mensagem de que a validade calculada já passou.
5. **Given** uma proposta pendente, **When** o consultor edita a Data ou os dias, **Then** a validade passa a ser a nova data calculada, e as regras de expiração seguem a nova data.
6. **Given** **Criar cópia**, **When** o formulário abre, **Then** a Data volta para hoje e a validade volta para 30 dias.

---

### User Story 7 - Editar, copiar e manter compatibilidade (Priority: P2)

Edição antes da assinatura (spec 079), **Criar cópia**, histórico de edições, cancelamento e aceite continuam valendo nos dois modelos com os campos novos. Propostas Executive Search pendentes passam ao formato novo sem perda de dados; propostas assinadas continuam exatamente como foram aceitas.

**Why this priority**: Preserva o que já funciona e a integridade das propostas aceitas, mas o valor novo vem das US1 a US6.

**Independent Test**: Antes de publicar, ter uma proposta Executive Search pendente em dólar e uma assinada; depois, conferir que a pendente abre com um projeto, Garantia "N months", Shortlist e SLA padrão em inglês, idioma inglês, moeda dólar e a mesma validade; e que a assinada abre exatamente igual a antes. Editar a pendente incluindo um segundo projeto e conferir o histórico.

**Acceptance Scenarios**:

1. **Given** uma proposta pendente em qualquer modelo, **When** o consultor aciona **Editar**, **Then** o formulário abre com todos os dados atuais (projetos e investimentos, Garantias e condições, validade em dias), com as regras da spec 079.
2. **Given** uma edição salva, **When** o consultor abre o detalhe, **Then** o histórico mostra, de forma legível, inclusão, remoção, renomeação e reordenação de projetos, alterações de investimentos por projeto, alterações de Shortlist, SLA e Garantia e alteração da validade.
3. **Given** **Criar cópia** de uma proposta de qualquer modelo, **When** o formulário abre, **Then** vem com o mesmo modelo e todos os campos copiados (inclusive projetos, escopo e Garantias e condições), exceto Data (hoje) e validade (30 dias).
4. **Given** uma proposta Executive Search pendente criada antes desta feature, **When** aberta pelo cliente ou pelo consultor, **Then** tem um projeto com o nome e os investimentos que já tinha, Garantia em texto equivalente aos meses anteriores no idioma da proposta ("4 meses" ou "4 months"), Shortlist e SLA com o texto padrão do idioma, idioma igual ao que a moeda definia (Real → português, Dólar → inglês) e a mesma data de validade.
5. **Given** uma proposta assinada antes desta feature, **When** alguém abre o link, **Then** vê exatamente o conteúdo aceito (um projeto, garantia em meses, Shortlist e SLA fixos, sem subtítulo da taxa).
6. **Given** uma proposta simples (formato da 077), **When** aberta, **Then** continua como hoje.

---

### Edge Cases

- **Muitos projetos**: limite de 10 projetos por proposta; ao atingir o limite, **Adicionar projeto** fica indisponível com a indicação do limite.
- **Projetos com o mesmo nome**: permitido; a página mostra os blocos na ordem cadastrada.
- **Nome de projeto longo**: quebra linha sem sobrepor os quadros, no computador, no celular e na impressão.
- **Remover o único projeto**: não é permitido; a proposta tem sempre pelo menos um projeto.
- **Garantia com texto longo** (ex.: regras diferentes por nível): limite de 255 caracteres por campo de Garantias e condições; o texto quebra linha sem sobrepor o rótulo.
- **Troca de idioma com Shortlist/SLA alterados**: o texto digitado pelo consultor é mantido; só o texto padrão acompanha o idioma.
- **Idioma inglês com moeda Real**: valores em reais com separadores do inglês ("R$ 50,000.50"); as Observações fixas que citam valor mínimo continuam com o texto da divisão no idioma escolhido.
- **Validade calculada cai em fim de semana ou feriado**: não há ajuste; vale a data calculada.
- **Data da proposta no passado**: permitida, desde que a validade calculada seja posterior a hoje.
- **Proposta pendente migrada com validade maior que 365 dias após a Data**: mantém a data de validade que já tinha; ao editar, o consultor precisa informar dias dentro do limite.
- **Proposta assinada cujo conteúdo fixo da divisão mudar no futuro**: continua exibindo o conteúdo vigente na assinatura (regra da spec 080, FR-025).
- **Logo da divisão indisponível**: a capa mantém o fundo e os textos legíveis, sem imagem quebrada aparente.
- **Escopo vazio no Development & Outplacement**: a seção "Escopo" e o link do menu não aparecem, como no Executive Search.

## Requirements *(mandatory)*

### Functional Requirements

**Modelo Development & Outplacement**

- **FR-001**: A lista de modelos da **Nova proposta** MUST oferecer **Executive Search** e **Development & Outplacement**, com Executive Search pré-selecionado. Trocar o modelo antes de confirmar MUST manter os dados já digitados.
- **FR-002**: A página do cliente de uma proposta Development & Outplacement MUST reproduzir o HTML de referência: mesmas seções e ordem, textos fixos, identidade visual, cartões de serviços, navegação, responsividade e versão para impressão, com os dados da proposta no lugar dos marcadores.
- **FR-003**: O conteúdo fixo da divisão Development & Outplacement MUST ser: título da primeira seção e do primeiro link do menu "Development & Outplacement"; texto da primeira seção do HTML; seção **Principais serviços** com os cartões Assessment, Outplacement e Soluções Personalizadas (ícones, títulos e textos do HTML); título da seção de escopo "Escopo"; Observações de Investimento "Valor mínimo de R$ 10.000,00 por projeto;" e "Impostos (até 19,55%) serão adicionados a todos os valores informados."; logo da divisão na capa; sem Metodologia e sem caixa de Observações em Garantias e condições.
- **FR-004**: O menu da página Development & Outplacement MUST seguir a ordem: Development & Outplacement, Principais serviços, Escopo (somente com escopo), Investimento, Garantias e condições (somente com alguma linha preenchida), Contato.
- **FR-005**: O conteúdo fixo da divisão MUST existir em português e em inglês (tradução inicial feita pela equipe de desenvolvimento, revisável pela Ocean), incluindo os cartões de serviços e as Observações. "Development & Outplacement", "Assessment" e "Outplacement" são nomes de serviço e não são traduzidos.
- **FR-006**: Aceite, WhatsApp do consultor, PDF, frase de validade, indicação "Atualizada em", indicação de assinada, mensagens de proposta cancelada ou expirada e bloco de contato MUST funcionar no Development & Outplacement exatamente como no Executive Search.

**Vários projetos (os dois modelos)**

- **FR-007**: Uma proposta por modelo MUST ter de 1 a 10 projetos, em ordem definida pelo consultor. Cada projeto MUST ter nome (texto obrigatório, até 255 caracteres) e de 1 a 3 modelos de investimento.
- **FR-008**: Dentro de um projeto, cada tipo de investimento (Retainer, Sucesso, Valor fechado) MUST aparecer no máximo uma vez; projetos diferentes MAY repetir tipos. Taxa e forma de pagamento seguem as regras atuais (spec 080, FR-008 e FR-009; spec 081 para a moeda).
- **FR-009**: O formulário MUST permitir adicionar, remover e reordenar projetos, sem permitir ficar com zero projetos, e MUST indicar erros por projeto.
- **FR-010**: A página do cliente MUST exibir, na seção Investimento, um bloco por projeto na ordem cadastrada, com o nome do projeto como título e os quadros desse projeto na ordem Retainer, Sucesso, Valor fechado.
- **FR-011**: Nos quadros com taxa em percentual, a página do cliente MUST exibir abaixo da taxa o subtítulo fixo "sobre a remuneração anual" (inglês: "of annual compensation"); nos quadros com taxa em valor, o subtítulo MUST NÃO aparecer.
- **FR-012**: O resumo do formulário e o detalhe da proposta MUST agrupar os investimentos por projeto. A lista de propostas MUST mostrar o nome do primeiro projeto e, havendo mais, a quantidade dos demais (ex.: "Posição 1 + 2").
- **FR-013**: O Escopo continua sendo um único campo por proposta (spec 082), exibido na seção de escopo do modelo: "Escopo do Projeto" no Executive Search (após Metodologia) e "Escopo" no Development & Outplacement (após Principais serviços).

**Idioma e moeda (os dois modelos)**

- **FR-014**: Toda proposta por modelo MUST ter um **idioma** (Português ou Inglês) e uma **moeda** (Real ou Dólar), escolhidos em campos separados na criação, em qualquer combinação, com Português e Real como padrão.
- **FR-015**: O idioma MUST definir os textos fixos da página do cliente, da janela de aceite e das mensagens ao cliente, o formato das datas (português "dd/mm/aaaa"; inglês por extenso no padrão americano) e os separadores de milhar e decimais (português "50.000,50"; inglês "50,000.50"), bem como a declaração de idioma da página ao navegador.
- **FR-016**: A moeda MUST definir apenas o símbolo dos valores em moeda ("R$" ou "US$"), no formulário, no resumo, no detalhe e na página do cliente.
- **FR-017**: Idioma e moeda MUST NÃO poder ser alterados depois da criação; na edição, MUST aparecer somente para leitura. **Criar cópia** MUST vir com os da origem, que o consultor MAY trocar.
- **FR-018**: A lista e o detalhe MUST mostrar o idioma e a moeda de cada proposta por modelo. A interface interna do Proposal continua em português.
- **FR-019**: Propostas por modelo existentes MUST receber o idioma correspondente à moeda que tinham (Real → Português, Dólar → Inglês), sem mudança no idioma ou na moeda que o cliente vê.

**Garantias e condições (os dois modelos)**

- **FR-020**: Shortlist, SLA e Garantia MUST ser campos de texto livre opcionais, com até 255 caracteres cada. Shortlist e SLA MUST vir preenchidos com o texto padrão no idioma da proposta (português "3 a 5 candidatos" e "5 a 10 dias úteis"; inglês "3 to 5 candidates" e "5 to 10 business days"); Garantia MUST vir vazia.
- **FR-021**: Enquanto Shortlist ou SLA estiverem com o texto padrão, a troca de idioma no formulário de uma nova proposta MUST trocar o texto padrão para o novo idioma; textos alterados pelo consultor MUST ser mantidos.
- **FR-022**: Na página do cliente, uma linha de Garantias e condições vazia (ou só com espaços) MUST NÃO aparecer. No Development & Outplacement, com as três vazias, a seção e o link do menu MUST NÃO aparecer, sem deixar espaço vazio.
- **FR-023**: No Executive Search, a seção Garantias e condições, o seu link no menu e a caixa de Observações fixa MUST aparecer sempre, mesmo com as três linhas vazias (nesse caso, a seção mostra só as Observações). No Development & Outplacement, não há caixa de Observações nessa seção.
- **FR-024**: Os textos de Shortlist, SLA e Garantia MUST ser exibidos exatamente como digitados, sem tradução e sem interpretar marcação.

**Validade em dias (os dois modelos)**

- **FR-025**: A validade MUST ser informada em dias inteiros, de 1 a 365, com padrão de 30. A data de validade da proposta MUST ser a Data da proposta somada aos dias.
- **FR-026**: O formulário MUST mostrar a data de validade calculada e recalculá-la ao alterar a Data ou os dias.
- **FR-027**: O sistema MUST bloquear a confirmação quando a data de validade calculada for igual ou anterior a hoje (horário de São Paulo), com a mensagem "A validade calculada já passou. Ajuste a data ou os dias."
- **FR-028**: A data de validade calculada MUST continuar controlando a expiração e a frase "Esta proposta é válida até dd/mm/aaaa." (spec 080, FR-011 e FR-033). Em **Criar cópia**, a Data MUST voltar a hoje e os dias a 30.
- **FR-029**: Propostas por modelo existentes MUST manter a data de validade que tinham; o número de dias MUST ser derivado como a diferença entre a validade e a Data da proposta.

**Edição, histórico, integridade e compatibilidade**

- **FR-030**: A edição antes da assinatura (spec 079) MUST valer para todos os campos novos, com as mesmas validações da criação. O modelo, o idioma e a moeda MUST NÃO ser alterados na edição.
- **FR-031**: O histórico de edições MUST registrar, com valor anterior e novo valor legíveis: inclusão, remoção, renomeação e reordenação de projetos; inclusão, remoção e alteração de investimentos por projeto; alterações de Shortlist, SLA e Garantia; alteração dos dias e da data de validade.
- **FR-032**: A impressão digital do conteúdo aceito MUST cobrir o modelo e a versão do modelo, o idioma, a moeda, todos os projetos com os seus investimentos, Shortlist, SLA, Garantia e a data de validade, além dos dados já cobertos hoje.
- **FR-033**: Propostas Executive Search pendentes criadas antes desta feature MUST passar ao formato novo: um projeto com o nome e os investimentos atuais; Garantia em texto equivalente aos meses no idioma da proposta ("1 mês"/"N meses" ou "1 month"/"N months"); Shortlist e SLA com o texto padrão do idioma; idioma conforme FR-019; validade conforme FR-029.
- **FR-034**: Propostas assinadas antes desta feature MUST continuar exibindo exatamente o conteúdo aceito (versão do modelo, um projeto, garantia em meses, Shortlist e SLA fixos, idioma e moeda da assinatura, sem subtítulo da taxa).
- **FR-035**: Propostas simples (formato da 077) MUST continuar sem mudança.
- **FR-036**: Todo dado digitado pelo consultor MUST continuar sendo exibido como texto literal na página do cliente (exceto as formatações permitidas do Escopo, spec 082).

### Key Entities

- **Modelo de proposta (divisão)** (existente): passa a ter dois modelos disponíveis, Executive Search e **Development & Outplacement** (`outplacement-development`). O conteúdo fixo de cada divisão (título, texto da primeira seção, Metodologia ou Principais serviços, título da seção de escopo, Observações de Investimento e de Garantias, logo) existe em português e em inglês. Cada modelo tem versões; propostas assinadas ficam na versão aceita.
- **Proposta** (existente): passa a ter **idioma** (independente da moeda), **validade em dias** (a data de validade continua existindo e é derivada da Data + dias), **Shortlist**, **SLA** e **Garantia** em texto livre opcional e uma lista ordenada de **projetos**. O nome único do projeto, os investimentos únicos e a garantia em meses deixam de ser usados nas propostas no formato novo, mas são preservados nas propostas assinadas antes desta feature.
- **Projeto** (novo): item ordenado da proposta. Atributos: posição, nome e de 1 a 3 modelos de investimento com tipos distintos. Cada proposta por modelo tem de 1 a 10 projetos.
- **Modelo de investimento** (existente): passa a pertencer a um projeto, sem mudança de atributos (tipo, forma da taxa, valor da taxa, entrada opcional).
- **Conjunto de traduções** (existente): ganha os textos fixos do Development & Outplacement, o subtítulo da taxa e os textos padrão de Shortlist e SLA, nos dois idiomas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em comparação lado a lado com o HTML de referência preenchido com os mesmos dados de exemplo, a página Development & Outplacement não apresenta diferença perceptível de textos, seções, ordem, cores ou disposição, no computador e no celular, além das adições previstas (frase de validade, "Atualizada em" e indicação de assinada).
- **SC-002**: Um consultor cria uma proposta com 2 projetos e 4 quadros de investimento no total e copia o link em menos de 4 minutos.
- **SC-003**: Em 100% das propostas geradas, cada projeto aparece com exatamente os seus quadros de investimento, na ordem cadastrada, e nenhum marcador entre colchetes aparece.
- **SC-004**: Nas quatro combinações de idioma e moeda, 100% dos textos fixos aparecem no idioma escolhido e 100% dos valores aparecem com o símbolo da moeda escolhida.
- **SC-005**: Em 100% das propostas Development & Outplacement com as três linhas de Garantias e condições vazias, nem a seção nem o link do menu aparecem; em 100% das propostas Executive Search, a caixa de Observações de Garantias continua visível.
- **SC-006**: 100% das propostas assinadas antes desta feature continuam abrindo exatamente como foram aceitas, e 100% das propostas pendentes migradas mantêm projeto, investimentos, garantia, idioma, moeda e data de validade equivalentes aos anteriores.
- **SC-007**: Em 100% das propostas aceitas, é possível demonstrar exatamente o conteúdo aceito, incluindo todos os projetos, Garantias e condições, idioma, moeda e validade.

## Assumptions

- **Nome e identificador da divisão**: o nome exibido é "Development & Outplacement", como no título e no menu do HTML; o identificador é `outplacement-development`, como no contrato de campos. O modelo começa na versão 1.
- **Logo da divisão**: usa a logo branca embutida no HTML de referência até a Ocean enviar o arquivo oficial (o próprio HTML prevê a troca). O texto alternativo da imagem será "Ocean Talent Solutions — Development & Outplacement" (o HTML traz "Executive Search" por engano).
- **Fotos por setor**: as mesmas do Executive Search (a foto de Infraestrutura continua como padrão enquanto as fotos por setor não chegarem, conforme a spec 080).
- **Aceite**: o HTML traz um aceite provisório por e-mail ou por endereço de ERP; como no Executive Search, o aceite usa o fluxo do Proposal (nome completo, e-mail e declaração), conforme a spec 080.
- **Escopo**: um único campo por proposta, mesmo com vários projetos; o consultor pode descrever cada projeto dentro dele (o exemplo do HTML faz assim). Mesmas regras de formatação e limite da spec 082.
- **Executive Search**: ganha uma nova versão do modelo com vários projetos, subtítulo da taxa e Garantias e condições editáveis. Textos fixos (Serviço, Metodologia, Observações de Investimento e de Garantias) não mudam.
- **Combinações de idioma e moeda**: a escolha separada vale para os dois modelos e substitui a regra da spec 081 em que a moeda determinava o idioma. As Observações fixas que citam o valor mínimo por projeto mantêm o valor em reais, apenas traduzidas, como já acontece hoje na versão em inglês (confirmado no clarify).
- **Textos padrão de Shortlist e SLA**: os mesmos nas duas divisões, como no HTML de referência; o consultor ajusta quando não fizerem sentido para o serviço.
- **Limites**: 10 projetos por proposta, 255 caracteres por campo de Garantias e condições e validade de 1 a 365 dias atendem às propostas da Ocean com folga.
- **Mensagem de link inválido**: continua em português, sem proposta para identificar o idioma (spec 081).
- **Permissões, status, perfil do consultor, setores e envio do link**: seguem as specs 077, 079, 080, 081 e 082 sem mudança.
