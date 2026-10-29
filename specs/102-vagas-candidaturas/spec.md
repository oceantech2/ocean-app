# Feature Specification: Vagas cadastradas no painel do consultor e candidatura pelo site

**Feature Branch**: `102-vagas-candidaturas`

**Created**: 2026-10-29

**Status**: Draft

**Input**: User description: "no painel do consultor precisa ter um menu onde ele adiciona vaga e ao adicionar lá deve aparecer no menu de vagas na landing page, além disso quando clicar em uma vaga deve abrir uma página dela com todos os pré requisitos. Quanto ao formulário para se inscrever deve ter todos esses campos: o formulário deve preencher os campos da planilha formulário de candidatura em vaga (obrigatórios nome, telefone, currículo, empresa atual, cargo atual, pretensão salarial mínima / pretensão salarial, localidade)"

## Contexto

Hoje a página "Vagas" do site institucional (`oceantalentsolutions.com/vagas`) mostra uma lista fixa de 5 vagas escrita no código. O botão "Tenho interesse" abre um formulário curto (nome, e-mail, LinkedIn, mensagem) que só confirma na tela e não grava nem envia nada.

A Ocean quer que os consultores publiquem as vagas pelo Consultant Panel, que cada vaga tenha uma página própria no site com todos os pré-requisitos e que a candidatura do site chegue à planilha Google "Formulário de candidatura em vaga", usada pelo time de recrutamento. A planilha já recebe dados por um endereço de integração (Web App do Apps Script) protegido por um segredo compartilhado e aceita os campos: identificador externo da inscrição, nome, e-mail, identificador da vaga na planilha (ou nome da vaga e cliente), consentimento LGPD, telefone, LinkedIn, localização, cargo atual, empresa atual, formação, experiência, inglês, outros idiomas, pretensão mínima, pretensão máxima, disponibilidade, mobilidade e link do currículo.

## Clarifications

### Session 2026-10-29

- Q: Para onde vão as candidaturas? → A: Ficam gravadas na Ocean e são enviadas à planilha Google pelo endereço de integração da planilha.
- Q: Como o currículo é enviado? → A: Upload de arquivo (PDF, DOC ou DOCX, até 5 MB).
- Q: Quem cadastra e altera vagas? → A: Qualquer consultor cria; editar, encerrar e excluir só o autor ou admin.
- Q: O que fazer com as 5 vagas fixas do site? → A: Migrar como vagas reais no cadastro.
- Q: Como a candidatura identifica a vaga na planilha? → A: Campo opcional "Código na planilha" (ex.: V0005) na vaga; sem ele, envia título + cliente.
- Q: Idioma do conteúdo da vaga? → A: Um idioma só, como digitado, igual nas duas versões do site; só a interface é traduzida.
- Q: Inglês, disponibilidade e mobilidade são texto livre? → A: Listas fixas — Inglês: Básico, Intermediário, Avançado, Fluente, Nativo; Disponibilidade: Imediata, 15 dias, 30 dias, Mais de 30 dias; Mobilidade: Sim, Não, A combinar.
- Q: O cliente da vaga é obrigatório? → A: Obrigatório só quando a vaga não tem código da planilha.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultor publica uma vaga pelo painel (Priority: P1)

No Consultant Panel há um novo menu "Vagas". O consultor abre "Nova vaga", preenche título, área, nível, localidade, resumo, descrição, responsabilidades, pré-requisitos, diferenciais e, opcionalmente, o cliente (uso interno, nunca exibido no site) e o código da vaga na planilha. Ao salvar como "Aberta", a vaga passa a aparecer na página Vagas do site. Ele pode editar e encerrar a vaga; encerrada, ela some do site.

**Why this priority**: Sem vagas cadastradas pelo painel não há o que mostrar no site nem a que se candidatar.

**Independent Test**: Cadastrar uma vaga no painel, abrir `oceantalentsolutions.com/vagas` e conferir que ela aparece com título, área, nível, localidade e resumo; encerrar a vaga e conferir que ela some.

**Acceptance Scenarios**:

