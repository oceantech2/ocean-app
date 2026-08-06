# Data Model: Dashboard — Card NFs com Pagamento Pendente (R$)

**Feature**: `010-dashboard-nfs-pendente` | **Date**: 2026-08-06  
**Spec**: [spec.md](./spec.md)

Sem novas tabelas ou migrations. Modelo conceitual do indicador unificado e do payload de resumo.

## Entidades existentes (reuso)

### NF (Nota Fiscal)

| Campo relevante | Uso nesta feature |
|-----------------|-------------------|
| `status` | Incluir apenas `pendente` (`StatusNF.PENDENTE`) |
| `valor_bruto` | Soma → `faturamento_bruto_pendente` |
| `data_emissao` | Filtro opcional por `ano` (já existente no endpoint) |

**Não incluir**: status `vencida`, `paga`, `cancelada` (salvo se o produto já as misturasse no card de quantidade — hoje não).

## Visão: Resumo financeiro (payload)

Campos relevantes do `GET /api/relatorios/resumo-financeiro`:

| Campo | Tipo | Regra |
|-------|------|--------|
| `quantidade_pendentes` | int ≥ 0 | `len(nfs_pendentes)` — já existe |
| `faturamento_bruto_pendente` | number ≥ 0 | **Novo** — `sum(valor_bruto)` das mesmas NFs |
| `faturamento_liquido_pendente` | number ≥ 0 | Já existe — **não** usado neste card |

**Invariante**: As NFs que entram em `quantidade_pendentes` são exatamente as que entram em `faturamento_bruto_pendente`.

## Visão: Card KPI (UI)

| Elemento | Conteúdo |
|----------|----------|
| Título | `NFs com pagamento pendente (R$)` |
| Valor principal | `fmt(faturamento_bruto_pendente)` |
| Subtítulo | `{quantidade_pendentes} NFs pendentes` |

## Validação

| Regra | Onde |
|-------|------|
| Sem pendentes ⇒ valor `0` e quantidade `0` | API + UI |
| Mesmo filtro `ano` (se informado) para pagas e pendentes | `resumo_financeiro` |
| JWT obrigatório | Endpoint existente |

## Ciclo de vida (UI)

1. Mount / troca de `ano` → `resumoFinanceiro(ano)` → `setResumo`.
2. Card lê `faturamento_bruto_pendente` e `quantidade_pendentes`.
3. Unmount → estado descartado.

## Relacionamentos

```text
ResumoFinanceiro(ano?)
  ├── nfs_pendentes[status=PENDENTE, ano?]
  │     ├── quantidade_pendentes
  │     └── faturamento_bruto_pendente  (sum valor_bruto)
  └── CardKPI (Dashboard)
        ├── título fixo
        ├── valor ← faturamento_bruto_pendente
        └── subtítulo ← quantidade_pendentes
```
