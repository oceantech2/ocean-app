# Data Model: Dashboard — Alíquota, Lucro %, DRE Anual e Imposto por Competência

**Feature**: `047-dashboard-metricas-dre`  
**Date**: 2026-09-06

Sem novas tabelas ou migrations. Reuso de entidades existentes; mudanças são de **agregação** e **apresentação**.

## Entidades persistidas (reuso)

### NF

| Campo | Uso nesta feature |
|-------|-------------------|
| `valor_bruto` | Compõe Receita Bruta (já existente no DRE/KPIs) |
| `valor_imposto` | Soma → Impostos competência (card + DRE); `null` → 0 |
| `valor_liquido` | Compõe Receita Líquida (denominador do % Lucro no card) |
| `status` | Apenas `paga` entra nas somas de Impostos/Receita Bruta |
| `data_emissao` | Define mês/ano de competência (igual Receita Bruta) |
| `excluida_em` | Soft-deleted excluídas (`IS NULL`) |

### ContaPagar

| Campo | Uso nesta feature |
|-------|-------------------|
| categoria impostos + `data_vencimento` | **Não** alimenta mais Impostos do card nem do DRE |
| demais categorias | Despesa do DRE **inalterada** |

## Objetos de leitura (não persistidos)

### ImpostosCompetenciaRecorte

| Campo | Tipo | Regra |
|-------|------|--------|
| `valor` | number | Σ `valor_imposto` das NFs pagas no recorte |
| `aliquota` | number \| null | `valor / receita_bruta * 100` se `receita_bruta > 0`; senão `null` |

**Recorte**:
- Mês concreto: emissão no (`mes`, `ano`)
- Todos os meses: emissão em `ano`, mês ∈ [1, mesAte] (mesAte = mês civil corrente no ano atual; 12 em anos anteriores)

### LucroCard

| Campo | Tipo | Regra |
|-------|------|--------|
| `valor` | number | Receita Líquida − Despesas Fixas − Despesas Variáveis (inalterado) |
| `pct` | number \| null | `valor / receita_liquida * 100` se `receita_liquida > 0`; senão `null` |

### PontoMensalDRE (resposta `dre-mensal`)

| Campo | Tipo | Regra atualizada |
|-------|------|------------------|
| `mes` | 1..12 | Sempre 12 entradas |
| `receita_bruta` | number | Σ valor_bruto NFs pagas (inalterado) |
| `despesa` | number | Contas não-impostos por vencimento (inalterado) |
| `impostos` | number | **NOVO**: Σ `valor_imposto` NFs pagas, emissão no mês |
| `lucro` | number | receita_bruta − despesa − impostos (com novo impostos) |

## Validações / invariantes

1. Card Impostos(M) = DRE.impostos(M) para o mesmo ano (NFs pagas, emissão M).
2. NFs `pendente` nunca entram em `valor` nem em `aliquota`.
3. Alíquota e % Lucro nunca dividem por zero (UI "—").
4. Eixo DRE UI: 12 pontos do ano selecionado (sem omitir meses futuros/zerados no ano corrente).

## Ciclo de vida

Somente leitura no Dashboard. Nenhuma transição de estado nova.
