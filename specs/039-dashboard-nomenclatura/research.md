# Research: Dashboard — Nomenclatura e Remoção de Card

**Feature**: `039-dashboard-nomenclatura` | **Date**: 2026-08-27  
**Spec**: [spec.md](./spec.md)

## 1. Escopo de alteração de texto

**Decision**: Alterar apenas strings de UI em `frontend/src/pages/Dashboard.tsx` (títulos `h2`/`h3`, `rotuloMetaMensal`, `rotuloCustoMes` / `rotuloCustoAno` e literais de meta anual). Manter nomes de variáveis, chaves de API (`faturamento_bruto_pago`, `faturamento_liquido_pago`, etc.) e a página Impostos intactos.

**Rationale**: Spec delimita o Dashboard; FR-009 exige não mudar cálculo. Renomear DTO/backend aumentaria escopo sem valor de negócio nesta entrega.

**Alternatives considered**:
- Renomear campos da API — rejeitado (quebra clientes, fora de escopo).
- Propagar “Receita” para Impostos/outras telas — rejeitado pela Assumptions da spec.

## 2. Mapeamento canônico de rótulos

**Decision**: Aplicar a tabela abaixo, preservando sufixos de período já usados (`— {mês}/{ano}`, `— {ano}`, `— mês`):

| Atual (visível) | Novo (visível) |
|-----------------|----------------|
| Meta de Faturamento Anual | Meta de Receita Anual |
| Meta de Faturamento | Meta de Receita Mensal |
| Faturamento Bruto | Receita Bruta |
| Faturamento Líquido | Receita Líquida |
| NFs com pagamento pendente (R$) | Receita Pendente |
| Custo por categoria | Centro de Despesas |
| Faturamento Líquido por Mês | DRL |

Subtítulos auxiliares não listados na entrada (ex.: `{n} NFs pendentes`, `Valor total`, `NFs pagas`) permanecem.

**Rationale**: Espelha a entrada do usuário; sufixos de período são parte do padrão 035/004 e não são “nomes antigos” a eliminar.

**Alternatives considered**:
- Remover `(R$)` e também o subtítulo de quantidade — desnecessário; só o título foi pedido.
- Expandir DRL para “DRL — Receita Líquida por Mês” — Assumptions da spec: título completo é **DRL**.

## 3. Remoção de Fechamentos por Tipo

**Decision**: Remover o bloco JSX do pie chart “Fechamentos por Tipo”; remover `useState` de `fechamentos`, a chamada `relatoriosService.fechamentosPorTipo(ano)` do `Promise.all` / `carregarDados`, e imports Recharts (`PieChart`, `Pie`, `Cell`) se ficarem sem uso. **Não** remover o método do `api.ts` nem a rota backend nesta feature.

**Rationale**: FR-008 + simplicidade (constitution V). Manter o endpoint evita trabalho paralelo e permite reuso futuro; a Dashboard deixa de consumir.

**Alternatives considered**:
- Só ocultar com CSS/`false` — deixa código morto e request desnecessário.
- Deletar endpoint backend — fora de escopo; risco para consumidores desconhecidos.

## 4. Layout após remoção do pie

**Decision**: O gráfico de linha **DRL** deixa o `grid lg:grid-cols-2` compartilhado e passa a ocupar a fileira em largura total (`w-full` / container único), no mesmo padrão visual dos demais blocos full-width do Dashboard.

**Rationale**: Com um único filho, o grid de 2 colunas deixaria metade vazia (edge case da spec). Largura total alinha ao donut anual sem mês e à meta anual em “Todos os meses”.

**Alternatives considered**:
- Manter metade da tela — rejeitado (espaço morto).
- Substituir o pie por outro gráfico — fora da spec.
