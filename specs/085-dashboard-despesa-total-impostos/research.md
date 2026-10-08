# Research: Cards Total de Despesas e Impostos Pagos

**Feature**: `085-dashboard-despesa-total-impostos` | **Date**: 2026-10-08

## R1 — Fonte do Total de Despesas

- **Decision**: Usar `despesasTotais.fixas + despesasTotais.variaveis`, já exposto em `Dashboard.tsx` como `despesasTotaisResultado` (base do Resultado).
- **Rationale**: Garante por construção que Total = Fixas + Variáveis (SC-001) e coerência com Resultado; zero cálculo novo.
- **Alternatives considered**: Recalcular a partir das Contas a Pagar — duplicaria a regra da feature 059 sem ganho.

## R2 — Fonte de Impostos Pagos (modo mês)

- **Decision**: Chamar `relatoriosService.receitaCaixa(anoAnt, mesAnt)` e ler `impostos_recolhidos`, onde (anoAnt, mesAnt) é o mês anterior ao filtro (Janeiro → Dezembro/A−1).
- **Rationale**: É exatamente o valor exibido no card "Impostos Recolhidos" da aba Por Caixa (imposto das NFs por data de emissão, sem canceladas/excluídas). Reuso garante SC-002 sem nova regra no backend.
- **Alternatives considered**:
  - Somar Contas a Pagar Tipo Imposto / DAS pagas no mês — diverge do pedido ("replicar os impostos recolhidos do mês anterior").
  - Calcular no frontend a partir de `nfsService.listar` — a lista atual do Dashboard só traz NFs pagas e limite de 1000; divergiria do card da Receita.
  - Novo endpoint no backend — desnecessário (princípio V).

## R3 — Impostos Pagos no modo só-ano

- **Decision**: Janela Dez/A−1..Nov/A = `receitaCaixa(A−1, 12) + receitaCaixa(A, null) − receitaCaixa(A, 12)`, três consultas em paralelo.
- **Rationale**: Reaproveita o endpoint sem alterá-lo; 3 requisições leves contra 12 se fosse mês a mês.
- **Alternatives considered**: Parâmetro `mes_ate`/janela no endpoint — mudança de backend para um único uso; 12 chamadas mensais — mais tráfego sem benefício.

## R4 — Falha de carga

- **Decision**: Cada consulta de Impostos Pagos tem `.catch` próprio; em falha o estado vira `null` e o card mostra "—" com "Não foi possível carregar". A falha não afeta os outros cards nem dispara toast global.
- **Rationale**: Mesmo padrão já usado por Receita Por Caixa, Aging e Próximo Recebimento (erro isolado por bloco).

## R5 — Layout com 5 cards

- **Decision**: A seção Despesa passa a ocupar a largura inteira (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-5`) e a seção Resultado vai para a linha seguinte (mantendo seus 2 cards). O grid externo `lg:grid-cols-3` que colocava Despesa e Resultado lado a lado é removido.
- **Rationale**: Em 2/3 da largura, 5 cards ficariam com ~130 px em telas de 1440 px, cortando valores como "R$ 123.456,78" em `text-2xl`. Largura inteira dá ~200 px por card.
- **Alternatives considered**: Reduzir fonte/padding dos cards — inconsistente com o restante do Dashboard; manter lado a lado só em `2xl` — ainda apertado.

## R6 — Rótulo de origem

- **Decision**: Modo mês: "Recolhidos em {Mmm}/{AAAA}" (ex.: "Recolhidos em Set/2026"); modo só-ano: "Recolhidos de Dez/{A−1} a Nov/{A}". Abreviações de `MESES_NOME` já usadas no Dashboard.
- **Rationale**: Deixa explícito que o valor vem do mês anterior (FR-005) sem precisar de tooltip.
