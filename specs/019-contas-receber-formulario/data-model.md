# Data Model: Contas a Receber — Subtítulo, Recebido e Caixa oculta

**Feature**: `019-contas-receber-formulario` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

## Visão geral

```text
[ UI Contas a Receber ]
    Título     ← posicao
    Subtítulo  ← razao_social
    Recebido   → PUT data_pagamento + caixa=corrente (só se pagamento era NULL)
    Editar     → PUT Ocean/manual SEM caixa e SEM colaborador_* (omitidos)
[ nfs ]  colunas inalteradas; caixa legado preservado até transição
```

Sem entidade nova. Sem migration.

## Entidades

### Conta a Receber (`nfs`) — mapeamento UI nesta página

| Campo | Rótulo UI (019) | Create manual | Edit manual | Edit Maggo | Notas |
|-------|-----------------|---------------|-------------|------------|-------|
| `posicao` | **Título** | opcional | sim | RO | era “Vaga” |
| `razao_social` | **Subtítulo** | **obrigatório** | sim | RO | era “Empresa” |
| `candidato` | Candidato | fora da criação | sim (inalterado) | RO | **não** é subtítulo |
| `data_pagamento` | Data de pagamento | se Recebido | se Recebido | se Recebido | |
| `caixa` | **não exibido** | se Recebido → **corrente** | omitir se não transicionar | omitir se não transicionar | legado investimento permanece |
| `colaborador_*` | **não exibido** | NULL (já era) | **omitir** no PUT | **omitir** no PUT | não apagar |
| demais | inalterados (018) | | | | |

### Transição de Caixa

```text
caixa vazio ──(pendente)──► permanece vazio
     │
     └── recebimento novo (POST já recebido OU PUT NULL→data) ──► corrente

caixa investimento ──(só consulta / PUT sem data_pagamento)──► investimento
     │
     └── recebimento novo (pagamento era NULL) ──► corrente
```

Não há estado “usuário escolhe investimento” nesta página.

### Status (inalterado)

| Condição | Status |
|----------|--------|
| `data_pagamento` preenchida | `paga` |
| Sem pagamento e vencimento &lt; hoje | `vencida` |
| Demais sem pagamento | `pendente` |

## Validação

- Create: `razao_social` obrigatório (subtítulo); `posicao` opcional.
- Create/PUT: se `data_pagamento` é preenchido **pela primeira vez**, persistir `caixa='corrente'`.
- PUT sem `caixa` no body: não alterar coluna `caixa`.
- PUT sem `colaborador_*` no body: não alterar vínculos.
- Recebido sem data: 422 / toast (já existe para data).

## Relacionamentos

Inalterados: `nfs` → colaboradores (lead/condução/placement) opcionais; Maggo via `maggo_id`.
