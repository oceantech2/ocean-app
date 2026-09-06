# Feature Specification: Correção do Login e Sessão

**Feature Branch**: `054-fix-login-sessao`

**Created**: 2026-09-06

**Status**: Draft

**Input**: User description: "ajustar login, para entrar sempre da um erro, caso o usuário coloque para entrar em uma sessao, ele fica dando erro"

## Clarifications

### Session 2026-09-06

- Q: Quando o erro de login/sessão aparece? → A: Em mais de um momento do fluxo (ao clicar em Entrar, após redirecionamento/início de sessão e/ou depois ao navegar/recarregar) — ou ainda sem certeza; a correção deve cobrir o ciclo completo até a sessão estável.
- Q: Ao abrir o login com sessão antiga/inválida no navegador, o que deve acontecer? → A: Limpar o estado antigo automaticamente (ao abrir o login ou ao detectar sessão inválida) e permitir novo login limpo.
- Q: O erro de login/sessão envolve 2FA? → A: Ocorre sem 2FA (caso principal); com 2FA basta não quebrar (não-regressão).
- Q: Qual mensagem usar para credenciais inválidas? → A: Mensagem única e genérica (ex.: “Usuário ou senha incorretos”), sem distinguir usuário inexistente de senha errada.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entrar com credenciais válidas (Priority: P1)

Como usuário autorizado do Ocean App, quero informar usuário e senha corretos e entrar no sistema sem mensagens de erro indevidas, para acessar o dashboard e as demais páginas conforme meu papel.

**Why this priority**: Sem login funcional, ninguém consegue usar o sistema; é o bloqueador crítico atual.

**Independent Test**: Com credenciais válidas conhecidas (ex.: usuário de desenvolvimento), submeter o formulário de login e verificar que a sessão é criada e o usuário chega à área autenticada sem toast/mensagem de erro.

**Acceptance Scenarios**:

1. **Given** o usuário está na tela de login e tem credenciais válidas, **When** informa usuário e senha corretos e confirma "Entrar", **Then** o sistema autentica com sucesso, inicia a sessão e redireciona para a área autenticada (dashboard), sem exibir erro de falha de login.
2. **Given** o usuário acabou de autenticar com sucesso, **When** navega para páginas protegidas, **Then** permanece autenticado e consegue usar o sistema sem ser forçado de volta ao login por erro espúrio.
3. **Given** há sessão antiga ou inválida residual no navegador, **When** o usuário abre a tela de login (ou a sessão inválida é detectada), **Then** o estado antigo é limpo e um novo login com credenciais válidas conclui sem loop de erro.

---

### User Story 2 - Credenciais inválidas com feedback claro (Priority: P2)

Como usuário, quero receber uma mensagem clara quando usuário ou senha estiverem incorretos, para saber que o problema é a credencial e não uma falha genérica do sistema.

**Why this priority**: Distinguir falha legítima de autenticação do bug atual evita confusão e suporte desnecessário.

**Independent Test**: Informar usuário ou senha incorretos e verificar que aparece mensagem de erro adequada e que a sessão não é criada.

**Acceptance Scenarios**:

1. **Given** o usuário está na tela de login, **When** informa credenciais inválidas e tenta entrar, **Then** o sistema permanece na tela de login, não cria sessão e exibe mensagem única e genérica (ex.: “Usuário ou senha incorretos”), sem sucesso falso.
2. **Given** uma tentativa de login falhou por credenciais inválidas, **When** o usuário corrige as credenciais e tenta novamente, **Then** o login bem-sucedido segue o fluxo da User Story 1.

---

### User Story 3 - Não-regressão do fluxo com 2FA (Priority: P3)

Como usuário com verificação em duas etapas habilitada, quero continuar conseguindo concluir o login com senha + código, para que a correção do login sem 2FA não quebre o fluxo com 2FA.

**Why this priority**: O defeito reportado ocorre no login sem 2FA; o 2FA é verificação de não-regressão, não o caminho principal da correção.

**Independent Test**: Com usuário que exige 2FA, completar senha + código válido e entrar na área autenticada sem erro indevido.

**Acceptance Scenarios**:

1. **Given** o usuário tem 2FA ativo e informou senha correta, **When** o sistema solicita o código, **Then** a tela pede o código de verificação sem tratar isso como falha definitiva de login/sessão.
2. **Given** o código 2FA válido foi informado, **When** o usuário confirma, **Then** a sessão é iniciada e o acesso à área autenticada ocorre sem erro indevido.

---

### Edge Cases

