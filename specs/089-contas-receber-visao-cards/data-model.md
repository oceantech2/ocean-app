# Data Model: Visão Líquido/Bruto e novos cards em Contas a Receber

Sem mudanças de banco. Modelos de exibição (frontend):

## VisaoReceita (existente, `utils/metaPeriodo.ts`)

`'liquido' | 'bruto'` — padrão `'liquido'`.

## ResumoReceber (resposta existente de `/nfs/resumo/total`)

| Campo | Tipo | Observação |
|---|---|---|
| total_bruto_pago / total_liquido_pago / qtd_pagas | number | status Recebida |
| total_bruto_pendente / total_liquido_pendente / qtd_pendentes | number | status Pendente |
| total_bruto_vencido / total_liquido_vencido / qtd_vencidas | number | status Vencida |

## CardResumoReceber (derivado)

| Campo | Tipo | Regra |
|---|---|---|
| chave | `'total' \| 'recebido' \| 'pendente' \| 'vencido'` | ordem fixa |
| rotulo | string | Receita Total, Recebido, Pendente, Vencido |
| valor | number | `valorPorVisao(liquido, bruto, visao)`; total = soma dos três |
| quantidade | number | total = soma das três quantidades |
