# Research: DRE — Linha Impostos (Contas Imposto / DAS)

**Feature**: `075-dre-linha-impostos`  
**Date**: 2026-09-16

## 1. Fonte de Impostos no DRE

**Decision**: `impostos[mês]` = Σ `ContaPagar.valor` onde `tipo_despesa == "imposto_das"`, `data_vencimento` no mês/ano, `data_vencimento IS NOT NULL`. Inclui pagas e pendentes. **Não** usar `NF.valor_imposto`.

**Rationale**: Spec + clarify exigem Contas Tipo Imposto / DAS por vencimento. O endpoint `GET /api/impostos/de-contas` já agrega exatamente esse critério — o DRE deve alinhar-se a ele, não ao card de NFs (`047`).

**Alternatives considered**:
- Manter NFs no DRE (status quo `047`) — rejeitado pela spec FR-009
- Filtrar por `data_pagamento` — rejeitado no clarify (opção A = vencimento)
- Filtrar só `pago=true` — rejeitado; clarify inclui pagas e pendentes com vencimento em M

## 2. Ordem visual Impostos antes de Despesa

**Decision**: No `BarChart` do Dashboard, declarar `<Bar dataKey="impostos" …>` **antes** de `<Bar dataKey="despesa" …>` no mesmo `stackId="composicao"`, mantendo Lucro por último. Receita bruta permanece em `stackId` separado.

**Rationale**: Em Recharts, a ordem de declaração das séries empilhadas define a ordem na pilha e tipicamente na legenda. FR-001/FR-002 pedem Impostos entre Receita bruta e Despesa.

**Alternatives considered**:
- Só reordenar a legenda sem mudar a pilha — insuficiente (FR-002)
- Trocar nomes/cores — fora de escopo

## 3. Despesa e Lucro

**Decision**: Manter exclusão `tipo_despesa != "imposto_das"` na agregação de despesa (já presente pós-`074`). Recalcular `lucro = receita_bruta - despesa - impostos` com o novo `impostos`. Comportamento de Lucro negativo (sem segmento empilhado) permanece no frontend.

**Rationale**: Evita dupla contagem (FR-006/FR-007). Código atual de `despesa` já exclui `imposto_das`.

**Alternatives considered**:
- Excluir também por categoria `impostos` legada — redundante após migração `074`; filtro por Tipo é a fonte da verdade
- Mudar critério de despesa para data de pagamento — fora de escopo

## 4. Card Impostos vs DRE

**Decision**: Não alterar o card Impostos (continua Σ imposto das NFs pagas + alíquota). Sem hint/subtítulo novo sobre divergência.

**Rationale**: Clarify Q2=A, Q3=A; FR-012–014. Escopo mínimo.

**Alternatives considered**:
- Alinhar card a Contas — expandiria escopo e reabriria `047`
- Hint no DRE — rejeitado no clarify

## 5. Contrato REST e schema

**Decision**: Manter o shape JSON de `GET /api/relatorios/dre-mensal` (`ano`, `dados[]` com `mes`, `receita_bruta`, `despesa`, `impostos`, `lucro`). Apenas a semântica de `impostos` muda. Sem migration; sem novos campos.

**Rationale**: Frontend já consome esse shape; mudança transparente no mapeamento.

**Alternatives considered**:
- Novo endpoint `/dre-mensal-v2` — desnecessário
- Campo extra `impostos_nfs` — fora de escopo / sem hint

## 6. Soft delete / contas inválidas

**Decision**: Contas a Pagar não têm `excluida_em`; exclusão física remove do total. Exigir `data_vencimento IS NOT NULL` (igual despesa). Sem filtro por `pago`.

**Rationale**: Modelo atual; alinhado a `impostos/de-contas` e à agregação de despesa do DRE.

**Alternatives considered**:
- Filtrar `pago` — contradiz clarify
- Inventar mês sem vencimento — proibido por FR-005
