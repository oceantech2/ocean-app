# Feature Specification: E-mail com link e PDF no aceite da proposta

**Feature Branch**: `095-proposta-email-aceite`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "Em proposal quando alguém aceitar uma proposta receber via email o pdf e o link da proposta"

## Contexto

Quando o cliente aceita uma proposta na página pública, hoje ninguém é avisado: o consultor só descobre abrindo o Proposal, e o cliente não recebe nenhum comprovante. O sistema já sabe enviar e-mails (alertas financeiros), e a página pública da proposta, mesmo depois de assinada, mostra o botão "Baixar PDF".

## Clarifications

### Session 2026-10-15

- Q: Quem recebe o e-mail? → A: O cliente que aceitou, o consultor que criou a proposta e os administradores.
- Q: Como entregar o PDF? → A: Sem anexo: o e-mail traz o link da proposta e um botão que abre a proposta já baixando o PDF.
- Q: Quem são os "administradores / financeiro"? → A: Os usuários administradores com acesso ao Proposal cujo login é um e-mail; nenhuma configuração extra.
- Q: Idioma do e-mail do cliente? → A: O idioma da proposta (português ou inglês). Os e-mails internos são em português.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cliente recebe o comprovante do aceite (Priority: P1)

Logo após aceitar a proposta, o cliente recebe um e-mail no idioma da proposta confirmando o aceite (empresa, data e hora), com o link para revisitar a proposta e um botão para baixar o PDF.

**Why this priority**: É o pedido principal: o cliente precisa de um comprovante e de acesso fácil ao documento aceito.

**Independent Test**: Aceitar uma proposta em português com um e-mail de teste e conferir o e-mail recebido; clicar em "Ver proposta" (abre a página com o aceite registrado) e em "Baixar PDF" (abre a página e inicia o download/impressão do PDF). Repetir com proposta em inglês.

**Acceptance Scenarios**:

1. **Given** uma proposta em português pendente, **When** o cliente a aceita informando nome e e-mail, **Then** ele recebe no e-mail informado uma confirmação em português com empresa, data/hora do aceite, nome do consultor e os botões "Ver proposta" e "Baixar PDF".
2. **Given** uma proposta em inglês, **When** o cliente a aceita, **Then** o e-mail de confirmação chega em inglês.
3. **Given** o e-mail recebido, **When** o cliente clica em "Baixar PDF", **Then** a proposta abre e o download do PDF (impressão para PDF) é iniciado automaticamente, com o mesmo conteúdo do botão "Baixar PDF" da página.
4. **Given** o e-mail recebido, **When** o cliente clica em "Ver proposta", **Then** a proposta abre mostrando o aceite registrado, sem iniciar o download.

---

### User Story 2 - Consultor e administradores são avisados do aceite (Priority: P1)

O consultor que criou a proposta e os administradores do Proposal recebem um e-mail em português avisando do aceite, com os dados do aceite e os links para a proposta, para o PDF e para a página da proposta no Proposal.

**Why this priority**: O time comercial e o financeiro precisam agir rápido após o aceite (iniciar projeto, faturar).

**Independent Test**: Aceitar uma proposta criada por um consultor; conferir que o consultor e cada administrador com login de e-mail receberam o aviso, uma única vez cada.

**Acceptance Scenarios**:

1. **Given** uma proposta criada por um consultor com login de e-mail, **When** o cliente a aceita, **Then** o consultor recebe o aviso com empresa, modelo, projeto(s), nome e e-mail de quem aceitou, data/hora e os links "Ver proposta", "Baixar PDF" e "Abrir no Proposal".
2. **Given** administradores ativos com acesso ao Proposal e login de e-mail, **When** qualquer proposta é aceita, **Then** cada um recebe o mesmo aviso.
3. **Given** que o consultor também é administrador, **When** a proposta é aceita, **Then** ele recebe um único aviso.
4. **Given** um consultor cujo login não é e-mail, **When** a proposta é aceita, **Then** o aviso vai para o e-mail de contato do consultor informado na proposta.

