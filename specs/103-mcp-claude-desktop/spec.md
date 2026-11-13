# Feature Specification: Claude Desktop conectado ao Consultant Panel (MCP)

**Feature Branch**: `103-mcp-claude-desktop`

**Created**: 2026-11-13

**Status**: Draft

**Input**: User description: "Preciso construir um MCP para que os usuários do painel do consultor possam pedir para o Claude fazer as coisas dentro da plataforma; como tem vários usuários, cada um precisa ser autenticado. Uso pelo Claude Desktop. Escopo: propostas (listar, buscar, ver detalhes, criar e editar), modelos de proposta (listar e ver), vagas (listar, criar e editar) e candidaturas (listar e ver candidatos de uma vaga)."

## Contexto

Os consultores da Ocean usam o Consultant Panel para emitir propostas comerciais, consultar modelos de proposta, publicar vagas e acompanhar candidaturas. A Ocean quer que cada consultor possa pedir essas tarefas em linguagem natural ao Claude Desktop (por exemplo, "crie uma proposta Executive Search para a empresa X com retainer de 30%" ou "quais candidaturas chegaram para a vaga de CFO?") e que o Claude execute as ações dentro do painel em nome daquele consultor.

O Claude Desktop permite adicionar "conectores personalizados" apontando para um endereço público. Ao conectar, o consultor é levado a uma tela de login do próprio sistema; a partir daí, o Claude age com as permissões daquele consultor, exatamente como se ele estivesse usando o painel.

## Clarifications

### Session 2026-11-13

- Q: Por onde os consultores vão conversar com o Claude? → A: Pelo Claude Desktop de cada consultor, usando um conector personalizado remoto (não há chat embutido no painel).
- Q: Como cada usuário é autenticado? → A: Cada consultor conecta o Claude com o próprio login do painel (usuário, senha e 2FA quando ativo) e autoriza explicitamente o acesso; o Claude passa a agir como aquele consultor.
- Q: Quais ações entram na primeira fase? → A: Propostas (listar, buscar, ver, criar e editar), modelos de proposta (listar e ver), vagas (listar, ver, criar e editar) e candidaturas (listar e ver candidatos de uma vaga). Perfil do consultor fica fora.
- Q: Exclusão, cancelamento de propostas, encerramento/reabertura de vagas e download de currículos entram? → A: Não nesta fase; continuam só pelo painel.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultor conecta o Claude Desktop à própria conta (Priority: P1)

O consultor adiciona o conector da Ocean no Claude Desktop (endereço exibido no painel) e clica em "Conectar". Abre-se a tela do Consultant Panel: se ele não estiver logado, faz login normalmente (usuário, senha e código 2FA se tiver); em seguida vê uma tela de autorização dizendo que o Claude quer acessar o painel em nome dele e o que poderá fazer. Ao clicar em "Permitir", volta ao Claude Desktop já conectado. No "Meu perfil" do painel ele vê a conexão ativa e pode desconectá-la.

**Why this priority**: Sem a conexão autenticada por usuário nenhuma outra história funciona, e é ela que garante que cada consultor só faça o que o painel já lhe permite.

**Independent Test**: Adicionar o endereço do conector no Claude Desktop, conectar com um usuário do painel, conferir que o Claude lista as ferramentas da Ocean; desconectar pelo painel e conferir que o Claude perde o acesso.

**Acceptance Scenarios**:

1. **Given** um consultor com acesso ao painel, **When** conecta o Claude Desktop e clica em "Permitir" na tela de autorização, **Then** volta ao Claude conectado e o Claude passa a enxergar as ações da Ocean.
2. **Given** a tela de autorização aberta, **When** o consultor clica em "Cancelar", **Then** nenhuma conexão é criada e o Claude informa que o acesso foi negado.
3. **Given** um consultor não logado no painel, **When** inicia a conexão, **Then** vê a tela de login do painel (com 2FA quando ativo) e, após entrar, segue para a tela de autorização sem precisar recomeçar.
4. **Given** um usuário sem acesso ao painel (ou desativado), **When** tenta conectar, **Then** a conexão é recusada com a mensagem de que ele não tem acesso.
5. **Given** uma conexão ativa, **When** o consultor abre "Meu perfil", **Then** vê o endereço do conector para copiar e a lista das suas conexões com o Claude (aplicativo, data de conexão e último uso).
6. **Given** uma conexão ativa, **When** o consultor clica em "Desconectar" e confirma, **Then** o Claude perde o acesso na próxima ação e precisa conectar de novo.
7. **Given** um usuário cujo acesso ao painel é retirado ou que é desativado, **When** o Claude tenta qualquer ação com a conexão dele, **Then** a ação é recusada imediatamente.

---

### User Story 2 - Consultor consulta propostas, modelos, vagas e candidaturas pelo Claude (Priority: P1)

