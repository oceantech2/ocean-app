# Feature Specification: Propostas v2 — serviços, setor Outros e PDF A4

**Feature Branch**: `105-proposta-servicos-v2`

**Created**: 2026-11-17

**Status**: Implemented

**Input**: User description: "ocean-propostas-v2.zip — atualização do app de propostas; rótulo de impostos deve ser 'Impostos (18,75%)' (sem 'até'); incluir ajuste do PDF que está quebrado."

## Contexto

O painel de propostas (Consultant Panel) hoje monta a proposta a partir de **divisão** + **modelo de página** (executive-search, outplacement-development, outsourcing, offshore-talent) e, na nova proposta, também de **modelos de proposta** cadastrados (feature 098) e seletores por seção (feature 104). O PDF gerado pela impressão do navegador continua com problemas de paginação (quebra no meio de cards, muitas páginas, cabeçalho/rodapé do Chrome).

O pacote de referência `ocean-propostas-v2.zip` (11/2026) define a nova forma de criar e exibir propostas:

- Saem **Divisão** e **Modelo** do formulário; a marca na capa é sempre a logo Ocean.
- Entra o card **Serviço** (um ou mais serviços comerciais), com textos, metodologia/quadro e observações padrão por serviço.
- **Setor** ganha a opção **Outros** (capa navy com símbolo da logo em marca d’água).
- **Observações** passam a ser dois campos editáveis (investimento e garantias), pré-preenchidos pelos serviços escolhidos e pelo idioma; o placeholder `{imposto}` vira o imposto vigente da Configuração.
- O HTML/CSS da página do cliente e do PDF A4 é refeito: `@page` sem margem do navegador, moldura de página, escala ~70%, blocos que não se partem.

**Ajuste obrigatório em relação ao zip**: o texto padrão de impostos NÃO usa “até”. Em português: `Impostos ({imposto}) serão adicionados…` (ex.: “Impostos (18,75%)…”). Em inglês: `Taxes ({imposto}) will be added…` (ex.: “Taxes (18.75%)…”).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar proposta escolhendo serviços (Priority: P1)

O consultor abre “Nova proposta”, escolhe idioma/moeda, cliente (incluindo setor com opção Outros), consultor, **um ou mais serviços**, escopo, projetos com investimentos, garantias e validade. Não há seletor de divisão nem de modelo de página. Ao gerar, a proposta pública mostra capa Ocean, seções dos serviços escolhidos, escopo, investimento, garantias e fechamento.

**Why this priority**: É o fluxo central da atualização; sem isso o restante não entrega valor.

**Independent Test**: Criar proposta com “Recrutamento e Seleção” + setor Tecnologia; abrir o link público e conferir capa com foto do setor, seção do serviço com metodologia, investimentos e observações com “Impostos (18,75%)” (ou o percentual vigente), sem a palavra “até”.

**Acceptance Scenarios**:

1. **Given** o consultor na nova proposta, **When** a tela carrega, **Then** não há campos Divisão nem Modelo; há card Serviço com as opções Inteligência de Mercado, Recrutamento e Seleção, Assessment, Outplacement e Soluções Personalizadas.
2. **Given** nenhum serviço marcado, **When** o consultor tenta gerar, **Then** a validação impede o envio e pede ao menos um serviço.
3. **Given** um ou mais serviços marcados, **When** as observações ainda não foram editadas manualmente, **Then** os campos de observações de investimento e de garantias são preenchidos automaticamente com o texto padrão dos serviços (mesclando mín. valor e linha de imposto uma vez).
4. **Given** o imposto vigente 18,75%, **When** a proposta é exibida ao cliente, **Then** a linha de imposto aparece como “Impostos (18,75%)…” em pt-BR e “Taxes (18.75%)…” em en-US, sem “até” / “up to”.
5. **Given** setor Outros, **When** a proposta é exibida, **Then** a capa é navy sólida com o símbolo da logo em marca d’água (sem foto de setor).

---