---

### Edge Cases

- **Falha no envio** (servidor de e-mail fora do ar ou não configurado): o aceite é concluído normalmente e o cliente vê a confirmação na página; a falha fica registrada no log do servidor.
- **Envio demorado**: o cliente não espera o envio para ver a confirmação do aceite.
- **Mesmo endereço em mais de um papel** (ex.: cliente de teste usando o e-mail do consultor): cada endereço recebe no máximo um e-mail por aceite; o cliente recebe a versão do cliente.
- **Nenhum consultor/administrador com e-mail**: só o cliente recebe.
- **Nomes com caracteres especiais ou HTML** digitados no aceite ou na proposta: aparecem como texto no e-mail, sem formatar nem quebrar o layout.
- **Link "Baixar PDF" aberto depois de recarregar a página**: o download não é repetido a cada recarga.
- **Proposta excluída depois do aceite** (feature 094): os links do e-mail passam a mostrar "proposta não encontrada".
- **Navegador que bloqueia a impressão automática**: o cliente continua com o botão "Baixar PDF" visível na página.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ao concluir o aceite de uma proposta, o sistema MUST enviar um e-mail de confirmação ao e-mail informado pelo cliente no aceite.
- **FR-002**: O e-mail do cliente MUST estar no idioma da proposta (português ou inglês) e conter empresa, data e hora do aceite (horário de Brasília), nome do consultor e os links "Ver proposta" e "Baixar PDF".
- **FR-003**: O sistema MUST enviar um aviso interno, em português, ao consultor que criou a proposta (login de e-mail; senão, o e-mail de contato do consultor na proposta) e a todos os administradores ativos com acesso ao Proposal cujo login é um e-mail.
- **FR-004**: O aviso interno MUST conter empresa, modelo, projeto(s), nome e e-mail de quem aceitou, data/hora do aceite e os links "Ver proposta", "Baixar PDF" e "Abrir no Proposal" (página da proposta no Proposal).
- **FR-005**: Cada endereço MUST receber no máximo um e-mail por aceite.
- **FR-006**: O link "Baixar PDF" MUST abrir a página pública da proposta e iniciar automaticamente o mesmo download de PDF do botão da página, uma única vez por abertura do link.
- **FR-007**: O envio MUST NOT atrasar nem impedir a confirmação do aceite; falhas MUST ser registradas no log do servidor.
- **FR-008**: Textos informados por usuários (nomes, empresa, projetos) MUST aparecer no e-mail como texto literal.
- **FR-009**: Os links do e-mail MUST usar o endereço público do Proposal configurado para o ambiente.

### Key Entities

- **Aceite (existente)**: nome, e-mail, data/hora do aceite; origem do destinatário cliente.
- **Proposta (existente)**: empresa, modelo, projetos, idioma, consultor (contato), criador, código do link público.
- **Usuário do Proposal (existente)**: login, papel, ativo, acesso ao Proposal; origem dos destinatários internos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos aceites concluídos geram e-mail para o cliente e para os destinatários internos, quando o envio de e-mail está configurado.
- **SC-002**: O cliente vê a confirmação do aceite no mesmo tempo de hoje (o envio não adiciona espera perceptível).
- **SC-003**: O cliente chega ao PDF da proposta em 1 clique a partir do e-mail.
- **SC-004**: 0 aceites perdidos ou com erro por causa de falha no envio de e-mail.

## Assumptions

- O PDF não é anexado (decisão do usuário); o "Baixar PDF" do e-mail reutiliza o PDF gerado pela página.
- As propostas simples antigas (feature 077) não têm PDF na página; para elas o e-mail traz só "Ver proposta" (e "Abrir no Proposal" no aviso interno).
- O envio usa o serviço de e-mail já existente do sistema; em produção, ele precisa estar configurado (remetente e credenciais). Sem configuração, os envios só são registrados em log.
- Não há reenvio manual nem histórico de envios na interface nesta versão.
- Usuários inativos ou sem acesso ao Proposal não recebem o aviso interno.
