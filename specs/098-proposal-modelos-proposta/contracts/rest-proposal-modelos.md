# Contrato REST: Modelos de proposta

Prefixo: `/api/proposal/modelos` · Autenticação: token do Proposal (`Authorization: Bearer`).

## Objeto `ModeloProposta`

```json
{
  "id": 3,
  "divisao": "outplacement-development",
  "divisao_nome": "Development & Outplacement",
  "nome": "Outplacement executivo — 3 meses",
  "idioma": "pt-BR",
  "moeda": "BRL",
  "setor": null,
  "projeto_escopo": "<p>…</p>",
  "projetos": [{ "nome": "Outplacement", "investimentos": [{ "tipo": "valor-fechado", "taxa_tipo": "valor", "taxa": "30000.00", "entrada": 100 }] }],
  "shortlist": null,
  "sla": null,
  "garantia": null,
  "validade_dias": 30,
  "criado_por_usuario": "admin",
  "criado_em": "2026-10-20T19:00:00",
  "atualizado_por_usuario": null,
  "atualizado_em": null
}
```

## `GET /` — listar (todos os usuários do Proposal)

Query: `divisao` (opcional, divisão válida), `nome` (opcional, contém, sem diferenciar maiúsculas, literal), `page` (≥1, padrão 1), `page_size` (1–200, padrão 100).

Resposta 200: `{ "items": [ModeloProposta], "total": n, "page": 1, "page_size": 100 }`, ordenado por divisão e nome.

Erros: 422 divisão inválida.

## `GET /{id}` — obter (todos)

200 `ModeloProposta` · 404 "Modelo não encontrado".

## `POST /` — criar (admin)

Corpo `ModeloPropostaIn`: `divisao`, `nome`, `idioma`, `moeda`, `setor`, `projeto_escopo`, `projetos`, `shortlist`, `sla`, `garantia`, `validade_dias`.

201 `ModeloProposta` · 403 não admin · 409 nome repetido na divisão · 422 validação (mesmas mensagens da proposta).

## `PUT /{id}` — editar (admin)

Mesmo corpo do POST. 200 `ModeloProposta` · 403 · 404 · 409 · 422.

## `DELETE /{id}` — excluir (admin)

204 · 403 · 404.

Auditoria (ERP): `criar`/`editar`/`excluir`, entidade `ModeloProposta`, descrição `"<divisão> — <nome>"`.
