# Data Model: Fluxo de Caixa — movimentos de tela

**Feature**: `024-fluxo-caixa-importar` | **Date**: 2026-08-13  
**Spec**: [spec.md](./spec.md)

Sem tabelas novas. Entidades persistidas já existem; o **movimento de tela** é derivado.

## Entidades persistidas (reuso)

### Conta a Receber (`nfs`)

| Campo relevante | Uso no caixa |
|-----------------|--------------|
| `id` | Identidade estável (`receber-{id}`) |
| `status` | Só `paga` (tem `data_pagamento`) |
| `data_pagamento` | Data do movimento e recorte mês/ano |
| `valor_liquido` | Valor da entrada (se &gt; 0) |
| `numero`, `razao_social` | Descrição reconhecível |
| `arquivada` | Fora da listagem padrão → fora do caixa |
| `caixa` | Contexto; não é coluna desta feature |

### Conta a Pagar (`contas_pagar`)

| Campo relevante | Uso no caixa |
|-----------------|--------------|
| `id` | Identidade estável (`pagar-{id}`) |
| `pago` / `data_pagamento` | Só pagas, com data |
| `valor` | Valor da saída (se &gt; 0) |
| `descricao` | Descrição do movimento |

### Movimento manual (`fluxo_movimentos`)

| Campo relevante | Uso no caixa |
|-----------------|--------------|
| `id` | Identidade (`mov-{id}`); único com **Remover** |
| `tipo` | `receita` → entrada; `despesa` → saída |
| `descricao`, `valor`, `data_movimento` | Linha manual; recorte já na API (`mes`, `ano`) |

### Saldo (`saldos`)

Inalterado. CSV “Importar CSV” desta página continua sendo **saldos**, não CR/CP.

## Entidade de tela: Movimento do caixa

Não persistida.

| Campo | Tipo | Regra |
|-------|------|--------|
| `id` | string | `receber-{id}` \| `pagar-{id}` \| `mov-{id}` — único na lista |
| `data` | data ISO | Pagamento (automático) ou `data_movimento` (manual) |
| `tipo` | `entrada` \| `saida` | Receber → entrada; pagar → saída; manual conforme tipo |
| `origem` | enum | `contas_receber` \| `contas_pagar` \| `manual` |
| `origem_rotulo` | texto | **Contas a Receber** \| **Contas a Pagar** \| **Manual** |
| `desc` | texto | Receber: `NF {numero} — {razao_social}` (numero vazio: só razão); pagar: descrição; manual: descrição **sem** exigir `✦` |
| `valor` | número | Entrada positiva na UI; saída exibida com sinal de saída; totais usam valor absoluto por tipo |
| `manual` | boolean | Só manuais têm ação Remover (admin) |
| `movId` | number? | Só manual, para DELETE existente |

## Regras de inclusão (automático)

1. Receber: `status = paga` **e** `data_pagamento` preenchida **e** não arquivada **e** `valor_liquido > 0`.
2. Pagar: `pago` **e** `data_pagamento` **e** `valor > 0`.
3. Recorte: ano de `data_pagamento` = ano da tela; se mês ≠ “Todos”, mês civil = mês da tela.
4. Um `id` de origem → no máximo uma linha.
5. Sem flag de ocultação.

## Transições

```text
origem pendente / sem pagamento     → não aparece no caixa
origem recebida/paga no período     → aparece (espelho)
origem volta a pendente             → some na próxima carga/filtro
origem arquivada (receber)          → some
usuário tenta omitir só no caixa    → ação inexistente
```

## Relacionamentos

```text
Conta a Receber (1) ──► (0..1) movimento de tela entrada
Conta a Pagar   (1) ──► (0..1) movimento de tela saída
Movimento manual (1) ──► (1)   movimento de tela (entrada ou saída)
```

Não há fusão manual ↔ origem por semelhança.
