# Data Model: Dashboard — Correções de Lógica, DRL e Ajustes Visuais

**Feature**: `041-dashboard-correcoes-logica` | **Date**: 2026-08-27  
**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

## Visão geral

```text
[ Filtro mês/ano Dashboard ] ──► KPIs, saldo por conta, metas (exceto DRL)

[ DRL — fixo 2024→hoje ]
        │
        └─► faturamentoLiquidoMes(2024) ∪ … ∪ faturamentoLiquidoMes(ANO_ATUAL)
                → filtrar valor > 0 → série DRL (mesLabel Jan/yy)
```

Schema físico **inalterado**. Entidades abaixo são **visões derivadas** no client (complementam [040 data-model](../040-dashboard-secoes-cards/data-model.md)).

## Entidades derivadas (novas ou alteradas)

### Meta de Receita Anual (apresentação)

| Campo | Tipo | Regra |
|-------|------|-------|
| `valor_meta` | number | API `metasService.progresso(0, ano)` |
| `realizado` | number | Σ receita líquida mensal do ano (1..limite recorte) |
| `percentual` | number | `realizado / valor_meta × 100`, cap 100 |
| `exibir_pct_na_barra` | boolean | `percentual >= 18` (igual meta mensal) |

### Saldo Conta Corrente calculado (por slot)

| Campo | Tipo | Regra |
|-------|------|-------|
| `conta_codigo` | string | Código da CC (slot 1–3) |
| `rotulo` | string | Nome cadastrado ou fallback |
| `saldo_base` | number | Último saldo histórico até fim do recorte |
| `receita_bruta_alocada` | number | Σ NF.valor_bruto da conta no recorte |
| `impostos_alocados` | number | Σ (bruto − líquido) das NFs da conta no recorte |
| `despesas_pagas_alocadas` | number | Σ contas pagas fixa\|variável ≠ impostos, caixa=conta |
| `saldo_exibido` | number | `saldo_base + receita_bruta − impostos − despesas_pagas` |

**Invariantes**:
- MUST NOT usar totais globais de Receita/Despesa do Dashboard nos três slots
- Despesas pendentes MUST NOT entrar em `despesas_pagas_alocadas`
- Slot sem conta → `saldo_exibido = null`, rotulo fallback, UI "—"

### Série DRL (histórica)

| Campo | Tipo | Regra |
|-------|------|-------|
| `pontos` | array | Ordenados cronologicamente |
| `ponto.mes` | number | 1–12 |
| `ponto.ano` | number | ≥ 2024 |
| `ponto.valor` | number | Receita líquida do mês (> 0) |
| `ponto.mesLabel` | string | `MESES_NOME[mes-1] + '/' + ano.slice(-2)` ex.: Jan/24 |

**Invariantes**:
- Incluir apenas meses com `valor > 0` entre jan/2024 e mês corrente
- MUST NOT depender do `ano` selecionado no Head
- Uma única série; sem `valorAnterior`

### Despesa operacional (reforço — inalterada em schema)

Mesmas regras da 040; esta feature **reforça** que `naturezaDespesa(categoria) === 'excluida'` para impostos em:
- `totaisDespesa` → cards Fixas, Variáveis, Pendentes
- `filtrarCustoSemImpostos` → donuts Centro de Despesa

## Fluxo de dados por área

| Área | Fontes | Transformação |
|------|--------|---------------|
| Meta anual % | `faturamentoLiquidoMes(ano)`, `metasService` | Σ líquido YTD; pct na barra |
| Saldo CC | `saldos`, `nfs`, `contas` pagas, `manuais`, `contasCorrentes` | `saldoCorrenteDashboard` por slot |
| Saldo investimento | `saldos` | Inalterado (sem FR-002) |
| Despesa cards/donuts | `contas`, `custoPorCategoria` | `dashboardDespesas` (audit) |
| DRL | `faturamentoLiquidoMes` × anos | merge + filter valor>0 |
| Head | — | Remove comparar |
| Cores Saldo | — | swap green/blue classes |

## Relacionamentos

```text
ContaCorrente (1) ──► (1) SaldoContaCorrenteCalculado por slot
NF (N) ──► alocadas por caixa ──► receita_bruta + impostos da conta
ContaPagar (N) ──► alocadas por caixa ──► despesas_pagas (se pago ∧ operacional)
SérieDRL ──► agregação multi-ano independente do filtro Head
```
