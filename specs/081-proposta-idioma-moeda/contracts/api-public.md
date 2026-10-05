# Contrato: API pública da proposta (alterações da 081)

Base: `{VITE_API_URL}/public/propostas`. Sem autenticação. Só as diferenças em relação a [080/contracts/api-public.md](../../080-proposta-modelo-executive-search/contracts/api-public.md).

## GET `/{codigo}`

### Proposta por modelo pendente ou assinada

Corpo da 080, mais:

```json
{ "moeda": "USD" }
```

### Proposta por modelo cancelada ou expirada

Passa a incluir a moeda, para o cliente ver a mensagem no idioma da proposta. Nenhum outro dado é exposto:

```json
{
  "status": "expirada",
  "pode_assinar": false,
  "mensagem": "Esta proposta expirou. Entre em contato com a Ocean para receber uma nova.",
  "moeda": "USD"
}
```

A `mensagem` continua em português; o frontend usa o dicionário do idioma quando `moeda` = `USD`.

### Proposta simples

Sem mudança (nenhuma chave `moeda`, em qualquer status).

### Link inexistente

Sem mudança: `404`.

## POST `/{codigo}/assinar`

Sem mudança de contrato. As mensagens de erro do servidor continuam em português; o diálogo do modelo exibe a frase equivalente do dicionário (o `409` de versão desatualizada é reconhecido pelo prefixo `"Esta proposta foi atualizada"` do `detail`). O hash comparado inclui a moeda quando ela não for `BRL` ([data-model.md](../data-model.md) §4).
