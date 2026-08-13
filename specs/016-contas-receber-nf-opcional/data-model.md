# Data Model: Contas a Receber — NF opcional

**Feature**: `016-contas-receber-nf-opcional` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

## Visão geral

```text
[ POST/PUT admin ] --numero trim--> vazio? --sim--> nfs.numero = NULL
                              │
                              └--não--> unique (013) → 409 se ocupado
[ Stub Maggo ] --sync--> merge só se numero não vazio
                         manuais com numero NULL não colidem
[ Listagem ] ------------→ numero null exibido como "—"
```

## Entidades

### Conta a Receber (`nfs`)

Alteração desta feature: **`numero` passa a ser opcional**.

| Campo | Tipo | Create manual | Edit manual | Edit Maggo | Notas |
|-------|------|---------------|-------------|------------|-------|
| `id` | int | gerado | — | — | PK |
| `numero` | string? (único se preenchido) | **opcional** | sim (pode limpar) | não | `NULL` = sem NF; `''` não persistir |
| `razao_social` | string | obrigatório | sim | não | inalterado |
| `valor_bruto` / `valor_liquido` | number | obrigatório | sim | não | |
| `data_emissao` / `data_vencimento` | date | obrigatório | sim | não | |
| `tipo` | retainer \| sucesso | obrigatório | sim | não | |
| `data_pagamento` / `caixa` | date? / enum? | se Recebido | sim | sim (enrich) | regra 011/012 |
| `origem` | `manual` \| `maggo` | manual | imutável | imutável | |
| demais | — | como 012 | como 012 | como 007/012 | |

### NF (número)

| Estado | Persistência | Unicidade | UI |
|--------|--------------|-----------|-----|
| Informado (após trim) | string | unique global (013), incl. arquivadas | valor |
| Ausente (vazio / só espaços) | `NULL` | não aplica; N registros OK | `—` |

## Persistência

```sql
ALTER TABLE nfs ALTER COLUMN numero DROP NOT NULL;
-- unique em numero permanece (vários NULL permitidos no PostgreSQL)
```

Modelo: `numero = Column(String(50), unique=True, nullable=True, index=True)`.

## Regras de validação

1. **Create**: demais campos FR-003; `numero` opcional; se preenchido → trim + `garantir_numero_livre`; se vazio → `NULL`.
2. **PUT manual**: `numero` no body pode ser string ou `null`; vazio/`null` → `NULL`; preenchido → unique 013.
3. **PUT Maggo**: `numero` não aceito (campo de negócio / origem externa).
4. **Duplicidade**: só compara números **não nulos** e não vazios.
5. **Maggo merge**: ignora item stub sem número; não casa manuais com `numero IS NULL`.
6. **Visualizador**: sem POST/PUT.

## Transições

| Evento | Efeito em `numero` |
|--------|-------------------|
| Create sem NF | `NULL` |
| Create com NF livre | valor trimado |
| Create com NF duplicado | 409; nada persiste |
| Edit manual: preencher NF | unique; grava valor |
| Edit manual: apagar NF | `NULL` |
| Edit Maggo | `numero` inalterado |
| Arquivar | `numero` inalterado (NULL continua único-por-ausência) |

## Relacionamentos

Inalterados em relação à 012. Match Maggo ↔ Ocean continua **somente** por `numero` preenchido.
