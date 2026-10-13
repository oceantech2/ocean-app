# Contrato de API: `GET /api/nfs` com `fornecedor_id`

**Auth**: `get_current_user` (inalterado)

## Novo parâmetro

| Parâmetro | Tipo | Obrigatório | Efeito |
|---|---|---|---|
| fornecedor_id | int | não | Mantém só NFs com ao menos um registro em `bonus` (tipo `comissao` ou `bonus`) com `colaborador_id = fornecedor_id` |

Combina por "E" com `mes`, `ano`, `status_filtro` e `incluir_arquivadas`. Sem o parâmetro, comportamento atual. Resposta inalterada (`List[NFResponse]`).
