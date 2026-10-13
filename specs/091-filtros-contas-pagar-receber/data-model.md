# Data Model: Filtros padronizados

Sem mudanças de banco.

## Filtros de Contas a Pagar (estado da tela)

| Filtro | Valores | Onde | Persistência |
|---|---|---|---|
| Período | "Todos os períodos" ou mês + ano | linha principal | sessão da tela |
| Status | Todos, Pendente, Vence hoje, < 7 dias, Vencida, Pago | linha principal | store (atual) |
| Tipo | Todos, Fixo, Variável, Imposto / DAS | linha principal | sessão da tela |
| Fornecedor | Todos, Sem fornecedor, id | linha principal | sessão da tela |
| Descrição | texto | linha principal | sessão da tela |
| Categoria / Subcategoria RH | catálogo | Mais filtros | store (atual) |
| Vencimento de / até | data | Mais filtros | sessão da tela |

## Filtros de Contas a Receber (estado da tela)

| Filtro | Valores | Onde | Aplicação |
|---|---|---|---|
| Período | Todos os meses ou mês + ano | linha principal | servidor (atual) |
| Status | Todos, Pendente, Recebida, Vencida, Sem NF, Cancelada | linha principal | servidor (atual) |
| Tipo | Todos, Retainer, Sucesso, Parcela | linha principal | memória |
| Fornecedor | Todos ou id do colaborador | linha principal | servidor (`fornecedor_id`) |
| Cliente | texto | linha principal | memória (atual) |
| Mostrar arquivadas | sim/não | Mais filtros | servidor (atual) |
