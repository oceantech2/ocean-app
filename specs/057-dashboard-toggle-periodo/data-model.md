# Data Model: Toggle Bruto/Líquido + Configuração do Período

**Feature**: `057-dashboard-toggle-periodo` | **Date**: 2026-09-10

## Entidades

### Configuração do Período (persistida em `metas_financeiras`)

Registro mensal (`mes` ∈ 1..12) que concentra meta líquida e alíquota efetiva do mês.

| Campo (domínio) | Coluna | Tipo | Regras |
|-----------------|--------|------|--------|
| Período (mês) | `mes` | int 1–12 | Parte da chave lógica com `ano` |
| Período (ano) | `ano` | int | Parte da chave lógica |
| Meta líquida | `valor_meta` | float | Obrigatória no save; &gt; 0 recomendado (rejeitar vazio/null) |
| Alíquota do período (%) | `aliquota_periodo` | float \| null na BD | **Obrigatória** no save mensal desta feature; `0 ≤ x &lt; 100` |
| Meta bruta (derivada) | — | calculada | `round(valor_meta / (1 - aliquota_periodo/100), 2)` — **não** persistir |
| Meta exibida | — | calculada | Líquido → `valor_meta`; Bruto → meta bruta |

**Meta anual** (`mes = 0`): continua só com `valor_meta`; `aliquota_periodo` ignorada / null; fora do fluxo de Configuração do Período.

**Identidade**: upsert por (`mes`, `ano`) como hoje.

**Validação de save mensal**:

1. `valor_meta` e `aliquota_periodo` ambos presentes
2. `aliquota_periodo` ∈ [0, 100)
3. Se `aliquota_periodo` ≠ valor já persistido → exige confirmação de atualização em massa antes de commit

### Conta a Receber (`nfs` / modelo `NF`) — campos tocados pelo trigger

| Campo | Uso nesta feature |
|-------|-------------------|
| `data_emissao` | Filtro do universo do trigger (mês/ano da emissão) |
| `valor_bruto` | Base do recálculo |
| `aliquota_imposto` | Atualizado para `aliquota_periodo` |
| `valor_imposto` | Recalculado |
| `valor_liquido` | Recalculado |
| `excluida_em`, `status` | Excluir soft-deleted e `cancelada` do universo |

**Fórmula** (já existente):  
`imposto = round(bruto * aliquota/100, 2)`; `liquido = round(bruto - imposto, 2)`.

Registros **sem** `data_emissao` **não** entram no trigger (permanecem para estimativa futura com `aliquota_periodo` lida no Dashboard).

### Toggle Bruto/Líquido (não persistido)

| Atributo | Valor |
|----------|--------|
| Estado | `liquido` \| `bruto` |
| Default | `liquido` |
| Escopo | Sessão/UI do Dashboard |
| Efeito | Seleciona base monetária de receita + meta exibida |

### Pipeline (agregação — extensão 056)

Por estágio (`fechado`, `a_faturar`, `faturado_ag_pagamento`, `recebido`):

| Campo | Descrição |
|-------|-----------|
| `valor_liquido` | SUM(`valor_liquido`) |
| `valor_bruto` | SUM(`valor_bruto`) |
| `contagem` | COUNT(*) — igual nas duas bases |
| `percentual_liquido` / `percentual_bruto` | Sobre fechado na mesma base; null se fechado = 0 |

Invariante: soma dos três estágios = fechado em **cada** base (valor) e em contagem.

## Relacionamentos

```text
Configuração do Período (mês/ano)
    │
    ├─► meta_exibida / meta_bruta (leitura Dashboard + toggle)
    │
    └─► (ao salvar alíquota nova + confirmar)
            atualiza N NFs com data_emissao no período
```

## Migration

```sql
ALTER TABLE metas_financeiras
  ADD COLUMN IF NOT EXISTS aliquota_periodo DOUBLE PRECISION;
```

Via `_migrar()` em `backend/app/main.py`. Registros mensais antigos ficam com `aliquota_periodo` null até o admin salvar a Configuração completa (obrigatória daí em diante).

## Estados / transições

- **Sem configuração completa** (null meta ou null alíquota no mês): Dashboard indica ausência; meta bruta indisponível; receita pode ser vista no toggle líquido/bruto a partir dos valores das NFs.
- **Configurada**: meta e conversões disponíveis.
- **Save só meta** (alíquota igual): commit direto.
- **Save com alíquota nova**: pending confirmação → commit config + update NFs **ou** cancel → no-op.
