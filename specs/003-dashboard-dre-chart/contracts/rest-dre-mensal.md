# Contract: GET /api/relatorios/dre-mensal

**Feature**: `003-dashboard-dre-chart`  
**Auth**: Bearer JWT (mesmo padrão dos demais `/api/relatorios/*`)

## Request

```
GET /api/relatorios/dre-mensal?ano={ano}
```

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `ano` | int | sim | Ano civil a agregar |

## Response 200

```json
{
  "ano": 2026,
  "dados": [
    {
      "mes": 1,
      "receita_bruta": 100000.0,
      "despesa": 40000.0,
      "impostos": 15000.0,
      "lucro": 45000.0
    }
  ]
}
```

- `dados` SEMPRE com **12** itens, `mes` de 1 a 12, ordem crescente.
- Valores numéricos (float); mês sem movimento → todos `0` (lucro `0`).
- `lucro` pode ser negativo.

## Regras de cálculo (normativas)

Ver [data-model.md](../data-model.md) e [research.md](../research.md):

1. Receita bruta = Σ `NF.valor_bruto` com `status=paga` e emissão no mês/ano.
2. Impostos = Σ `ContaPagar.valor` com `centro_custo=impostos` e vencimento no mês/ano (pago ou não; sem vencimento → ignorar).
3. Despesa = Σ demais centros **exceto** `impostos` (inclui `retirada_lucro`), mesma regra de vencimento.
4. Lucro = receita_bruta − despesa − impostos.

## Erros

| Código | Quando |
|--------|--------|
| 401 | Sem token / token inválido |
| 422 | `ano` ausente ou inválido |

## Client

```ts
relatoriosService.dreMensal(ano: number) =>
  api.get('/relatorios/dre-mensal', { params: { ano } })
```

UI aplica corte de eixo (ano corrente / anterior / futuro) — não faz parte deste contrato HTTP.