1. **Given** um consultor logado no painel, **When** abre o menu "Vagas", **Then** vê a lista de todas as vagas (abertas e encerradas) com título, área, nível, status, autor e quantidade de candidaturas.
2. **Given** o formulário "Nova vaga" preenchido com os campos obrigatórios, **When** o consultor salva, **Then** a vaga é criada como "Aberta" e aparece na página Vagas do site na próxima vez que ela for carregada.
3. **Given** uma vaga aberta criada por outro consultor, **When** um consultor que não é o autor nem admin abre a vaga, **Then** consegue vê-la e ver as candidaturas, mas não vê as ações de editar, encerrar ou excluir.
4. **Given** o autor da vaga (ou um admin), **When** encerra a vaga, **Then** ela sai da lista do site e o link direto passa a informar que a vaga foi encerrada.
5. **Given** uma vaga encerrada, **When** o autor (ou admin) a reabre, **Then** ela volta a aparecer no site.
6. **Given** uma vaga sem candidaturas, **When** o autor (ou admin) a exclui e confirma, **Then** ela é removida; **Given** uma vaga com candidaturas, **Then** a exclusão é recusada com a orientação de encerrar a vaga.
7. **Given** um campo obrigatório vazio, **When** o consultor tenta salvar, **Then** o campo é destacado com a mensagem do erro e nada é gravado.

---

### User Story 2 - Candidato vê a página da vaga com todos os pré-requisitos (Priority: P1)

Na página Vagas do site, o visitante vê as vagas abertas, filtra por área e nível e clica em uma vaga. Abre-se uma página própria da vaga, com endereço compartilhável, mostrando título, área, nível, localidade, descrição, responsabilidades, pré-requisitos e diferenciais, e o botão "Candidatar-me".

**Why this priority**: É o pedido explícito ("quando clicar em uma vaga deve abrir uma página dela com todos os pré-requisitos") e é onde o candidato decide se aplica.

**Independent Test**: Clicar em uma vaga na lista e conferir que a página da vaga abre com todos os campos cadastrados; copiar o endereço, abrir em outra aba e ver a mesma página.

**Acceptance Scenarios**:

1. **Given** a página Vagas com vagas abertas, **When** o visitante clica em uma vaga, **Then** abre a página da vaga com todos os pré-requisitos e demais informações cadastradas.
2. **Given** o endereço de uma vaga aberta, **When** acessado diretamente (link compartilhado), **Then** a página da vaga abre normalmente.
3. **Given** o endereço de uma vaga encerrada ou inexistente, **When** acessado, **Then** o visitante vê a mensagem de que a vaga não está mais disponível e um link para a lista de vagas.
4. **Given** a página Vagas sem nenhuma vaga aberta, **When** carregada, **Then** mostra a mensagem de que não há vagas abertas no momento.
5. **Given** a versão em inglês do site, **When** o visitante abre a lista e a página da vaga, **Then** rótulos, botões e mensagens aparecem em inglês e o conteúdo da vaga aparece como foi cadastrado.
6. **Given** a página Vagas, **When** os filtros de área e nível são usados, **Then** a lista mostra só as vagas abertas que atendem aos filtros, como hoje.

---

### User Story 3 - Candidato se inscreve e os dados chegam à planilha (Priority: P1)

Na página da vaga, o candidato clica em "Candidatar-me" e preenche o formulário de candidatura: nome, e-mail, telefone, currículo (arquivo), empresa atual, cargo atual, pretensão salarial mínima, pretensão salarial máxima e localidade (obrigatórios), além de LinkedIn, formação, experiência, nível de inglês, outros idiomas, disponibilidade e mobilidade (opcionais), e marca o consentimento LGPD. Ao enviar, a candidatura é gravada na Ocean e enviada à planilha "Formulário de candidatura em vaga", ligada à vaga correspondente.

**Why this priority**: É o objetivo final da página de vagas: transformar visitante em candidato no fluxo de recrutamento da Ocean.

**Independent Test**: Enviar uma candidatura completa pelo site e conferir que ela aparece na planilha com todos os campos preenchidos e ligada à vaga, e que o link do currículo abre o arquivo enviado (após login no painel).

**Acceptance Scenarios**:

