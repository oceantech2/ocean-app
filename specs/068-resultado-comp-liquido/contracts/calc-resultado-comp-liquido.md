# Contract: Cálculo — Resultado Competência sempre líquido

**Feature**: `068-resultado-comp-liquido`  
**Supersede parcial**: tabela “Fontes de receita” em `specs/059-dashboard-despesas-resultado/contracts/calc-despesas-resultado.md`  
**Módulo**: `frontend/src/pages/Dashboard.tsx` (+ `dashboardDespesas.calcularResultado`)  
**Consumidor**: card **Resultado Competência**  
**UI**: [ui-resultado-comp-liquido.md](./ui-resultado-comp-liquido.md)

## Pré-condições

- `pipeline` dual-base já carregado (`fechado.valor_liquido`, `fechado.valor_bruto`).
- `despesasTotais` de `totaisDespesa` (`059`): `fixas`, `variaveis`, `pendentes`.
- `calcularResultado(receita, despesasTotais)` permanece:

```ts
// valor = receita - despesasTotais
// pct = receita > 0 ? (valor / receita) * 100 : null
```

## MUST — Resultado Competência

```ts
const despesasTotaisResultado = despesasTotais.fixas + despesasTotais.variaveis;
const receitaCompLiquida = Number(pipeline.fechado.valor_liquido) || 0;
const resultadoCompetencia = calcularResultado(receitaCompLiquida, despesasTotaisResultado);
```

1. `receitaCompLiquida` MUST ser **sempre** a base líquida (Total Fechado líquido do período).
2. MUST NOT usar `valorPorVisao(..., visaoReceita)` para este card.
3. Ao alternar Bruto ↔ Líquido, `resultadoCompetencia.valor` e `.pct` MUST permanecer numericamente iguais (tol. R$ 0,01 / 0,1 p.p.).
4. `despesasTotaisResultado` MUST continuar `fixas + variaveis` (sem pendentes; sem toggle).

## MUST — Resultado Caixa (inalterado)

```ts
const receitaCaixaValor = valorPorVisao(
  receitaCaixa.recebido.valor_liquido,
  receitaCaixa.recebido.valor_bruto,
  visaoReceita,
);
const resultadoCaixa = calcularResultado(receitaCaixaValor, despesasTotaisResultado);
```

## Fontes de receita (canônico após 068)

| Resultado | Receita |
|-----------|---------|
| Competência | `pipeline.fechado.valor_liquido` (fixo; ignora toggle) |
| Caixa | `valorPorVisao(recebido.liquido, recebido.bruto, visaoReceita)` |

## MUST NOT

- Alterar assinatura ou semântica de `calcularResultado`.
- Introduzir endpoint ou campo persistido.
- Usar `impostos_recolhidos` como insumo do Resultado Competência.
