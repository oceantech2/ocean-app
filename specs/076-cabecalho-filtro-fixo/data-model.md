# Data Model: Cabeçalho com Filtros Fixo no Scroll

**Feature**: `076-cabecalho-filtro-fixo` | **Date**: 2026-09-23

## Visão geral

Não há entidade persistida nem schema. O modelo é conceitual de UI: o cabeçalho de página com filtros e sua relação com KPIs e com o header global.

## Entidade conceitual: Cabeçalho de página com filtros

| Campo | Tipo | Regras |
|-------|------|--------|
| `composicao` | enum lógico | `combinado` (título+filtros+ações no mesmo bloco) \| `dual` (título/ações e filtros em blocos distintos) |
| `fixo_no_scroll` | boolean | `true` obrigatório em telas com filtro no topo |
| `offset_topo` | token | Abaixo do header global (~`5.5rem`); no modo `dual`, filtros usam offset = Layout + altura do título |
| `fundo` | token visual | Opaco claro/escuro; proibido semi-transparente |
| `acoes` | opcional | Criar/importar/exportar etc. no bloco de título ou combinado; permanecem clicáveis |
| `filtros` | controles | Selects/inputs de período, status, categoria, etc.; permanecem utilizáveis após sticky |

## Entidade conceitual: Faixa de KPI / resumo

| Campo | Tipo | Regras |
|-------|------|--------|
| `fixo_no_scroll` | boolean | Sempre `false` (FR-003a) |
| `posicao` | enum lógico | Pode ficar entre título e filtros ou abaixo dos filtros |
| `apos_scroll` | regra | Sai da vista; título e filtros ficam contíguos (sem faixa vazia residual) |

## Entidade conceitual: Tela com filtro no topo

| Campo | Tipo | Regras |
|-------|------|--------|
| `no_escopo` | boolean | `true` se há controles de filtro no topo da área de conteúdo |
| `inclui_dashboard` | boolean | `true` — Dashboard está no escopo |
| `modo_sticky` | derivado | `combinado` ou `dual` conforme DOM atual |

### Matriz comportamento

| Situação | Título/ações | Filtros | KPIs |
|----------|--------------|---------|------|
| Bloco único (ex.: Fluxo, Dashboard) | Sticky combinado | (mesmo bloco) | N/A ou fora do bloco |
| Blocos separados + KPIs no meio (ex.: Contas) | Sticky | Sticky (offset sob título) | Rola |
| Sem filtro no topo | Sem obrigação | — | — |

**Persistência**: nenhuma.  
**Relacionamentos**: visual apenas; independente do cabeçalho de coluna da tabela (073).  
**Validação**: sticky utilizável; KPIs não sticky; z-index abaixo do header global.

## Fora de escopo (não modelar)

- Entidades de domínio (NF, Conta, etc.)
- Persistência de preferência de layout
- Header global / sidebar como entidades mutáveis desta feature
