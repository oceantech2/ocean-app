# Contrato REST: Contas a Receber — exclusão, Tipo e Maggo

**Feature**: `044-contas-receber-excluir-editar`  
Base: `http://localhost:8001/api`  
Auth: Bearer JWT

## `DELETE /nfs/{id}`

Admin. Reativa o endpoint hoje 403.

| Resultado | Significado |
|----------|-------------|
| **204** | `excluida_em` preenchido; auditoria `deletar`; linha some das listagens |
| **403** | Visualizador |
| **404** | Id inexistente ou já excluída |

Não desfaz movimentos de caixa. `DELETE /nfs/todas` permanece **403**.

## `GET /nfs` e `GET /nfs/resumo/total`

Ignoram `excluida_em IS NOT NULL`. Filtro `incluir_arquivadas` **não** devolve excluídas.

**200**: lista/resumo só de contas visíveis.

## `GET /nfs/{id}`

**404** se `excluida_em` preenchido.

## `PUT /nfs/{id}`

Admin. Grupo Maggo aceito também em `origem=maggo`: `razao_social`, `posicao`, `candidato`, `tipo`, `valor_bruto`, `valor_imposto`, `valor_liquido`, `data_ent_pgto`. `origem` e `maggo_id` ignorados se enviados.

`tipo`: `retainer` \| `sucesso` \| `parcelamento` (alias `parcela` → `parcelamento`).

**404** se excluída.

## Merge Maggo (efeito colateral de `GET /nfs`)

| Situação | Comportamento |
|----------|----------------|
| `maggo_id` inédito | Cria registro (converte tipo antigo na entrada) |
| `maggo_id` já existe (visível) | Não atualiza campos Maggo |
| `maggo_id` já existe (excluída) | Não recria, não limpa `excluida_em` |
| Colisão com origem manual | Igual ao atual (header de ignorados) |

## Relatórios, metas, impostos

Consultas de NF usadas em totais **excluem** `excluida_em` preenchido. Payload de `fechamentos-por-tipo` pode manter chave JSON `parcelamento`; a UI mostra **Parcela**.
