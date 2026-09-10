# Research: Abas Por Caixa e Por Competência

**Feature**: `058-dashboard-caixa-competencia` | **Date**: 2026-09-10

## 1. Fonte de dados da aba Por Competência

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Reutilizar `GET /api/relatorios/pipeline-receita` no Dashboard: `fechado` → Total Fechado; `recebido` → Já Recebido; `faturado_ag_pagamento` → A Receber · NFs emitidas; `a_faturar` → A Faturar · sem NF. Mesmo `ano`/`mes` e dual-base do toggle. |
| **Rationale** | Spec FR-017 / SC-006 exige igualdade com o Pipeline; 056/057 já garantem universo (`data_ent_pgto`), exclusões e invariante. Evita segundo cálculo divergente (Constitution V). |
| **Alternatives considered** | Endpoint espelho `receita-competencia` — rejeitado: duplicação. Agregar no client via `nfsService.listar` — rejeitado em 056 (universo, arquivadas, volume). |

## 2. API da aba Por Caixa

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Novo `GET /api/relatorios/receita-caixa?ano=&mes=` retornando dual-base para Recebido / A Receber / A Faturar + `impostos_recolhidos` absoluto (único valor, sem toggle). Sibling do Pipeline no router `relatorios.py`, mesmas exclusões (`excluida_em IS NULL`, `status != cancelada`, incluir arquivadas). |
| **Rationale** | Recebido de caixa filtra por `data_pagamento` no período — **não** é o estágio `recebido` do Pipeline (que exige fechamento no período). Pendentes usam `data_ent_pgto` no período + sem pagamento (D2). Um endpoint dedicado mantém o Pipeline estável. |
| **Alternatives considered** | Estender o JSON do Pipeline com bloco `caixa` — viável, mas acopla cards distintos e aumenta payload do Pipeline. Agregar no client — rejeitado. |

## 3. Regras de filtro Por Caixa (mapeamento de campos)

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Conta a Receber = `nfs`. Datas: fechamento = `data_ent_pgto`; emissão = `data_emissao`; recebimento = `data_pagamento`. **Recebido**: `data_pagamento` no período. **Impostos Recolhidos**: mesmo universo do Recebido; valor absoluto = `SUM(COALESCE(valor_imposto, 0))` (equivalente persistido de bruto × alíquota). **A Receber**: `data_ent_pgto` no período ∧ `data_emissao IS NOT NULL` ∧ `data_pagamento IS NULL`. **A Faturar**: `data_ent_pgto` no período ∧ `data_emissao IS NULL` ∧ `data_pagamento IS NULL`. Sem `mes` → ano inteiro (`extract(year, …)`). |
| **Rationale** | Briefing Seção 05 + D2; alinhado ao helper `status_ciclo_nf` de 056. `valor_imposto` já é mantido por `calcular_imposto_liquido` (057). |
| **Alternatives considered** | `SUM(valor_bruto × aliquota/100)` inline — equivalente se sincronizado; preferir `valor_imposto` (já usado em `relatorios` impostos). Pendentes = estoque global — rejeitado pela D2. |

## 4. Remoção dos cards legados e `resumo-financeiro`

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Remover da UI do Dashboard os cards **Receita** e **Receita Pendente** alimentados por `resumo-financeiro` (filtro por `data_emissao` + status PAGA/PENDENTE). A seção Receita passa a ser: abas Por Caixa/Competência + Pipeline. Outros consumidores de `resumo-financeiro` (se houver fora do Dashboard) **não** são escopo desta feature. |
| **Rationale** | Clarify Q1; FR-001a / SC-009. O resumo legado **não** é a regra canônica do briefing (caixa vs competência). |
| **Alternatives considered** | Espelhar abas nos cards antigos — rejeitado no clarify. Manter Pendente ao lado — duas verdades. |

## 5. Barra de meta: numerador e denominador

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Uma barra no bloco de meta do topo. **Numerador**: aba Caixa → Recebido (base do toggle); aba Competência → Total Fechado / `pipeline.fechado` (base do toggle). **Denominador**: modo mês → `meta_exibida` mensal (057); modo só-ano → `metaAnual.valor_meta` (meta anual existente; base líquida vigente do produto para anual, salvo já houver bruto anual — nesta feature não inventar meta anual bruta). Não usar `metas/progresso.realizado_*` (hoje baseado em emissão/PAGA) como numerador. |
| **Rationale** | Clarify Q2/Q5; evita percentual enganoso e alinha SC-005/SC-005b. |
| **Alternatives considered** | Barras duplicadas nas abas — rejeitado. Somar metas mensais no ano — rejeitado. Numerador do `progresso` legado — divergiria das abas. |

## 6. UX das abas e estado

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Estado local `abaReceita: 'caixa' \| 'competencia'`, default `'caixa'` a cada montagem do Dashboard (sem localStorage). Troca de aba não refetch; toggle não refetch (dados dual-base). Loading/erro: mesma carga `carregarDados`; se `receita-caixa` falhar, toast/estado de erro na seção sem derrubar Pipeline se este OK (e vice-versa). |
| **Rationale** | Clarify Q3; SC-010; padrão Pipeline 056. |
| **Alternatives considered** | Persistir aba — fora do clarificado. Terceira aba = Pipeline — rejeitado (Pipeline card separado). |

## 7. Impostos Recolhidos vs toggle

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Campo único `impostos_recolhidos: number` na resposta Caixa; UI **não** aplica `valorPorVisao`. Demais métricas de receita das abas usam `valor_liquido` / `valor_bruto`. |
| **Rationale** | Spec FR-005 / FR-014; alinhado a 057 (impostos absolutos). |
| **Alternatives considered** | Alternar impostos com toggle — rejeitado pelo briefing. |

## 8. Testes

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Validação manual via [quickstart.md](./quickstart.md) + lint/type-check; smoke `GET /receita-caixa` e coerência com `pipeline-receita`. |
| **Rationale** | Padrão 056/057. |
| **Alternatives considered** | pytest de agregação — opcional futuro. |
