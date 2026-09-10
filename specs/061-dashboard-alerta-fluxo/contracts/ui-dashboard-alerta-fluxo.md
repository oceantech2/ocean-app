# Contract: UI — Alerta de Fluxo de Caixa (Dashboard)

**Feature**: `061-dashboard-alerta-fluxo`  
**Superfície**: Dashboard Financeiro — banner no **topo** + controle de limiar (`admin`)

## Objetivo

Alertar quando a parcela não recebida do fechamento do período supera o limiar; mostrar próximo recebimento e Aging em atenção.

## Layout (MUST)

1. **Banner âmbar** no topo do conteúdo do Dashboard (acima dos cards), **somente** quando `pctDisponivel && pctCalculado > limiar` na base do toggle (**precisão completa**; arredondamento visual MUST NOT decidir).
2. Conteúdo do banner (quando visível):
   - **% não recebida** (exibição pode arredondar a 1 casa; decisão usa valor bruto)
   - **Próximo recebimento**: data + valor na base do toggle, **ou** “sem próximo / sem previsão”, **ou** “indisponível”
   - **Aging em atenção**: valor na base do toggle, **ou** “indisponível”
3. **Sem** botão fechar/dismiss.
4. **Controle de limiar** (só `admin`): sempre visível no Dashboard (independente do banner), separado da Configuração do Período (meta + alíquota); aceita só **inteiros** 1–100. `visualizador` não vê o controle.

## Estados

| Estado | Comportamento |
|--------|---------------|
| `% ≤ limiar` ou `% indisponível` | Banner oculto |
| `% > limiar` | Banner visível |
| Pipeline falhou | Banner oculto (sem %) |
| Aging falhou + banner visível | Aging em atenção = “indisponível” (não R$ 0) |
| Próximo falhou + banner visível | Próximo = “indisponível” (não R$ 0) |
| Próximo 200 com `encontrado: false` | “sem próximo / sem previsão” (não é falha) |
| Toggle Bruto/Líquido | Recalcula % e valores; pode mostrar/ocultar banner |
| Mudança mês/ano | Recalcula % do período; próximo/Aging globais |
| Limiar inválido no form (decimal, ≤0, >100) | Feedback + não salva |
| PUT limiar OK | Atualiza limiar local e reaplica regra do banner |

## Interações

- Banner: somente leitura.
- Limiar: editar/salvar só `admin`.
- Mesmos números do banner para `admin` e `visualizador`.

## Fora desta UI

- Drill-down para listagens
- Notificações e-mail/push
- Campo limiar dentro do modal/form de Configuração do Período
- Edição do limiar em Configurações (usuários)