- O defeito pode se manifestar em mais de um ponto (submit, pós-login ou após F5/navegação); a validação MUST reproduzir e verificar esses pontos até a sessão permanecer estável.
- Tentativa de login com campos vazios: o formulário deve impedir o envio ou indicar que os campos são obrigatórios.
- Backend indisponível ou timeout: o usuário vê mensagem de erro amigável e permanece na tela de login, sem sessão parcial inconsistente.
- Token/sessão anterior inválida ou expirada no navegador: ao abrir o login ou detectar a sessão inválida, o sistema limpa o estado antigo automaticamente; o usuário autentica de novo sem loop de erro.
- Usuário visualizador e admin: ambos conseguem autenticar conforme suas permissões após a correção.
- Código 2FA inválido ou expirado: mensagem clara; nova tentativa com código válido deve funcionar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que usuários com credenciais válidas iniciem uma sessão autenticada e acessem a área protegida sem erro indevido, cobrindo o ciclo completo: envio do login, estabelecimento da sessão, redirecionamento e uso imediato (navegação/recarregamento sem loop de erro).
- **FR-002**: O sistema MUST exibir feedback de sucesso apenas quando a autenticação e o estabelecimento da sessão forem concluídos com êxito.
- **FR-003**: O sistema MUST rejeitar credenciais inválidas sem criar sessão e MUST exibir mensagem única e genérica em português (ex.: “Usuário ou senha incorretos”), sem revelar se o usuário existe ou se a senha está errada.
- **FR-004**: O sistema MUST preservar o fluxo de verificação em duas etapas como não-regressão (quando o usuário a tiver ativa), distinguindo “código necessário” de falha de autenticação/sessão; a correção principal NÃO depende de 2FA.
- **FR-005**: Após login bem-sucedido, o sistema MUST manter a sessão utilizável nas navegações seguintes, sem redirecionar indevidamente para o login por erros não relacionados à expiração real da sessão.
- **FR-006**: Em falhas técnicas (serviço indisponível, resposta inesperada), o sistema MUST apresentar mensagem amigável e MUST NÃO deixar o usuário em estado de sessão inconsistente (meio autenticado).
- **FR-007**: Os papéis existentes (`admin` e `visualizador`) MUST continuar autenticando e recebendo o acesso correspondente após a correção.
- **FR-008**: Ao abrir a tela de login ou ao detectar sessão inválida/expirada residual, o sistema MUST limpar o estado de sessão antigo automaticamente e MUST permitir um novo login limpo.

### Key Entities

- **Sessão autenticada**: Representa o estado em que o usuário está identificado e autorizado a usar o sistema após login bem-sucedido; inclui identidade, papel e permissões aplicáveis.
- **Credenciais de acesso**: Usuário e senha (e, quando aplicável, código de verificação em duas etapas) usados para iniciar a sessão.
- **Usuário**: Conta com papel (`admin` ou `visualizador`) e, opcionalmente, verificação em duas etapas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em testes manuais com credenciais válidas, 100% das tentativas de login bem-sucedidas concluem a entrada na área autenticada sem mensagem de erro de falha de login.
- **SC-002**: Usuário com credenciais válidas consegue completar o login e chegar ao dashboard em menos de 10 segundos em condições normais de rede local.
- **SC-003**: Credenciais inválidas resultam, em 100% das tentativas, em mensagem única e genérica (sem enumerar usuário vs senha) e sem criação de sessão.
- **SC-004**: Após a correção, não há relato reproduzível de “loop” de erro no ciclo completo (submit → sessão → redirecionamento → navegação/F5) com as mesmas credenciais válidas.
- **SC-005**: Em verificação de não-regressão, usuários com 2FA ativo conseguem concluir o login (senha + código válido) sem o pedido de código ser tratado como falha de sessão.
- **SC-006**: Com sessão residual inválida no navegador, ao retornar à tela de login (ou ao detectar a invalidade) o estado é limpo e um novo login válido conclui com sucesso na primeira tentativa.

## Assumptions

- O problema reportado é um defeito no fluxo atual de login/sessão (não um pedido de novo método de autenticação).
- Credenciais e papéis existentes (`admin` / `visualizador`) permanecem; não há mudança de política de senha nesta feature.
- O ambiente de desenvolvimento local (API e frontend nas portas já padronizadas do projeto) é o contexto principal de validação.
- Verificação em duas etapas (2FA), quando configurada, permanece no produto como não-regressão; o defeito principal reproduz-se no login sem 2FA.
- Escopo limitado à correção do login e do estabelecimento/uso imediato da sessão (submit, pós-login e uso após navegação/F5); recuperação de senha, SSO e cadastro de novos usuários estão fora de escopo.
- Mensagens de erro de autenticação devem ser em português; credenciais inválidas usam texto genérico único (sem enumeração de usuário/senha).
