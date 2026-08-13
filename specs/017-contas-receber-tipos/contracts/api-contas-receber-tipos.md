# Contrato API: Contas a Receber — Novos nomes dos tipos

**Feature**: `017-contas-receber-tipos` | **Date**: 2026-08-12  
**Spec**: [spec.md](../spec.md) · **Modelo**: [data-model.md](../data-model.md)

> Sem prefixo novo. Ajusta `tipo` / `tipo_fechamento` e o relatório de mix. Maggo stub permanece no payload antigo.

## Valores oficiais

`retainer` | `sucesso` | `parcelamento`

Nomes visíveis (UI/e-mail/export): **Retainer**, **Sucesso**, **Parcelamento**.

`tipo_abertura_fechamento` **não** faz parte da classificação oficial. Em respostas, pode vir `null`. Create/update manuais não precisam enviá-lo.

## Contas a receber — criação

```http
POST /api/nfs
Authorization: Bearer <token admin>
Content-Type: application/json
```

```json
{
  "razao_social": "Cliente Exemplo LTDA",
  "valor_bruto": 10000.0,
  "valor_liquido": 8500.0,
  "data_emissao": "2026-08-01",
  "data_vencimento": "2026-08-31",
  "tipo": "retainer"
}
```

| `tipo` | Gravado | Nome visível |
|--------|---------|--------------|
| `retainer` | `retainer` | Retainer |
| `sucesso` | `sucesso` | Sucesso (ex-fechamento) |
| `parcelamento` | `parcelamento` | Parcelamento (ex-sucesso) |
| ausente / outro | **422** | — |

Demais regras (NF opcional, Caixa, 403 visualizador) inalteradas.

## Contas a receber — atualização

```http
PUT /api/nfs/{id}
```

- Origem **manual**: pode enviar `tipo` oficial; `tipo_abertura_fechamento` ignorado ou forçado a `null`.
- Origem **Maggo**: `tipo` permanece campo de negócio somente leitura (422 se tentar alterar).

## Merge Maggo (stub)

Payload de entrada (inalterado):

```json
{
  "tipo": "retainer",
  "tipo_abertura_fechamento": "fechamento"
}
```

| Entrada Maggo | `nfs.tipo` gravado |
|---------------|-------------------|
| `retainer` + `abertura` ou subtipo ausente | `retainer` |
| `retainer` + `fechamento` | `sucesso` |
| `sucesso` | `parcelamento` |

Resposta de listagem após merge: `tipo` oficial, `tipo_abertura_fechamento`: `null`.

## DH

```http
POST /api/dh
```

```json
{
  "empresa": "Cliente Exemplo LTDA",
  "posicao": "Engenheiro",
  "tipo_fechamento": "parcelamento",
  "colaborador_preencheu": "Ana"
}
```

`assunto` gerado (exemplo): `DH :: Cliente Exemplo LTDA :: Engenheiro :: Parcelamento`

| `tipo_fechamento` | Sufixo do assunto |
|-------------------|-------------------|
| `retainer` | `Retainer` |
| `sucesso` | `Sucesso` |
| `parcelamento` | `Parcelamento` |

DHs já existentes: `assunto` **não** é atualizado no boot.

## Relatório — mix

```http
GET /api/relatorios/fechamentos-por-tipo?ano=2026
```

**Antes**: `{ "retainer": n, "sucesso": m, "total": n+m }`  
**Depois**:

```json
{
  "retainer": 4,
  "sucesso": 2,
  "parcelamento": 5,
  "total": 11
}
```

`total` = soma das três chaves. Contagem sobre `nfs.tipo` oficial (não agregar abertura+fechamento).

## Fora deste contrato

- Mudança do payload do stub Maggo.
- Reescrita de `assunto` antigo ou de auditoria.
- Novos endpoints.
