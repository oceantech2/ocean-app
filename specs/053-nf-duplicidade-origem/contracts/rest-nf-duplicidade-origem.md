# Contrato REST: NF — Duplicidade entre Origens

**Feature**: `053-nf-duplicidade-origem` | **Date**: 2026-09-06  
**Spec**: [spec.md](./spec.md) · **Modelo**: [data-model.md](../data-model.md)

> Prefixo existente `/api/nfs`. Estende o contrato da feature 013.

## Normalização

Em create, update (quando `numero` enviado), import e sync: `numero = numero.strip()` antes de validar/persistir. Sem outras normalizações.

## Criação

```http
POST /api/nfs
Authorization: Bearer <token>
Content-Type: application/json
```

Origem persistida: `manual`.

### Duplicidade mesma origem

**409 Conflict** — número já em outra NF (qualquer origem na prática, se já existir; mensagem de duplicidade quando a existente for `manual`, ou ver conflito abaixo se for `maggo`):

```json
{
  "detail": {
    "code": "NF_NUMERO_DUPLICADO",
    "message": "Já existe uma conta a receber com este número.",
    "nf_id": 42,
    "numero": "12345",
    "razao_social": "Cliente Exemplo",
    "origem_existente": "manual"
  }
}
```

### Conflito entre origens

**409 Conflict** — número já em NF de origem diferente da operação:

```json
{
  "detail": {
    "code": "NF_NUMERO_ORIGEM_CONFLITO",
    "message": "Este número já existe em outra origem (Maggo). Não é permitido cadastrar a mesma nota em duas origens.",
    "nf_id": 42,
    "numero": "12345",
    "razao_social": "Cliente Exemplo",
    "origem_existente": "maggo"
  }
}
```

- Não persiste o novo registro.
- Visualizador → **403** (inalterado).

> Na criação manual, se o número já estiver em Maggo → sempre `NF_NUMERO_ORIGEM_CONFLITO`. Se já estiver em Manual → `NF_NUMERO_DUPLICADO`.

## Atualização

```http
PUT /api/nfs/{id}
```

Quando o body incluir `numero` e o valor trimado já pertencer a **outro** id:

- Mesma origem da NF editada → `NF_NUMERO_DUPLICADO`
- Origem diferente da NF detentora → `NF_NUMERO_ORIGEM_CONFLITO`

Se `numero` omitido ou igual ao atual → sem checagem.

Campos `origem` e `maggo_id` continuam imutáveis.

## Importação XLSX

```http
POST /api/nfs/importar-xlsx
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

| Parte / query | Obrigatório | Descrição |
|---------------|-------------|-----------|
| `file` | sim | Arquivo `.xlsx` |
| `on_conflict` | condicional | `reject` \| `update` — obrigatório **somente** se houver conflitos de **mesma origem** (`manual`) |

Novos inserts: `origem=manual`.

### Classificação prévia

1. Separar `duplicado_arquivo` (013).
2. Para cada elegível, lookup por número:
   - existente `manual` → conflito **mesma origem** (lista `conflitos`)
   - existente `maggo` → **não** entra em `conflitos` do 422; será rejeitado no processamento com `motivo: conflito_origem`

### 422 — escolha ausente (só mesma origem)

```json
{
  "detail": {
    "code": "NF_IMPORT_ON_CONFLICT_REQUIRED",
    "message": "Há números já cadastrados na origem Manual. Informe on_conflict=reject ou on_conflict=update.",
    "conflitos": [
      { "linha": 5, "numero": "999", "nf_id": 7, "origem_existente": "manual" }
    ]
  }
}
```

Se houver **apenas** conflitos com Maggo (nenhum com Manual), **não** retornar 422; processar e rejeitar essas linhas.

### Resposta 200

```json
{
  "ok": 10,
  "atualizados": 2,
  "erros": [
    { "linha": 8, "numero": "100", "motivo": "duplicado_arquivo" },
    { "linha": 12, "numero": "999", "motivo": "duplicado_cadastro" },
    { "linha": 15, "numero": "888", "motivo": "conflito_origem", "origem_existente": "maggo", "nf_id": 3 }
  ]
}
```

- `on_conflict=update` **MUST NOT** atualizar NF com `origem=maggo`.
- `atualizados` conta só updates em NFs `manual`.

## Sync Maggo (efeito colateral do GET listagem / fluxos existentes)

Colisões de origem (maggo_id em manual, ou número em conflito com manual) → registro ignorado e listado em `X-Ocean-Maggo-Ignorados` (ou extensão equivalente do diagnóstico de sync). **MUST NOT** criar segundo registro nem sobrescrever a NF Manual.

## Corrida (IntegrityError)

Insert concorrente que viole UNIQUE em `numero` → mapear para **409** com o código adequado após lookup da NF existente (`NF_NUMERO_DUPLICADO` ou `NF_NUMERO_ORIGEM_CONFLITO` conforme `origem` vs operação).
