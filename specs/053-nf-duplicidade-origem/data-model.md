# Data Model: NF — Conflito de Duplicidade entre Origens

**Feature**: `053-nf-duplicidade-origem` | **Date**: 2026-09-06  
**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

## Entidade: NF (Conta a Receber)

Sem novos campos. Atributos relevantes à regra:

| Campo | Tipo lógico | Notas |
|-------|-------------|--------|
| `id` | identificador | Chave do atalho “Abrir existente” |
| `numero` | texto, opcional | Após trim; UNIQUE no banco quando preenchido |
| `origem` | `manual` \| `maggo` | Imutável após criação |
| `maggo_id` | texto, opcional | Chave de merge Maggo |
| demais | — | Inalterados (status, arquivada, valores, etc.) |

### Invariantes

1. Dois registros **não** podem compartilhar o mesmo `numero` (trim) não vazio — reforçado por UNIQUE + validação.
2. Consequentemente, o mesmo `numero` **não** aparece em duas `origem` distintas.
3. Dentro de uma origem, criação de segundo registro com o mesmo `numero` é proibida; reenvio/merge atualiza o existente.
4. `origem` e `maggo_id` não mudam em update.
5. NF arquivada/cancelada continua ocupando o `numero`.

## Classificação de escrita

```text
numero vazio? → sem regra de duplicidade desta feature
existente = lookup(numero trimado, excluir self)
sem existente → OK (create/insert)
existente.origem == origem_operacao
  → create novo id? BLOQUEIO (duplicidade mesma origem)
  → merge/update do mesmo registro? OK
existente.origem != origem_operacao
  → BLOQUEIO (conflito de origem)
```

## Importação (lote)

| Classe de linha | Tratamento |
|-----------------|------------|
| `duplicado_arquivo` | Sempre rejeitada (primeira ocorrência prevalece) — 013 |
| Número em NF `manual` (mesma origem da import) | Exige `on_conflict`; reject ou update |
| Número em NF `maggo` | Sempre `conflito_origem` em `erros`; nunca update |
| Número livre | Insert com `origem=manual` |

## Sync Maggo

| Situação | Tratamento |
|----------|------------|
| `maggo_id` já Maggo | No-op / merge conforme regras atuais |
| `maggo_id` em registro Manual | Ignorar; registrar colisão de origem |
| Número Maggo já em NF Manual | Não criar/atualizar Maggo com esse número; registrar colisão |
| Número Maggo já em NF Maggo | Merge pela mesma origem (não é conflito entre origens) |

## Entidades auxiliares (contratos, não tabelas)

- **Detail 409 duplicidade**: `code`, `message`, `nf_id`, `numero`, `razao_social`, opcional `origem_existente`
- **Detail 409 conflito origem**: mesmo shape com `code=NF_NUMERO_ORIGEM_CONFLITO` e mensagem distinta
- **Erro de linha import**: `linha`, `numero`, `motivo` ∈ {`duplicado_arquivo`, `duplicado_cadastro`, `conflito_origem`, …}
- **Escolha de lote**: `on_conflict` = `reject` \| `update` (só mesma origem)

## Fora de escopo no modelo

- Tabela de “conflitos históricos”
- Campo novo de “origem pretendida” no formulário (create manual fixo `manual`)
- Alteração de UNIQUE para composto
