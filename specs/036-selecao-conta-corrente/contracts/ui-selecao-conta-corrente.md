# Contrato UI: Seleção de conta corrente

**Feature**: `036-selecao-conta-corrente`  
**Papéis**: `admin` escreve; `visualizador` lê.

## Contas a Receber / NFs (`NFs.tsx`, `/nfs`)

Uma tela cobre as duas menções da spec.

| Elemento | Comportamento |
|----------|----------------|
| Coluna **Conta corrente** | Nome da conta pelo `codigo`; `null` → “—”; legado `investimento` → “Conta investimento” |
| Formulário criar/editar | Select **Conta corrente** visível quando pagamento = Recebido (e no modal Recebido). Opções = correntes **ativas** pelo nome. Sem investimento. Inicial = padrão |
| Visualizador | Vê coluna e valor; select desabilitado / sem gravar |
| Exportação CSV/XLSX | Inclui coluna Conta corrente com o mesmo texto da tabela |

Campo visível **no ato de receber**, não só depois de já recebida.

## Contas a Pagar (`Contas.tsx`)

| Elemento | Comportamento |
|----------|----------------|
| Coluna **Conta corrente** | Igual Receber |
| Formulário e ação pagar | Select obrigatório ao marcar pago / criar já paga; opções = correntes ativas; inicial = padrão |
| Visualizador | Consulta; não altera |
| Exportação | Inclui a coluna |

## Fluxo de Caixa — Transferência

| Elemento | Comportamento |
|----------|----------------|
| Origem / Destino | Dois selects: correntes ativas (nome) + **Conta investimento** |
| Inverter | **Ausente** |
| Abertura | Origem = fluxo ativo. Destino = investimento se origem for corrente; destino = corrente padrão se origem for investimento |
| Visualizador | Sem botão Transferência |

Regras visíveis já vigentes: recusa origem = destino, valor ≤ 0, valor &gt; saldo visível da origem; toast; par ligado ao desfazer.

## Nomes na lista

Sempre o `nome` cadastrado da corrente, nunca um único rótulo “Corrente” para todas.