### User Story 2 - PDF A4 legível e sem quebra (Priority: P1)

O consultor ou o cliente baixa o PDF (impressão do navegador). O arquivo sai em A4, sem data/URL do Chrome nas bordas, com margens internas consistentes, capa sangrando no topo da primeira página, e sem cortar cards de investimento, blocos de serviço, observações ou o fechamento no meio.

**Why this priority**: O zip inclui correção explícita do PDF quebrado; é dor atual do time comercial.

**Independent Test**: No Chrome, gerar PDF de (a) Recrutamento com 1 projeto ≈ 2 páginas; (b) Outplacement ≈ 2 páginas; (c) 2 projetos com 3 investimentos + escopo ≈ 3 páginas; conferir que grades de metodologia e cards ficam lado a lado como na tela (escala reduzida).

**Acceptance Scenarios**:

1. **Given** a página pública da proposta, **When** o usuário imprime/salva PDF no Chrome, **Then** não aparecem cabeçalho/rodapé padrão do navegador (data, título, URL).
2. **Given** o PDF gerado, **When** se examinam as páginas, **Then** cards de plano, seções de serviço, observações e bloco de contato não estão cortados ao meio.
3. **Given** breakpoints de celular, **When** a página é vista na tela estreita, **Then** o layout mobile se aplica; **When** se imprime, **Then** o layout de impressão A4 não herda o empilhamento mobile.

---

### User Story 3 - Propostas e modelos antigos continuam usáveis (Priority: P2)

Propostas já criadas com os modelos antigos (divisão/modelo) abrem na visão pública. Na criação/edição novas, o sistema usa serviços. Modelos de proposta cadastrados e o conector MCP passam a gravar/aceitar `servicos` e setor `outros`, com mapeamento documentado do `modelo` antigo.

**Why this priority**: Evita quebrar histórico e integrações já em uso.

**Independent Test**: Abrir uma proposta antiga (executive-search); conferir que a página pública ainda renderiza. Criar proposta nova via MCP/API com `servicos` e `setor: outros`; conferir persistência e renderização.

**Acceptance Scenarios**:

1. **Given** proposta antiga com `modelo` de divisão, **When** o cliente abre o link, **Then** a proposta continua legível (migração de leitura: mapa modelo → serviço equivalente, ou renderização compatível).
2. **Given** criação via API/MCP, **When** o payload traz `servicos` (lista) e opcionalmente omite `modelo`, **Then** a proposta é salva no formato novo.
3. **Given** payload legado com `modelo` sem `servicos`, **When** criado/editado, **Then** o sistema mapeia: executive-search → recrutamento-e-selecao; outplacement-development → outplacement; outsourcing e offshore-talent → recrutamento-e-selecao.

---

### Edge Cases

