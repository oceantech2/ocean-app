# Contrato: API interna do Proposal (`/api/proposal/propostas`)

Autenticação e permissões sem mudança (specs 077 e 079).

## POST `/` — criar proposta por modelo

Corpo (formato novo, os dois modelos):

```json
{
  "modelo": "outplacement-development",
  "idioma": "pt-BR",
  "moeda": "BRL",
  "cliente_nome": "Arxen",
  "data_proposta": "2026-10-24",
  "setor": "infraestrutura",
  "consultor_nome": "Fábio Porto D'Ave",
  "consultor_cargo": "Managing Partner",
  "consultor_telefone": "+55 21 97554-0224",
  "consultor_email": "fabio@oceantalentsolutions.com",
  "projeto_escopo": "<p>Neste projeto, a Ocean irá:</p><ol>…</ol>",
  "projetos": [
    {
      "nome": "Posição 1",
      "investimentos": [
        { "tipo": "retainer", "taxa_tipo": "percentual", "taxa": "15", "entrada": 40 },
        { "tipo": "sucesso", "taxa_tipo": "percentual", "taxa": "18", "entrada": null },
        { "tipo": "valor-fechado", "taxa_tipo": "valor", "taxa": "50000", "entrada": 50 }
      ]
    },
    { "nome": "Posição 2", "investimentos": [ { "tipo": "retainer", "taxa_tipo": "percentual", "taxa": "15", "entrada": 40 } ] }
  ],
  "shortlist": "3 a 5 candidatos",
  "sla": "5 a 10 dias úteis",
  "garantia": "4 meses",
  "validade_dias": 30
}
```

- `modelo`: `executive-search` ou `outplacement-development` (422 "Modelo de proposta inválido").
- `idioma`: `pt-BR` (padrão quando ausente) ou `en-US` (422 "Idioma inválido").
- `moeda`: `BRL` (padrão) ou `USD`.
- Campos antigos `projeto_nome`, `investimentos`, `garantia_meses` e `validade` são ignorados nas propostas por modelo.
- Validações e mensagens: [data-model.md](../data-model.md) §2 a §4.

Resposta `201`: detalhe da proposta (ver GET).

## PUT `/{id}` — editar

Mesmo corpo do POST. Regras adicionais:

- `modelo`, `moeda` ou `idioma` diferentes dos atuais → 422 ("O modelo da proposta não pode ser alterado", "A moeda da proposta não pode ser alterada", "O idioma da proposta não pode ser alterado").
- Sem alteração efetiva → `{ ..., "alterada": false }`.
- Com alteração → nova versão, status `aguardando`, histórico com os campos de [data-model.md](../data-model.md) §6.
- Regras de status da spec 079 sem mudança.

## GET `/{id}` — detalhe

Campos novos ou alterados (além dos atuais):

```json
{
  "modelo": "outplacement-development",
  "modelo_nome": "Development & Outplacement",
  "idioma": "pt-BR",
  "moeda": "BRL",
  "projeto_nome": "Posição 1",
  "projetos_total": 2,
  "projetos": [ { "nome": "Posição 1", "investimentos": [ … ] }, { "nome": "Posição 2", "investimentos": [ … ] } ],
  "shortlist": "3 a 5 candidatos",
  "sla": "5 a 10 dias úteis",
  "garantia": "4 meses",
  "validade_dias": 30,
  "validade": "2026-11-23",
  "garantia_meses": null,
  "investimentos": null
}
```

- `projeto_nome`: nome do primeiro projeto no formato novo; o nome único no formato antigo.
- `projetos_total`: quantidade de projetos (1 no formato antigo).
- `projetos`: `null` no formato antigo (ES v1/v2 assinadas/canceladas), que continuam com `projeto_nome`, `investimentos` e `garantia_meses`.
- Histórico: `alteracoes[].campo` pode ser `projeto.<n>` (valores `{nome, investimentos}` ou `null`), `shortlist`, `sla`, `garantia_texto`, `validade_dias`.

## GET `/` — lista

Cada item ganha `idioma` e `projetos_total`; `projeto_nome` segue a regra do detalhe.
