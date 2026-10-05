# Feature Specification: Proposta em Português ou Inglês conforme a Moeda (Executive Search)

**Feature Branch**: `081-proposta-idioma-moeda`

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "precisava que esse html ele tivesse a versão em portugues e em ingles, ai no caso o consultor escolheria entre real ou dolar e então mudaria o idioma da apresentação"

**Baseline**: A feature `080-proposta-modelo-executive-search` (já em produção na `main`) gera a página do cliente no layout do modelo Executive Search, sempre em português e com valores em reais. O consultor preenche Empresa, Data, Setor, dados do consultor, Nome do projeto, de 1 a 3 modelos de investimento (taxa em percentual ou em reais, entrada opcional) e Garantia. Esta feature acrescenta a escolha da **moeda** (Real ou Dólar) na proposta, e a moeda define o **idioma** da página do cliente: Real → português (como hoje), Dólar → inglês.

## Clarifications

### Session 2026-10-05

- Q: De onde vêm os textos em inglês? → A: Traduzidos pela equipe de desenvolvimento e organizados em arquivos de tradução por idioma (i18n), para o usuário revisar e ajustar sem mexer no layout.
- Q: Como mostrar datas na versão em inglês? → A: No padrão americano.
- Q: O consultor pode trocar a moeda (e o idioma) ao editar uma proposta ainda não assinada? → A: Não. A moeda fica fixa depois de criada; para outra moeda, cria-se uma nova proposta (ou uma cópia).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Escolher a moeda ao criar a proposta (Priority: P1)

Ao criar uma proposta Executive Search, o consultor escolhe a moeda: **Real (R$)** ou **Dólar (US$)**. A escolha deixa claro que define também o idioma da apresentação ao cliente (Real → português, Dólar → inglês). Os valores em moeda dos quadros de investimento passam a usar a moeda escolhida.

**Why this priority**: É a decisão que dispara toda a feature. Sem ela, não há como gerar a proposta em inglês nem com valores em dólar.

**Independent Test**: Abrir **Nova proposta**, escolher **Dólar (US$)**, preencher os dados de exemplo com um quadro "Valor fechado" de US$ 50.000 e confirmar que a proposta é criada com a moeda Dólar e que o resumo do formulário mostra o valor em dólar.

**Acceptance Scenarios**:

1. **Given** o usuário abre **Nova proposta**, **When** a tela carrega, **Then** há o campo **Moeda** com as opções **Real (R$) — apresentação em português** e **Dólar (US$) — apresentação em inglês**, com **Real** pré-selecionado.
2. **Given** a moeda **Dólar** selecionada, **When** o usuário escolhe taxa em valor num quadro de investimento, **Then** o campo e o resumo mostram o valor em dólar (US$) em vez de reais.
3. **Given** a moeda **Real** selecionada, **When** o usuário preenche o formulário, **Then** tudo funciona exatamente como hoje.
4. **Given** uma proposta criada, **When** o usuário abre a lista ou o detalhe, **Then** vê a moeda (e o idioma correspondente) da proposta.
5. **Given** uma proposta existente, **When** o usuário aciona **Editar**, **Then** a moeda aparece apenas para leitura, sem possibilidade de troca.
6. **Given** uma proposta Executive Search, **When** o usuário aciona **Criar cópia**, **Then** o formulário abre com a mesma moeda da origem, e o usuário pode trocá-la, já que a cópia é uma proposta nova.

---

### User Story 2 - Cliente vê a proposta em inglês quando a moeda é Dólar (Priority: P1)

O cliente abre o link de uma proposta em dólar e vê a mesma página do modelo Executive Search (mesmas seções, cores, fontes, fotos e disposição), com todos os textos fixos em inglês, os dados preenchidos, os valores em dólar e as datas no padrão americano.

**Why this priority**: É o resultado que o cliente vê. A versão em inglês é o pedido central para clientes internacionais.

**Independent Test**: Abrir em janela anônima o link da proposta em dólar criada na US1 e conferir que nenhum texto fixo aparece em português, que o layout é o mesmo da versão em português, que as datas estão no padrão americano e que os valores aparecem em dólar.

**Acceptance Scenarios**:

