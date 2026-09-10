# Data Model: Status Derivado + Pipeline de Receita

**Feature**: `056-status-conta-receber` | **Date**: 2026-09-10

## Visão geral

Nenhuma tabela nova e nenhuma migration. O Pipeline lê a entidade existente **NF** (`nfs`) e deriva o **status de ciclo** em memória/SQL.

## Entidade: NF (Conta a Receber)

Fonte: `backend/app/models/__init__.py` — classe `NF`.

| Campo (BD) | Papel nesta feature | Obrigatório no Pipeline |
|------------|---------------------|-------------------------|
| `id` | Identidade | sim (contagem) |
| `data_ent_pgto` | Data de **fechamento** — filtro do universo | deve estar preenchida e no período |
| `data_emissao` | Data de **emissão** — classifica A Faturar vs Faturado | nullable |
| `data_pagamento` | Data de **recebimento** — classifica Recebido | nullable |
| `valor_liquido` | Valor agregado (SUM) | sim (default 0 se nulo na prática não ocorre) |
| `valor_bruto` | Fora desta feature (toggle futuro) | não usado |
| `status` | Só para **excluir** `cancelada` | sim (filtro) |
| `excluida_em` | Soft delete — excluir se NOT NULL | sim (filtro) |
| `arquivada` | **Não filtra** (incluir arquivadas) | n/a |

### Regras de validação (leitura)

1. Universo Pipeline: `excluida_em IS NULL` AND `status <> 'cancelada'` AND `data_ent_pgto` no período (ano[, mês]).
2. Status de ciclo **não** é coluna; derivado conforme [research.md](./research.md).
3. Não validar nem bloquear no cadastro o caso “recebimento sem emissão” — classifica como Recebido (FR-005).

## Entidade derivada: Status de ciclo

| Valor canônico (código) | Rótulo UI | Badge | Condição |
|-------------------------|-----------|-------|----------|
| `a_faturar` | A Faturar | sem NF | `data_pagamento IS NULL` AND `data_emissao IS NULL` |
| `faturado_ag_pagamento` | Faturado · Ag. Pagamento | NF emitida | `data_pagamento IS NULL` AND `data_emissao IS NOT NULL` |
| `recebido` | Recebido | pago | `data_pagamento IS NOT NULL` |

### Transições (efeito das datas)

```text
A Faturar --[+emissão]--> Faturado · Ag. Pagamento --[+pagamento]--> Recebido
Recebido --[-pagamento, mantém emissão]--> Faturado · Ag. Pagamento
Faturado --[-emissão]--> A Faturar
Qualquer --[+pagamento]--> Recebido
```

Não há máquina de estados persistida; transições são consequência de updates nas datas no cadastro NFs.

## Agregado: Pipeline de Receita (DTO de leitura)

Não persistido. Estrutura lógica:

| Campo | Descrição |
|-------|-----------|
| `periodo.ano` / `periodo.mes` | Recorte solicitado (`mes` null = ano inteiro) |
| `fechado` | `{ valor, contagem, percentual: 100 }` — base |
| `a_faturar` | `{ valor, contagem, percentual }` |
| `faturado_ag_pagamento` | `{ valor, contagem, percentual }` |
| `recebido` | `{ valor, contagem, percentual }` |

**Invariante**:  
`fechado.valor = a_faturar.valor + faturado_ag_pagamento.valor + recebido.valor`  
`fechado.contagem = a_faturar.contagem + faturado_ag_pagamento.contagem + recebido.contagem`

## Relacionamentos

- Pipeline **não** cria FK; apenas agrega NFs.
- Sem relação com Contas a Pagar nesta feature.

## Fora do modelo desta feature

- Configuração do Período (meta/alíquota)
- Toggle bruto/líquido
- Aging / alerta de fluxo
- Alteração de `StatusNF` ou novos valores de enum
