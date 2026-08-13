# Contrato de UI: Alertas de contas

**Feature**: `027-alertas-contas`

## Painel (topo, `Layout`)

- Indicador vermelho com `{total} alertas` só se `total > 0`.
- Dropdown **Alertas pendentes** lista só itens com `count > 0`.
- Ordem sugerida: NFs vencidas (existente); Contas a vencer em menos de 1 dia; Contas vencidas; Contas com nota fiscal pendente; Férias aguardando aprovação (existente).
- Clique fecha o dropdown e navega.

| Item | count | Navegação |
|------|-------|-----------|
| NFs vencidas | `nfsVencidas` | inalterado: status `vencida`, `/nfs` |
| Contas a vencer em menos de 1 dia | `contasVenceHoje` | `contasPago='false'`, `contasAlertaVencimento='hoje'`, `/contas` |
| Contas vencidas | `contasVencidas` | `contasPago='false'`, `contasAlertaVencimento='vencida'`, `/contas` |
| Contas com nota fiscal pendente | `nfsSemNumero` | `nfsSemNumero=true`, mês vazio, não arquivadas, `/nfs` |
| Férias aguardando aprovação | `feriasAguardando` | inalterado: `/ferias` |

Rótulo antigo **Contas atrasadas** não aparece.

## Contas a Pagar

Com `contasAlertaVencimento='hoje'`: só não pagas com vencimento = hoje.  
Com `'vencida'`: só não pagas com vencimento &lt; hoje.  
Contas pagas, futuras ou sem vencimento **não** aparecem.

O select Status pode refletir Pendente; o recorte de alerta é adicional (rótulo ou valor extra **Vence hoje** / **Vencida** aceitável). Ao escolher Todos/Pago/Pendente sem ser o recorte do alerta, limpar `contasAlertaVencimento`.

## Contas a Receber (`NFs`)

Com `nfsSemNumero=true`: só registros não arquivados, não cancelados, número ausente (inclui recebidas). Mês/ano não restringem o conjunto do alerta. Select Status mostra **Sem NF** (ou equivalente). Trocar para outro status limpa `nfsSemNumero`.

## Papéis

Admin e visualizador veem o mesmo painel. Visualizador permanece sem criar/editar/pagar.

## Falha de carga

Hook silencioso (já existente): layout segue; não inventar totais.