Com o Claude conectado, o consultor pergunta em linguagem natural por propostas (por empresa, status, modelo, projeto, período ou autor), pede os detalhes de uma proposta, consulta os modelos de proposta disponíveis, lista vagas e vê as candidaturas de uma vaga. O Claude responde com os dados do painel e, quando útil, com o link para abrir o item no painel.

**Why this priority**: Consultas são o uso mais frequente e sem risco; já entregam valor (achar propostas, acompanhar candidatos) mesmo sem a criação.

**Independent Test**: Pedir ao Claude "liste minhas propostas aguardando assinatura", "mostre a proposta X", "quais modelos de Executive Search existem", "liste as vagas abertas" e "quem se candidatou à vaga Y"; conferir que os dados batem com o painel.

**Acceptance Scenarios**:

1. **Given** propostas cadastradas, **When** o consultor pede para listar com filtros (empresa, status, modelo, projeto, período, autor), **Then** o Claude recebe as mesmas propostas que o painel mostraria com esses filtros, com código, empresa, projeto, status, datas, autor e link do painel.
2. **Given** uma proposta, **When** o consultor pede os detalhes, **Then** o Claude recebe todos os dados exibidos no detalhe do painel (projetos, investimentos, consultor, validade, status, histórico de versões), o link do painel e o link da página do cliente.
3. **Given** modelos de proposta cadastrados, **When** o consultor pede para listar ou ver um modelo, **Then** o Claude recebe os modelos com divisão, nome, idioma, moeda, setor, projetos e condições.
4. **Given** vagas cadastradas, **When** o consultor pede para listar (filtrando por status ou termo) ou ver uma vaga, **Then** o Claude recebe as mesmas informações do painel, incluindo quantidade de candidaturas.
5. **Given** uma vaga com candidaturas, **When** o consultor pede as candidaturas, **Then** o Claude recebe nome, contatos, cargo e empresa atuais, localidade, pretensões, demais campos do formulário, data, status do envio à planilha e o link do painel para abrir o currículo.
6. **Given** um identificador inexistente, **When** o Claude pede o item, **Then** recebe a mensagem "não encontrado" do painel.

---

### User Story 3 - Consultor cria e edita propostas pelo Claude (Priority: P1)

O consultor descreve a proposta ao Claude (empresa, modelo, setor, idioma, moeda, projetos com seus investimentos, validade, escopo e condições). O Claude cria a proposta no painel, aplicando as mesmas validações e regras do formulário do painel; os dados do consultor vêm do "Meu perfil" quando não forem informados. O consultor também pode pedir ajustes numa proposta existente ("mude o retainer para 25%", "acrescente um projeto"), e o Claude altera só o que foi pedido, gerando uma nova versão como no painel. O Claude devolve o código e os links da proposta para o consultor revisar e compartilhar.

**Why this priority**: É o principal ganho de produtividade pedido: montar propostas por conversa.

**Independent Test**: Pedir ao Claude para criar uma proposta Executive Search com dois projetos; abrir o link devolvido no painel e conferir todos os dados; pedir uma alteração e conferir a nova versão e o histórico.

**Acceptance Scenarios**:

1. **Given** um consultor com perfil preenchido, **When** pede ao Claude uma proposta com os dados obrigatórios, **Then** a proposta é criada como no painel (mesmo status inicial, mesmo código e imposto vigente), com o consultor preenchido pelo perfil, e o Claude recebe o código, o link do painel e o link da página do cliente.
2. **Given** dados inválidos ou faltando (setor inexistente, nenhum projeto, taxa fora da faixa, validade já vencida), **When** o Claude tenta criar ou editar, **Then** nada é gravado e o Claude recebe a mesma mensagem de erro que o painel mostraria, para corrigir ou perguntar ao consultor.
3. **Given** uma proposta criada pelo próprio consultor e ainda não assinada nem cancelada, **When** ele pede uma alteração parcial, **Then** só os campos pedidos mudam, a versão é incrementada e o histórico registra a edição em nome dele.
4. **Given** uma proposta de outro consultor, **When** um consultor que não é admin pede para editá-la, **Then** a edição é recusada com a mesma mensagem do painel.
5. **Given** uma proposta assinada ou cancelada, **When** o Claude tenta editá-la, **Then** a edição é recusada com a mensagem do painel.
6. **Given** uma proposta criada ou editada pelo Claude, **When** alguém consulta a auditoria, **Then** a ação aparece em nome do consultor, identificada como feita via Claude.
7. **Given** a criação pelo Claude, **When** a proposta é salva, **Then** nada é enviado automaticamente ao cliente; o consultor decide quando compartilhar o link.

---

### User Story 4 - Consultor cria e edita vagas pelo Claude (Priority: P2)

