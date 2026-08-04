# Contract: UI — Gráfico DRE na Dashboard

**Feature**: `003-dashboard-dre-chart`  
**Página**: `frontend/src/pages/Dashboard.tsx`

## Posição

1. Após o grid **Saldo Conta Corrente** / **Conta Investimento**.
2. Antes do gráfico **Faturamento Líquido por Mês** (e demais blocos abaixo).

## Título

Texto claro incluindo DRE e o ano em exibição (ex.: `DRE — {ano}` ou `DRE (ano vigente) — {ano}`).

## Estrutura visual

| Elemento | Comportamento |
|----------|----------------|
| Eixo X | Meses conforme FR-007 (ver spec) |
| Barra 1 (por mês) | Receita bruta — azul `#3B82F6` — `stackId` próprio |
| Barra 2 (por mês) | Pilha Despesa `#EF4444` → Impostos `#9CA3AF` → Lucro empilhado `#22C55E` |
| Legenda | Quatro labels; toggle independente; default todos on |
| Tooltip | Valores em BRL (`pt-BR`); inclui `lucro` real mesmo se negativo / não empilhado |
| Lucro &lt; 0 | Sem segmento verde; tooltip/rótulo mostra prejuízo |

## Estados

| Estado | UI |
|--------|-----|
| Loading (página) | Spinner existente da dashboard (ou bloco DRE aguarda mesmo ciclo) |
| Sucesso com dados | Chart + legenda |
| Sucesso sem movimento no ano (todos zero / ano futuro) | Bloco permanece; mensagem de ausência |
| Erro só do DRE | Bloco com mensagem de erro; saldos e resto da página OK |

## Não alterar

- Cards de saldo, metas, KPIs, gráfico de faturamento líquido (exceto empurrar verticalmente).
- Papéis: somente leitura para todos que veem a dashboard (sem edição DRE).
