# Contrato REST (Proposal): imposto nas propostas

## 1. Imposto vigente

`GET /api/proposal/propostas/imposto-vigente` — qualquer usuário autenticado no Proposal

**200**

```json
{ "percentual": "18.75", "ano": 2026, "mes": 10, "origem": "mes" }
```

| `origem` | Significado | `ano`/`mes` |
|----------|-------------|-------------|
| `mes` | cadastrado para o mês corrente (São Paulo) | mês corrente |
| `anterior` | último mês cadastrado antes do corrente | mês de onde veio |
| `padrao` | nenhum mês cadastrado; 18,75 | `null` |

## 2. Criação e edição (`POST /` e `PUT /{id}`)

- Payload **inalterado**: o cliente não envia percentual (qualquer valor enviado é ignorado).
- Propostas por modelo gravam `imposto_percentual` = imposto vigente no momento do salvamento.
- Edição: se o imposto vigente difere do gravado, entra em `alteracoes` como `{"campo": "imposto_percentual", "anterior": "19.55", "novo": "18.75"}` (anterior `"19.55"` quando a coluna era nula) e gera nova versão, mesmo sem outras mudanças.

## 3. Serialização

- Detalhe (`GET /{id}`, respostas de `POST`/`PUT`): novo campo `imposto_percentual: string | null`.
- Pública (`GET /api/public/propostas/{codigo}`) para propostas por modelo disponíveis: novo campo `imposto_percentual: string | null` (`null` → página exibe 19,55%).
