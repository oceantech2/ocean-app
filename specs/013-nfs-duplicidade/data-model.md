# Data Model: Validação de Duplicidade de NFs

**Feature**: `013-nfs-duplicidade` | **Date**: 2026-08-06  
**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

## Entidade: NF (existente)

Sem nova tabela. Reforço de regras sobre `nfs.numero`.

| Campo | Papel na feature |
|-------|------------------|
| `id` | Identificador retornado no 409 para atalho UI |
| `numero` | Chave de unicidade (já UNIQUE no banco); comparar/persistir com `strip()` |
| `razao_social` | Hint no payload de conflito |
| `arquivada` / `status` | Não liberam o número (cancelada/arquivada ainda bloqueiam) |
| demais | Em `on_conflict=update` na importação: atualizar campos Maggo/arquivo; preservar enriquecimento Ocean conforme research R5 |

### Regras de validação

1. `numero` obrigatório, não vazio após trim.
2. Unicidade: não pode existir outra linha com o mesmo `numero` (trim) — qualquer status/arquivada.
3. Create: falha se número ocupado → conflito.
4. Update com mudança de `numero`: falha se ocupado por **outro** `id`.
5. Import — duplicata no arquivo: primeira ocorrência elegível; demais → rejeitadas (`duplicado_arquivo`).
6. Import — número já no cadastro: conforme `on_conflict` do lote (`reject` | `update`); nunca segundo INSERT.

### Transições

Nenhuma máquina de estados nova. Status/arquivada inalterados pela feature.

## Conceito: Resultado de importação

Não persistido; resposta da API de import.

| Campo lógico | Significado |
|--------------|-------------|
| `ok` | Quantidade de linhas criadas com sucesso |
| `atualizados` | Quantidade atualizadas (`on_conflict=update`) |
| `erros` | Lista `{ linha, numero, motivo }` — validações, `duplicado_arquivo`, `duplicado_cadastro`, etc. |
| `conflitos_cadastro` | (preview) contagem/lista de números já existentes |

## Conceito: Escolha de conflito do lote

Parâmetro de request `on_conflict`: `reject` | `update` | omitido.

| Situação | Comportamento |
|----------|----------------|
| Sem números já no cadastro | Import segue; `on_conflict` opcional |
| Com conflitos e `on_conflict` omitido | Erro pedindo escolha (UI pergunta e reenvia) |
| `reject` | Não altera existentes; reporta rejeições |
| `update` | Upsert campos do arquivo; sem novo registro |

## Relação com origem manual (012)

Registros manuais (quando 012 existir) participam da mesma unicidade por `numero`. Maggo não sobrescreve manual (012); 013 não cria segunda linha em nenhum canal local.
