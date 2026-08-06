# Data Model: Dashboard — Filtro de Mês

**Feature**: `009-dashboard-filtro-mes` | **Date**: 2026-08-06  
**Spec**: [spec.md](./spec.md)

Sem novas tabelas ou migrations. Modelo conceitual de **período de visualização** e regras de consumo das entidades já existentes.

## Entidades conceituais

### Período da Dashboard

| Campo | Tipo | Regras |
|-------|------|--------|
| `mes` | int 1–12 | Sempre concreto (sem “todos”); na abertura = mês civil corrente |
| `ano` | int | Na abertura = ano civil corrente; range de opções = existente (`ANOS`) |

**Invariantes**:
1. Se `ano === anoCivilCorrente` ⇒ `mes ≤ mêsCivilCorrente`.
2. Se `ano < anoCivilCorrente` ⇒ `mes ∈ [1, 12]`.
3. Ao mudar `ano`, se `mes` violar (1), então `mes ← maxMesPermitido(ano)`.

### Indicador mensal (visão)

| Bloco | Fonte | Regra de período |
|-------|--------|------------------|
| Meta de faturamento mensal | `MetaFinanceira` + progresso (`mes`, `ano`) | Mês **exato** = `mes` do filtro (`mes=0` continua sendo anual) |
| Custo por categoria (donut) | Agregação `ContaPagar` | Mês **isolado**: `mes_de = mes_ate = mes` |
| Saldo corrente / investimento | Registros de saldo do ano | Mais recente com `registro.mes ≤ mes` e `registro.ano = ano` |

### Série anual (visão)

| Bloco | Fonte | Regra de período |
|-------|--------|------------------|
| DRE | `dreMensal(ano)` | Só `ano`; eixo já cortado no client para ano corrente |
| Faturamento líquido por mês | `faturamentoLiquidoMes(ano)` (+ comparar) | Só `ano` / `anoComparar` |
| Meta anual | `progresso(0, ano)` | Só `ano` |

## Validação

| Regra | Onde |
|-------|------|
| `mes_de`, `mes_ate` ∈ 1..12; `mes_de ≤ mes_ate` | API `custo-por-categoria` (422 se inválido) |
| Opções de `<select>` mês = `mesesPermitidos(ano)` | UI Dashboard |
| Fallback de saldo nunca usa `mes > filtro` | Client ao escolher registro |

## Ciclo de vida

1. Mount → `mes`/`ano` = corrente.
2. Usuário altera mês e/ou ano → clamp se necessário → `carregarDados()` com deps `[mes, ano, anoComparar]`.
3. Indicadores mensais refletem novo período; séries anuais refetch do mesmo `ano` (idempotente).
4. Unmount → estado descartado (sem persistência).

## Relacionamentos

```text
Período(mes, ano)
  ├── MetaMensal(mes, ano)
  ├── MetaAnual(ano)              # mes implícito 0
  ├── CustoCategoria[mes_de=mes, mes_ate=mes, ano]
  ├── Saldo*(ano, mes ≤ período.mes)
  ├── DRE(ano)
  └── FaturamentoSerie(ano [, anoComparar])
```