O consultor pede ao Claude para publicar uma vaga (título, área, nível, localidade, resumo, pré-requisitos e demais campos) ou para ajustar uma vaga existente. O Claude aplica as mesmas regras do painel; a vaga criada fica aberta e aparece no site, como quando criada pelo painel.

**Why this priority**: Útil, mas menos frequente que propostas; o painel já cobre bem o fluxo.

**Independent Test**: Pedir ao Claude para criar uma vaga; conferir que ela aparece no painel e no site; pedir uma alteração e conferir.

**Acceptance Scenarios**:

1. **Given** os campos obrigatórios de uma vaga, **When** o consultor pede ao Claude para criá-la, **Then** a vaga é criada como "Aberta", com o consultor como autor, e aparece no site como qualquer vaga criada pelo painel.
2. **Given** uma vaga do próprio consultor (ou qualquer vaga, para admin), **When** ele pede uma alteração parcial, **Then** só os campos pedidos mudam.
3. **Given** uma vaga de outro consultor, **When** um consultor que não é admin pede para editá-la, **Then** a alteração é recusada com a mensagem do painel.
4. **Given** dados inválidos (área ou nível fora da lista, cliente ausente sem código da planilha), **When** o Claude tenta salvar, **Then** nada é gravado e o Claude recebe a mensagem do painel.
5. **Given** uma vaga criada ou editada pelo Claude, **When** alguém consulta a auditoria, **Then** a ação aparece em nome do consultor, identificada como feita via Claude.

---

### Edge Cases

- **Sessão do Claude expirada**: o acesso do Claude se renova sozinho enquanto a conexão estiver ativa; após 30 dias sem uso, a conexão expira e o consultor precisa conectar de novo.
- **Mesmo consultor em vários computadores**: cada Claude Desktop conectado gera uma conexão própria, listada separadamente e desconectável individualmente.
- **Admin retira o acesso ao painel ou desativa o usuário**: todas as conexões dele param de funcionar na hora, sem precisar desconectar uma a uma.
- **Pedido de autorização antigo ou adulterado** (link aberto muito depois ou alterado): a tela de autorização informa que o pedido expirou e orienta a conectar de novo pelo Claude.
- **Aplicativo que não é o Claude tentando se passar por ele**: só são aceitos retornos para os endereços oficiais do Claude e para endereços locais do próprio computador (usados por ferramentas de desenvolvimento).
- **Ação fora do escopo** (excluir proposta, cancelar, encerrar vaga, baixar currículo): o Claude não tem essas ações; deve orientar o consultor a usar o painel.
- **Muitos resultados**: listagens de propostas são paginadas; o Claude pode pedir as páginas seguintes.
- **Edição simultânea pelo painel e pelo Claude**: vale a última gravação, como já acontece entre dois usuários no painel; cada edição gera sua versão no histórico.
- **Propostas no formato antigo (proposta simples)**: podem ser consultadas, mas a edição pelo Claude é recusada com orientação de usar o painel.

## Requirements *(mandatory)*

### Functional Requirements

**Conexão e autenticação**

- **FR-001**: O sistema MUST oferecer um endereço público de conector que o Claude Desktop aceite como conector personalizado remoto.
- **FR-002**: Conectar MUST exigir que o consultor entre com o próprio login do painel (incluindo 2FA quando ativo) e autorize explicitamente o acesso numa tela de autorização que mostra quem está conectando e o que o Claude poderá fazer.
- **FR-003**: Somente usuários ativos, com acesso ao painel e com senha definida MUST conseguir conectar; os demais são recusados com mensagem clara.
- **FR-004**: Toda ação do Claude MUST ser executada como o consultor que autorizou a conexão, com exatamente as mesmas permissões e regras do painel (ver é liberado a todos; editar proposta ou vaga só autor ou admin).
- **FR-005**: O sistema MUST reconferir a cada ação se a conexão continua ativa e se o usuário continua ativo e com acesso ao painel; caso contrário, a ação é recusada na hora.
- **FR-006**: A credencial usada pelo Claude MUST valer só para o conector: MUST NOT servir para acessar o painel nem o ERP, e as credenciais do painel e do ERP MUST NOT servir para o conector.
- **FR-007**: A conexão MUST se manter ativa por até 30 dias sem uso, renovando-se automaticamente enquanto for usada.
- **FR-008**: O sistema MUST aceitar retornos de autorização apenas para os endereços oficiais do Claude e para endereços locais (loopback), além de endereços adicionais configurados pela Ocean.
- **FR-009**: O "Meu perfil" do painel MUST mostrar o endereço do conector (com ação de copiar) e as conexões ativas do consultor (aplicativo, data de conexão, último uso), com a ação "Desconectar" mediante confirmação.
- **FR-010**: Conectar e desconectar MUST ser registrados na auditoria em nome do consultor.

