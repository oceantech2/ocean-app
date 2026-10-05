# Contrato: API interna do Proposal (alterações da 081)

Base: `{VITE_API_URL}/proposal`, com `Authorization: Bearer <token do Proposal>`. Só as diferenças em relação a [080/contracts/api-proposal.md](../../080-proposta-modelo-executive-search/contracts/api-proposal.md).

## POST `/propostas`

Corpo: o mesmo da 080, mais:

```json
{ "moeda": "USD" }
```

- `moeda`: `"BRL"` ou `"USD"`; opcional (ausente, `null` ou `""` → `"BRL"`). Normalizada com `strip().upper()`.
- `422 "Moeda inválida"` para qualquer outro valor.
- A validação do modelo vem antes ou depois da moeda indiferentemente; a primeira regra violada define a mensagem.

Resposta `201`: detalhe da proposta (abaixo), com `"moeda": "USD"`.

## PUT `/propostas/{id}`

- Proposta por modelo: `moeda` preenchida e diferente da atual → `422 "A moeda da proposta não pode ser alterada"` (sem gravar nada). Vazia, ausente ou igual → ignorada.
- Proposta simples: `moeda` ignorada.
- O restante (trava, `409`, diff, versão, histórico) segue a 079/080.

## GET `/propostas` (lista)

Cada item ganha:

```json
{ "moeda": "USD" }
```

`null` nas propostas simples.

## GET `/propostas/{id}` (detalhe)

Herda `moeda` do item. Nenhum outro campo novo.

## Exemplos de erro

| Chamada | Resposta |
|---|---|
| `POST` com `"moeda": "EUR"` | `422 {"detail": "Moeda inválida"}` |
| `PUT` em proposta `BRL` com `"moeda": "USD"` | `422 {"detail": "A moeda da proposta não pode ser alterada"}` |