1. **Given** uma proposta em dólar pendente, **When** o cliente abre o link, **Then** todos os textos fixos (navegação, Serviço, Metodologia, Investimento, Observações, Garantias e condições, "Vamos avançar?", Contato, rodapé, botões e a janela de aceite) aparecem em inglês.
2. **Given** uma proposta em dólar, **When** o cliente abre o link, **Then** a disposição, as cores, as fontes, a foto do setor e a logo da divisão são as mesmas da versão em português, no computador e no celular.
3. **Given** uma proposta em dólar, **When** exibida, **Then** as datas (capa, rodapé, validade, "Atualizada em" e indicação de assinada) aparecem no padrão americano (ex.: "October 24, 2026").
4. **Given** um quadro com taxa em valor, **When** exibido, **Then** o valor aparece em dólar no formato americano (ex.: "US$ 50,000" ou "US$ 50,000.50"); taxas em percentual usam ponto decimal (ex.: "17.5%").
5. **Given** um quadro de investimento, **When** exibido, **Then** o tipo e a forma de pagamento aparecem em inglês (ex.: "Retainer", "Success fee", "Fixed fee"; "40% upfront + 60% upon completion"; "100% upon completion").
6. **Given** a garantia, **When** exibida, **Then** aparece em inglês, no singular ou plural ("1 month", "4 months").
7. **Given** a página em inglês, **When** o cliente aciona **Talk to the consultant**, **Then** o WhatsApp abre com uma mensagem pronta em inglês que cita a empresa.
8. **Given** a página em inglês, **When** o cliente aciona o botão de PDF, **Then** a impressão abre com o nome de arquivo em inglês ("Ocean Commercial Proposal - {Empresa}").
9. **Given** uma proposta em real, **When** o cliente abre o link, **Then** a página continua exatamente como hoje, em português.
10. **Given** dados digitados pelo consultor (empresa, nome do projeto, nome e cargo do consultor), **When** exibidos na página em inglês, **Then** aparecem exatamente como digitados, sem tradução.

---

### User Story 3 - Cliente aceita a proposta em inglês (Priority: P1)

Na proposta em dólar, o aceite funciona como na versão em português, com a janela, as validações e as mensagens em inglês.

**Why this priority**: Fecha o ciclo da proposta em inglês. Uma mensagem em português no meio do aceite confundiria o cliente internacional.

**Independent Test**: Na proposta em dólar, abrir o aceite, tentar confirmar sem preencher (ver os erros em inglês), preencher e confirmar, e conferir a mensagem de sucesso e a indicação de assinada em inglês.

**Acceptance Scenarios**:

1. **Given** uma proposta em dólar pendente, **When** o cliente aciona **Accept proposal**, **Then** a janela de aceite abre com título, campos, declaração e botões em inglês.
2. **Given** a janela de aceite, **When** o cliente confirma com dados inválidos, **Then** os erros aparecem em inglês.
3. **Given** dados válidos, **When** o cliente confirma, **Then** a proposta passa a **Assinada** e o cliente vê a mensagem de sucesso em inglês.
4. **Given** a proposta foi editada enquanto o cliente estava com ela aberta, **When** o cliente tenta aceitar, **Then** vê em inglês o aviso de que a proposta foi atualizada, e a página recarrega com a versão nova.
5. **Given** uma proposta em dólar assinada, **When** alguém abre o link, **Then** vê "Proposal accepted on {data} at {hora} by {nome}." no padrão americano.
6. **Given** uma proposta em dólar cancelada ou expirada, **When** alguém abre o link, **Then** vê a mensagem de indisponível ou expirada em inglês, sem os dados da proposta.

---

### User Story 4 - Revisar e ajustar as traduções sem mexer no layout (Priority: P3)

Os textos fixos de cada idioma ficam reunidos em um conjunto de traduções por idioma, separado do layout, para a Ocean revisar a tradução para inglês e pedir ajustes pontuais sem risco de quebrar a página.

**Why this priority**: A tradução inicial é feita pela equipe de desenvolvimento e precisa de revisão da Ocean. Facilita essa revisão e a inclusão de outros idiomas no futuro, mas não bloqueia a entrega.

**Independent Test**: Alterar uma frase no conjunto de traduções em inglês e conferir que a mudança aparece na página em inglês sem alterar a versão em português nem o layout.

**Acceptance Scenarios**:

1. **Given** o conjunto de traduções, **When** alguém altera um texto do inglês, **Then** só a página em inglês muda.
2. **Given** um texto fixo do modelo, **When** existir em um idioma, **Then** MUST existir também no outro; nenhuma página mostra uma chave de tradução ou um texto vazio no lugar.

