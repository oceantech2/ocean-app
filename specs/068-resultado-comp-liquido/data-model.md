# Data Model: Resultado Competência fixo em líquido

**Feature**: `068-resultado-comp-liquido`  
**Date**: 2026-09-14

Esta feature **não** introduz entidades persistidas nem migrations. Documenta estruturas derivadas e a regra de seleção de base + rótulo UI.

## Entidades derivadas (cliente)

### Receita de competência do período

| Campo | Tipo | Origem | Nota |
|-------|------|--------|------|
| `valor_liquido` | number | `pipeline.fechado.valor_liquido` | **Canônico** para Resultado Competência |
| `valor_bruto` | number | `pipeline.fechado.valor_bruto` | Continua na aba Por Competência via toggle; **não** entra no Resultado Competência |
| `contagem` | number | `pipeline.fechado.contagem` | Irrelevante para a fórmula do Resultado |

**Validação**: ausente/NaN → 0 (normalização já existente).

### Despesas totais do período (inalteradas — `059`)

| Campo | Uso no Resultado |
|-------|------------------|
| `fixas` | Soma em `despesas_totais` |
| `variaveis` | Soma em `despesas_totais` |
| `pendentes` | **Não** entra no Resultado |

`despesas_totais = fixas + variaveis` (sempre absoluto; ignora toggle).

### Resultado Competência (derivado)

| Campo | Regra |
|-------|--------|
| `valor` | `receita_comp_liquida − despesas_totais` |
| `pct` | Se `receita_comp_liquida > 0`: `valor ÷ receita_comp_liquida × 100`; senão `null` |
| `subtitulo` | Texto canônico fixo **“base líquida”** (sempre visível; não depende do toggle) |

Sem ciclo de vida / estados: recalculado a cada render; toggle **ignorado** para valor/`pct`/subtítulo deste card.

### Resultado Caixa (inalterado)

Continua: `valorPorVisao(recebido.liquido, recebido.bruto, visaoReceita) − despesas_totais`.  
**Sem** campo/rótulo `subtitulo = "base líquida"`.

## Relacionamentos

```text
Pipeline (fechado dual-base)
  └── valor_liquido ──► Resultado Competência (+ subtítulo "base líquida")
                              └── despesas_totais (Fixas+Variáveis)

Receita Caixa (recebido dual-base)
  └── valorPorVisao(toggle) ──► Resultado Caixa ──► mesmas despesas_totais

Toggle Bruto/Líquido
  ├── afeta: Resultado Caixa, abas de receita (exceto Impostos)
  └── NÃO afeta: Resultado Competência (valor, %, subtítulo), Impostos Recolhidos, cards de Despesa
```

## Regras de validação (negócio)

1. `receita_comp_liquida` MUST ser a base líquida do Total Fechado do período (mês ou ano).
2. Toggle MUST NOT alterar `valor`, `pct` nem o subtítulo do Resultado Competência.
3. Subtítulo MUST ser exatamente **“base líquida”** (pt-BR); Resultado Caixa MUST NOT exibi-lo.
4. Com `receita_comp_liquida = 0`, `pct` MUST ser indisponível (`null` / “—”); `valor` e subtítulo ainda exibidos.
5. Tolerância de auditoria: R$ 0,01 no valor; 0,1 p.p. no percentual (SC-001/SC-002).
