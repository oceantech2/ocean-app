# Contract: UI — Dashboard nomenclatura e remoção de Fechamentos por Tipo

**Feature**: `039-dashboard-nomenclatura`  
**Página**: `frontend/src/pages/Dashboard.tsx`  
**Papéis**: `admin` e `visualizador` veem os mesmos rótulos; ausência do card é idêntica para ambos

## Rótulos obrigatórios

| Elemento | Texto visível (título) | Notas |
|----------|------------------------|--------|
| Card meta anual | `Meta de Receita Anual — {ano}` | Inclui modo edição |
| Card meta mensal | `Meta de Receita Mensal` ou `Meta de Receita Mensal — {mês}/{ano}` | Só com mês concreto (comportamento 035) |
| KPI 1 | `Receita Bruta` | Valor: `fmt(resumo.faturamento_bruto_pago)` |
| KPI 2 | `Receita Líquida` | Valor: `fmt(resumo.faturamento_liquido_pago)` |
| KPI 3 | `Receita Pendente` | Valor: `fmt(resumo.faturamento_bruto_pendente)`; subtítulo de quantidade de NFs **pode** permanecer |
| Donut(s) | `Centro de Despesas — …` | Sufixos `mês`, `{mês}/{ano}` ou `{ano}` como hoje |
| Gráfico linha | `DRL` | Série anual inalterada |

**Proibido na UI do Dashboard** (títulos): `Meta de Faturamento`, `Meta de Faturamento Anual`, `Faturamento Bruto`, `Faturamento Líquido`, `NFs com pagamento pendente`, `Custo por categoria`, `Faturamento Líquido por Mês`, `Fechamentos por Tipo`.

## Remoção — Fechamentos por Tipo

| Regra | Detalhe |
|-------|---------|
| Render | Não existe `h2`/card com título “Fechamentos por Tipo” |
| Dados | Dashboard não chama `fechamentosPorTipo` no carregamento |
| Layout | Bloco **DRL** em largura total da fileira (sem coluna vazia ao lado) |

## Ordem / layout de KPIs

Ordem inalterada: **Receita Bruta** → **Receita Líquida** → **Receita Pendente**  
Grid: `grid grid-cols-1 md:grid-cols-3 gap-4`.

## Estados

| Situação | UI |
|----------|-----|
| Loading | Spinner de página existente |
| Filtro mês/ano | Demais indicadores atualizam; card removido continua ausente |
| Sem dados nos KPIs | Valores `0` / vazios como hoje; só o título muda |
| Admin edita meta | Títulos de edição usam nomenclatura nova |

## Fora de escopo UI

- Página Impostos e demais módulos.
- Renomear campos JSON da API ou variáveis internas.
- Remover rota/serviço `fechamentosPorTipo` do backend/`api.ts`.
- Redesenho amplo do Dashboard além do ajuste de largura do DRL.
