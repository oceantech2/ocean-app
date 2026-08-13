# Data Model: Alertas de Contas

**Feature**: `027-alertas-contas` | **Date**: 2026-08-13

Sem entidades persistidas novas. Regras sobre registros já existentes.

## Conta a pagar (`contas_pagar`)

Atributos usados: `pago`, `data_vencimento`.

| Conjunto | Regra |
|----------|--------|
| Contas vencidas | `pago = false` **e** `data_vencimento` preenchida **e** `data_vencimento < hoje` (civil) |
| A vencer em menos de 1 dia | `pago = false` **e** `data_vencimento = hoje` |
| Fora dos dois | `pago = true`, **ou** sem `data_vencimento`, **ou** `data_vencimento > hoje` |

Invariante: os dois conjuntos são **disjuntos**. Uma conta nunca entra nos dois no mesmo dia.

## Conta a receber / NF (`nfs`)

Atributos usados: `numero`, `status`, `arquivada`.

| Conjunto | Regra |
|----------|--------|
| Nota fiscal pendente | `arquivada = false` **e** `status ≠ cancelada` **e** `numero` nulo, vazio ou só espaços |
| Fora | tem número (após trim), **ou** cancelada, **ou** arquivada |

`status = paga` **entra** se não houver número.

## Alerta in-app (visão, não tabela)

| Campo | Valores |
|-------|---------|
| chave | `contas_vencidas` \| `contas_vence_hoje` \| `nfs_sem_numero` (mais os já existentes `nfs_vencidas`, `ferias`) |
| rótulo | Contas vencidas; Contas a vencer em menos de 1 dia; Contas com nota fiscal pendente |
| quantidade | inteiro ≥ 0; item oculto se 0 |
| destino | `/contas` ou `/nfs` com filtro Zustand correspondente |

## Estado de filtro (Zustand `usePageFilters`)

| Campo | Valores | Efeito na lista |
|-------|---------|-----------------|
| `contasPago` | `''` \| `'true'` \| `'false'` | já existe; alerta força `'false'` |
| `contasAlertaVencimento` | `''` \| `'hoje'` \| `'vencida'` | recorte civil; `''` = sem recorte de alerta |
| `nfsSemNumero` | boolean | se true, lista só ativas sem número; ignora o status paga/pendente/vencida |

## Transições

```text
Dia D, conta não paga vence em D     → conjunto "hoje"
Virada D → D+1, ainda não paga       → conjunto "vencidas"
Usuário paga                         → sai dos dois
Usuário informa número na NF         → sai de "sem número"
Usuário cancela ou arquiva a NF      → sai de "sem número"
```
