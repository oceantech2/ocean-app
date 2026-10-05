# Feature Specification: Modelos de Proposta por Divisão (Executive Search)

**Feature Branch**: `080-proposta-modelo-executive-search`

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "recebi esses 2 arquivos (Proposta_Comercial_Executive_Search.html e Instrucoes_Desenvolvedor_Proposta_Comercial.md) onde dentro do menu de propostas da ocean terá um input com várias opções, no momento vai ter só o executive search, então dentro desse html tem vários campos que o usuário preencherá e então vai gerar um html igual esse de exemplo porém com os dados preenchidos"

**Baseline**: Hoje o Proposal (specs `077-plataforma-propostas` e `079-proposta-editar-antes-assinatura`) cria propostas com um formulário simples (nome do cliente, CNPJ, valor, toggle de imposto com alíquota e validade) e gera uma página pública genérica com esses dados e o botão **Assinar**. A spec 077 já previa que o layout definitivo e a lista de campos viriam de um HTML de referência. Esse material chegou: um modelo de proposta comercial da **Ocean Talent Solutions** para a divisão **Executive Search** (`Proposta_Comercial_Executive_Search.html`) e as instruções ao desenvolvedor (`Instrucoes_Desenvolvedor_Proposta_Comercial.md`). Esta feature faz o Proposal gerar a página do cliente a partir desse modelo, com os dados preenchidos pelo usuário, e prepara a criação para várias divisões (por enquanto, só Executive Search).

## Clarifications

### Session 2026-10-05

- Q: De onde vêm nome, cargo, telefone e e-mail do consultor, já que o cadastro de usuários só tem login? → A: De um **perfil do consultor** no próprio Proposal, preenchido uma vez por cada usuário; o formulário da proposta vem preenchido com o perfil e pode ser ajustado por proposta.
- Q: O que fazer com CNPJ, valor e toggle de imposto/alíquota, que não existem no modelo HTML? → A: Remover os três nas propostas por modelo; a proposta passa a ter só os campos do HTML. Propostas antigas continuam como estão.
- Q: A validade da proposta deve aparecer para o cliente na página do modelo? → A: Sim, na seção "Vamos avançar?", com a frase "Esta proposta é válida até dd/mm/aaaa."
- Q: O que "Criar cópia" faz numa proposta simples (criada antes desta feature)? → A: A ação "Criar cópia" não aparece para propostas simples.
- Q: Quais as regras do campo Data da proposta? → A: Editável (padrão = hoje), aceita passado ou futuro, mas não pode ser posterior à validade; na edição, mantém o valor atual até o usuário mudar.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Escolher o modelo e preencher a proposta Executive Search (Priority: P1)

Na criação de uma nova proposta, o usuário do Proposal primeiro escolhe o **modelo (divisão)** em uma lista. Hoje a lista tem só **Executive Search**; no futuro terá também Offshore Talent, Outsourcing e Outplacement & Development. Escolhido o modelo, o formulário mostra os campos personalizáveis do modelo: empresa, data, setor, dados do consultor, nome do projeto, de 1 a 3 modelos de investimento (tipo, taxa e forma de pagamento) e prazo de garantia. Ao confirmar, a proposta é criada e o link é exibido, como já acontece hoje.

**Why this priority**: É o pedido central. Sem o formulário com os campos do modelo, não há como gerar a proposta no novo formato.

**Independent Test**: Criar uma proposta escolhendo Executive Search, preencher todos os campos com os valores de exemplo do HTML de referência (Arxen, 24/10/2026, Infraestrutura, Posição 1, Retainer 15% com 40% de entrada, Sucesso 18% sem entrada, Valor fechado R$ 50.000 com 50% de entrada, garantia de 4 meses) e confirmar que a proposta é criada e o link é exibido.

**Acceptance Scenarios**:

