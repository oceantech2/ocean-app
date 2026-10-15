# Contrato REST: lista filtrada e exclusão de propostas

## `GET /api/proposal/propostas/` (alterado)

Query (todos opcionais, combináveis):

| Parâmetro | Tipo | Regra |
|-----------|------|-------|
| `status` | string | Como hoje (`aguardando`, `visualizada`, `assinada`, `cancelada`, `expirada`) |
| `empresa` | string ≤ 255 | `cliente_nome` contém (sem diferenciar maiúsculas, literal) |
| `modelo` | string | `executive-search`, `outplacement-development` ou `simples`; outro valor → **422** `"Modelo inválido"` |
| `projeto` | string ≤ 255 | `projeto_nome` ou qualquer `projetos[].nome` contém |
| `data_de` | date `YYYY-MM-DD` | Data exibida ≥ `data_de` |
| `data_ate` | date `YYYY-MM-DD` | Data exibida ≤ `data_ate` |
| `criado_por` | string | Só admin: `criado_por_usuario` igual; ignorado para os demais |
| `page`, `page_size` | int | Como hoje |

Resposta inalterada (`items`, `total`, `page`, `page_size`), com `total` já filtrado.

## `GET /api/proposal/propostas/autores` (novo)

- Só admin; os demais recebem **403** `"Ação permitida apenas para administradores"`.
- **200** `["consultor@x.com", "fabio@…", …]`: logins distintos de `criado_por_usuario`, em ordem alfabética.

## `DELETE /api/proposal/propostas/{id}` (novo)

- Só admin; os demais recebem **403** `"Ação permitida apenas para administradores"`.
- Proposta inexistente → **404** `"Proposta não encontrada"`.
- **204**: proposta, assinatura e histórico de edições removidos; auditoria `excluir` / `Proposta` registrada.
- Depois disso, `GET /api/public/propostas/{codigo}` → **404**.

## UI

- Lista: Empresa (texto), Modelo (select: Todos + modelos), Projeto (texto), Data de / até (date), Status (select), Criado por (select, só admin), botão "Limpar filtros" (visível com algum filtro ativo). Vazio com filtros: "Nenhuma proposta encontrada com esses filtros".
- Ações (admin): "Excluir" em vermelho → `window.confirm` → toast "Proposta excluída" → recarrega a lista.
- Detalhe (admin): botão "Excluir" → confirmação → toast → navega para `/`.
- Confirmação padrão: `Excluir definitivamente a proposta de {empresa}? Esta ação não pode ser desfeita.` Para `assinada`: `A proposta de {empresa} JÁ FOI ASSINADA. Excluir apaga definitivamente a proposta e o registro do aceite do cliente. Continuar?`
