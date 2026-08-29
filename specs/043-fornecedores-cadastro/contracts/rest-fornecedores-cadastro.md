# Contrato REST: cadastro unificado de fornecedores

**Feature**: `043-fornecedores-cadastro`  
Base: `http://localhost:8001/api`  
Auth: Bearer JWT (inalterado)

> A coleção REST permanece em `/colaboradores` (tabela legada). Semântica de negócio: **fornecedores**.

## `GET /colaboradores`

| Param | Default | Notas |
|-------|---------|-------|
| skip, limit | 0, 100 | Igual ao atual |
| ativo | omitido = todos | Igual ao atual |
| tipo | — | **Deprecado**. Se `fornecedor`, equivalente a listar todos. Se `colaborador`, tratar como `elegivel_equipe=true` (compat temporária) |
| elegivel_equipe | omitido = todos | `true` \| `false` — filtro para telas de RH |

**200**: lista de fornecedores.

```json
{
  "id": 1,
  "tipo": "fornecedor",
  "elegivel_equipe": true,
  "tipo_fornecedor": "fixo",
  "tipo_documento": "cpf",
  "documento": "12345678909",
  "nome": "Maria Silva",
  "cpf": "123.456.789-09",
  "razao_social": null,
  "telefone": "11999998888",
  "email": "maria@empresa.com",
  "pf_nome": null,
  "pf_cpf": null,
  "pf_endereco": null,
  "pf_data_nascimento": null,
  "cargo": "Analista",
  "salario": 5000,
  "data_nascimento": "1990-01-15",
  "ativo": true
}
```

## `GET /colaboradores/{id}`

**200**: objeto acima. **404**: não encontrado.

## `POST /colaboradores`

Admin. Body mínimo (fornecedor PF novo):

```json
{
  "nome": "Fornecedor Spot LTDA",
  "tipo_documento": "cpf",
  "documento": "12345678909",
  "tipo_fornecedor": "spot",
  "telefone": "11988887777",
  "email": "contato@exemplo.com"
}
```

Servidor define: `tipo=fornecedor`, `elegivel_equipe=false`.

Body fornecedor CNPJ:

```json
{
  "nome": "Empresa Exemplo",
  "tipo_documento": "cnpj",
  "documento": "12345678000199",
  "razao_social": "Empresa Exemplo LTDA",
  "tipo_fornecedor": "fixo",
  "pf_nome": "João Souza",
  "pf_cpf": "98765432100",
  "pf_endereco": "Rua A, 100",
  "pf_data_nascimento": "1985-03-20"
}
```

**400**:
- `tipo_fornecedor` ausente ou inválido
- CNPJ sem razão social ou PF incompleta/inválida
- CPF/CNPJ/documento duplicado em ativo
- `pf_cpf` duplicado em ativo
- E-mail inválido
- Tentativa de enviar `elegivel_equipe=true` no create (ignorado ou 400 — implementação força `false`)

**201**: objeto criado.

## `PUT /colaboradores/{id}`

Admin. Regras:

- `tipo` no body diferente de `fornecedor` → **400**
- `elegivel_equipe` imutável (ignorar ou **400** se divergir)
- Se registro `elegivel_equipe=true` e CPF: exige cargo, salário, data_nascimento no save
- Se `tipo_documento=cnpj`: exige PF completa no save
- CNPJ legado com PF vazia: **400** até preencher PF (listagem/contas não bloqueadas)

**200**: objeto atualizado.

## `DELETE /colaboradores/{id}`

Admin. Soft delete (`ativo=false`). Sem fluxo de desligamento obrigatório para não-legado.

## Import/export XLSX

Rotas existentes `/colaboradores/importar-xlsx` e export:

- Criam/atualizam `tipo=fornecedor`
- `tipo_fornecedor`: coluna opcional **Tipo** (`Fixo`/`Spot`); default `fixo`
- `elegivel_equipe=true` quando linha tem cargo + salário + nascimento válidos

## Contas a pagar — sem mudança de contrato

`fornecedor_id` continua opcional. Validação: id existe, `tipo=fornecedor`, ativo (ou já vinculado). **Não** valida PF completa.

## Códigos de erro relevantes

| Situação | HTTP | detail (exemplo) |
|----------|------|------------------|
| Tipo fornecedor ausente | 400 | Tipo é obrigatório |
| PF incompleta (CNPJ) | 400 | Preencha os dados da pessoa física |
| Documento duplicado | 400 | Documento já está em uso |
| PF CPF duplicado | 400 | CPF da pessoa física já está em uso |
