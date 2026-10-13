# Contrato de API: `POST /api/contas` com recorrência

**Auth**: `require_admin` (inalterado)

## Request (JSON)

```json
{
  "descricao": "Aluguel",
  "categoria": "adm_financeiro",
  "valor": 5000,
  "data_vencimento": "2026-11-10",
  "tipo_despesa": "fixo",
  "repetir_meses": 3
}
```

`repetir_meses` é opcional. Ausente ou `null` = comportamento atual (uma conta).

## Respostas

| Status | Quando | Corpo |
|---|---|---|
| 201 | Sucesso | `ContaPagarResponse` da conta **original** |
| 422 | `repetir_meses` fora de 1–24 ou não inteiro | erro de validação Pydantic |
| 422 | `repetir_meses` sem `data_vencimento` | `{"detail": "Informe o vencimento para repetir a conta nos próximos meses"}` |

Em qualquer erro, nenhuma conta é criada.

## Efeitos

- 1 + N linhas em `contas_pagar`; N cópias pendentes, sem comprovante
- 1 + N registros de auditoria `criar` / `ContaPagar`; cópias com sufixo "(recorrência k/N)" na descrição da auditoria
