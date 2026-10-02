# Quickstart de Validação: Status "Cancelada" em Contas a Receber

**Feature**: `078-contas-receber-cancelada` | Spec: [spec.md](./spec.md) | Contratos: [contracts/api.md](./contracts/api.md)

O projeto não tem testes automatizados; a validação é manual, com conferência de totais na interface e no banco.

## Pré-requisitos

```bash
docker compose up -d                 # API 8001, PostgreSQL 5433, Redis 6380
docker logs ocean_backend -f         # confirmar que _migrar() rodou sem erro
cd frontend && npm run dev           # http://localhost:5193
```

Usuários de desenvolvimento: `admin` e `visualizador` (senhas no `CLAUDE.md`).

Confirmar a coluna nova:

```bash
docker exec ocean_postgres psql -U ocean -d ocean_db -c "\d nfs" | grep situacao_definida_ocean
```

## Massa de teste

Em um mesmo mês, criar como `admin` em Contas a Receber:

- **A**: Pendente, bruto 10.000, com 2 comissões (marcar uma como liberada e paga em Comissões)
- **B**: Recebida, bruto 5.000, com data de pagamento e caixa
- **C**: Pendente, bruto 3.000 (controle; nunca cancelada)

Anotar os valores de referência do mês: cards de Contas a Receber, Dashboard (pipeline, Por Caixa, DRE, metas), página Impostos, totais de Comissões e saldo do Fluxo de Caixa.

## Cenários

| # | Passos | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Editar **A**, escolher Cancelada, salvar | Confirmação com aviso de impacto; recusar → nada muda | US4, FR-003 |
| 2 | Repetir e confirmar | Badge "Cancelada"; aparece no filtro Status = Cancelada | US1, FR-004 |
| 3 | Conferir os totais anotados | Receita bruta/líquida e imposto do mês caem exatamente no valor de **A**; **C** inalterada | US2, FR-006, SC-002 |
| 4 | Abrir Comissões | As 2 comissões de **A** (inclusive a paga) aparecem esmaecidas com "Conta cancelada" e fora de todos os totais | FR-007, FR-007a |
| 5 | Editar **A** cancelada mudando só a observação/vencimento e salvar | Continua Cancelada e fora dos totais | FR-005 (D2) |
| 6 | Editar **B** (Recebida), tentar Cancelada | Opção bloqueada com orientação "Volte a conta para Pendente…"; via API: 409 `NF_CANCELAR_RECEBIDA` | US1 cen. 5, FR-015 |
| 7 | **B** → Pendente, salvar; depois Cancelada, salvar | Cancelamento aceito; **B** some do Fluxo de Caixa | US1 cen. 6, SC-007 |
| 8 | Reativar **A** como Pendente | Totais e comissões voltam exatamente aos valores de referência | US3, FR-010, SC-004 |
| 9 | Reativar como Recebida sem data | Bloqueia com "Informe a data de pagamento para marcar como recebido." | FR-011 |
| 10 | Login `visualizador`, abrir **A** | Status visível, sem edição | FR-002, SC-006 |
| 11 | **A** cancelada com vencimento passado | Não aparece como vencida, nem no contador de vencidas, nem em `GET /alertas` | FR-013, SC-005 |

## Importação de planilha

Preparar um XLSX no modelo atual com linhas (mesmo número de NF):

| # | Situação no Ocean | Linha na planilha | Esperado | Spec |
|---|---|---|---|---|
| 12 | Conta Recebida | Cancelada (razão social vazia) | Conta inalterada; painel lista "Recebida no Ocean, cancelada na planilha" | FR-016 |
| 13 | Conta cancelada pelo `admin` | Ativa | Campos atualizados, continua Cancelada | FR-014 |
| 14 | Conta reativada pelo `admin` | Cancelada | Conta inalterada; painel lista "Reativada no Ocean, cancelada na planilha" | FR-014 |
| 15 | Conta Pendente nunca tocada | Cancelada | Vira Cancelada e mantém o nome do cliente | FR-008, D6 |

## Canceladas antigas com recebimento

Verificar se existem (local e produção):

```sql
SELECT id, numero, razao_social, data_pagamento, caixa
FROM nfs
WHERE status = 'CANCELADA' AND data_pagamento IS NOT NULL AND excluida_em IS NULL;
```

Para simular localmente: `UPDATE nfs SET status = 'CANCELADA' WHERE id = <id de uma Recebida>;`

| # | Passos | Esperado | Spec |
|---|---|---|---|
| 16 | Abrir a listagem | Aviso "Cancelada com recebimento — revisar" na linha; fora dos totais e do Fluxo de Caixa | FR-017, SC-008 |
| 17 | Reativar como Recebida | Aviso some; volta aos totais e ao Fluxo de Caixa | FR-017 |

## Conferência no banco (opcional)

Receita válida do mês, para comparar com os cards:

```sql
SELECT SUM(valor_bruto) bruto, SUM(valor_liquido) liquido, SUM(valor_imposto) imposto
FROM nfs
WHERE status <> 'CANCELADA' AND excluida_em IS NULL
  AND data_emissao BETWEEN '2026-10-01' AND '2026-10-31';
```

Comissões válidas:

```sql
SELECT SUM(b.valor_bonus)
FROM bonus b LEFT JOIN nfs n ON n.id = b.nf_id
WHERE b.nf_id IS NULL OR (n.status <> 'CANCELADA' AND n.excluida_em IS NULL);
```
