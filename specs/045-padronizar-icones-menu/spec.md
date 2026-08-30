# Feature Specification: Padronizar ícones, menu aberto e botões

**Feature Branch**: `045-padronizar-icones-menu`

**Created**: 2026-08-29

**Status**: Draft

**Input**: User description: "Melhorar e padronizar ícones (tanto do menu lateral, quanto botões de ações); Deixar menu aberto como padrão; Padronizar tamanho de texto e ordem dos botões"

## Clarifications

### Session 2026-08-29

- Q: Ao entrar ou recarregar, o menu deve lembrar se foi recolhido antes? → A: Sempre aberto ao entrar; ignora qualquer preferência anterior de recolhido.
- Q: Posição do botão Novo/Nova no cabeçalho? → A: Por último — importar → exportar → Novo/Nova (da esquerda para a direita).
- Q: Escopo da padronização de ícones, ordem e tamanho dos botões? → A: Só páginas de listagem/CRUD com tabelas; Dashboard e Configurações ficam de fora.
- Q: Rótulo da ação destrutiva em listagens? → A: Sempre **Excluir** (padronizar Deletar → Excluir).
- Q: Estilo visual dos botões de ação em linha de listagem? → A: Fundo colorido suave por tipo de ação (padrão da maioria hoje).

## Escopo

| Área | Escopo |
|------|--------|
| Menu lateral (aberto por padrão, ícones, tamanho dos rótulos) | Todas as páginas autenticadas com menu |
| Botões de ação (cabeçalho, linha, modais de CRUD) | Apenas páginas de **listagem/CRUD com tabelas** |
| **Fora do escopo** | **Dashboard** e **Configurações** (botões, ícones de ação, ordem e tamanho permanecem como estão) |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Menu lateral aberto por padrão (Priority: P1)

O usuário autenticado entra no sistema e encontra o menu lateral **aberto** (ícone + nome de cada página), sem precisar expandi-lo. Ele ainda pode recolher o menu pelo controle explícito quando quiser mais espaço, mas clicar na área de conteúdo (tabelas, filtros, botões das páginas) **não** fecha o menu.

**Why this priority**: Hoje o menu recolhe ao interagir com o conteúdo e essa preferência fica salva, então o usuário frequentemente encontra o menu fechado. Abrir por padrão e não fechar no clique fora é o pedido explícito e o maior ganho imediato de uso.

**Independent Test**: Entrar autenticado, confirmar menu expandido; clicar em conteúdo e confirmar que o menu permanece aberto; recolher só pelo controle do menu; recarregar e confirmar o estado esperado (ver cenários).

**Acceptance Scenarios**:

1. **Given** um usuário autenticado (incluindo quem havia recolhido o menu em visita anterior), **When** a aplicação autenticada carrega ou é recarregada, **Then** o menu lateral inicia expandido (ícone e rótulo visíveis em cada item).
2. **Given** o menu expandido, **When** o usuário clica em qualquer ponto da área de conteúdo principal (fora do menu), **Then** o menu permanece expandido.
3. **Given** o menu expandido, **When** o usuário aciona o controle explícito de recolher, **Then** o menu passa ao modo só ícones.
4. **Given** o menu recolhido pelo controle explícito, **When** o usuário aciona o controle de expandir, **Then** o menu volta a mostrar ícone e rótulo.
5. **Given** o usuário recolheu o menu pelo controle explícito durante a sessão, **When** ele recarrega a aplicação ou entra novamente (mesmo login, mesmo navegador), **Then** o menu inicia expandido (a escolha de recolher **não** é lembrada entre visitas).
6. **Given** o menu recolhido na sessão atual, **When** o usuário aciona o controle de expandir **sem** recarregar, **Then** o menu volta a expandido até o fim da sessão ou até novo recolhimento explícito.
7. **Given** papéis `admin` e `visualizador`, **When** cada um entra no sistema, **Then** o menu sempre inicia expandido (apenas os itens visíveis continuam a respeitar permissão).

---

### User Story 2 - Ícones reconhecíveis no menu e nas ações de listagem (Priority: P1)

