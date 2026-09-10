# Research: Aging de Recebíveis no Dashboard

**Feature**: `060-dashboard-aging-recebiveis` | **Date**: 2026-09-10

## 1. Fonte de dados e mapeamento de campos

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Conta a Receber = tabela `nfs`. `data_vencimento_nf` (briefing) = `NF.data_vencimento`. Emissão = `data_emissao`. Recebimento = `data_pagamento`. Valores = `valor_bruto` / `valor_liquido`. |
| **Rationale** | D1 do briefing + clarify 056 (mesmos campos de ciclo). Campo já existe e é nullable — alinhado a “sem prazo padrão”. |
| **Alternatives considered** | Campo novo `data_vencimento_nf` — rejeitado (D1). Usar `data_ent_pgto` como vencimento — incorreto (é fechamento). |

## 2. Universo do Aging

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Universo: `data_emissao IS NOT NULL` ∧ `data_pagamento IS NULL`, com exclusões canônicas `excluida_em IS NULL` ∧ `status != cancelada`, **incluindo** arquivadas (mesmo padrão Pipeline/Caixa). |
| **Rationale** | Spec FR-002 / FR-010; briefing Seção 08. Arquivadas com NF aberta ainda são risco de cobrança. |
| **Alternatives considered** | Excluir arquivadas — divergiria do Pipeline. Exigir `data_ent_pgto` — Aging é estoque de NF emitida, não de fechamento. |

## 3. API dedicada sem filtro de período

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Novo `GET /api/relatorios/aging-recebiveis` **sem** `ano`/`mes`. Resposta dual-base: `total_aberto` + quatro buckets com `valor_*` e `percentual_*`. “Hoje” = `date.today()` no servidor (data civil do ambiente). |
| **Rationale** | FR-004: estoque independente do filtro do Dashboard. Evita o client reclassificar ao mudar mês. Dual-base = toggle sem refetch (057/058). |
| **Alternatives considered** | Aceitar `ano`/`mes` e ignorar — confuso. Agregar no client com `nfsService.listar` — rejeitado (volume, exclusões, arquivadas). Estender Pipeline — acopla conceitos distintos. |

## 4. Buckets e rótulo 1–60

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Chaves: `a_vencer_lt_30`, `d1_60`, `d60_90`, `d_mais_90`. Condições: vencimento ∈ [hoje, hoje+30]; atraso 1–60; 61–90; &gt;90. Rótulo UI do 2º bucket: **1–60 dias**. Residual (sem vencimento ou vencimento &gt; hoje+30) só no `total_aberto`. |
| **Rationale** | Clarify Q1/Q2; FR-005 / FR-009. |
| **Alternatives considered** | Rótulo “30–60” literal — rejeitado no clarify. Faixas industriais 1–30/31–60 — fora do briefing. 5º bucket Outros — rejeitado. |

## 5. Percentuais e COUNT

| Decisão | Detalhe |
|---------|---------|
| **Decision** | `percentual_* = SUM(bucket) / SUM(total_aberto) × 100` por base; `null` se total = 0. API **não** precisa de `contagem` (UI não exibe; FR-014). Residual implícito quando soma dos % &lt; 100 — sem campo nem texto de aviso. |
| **Rationale** | Clarify Q3/Q5; SC-004. |
| **Alternatives considered** | Contagem na API “por se acaso” — ruído. Bloco `residual` na resposta — tentação de UI; omitir. |

## 6. UX no Dashboard e refetch

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Card com **Total em aberto** no cabeçalho + 4 linhas/blocos (rótulo, valor, %, cor, ação). Fetch em `carregarDados` junto aos outros relatórios; ao mudar mês/ano o Aging pode refetch mas valores **não** devem mudar (salvo dados reais). Toggle só troca `valorPorVisao` / `pctPorVisao`. Sem drill-down. |
| **Rationale** | Clarify Q4; FR-001 / FR-013; SC-002. |
| **Alternatives considered** | Cache local e pular refetch no mês — otimização opcional; não obrigatória. |

## 7. Preparação para Alerta (09) sem implementá-lo

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Expor bucket `d60_90` estável para consumo futuro (“Aging em atenção”). Esta feature **não** cria banner, limiar nem Configuração de limiar. |
| **Rationale** | FR-012 / Out of Scope. |
| **Alternatives considered** | Implementar Alerta junto — rejeitado (módulo 6 / Seção 09). |

## 8. Testes

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Validação manual via [quickstart.md](./quickstart.md) + lint/type-check; smoke do endpoint com fixture de vencimentos relativos a hoje. |
| **Rationale** | Padrão 056–058. |
| **Alternatives considered** | pytest de classificação — opcional futuro. |