1. **Given** o usuário abre **Nova proposta**, **When** a tela carrega, **Then** a primeira escolha é o modelo (divisão), e a lista mostra apenas os modelos disponíveis (hoje, só **Executive Search**).
2. **Given** existe um único modelo disponível, **When** o usuário abre **Nova proposta**, **Then** esse modelo já vem selecionado e o formulário do modelo é exibido sem passo extra.
3. **Given** o modelo **Executive Search** selecionado, **When** o formulário aparece, **Then** mostra os campos: Empresa, Data, Setor, Consultor (nome, cargo, telefone e e-mail), Nome do projeto, Modelos de investimento e Garantia (em meses).
4. **Given** o formulário aberto, **When** carrega, **Then** a Data vem preenchida com a data de hoje e os dados do consultor vêm preenchidos com o perfil do consultor do usuário logado, todos editáveis.
5. **Given** o formulário do modelo, **When** exibido, **Then** não há campos de CNPJ, valor nem imposto/alíquota.
6. **Given** a seção de investimento, **When** o usuário marca entre 1 e 3 opções entre **Retainer**, **Sucesso** e **Valor fechado**, **Then** aparece um quadro por opção marcada, cada um com Taxa e Forma de pagamento.
7. **Given** um quadro de investimento, **When** o usuário informa a Taxa, **Then** pode escolher entre percentual (ex.: 15%) e valor em reais (ex.: R$ 50.000).
8. **Given** um quadro de investimento, **When** o usuário informa o percentual de entrada (opcional), **Then** o sistema calcula e exibe o percentual após conclusão como o complemento até 100%; sem entrada, a forma de pagamento fica "100% após conclusão".
9. **Given** campos obrigatórios vazios ou inválidos (nenhum modelo de investimento marcado, taxa vazia ou zero, entrada fora de 0 a 99%, e-mail ou telefone do consultor inválidos, garantia vazia ou zero, Data posterior à validade), **When** o usuário tenta confirmar, **Then** o sistema bloqueia e indica cada campo com erro.

---

### User Story 2 - Cliente recebe a proposta no layout do modelo, com os dados preenchidos (Priority: P1)

O cliente abre o link e vê uma página idêntica ao HTML de referência da Executive Search (capa com foto do setor e logo da divisão, navegação, Serviço, Metodologia, Investimento, Garantias e condições, "Vamos avançar?", Contato e rodapé), com todos os marcadores (`[Empresa]`, `[Data]`, `[Taxa]` etc.) substituídos pelos dados da proposta.

**Why this priority**: É o resultado que o usuário pediu: "gerar um html igual esse de exemplo porém com os dados preenchidos". É o que o cliente efetivamente vê.

**Independent Test**: Abrir em janela anônima o link da proposta criada no teste da US1 e comparar lado a lado com o HTML de referência: textos fixos, seções, cores e disposição iguais; nenhum marcador entre colchetes visível; cada dado preenchido aparece em todos os lugares onde o modelo o usa.

**Acceptance Scenarios**:

1. **Given** uma proposta Executive Search pendente, **When** o cliente abre o link, **Then** vê o layout do modelo com Empresa em "Preparada para", Data na capa e no rodapé, nome do consultor na capa e no bloco de contato, cargo, telefone e e-mail do consultor no bloco de contato, Nome do projeto como título do Investimento e a Garantia em "Garantias e condições".
2. **Given** a proposta tem N modelos de investimento (1 a 3), **When** o cliente abre o link, **Then** vê exatamente N quadros, na ordem Retainer, Sucesso, Valor fechado, cada um com o título do tipo, a taxa ("15%" ou "R$ 50.000") e a forma de pagamento ("40% de entrada + 60% após conclusão" ou "100% após conclusão").
3. **Given** o setor escolhido, **When** o cliente abre o link, **Then** a capa mostra a foto de fundo correspondente ao setor.
4. **Given** qualquer proposta gerada, **When** o cliente abre o link, **Then** nenhum marcador entre colchetes aparece na página, e o modo de destaque dos campos do modelo (usado só pelo desenvolvedor) não pode ser ativado.
5. **Given** a página aberta, **When** o cliente aciona **Falar com o consultor**, **Then** abre a conversa de WhatsApp com o telefone do consultor da proposta e uma mensagem pronta que cita a empresa.
6. **Given** a página aberta, **When** o cliente aciona **Baixar PDF**, **Then** abre a impressão do navegador com o nome de arquivo "Proposta Comercial Ocean - [Empresa]" (com o nome real da empresa), sem os botões na versão impressa.
7. **Given** a página do bloco de contato, **When** exibida, **Then** LinkedIn e site são sempre os da Ocean (`/company/ocean-talent-solutions` e `www.oceantalentsolutions.com`), independentemente do consultor.
8. **Given** a página aberta em um celular, **When** o cliente navega, **Then** todo o conteúdo e os botões são legíveis e utilizáveis sem zoom.
9. **Given** uma proposta pendente, **When** o cliente chega à seção "Vamos avançar?", **Then** vê a frase "Esta proposta é válida até dd/mm/aaaa." com a data de validade da proposta.