1. **Given** o formulário com todos os campos obrigatórios válidos, o currículo anexado e o consentimento marcado, **When** o candidato envia, **Then** vê a confirmação de que a candidatura foi recebida e o formulário é limpo.
2. **Given** uma candidatura recebida, **When** a planilha está disponível, **Then** uma linha é criada na planilha com nome, e-mail, telefone, localização, cargo atual, empresa atual, pretensões mínima e máxima, campos opcionais preenchidos, link do currículo, consentimento e a vaga (pelo código da vaga na planilha, quando cadastrado, ou pelo título e cliente).
3. **Given** um campo obrigatório vazio ou inválido (e-mail mal formado, telefone com menos de 10 dígitos, pretensão máxima menor que a mínima, currículo ausente), **When** o candidato tenta enviar, **Then** cada campo com problema é destacado com sua mensagem e nada é enviado.
4. **Given** um currículo em formato diferente de PDF, DOC ou DOCX, ou maior que 5 MB, **When** o candidato o anexa, **Then** vê a mensagem do formato/tamanho aceito e o envio é bloqueado.
5. **Given** o consentimento LGPD desmarcado, **When** o candidato tenta enviar, **Then** é avisado de que o consentimento é necessário.
6. **Given** a planilha indisponível no momento do envio, **When** o candidato envia, **Then** a candidatura é gravada mesmo assim, o candidato recebe a confirmação normalmente e o envio à planilha fica pendente para nova tentativa.
7. **Given** a mesma candidatura reenviada à planilha (nova tentativa), **When** processada, **Then** a planilha não cria linha duplicada.
8. **Given** a vaga encerrada entre a abertura da página e o envio, **When** o candidato envia, **Then** é avisado de que a vaga não está mais disponível e nada é gravado.

---

### User Story 4 - Consultor acompanha as candidaturas da vaga (Priority: P2)

No detalhe da vaga no painel, o consultor vê as candidaturas recebidas (nome, e-mail, telefone, cargo e empresa atuais, localidade, pretensões, data), abre o currículo e vê se cada candidatura já chegou à planilha. As que ficaram pendentes podem ser reenviadas.

**Why this priority**: A planilha é o destino principal; o painel serve de garantia (nada se perde se a planilha falhar) e dá acesso ao currículo pelo link enviado à planilha.

**Independent Test**: Com uma candidatura recebida, abrir a vaga no painel, ver a candidatura listada, abrir o currículo e conferir o status "Enviada à planilha"; simular falha da planilha e usar "Reenviar à planilha".

**Acceptance Scenarios**:

1. **Given** uma vaga com candidaturas, **When** o consultor abre o detalhe da vaga, **Then** vê a lista de candidaturas da mais recente para a mais antiga com os dados principais e o status do envio à planilha.
2. **Given** uma candidatura, **When** o consultor clica em "Currículo", **Then** o arquivo enviado pelo candidato abre ou é baixado.
3. **Given** o link do currículo gravado na planilha, **When** alguém da Ocean o abre, **Then** é levado ao painel (com login, se necessário) e o currículo abre; sem login válido no painel, o arquivo não é acessível.
4. **Given** candidaturas com envio pendente, **When** o consultor clica em "Reenviar à planilha", **Then** o sistema tenta enviar novamente e atualiza o status de cada uma.

---

### User Story 5 - Vagas de exemplo migradas para o cadastro (Priority: P3)

As 5 vagas hoje fixas no site (CFO, VP de Engenharia, Diretor Comercial, Head de RH, Gerente de Operações) passam a existir como vagas cadastradas, abertas, editáveis no painel. O site deixa de ter vagas fixas no código.

**Why this priority**: Evita que o site fique vazio no dia da publicação e dá aos consultores um ponto de partida para editar.

**Independent Test**: Após a publicação, abrir o menu Vagas do painel e encontrar as 5 vagas; abrir o site e vê-las na lista.

**Acceptance Scenarios**:

1. **Given** a primeira publicação da feature, **When** o painel é aberto, **Then** as 5 vagas aparecem no cadastro como abertas, com título, área, nível, localidade e resumo atuais.
2. **Given** as vagas migradas, **When** um consultor as edita ou encerra, **Then** a mudança vale no site como qualquer outra vaga.
3. **Given** que as vagas migradas foram excluídas ou alteradas, **When** o sistema é reiniciado, **Then** elas não são recriadas nem sobrescritas.

