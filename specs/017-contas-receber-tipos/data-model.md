# Data Model: Contas a Receber — Novos nomes dos tipos

**Feature**: `017-contas-receber-tipos` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

## Visão geral

```text
[ Maggo stub antigo ] --_parse_tipo_maggo--> nfs.tipo oficial (ab = NULL)
[ POST/PUT manual    ] --tipo oficial------> nfs.tipo (retainer|sucesso|parcelamento)
[ _migrar one-shot   ] --UPDATE nfs + dh---> classificação oficial
[ Relatórios         ] --COUNT por tipo----> { retainer, sucesso, parcelamento, total }
```

## Enum `TipoFechamento`

| Valor gravado | Nome visível | Origem antiga |
|---------------|--------------|---------------|
| `retainer` | Retainer | Retainer - Abertura (ou retainer sem subtipo) |
| `sucesso` | Sucesso | Retainer - Fechamento |
| `parcelamento` | Parcelamento | Sucesso (sentido antigo) |

Python: `TipoFechamento.RETAINER | SUCESSO | PARCELAMENTO`.

## Entidades

### Conta a Receber (`nfs`)

| Campo | Tipo | Create manual | Edit manual | Edit Maggo | Notas |
|-------|------|---------------|-------------|------------|-------|
| `tipo` | enum oficial | obrigatório | sim | não | `retainer` \| `sucesso` \| `parcelamento` |
| `tipo_abertura_fechamento` | string? | não enviar / `NULL` | `NULL` | `NULL` | legado; não é classificação oficial |
| demais | — | inalterado (012/016) | inalterado | inalterado | NF opcional, Caixa, origem, etc. |

### DH (`dh`)

| Campo | Tipo | Create | Notas |
|-------|------|--------|-------|
| `tipo_fechamento` | enum oficial | obrigatório | mesmos três valores |
| `tipo_abertura_fechamento` | string? | `NULL` | legado |
| `assunto` | string | gerado no POST | nomes novos só em DHs **novos** |

## Conversão de registros existentes

Aplicar **nesta ordem** (nfs e dh):

1. `sucesso` (não associado a fechamento de retainer) → `parcelamento`
2. `retainer` + `fechamento` → `sucesso`
3. `retainer` + `abertura` ou retainer sem subtipo → `retainer` (sem mudança de `tipo`)
4. `tipo_abertura_fechamento` → `NULL`

Idempotência: ver gate em [research.md](./research.md) R-002.

## Persistência (SQL)

```sql
-- AUTOCOMMIT — usar o label nativo já existente (ver R-008: NAME vs value)
ALTER TYPE tipofechamento ADD VALUE IF NOT EXISTS 'parcelamento';
-- ou 'PARCELAMENTO', conforme pg_enum

-- Depois, em transação, se o gate de R-002 passar (ordem: antigo sucesso → parcelamento, depois fechamento → sucesso):
-- UPDATE nfs SET tipo = '<parcelamento>' WHERE tipo = '<sucesso>';
-- UPDATE nfs SET tipo = '<sucesso>' WHERE tipo = '<retainer>' AND tipo_abertura_fechamento = 'fechamento';
-- UPDATE nfs SET tipo_abertura_fechamento = NULL WHERE tipo_abertura_fechamento IS NOT NULL;
-- equivalentes em dh.tipo_fechamento / dh.tipo_abertura_fechamento
```

## Regras de validação

1. Create/update manual: `tipo` ∈ {`retainer`, `sucesso`, `parcelamento`}; 422 se ausente ou inválido.
2. Maggo: converter na entrada; gravar só o enum oficial; `tipo_abertura_fechamento` persistido `NULL`.
3. Maggo tipo desconhecido: pular o item; não gravar tipo inventado.
4. Visualizador: sem POST/PUT.
5. Relatório `fechamentos-por-tipo`: três contagens + `total` (soma das três).
6. Assunto DH novo: um dos três nomes visíveis; assuntos antigos intocados.

## Transições

| Evento | Efeito em `tipo` |
|--------|------------------|
| Boot com dados antigos (gate verdadeiro) | conversão one-shot |
| Create manual `tipo=retainer` | grava `retainer` |
| Create manual `tipo=sucesso` | grava `sucesso` (sentido **novo**) |
| Create manual `tipo=parcelamento` | grava `parcelamento` |
| Maggo `sucesso` antigo | grava `parcelamento` |
| Maggo `retainer`+`fechamento` | grava `sucesso` |
| PUT Maggo tentando mudar tipo | bloqueado (campo de negócio) |
| Arquivar | `tipo` inalterado |

## Relacionamentos

Inalterados. Match Maggo ↔ Ocean continua por `numero`. DH independente de `nfs` (mesma taxonomia, tabelas distintas — ambas convertidas).