---

### User Story 3 - Cliente aceita a proposta pelo botão do modelo (Priority: P1)

O botão **Aceitar proposta** do modelo passa a usar o fluxo de assinatura que o Proposal já tem: o cliente confirma o aceite informando nome completo e e-mail e marcando a declaração de aceite, e a proposta volta para a Ocean como **Assinada**, com as mesmas evidências registradas hoje.

**Why this priority**: Fecha o ciclo da proposta no novo formato. O modelo de referência traz um aceite provisório (abre um e-mail ou envia para um endereço de ERP ainda não definido); o Proposal já é esse destino.

**Independent Test**: No link da proposta Executive Search, acionar **Aceitar proposta**, preencher nome e e-mail, confirmar, recarregar a página e conferir que ela aparece como assinada e que o detalhe no Proposal mostra a assinatura com as evidências.

**Acceptance Scenarios**:

1. **Given** uma proposta Executive Search pendente, **When** o cliente aciona **Aceitar proposta**, **Then** abre a janela de confirmação do modelo, com os campos nome completo, e-mail e declaração de aceite.
2. **Given** a janela de aceite, **When** o cliente preenche os dados válidos e confirma, **Then** a proposta passa a **Assinada**, o cliente vê a mensagem "Aceite registrado. Nossa equipe enviará o contrato em breve." e o botão **Aceitar proposta** deixa de aparecer.
3. **Given** uma proposta já assinada, **When** alguém abre o link, **Then** vê a proposta no layout do modelo, com a indicação de assinada (data e nome de quem assinou), sem o botão **Aceitar proposta**.
4. **Given** uma proposta cancelada, expirada ou inexistente, **When** alguém abre o link, **Then** vê as mesmas mensagens de hoje (indisponível, expirada ou não encontrada), sem os dados da proposta.
5. **Given** o cliente tenta aceitar, **When** o registro falha, **Then** vê a mensagem de erro do modelo ("não foi possível registrar o aceite. Tente novamente ou fale com o consultor.") e pode tentar de novo.

---

### User Story 4 - Acompanhar, editar e copiar propostas no novo formato (Priority: P2)

O usuário continua usando a lista, o detalhe, a edição antes da assinatura (spec 079), o cancelamento e a **Criar cópia**, agora com os campos do modelo. A lista mostra o modelo de cada proposta.

**Why this priority**: Mantém as funções que já existem funcionando com o novo formato, mas a criação, a página do cliente e o aceite (US1 a US3) já entregam o valor principal.

**Independent Test**: Criar duas propostas Executive Search, editar uma (trocar a taxa de um investimento e remover outro), copiar a outra e conferir lista, detalhe, histórico de edições e página do cliente.

**Acceptance Scenarios**:

1. **Given** propostas criadas, **When** o usuário abre a lista, **Then** vê, para cada uma, empresa, modelo (divisão), nome do projeto, data, validade e status.
2. **Given** uma proposta Executive Search pendente, **When** o usuário aciona **Editar**, **Then** o formulário do modelo abre preenchido com todos os dados atuais, inclusive os quadros de investimento, e as regras da spec 079 continuam valendo (mesmo link, volta para Aguardando assinatura, histórico de edições, bloqueio após assinatura).
3. **Given** uma edição salva, **When** o usuário abre o detalhe, **Then** o histórico mostra os campos alterados com valor anterior e novo valor, inclusive inclusão, remoção ou alteração de modelos de investimento.
4. **Given** uma proposta Executive Search, **When** o usuário aciona **Criar cópia**, **Then** o formulário de nova proposta abre com o mesmo modelo e todos os campos copiados, com a Data de hoje.
5. **Given** o detalhe de uma proposta, **When** o usuário aciona **Abrir página do cliente**, **Then** vê a página no layout do modelo, sem registrar visualização.
6. **Given** o detalhe de uma proposta simples (criada antes desta feature), **When** exibido, **Then** a ação **Criar cópia** não aparece; as demais ações (copiar link, abrir página do cliente, editar quando permitido, cancelar) continuam disponíveis.

