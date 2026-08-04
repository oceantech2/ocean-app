# Contract: UI — Donut de Custo na Dashboard

**Feature**: `004-dashboard-custo-donut`  
**Página**: `frontend/src/pages/Dashboard.tsx`

## Posição

1. Após o bloco **DRE** (feature `003-dashboard-dre-chart`).
2. Antes do próximo bloco já existente abaixo do DRE (ex.: Faturamento Líquido), empurrando-o verticalmente.
3. Layout: `grid grid-cols-1 md:grid-cols-2` — donut na primeira célula; segunda célula vazia nesta versão.

## Título

Texto claro de composição de custo / despesas por categoria e o ano (ex.: `Custo por categoria — {ano}` ou `Custo — % por categoria ({ano})`).

## Estrutura visual

| Elemento | Comportamento |
|----------|----------------|
| Tipo | Donut (`Pie` + `innerRadius`) |
| Fatias | Uma por categoria com valor &gt; 0; proporção = participação no total |
| Ordem | Valor decrescente (fatias e legenda) |
| Cores | Mapa estável por `centro_custo` (ver research) |
| Legenda | Nome legível + percentual |
| Miolo | Total de despesas em BRL (`pt-BR`) quando `total > 0` |
| Tooltip | Nome, valor BRL, percentual |
| Largura | 50% ≥ ~768px; 100% no mobile |

## Estados

| Estado | UI |
|--------|-----|
| Loading (página) | Spinner existente da dashboard (ou bloco aguarda mesmo ciclo) |
| Sucesso com `total > 0` | Donut + legenda + total no centro |
| Sucesso com `total == 0` / ano futuro | Bloco permanece; mensagem de ausência; sem total positivo falso |
| Erro só do donut | Bloco com mensagem de erro; DRE, saldos e resto OK |

## Não alterar

- Cards de meta, saldos, gráfico DRE, demais gráficos (exceto empurrar verticalmente / ocupar metade da faixa abaixo do DRE).
- Papéis: somente leitura para todos que veem a dashboard.