**Ações disponíveis ao Claude**

- **FR-011**: O Claude MUST poder listar propostas com os filtros do painel (status, empresa, modelo, projeto, período e autor), com paginação, e ver o detalhe de uma proposta.
- **FR-012**: O Claude MUST poder criar propostas por modelo (Executive Search, Offshore Talent, Outsourcing, Development & Outplacement) com as mesmas validações do painel; dados do consultor não informados MUST ser preenchidos com o "Meu perfil" do consultor.
- **FR-013**: O Claude MUST poder editar propostas informando só os campos a alterar; os demais permanecem como estão, e a edição segue as regras do painel (nova versão, histórico, bloqueio para assinadas e canceladas, só autor ou admin). Propostas simples (formato antigo) não são editáveis pelo Claude.
- **FR-014**: O Claude MUST poder listar e ver modelos de proposta (filtro por divisão e nome).
- **FR-015**: O Claude MUST poder listar vagas (filtro por status e termo), ver uma vaga, criar vagas e editar vagas informando só os campos a alterar, com as mesmas regras do painel.
- **FR-016**: O Claude MUST poder listar as candidaturas de uma vaga com todos os dados exibidos no painel e o link do painel para abrir o currículo; o arquivo do currículo MUST NOT ser entregue ao Claude.
- **FR-017**: Exclusão e cancelamento de propostas, encerramento, reabertura e exclusão de vagas, reenvio à planilha, alteração de modelos e do perfil MUST NOT estar disponíveis ao Claude nesta fase.
- **FR-018**: As respostas de propostas, vagas e candidaturas MUST incluir o link para abrir o item no painel; propostas também MUST incluir o link da página do cliente.
- **FR-019**: Erros de validação, permissão ou item inexistente MUST ser devolvidos ao Claude com a mesma mensagem do painel, sem gravar nada.
- **FR-020**: Criações e edições feitas pelo Claude MUST ser registradas na auditoria em nome do consultor e identificadas como feitas via Claude.
- **FR-021**: As descrições das ações e dos campos apresentadas ao Claude MUST estar em português e listar os valores aceitos (setores, modelos, áreas, níveis, idiomas, moedas, tipos de investimento), para o Claude preencher corretamente sem tentativa e erro.

### Key Entities

- **Aplicativo conectado**: aplicativo cliente (ex.: Claude) que se registrou para pedir acesso. Nome exibido, endereços de retorno permitidos, data de registro.
- **Conexão com o Claude**: autorização dada por um consultor a um aplicativo. Consultor, aplicativo, data de conexão, data do último uso, data de desconexão (quando houver).
- **Credenciais temporárias da conexão**: código de autorização de uso único (minutos) e credencial de renovação (até 30 dias sem uso), ligados a uma conexão; guardadas de forma que não possam ser reaproveitadas se vazarem do banco.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um consultor conecta o Claude Desktop à sua conta em menos de 2 minutos, sem ajuda técnica, seguindo apenas o endereço exibido no "Meu perfil".
- **SC-002**: 100% das ações feitas pelo Claude respeitam as mesmas permissões do painel (nenhuma edição de proposta ou vaga de outro consultor por quem não é admin).
- **SC-003**: Uma conexão desconectada ou um usuário desativado perde o acesso pelo Claude já na ação seguinte (0 ações aceitas depois disso).
- **SC-004**: Uma proposta completa com dois projetos é criada por conversa em menos de 3 minutos, com os mesmos dados que teria se fosse criada pelo painel.
- **SC-005**: 100% das criações e edições feitas pelo Claude aparecem na auditoria em nome do consultor e identificadas como via Claude.
- **SC-006**: 0 acessos ao painel ou ao ERP com a credencial do conector.

## Assumptions

- Cada consultor usa o Claude Desktop com uma conta Claude que permite conectores personalizados (planos pagos do Claude); a contratação e a configuração da conta Claude estão fora do escopo.
- O conector é publicado junto com a API atual, num endereço público com HTTPS; em desenvolvimento, o teste com o Claude Desktop usa um túnel para expor a API local.
- "Criar proposta" pelo Claude produz uma proposta igual à criada pelo painel (status inicial "aguardando assinatura", com link público); como no painel, nada é enviado ao cliente automaticamente.
- As regras de negócio, validações e mensagens são as já existentes no painel; esta feature não muda nenhuma regra de propostas, modelos, vagas ou candidaturas.
- O Claude Desktop pede confirmação ao consultor antes de executar ações, conforme a configuração do próprio Claude; o sistema não acrescenta uma confirmação própria por ação.
- Não há chat embutido no painel nem custo de uso de IA para a Ocean nesta feature; o processamento de linguagem é feito pela conta Claude de cada consultor.
- Limites de uso (quantidade de ações por minuto) não fazem parte desta fase.