---

### User Story 5 - Manter o perfil do consultor (Priority: P2)

Cada usuário do Proposal preenche uma vez o seu **perfil do consultor** (nome, cargo, telefone e e-mail), que passa a preencher automaticamente esses campos em toda nova proposta.

**Why this priority**: Evita redigitar os mesmos dados a cada proposta e reduz erros de contato, mas a proposta pode ser criada sem o perfil, preenchendo os campos à mão (US1).

**Independent Test**: Preencher o perfil do consultor, abrir **Nova proposta** e conferir que os quatro campos do consultor vêm preenchidos; alterar o telefone só na proposta e conferir que o perfil não muda.

**Acceptance Scenarios**:

1. **Given** um usuário do Proposal, **When** abre o seu perfil do consultor, **Then** pode informar e salvar nome, cargo, telefone e e-mail, com as mesmas validações do formulário da proposta.
2. **Given** o perfil preenchido, **When** o usuário abre **Nova proposta**, **Then** os campos do consultor vêm preenchidos com o perfil.
3. **Given** o perfil vazio ou incompleto, **When** o usuário abre **Nova proposta**, **Then** os campos sem dado vêm vazios, continuam obrigatórios, e a tela indica que ele pode preencher o perfil para não redigitar.
4. **Given** o usuário altera os dados do consultor em uma proposta, **When** salva a proposta, **Then** o perfil não é alterado.
5. **Given** o usuário altera o perfil, **When** abre propostas já criadas, **Then** elas mantêm os dados do consultor com que foram geradas.
6. **Given** um usuário, **When** acessa o Proposal, **Then** só pode ver e alterar o próprio perfil.

---

### Edge Cases

- **Taxa em percentual com casas decimais** (ex.: 17,5%): aceita até 2 casas e exibe no formato brasileiro ("17,5%"); valores em reais são exibidos com separador de milhar e sem centavos quando inteiros ("R$ 50.000"), e com centavos quando houver ("R$ 50.000,50").
- **Entrada de 0%**: tratada como "sem entrada"; a forma de pagamento fica "100% após conclusão".
- **Garantia de 1 mês**: exibida no singular ("1 mês"); acima de 1, no plural ("4 meses").
- **Textos longos** (empresa, nome do projeto ou cargo extensos): quebram linha sem sobrepor outros elementos nem cortar o texto, no computador e no celular.
- **Caracteres especiais** nos campos (aspas, apóstrofo como em "D'Ave", `<`, `&`): aparecem exatamente como digitados, sem quebrar a página nem executar conteúdo.
- **Telefone com ou sem máscara/código do país**: o link de ligar e o WhatsApp usam só os dígitos; se o usuário não informar o código do país, o sistema assume +55.
- **Propostas antigas** (criadas no formato simples antes desta feature): continuam abrindo com a página atual e mantêm o status, a assinatura e o histórico; não são convertidas para o novo modelo.
- **Foto do setor indisponível**: se a foto de um setor não puder ser carregada, a capa mantém a cor azul-marinho do modelo, com o texto legível.
- **Mudança futura do texto do modelo** (Serviço, Metodologia, Observações): propostas já assinadas continuam exibindo o conteúdo que o cliente aceitou.
- **Edição troca de modelo**: não é permitido trocar o modelo (divisão) de uma proposta existente; para outro modelo, cria-se uma nova proposta.

## Requirements *(mandatory)*

### Functional Requirements

**Escolha do modelo**