---

### Edge Cases

- **Propostas Executive Search criadas antes desta feature**: passam a ter moeda **Real** e continuam idênticas em português.
- **Propostas simples** (formato da 077): não têm moeda nem idioma; continuam como hoje.
- **Taxa em percentual numa proposta em dólar**: o percentual é o mesmo; só muda a formatação ("17.5%").
- **Moeda Real com cliente estrangeiro** (ou o contrário): não há escolha de idioma separada; a moeda define o idioma. Quem precisar de outra combinação usa a moeda correspondente ao idioma desejado.
- **Assinada em uma moeda**: a página assinada continua no idioma e na moeda em que foi aceita, e a impressão digital do conteúdo aceito inclui a moeda.
- **Link aberto em navegador configurado em outro idioma**: o idioma da página segue a moeda da proposta, não o idioma do navegador.
- **Proposta inexistente** (link inválido): sem dados para saber o idioma, a mensagem continua em português.
- **Texto da tradução mais longo que o original**: quebra linha sem sobrepor outros elementos, no computador e no celular.
- **Telefone sem código do país** numa proposta em dólar: continua assumindo +55, como hoje.

## Requirements *(mandatory)*

### Functional Requirements

**Moeda na proposta**

- **FR-001**: Toda proposta Executive Search MUST ter uma moeda: **Real (BRL)** ou **Dólar (USD)**, escolhida na criação, com **Real** como padrão.
- **FR-002**: A moeda MUST definir o idioma da página do cliente: Real → português (pt-BR); Dólar → inglês (en-US). Não há escolha de idioma separada.
- **FR-003**: O formulário MUST deixar explícito, junto da escolha da moeda, o idioma em que o cliente verá a proposta.
- **FR-004**: A moeda MUST NÃO poder ser alterada depois da criação. Na edição, MUST aparecer somente para leitura.
- **FR-005**: **Criar cópia** MUST vir com a moeda da proposta de origem, que o usuário MAY trocar antes de confirmar.
- **FR-006**: Nos quadros de investimento com taxa em valor, o formulário, o resumo, o detalhe e a página do cliente MUST usar a moeda da proposta (R$ ou US$).
- **FR-007**: A lista e o detalhe de propostas MUST mostrar a moeda e o idioma de cada proposta Executive Search.
- **FR-008**: A interface interna do Proposal (lista, formulário, detalhe, perfil) MUST continuar em português, independentemente da moeda.
- **FR-009**: Propostas Executive Search existentes MUST passar a ter moeda Real, sem nenhuma mudança na página do cliente. Propostas simples MUST continuar sem moeda e sem mudança.

**Página do cliente em inglês**

- **FR-010**: A página de uma proposta em dólar MUST ter a mesma estrutura, layout, identidade visual, responsividade e versão para impressão da página em português, trocando apenas os textos fixos pela versão em inglês e aplicando os formatos de data e número do inglês.
- **FR-011**: Todos os textos fixos MUST existir em português e em inglês: título da página, navegação, capa ("Preparada para", "Consultor"), Serviço, os 6 passos da Metodologia, Investimento (títulos, rótulos "Taxa" e "Forma de pagamento", Observações), Shortlist, SLA, Garantias e condições (incluindo Observações), "Vamos avançar?", frase de validade, botões, Contato, rodapé, indicação "Atualizada em", indicação de assinada, janela de aceite (título, texto, campos, declaração, botões, validações e mensagens) e mensagens de proposta cancelada ou expirada.
- **FR-012**: Na página em inglês, nenhum texto fixo MUST aparecer em português. Dados digitados pelo consultor MUST aparecer exatamente como digitados.
- **FR-013**: Datas na página em inglês MUST seguir o padrão americano por extenso (ex.: "October 24, 2026"); o horário da indicação de assinada MUST usar o formato de 12 horas (ex.: "10:24 AM"), no horário de São Paulo.
- **FR-014**: Na página em inglês, valores em dólar MUST aparecer como "US$" com separador de milhar em vírgula e centavos com ponto somente quando houver (ex.: "US$ 50,000", "US$ 50,000.50"); percentuais MUST usar ponto decimal (ex.: "17.5%").
- **FR-015**: Na página em inglês, os tipos de investimento, a forma de pagamento e a garantia MUST aparecer em inglês: tipos Retainer, Success fee, Fixed fee; pagamento "{entrada}% upfront + {final}% upon completion" ou "100% upon completion"; garantia "1 month" ou "{N} months".
- **FR-016**: Na página em inglês, o botão de WhatsApp MUST abrir a conversa com a mensagem "Hello, I would like to talk about Ocean Talent Solutions' commercial proposal for {Empresa}."
- **FR-017**: Na página em inglês, o PDF MUST ser gerado com o nome de arquivo "Ocean Commercial Proposal - {Empresa}".
- **FR-018**: A página em inglês MUST declarar o idioma inglês ao navegador (para tradutores automáticos e leitores de tela não tratarem a página como português), e a página em português MUST declarar português.
- **FR-019**: Mensagens de erro recebidas do servidor durante o aceite MUST ser exibidas ao cliente no idioma da proposta.

