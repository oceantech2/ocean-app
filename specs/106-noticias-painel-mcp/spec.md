# Feature Specification: Notícias pelo painel do consultor, MCP e página no site

**Feature Branch**: `106-noticias-painel-mcp`

**Created**: 2026-11-17

**Status**: Draft

**Input**: User description: "temos uma parte de noticias, no painel do consultor deve ser possível adicionar a noticia além disso no MCP também deve, ao adicionar uma noticia deve ser possível clicar e entrar nela e ver a página da noticia"

## Contexto

O site institucional já tem a página Notícias (`/noticias` e `/en/news`) no menu e no rodapé, com filtros por segmento e cards de exemplo fixos no código. O botão "Ler mais" não abre nenhuma página; o resumo é placeholder; a assinatura por e-mail só mostra confirmação na tela e não grava nada.

O Consultant Panel já permite cadastrar conteúdo público do site no padrão das vagas (menu, formulário, publicação). O conector Claude (MCP) já espelha operações de propostas e vagas com as mesmas regras do painel.

A Ocean quer que os consultores publiquem notícias reais pelo painel e também pelo MCP, que cada notícia publicada tenha uma página própria no site (endereço compartilhável) e que a lista de Notícias deixe de usar os cards fixos.

## Clarifications

### Session 2026-11-17

- Q: Idioma do conteúdo da notícia? → A: Campos separados em português e inglês (título, resumo e conteúdo em cada idioma).
- Q: Notícia publicada com data futura? → A: Só aparece no site a partir da data de publicação (agendamento).
- Q: Escopo do MCP? → A: Só listar, ver, criar e editar; sem despublicar nem excluir via Claude.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultor publica uma notícia pelo painel (Priority: P1)

No Consultant Panel há um novo menu "Notícias". O consultor abre "Nova notícia", preenche título, resumo e conteúdo em português e em inglês, escolhe o segmento e a data de publicação, e salva como publicada. Se a data for hoje ou no passado, a notícia passa a aparecer na página Notícias do site; se for futura, só a partir dessa data. Ele pode editar, despublicar e excluir conforme as regras de permissão.

**Why this priority**: Sem cadastro no painel não há notícias reais nem página para o visitante abrir.

**Independent Test**: Cadastrar uma notícia publicada com data de hoje no painel, abrir a página Notícias do site e conferir que ela aparece; despublicar e conferir que some da lista; cadastrar outra com data futura e conferir que ainda não aparece.

**Acceptance Scenarios**:

1. **Given** um consultor logado no painel, **When** abre o menu "Notícias", **Then** vê a lista de todas as notícias (publicadas e não publicadas) com título (português), segmento, status, data de publicação e autor.
2. **Given** o formulário "Nova notícia" preenchido com os campos obrigatórios nos dois idiomas, **When** o consultor salva como publicada com data de hoje ou passada, **Then** a notícia é criada e aparece na página Notícias do site na próxima vez que ela for carregada.
3. **Given** uma notícia publicada com data futura, **When** a página Notícias do site carrega antes dessa data, **Then** a notícia não aparece na lista; **When** a data chega, **Then** ela passa a aparecer sem nova ação do consultor.
4. **Given** uma notícia criada por outro consultor, **When** um consultor que não é o autor nem admin a abre, **Then** consegue vê-la, mas não vê as ações de editar, despublicar ou excluir.
5. **Given** o autor da notícia (ou um admin), **When** despublica a notícia, **Then** ela sai da lista do site e o link direto informa que a notícia não está disponível.
6. **Given** uma notícia não publicada, **When** o autor (ou admin) a publica de novo com data elegível, **Then** ela volta a aparecer no site.
7. **Given** uma notícia, **When** o autor (ou admin) a exclui e confirma, **Then** ela é removida do painel e do site.
8. **Given** um campo obrigatório vazio em qualquer idioma, **When** o consultor tenta salvar, **Then** o campo é destacado com a mensagem do erro e nada é gravado.

---

### User Story 2 - Visitante abre a página da notícia (Priority: P1)

Na página Notícias do site, o visitante vê as notícias publicadas cuja data de publicação já chegou, filtra por segmento e clica em um card (ou em "Ler mais"). Abre-se a página própria da notícia, com endereço compartilhável, mostrando título, segmento, data, resumo e conteúdo no idioma da página.

**Why this priority**: É o pedido explícito ("ao adicionar uma notícia deve ser possível clicar e entrar nela e ver a página da notícia").

**Independent Test**: Clicar em uma notícia na lista e conferir que a página abre com o conteúdo no idioma da página; copiar o endereço, abrir em outra aba e ver a mesma página.

**Acceptance Scenarios**:

1. **Given** a página Notícias com notícias elegíveis (publicadas e com data já alcançada), **When** o visitante clica no card ou em "Ler mais", **Then** abre a página da notícia com título, segmento, data, resumo e conteúdo.
2. **Given** o endereço de uma notícia elegível, **When** acessado diretamente (link compartilhado), **Then** a página da notícia abre normalmente.
3. **Given** o endereço de uma notícia despublicada, com data futura, excluída ou inexistente, **When** acessado, **Then** o visitante vê a mensagem de que a notícia não está disponível e um link para a lista de notícias.
4. **Given** a página Notícias sem nenhuma notícia elegível, **When** carregada, **Then** mostra a mensagem de que não há notícias no momento (ou no segmento filtrado).
5. **Given** a versão em português do site, **When** o visitante abre a lista e a página da notícia, **Then** vê título, resumo e conteúdo em português; **Given** a versão em inglês, **Then** vê os campos em inglês; rótulos e botões seguem o idioma da página.
6. **Given** a página Notícias, **When** o filtro de segmento é usado, **Then** a lista mostra só as notícias elegíveis daquele segmento, mantendo os segmentos já existentes na página.

---

### User Story 3 - Consultor publica ou altera notícia pelo Claude (MCP) (Priority: P1)

Com o conector Claude conectado, o consultor pede para listar, ver, criar ou editar notícias (incluindo os campos em português e inglês). As ferramentas MCP aplicam as mesmas regras de validação e permissão do painel (criar qualquer consultor; editar só autor ou admin). Não há ferramenta MCP para despublicar nem excluir — essas ações ficam só no painel.

**Why this priority**: Pedido explícito de que o MCP também permita adicionar a notícia, no mesmo espírito do conector já usado para vagas e propostas.

**Independent Test**: Via Claude conectado, criar uma notícia publicada com data elegível e conferir que ela aparece no site e na lista do painel; tentar editar notícia de outro autor sem ser admin e receber recusa.

**Acceptance Scenarios**:

1. **Given** um consultor com Claude conectado, **When** pede para listar notícias, **Then** recebe a lista com título, segmento, status, data e autor.
2. **Given** os dados obrigatórios de uma notícia nos dois idiomas, **When** pede para criar como publicada, **Then** a notícia é gravada, aparece no painel e (se a data já chegou) no site, e a auditoria registra a ação como via Claude.
3. **Given** o autor (ou admin), **When** pede para editar título, resumo ou conteúdo em qualquer idioma, **Then** a alteração vale no site na próxima carga da página.
4. **Given** um consultor que não é autor nem admin, **When** pede para editar notícia de outro, **Then** a operação é recusada com mensagem clara.
5. **Given** dados inválidos ou incompletos, **When** a ferramenta de criar/editar é chamada, **Then** nada é gravado e a resposta indica o erro de validação.
6. **Given** o Claude conectado, **When** o consultor tenta despublicar ou excluir via ferramenta, **Then** essas ações não estão disponíveis no MCP.

---

### User Story 4 - Remoção dos cards placeholder do site (Priority: P2)

Os 3 cards fixos de exemplo deixam de ser usados. O site passa a listar somente notícias elegíveis cadastradas. Se ainda não houver nenhuma, a mensagem vazia é exibida.

**Why this priority**: Evita misturar conteúdo fictício com notícias reais no dia da liberação.

**Independent Test**: Com o cadastro vazio, abrir `/noticias` e ver a mensagem vazia; publicar uma notícia elegível e ver só essa na lista.

**Acceptance Scenarios**:

1. **Given** nenhuma notícia elegível no cadastro, **When** a página Notícias carrega, **Then** não aparecem os 3 cards placeholder atuais.
2. **Given** notícias elegíveis, **When** a página Notícias carrega, **Then** só essas notícias aparecem, ordenadas da mais recente para a mais antiga pela data de publicação.

---

### Edge Cases

- **Notícia salva como rascunho (não publicada)**: não aparece na lista do site; o link direto mostra indisponível.
- **Data de publicação futura**: mesmo com status Publicada, só entra na lista e na página pública a partir dessa data (agendamento).
- **Mudança de data para o futuro depois de publicada**: some do site até a nova data chegar.
- **Textos longos no conteúdo**: parágrafos e listas simples são exibidos de forma legível na página da notícia.
- **Segmento inválido**: só os segmentos já usados na página Notícias são aceitos (Petróleo & Gás, Offshore, Energia, Infraestrutura, Mineração, Indústria, Tecnologia).
- **Exclusão com link compartilhado**: após excluir, o endereço antigo mostra notícia indisponível.
- **Assinatura por e-mail da página Notícias**: permanece como está hoje (confirmação na tela sem gravação); fora do escopo desta feature.
- **Consultor desconecta o Claude**: ferramentas MCP deixam de funcionar até nova conexão; o painel continua operando.

