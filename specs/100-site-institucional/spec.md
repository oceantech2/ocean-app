# Feature Specification: Site institucional da Ocean (landing page, Soluções e Vagas)

**Feature Branch**: `100-site-institucional`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User description: "tenho essa landingpage (ocean-talent-solutions.html) preciso que ela seja a landingpage da ocean. Rode o speckit; quanto à questão de vaga implemente meio hardcoded mesmo porque estamos validando ainda como vamos fazer."

## Contexto

A Ocean Talent Solutions tem hoje três endereços em uso: `app.oceantalentsolutions.com` (ERP interno), `proposal.oceantalentsolutions.com` (página da proposta para o cliente) e `consultantpanel.oceantalentsolutions.com` (painel dos consultores). O domínio principal, `oceantalentsolutions.com`, ainda não tem o site institucional da empresa.

A empresa já aprovou o visual e o conteúdo do site num protótipo (exportação estática da página inicial e o protótipo navegável com as páginas Soluções, Vagas e Notícias). Esta feature publica esse site no domínio principal, mantendo o visual aprovado.

Como a forma de receber contatos e candidaturas ainda está em validação, os formulários do site mostram confirmação ao visitante, mas ainda não entregam a mensagem a ninguém. As vagas são uma lista fixa, sem cadastro.

## Clarifications

### Session 2026-10-27

- Q: Quais páginas o site público deve ter nesta entrega? → A: Home, Soluções e Vagas, com o conteúdo do protótipo. Notícias fica fora e não aparece no menu.
- Q: Para onde vão o formulário de contato e o "Tenho interesse" das vagas? → A: Ainda para lugar nenhum. O visitante preenche, recebe a confirmação, e nada é enviado ou guardado (como no protótipo).
- Q: Quais vagas aparecem na lista fixa? → A: As 5 vagas de exemplo do protótipo (CFO, VP de Engenharia, Diretor Comercial, Head de RH, Gerente de Operações), fáceis de trocar depois num único lugar.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitante conhece a Ocean pela página inicial (Priority: P1)

Um potencial cliente ou profissional acessa `oceantalentsolutions.com` e vê a página inicial aprovada: cabeçalho com logo e menu, chamada principal ("Conectando pessoas para impulsionar negócios."), números (500+ projetos, 18+ anos, Boutique), Quem Somos com as 4 soluções, Valores, Equipe com fotos e LinkedIn, empresas clientes (logos), Resultados (3 casos), Contato e rodapé, além do botão flutuante de WhatsApp.

**Why this priority**: É a vitrine da empresa e o pedido principal; sozinha já entrega o site institucional.

**Independent Test**: Abrir o domínio principal no computador e no celular e comparar seção a seção com a exportação aprovada (textos, imagens, cores, ordem das seções).

**Acceptance Scenarios**:

1. **Given** o visitante em `oceantalentsolutions.com` ou `www.oceantalentsolutions.com`, **When** a página carrega, **Then** vê a página inicial com todas as seções da exportação aprovada, na mesma ordem, com os mesmos textos e imagens.
2. **Given** a página inicial, **When** o visitante clica em "Fale com um consultor" ou em "Contato" no menu, **Then** a página rola até a seção de contato.
3. **Given** a seção Equipe, **When** o visitante clica no ícone de LinkedIn de um consultor, **Then** o perfil do consultor abre em nova aba.
4. **Given** qualquer página do site, **When** o visitante clica no botão flutuante de WhatsApp, **Then** abre uma conversa com o número comercial da Ocean (+55 21 97554-0224) com a mensagem inicial já preenchida.
5. **Given** um celular, **When** o visitante navega pela página inicial, **Then** todo o conteúdo fica legível, sem rolagem horizontal, e o menu permite chegar a Soluções, Vagas e Contato.

---

### User Story 2 - Visitante consulta as vagas e demonstra interesse (Priority: P1)

Um profissional abre a página Vagas, vê as vagas em andamento, filtra por área e nível e clica em "Tenho interesse" numa vaga. Preenche nome, e-mail, LinkedIn e uma mensagem opcional e recebe a confirmação "Interesse registrado. Em breve retornaremos.".

**Why this priority**: Pedido explícito do usuário; é a página que a Ocean quer validar com o mercado.

**Independent Test**: Abrir `/vagas`, combinar os filtros, abrir o "Tenho interesse" de uma vaga, tentar enviar vazio (ver erros) e depois enviar preenchido (ver confirmação e formulário fechado).

**Acceptance Scenarios**:

