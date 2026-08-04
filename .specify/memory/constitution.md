# Ocean App Constitution

## Core Principles

### I. Idioma Português (NÃO NEGOCIÁVEL)

Toda interação do Speckit com o usuário e todo artefato gerado pelos fluxos Speckit (`specify`, `clarify`, `plan`, `tasks`, `analyze`, `implement`, `checklist`, `converge` e correlatos) DEVEM estar em **português brasileiro (pt-BR)**.

Isso inclui, sem exceção:
- Mensagens, perguntas de esclarecimento, relatórios de conclusão e prompts ao usuário
- Conteúdo de `spec.md`, `plan.md`, `tasks.md`, checklists e documentos derivados
- Descrições de cenários, requisitos, critérios de sucesso, entidades e notas

Exceções permitidas:
- Nomes técnicos, siglas e termos de código (JWT, FastAPI, PostgreSQL, etc.)
- Identificadores de código, caminhos de arquivo e comandos de terminal
- Títulos estruturais dos templates Speckit, quando o fluxo exigir preservação literal das seções do template

**Rationale**: O time e os stakeholders do Ocean App trabalham em português; artefatos e conversas em inglês geram atrito e risco de mal-entendido.

### II. Domínio Financeiro Interno

O Ocean App é o sistema de gestão financeira interno da Auto Fernando. Features DEVEM respeitar o domínio existente (NFs, colaboradores, contas a pagar, bônus, férias, DH, relatórios, auditoria e segurança) e os papéis `admin` (acesso total) e `visualizador` (somente leitura), salvo especificação explícita em contrário.

### III. Clareza Antes de Implementar

Especificações DEVEM descrever o QUE e o PORQUÊ, de forma testável, antes do COMO. Ambiguidades de escopo, permissão ou impacto financeiro DEVEM ser esclarecidas (máx. limites do fluxo Speckit) antes de planejar ou implementar.

### IV. Consistência com o Produto Existente

Novas features DEVEM seguir os padrões de UX e operação já estabelecidos no produto (fluxo de páginas, feedback ao usuário, confirmação em exclusões, soft delete onde já usado), salvo decisão documentada na spec.

### V. Simplicidade e Escopo Fechado

Preferir a menor solução que atenda aos critérios de sucesso. Escopo fora da spec NÃO deve ser implementado “por antecipação”. Complexidade adicional exige justificativa explícita no plano.

## Restrições do Projeto

- Portas de desenvolvimento fixas: API 8001, PostgreSQL 5433, Redis 6380, frontend 5193 — não alterar sem decisão explícita.
- Credenciais e segredos NÃO entram em specs, commits nem artefatos Speckit.
- Artefatos Speckit focam valor de negócio; detalhes de stack ficam no plano técnico, não na spec de requisitos.

## Fluxo de Trabalho Speckit

1. Constitution → Specify → Clarify (se necessário) → Plan → Tasks → Implement
2. Cada comando Speckit DEVE reler esta constitution e aplicar o princípio de idioma
3. Checklists de qualidade DEVEM validar que o conteúdo gerado está em pt-BR

## Governance

Esta constitution prevalece sobre hábitos informais do agente. Emendas exigem atualização deste arquivo, bump de versão e alinhamento dos templates quando o princípio afetar estrutura ou seções obrigatórias. Revisões de artefatos Speckit DEVEM verificar conformidade com o princípio de idioma e com o domínio Ocean App.

**Version**: 1.0.0 | **Ratified**: 2026-07-26 | **Last Amended**: 2026-07-26