O usuário identifica cada página do menu e, nas telas de listagem/CRUD, cada ação recorrente (criar, importar, exportar, editar, excluir, pagar/receber, anexar etc.) pelo **mesmo ícone**. Os ícones têm o mesmo estilo visual (peso, tamanho, clareza) e correspondem ao significado da ação ou da página.

**Why this priority**: Ícones diferentes para a mesma ação (ou ações só com texto em uma tela e só com ícone em outra) aumentam o tempo para achar o botão certo e passam impressão de produto inconsistente.

**Independent Test**: Percorrer o menu (todas as páginas) e, em pelo menos três páginas de listagem/CRUD, conferir que a mesma ação usa o mesmo ícone e o mesmo tamanho visual.

**Acceptance Scenarios**:

1. **Given** o menu expandido, **When** o usuário olha os itens visíveis, **Then** cada item tem um ícone distinto, no mesmo tamanho e estilo, associado ao rótulo da página.
2. **Given** o menu recolhido, **When** o usuário olha os itens, **Then** os mesmos ícones aparecem no mesmo estilo, sem rótulo ao lado, e continuam identificáveis (dica de nome no hover/foco permanece).
3. **Given** botões de ação do cabeçalho em páginas de listagem/CRUD (criar, importar, exportar, imprimir/PDF, quando existirem), **When** o usuário compara duas dessas páginas que oferecem a mesma ação, **Then** o ícone dessa ação é o mesmo nas duas páginas.
4. **Given** botões de ação em linha de listagem/CRUD (editar, excluir, pagar/receber, anexar, arquivar etc., quando existirem), **When** o usuário compara duas dessas páginas que oferecem a mesma ação, **Then** o ícone e o rótulo visível dessa ação são os mesmos nas duas páginas.
5. **Given** a ação destrutiva **Excluir** em listagem/CRUD, **When** o usuário a localiza, **Then** o rótulo é sempre **Excluir** (nunca Deletar), com o mesmo ícone e destaque visual de risco em todas as listagens que têm essa ação.
6. **Given** tema claro e tema escuro, **When** o usuário observa ícones do menu e dos botões de listagem/CRUD, **Then** o contraste permanece legível nos dois temas.
7. **Given** Dashboard ou Configurações, **When** o usuário olha os botões dessas telas, **Then** eles **não** entram no escopo de padronização de ícones de ação (podem permanecer como estão); o menu lateral dessas páginas segue o padrão global.

---

### User Story 3 - Texto e ordem dos botões iguais nas listagens (Priority: P1)

Nas páginas de listagem/CRUD com tabelas, o usuário encontra os botões de ação sempre na **mesma ordem**, com o **mesmo tamanho de texto** e o **mesmo estilo visual** (fundo colorido suave por tipo de ação nas linhas), no cabeçalho, nas linhas das listagens e no rodapé dos formulários/modais abertos a partir dessas telas.

**Why this priority**: Ordem e tamanho misturados (Novo no início em uma tela e no fim em outra; um botão minúsculo e outro maior; Editar/Excluir em sequências diferentes) são o segundo pedido explícito e afetam as páginas de operação diária.

**Independent Test**: Abrir três páginas de listagem/CRUD com cabeçalho de ações e conferir ordem e tamanho; abrir uma linha de ações e um modal e conferir a ordem padrão. Confirmar que Dashboard e Configurações não foram alteradas.

**Acceptance Scenarios**:

