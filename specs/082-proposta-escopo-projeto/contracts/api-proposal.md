# Contrato: API interna do Proposal (alterações da 082)

Base: `{VITE_API_URL}/proposal`, com `Authorization: Bearer <token do Proposal>`. Só as diferenças em relação a [081/contracts/api-proposal.md](../../081-proposta-idioma-moeda/contracts/api-proposal.md) e [080/contracts/api-proposal.md](../../080-proposta-modelo-executive-search/contracts/api-proposal.md).

## POST `/propostas`

Corpo: o mesmo da 081, mais:

```json
{ "projeto_escopo": "<p>Neste projeto, a Ocean irá:</p><ol><li>…</li></ol>" }
```

- `projeto_escopo`: string HTML ou `null`; opcional. Ausente, `null`, `""` ou sem texto visível → gravado como `null`.
- O valor é normalizado por `normalizar_escopo` ([data-model.md](../data-model.md) §2) antes de gravar; a resposta devolve a forma canônica, que pode diferir do enviado (tags removidas, `<p>` desembrulhado em itens, níveis achatados).
- `422 {"detail": "Escopo do projeto deve ter no máximo 5.000 caracteres"}` acima do limite de texto ou com entrada bruta acima de 100.000 caracteres.
- A proposta é criada com `modelo_versao: 2`.

Resposta `201`: detalhe da proposta (abaixo).

## PUT `/propostas/{id}`

- Proposta por modelo: `projeto_escopo` segue as mesmas regras do POST. Como nos demais campos do modelo, o corpo representa o estado completo: ausente ou `null` **apaga** o escopo.
- Mudança no escopo canônico gera item `projeto_escopo` no histórico (`anterior`/`novo` em HTML canônico ou `null`); enviar o mesmo escopo, mesmo com formatação equivalente diferente (ex.: com `<p>` dentro de `<li>`), não gera alteração.
- Toda edição salva grava `modelo_versao: 2` (já acontece via `validar_modelo`); a troca de versão não aparece no histórico.
- Proposta simples: `projeto_escopo` ignorado.
- Demais regras (trava, `409`, diff, versão, moeda fixa) seguem a 079/080/081.

## GET `/propostas` (lista)

Sem mudança (o escopo não aparece na lista).

## GET `/propostas/{id}` (detalhe)

Ganha:

```json
{ "projeto_escopo": "<p>…</p>" }
```

`null` quando sem escopo e nas propostas simples. `modelo_versao` (já existente) mostra `1` ou `2`.

## Exemplos

| Chamada | Resposta |
|---|---|
| `POST` com `"projeto_escopo": "<p onclick=\"x()\">Oi <b>já</b></p>"` | `201`, `"projeto_escopo": "<p>Oi <strong>já</strong></p>"` |
| `POST` com `"projeto_escopo": "<p> </p>"` | `201`, `"projeto_escopo": null` |
| `POST` com 5.001 caracteres de texto | `422 {"detail": "Escopo do projeto deve ter no máximo 5.000 caracteres"}` |
| `PUT` sem `projeto_escopo` numa proposta com escopo | `200`, `"alterada": true`, histórico com `projeto_escopo` → `null` |
