# Data Model: Abas Por Caixa e Por Competência

**Feature**: `058-dashboard-caixa-competencia` | **Date**: 2026-09-10

Sem migration. Conta a Receber continua sendo a entidade `NF` (`nfs`).

## Entidades persistidas (reuso)

### NF (Conta a Receber)

| Campo | Uso nesta feature |
|-------|-------------------|
| `data_ent_pgto` | Fechamento — universo Por Competência; filtro de pendentes Por Caixa |
| `data_emissao` | Distingue A Faturar vs A Receber |
| `data_pagamento` | Recebimento — filtro Recebido / Impostos (Caixa); estágio Já Recebido (Competência) |
| `valor_bruto` / `valor_liquido` | Dual-base do toggle |
| `valor_imposto` / `aliquota_imposto` | Impostos Recolhidos (absoluto via `valor_imposto`) |
| `status` / `excluida_em` / `arquivada` | Excluir cancelada e soft-delete; **incluir** arquivadas (igual Pipeline) |

### MetaFinanceira (reuso 057)

| Uso | Detalhe |
|-----|---------|
| Mensal (`mes` 1–12) | `valor_meta` + `aliquota_periodo` → `meta_exibida` (denominador da barra no modo mês) |
| Anual (`mes=0`) | `valor_meta` → denominador da barra no modo só-ano |

## Visões derivadas (não persistidas)

### Aba Por Caixa

| Métrica | Universo | Toggle |
|---------|----------|--------|
| Recebido | `data_pagamento` no período | Sim (bruto/líquido) |
| Impostos Recolhidos | Mesmo universo do Recebido; `SUM(COALESCE(valor_imposto,0))` | **Não** |
| A Receber · NFs emitidas | `data_ent_pgto` no período ∧ emissão ≠ null ∧ pagamento = null | Sim |
| A Faturar · sem NF | `data_ent_pgto` no período ∧ emissão = null ∧ pagamento = null | Sim |

### Aba Por Competência

| Métrica | Fonte | Toggle |
|---------|-------|--------|
| Total Fechado | `pipeline.fechado` | Sim |
| Já Recebido | `pipeline.recebido` | Sim |
| A Receber · NFs emitidas | `pipeline.faturado_ag_pagamento` | Sim |
| A Faturar · sem NF | `pipeline.a_faturar` | Sim |

Invariante: Já Recebido + A Receber + A Faturar = Total Fechado (valores e contagens) na mesma base.

### Barra de progresso

| Modo | Numerador | Denominador |
|------|-----------|-------------|
| Mês + aba Caixa | Recebido (visão ativa) | meta_exibida mensal (057) |
| Mês + aba Competência | Total Fechado (visão ativa) | meta_exibida mensal |
| Só-ano + aba Caixa | Recebido anual (visão ativa) | meta anual |
| Só-ano + aba Competência | Total Fechado anual (visão ativa) | meta anual |

## Estado de UI (sessão)

| Estado | Valores | Persistência |
|--------|---------|--------------|
| `abaReceita` | `caixa` \| `competencia` | Só memória; default `caixa` a cada abertura |
| `visaoReceita` | `liquido` \| `bruto` | Já definido em 057 (sessão) |

## Validação / exclusões

- Cancelada (`status = cancelada`) e `excluida_em IS NOT NULL` → fora de todas as métricas
- Arquivada → **entra** (paridade Pipeline)
- Período sem dados → zeros; percentuais de meta sem denominador → estado “indisponível”, não NaN
- Alíquota/imposto nulos no registro → contribuem 0 aos Impostos Recolhidos

## Relacionamentos

```text
Dashboard (mes/ano, visaoReceita, abaReceita)
  ├── GET pipeline-receita  → card Pipeline + aba Por Competência
  ├── GET receita-caixa     → aba Por Caixa
  ├── GET metas/periodo | progresso mensal → meta_exibida (mês)
  └── GET metas progresso anual           → meta anual (só-ano)
```
