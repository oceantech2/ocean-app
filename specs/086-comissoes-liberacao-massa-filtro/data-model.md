# Data Model: Correção da liberação em massa e filtro por status de liberação

Sem mudança de schema. Entidades e estados de tela usados pela feature:

## Bonus (existente — tabela `bonus`)

| Campo | Tipo | Uso na feature |
|---|---|---|
| `id` | int | Seleção em massa |
| `tipo` | `'bonus' \| 'comissao'` | Aba |
| `valor_bonus` | number | Valor total na confirmação |
| `liberado` / `data_liberacao` | bool / date | Filtro de status; elegibilidade para liberar |
| `pago` / `data_pagamento` | bool / date | Elegibilidade para pagar |
| `nf_cancelada` | bool (derivado) | Fora dos totais (regra existente) |

**Transições** (servidor, inalteradas): `não liberado → liberado` (`/acoes/liberar`), `liberado → pago` (`/acoes/pagar`). Pagar exige liberado.

## Estado de tela (`Bonus.tsx`)

| Estado | Tipo | Regra |
|---|---|---|
| `statusLiberacao` | `'todos' \| 'liberados' \| 'nao_liberados'` | Padrão `'todos'`; troca limpa a seleção e volta à página 1 |
| `selecionados` | `Set<number>` | Existente; limpo ao trocar aba/filtros/página/status |
| `acaoMassa` | `'liberar' \| 'pagar' \| null` | Modal de confirmação aberto quando não nulo |
| `processando` | boolean | Existente; desabilita ações em massa |

## Derivados (`utils/bonusSelecao.ts`)

- `filtrarPorStatusLiberacao(lista, status)`: `todos` devolve tudo; `liberados` devolve `liberado`; `nao_liberados` devolve `!liberado`
- `elegiveisParaLiberar(lista, ids)`: itens com `id ∈ ids` e `!liberado`
- `elegiveisParaPagar(lista, ids)`: itens com `id ∈ ids`, `liberado` e `!pago`
- `somaValores(lista)`: soma de `valor_bonus`