1. **Given** uma página de listagem/CRUD com ações de cabeçalho, **When** o usuário olha o grupo de botões do topo, **Then** a ordem é sempre: importar (se houver) → exportar (CSV, depois planilha, depois PDF, se houver) → ação primária de criar (Novo/Nova).
2. **Given** duas páginas de listagem/CRUD que têm “Nova/Novo” e exportação, **When** o usuário compara os cabeçalhos, **Then** a ação de criar ocupa a mesma posição relativa (última do grupo) e o texto dos botões tem o mesmo tamanho visual.
3. **Given** uma linha de listagem com várias ações, **When** o usuário lê da esquerda para a direita (ou da primeira para a última no grupo), **Then** a ordem é: ações auxiliares (documentos, histórico, anexar) → ações de fluxo (pagar, receber, aprovar) → editar → arquivar/desativar → excluir (sempre por último), e cada botão usa **fundo colorido suave** coerente com o tipo de ação.
4. **Given** duas listagens/CRUD com a mesma ação em linha (ex.: Editar, Excluir, Pagar), **When** o usuário compara o estilo visual, **Then** a mesma ação usa a mesma cor de fundo suave e o mesmo destaque em ambas as telas.
5. **Given** um modal ou formulário de CRUD aberto a partir de uma listagem, **When** o usuário olha o rodapé, **Then** Cancelar vem antes da ação principal de confirmar, e os dois usam o mesmo tamanho de texto entre si e entre listagens.
6. **Given** o menu lateral expandido, **When** o usuário compara os rótulos dos itens, **Then** todos usam o mesmo tamanho de texto.
7. **Given** um visualizador (somente leitura), **When** ele vê os botões que lhe são permitidos, **Then** a ordem, o tamanho e o estilo dos que restam seguem o mesmo padrão, só omitindo as ações que o papel não tem.
8. **Given** uma página de listagem/CRUD sem ação de criar (por regra de negócio já existente), **When** o usuário olha o cabeçalho, **Then** as ações restantes (importar/exportar) mantêm a mesma ordem relativa, sem “buraco” ou ordem invertida.
9. **Given** Dashboard ou Configurações, **When** o usuário olha botões de ação dessas telas, **Then** ordem, tamanho, ícones e estilo **não** são alterados por esta feature (fora do escopo de botões).

---

### Edge Cases

