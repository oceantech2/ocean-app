# Contract: UI — Card Aging de Recebíveis (Dashboard)

**Feature**: `060-dashboard-aging-recebiveis`  
**Superfície**: Dashboard Financeiro — card **Aging de Recebíveis**

## Objetivo

Mostrar estoque global de NFs em aberto por faixa de atraso, com Total em aberto e quatro buckets, na base do toggle Bruto/Líquido.

## Layout (MUST)

1. **Cabeçalho**: título “Aging de Recebíveis” (ou equivalente) + indicação de estoque global (não “do mês”) + **Total em aberto** (valor na base do toggle).
2. **Quatro buckets** (sempre nesta ordem):
   - A vencer · &lt;30d — verde — Monitorar
   - 1–60 dias — âmbar — Cobrar ativamente
   - 60–90 dias — laranja — Escalar
   - +90 dias — vermelho — Inadimplência — acionar jurídico
3. Por bucket: rótulo, valor (base do toggle), percentual (ou “—” / oculto se `null`), cor, ação recomendada.
4. **MUST NOT**: COUNT de NFs; linha “Outros”; aviso textual de % &lt; 100%; drill-down obrigatório; filtro visual pelo mês selecionado.

## Estado e dados

| Estado | Comportamento |
|--------|---------------|
| Loading | Spinner/placeholder no card (não derruba o resto do Dashboard se outros OK) |
| Erro | Mensagem/toast no card; demais seções intactas |
| Vazio (`total_aberto` = 0) | Total zero; buckets zerados; sem % inventados |
| Toggle | Recalcula só a base exibida — sem refetch |
| Mudança mês/ano | Totais do Aging **permanecem** os do estoque global (podem refetch, mas números iguais se dados iguais) |

## Interações

- Somente leitura nesta feature.
- `admin` e `visualizador`: mesma UI e números.

## Fora desta UI

- Banner Alerta de Fluxo de Caixa (Seção 09)
- Configuração de limiar
- Edição de vencimento no card

## Critérios visuais (aceitação)

- SC-006: Total + 4 buckets + cores/ações distinguíveis; não parece filtrado pelo mês
- SC-008: risco dominante identificável em ≤ 10 s com dados de demo
