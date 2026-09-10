# Contract: Cálculo — Despesas & Resultado

**Feature**: `059-dashboard-despesas-resultado`  
**Módulo**: `frontend/src/utils/dashboardDespesas.ts`  
**Consumidor**: `Dashboard.tsx` (bloco Despesas & Resultado)

Contrato normativo das funções de agregação/cálculo (sem endpoint REST novo).

## Entrada — Conta a Pagar (mínimo)

```ts
type ContaParaDespesa = {
  categoria?: string | null;
  valor?: number | null;
  tipo_despesa?: 'fixo' | 'variavel' | null;
  data_pagamento?: string | null; // ISO date
  data_vencimento?: string | null;
  // pago?: boolean — NÃO usar nos cards canônicos
};
```

## Recorte

```ts
type RecorteDespesa = {
  ano: number;
  mes: number | null; // null = ano inteiro (1..12)
  mesAte?: number;    // só se o Dashboard ainda precisar de YTD legado fora deste bloco
};
```

Para os cards Seção 07: modo mês = `mes` 1–12; modo só-ano = `mes: null` cobrindo o ano.

## Saída — totaisDespesa

```ts
{ fixas: number; variaveis: number; pendentes: number }
```

### MUST

1. Excluir registros com categoria de imposto.
2. Fixas: `tipo_despesa === 'fixo'` e `data_pagamento` no recorte.
3. Variáveis: `tipo_despesa === 'variavel'` (ou default produto `'variavel'` se ausente) e `data_pagamento` no recorte.
4. Pendentes: `data_vencimento` no recorte e `data_pagamento` ausente/null/blank.
5. **Não** consultar o flag `pago`.
6. Valores = `SUM(valor)`; ausente/NaN → 0; não aplicar toggle.

### MUST NOT

- Filtrar Fixas/Variáveis por `data_vencimento`.
- Classificar Fixo/Variável por sets de categoria de centro de custo (legado).

## Saída — Resultado

```ts
type ResultadoCard = {
  valor: number;
  pct: number | null; // null se receita <= 0
};

calcularResultado(receita: number, despesasTotais: number): ResultadoCard
// valor = receita - despesasTotais
// pct = receita > 0 ? (valor / receita) * 100 : null
```

`despesasTotais` MUST ser `fixas + variaveis` (nunca incluir pendentes).

## Fontes de receita (MUST alinhar UI)

| Resultado | Receita |
|-----------|---------|
| Competência | `valorPorVisao(pipeline.fechado.valor_liquido, pipeline.fechado.valor_bruto, visaoReceita)` |
| Caixa | `valorPorVisao(receitaCaixa.recebido.valor_liquido, receitaCaixa.recebido.valor_bruto, visaoReceita)` |

Tolerância de auditoria cruzada: R$ 0,01 vs abas Por Competência / Por Caixa.
