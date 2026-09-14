# Contrato REST: Fornecedores (alias) e Férias

**Feature**: `062-fix-ferias-fornecedor`  
Base: `http://localhost:8001/api`  
Auth: Bearer JWT

## `GET /fornecedores`

Alias da coleção existente `GET /colaboradores` (mesmo handler/router).

| Param | Default | Notas |
|-------|---------|-------|
| skip, limit | 0, 100 | Férias usa `limit=1000` (igual à página Fornecedores) |
| ativo | omitido = todos | Férias passa `true` |
| elegivel_equipe | omitido = todos | Férias **não** envia (lista todos os ativos) |
| tipo | — | Não usar na página de Férias; o handler já restringe `tipo=fornecedor` |

**200**: lista no mesmo shape do cadastro unificado.

Campos relevantes para Férias:

```json
{
  "id": 1,
  "nome": "Maria Silva",
  "ativo": true,
  "tipo_fornecedor": "fixo",
  "data_admissao": "2024-03-15",
  "salario": 5500.0
}
```

`data_admissao`, `salario` e `tipo_fornecedor` podem ser `null` (`tipo_fornecedor` nulo trata-se como **fixo** na folha).

**Compat**: `GET /colaboradores` permanece idêntico.

---

## Férias — sem breaking change

Prefixo: `/ferias`

| Método | Path | Notas |
|--------|------|-------|
| GET | `/ferias` | Query `colaborador_id`, `ano`, `aprovado` — nomes **inalterados** |
| POST | `/ferias` | Body com `colaborador_id` (ID do fornecedor) |
| PUT | `/ferias/{id}` | Update; valida intervalo se ambas as datas presentes |
| DELETE | `/ferias/{id}` | Conforme implementação atual |

### POST body (exemplo)

```json
{
  "colaborador_id": 1,
  "ano": 2026,
  "dias_direito": 30,
  "dias_tirados": 10,
  "data_inicio": null,
  "data_fim": null
}
```

- `data_inicio` / `data_fim`: opcionais (`null` ou omitidos).
- Se ambos presentes e fim &lt; início → **422**.
- Sem campo de override no body; elegibilidade de 1 ano e sugestão de ano são responsabilidade da UI.

### Auditoria

Mensagens podem continuar citando o ID; texto “Fornecedor {id}” é cosmética opcional.