- **FR-001**: A criação de proposta MUST começar pela escolha do modelo (divisão). A lista MUST mostrar apenas os modelos disponíveis; nesta entrega, somente **Executive Search**.
- **FR-002**: Quando houver apenas um modelo disponível, ele MUST vir pré-selecionado.
- **FR-003**: O modelo de uma proposta MUST ser definido na criação e MUST NÃO poder ser alterado depois.
- **FR-004**: O sistema MUST permitir incluir novos modelos (Offshore Talent, Outsourcing, Outplacement & Development) no futuro com os mesmos campos personalizáveis, trocando apenas o conteúdo fixo da divisão (logo da capa, Serviço, Metodologia, Investimento e Garantias), sem alterar o formulário.

**Campos do modelo Executive Search**

- **FR-005**: O formulário MUST ter os campos: Empresa (texto, obrigatório), Data (DD/MM/AAAA, obrigatória, padrão = hoje, aceita datas passadas ou futuras, mas MUST NÃO ser posterior à validade), Setor (lista obrigatória: Petróleo & Gás, Energia, Infraestrutura, Mineração, Indústria & Serviços), Consultor: nome, cargo, telefone e e-mail (obrigatórios), Nome do projeto (texto, obrigatório), Modelos de investimento (1 a 3) e Garantia (número inteiro de meses, obrigatório, maior que zero).
- **FR-006**: Os dados do consultor MUST vir preenchidos com o perfil do consultor do usuário logado (FR-031) e MUST poder ser ajustados na proposta sem alterar o perfil. Campos sem dado no perfil vêm vazios e continuam obrigatórios.
- **FR-007**: O usuário MUST marcar de 1 a 3 modelos de investimento entre **Retainer**, **Sucesso** e **Valor fechado**, cada tipo no máximo uma vez. Cada tipo marcado MUST ter Taxa e Forma de pagamento.
- **FR-008**: A Taxa MUST ser informada como percentual (maior que 0 e menor que 100, até 2 casas decimais, aplicado sobre a remuneração anual) ou como valor em reais (maior que zero), à escolha do usuário em cada quadro.
- **FR-009**: A Forma de pagamento MUST ter percentual de entrada opcional (0 a 99, inteiro) e percentual após conclusão calculado automaticamente como 100 menos a entrada. Com entrada, MUST ser exibida como "{entrada}% de entrada + {final}% após conclusão"; sem entrada (vazia ou 0), como "100% após conclusão".
- **FR-010**: Cada proposta MUST ter um único projeto.
- **FR-011**: A proposta MUST manter a data de validade (padrão: hoje + 30 dias, editável) e as regras de expiração da spec 077.
- **FR-012**: As propostas por modelo MUST NÃO ter CNPJ, valor nem imposto/alíquota. A criação de novas propostas MUST acontecer somente pelos modelos; o formulário simples atual deixa de ser oferecido para novas propostas.

**Página do cliente**

- **FR-013**: A página pública de uma proposta Executive Search MUST reproduzir o HTML de referência: mesmas seções, textos fixos, identidade visual (cores, fontes, logo da divisão), navegação, responsividade e versão para impressão, substituindo cada marcador pelo dado da proposta em todos os lugares onde o modelo o usa.
- **FR-014**: Nenhum marcador entre colchetes MUST aparecer na página gerada, e o modo de destaque de campos do modelo (`?campos` / Shift+C) MUST NÃO estar disponível ao cliente.
- **FR-015**: A capa MUST exibir a foto de fundo padrão do setor escolhido, com a camada azul-marinho do modelo por cima para manter o texto legível.
- **FR-016**: Os quadros de investimento MUST aparecer na ordem Retainer, Sucesso, Valor fechado, somente para os tipos marcados, com taxa e forma de pagamento formatadas conforme FR-008 e FR-009.
- **FR-017**: O conteúdo fixo MUST permanecer igual ao modelo e MUST NÃO ser editável por proposta: textos de Serviço e Metodologia, Shortlist (3 a 5 candidatos), SLA (5 a 10 dias úteis), Observações de Investimento e de Garantias, LinkedIn e site da Ocean.
- **FR-018**: O botão **Falar com o consultor** MUST abrir o WhatsApp do telefone do consultor (somente dígitos) com a mensagem "Olá, gostaria de falar sobre a proposta comercial da Ocean Talent Solutions para a {Empresa}."; o telefone e o e-mail do bloco de contato MUST abrir ligação e e-mail, respectivamente.
- **FR-019**: O botão **Baixar PDF** MUST abrir a impressão do navegador com o nome de arquivo "Proposta Comercial Ocean - {Empresa}", ocultando a navegação e os botões na impressão.
- **FR-020**: Todo dado digitado pelo usuário MUST ser exibido como texto literal na página do cliente, sem interpretar marcação ou scripts.
- **FR-033**: A seção "Vamos avançar?" MUST exibir a frase "Esta proposta é válida até dd/mm/aaaa." com a data de validade da proposta (FR-011), sem alterar as demais seções do modelo. Após uma edição que mude a validade, a frase MUST mostrar a nova data.
- **FR-021**: Quando a proposta tiver sido editada, a indicação "Atualizada em dd/mm/aaaa" (spec 079, FR-019) MUST aparecer junto da Data, sem alterar o restante do layout.

