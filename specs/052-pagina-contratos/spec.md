# Feature Specification: Página Contratos

**Feature Branch**: `052-pagina-contratos`

**Created**: 2026-09-06

**Status**: Draft

**Input**: User description: "CONTRATOS - Adicionar página \"Contratos\" para incluir apenas dois links (pastas do Google Drive)"

**Baseline**: Referencia o catálogo de páginas e o padrão de menu/visibilidade/permissões já vigentes no Ocean App. Esta feature **adiciona** um módulo navegável novo cuja única função é expor dois atalhos externos para pastas de contratos no Google Drive; não altera Dashboard nem demais módulos, salvo inclusão do item no menu, no catálogo de visibilidade e nas permissões.

## Clarifications

### Session 2026-09-06

- Q: Quais rótulos exibir para os dois atalhos do Google Drive (nessa ordem: 1º link, 2º link)? → A: **Contratos ativos** e **Contratos arquivados**

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Abrir a página Contratos pelo menu (Priority: P1)

O usuário autenticado (administrador ou visualizador com permissão) encontra o item **Contratos** no menu lateral, abre a página e vê uma tela dedicada apenas aos atalhos das pastas de contratos. Quem não tem permissão não vê o item. Em Configurações, o administrador inclui Contratos na lista de páginas ocultáveis e nas permissões do visualizador, no mesmo padrão das demais páginas.

**Why this priority**: Sem ponto de entrada no produto, os links não são encontráveis pela equipe.

**Independent Test**: Entrar como admin e como visualizador (com e sem permissão); confirmar item de menu, abertura da página, ausência para quem não tem permissão; em Configurações, confirmar Contratos na visibilidade global e nas permissões.

**Acceptance Scenarios**:

1. **Given** um administrador autenticado, **When** consulta o menu lateral, **Then** vê o item **Contratos** e, ao acioná-lo, abre a página Contratos.
2. **Given** um visualizador com permissão ao módulo Contratos e a página visível globalmente, **When** consulta o menu, **Then** vê **Contratos** e consegue abrir a página.
3. **Given** um visualizador sem permissão a Contratos, **When** consulta o menu ou tenta o endereço direto, **Then** não vê o item e não acessa o conteúdo (mesmo tratamento das demais páginas restritas).
4. **Given** Contratos oculta na visibilidade global, **When** qualquer usuário autentica, **Then** o item some do menu e da busca rápida; o visualizador não acessa pelo endereço; o administrador ainda acessa pelo endereço direto (regra já vigente de páginas ocultas).
5. **Given** um administrador em Configurações, **When** abre visibilidade de páginas e permissões de visualizador, **Then** Contratos aparece na lista com rótulo **Contratos** e descrição compreensível (acesso às pastas de contratos no Google Drive).

---

### User Story 2 - Acessar as duas pastas de contratos no Google Drive (Priority: P1)

Na página Contratos, o usuário vê exatamente **dois** atalhos, cada um levando a uma pasta específica do Google Drive. Ao acionar um atalho, o destino abre em nova aba/janela do navegador, sem sair da sessão do Ocean App na aba original. Não há formulário, upload, listagem interna de arquivos nem cadastro de contratos no Ocean App.

**Why this priority**: É o valor da feature — centralizar o acesso rápido às pastas oficiais de contratos.

**Independent Test**: Abrir a página autenticado, conferir os rótulos **Contratos ativos** e **Contratos arquivados**, acionar cada um e confirmar abertura da URL correta em nova aba.

**Acceptance Scenarios**:

1. **Given** a página Contratos aberta, **When** o usuário observa o conteúdo, **Then** vê exatamente dois atalhos (nem mais, nem menos), rotulados **Contratos ativos** e **Contratos arquivados**.
2. **Given** o atalho **Contratos ativos**, **When** o usuário o aciona, **Then** o navegador abre em nova aba a pasta `https://drive.google.com/drive/u/2/folders/1pJGZNasVVx2pGdk0-mu6GA0L4x59gj9H`.
3. **Given** o atalho **Contratos arquivados**, **When** o usuário o aciona, **Then** o navegador abre em nova aba a pasta `https://drive.google.com/drive/u/2/folders/1t8HPQgoqgyG1wWy7CjJbDoEJoayi_PJ-`.
4. **Given** o usuário acionou um atalho, **When** a nova aba abre, **Then** a aba do Ocean App permanece na página Contratos (a navegação interna do app não é substituída pelo Drive).
5. **Given** papéis `admin` e `visualizador` com acesso à página, **When** cada um abre Contratos, **Then** ambos veem os mesmos dois atalhos (não há diferença de conteúdo por papel nesta página).

