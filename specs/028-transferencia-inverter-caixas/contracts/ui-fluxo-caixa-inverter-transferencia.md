# Contrato UI: Inverter origem e destino da transferência

**Feature**: `028-transferencia-inverter-caixas` | **Date**: 2026-08-13  
**Spec**: [spec.md](../spec.md)  
**Base**: [ui-fluxo-caixa-transferencia.md](../../026-fluxo-caixa-transferencia/contracts/ui-fluxo-caixa-transferencia.md)  
**API**: inalterada ([rest-fluxo-transferencias.md](../../026-fluxo-caixa-transferencia/contracts/rest-fluxo-transferencias.md))

## Superfície

| Item | Valor |
|------|-------|
| Página | `frontend/src/pages/FluxoCaixa.tsx` |
| Rota | `/fluxo-caixa` |
| Escopo | Só o bloco origem/destino **dentro** do modal Transferência |
| Papéis | Admin vê o modal (026). Visualizador: sem Transferência, sem **Inverter** |

## Substituição no modal

**Remover**: os dois `<select>` de Origem e Destino (e qualquer lista equivalente).

**Exibir**:

| Elemento | Comportamento |
|----------|----------------|
| Rótulo Origem + texto | Nome do caixa atual (`Conta corrente` ou `Conta investimento`). Somente leitura. Clique **não** inverte. |
| Rótulo Destino + texto | O outro caixa. Somente leitura. Clique **não** inverte. |
| Controle **Inverter** | Botão com o texto **Inverter**. Uma ação: `origem` ↔ `destino`. |

O subtítulo “Saldo visível da origem: …” permanece e **deve** usar o caixa de origem **depois** da inversão (`saldoDaOrigem(transfForm.origem)`).

Valor, data, observação, Cancelar e Confirmar: iguais à 026.

## Estado ao abrir

Origem = fluxo ativo da página. Destino = a outra conta. Igual `abrirTransferencia` atual.

## Inverter

- Troca os dois papéis.
- **Não** limpa valor, data nem observação.
- **Não** chama API.
- **Não** fecha o modal.

## Confirmar

Payload e recusas iguais à 026, com o par **visível** no momento do clique (incluindo após Inverter).

## Fora deste contrato

- Alterar botão Transferência da barra, lista, Desfazer, card do fluxo ativo, CSV, tabela de saldos
- Novo endpoint
- Ícone sem o texto **Inverter** como único controle
