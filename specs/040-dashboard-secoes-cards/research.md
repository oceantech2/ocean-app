# Research: Dashboard — Seções, Títulos e Reordenação de Cards

**Feature**: `040-dashboard-secoes-cards` | **Date**: 2026-08-27  
**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md)

## 1. Classificação Despesas Fixas × Variáveis

**Decision**: Introduzir mapa canônico `categoria → natureza` (`fixa` | `variavel`) em constante no frontend (documentado no contrato UI). Sem migration e sem campo novo em `ContaPagar`.

| Natureza | Categorias (códigos) |
|----------|----------------------|
| `fixa` | `adm_financeiro`, `recursos_humanos`, `beneficios`, `tecnologia` |
| `variavel` | `operacoes`, `marketing`, `comercial` |
| excluída dos cards de Despesa | `impostos` (e qualquer alias de Impostos) |

Categorias cadastradas fora do mapa (catálogo dinâmico 032): tratar como **`variavel`** quando pagas; quando não pagas entram em **Despesas Pendentes** (ainda excluindo `impostos`).

**Rationale**: A spec assumia classificação existente; o domínio só tem `categoria`/`subcategoria` (021). Migration + formulário em Contas expandiria o escopo além do Dashboard. O mapa fecha a entrega e fica auditável; se o negócio divergir, uma feature futura pode promover `natureza` ao schema.

**Alternatives considered**:
- Campo `natureza` + migration + UI Contas — correto a longo prazo, fora do escopo fechado.
- Um único card “Despesas” sem split — rejeitado (spec exige Fixas + Variáveis).
- Inferir por subcategoria RH — incompleto para categorias sem sub.

## 2. Agregação Fixas / Variáveis / Pendentes

**Decision**: Agregar no client a partir de `contasService.listar` (já usado no Dashboard), filtrando pelo recorte de `data_vencimento` alinhado ao filtro mês/ano do painel.

| Card | Regra |
|------|--------|
| Despesas Fixas | `pago === true` ∧ natureza=`fixa` ∧ categoria ≠ impostos ∧ vencimento no recorte |
| Despesas Variáveis | `pago === true` ∧ natureza=`variavel` (ou fora do mapa) ∧ categoria ≠ impostos ∧ vencimento no recorte |
| Despesas Pendentes | `pago !== true` ∧ categoria ≠ impostos ∧ vencimento no recorte |

**Rationale**: Clarify A (pagas vs não pagas) + exclusão de Impostos. Evita endpoint novo. Lucro usa os mesmos totais de Fixas e Variáveis.

**Alternatives considered**:
- Endpoint `GET /relatorios/resumo-despesas` — útil se listas forem grandes; hoje o Dashboard já puxa contas com limit alto.
- Filtrar por `data_pagamento` para pagas — rejeitado para manter coerência com DRE/custo (vencimento).

## 3. Card Impostos (R$ + Alíquota)

**Decision**: Chamar `impostosService.deContas(ano)` e exibir:

- **Mês concreto**: `valor_imposto` e `percentual_imposto` do mês.
- **Todos os meses / YTD**: somar `valor_imposto` dos meses 1..limite; alíquota = Σ valor_imposto / Σ faturamento × 100 (mesma lógica do endpoint; se Σ faturamento = 0 → "—").

**Rationale**: Clarify A — mesma base da tela Impostos / tooltip 037. Endpoint já existe; Dashboard ainda não o usa.

**Alternatives considered**:
- Bruto − Líquido do resumo — rejeitado no clarify.
- Série Impostos do DRE — base por vencimento similar, mas alíquota do produto é a de `de-contas`.

## 4. Lucro (R$ + %)

**Decision**: `lucro = receitaLiquida - despesasFixas - despesasVariaveis` (valores do mesmo recorte). `% = lucro / receitaBruta × 100` se receita bruta > 0; senão "—".

**Rationale**: Clarify A. Receita bruta/líquida já vêm de `resumoFinanceiro`.

**Alternatives considered**: Igualar ao Lucro do DRE (usa despesa total incl. não pagas e fórmula diferente) — rejeitado no clarify.

## 5. Saldos por Conta Corrente

**Decision**: Usar `contasCorrentesService.listar({ ativas: true })` (ordem API: `padrao DESC`, `nome ASC`). Pegar até **3** primeiras; para cada uma calcular `saldoVisivel` como hoje. Rótulo = `nome` ou fallback `Conta Corrente {n}`. Quarto card: Conta Investimento (inalterado). Remover o card consolidado único.

**Rationale**: Clarify B (nome cadastrado). Ordem já estável na API.

**Alternatives considered**: Rótulos literais fixos — rejeitado. Mostrar todas as CC — fora do limite de 3 slots da spec.

## 6. Centro de Despesa sem Impostos

**Decision**: Após receber `custoPorCategoria`, filtrar fatias com `categoria`/`centro_custo` = `impostos`; recalcular `total` e `percentual` das restantes. Títulos: `Despesas — {mês}/{ano}` e `Despesas — {ano}` (identidade “Despesas [Mês]/”[Ano]”).

**Rationale**: Spec FR-011; filtro no client evita mudança de contrato REST e efeito colateral em outros consumidores.

**Alternatives considered**: Query `excluir_impostos=true` no backend — adia; possível follow-up se outro cliente precisar.

## 7. Layout e seções

**Decision**: Wrappers com `<h2>` (ou equivalente) por seção; ordem e grids conforme contrato UI. Metas: **Mensal → Anual**. Linha 3: Despesa (3 cards) | Resultado (Lucro). Demonstrativo: DRE depois DRL. Seção “Centro de Despesa” (singular, como na spec).

**Rationale**: FR-001–013; ordem de Metas invertida vs histórico 002.

**Alternatives considered**: Sem títulos de seção (só cards) — rejeitado pela spec.

## 8. Dependência de nomenclatura (039)

**Decision**: Assumir rótulos de Receita / DRL / Centro já alinhados (ou aplicar em conjunto se 039 ainda não estiver mergeada na mesma branch de implementação).

**Rationale**: Baseline da spec 040.
