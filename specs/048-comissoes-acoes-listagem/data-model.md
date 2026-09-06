# Data Model: Comissões — ações da listagem (048)

**Feature**: `048-comissoes-acoes-listagem`  
**Date**: 2026-09-06  
**Base**: estende o modelo já descrito em `045-comissoes-conta-receber/data-model.md` (sem novas tabelas).

## Entidades

### Comissão (`bonus`)

Registro de remuneração listado em `/comissoes`.

| Campo | Tipo lógico | Notas (escopo 048) |
|-------|-------------|---------------------|
| id | int | PK |
| colaborador_id | int | Pessoa/fornecedor (agrupamento) |
| nf_id | int? | Conta a receber; null = legado |
| mes, ano | int | Recorte temporal |
| valor_bonus | decimal | Valor da comissão |
| liberado | bool | Estado de liberação |
| pago | bool | Estado de pagamento |
| data_liberacao | date? | Preenchida ao Liberar |
| data_pagamento | date? | Preenchida ao Pagar |
| atividades | lista | Exibição na listagem (fora do foco de mutação desta feature) |

**Relacionamentos**:
- N:1 opcional com **Conta a receber** (`nfs`) via `nf_id`
- N:1 com **Fornecedor/Colaborador** via `colaborador_id`

### Conta a receber (`nfs`)

Referenciada apenas pela ação **Editar** (navegação). Cadastro/sync de linhas **fora** do escopo 048.

### Liberação / Pagamento

Não são entidades separadas: são **transições de estado** no registro `bonus`.

## Máquina de estados

```text
[não liberada] --Liberar--> [liberada, não paga] --Pagar--> [paga]
       ^                         |
       |                         | (Liberar novamente: bloqueado)
       +---- Deletar: NÃO oferecido nesta feature ----+
```

| Transição | Pré-condição | Efeito |
|-----------|--------------|--------|
| Liberar | `liberado = false` | `liberado = true`, `data_liberacao = hoje` |
| Pagar | `liberado = true` e `pago = false` | `pago = true`, `data_pagamento = hoje` |
| Liberar em massa | idem por id | só elegíveis; demais ignorados |
| Pagar em massa | idem por id | só elegíveis; demais ignorados |

**Sem** pré-requisito de NF recebida/quitada ou de `nf_id` preenchido (clarify Q4).

## Regras de validação (listagem)

- **Editar** com `nf_id`: destino Conta a receber vinculada.
- **Editar** sem `nf_id`: mensagem; sem edição isolada.
- **Deletar**: não disponível na UI; API DELETE a remover/desativar no hardening.
- **Liberado (linha)**: se `liberado` → exibir `valor_bonus`; senão → vazio/—.
- **Liberado (grupo)**: soma de `valor_bonus` onde `liberado` no recorte filtrado daquele `colaborador_id`.
- **Pago (linha)**: indicador paga vs pendente a partir de `pago`.

## Seleção em massa (estado de UI, não persistido)

| Regra | Comportamento |
|-------|---------------|
| Escopo | IDs das linhas dos grupos **visíveis na página atual** |
| Limpar | Ao mudar página **ou** filtros |
| Lote | Só processa IDs selecionados elegíveis; retorna `processados` / `ignorados` |

## Fora de escopo (modelo)

- Novos campos de cadastro (atividades, percentual, sync na NF) → 045
- Desfazer Liberar/Pagar
- Soft-delete de comissão pela listagem
