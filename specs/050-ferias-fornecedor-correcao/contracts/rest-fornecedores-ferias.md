# Contrato REST: Fornecedores (alias) e Férias

**Feature**: `050-ferias-fornecedor-correcao`  
Base: `http://localhost:8001/api`  
Auth: Bearer JWT

## `GET /fornecedores`

Alias da coleção existente `GET /colaboradores` (mesmo handler/router).

| Param | Default | Notas |
|-------|---------|-------|
| skip, limit | 0, 100 | Igual ao atual; Férias usa limit 200 |
| ativo | omitido = todos | Férias passa `true` |
| elegivel_equipe | omitido = todos | Férias passa `true` |
| tipo | — | Deprecado (043); não usar na página de Férias |

**200**: lista de fornecedores (mesmo shape de colaborador/fornecedor unificado).

Campos relevantes para Férias:

```json
{
  "id": 1,
  "nome": "Maria Silva",
  "ativo": true,
  "elegivel_equipe": true,
  "data_admissao": "2024-03-15",
  "salario": 5500.0
}
```

`data_admissao` e `salario` podem ser `null`.

**Compat**: `GET /colaboradores` permanece idêntico.

---

## Férias — sem breaking change

Prefixo: `/ferias`

| Método | Path | Notas |
|--------|------|-------|
| GET | `/ferias` | Query `colaborador_id`, `ano`, `aprovado` — nomes de query **inalterados** |
| POST | `/ferias` | Body com `colaborador_id` (ID do fornecedor) |
| PUT | `/ferias/{id}` | Update; valida intervalo de datas se ambas presentes |
| DELETE | `/ferias/{id}` | Soft/hard conforme implementação atual |

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
- Não há campo de override no body; elegibilidade de 1 ano é responsabilidade da UI nesta feature.

### Auditoria

Mensagens de auditoria podem continuar citando o ID; melhoria de texto “Fornecedor {id}” é opcional e cosmética.