- **Dashboard** e **Configurações**: botões de ação fora do escopo; menu lateral segue o padrão global desta feature.
- Página sem importação, sem exportação ou sem “Novo” (dentro do escopo listagem/CRUD): o grupo de cabeçalho mostra só o que existir, na ordem padrão.
- Página de listagem/CRUD cujo cabeçalho hoje coloca Novo/Nova antes de importar/exportar (ex.: Contas a Receber): reordena para importar → exportar → Novo/Nova, mantendo as mesmas ações.
- Página com ações extras específicas (ex.: Docs, Histórico, Tornar padrão, Reativar): essas ações entram no grupo auxiliar ou de fluxo, nunca depois de Excluir.
- Item de menu sem ícone hoje: passa a ter ícone no mesmo estilo dos demais; nenhum item visível fica só com texto no menu.
- Menu recolhido: ícones de ação das páginas (cabeçalho e linhas) não mudam de tamanho nem de ordem; só o menu muda de largura.
- Clique no próprio menu (item, controle de recolher/expandir, busca do menu se houver) não é “clique no conteúdo” e não altera o estado além da navegação/controle acionado.
- Qualquer preferência salva de menu recolhido (por clique no conteúdo ou por controle explícito em visitas anteriores) é **ignorada** ao entrar ou recarregar; o menu sempre abre expandido.
- Recolhimento pelo controle explícito vale **apenas na sessão atual**; não persiste após recarregar ou nova entrada.
- Telas estreitas: o mesmo padrão (aberto por padrão, recolhe só no controle explícito); esta feature não introduz menu overlay/gaveta.
- Estado vazio da listagem (nenhum registro): botões de cabeçalho permanecem no padrão; ações de linha simplesmente não aparecem.
- Listagem/CRUD que hoje usa botões de linha só com borda/contorno (ex.: Fluxo de Caixa): passa ao padrão de **fundo colorido suave** por tipo de ação.
- Listagem/CRUD que hoje usa **Deletar** (ex.: Contas a Pagar): rótulo passa a **Excluir**, mantendo ícone, posição (sempre por último) e estilo destrutivo (fundo vermelho suave).
- Botões desabilitados (ex.: receber já pago): permanecem na mesma posição e com o mesmo ícone; só o estado desabilitado muda.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O menu lateral MUST iniciar expandido (ícone + rótulo) em **toda** entrada ou recarregamento da aplicação autenticada, independentemente de visitas anteriores.
- **FR-002**: Clique na área de conteúdo principal MUST NÃO recolher nem expandir o menu.
- **FR-003**: Recolher e expandir o menu MUST ocorrer apenas pelo controle explícito do próprio menu.
- **FR-004**: O estado recolhido MUST **não** ser persistido entre visitas ou recarregamentos; recolher pelo controle explícito vale apenas na sessão corrente.
- **FR-005**: Cada item visível do menu MUST exibir um ícone no mesmo estilo e tamanho, semanticamente relacionado à página.
- **FR-006**: A mesma ação de interface (criar, importar, exportar CSV, exportar planilha, exportar PDF, editar, excluir, pagar/receber, anexar, arquivar, documentos, histórico, aprovar, rejeitar, desativar, reativar) MUST usar o mesmo ícone em todas as **páginas de listagem/CRUD com tabelas** em que existir.
- **FR-007**: Em páginas de listagem/CRUD, botões de ação de cabeçalho e de linha MUST exibir ícone e rótulo de texto visível juntos (não só ícone). O nome da ação permanece visível sem depender de hover.
- **FR-008**: O tamanho do texto dos botões de cabeçalho MUST ser o mesmo em todas as páginas de listagem/CRUD que têm esses botões.
- **FR-009**: O tamanho do texto dos botões de ação em linha de listagem MUST ser o mesmo em todas as listagens/CRUD no escopo (um tamanho único para esse contexto, podendo ser menor que o do cabeçalho, mas igual entre páginas).
- **FR-010**: Os rótulos do menu lateral expandido MUST usar o mesmo tamanho de texto entre todos os itens.
- **FR-011**: Em páginas de listagem/CRUD, a ordem dos botões de cabeçalho MUST ser: importar → exportar (CSV, planilha, PDF) → criar (Novo/Nova), da esquerda para a direita.
- **FR-012**: Em páginas de listagem/CRUD, a ordem dos botões em linha MUST ser: auxiliares → fluxo → editar → arquivar/desativar → excluir, da esquerda para a direita.
- **FR-013**: No rodapé de modal/formulário de CRUD aberto a partir de listagem, Cancelar MUST preceder a ação principal de confirmar (Salvar, Criar, Confirmar).
- **FR-014**: Ícones MUST permanecer legíveis em tema claro e tema escuro.
- **FR-015**: Regras de visibilidade por papel (`admin` / `visualizador` / permissões) MUST permanecer inalteradas; a padronização não cria nem remove ações, só uniformiza as que já existem.
- **FR-016**: Indicadores numéricos de alerta nos itens do menu MUST continuar visíveis no modo expandido e no recolhido, como já ocorre hoje.
- **FR-017**: Padronização de botões de ação (ícones, ordem, tamanho de texto) MUST aplicar-se **somente** a páginas de listagem/CRUD com tabelas; **Dashboard** e **Configurações** MUST permanecer fora desse escopo.
- **FR-018**: A ação destrutiva de remoção de registro MUST usar o rótulo **Excluir** em todas as listagens/CRUD no escopo (substituir **Deletar** onde existir hoje).
- **FR-019**: Botões de ação **em linha** de listagem/CRUD MUST usar **fundo colorido suave** distinto por tipo de ação (ex.: editar, excluir, fluxo/pagar, auxiliar, arquivar/desativar), coerente entre todas as listagens no escopo; não usar estilo só de borda/contorno sem preenchimento.

### Key Entities

