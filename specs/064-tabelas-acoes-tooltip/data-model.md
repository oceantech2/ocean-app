# Data Model: Ações de Tabela Só com Tooltip

**Feature**: `064-tabelas-acoes-tooltip` | **Date**: 2026-09-14

## Visão geral

Não há entidade persistida nem schema. O modelo é conceitual de UI: o controle de ação de linha já existente no frontend.

## Entidade conceitual: Ação de linha em tabela

| Campo | Tipo | Regras |
|-------|------|--------|
| `variant` | enum de UI | Variantes já existentes em `ActionVariant` (editar, arquivar, excluir, fluxo, …) |
| `context` | `header` \| `row` | Só `row` entra no padrão desta feature |
| `label` | texto pt-BR | Obrigatório; fonte do tooltip e do `aria-label` no modo ícone-only |
| `apresentação` | enum lógico | `icone_tooltip` se usa `ActionButton` row; `texto_visivel` se controle só-texto legado |
| `comportamento` | ação existente | Inalterado (onClick / disabled / confirmações) |

### Regras de apresentação

| Situação atual | Após a feature |
|----------------|----------------|
| `ActionButton` + `context="row"` (ícone + texto) | Só ícone; `title` + `aria-label` = `label` (ou `title` explícito do chamador) |
| `ActionButton` + `context="header"` | Inalterado (ícone + texto) |
| Botão/link só-texto na célula (sem ícone) | Texto permanece visível; sem ícone novo |

### Layout da célula

| Regra | Valor |
|-------|-------|
| Direção | Horizontal |
| Wrap | Proibido entre controles da mesma linha |
| Ordem | Ordem relativa atual / `ROW_ACTION_ORDER` quando aplicável |

**Persistência**: nenhuma.  
**Relacionamentos**: nenhum com entidades de domínio (NF, conta, etc.) além da associação visual à linha já existente.  
**Validação**: `label` não vazio; `context="row"` sem texto permanente ao lado do ícone.

## Fora de escopo (não modelar)

- Novas variantes de ícone
- Preferências de usuário para “mostrar rótulos”
- Catálogo de ações no backend
- Tooltips tipados / i18n
