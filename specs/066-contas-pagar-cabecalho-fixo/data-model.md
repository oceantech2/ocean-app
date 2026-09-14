# Data Model: Cabeçalho Fixo na Tabela de Contas a Pagar

**Feature**: `066-contas-pagar-cabecalho-fixo` | **Date**: 2026-09-14

## Visão geral

Não há entidade persistida nem schema. O modelo é conceitual de UI da listagem já existente em Contas a Pagar.

## Entidade conceitual: Tabela de Contas a Pagar (UI)

| Campo / aspecto | Tipo | Regras |
|-----------------|------|--------|
| `área_rolável` | região de UI | Contém cabeçalho + linhas; possui rolagem vertical (e horizontal se necessário) |
| `cabeçalho_colunas` | faixa de UI | Nomes das colunas; permanece no topo da `área_rolável` durante rolagem vertical |
| `linhas` | lista de registros | Contas filtradas/ordenadas já existentes; rolam dentro da `área_rolável` |
| `chrome_página` | região de UI | Título, cards, filtros, botões de header — **fora** da `área_rolável` |

### Regras de apresentação

| Situação | Comportamento |
|----------|----------------|
| Listagem com muitas linhas | Rolagem na `área_rolável`; cabeçalho fixo no topo dela |
| Listagem curta | Sem rolagem necessária; cabeçalho no topo natural |
| Scroll horizontal | Cabeçalho e linhas compartilham o mesmo eixo horizontal (alinhados) |
| Scroll vertical de volta ao topo | Um único cabeçalho; sem duplicação |
| Impressão | Área não clipa o corpo; todas as linhas imprimíveis |

**Persistência**: nenhuma.  
**Relacionamentos**: nenhum além da associação visual linha ↔ conta já existente.  
**Validação**: cabeçalho alinhado às colunas; chrome da página não entra na rolagem das linhas.

## Fora de escopo (não modelar)

- Schema de `contas` / APIs
- Sticky de título, filtros ou cards
- Tabelas de outras páginas
