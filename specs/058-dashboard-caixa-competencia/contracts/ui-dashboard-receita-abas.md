# Contract: UI — Abas Por Caixa / Por Competência no Dashboard

**Feature**: `058-dashboard-caixa-competencia`  
**Página**: `frontend/src/pages/Dashboard.tsx` (seção Receita)  
**Fonte Caixa**: `relatoriosService.receitaCaixa` → [rest-receita-caixa.md](./rest-receita-caixa.md)  
**Fonte Competência / Pipeline**: `relatoriosService.pipelineReceita` (contratos 056/057)

## Layout

1. Seção **Receita** contém:
   - Card com **abas** `Por Caixa` | `Por Competência`
   - Card **Pipeline de Receita** (inalterado em regras; permanece)
2. MUST NOT renderizar os cards genéricos legados **Receita** e **Receita Pendente**.

## Abas

| Regra | Detalhe |
|-------|---------|
| Padrão | `Por Caixa` a cada montagem/abertura do Dashboard |
| Persistência | Nenhuma (sem localStorage/servidor) |
| Troca | Só UI; não refetch; preserva `ano`/`mes` e `visaoReceita` |
| Papéis | `admin` e `visualizador` — mesma leitura; sem edição nas abas |

### Conteúdo — Por Caixa

| Métrica | Exibição |
|---------|----------|
| Recebido | `valorPorVisao(recebido)` |
| Impostos Recolhidos | `impostos_recolhidos` (formato moeda; **ignora** toggle) |
| A Receber · NFs emitidas | `valorPorVisao(a_receber)` |
| A Faturar · sem NF | `valorPorVisao(a_faturar)` |

### Conteúdo — Por Competência

| Métrica | Fonte Pipeline | Exibição |
|---------|----------------|----------|
| Total Fechado | `fechado` | `valorPorVisao` |
| Já Recebido | `recebido` | `valorPorVisao` |
| A Receber · NFs emitidas | `faturado_ag_pagamento` | `valorPorVisao` |
| A Faturar · sem NF | `a_faturar` | `valorPorVisao` |

Contagens opcionais na UI (se exibidas, usar `contagem` da API; não mudam com toggle).

## Barra de progresso (bloco meta do topo)

| Condição | Numerador | Denominador | Rótulo sugerido |
|----------|-----------|-------------|-----------------|
| Mês + Caixa | Recebido (visão) | meta_exibida mensal | “R$ … recebido” |
| Mês + Competência | Total Fechado (visão) | meta_exibida mensal | “R$ … fechado” |
| Ano + Caixa | Recebido anual (visão) | meta anual | “R$ … recebido” |
| Ano + Competência | Total Fechado anual (visão) | meta anual | “R$ … fechado” |

MUST: uma única barra visível; ao trocar aba, recalcular numerador/rótulo.  
MUST NOT: inventar meta se denominador ausente; MUST NOT usar `progresso.realizado_*` legado (emissão/PAGA) como numerador.

## Loading / erro / vazio

- Loading: spinner/skeleton na seção durante `carregarDados` (padrão Dashboard).
- Erro Caixa: mensagem clara; Pipeline pode continuar se OK.
- Totais zero: exibir R$ 0,00 (não ocultar abas).

## Fora deste contrato

- Cards Despesas & Resultado, Aging, Alerta (07–09)
- Edição de Configuração do Período (057)
- Toggle Bruto/Líquido (057) — apenas consumo