- **Item de menu**: Entrada da navegação lateral com rótulo, destino, ícone e eventual contador de alerta.
- **Botão de ação**: Controle de interface classificado por contexto (cabeçalho, linha de listagem, rodapé de modal) e por tipo (importar, exportar, criar, auxiliar, fluxo, editar, destrutivo).
- **Estado do menu**: Expandido ou recolhido **na sessão atual**, alterado só pelo controle explícito; sempre reinicia expandido ao entrar ou recarregar.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos acessos e recarregamentos (incluindo usuários que haviam recolhido o menu antes), o menu inicia expandido.
- **SC-002**: Em 100% das tentativas, clicar na área de conteúdo com o menu expandido **não** o recolhe.
- **SC-003**: Um usuário interno localiza o controle de recolher/expandir e alterna o estado do menu em até 5 segundos.
- **SC-004**: 100% dos itens visíveis do menu exibem ícone no mesmo tamanho visual (diferença imperceptível a olho nu entre itens).
- **SC-005**: Em amostragem de pelo menos 5 páginas de listagem/CRUD no escopo, a mesma ação recorrente usa o mesmo ícone em 100% dos casos em que a ação existe.
- **SC-006**: Em amostragem de pelo menos 5 páginas de listagem/CRUD com cabeçalho de ações, a ordem importar → exportar → criar se verifica em 100% das páginas que têm essas ações.
- **SC-007**: Em amostragem de pelo menos 5 listagens/CRUD no escopo, **Excluir** é sempre a última ação da linha e o rótulo nunca aparece como Deletar, em 100% das linhas que têm essa ação.
- **SC-008**: Um usuário interno, ao ir de uma listagem/CRUD para outra no escopo, reconhece Novo, Editar e Excluir na posição esperada na primeira tentativa, sem treinar a tela (meta qualitativa: pelo menos 9 em 10 acertos de localização).
- **SC-009**: O tamanho visual do texto dos botões de cabeçalho é uniforme entre páginas de listagem/CRUD no escopo (nenhuma com botão visivelmente menor ou maior que as demais).
- **SC-010**: Após recarregar a página, o menu inicia expandido em 100% das tentativas, mesmo que o usuário o tivesse recolhido na sessão anterior.
- **SC-011**: Em amostragem de pelo menos 5 listagens/CRUD no escopo, botões de linha da mesma ação usam o mesmo fundo colorido suave em 100% dos casos (nenhuma listagem no escopo com estilo só de borda para ações de linha).

## Assumptions

- “Menu aberto como padrão” significa: **sempre** inicia expandido ao entrar ou recarregar; não fecha ao clicar no conteúdo; recolhe só no controle do menu **durante a sessão**; **não** lembra recolhido entre visitas. Isso **altera** o comportamento anterior em que clicar no conteúdo recolhia o menu e gravava essa preferência, e também remove a persistência de recolhimento explícito entre sessões.
- Preferências antigas de menu recolhido (por clique no conteúdo ou por controle explícito) são ignoradas; toda entrada/recarregamento abre expandido.
- Não há redesign completo do layout, das cores institucionais nem da ordem das páginas no menu.
- O conjunto de páginas, permissões e ações existentes não muda: só aparência, ordem e comportamento de abertura do menu.
- **Escopo de botões**: padronização de ícones, ordem e tamanho de texto aplica-se **somente** a páginas de listagem/CRUD com tabelas; **Dashboard** e **Configurações** ficam de fora (botões permanecem como estão).
- **Escopo de menu**: comportamento e ícones do menu lateral aplicam-se a **todas** as páginas autenticadas com menu.
- Cabeçalho das páginas de listagem/CRUD: ação primária de criar fica **sempre por último** (importar → exportar → Novo/Nova), inclusive em telas que hoje invertem essa ordem (ex.: Contas a Receber).
- Linhas de listagem: da ação mais segura/auxiliar para a mais destrutiva, com **Excluir** sempre no fim (rótulo canônico; não usar Deletar).
- Modais: Cancelar à esquerda (ou primeiro), confirmar à direita (ou por último).
- “Melhorar ícones” inclui substituir setas e prefixos soltos no texto dos botões (por exemplo “↑”, “↓”, “+”) por ícones no mesmo estilo do restante da interface, mantendo o rótulo (Importar CSV, Exportar PDF, Nova conta etc.).
- Tamanho de texto padronizado refere-se a **botões** (cabeçalho e linhas) e **rótulos do menu**, não a títulos de página, células de tabela, campos de formulário ou cartões do Dashboard.
- Login e telas sem menu lateral ficam fora do escopo, salvo se algum botão nessas telas for o mesmo tipo de ação (não é o caso hoje).
- O estado do menu **não** é mais persistido entre visitas; recolhimento é efêmero à sessão corrente.
- Listagens que hoje usam só ícone nas ações de linha passam a mostrar ícone e texto, para o tamanho do rótulo poder ser comparado entre páginas.
- Botões de **linha** em listagens/CRUD: **fundo colorido suave** por tipo de ação (editar, excluir, fluxo, auxiliar etc.), coerente entre telas; substitui estilos só com borda onde existirem hoje.
- Estilo visual detalhado dos botões de **cabeçalho** (borda vs preenchimento) fica para o plano, desde que legível em tema claro/escuro e coerente entre listagens no escopo.
