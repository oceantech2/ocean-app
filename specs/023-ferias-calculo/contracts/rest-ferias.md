# Contract: REST — Férias (cálculo)

**Feature**: `023-ferias-calculo`  
**Base**: `GET|POST /api/ferias`, `GET|PUT|DELETE /api/ferias/{id}` (JWT). Sem path novo.

## Corpo existente (inalterado na forma)

`FeriasCreate` / `FeriasResponse`: `colaborador_id`, `ano`, `dias_direito`, `dias_tirados`, `data_inicio?`, `data_fim?`, (+ `id`, `aprovado`, `criado_em` na resposta).

## Mudança: `FeriasUpdate`

Campos opcionais: `dias_direito`, `dias_tirados`, `data_inicio`, `data_fim`, `aprovado`, `ano` (ano só se já for aceito; **não** é requisito desta feature alterar ano).

O client de edição **deve** poder persistir `dias_direito`.

## Validação de datas (POST e PUT)

Se `data_inicio` e `data_fim` estiverem ambos presentes (após merge no PUT):

| Condição | HTTP | Detalhe |
|----------|------|---------|
| `data_fim < data_inicio` | **422** | Intervalo invertido; mensagem em pt-BR |
| `data_fim ≥ data_inicio` | 2xx | Sem recálculo obrigatório de `dias_tirados` no servidor (o client envia o número) |

Uma data nula e a outra preenchida: permitido (sem 422 por intervalo).

Sobreposição com outro período: **não** gera 4xx.

## DELETE `/api/ferias/{id}`

1. 404 se não existir.
2. Carregar demais `Ferias` com o mesmo `colaborador_id` e `ano`.
3. Se houver restantes e `dias_direito` do alvo &gt; max dos restantes: gravar esse direito na restante de menor `id` (mesmo request/transação).
4. Excluir o alvo.
5. 204.

Auditoria: manter o registro de delete; a transferência é detalhe da operação (opcional mencionar no texto de auditoria).

## GET lista

Inalterado (`skip`, `limit`, `colaborador_id`, `ano`, `aprovado`). O resumo anual **não** vem na API; o client deriva.

O client da página deve pedir `limit` suficiente para o filtro (já 200). Não paginar o agregado no servidor nesta feature.

## Papéis

Qualquer usuário autenticado com acesso ao módulo lê. Escrita continua o padrão atual da rota (admin na UI). Esta feature não muda auth da API.