**Aceite**

- **FR-022**: O botão **Aceitar proposta** MUST abrir a janela de confirmação do modelo, com nome completo, e-mail e declaração de aceite, e MUST registrar a assinatura pelo fluxo atual do Proposal, com as mesmas evidências (spec 077, FR-019) e as mesmas regras de assinatura única, expiração, cancelamento e versão vigente (spec 079, FR-013).
- **FR-023**: Após o aceite, o cliente MUST ver "Aceite registrado. Nossa equipe enviará o contrato em breve."; em caso de falha, a mensagem de erro do modelo, podendo tentar novamente.
- **FR-024**: A impressão digital do conteúdo aceito MUST cobrir todos os dados preenchidos da proposta e o modelo usado, de forma que seja possível demonstrar exatamente o que foi aceito.
- **FR-025**: Uma proposta assinada MUST continuar exibindo o conteúdo do modelo vigente no momento da assinatura, mesmo que o texto fixo do modelo mude depois.

**Lista, detalhe, edição e cópia**

- **FR-026**: A lista de propostas MUST exibir empresa, modelo (divisão), nome do projeto, data, validade e status.
- **FR-027**: O detalhe da proposta MUST exibir todos os campos preenchidos, incluindo os quadros de investimento.
- **FR-028**: A edição antes da assinatura (spec 079) MUST valer para todos os campos do modelo, com as mesmas validações da criação; o histórico MUST registrar inclusão, remoção e alteração de modelos de investimento com valor anterior e novo valor.
- **FR-029**: **Criar cópia** MUST abrir uma nova proposta com o mesmo modelo e todos os campos copiados, exceto a Data, que volta a ser a de hoje, e a validade, que volta ao padrão.
- **FR-030**: Propostas criadas antes desta feature MUST continuar funcionando como hoje (página, assinatura, edição com CNPJ, valor e imposto, e histórico), sem conversão para o novo modelo, exceto pela ação **Criar cópia**, que MUST NÃO estar disponível para elas. Na lista, MUST aparecer com o modelo "Proposta simples" e a empresa igual ao nome do cliente.

**Perfil do consultor**

- **FR-031**: Cada usuário do Proposal MUST poder ver e alterar o próprio perfil do consultor (nome, cargo, telefone e e-mail), com as mesmas validações do formulário da proposta; nenhum usuário MUST poder ver ou alterar o perfil de outro.
- **FR-032**: A proposta MUST guardar os dados do consultor com que foi gerada (ou editada); alterar o perfil depois MUST NÃO mudar propostas existentes.

### Key Entities