---

### Edge Cases

- **Planilha fora do ar ou recusando o envio**: a candidatura é sempre gravada primeiro; o envio fica pendente, o candidato não vê erro e o painel mostra o status para reenvio.
- **Integração da planilha não configurada no servidor** (ex.: ambiente de desenvolvimento): candidaturas são gravadas e ficam pendentes, sem erro para o candidato.
- **Armazenamento de arquivos indisponível**: sem onde guardar o currículo, a candidatura não é aceita e o candidato vê mensagem para tentar novamente mais tarde.
- **Mesmo candidato (mesmo e-mail) se candidata duas vezes à mesma vaga**: as duas candidaturas são gravadas; a planilha trata a pessoa repetida pelo e-mail.
- **Envio automatizado (robôs)**: o formulário tem proteção simples contra preenchimento automático e limites de tamanho por campo; envios identificados como robô são descartados silenciosamente.
- **Vaga editada depois de receber candidaturas**: as candidaturas continuam ligadas à vaga; o envio à planilha usa os dados da vaga no momento do envio.
- **Consultor sem acesso ao painel** abre o link do currículo: vai para o login do painel e só vê o arquivo após entrar com um usuário com acesso.
- **Pretensões salariais**: valores em reais, aceitos com ou sem centavos; máxima igual à mínima é válida.
- **Textos longos nos pré-requisitos**: listas com várias linhas são exibidas uma por item na página da vaga.

## Requirements *(mandatory)*

### Functional Requirements

**Cadastro de vagas (painel)**

- **FR-001**: O Consultant Panel MUST ter um menu "Vagas" com lista, criação, visualização, edição, encerramento/reabertura e exclusão de vagas.
- **FR-002**: Uma vaga MUST ter: título, área (Finanças, Tecnologia, Comercial, Recursos Humanos, Operações), nível (Gerência, Diretoria, VP, C-Level), localidade, resumo, descrição, responsabilidades, pré-requisitos, diferenciais, cliente (interno), código da vaga na planilha (opcional, ex.: V0005) e status (Aberta/Encerrada). Título, área, nível, localidade, resumo e pré-requisitos são obrigatórios; o cliente é obrigatório quando o código da planilha não é informado.
- **FR-003**: Qualquer usuário com acesso ao painel MUST poder criar vagas e ver todas as vagas e suas candidaturas; editar, encerrar, reabrir e excluir MUST ser permitido apenas ao autor da vaga ou a um admin.
- **FR-004**: A exclusão MUST pedir confirmação e MUST ser recusada para vagas com candidaturas (a orientação é encerrar).
- **FR-005**: Criação, edição, encerramento, reabertura e exclusão de vagas MUST ser registrados na auditoria.
- **FR-006**: O cliente da vaga MUST NOT aparecer em nenhuma página ou resposta pública do site.

**Site (lista e página da vaga)**

- **FR-007**: A página Vagas do site MUST listar somente as vagas abertas cadastradas no painel, com os filtros de área e nível existentes, mais recentes primeiro.
- **FR-008**: Cada vaga aberta MUST ter uma página própria no site, com endereço estável e compartilhável nas versões em português e inglês, exibindo título, área, nível, localidade, resumo, descrição, responsabilidades, pré-requisitos e diferenciais.
- **FR-009**: Endereços de vagas encerradas ou inexistentes MUST mostrar mensagem de vaga indisponível com link para a lista.
- **FR-010**: Rótulos, botões, mensagens e validações do site MUST seguir o idioma da página (português/inglês); o conteúdo da vaga é exibido como cadastrado.

**Candidatura**

