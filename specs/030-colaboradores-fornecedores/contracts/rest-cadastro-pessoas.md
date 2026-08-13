# Contrato REST: cadastro e vínculo de fornecedor

**Feature**: `030-colaboradores-fornecedores`  
Base: `http://localhost:8001/api`  
Auth: Bearer JWT (como as demais rotas)

## Cadastro — `/colaboradores`

Coleção única. Discriminador `tipo`.

### `GET /colaboradores`

Query:

| Param | Default | Notas |
|-------|---------|-------|
| skip, limit | 0, 100 | iguais aos atuais |
| ativo | omitido = todos | igual ao atual |
| tipo | **`colaborador`** | `colaborador` \| `fornecedor`. Sem o param, RH não vê fornecedor |

200: lista de objetos cadastro.

### `GET /colaboradores/{id}`

200: objeto cadastro (qualquer tipo). 404 se não existir.

### `POST /colaboradores`

Admin. Body (campos relevantes):

```json
{
  "tipo": "colaborador",
  "tipo_documento": "cpf",
  "documento": "12345678909",
  "razao_social": null,
  "nome": "Maria Silva",
  "telefone": "11988887777",
  "email": "maria@empresa.com",
  "cargo": "Analista",
  "salario": 5000,
  "data_nascimento": "1990-01-15",
  "observacao": null
}
```

Fornecedor: `"tipo": "fornecedor"`; cargo/salario/data_nascimento omitidos; se `tipo_documento=cnpj`, `razao_social` obrigatória.

400: documento inválido, CNPJ sem razão social, e-mail malformado, duplicidade ativo+tipo+documento, colaborador sem campos de RH.

201/200: objeto cadastro. `tipo` gravado não muda depois.

### `PUT /colaboradores/{id}`

Admin. Mesmas regras de documento/contato. Se o body trouxer `tipo` diferente → **400**. Demais campos de RH só aplicáveis se o registro for colaborador.

### `DELETE /colaboradores/{id}`

Admin. Soft delete (`ativo=false`). Colaborador: comportamento atual de desligamento. Fornecedor: inativa sem exigir data de desligamento.

Import/export xlsx inalterados no contrato de arquivo: operam só registros `tipo=colaborador` e chave CPF.

## Objeto cadastro (resposta)

```json
{
  "id": 1,
  "tipo": "fornecedor",
  "tipo_documento": "cnpj",
  "documento": "12345678000199",
  "cpf": "12.345.678/0001-99",
  "razao_social": "Fornecedor Exemplo LTDA",
  "nome": "Fornecedor Exemplo",
  "telefone": "1133334444",
  "email": "contato@exemplo.com",
  "cargo": null,
  "salario": null,
  "data_nascimento": null,
  "ativo": true,
  "observacao": null
}
```

`cpf` na resposta: documento formatado (compatibilidade com a UI/export atuais).

## Contas a pagar — `/contas`

### Create / Update

Campo opcional `fornecedor_id` (inteiro ou `null` para limpar).

400 se o id não for fornecedor ativo (novo vínculo).

### List / Get

Além dos campos atuais:

| Campo | Tipo |
|-------|------|
| fornecedor_id | number \| null |
| fornecedor_nome | string \| null |
| fornecedor_ativo | boolean \| null |

Calendário consome a listagem já usada (`contasService.listar`); não precisa de endpoint novo.

## Papéis

| Ação | admin | visualizador |
|------|-------|----------------|
| CRUD cadastro | sim | não |
| Ver cadastro / contato | sim | sim |
| Vincular fornecedor na conta | sim | não |
| Ver fornecedor na conta e no calendário | sim | sim |