**Aceite e integridade**

- **FR-020**: O aceite da proposta em dólar MUST seguir as mesmas regras e evidências do aceite atual (assinatura única, expiração, cancelamento, versão vigente), mudando apenas o idioma da janela e das mensagens.
- **FR-021**: A impressão digital do conteúdo aceito MUST incluir a moeda da proposta, de forma que seja possível demonstrar em que moeda e idioma a proposta foi aceita.
- **FR-022**: Uma proposta assinada MUST continuar exibida na moeda e no idioma em que foi aceita.

**Traduções**

- **FR-023**: Os textos fixos de cada idioma MUST ficar centralizados em um conjunto de traduções por idioma, separado do layout, de modo que alterar uma tradução não exija mexer na estrutura da página.
- **FR-024**: Todo texto fixo MUST ter tradução nos dois idiomas; a página MUST NÃO exibir chaves de tradução nem textos vazios.

### Key Entities

- **Proposta** (existente): passa a ter **moeda** (Real ou Dólar) nas propostas Executive Search. A moeda é definida na criação, não muda depois e determina o idioma da página do cliente. Propostas simples não têm moeda.
- **Idioma da apresentação** (derivado): português (Real) ou inglês (Dólar). Não é guardado separadamente; vem da moeda.
- **Conjunto de traduções** (novo): textos fixos do modelo Executive Search em cada idioma, mais as regras de formatação de datas, números e moeda de cada idioma.
- **Modelo de investimento** (existente): a taxa em valor passa a ser interpretada na moeda da proposta.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das propostas em dólar, a página do cliente não exibe nenhum texto fixo em português.
- **SC-002**: Em comparação lado a lado, as páginas em português e em inglês de uma mesma proposta têm as mesmas seções, na mesma ordem, com a mesma identidade visual, no computador e no celular.
- **SC-003**: 100% das propostas criadas antes desta feature continuam abrindo exatamente como antes.
- **SC-004**: O consultor escolhe a moeda e cria uma proposta em dólar sem passos adicionais além da escolha da moeda (o tempo de criação continua abaixo de 3 minutos).
- **SC-005**: Um cliente internacional conclui o aceite da proposta em inglês em menos de 1 minuto, sem encontrar texto em português.
- **SC-006**: Uma alteração de texto em uma tradução aparece na página do idioma correspondente sem nenhuma alteração no layout.

## Assumptions

- **Tradução inicial**: feita pela equipe de desenvolvimento a partir dos textos do modelo em português, com terminologia comercial usual de executive search em inglês; a Ocean revisa antes de enviar propostas em dólar a clientes.
- **Conteúdo fixo traduzido literalmente**: as Observações (inclusive a de impostos de até 19,55% e a de despesas de viagem), Shortlist e SLA mantêm o mesmo conteúdo, apenas traduzidos. Ajustes de conteúdo para clientes internacionais ficam para a revisão da Ocean.
- **Só dois idiomas e duas moedas**: português/Real e inglês/Dólar. Outras moedas (ex.: euro) e idiomas ficam fora do escopo, mas a organização das traduções permite incluí-los depois.
- **Sem conversão de valores**: o consultor digita os valores já na moeda escolhida; não há cotação nem conversão.
- **Interface interna em português**: formulário, lista, detalhe e perfil do Proposal não são traduzidos.
- **Mensagem de link inválido**: continua em português, porque não há proposta para identificar o idioma.
- **Logo, fotos e marca**: as mesmas nas duas versões.
- **Telefone**: a regra atual de código do país (+55 quando omitido) continua valendo nas duas moedas.
- **Escopo**: apenas o modelo Executive Search; propostas simples não ganham moeda nem idioma.