- Vários serviços: observações mesclam textos sem duplicar a linha de imposto; o valor mínimo exibido é o maior entre os serviços selecionados.
- Observações editadas à mão: troca de serviço/idioma **não** sobrescreve até o consultor pedir para restaurar o padrão (comportamento do protótipo: flag de edição).
- Escopo vazio: seção Escopo não aparece na página do cliente.
- Shortlist/SLA/garantia vazios: só as linhas preenchidas entram em Garantias; se tudo vazio e sem observações de garantias, a seção some.
- Forma de pagamento: entrada vazia/0 → “100% após conclusão”; 100 → “100% antecipado”; outro → “X% de entrada + Y% após conclusão”.
- Imposto do mês atual ausente: usa o último cadastrado (comportamento já existente da Config); o texto na proposta usa esse valor sem “até”.
- Setor sem imagem (só Outros): capa plain; demais setores usam a foto correspondente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O formulário de nova/editar proposta MUST NOT exigir Divisão nem Modelo de página; MUST exigir ao menos um serviço entre os cinco definidos no conteúdo institucional v2.
- **FR-002**: O sistema MUST persistir a proposta com lista `servicos`, idioma, moeda, cliente (empresa, data, setor incluindo `outros`), consultor, escopo, projetos/investimentos, shortlist/SLA/garantia, `observacoes_investimento`, `observacoes_garantias` e validade.
- **FR-003**: Textos fixos de serviço (título, tagline, corpo, quadro cols/steps e observações padrão) MUST seguir o conteúdo do pacote v2 (fonte institucional 11/2026), com a correção do rótulo de impostos sem “até”/“up to”.
- **FR-004**: A capa MUST usar sempre a logo Ocean; setor com foto usa a imagem do setor; setor `outros` usa capa navy com símbolo em marca d’água.
- **FR-005**: A página pública e o PDF MUST aplicar o layout de impressão A4 do pacote v2 (`@page` sem margem do navegador, moldura de página, escala reduzida, `break-inside: avoid` nos blocos críticos, media queries mobile só em `screen`).
- **FR-006**: O placeholder `{imposto}` nas observações MUST ser substituído pelo imposto vigente formatado (pt: vírgula; en: ponto) incluindo o símbolo `%` quando fizer parte do valor configurado/exibido.
- **FR-007**: Propostas legadas MUST permanecer acessíveis publicamente via mapeamento modelo→serviço (ou renderização compatível documentada).
- **FR-008**: API de propostas e ferramentas MCP de criar/editar MUST aceitar `servicos` e `setor: outros`, e mapear `modelo` legado quando `servicos` estiver ausente.
- **FR-009**: O `escopo_html` MUST ser sanitizado (apenas p, br, b/strong, ol, ul, li) no cliente e de novo no servidor antes de salvar.
- **FR-010**: Cadastro de “modelos de proposta” (atalhos pré-preenchidos) MUST alinhar-se ao novo formulário (serviços no lugar de divisão/modelo de página), preservando a utilidade de reutilizar escopo/projetos/garantias.

### Key Entities

- **Serviço comercial**: um dos cinco produtos (inteligência-de-mercado, recrutamento-e-selecao, assessment, outplacement, solucoes-personalizadas), com layout cols ou steps e notas padrão.
- **Proposta**: documento comercial com serviços selecionados, dados de cliente/consultor, escopo, projetos, observações e validade.
- **Setor de capa**: oil-gas, energia, infraestrutura, mineracao, tecnologia, industria-servicos, outros.
- **Imposto vigente**: percentual da Configuração usado nas observações.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Consultor cria uma proposta completa (serviço + cliente + 1 projeto) em menos de 5 minutos no fluxo novo, sem escolher divisão/modelo.
- **SC-002**: Em testes manuais no Chrome, os três casos de referência do PDF (1 projeto R&S; Outplacement; 2 projetos + escopo) resultam em ~2, ~2 e ~3 páginas respectivamente, sem corte de cards.
- **SC-003**: 100% das novas propostas geradas exibem a linha de imposto sem a palavra “até” / “up to”.
- **SC-004**: Propostas criadas antes da feature continuam abrindo pelo link público sem erro.
- **SC-005**: Setor Outros produz capa navy sem foto em 100% dos casos de teste.

## Assumptions

- O pacote `ocean-propostas-v2.zip` (arquivos em `src/` e `img/`) é a fonte de verdade visual e de conteúdo, exceto pelo rótulo de impostos sem “até”.
- A geração de PDF continua via impressão do navegador (`window.print`); geração server-side (Puppeteer/Playwright) fica fora do escopo desta feature, apenas recomendada.
- Autenticação, aceite por e-mail, validade e impostos mensais da Config permanecem; só mudam forma de montar conteúdo e layout/PDF.
- Modelos de proposta (cadastro) são adaptados ao novo schema; a feature 104 (seletor por seção ligada a divisão) deixa de fazer sentido no formulário novo e é substituída pelo fluxo de serviços + observações editáveis.
- Imagens de setor do zip substituem/atualizam as de `frontend/public/propostas/setores/` quando houver diferença; `industria-servicos` e capa Outros entram no conjunto.
