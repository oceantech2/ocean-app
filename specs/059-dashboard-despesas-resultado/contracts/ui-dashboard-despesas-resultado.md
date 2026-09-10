# Contract: UI — Despesas & Resultado no Dashboard

**Feature**: `059-dashboard-despesas-resultado`  
**Página**: `frontend/src/pages/Dashboard.tsx`  
**Cálculo**: [calc-despesas-resultado.md](./calc-despesas-resultado.md)  
**Receitas**: `pipeline` (056/057) + `receitaCaixa` (058) + `visaoReceita` (057)

## Layout

1. Bloco **Despesa** (ou título equivalente): três cards — **Despesas Fixas**, **Despesas Variáveis**, **Despesas Pendentes**.
2. Bloco **Resultado**: dois cards lado a lado — **Resultado Competência**, **Resultado Caixa**.
3. MUST NOT manter o card único **Lucro** como leitura canônica desta seção.
4. MUST NOT alterar **Centro de Despesa** nem **Demonstrativo de Resultado** nesta feature.

## Despesas — exibição

| Card | Valor | Notas |
|------|-------|-------|
| Fixas | `despesasTotais.fixas` | Absoluto; ignora toggle |
| Variáveis | `despesasTotais.variaveis` | Absoluto; ignora toggle |
| Pendentes | `despesasTotais.pendentes` | Absoluto; ignora toggle; **não** entra no Resultado |

Rótulos auxiliares podem indicar “pagas no período” (pagamento) / “vencidas no período sem pagamento”.

## Resultado — exibição

| Card | Valor | Percentual |
|------|-------|------------|
| Resultado Competência | `calcularResultado(receita_comp, fixas+variaveis).valor` | `.pct` se não null |
| Resultado Caixa | `calcularResultado(receita_caixa, fixas+variaveis).valor` | `.pct` se não null |

MUST: cada card mostra **somente** valor + percentual (clarify Q5).  
MUST NOT: linhas de composição receita/despesas dentro do card.

Formatação: moeda existente (`fmt`); % com uma casa ou padrão já usado no Lucro legado; valor negativo com estilo de prejuízo (vermelho / equivalente atual).

## Interações

| Evento | Comportamento |
|--------|---------------|
| Toggle Bruto/Líquido | Despesas iguais; Resultados e % recalculam pela nova base de receita |
| Mudança mês/ano | Recarrega lista / totais no `carregarDados`; Resultado acompanha |
| Modo só-ano | Agrega ano inteiro (mesmas regras) |

## Papéis

`admin` e `visualizador`: mesma leitura; sem edição nestes cards.

## Loading / erro / vazio

- Loading: padrão Dashboard (`carregarDados`).
- Totais zero: exibir R$ 0,00.
- % indisponível: omitir ou “—” (não NaN / não 0% falso quando receita = 0).
- Se Pipeline ou Caixa falharem: Resultado correspondente em estado de erro/indisponível; despesas ainda podem exibir se a lista de Contas a Pagar OK.

## Fora deste contrato

- Aging, Alerta de Fluxo de Caixa
- Qualquer mudança em Centro de Despesa / Demonstrativo
