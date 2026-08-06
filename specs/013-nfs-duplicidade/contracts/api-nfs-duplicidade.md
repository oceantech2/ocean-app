# Contrato API: Duplicidade de NFs / Contas a Receber

**Feature**: `013-nfs-duplicidade` | **Date**: 2026-08-06  
**Spec**: [spec.md](./spec.md) · **Modelo**: [data-model.md](../data-model.md)

> Prefixo existente `/api/nfs`.

## Normalização

Em create, update (quando `numero` enviado) e import: aplicar `numero = numero.strip()` antes de validar/persistir.

## Criação

```http
POST /api/nfs
Authorization: Bearer <token>
Content-Type: application/json
```

(Endpoint reabilitado no contexto 012/013 para criação manual.)

### Conflito de número

**409 Conflict**

```json
{
  "detail": {
    "code": "NF_NUMERO_DUPLICADO",
    "message": "Já existe uma conta a receber com este número.",
    "nf_id": 42,
    "numero": "12345",
    "razao_social": "Cliente Exemplo"
  }
}
```

- Não persiste o novo registro.
- Visualizador → **403** (inalterado).

## Atualização

```http
PUT /api/nfs/{id}
```

Quando o body incluir `numero` (registros manuais) e o valor trimado já pertencer a **outro** id → **mesmo 409** com `nf_id` da NF detentora do número.

Se `numero` omitido ou igual ao atual → sem checagem de duplicidade por número.

## Importação XLSX

```http
POST /api/nfs/importar-xlsx
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

| Parte / query | Obrigatório | Descrição |
|---------------|-------------|-----------|
| `file` | sim | Arquivo `.xlsx` |
| `on_conflict` | condicional | `reject` \| `update` — obrigatório se houver números já no cadastro |

### Resposta de sucesso (200)

```json
{
  "ok": 10,
  "atualizados": 2,
  "erros": [
    { "linha": 8, "numero": "100", "motivo": "duplicado_arquivo" },
    { "linha": 12, "numero": "999", "motivo": "duplicado_cadastro" }
  ]
}
```

- `ok`: inserts novos.
- `atualizados`: updates quando `on_conflict=update` (0 se `reject`).
- Linhas `duplicado_arquivo`: sempre rejeitadas (primeira ocorrência do número no arquivo é a que segue).

### Escolha ausente com conflitos no cadastro

**422 Unprocessable Entity** (ou 400), exemplo:

```json
{
  "detail": {
    "code": "NF_IMPORT_ON_CONFLICT_REQUIRED",
    "message": "Há números já cadastrados. Informe on_conflict=reject ou on_conflict=update.",
    "conflitos": [
      { "linha": 5, "numero": "999", "nf_id": 7 }
    ]
  }
}
```

UI deve apresentar a escolha do lote e reenviar o mesmo arquivo com `on_conflict`.

### Parser

- **MUST NOT** gerar sufixos `-2`, `-3` no `numero`.
- Números repetidos no arquivo → primeira elegível; demais em `erros` com `duplicado_arquivo`.

## Corrida (IntegrityError)

Qualquer insert concorrente que viole UNIQUE em `numero` → mapear para **409** no mesmo formato `NF_NUMERO_DUPLICADO` (com lookup do registro existente).