---

### Edge Cases

- Usuário sem sessão Google no navegador: o Drive pode pedir login; isso é esperado e fora do escopo do Ocean App — a página apenas abre a URL correta.
- Usuário sem permissão na pasta do Drive: o Google Drive exibe a própria tela de acesso negado; o Ocean App não precisa simular nem tratar esse erro.
- Página com JavaScript desabilitado ou bloqueio de pop-up: o atalho ainda deve ser um link navegável válido (não depender exclusivamente de script para abrir a URL).
- Visibilidade global oculta e URL direta: segue a regra já vigente (admin acessa; visualizador é redirecionado).
- Escopo fechado: não há CRUD de contratos, anexos internos, busca, filtros, histórico nem sincronização com o Drive nesta entrega.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST disponibilizar uma página navegável chamada **Contratos**, acessível pelo menu lateral no padrão das demais páginas do produto.
- **FR-002**: A página Contratos MUST exibir exatamente dois atalhos externos, com as URLs fixas:
  1. `https://drive.google.com/drive/u/2/folders/1pJGZNasVVx2pGdk0-mu6GA0L4x59gj9H`
  2. `https://drive.google.com/drive/u/2/folders/1t8HPQgoqgyG1wWy7CjJbDoEJoayi_PJ-`
- **FR-003**: Cada atalho MUST ter um rótulo de exibição distinto e legível: o primeiro link MUST exibir **Contratos ativos**; o segundo link MUST exibir **Contratos arquivados**.
- **FR-004**: Ao acionar um atalho, o destino MUST abrir em nova aba/janela do navegador, preservando a sessão do Ocean App na aba original.
- **FR-005**: A página MUST NÃO oferecer criação, edição, exclusão, upload, listagem interna de arquivos nem qualquer outro conteúdo além dos dois atalhos (e texto de apoio mínimo necessário à compreensão).
- **FR-006**: Contratos MUST integrar-se ao catálogo de páginas existentes: menu, visibilidade global em Configurações e permissões por visualizador, com as mesmas regras das demais páginas ocultáveis não exclusivas de admin.
- **FR-007**: Administradores MUST ter acesso à página (quando visível no menu ou por URL direta, conforme regras vigentes). Visualizadores MUST acessar somente com permissão concedida e página globalmente visível.
- **FR-008**: A página MUST exigir autenticação no Ocean App; usuário não autenticado não acessa Contratos.

### Key Entities

- **Atalho de pasta de contratos**: referência externa a uma pasta no Google Drive, composta por rótulo de exibição (**Contratos ativos** ou **Contratos arquivados**) e URL fixa correspondente. Não há persistência de conteúdo de arquivos no Ocean App.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuário autenticado com acesso encontra **Contratos** no menu e abre a página em menos de 10 segundos a partir do login (já autenticado).
- **SC-002**: Em 100% dos testes manuais, acionar cada atalho abre a URL de pasta correspondente em nova aba, sem substituir a aba do Ocean App.
- **SC-003**: 100% dos usuários com permissão identificam os dois atalhos na primeira visita sem precisar de treinamento adicional (rótulos autoexplicativos).
- **SC-004**: Visualizador sem permissão e página oculta globalmente comportam-se como nas demais páginas restritas (sem item no menu; acesso direto bloqueado para visualizador).
- **SC-005**: Nenhum fluxo de cadastro ou gestão de contratos aparece na página — a tela permanece limitada aos dois atalhos.

## Assumptions

- Os dois links fornecidos são as pastas oficiais e permanentes de contratos; alteração futura de URL exigiria nova mudança de produto.
- O controle de quem pode abrir o conteúdo das pastas permanece no Google Drive (contas e permissões Google); o Ocean App apenas centraliza o atalho.
- Contratos não é página exclusiva de administrador (`adminOnly`); visualizadores podem receber permissão, como em módulos financeiros comuns.
- Contratos é ocultável na configuração global de visibilidade, no padrão das demais páginas ocultáveis.
- Posição sugerida no menu: após **Patrimônio** e antes das páginas exclusivas de admin (Auditoria / Segurança), salvo ajuste fino no plano/implementação.
- Texto de apoio na página, se houver, será mínimo (ex.: título da página e instrução breve do tipo “abra a pasta desejada”); sem cards de métricas nem listagens.
- Autenticação, layout e feedback seguem o padrão já estabelecido no produto.
