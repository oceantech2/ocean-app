# Contrato REST: Contas a Pagar — campos Conta/Tipo

**Feature**: `045-contas-pagar-campos`  
**Base**: `/api/contas`  
**Papéis**: `admin` — POST/PUT; `visualizador` — GET/export.

## Schema `ContaPagar` (resposta)

Campos relevantes desta feature (demais inalterados):

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `caixa` | string \| null | Codigo da conta corrente; após migração, preenchido para todos |
| `tipo_despesa` | `"fixo"` \| `"variavel"` | Classificação da despesa |
| `fornecedor_id` | int \| null | FK opcional |
| `fornecedor_nome` | string \| null | Denormalizado na resposta |
| `fornecedor_ativo` | bool \| null | Para exibir “(inativo)” |

## POST `/api/contas/`

**Body** (campos novos/alterados):

```json
{
  "descricao": "Aluguel",
  "categoria": "adm_financeiro",
  "valor": 5000,
  "data_vencimento": "2026-09-10",
  "data_pagamento": null,
  "fornecedor_id": 12,
  "caixa": "corrente",
  "tipo_despesa": "fixo"
}
```

| Regra | Comportamento |
|-------|---------------|
| `tipo_despesa` omitido | Default `variavel` |
| `tipo_despesa` inválido | 422 |
| `caixa` omitido | Usa `codigo_padrao(db)` |
| `caixa` = investimento ou inativa | 400 |
| Sem corrente ativa no BD | 400 |
| `fornecedor_id` inválido/inativo | 400 |
| Pendente (`data_pagamento` null) | `pago=false`; **`caixa` persiste** |

## PUT `/api/contas/{id}`

Mesmas validações. Mudanças:

- Atualizar `caixa` **não** exige `pago=true`.
- Limpar `data_pagamento` → `pago=false`; **`caixa` permanece**.
- Marcar pago exige `caixa` válido (já gravado ou enviado no body).

## GET `/api/contas/`

Sem novos query params. Resposta inclui `tipo_despesa` e `caixa` em cada item.

## GET `/api/contas/exportar-xlsx`

Resposta: arquivo XLSX. Colunas de dados incluem:

| Coluna exportada | Fonte |
|------------------|--------|
| Conta corrente | `mapa_rotulos[caixa]` ou vazio |
| Tipo | Fixo / Variável a partir de `tipo_despesa` |

Demais colunas do template existente preservadas.

## POST `/api/contas/importar-xlsx`

Sem novas colunas na planilha. Registros criados recebem:

- `caixa` = `codigo_padrao(db)`
- `tipo_despesa` = `variavel`

## Colaboradores (fornecedor)

**GET `/api/colaboradores?ativo=true&limit=500`**

Retorna registros com `tipo=fornecedor` (filtro server-side já vigente). Usado para popular o select Fornecedor.

## Códigos de erro

| HTTP | Situação |
|------|----------|
| 400 | `caixa` inválido; fornecedor inválido; sem corrente ativa |
| 422 | `tipo_despesa` inválido; valor/categoria inválidos (já vigente) |