- **Modelo de proposta (divisão)**: conjunto de conteúdo fixo de uma divisão da Ocean Talent Solutions (logo da capa, textos de Serviço, Metodologia, Investimento, Garantias e Observações). Atributos: identificador (`executive-search`, `offshore-talent`, `outsourcing`, `outplacement-development`), nome exibido e se está disponível para novas propostas. Nesta entrega, só Executive Search está disponível.
- **Proposta** (existente): passa a ter um modelo e os campos do modelo: empresa, data, setor, consultor (nome, cargo, telefone, e-mail, copiados do perfil no momento do preenchimento), nome do projeto, garantia em meses e de 1 a 3 modelos de investimento. Propostas por modelo não têm CNPJ, valor nem imposto; propostas antigas mantêm esses dados. Mantém código do link, validade, status, datas de acompanhamento, usuário criador, versão e histórico de edições.
- **Perfil do consultor** (novo): dados de contato de um usuário do Proposal usados para preencher novas propostas. Atributos: usuário, nome, cargo, telefone e e-mail. Cada usuário tem no máximo um perfil.
- **Modelo de investimento** (novo): item da proposta. Atributos: tipo (Retainer, Sucesso ou Valor fechado), forma da taxa (percentual ou reais), valor da taxa e percentual de entrada (opcional); o percentual após conclusão é derivado. Cada proposta tem de 1 a 3, com tipos distintos.
- **Setor**: lista fixa (Petróleo & Gás, Energia, Infraestrutura, Mineração, Indústria & Serviços), cada um com uma foto de fundo padrão.
- **Assinatura** (existente): sem mudança de atributos; a impressão digital passa a cobrir os campos do modelo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuário do Proposal cria uma proposta Executive Search completa (com 3 modelos de investimento) e copia o link em menos de 3 minutos.
- **SC-002**: Em 100% das propostas geradas, a página do cliente não exibe nenhum marcador entre colchetes e cada dado preenchido aparece em todos os lugares previstos pelo modelo.
- **SC-003**: Em comparação lado a lado com o HTML de referência preenchido com os mesmos dados de exemplo, a página gerada não apresenta diferença perceptível de textos, seções, cores ou disposição, no computador e no celular, além das adições previstas na spec (frase de validade, indicação "Atualizada em" e indicação de assinada).
- **SC-004**: Um cliente abre o link e conclui o aceite em menos de 1 minuto, inclusive no celular.
- **SC-005**: Em 100% das propostas aceitas, é possível demonstrar exatamente o conteúdo aceito (dados preenchidos e texto do modelo).
- **SC-006**: 100% das propostas criadas antes desta feature continuam abrindo e aceitando assinatura como antes.

## Assumptions

- **Modelos disponíveis**: só Executive Search nesta entrega. As outras 3 divisões dependem do envio das logos brancas e dos textos de cada divisão e entram depois, sem mudar o formulário.
- **Foto do setor**: uma foto padrão por setor (opção "imagem padrão" das instruções). Foto gerada por IA para cada proposta fica fora do escopo. As fotos por setor (`fundos-por-setor.zip`) ainda não foram recebidas; até chegarem, todos os setores usam a foto que já vem no modelo (Infraestrutura).
- **Aceite**: o "endereço do ERP" previsto no modelo é o próprio Proposal; não há integração com outro sistema. Não há link de contrato nesta entrega: após o aceite, o cliente vê a mensagem de que a equipe enviará o contrato. O aceite provisório por e-mail do modelo não é usado.
- **PDF**: gerado pela impressão do navegador, como no modelo; PDF idêntico gerado no servidor fica fora do escopo.
- **Um projeto por proposta**: conforme o modelo atual; múltiplos projetos ficam fora do escopo.
- **Conteúdo fixo**: Shortlist, SLA e Observações continuam fixos, como no modelo.
- **Validade**: continua existindo e controlando a expiração; é a única informação acrescentada ao layout do modelo, na seção "Vamos avançar?" (FR-033).
- **Data da proposta**: é a data exibida na capa e no rodapé; vem com a data de hoje e pode ser alterada pelo usuário (FR-005). Na edição, mantém o valor salvo até o usuário mudá-la; não é atualizada automaticamente. A data de emissão registrada pelo sistema continua sendo a da criação.
- **Pré-visualização**: o usuário confere a página pela ação existente **Abrir página do cliente** depois de gerar; não há pré-visualização antes de confirmar.
- **Permissões, visibilidade, status e envio do link**: seguem as specs 077 e 079 sem mudança.
- **Impostos**: deixam de ser calculados pelo Proposal nas propostas por modelo; a informação ao cliente é a Observação fixa do modelo ("Impostos (até 19,55%) serão adicionados a todos os valores informados").
- **Perfil do consultor**: fica no próprio Proposal e é mantido pelo usuário; o cadastro de usuários do ERP não muda.
