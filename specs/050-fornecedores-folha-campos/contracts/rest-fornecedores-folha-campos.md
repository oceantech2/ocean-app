# Contrato REST: fornecedores — PF parcial, salário, datas e folha

**Feature**: `050-fornecedores-folha-campos`  
Base: `http://localhost:8001/api`  
Auth: Bearer JWT (inalterado)

> Coleção permanece em `/colaboradores`. Sem endpoint novo para Total da folha nesta feature.

## Alterações em `POST /colaboradores` e `PUT /colaboradores/{id}`

### Pessoa física (quando `tipo_documento = cnpj`)

| Campo | Antes (043) | Depois (050) |
|-------|-------------|--------------|
| `pf_nome` | obrigatório | **obrigatório** |
| `pf_endereco` | obrigatório | **obrigatório** |
| `pf_cpf` | obrigatório | **opcional**; se enviado, validar + unicidade ativos |
| `pf_data_nascimento` | obrigatório | **opcional**; se enviado, ≤ hoje |

**400** se faltar nome/endereço PF: mensagem clara (ex.: dados da pessoa física incompletos).  
**400** se `pf_cpf` inválido ou duplicado (quando informado).

Exemplo mínimo CNPJ (sem CPF/nascimento PF):

```json
{
  "nome": "Auto Peças XYZ",
  "tipo_documento": "cnpj",
  "documento": "11222333000181",
  "razao_social": "Auto Pecas XYZ LTDA",
  "tipo_fornecedor": "fixo",
  "pf_nome": "João Responsável",
  "pf_endereco": "Rua A, 100",
  "salario": 3500,
  "data_admissao": "2026-01-10",
  "data_desligamento": null
}
```

### Salário e período (todos os fornecedores)

| Campo body | UI | Regra |
|------------|-----|-------|
| `salario` | Salário | Opcional; ≥ 0; aceito também com `elegivel_equipe=false` |
| `data_admissao` | Data de início | Opcional |
| `data_desligamento` | Data de término | Opcional; se ambas datas → `data_desligamento >= data_admissao` |

**400** se salário negativo ou intervalo de datas inválido.

### Legado (`elegivel_equipe=true`, documento CPF)

- Continua podendo exigir `cargo` e `data_nascimento` de equipe.
- **Não** exige mais `salario`.

### Não-legado

- Aceita `salario`, `data_admissao`, `data_desligamento`.
- Continua **não** persistindo/exigindo cargo, benefício, histórico, etc. (FR-013).

## `GET /colaboradores`

Inalterado em contrato de query. Resposta já inclui `salario`, `data_admissao`, `data_desligamento`, `tipo_fornecedor`, `ativo`, `pf_*` — suficientes para o card no cliente.

## Fora de escopo REST

- Novo `GET .../resumo-folha`
- Novas colunas / migração
- Mudança de path ou autenticação