1. **Given** a página Vagas, **When** carrega, **Then** mostra as 5 vagas da lista, cada uma com área, nível, título, local, resumo e o botão "Tenho interesse", e o total "5 vagas".
2. **Given** os filtros Área e Nível, **When** o visitante escolhe "Tecnologia" em Área, **Then** só aparece "VP de Engenharia" e o total vira "1 vaga".
3. **Given** uma combinação de filtros sem resultado (ex.: Área "Finanças" e Nível "Gerência"), **When** aplicada, **Then** aparece "Nenhuma vaga encontrada para os filtros atuais." e o total "0 vagas".
4. **Given** uma vaga, **When** o visitante clica em "Tenho interesse", **Then** abre um formulário com o título da vaga e "área · nível · local" no topo.
5. **Given** o formulário de interesse, **When** o visitante envia sem nome, com e-mail inválido ou sem um endereço de LinkedIn válido, **Then** vê a mensagem de erro no campo correspondente e nada é enviado.
6. **Given** o formulário preenchido corretamente, **When** o visitante clica em "Enviar interesse", **Then** vê "Interesse registrado. Em breve retornaremos.", o formulário fecha e os campos ficam limpos para a próxima vez.

---

### User Story 3 - Visitante conhece as soluções em detalhe (Priority: P2)

Um potencial cliente clica em "Ver soluções" ou em "Saiba mais" num card de solução e chega à página Soluções. No topo há 4 abas (Executive Search, Offshore Talent, Outsourcing, Development & Outplacement); a aba escolhida mostra o conteúdo daquela solução (Executive Search com a metodologia em 6 etapas, Offshore Talent com áreas e cargos, Outsourcing com benefícios, Development & Outplacement com Assessment, Outplacement e Soluções Personalizadas). Abaixo vêm Setores que atendemos, Por que escolher a Ocean e uma chamada final para falar com um consultor ou ver as vagas.

**Why this priority**: Complementa a página inicial para quem quer entender a oferta antes de entrar em contato, mas o site já tem valor sem ela.

**Independent Test**: Abrir `/solucoes`, trocar entre as 4 abas e pelos links "← anterior / próxima →", abrir cada "Saiba mais" da página inicial e conferir os textos com o protótipo.

**Acceptance Scenarios**:

1. **Given** a página Soluções, **When** carrega sem indicação de solução, **Then** mostra a aba Executive Search aberta e as demais seções do protótipo na mesma ordem e com os mesmos textos.
2. **Given** as abas no topo, **When** o visitante clica numa delas ou nos links "anterior/próxima", **Then** o conteúdo da solução escolhida aparece, a página rola até ele e o endereço passa a indicar a solução (permitindo compartilhar o link).
3. **Given** o card "Offshore Talent" na página inicial, **When** o visitante clica em "Saiba mais", **Then** abre a página Soluções já na aba Offshore Talent (o mesmo vale para os outros 3 cards).
4. **Given** a chamada final, **When** o visitante clica em "Falar com um consultor", **Then** é levado à seção de contato da página inicial; **When** clica em "Ver nossas vagas", **Then** vai para a página Vagas.

---

### User Story 4 - Visitante preenche o formulário de contato (Priority: P2)

Na seção Contato da página inicial, o visitante preenche nome, e-mail, telefone, LinkedIn (opcional), cargo, empresa, "Sou..." (Empresa buscando contratar, Profissional em busca de oportunidades, Outro) e mensagem (opcional), e recebe uma confirmação de envio.

**Why this priority**: O formulário faz parte do visual aprovado; como ainda não há destino definido para as mensagens, o valor imediato é a validação da experiência.

**Independent Test**: Enviar o formulário vazio (ver erros nos campos obrigatórios) e depois preenchido (ver confirmação e formulário limpo).

**Acceptance Scenarios**:

1. **Given** o formulário de contato, **When** o visitante envia sem preencher os campos obrigatórios (nome, e-mail, telefone, cargo, empresa, "Sou..."), **Then** vê a mensagem de erro em cada campo pendente.
2. **Given** o formulário preenchido corretamente, **When** o visitante envia, **Then** vê uma confirmação de que a mensagem foi recebida e os campos voltam ao estado inicial.
3. **Given** a seção Contato, **When** o visitante clica no telefone, no e-mail ou em "Ocean no LinkedIn", **Then** abre, respectivamente, o WhatsApp, o programa de e-mail com `contato@oceantalentsolutions.com` ou a página da Ocean no LinkedIn.

---

### Edge Cases