- **FR-011**: O formulário de candidatura MUST ter como obrigatórios: nome, e-mail, telefone, currículo (arquivo), empresa atual, cargo atual, pretensão salarial mínima, pretensão salarial máxima, localidade e consentimento LGPD; e como opcionais: LinkedIn, formação, experiência, nível de inglês, outros idiomas, disponibilidade e mobilidade. Inglês, disponibilidade e mobilidade são escolhidos em listas fixas: Inglês (Básico, Intermediário, Avançado, Fluente, Nativo), Disponibilidade (Imediata, 15 dias, 30 dias, Mais de 30 dias) e Mobilidade (Sim, Não, A combinar); os textos dessas opções são traduzidos na versão em inglês do site e enviados à planilha em português.
- **FR-012**: O currículo MUST ser aceito apenas em PDF, DOC ou DOCX com até 5 MB.
- **FR-013**: O sistema MUST validar: e-mail válido, telefone com 10 a 13 dígitos, pretensões positivas com máxima maior ou igual à mínima, LinkedIn como endereço válido quando informado e limites de tamanho dos textos.
- **FR-014**: Toda candidatura aceita MUST ser gravada na Ocean (dados e currículo) antes do envio à planilha, ligada à vaga, com data e hora.
- **FR-015**: O sistema MUST enviar cada candidatura à planilha "Formulário de candidatura em vaga" com todos os campos preenchidos, o consentimento, o identificador da candidatura (para evitar duplicidade em novas tentativas), a vaga (pelo código da vaga na planilha quando cadastrado; senão pelo título e cliente) e um link do currículo.
- **FR-016**: O link do currículo enviado à planilha MUST abrir o arquivo somente para quem estiver logado no painel do consultor.
- **FR-017**: Falhas no envio à planilha MUST NOT impedir a confirmação ao candidato; a candidatura fica com envio pendente, registra o motivo e pode ser reenviada pelo painel.
- **FR-018**: Candidaturas para vagas encerradas ou inexistentes MUST ser recusadas com mensagem ao candidato.
- **FR-019**: O formulário MUST ter proteção simples contra envio automatizado.

**Acompanhamento e migração**

- **FR-020**: O detalhe da vaga no painel MUST listar as candidaturas com os dados principais, acesso ao currículo, status do envio à planilha (Enviada/Pendente) e ação "Reenviar à planilha" para as pendentes.
- **FR-021**: As 5 vagas hoje fixas no site MUST ser criadas uma única vez como vagas abertas no cadastro, e o site MUST deixar de usar a lista fixa.

### Key Entities

- **Vaga**: posição aberta pela Ocean. Título, área, nível, localidade, resumo, descrição, responsabilidades, pré-requisitos, diferenciais, cliente (interno), código da vaga na planilha (opcional), status (Aberta/Encerrada), autor, datas de criação/atualização/encerramento, identificador público usado no endereço do site.
- **Candidatura**: inscrição de uma pessoa em uma vaga. Nome, e-mail, telefone, LinkedIn, localidade, cargo atual, empresa atual, formação, experiência, inglês, outros idiomas, pretensão mínima, pretensão máxima, disponibilidade, mobilidade, consentimento LGPD com data, currículo (arquivo e nome original), data de envio, status do envio à planilha (pendente/enviada), data do envio, identificadores devolvidos pela planilha e último erro.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Uma vaga salva como aberta no painel aparece no site em até 1 minuto, sem nova publicação do site.
- **SC-002**: O candidato conclui a candidatura em menos de 5 minutos a partir da página da vaga.
- **SC-003**: 100% das candidaturas aceitas ficam gravadas na Ocean, mesmo quando a planilha está indisponível.
- **SC-004**: 100% das candidaturas com a planilha disponível chegam à planilha em até 1 minuto, sem linhas duplicadas após reenvios.
- **SC-005**: 0 informações de cliente expostas no site.
- **SC-006**: 0 currículos acessíveis sem login no painel.

## Assumptions

- A integração com a planilha (endereço do Web App e segredo) é configurada pela Ocean no servidor; o segredo não fica no código nem nos artefatos.
- As colunas da planilha seguem os campos listados no Contexto; os opcionais não preenchidos vão vazios.
- O conteúdo da vaga é escrito em um idioma só (normalmente português) e aparece igual nas duas versões do site; só a interface do site é traduzida.
- Pretensões salariais são mensais, em reais.
- Não há envio de e-mail ao candidato nem ao consultor nesta feature.
- O formulário curto atual ("Tenho interesse") é substituído pelo formulário de candidatura completo.
- O site é publicado no mesmo projeto de hospedagem atual; a liberação do domínio do site para chamar o servidor faz parte da publicação.
