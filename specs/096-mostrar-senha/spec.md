# Feature Specification: Mostrar/ocultar senha nos campos de senha

**Feature Branch**: `096-mostrar-senha`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "Colocar olho para conseguir visualizar a senha enquanto digita nas abas de senha"

## Contexto

Os campos de senha do ERP e do Proposal escondem sempre o que é digitado. Isso gera erros de digitação, principalmente ao criar senha pelo convite e quando o admin define senhas em Configurações. Hoje a única saída é apagar tudo e digitar de novo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Conferir a senha enquanto digita (Priority: P1)

Em qualquer campo de senha, o usuário clica no ícone de olho para ver o que digitou e clica de novo para esconder.

**Why this priority**: É o pedido inteiro; reduz logins e cadastros errados.

**Independent Test**: Em cada tela com senha, digitar algo, clicar no olho (o texto aparece e o ícone muda para "olho riscado"), clicar de novo (o texto volta a ficar oculto).

**Acceptance Scenarios**:

1. **Given** o login do ERP ou do Proposal, **When** o usuário digita a senha e clica no olho, **Then** a senha aparece em texto e o ícone passa a indicar "ocultar".
2. **Given** a senha visível, **When** o usuário clica de novo, **Then** ela volta a ficar oculta.
3. **Given** a tela de convite com "Senha" e "Confirmar senha", **When** o usuário clica no olho de um dos campos, **Then** só aquele campo muda.
4. **Given** o modal de usuário em Configurações, **When** o admin clica no olho do campo de senha, **Then** vê a senha que está definindo.
5. **Given** qualquer tela com senha, **When** ela é aberta, **Then** a senha começa oculta.

### Edge Cases

- **Teclado**: o botão do olho é alcançável por Tab e acionável por Enter/Espaço, sem enviar o formulário.
- **Leitor de tela**: o botão anuncia "Mostrar senha" ou "Ocultar senha" e o estado atual.
- **Senha longa**: o texto não fica por baixo do ícone.
- **Autocompletar do navegador**: continua funcionando como antes (mesmos atributos de autocomplete).
- **Modal reaberto** (Configurações): a senha volta oculta.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Todo campo de senha do ERP e do Proposal MUST ter um botão de olho que alterna entre mostrar e ocultar o texto digitado: login do ERP, login do Proposal, "Senha" e "Confirmar senha" do convite e senha do modal de usuário em Configurações.
- **FR-002**: A senha MUST começar oculta sempre que a tela ou o modal é aberto.
- **FR-003**: Cada campo MUST alternar de forma independente.
- **FR-004**: O botão MUST ser acessível por teclado, MUST NOT enviar o formulário e MUST informar a ação ("Mostrar senha"/"Ocultar senha") e o estado para leitores de tela.
- **FR-005**: O ícone MUST indicar a ação disponível: olho para mostrar, olho riscado para ocultar.
- **FR-006**: Os campos MUST manter o comportamento atual: validação, autocomplete, foco automático e tamanho mínimo.

### Key Entities

Nenhuma; mudança só de interface.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos campos de senha listados no FR-001 têm o botão de olho.
- **SC-002**: Mostrar ou ocultar a senha leva 1 clique ou 1 tecla.
- **SC-003**: Nenhuma regressão de login, convite ou cadastro de usuário (mesmo resultado de antes para as mesmas entradas).

## Assumptions

- Não há tela de "trocar a própria senha" no ERP hoje. Se surgir, deve reutilizar o mesmo componente.
- Campos de código 2FA não são senhas e ficam como estão.
