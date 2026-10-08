# Contrato de UI: Seção Despesa com Total de Despesas e Impostos Pagos

**Feature**: `085-dashboard-despesa-total-impostos`

## Ordem dos cards (esquerda → direita)

1. **Total de Despesas** — novo
2. Despesas Fixas — inalterado
3. Despesas Variáveis — inalterado
4. Despesas Pendentes — inalterado
5. **Impostos Pagos** — novo

## Card Total de Despesas

- Título: "Total de Despesas"
- Valor: moeda BRL, `text-2xl font-bold`, tom vermelho (mesma família dos cards de despesa)
- Texto auxiliar: "Fixas + Variáveis pagas no período"
- No modo só-ano: linha extra com o ano (mesmo `rotuloDespesaResultado` dos demais cards)

## Card Impostos Pagos

- Título: "Impostos Pagos"
- Valor: moeda BRL, `text-2xl font-bold`, tom neutro (mesmo do card "Impostos Recolhidos" da Receita); "—" quando indisponível
- Texto auxiliar:
  - Modo mês: "Recolhidos em {Mmm}/{AAAA}" (mês anterior ao filtro)
  - Modo só-ano: "Recolhidos de Dez/{A−1} a Nov/{A}"
  - Falha: "Não foi possível carregar" (vermelho)
- Não reage ao toggle Bruto/Líquido

## Layout

- Seção Despesa: largura inteira; grid `1` coluna (mobile) → `2` (`sm`) → `5` (`lg`)
- Seção Resultado: logo abaixo de Despesa, largura inteira, grid `1` → `2` (`sm`) — cards e regras inalterados

## Endpoint consumido (existente, sem alteração)

`GET /api/relatorios/receita-caixa?ano={ano}&mes={mes?}` → campo `impostos_recolhidos: number`
