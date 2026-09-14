# Contrato UI: Ações de Linha com Tooltip

**Feature**: `064-tabelas-acoes-tooltip`  
**Modelo**: [data-model.md](../data-model.md) · **Research**: [research.md](../research.md)

## Componente `ActionButton` (`context="row"`)

**Acesso**: inalterado (mesmo uso nas páginas; mesmas regras de `papel === 'admin'` onde já existem).

**Comportamento visual obrigatório**:

| Aspecto | Contrato |
|---------|----------|
| Texto permanente ao lado do ícone | **Ausente** |
| Tooltip no hover | Atributo `title` com o nome da ação (`label`), salvo `title` explícito do chamador |
| Nome acessível | `aria-label` = `label` |
| Ícone | Mesmo SVG/`variant` já usado |
| Clique / disabled | Inalterado |

**`context="header"`**: contrato anterior (ícone + texto visível) — **sem mudança**.

## Célula / grupo de ações de linha

| Aspecto | Contrato |
|---------|----------|
| Alinhamento | Controles em linha horizontal |
| Wrap | **Sem** quebra de linha entre controles (`flex-nowrap` ou equivalente) |
| Ordem | Mesma ordem relativa de antes |

## Exceções (só-texto)

Controles de linha **sem** `ActionButton` / sem ícone (ex.: Substituir, Remover, + Anexar; badges de envio no DH):

- Mantêm texto visível
- Não recebem ícone nesta entrega
- Tooltip de identificação **não** é obrigatório

## Páginas no escopo (consumidores `context="row"`)

- NFs, Contas, Fornecedores (Colaboradores), Bonus, Férias, DH, Patrimônio, Fluxo de Caixa (inclui usos row em listas/cards)

## API REST

Nenhum endpoint alterado ou criado.

## Proibido nesta entrega

- Remover texto de botões só-texto sem ícone
- Aplicar ícone-only aos botões de header da página
- Alterar handlers, confirmações, permissões ou APIs
- Introduzir biblioteca de tooltip
- Reintroduzir `flex-wrap` que empilhe ações da mesma linha

## Mapeamento de requisitos

| FR | Contrato |
|----|----------|
| FR-001 | Sem texto permanente ao lado do ícone em `context="row"` |
| FR-002 | `title` / hover com nome da ação |
| FR-003 | Todas as ações `ActionButton` row |
| FR-003a | Exceções só-texto |
| FR-004 | onClick / fluxos intactos |
| FR-005 | Mesmas regras de papel |
| FR-006 | Padrão em todas as páginas listadas |
| FR-007 | Header e CTAs fora de linha intactos |
| FR-008 | Ícone distinto + `aria-label` |
| FR-009 | Horizontal sem wrap |