- **Endereço inexistente no site** (ex.: `oceantalentsolutions.com/noticias` ou `/qualquer-coisa`): o visitante é levado à página inicial.
- **ERP, Proposal e Consultant Panel**: continuam exatamente como hoje nos seus endereços; o site não aparece neles e eles não aparecem no domínio principal.
- **Seletor de idioma PT | EN do protótipo**: não aparece, porque só existe a versão em português nesta entrega.
- **Link "Notícias"**: não aparece no menu nem no rodapé.
- **Número de WhatsApp**: o botão flutuante da exportação usa um número de exemplo; o site usa o número comercial da seção Contato.
- **Envio repetido do mesmo formulário**: cada envio mostra a confirmação de novo; nada é guardado, então não há duplicidade.
- **Visitante sem JavaScript ou com conexão lenta**: as imagens grandes (fundo da página, fotos) não podem impedir a leitura dos textos; o conteúdo aparece mesmo antes de as imagens terminarem de carregar.
- **Ambiente de desenvolvimento**: o site fica acessível localmente num endereço equivalente ao de produção, sem afetar o ERP local.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O domínio principal (`oceantalentsolutions.com` e `www.oceantalentsolutions.com`) MUST servir o site institucional, sem login.
- **FR-002**: A página inicial MUST reproduzir a exportação aprovada: cabeçalho (logo "Ocean talent solutions" e menu Home, Soluções, Vagas, Contato), chamada principal com os botões "Ver soluções" e "Fale com um consultor", números, Quem Somos com os 4 cards de solução, Valores (5 itens), Equipe (8 consultores com foto, cargo e LinkedIn), "Empresas que confiam na Ocean" (12 logos), "Resultados que falam por nós" (3 casos), Contato e rodapé.
- **FR-003**: O site MUST manter as cores, tipografia, imagem de fundo e logos da exportação aprovada.
- **FR-004**: A página Vagas MUST listar as vagas de uma lista fixa mantida num único lugar, mostrando área, nível, título, local e resumo de cada vaga e o total exibido.
- **FR-005**: A página Vagas MUST permitir filtrar por Área (Todas, Finanças, Tecnologia, Comercial, Recursos Humanos, Operações) e Nível (Todos, Gerência, Diretoria, VP, C-Level), combinando os dois filtros.
- **FR-006**: O botão "Tenho interesse" MUST abrir um formulário com nome, e-mail, LinkedIn (endereço válido) e mensagem opcional, com validação por campo e confirmação "Interesse registrado. Em breve retornaremos." ao enviar.
- **FR-007**: A página Soluções MUST reproduzir o conteúdo do protótipo (4 soluções em abas, metodologia, áreas e cargos offshore, benefícios do outsourcing, setores, diferenciais e chamada final), e o endereço MUST permitir abrir diretamente uma solução específica.
- **FR-008**: O formulário de contato MUST validar os campos obrigatórios (nome, e-mail, telefone, cargo, empresa, "Sou...") e mostrar confirmação ao enviar.
- **FR-009**: Nesta entrega, os formulários de contato e de interesse MUST NOT enviar, gravar ou encaminhar os dados preenchidos para nenhum lugar.
- **FR-010**: O botão flutuante de WhatsApp e o telefone da seção Contato MUST abrir conversa com +55 21 97554-0224 com a mensagem "Olá! Vim pelo site da Ocean e gostaria de saber mais."
- **FR-011**: O site MUST funcionar em computador e celular, com menu acessível em telas pequenas.
- **FR-012**: O ERP, o Proposal e o Consultant Panel MUST continuar funcionando sem alteração nos seus endereços atuais.
- **FR-013**: O site MUST NOT exibir Notícias nem o seletor de idioma EN nesta entrega.
- **FR-014**: A aba do navegador MUST mostrar o título do site da Ocean e o ícone da Ocean.

### Key Entities

- **Vaga**: oportunidade divulgada no site; tem título, área, nível, local e resumo. Lista fixa nesta entrega.
- **Manifestação de interesse**: o que o visitante preenche ao clicar em "Tenho interesse" (vaga, nome, e-mail, LinkedIn, mensagem). Nesta entrega não é guardada.
- **Contato**: o que o visitante preenche no formulário da página inicial (nome, e-mail, telefone, LinkedIn, cargo, empresa, tipo, mensagem). Nesta entrega não é guardado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das seções, textos e imagens da exportação aprovada aparecem na página inicial publicada.
- **SC-002**: Um visitante chega da página inicial à página Vagas ou Soluções em 1 clique.
- **SC-003**: Um visitante encontra uma vaga pelos filtros e conclui o "Tenho interesse" em menos de 1 minuto.
- **SC-004**: Os textos da página inicial ficam visíveis em até 3 segundos numa conexão móvel comum.
- **SC-005**: 0 alterações de comportamento no ERP, Proposal e Consultant Panel após a publicação.
- **SC-006**: Trocar, incluir ou remover uma vaga exige mudar um único lugar.

## Assumptions

- A Ocean aponta o DNS de `oceantalentsolutions.com` e `www.oceantalentsolutions.com` para a mesma hospedagem do ERP e do Proposal e adiciona os domínios ao projeto; até lá o site pode ser conferido no ambiente local.
- Os conteúdos (textos, fotos, logos de clientes, casos, vagas) são os do protótipo aprovado; a Ocean garante que pode publicar fotos da equipe e logos dos clientes.
- O botão "Saiba mais" de cada card de solução leva à página Soluções, já com a aba da solução correspondente aberta (no protótipo todos levavam à primeira aba).
- O site mantém a verificação do Google Search Console já presente na exportação.
- O site é só em português nesta entrega; versão em inglês e Notícias ficam para outra feature.
- Destino real das mensagens (e-mail, banco, ERP) e cadastro de vagas pelo ERP ficam para outra feature, depois da validação.
- Não há link para o ERP no site público.
