# Data Model: Dashboard — Nomenclatura e Remoção de Card

**Feature**: `039-dashboard-nomenclatura` | **Date**: 2026-08-27  
**Spec**: [spec.md](./spec.md)

Sem novas tabelas, migrations ou mudanças de DTO de API. Modelo abaixo descreve apenas entidades de **apresentação** no Dashboard.

## Entidades de visualização

### IndicadorRotulado

Bloco do Dashboard cujo título exibido muda nesta feature.

| Atributo | Tipo | Regra |
|----------|------|--------|
| `id_logico` | string estável | Identificador interno (não exibido); ex.: `meta_anual`, `kpi_bruto`, `drl` |
| `rotulo_antigo` | string | Texto atualmente visível (referência de migração de UI) |
| `rotulo_novo` | string | Texto obrigatório pós-feature |
| `sufixo_periodo` | string opcional | Mantido quando já existir (`— {mês}/{ano}`, `— {ano}`, `— mês`) |
| `fonte_valor` | referência existente | Mesmo campo/estado de antes (sem remap) |

### Catálogo de indicadores afetados

| id_logico | rotulo_antigo | rotulo_novo | fonte_valor (inalterada) |
|-----------|---------------|-------------|---------------------------|
| `meta_anual` | Meta de Faturamento Anual | Meta de Receita Anual | `metaAnual` + `totalAnualRealizado` |
| `meta_mensal` | Meta de Faturamento | Meta de Receita Mensal | `meta` (progresso mensal) |
| `kpi_bruto` | Faturamento Bruto | Receita Bruta | `resumo.faturamento_bruto_pago` |
| `kpi_liquido` | Faturamento Líquido | Receita Líquida | `resumo.faturamento_liquido_pago` |
| `kpi_pendente` | NFs com pagamento pendente (R$) | Receita Pendente | `resumo.faturamento_bruto_pendente` |
| `centro_despesas` | Custo por categoria | Centro de Despesas | fatias donut mês/ano |
| `drl` | Faturamento Líquido por Mês | DRL | série `faturamento` (linha) |

### CardFechamentosPorTipo (removido)

| Atributo | Nota |
|----------|------|
| `titulo` | Era “Fechamentos por Tipo” — **não renderizar** |
| `series` | Retainer / Sucesso / Parcelamento — deixam de ser exibidas no Dashboard |
| `fonte` | `relatoriosService.fechamentosPorTipo` — deixa de ser chamada pela página |

## Validação / invariantes

- Para cada `IndicadorRotulado` listado, o texto visível do título contém `rotulo_novo` e **não** contém `rotulo_antigo`.
- Valores numéricos exibidos iguais aos da fonte existente (mesma fórmula/chamada).
- `CardFechamentosPorTipo` ausente do DOM do Dashboard em qualquer combinação de mês/ano.
- Relação: Dashboard → 0 instâncias de `CardFechamentosPorTipo`; 1 de cada indicador da tabela (meta mensal só com mês concreto, como hoje).

## Estado / ciclo de vida (UI)

Sem CRUD novo. Ciclo: carregar Dashboard → render com novos rótulos → (admin) editar meta com título novo → descartar estado de `fechamentos` (removido). Preferências de filtro mês/ano inalteradas.