## Requirements *(mandatory)*

### Functional Requirements

**Cadastro no painel**

- **FR-001**: O Consultant Panel MUST ter um menu "Notícias" com lista, criação, visualização, edição, publicação/despublicação e exclusão.
- **FR-002**: Uma notícia MUST ter: título, resumo e conteúdo em português; título, resumo e conteúdo em inglês; segmento (lista fixa alinhada à página Notícias do site); data de publicação; e status (Publicada / Não publicada). Todos esses campos de texto, o segmento e a data são obrigatórios.
- **FR-003**: Qualquer usuário com acesso ao painel MUST poder criar notícias e ver todas; editar, publicar, despublicar e excluir MUST ser permitido apenas ao autor da notícia ou a um admin.
- **FR-004**: A exclusão MUST pedir confirmação.
- **FR-005**: Criação, edição, publicação, despublicação e exclusão MUST ser registrados na auditoria.
- **FR-006**: O cadastro MUST exigir os pares de campos em português e em inglês (título, resumo e conteúdo); não é permitido salvar só um idioma.

**Site (lista e página da notícia)**

- **FR-007**: A página Notícias do site MUST listar somente as notícias com status Publicada e data de publicação menor ou igual à data atual, com o filtro de segmento existente, mais recentes primeiro pela data de publicação.
- **FR-008**: Cada notícia elegível MUST ter uma página própria no site, com endereço estável e compartilhável nas versões em português e inglês, exibindo título, segmento, data, resumo e conteúdo no idioma da página.
- **FR-009**: Endereços de notícias não publicadas, com data futura, excluídas ou inexistentes MUST mostrar mensagem de indisponível com link para a lista.
- **FR-010**: Rótulos, botões e mensagens do site MUST seguir o idioma da página; título, resumo e conteúdo MUST usar os campos do idioma correspondente.
- **FR-011**: Os cards placeholder fixos no código MUST ser removidos; a lista passa a vir exclusivamente do cadastro.

**MCP (Claude)**

- **FR-012**: O conector Claude MUST oferecer ferramentas para listar, ver, criar e editar notícias (incluindo os campos nos dois idiomas), reutilizando as mesmas regras de validação e permissão do painel.
- **FR-013**: Ações feitas via MCP MUST aparecer na auditoria como via Claude.
- **FR-014**: O MCP MUST NOT oferecer despublicar nem excluir notícias; essas ações ficam apenas no painel.

**Fora de escopo**

- **FR-015**: A assinatura por e-mail da página Notícias MUST permanecer com o comportamento atual (sem gravação nem envio real) nesta feature.
- **FR-016**: Imagem de capa, categorias além do segmento, comentários e compartilhamento em redes sociais estão fora desta feature.

### Key Entities

- **Notícia**: artigo de curadoria de mercado publicado pela Ocean. Título, resumo e conteúdo em português e em inglês; segmento; data de publicação; status (Publicada / Não publicada); autor; datas de criação/atualização; identificador público usado no endereço do site. Visível no site somente quando Publicada e com data de publicação já alcançada.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Uma notícia salva como publicada com data elegível no painel aparece na lista do site em até 1 minuto, sem nova publicação do site.
- **SC-002**: O visitante abre a página completa da notícia a partir do card em no máximo 2 cliques (lista → detalhe).
- **SC-003**: 100% das notícias criadas via Claude com dados válidos aparecem no painel e no site (quando elegíveis) com as mesmas regras de uma criação pelo formulário.
- **SC-004**: 0 cards placeholder fixos restantes na página Notícias após a liberação.
- **SC-005**: Consultor que não é autor nem admin não consegue alterar nem excluir notícia de outro (painel e MCP).
- **SC-006**: Notícia publicada com data futura não aparece no site antes dessa data; na data, aparece sem nova ação do consultor.
- **SC-007**: Na versão em inglês do site, o visitante vê título, resumo e conteúdo em inglês; na versão em português, vê os campos em português.

## Assumptions

- O fluxo de permissões espelha o das vagas: qualquer consultor cria; só autor ou admin altera/exclui.
- Os segmentos da notícia são exatamente os já usados na página Notícias do site.
- A “data atual” para elegibilidade usa o fuso horário operacional da Ocean (America/Sao_Paulo), comparando pela data civil (sem horário).
- Não há e-mail automático ao publicar notícia nem aos assinantes nesta feature.
- A página de detalhe segue o visual geral do site institucional (tipografia, cores, cabeçalho/rodapé), sem redesenho amplo.
- O conector MCP já autenticado no painel é o mesmo canal usado para propostas e vagas; esta feature só acrescenta as ferramentas de notícias.
