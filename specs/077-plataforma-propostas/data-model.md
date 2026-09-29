# Data Model: Plataforma de Propostas (Proposal)

**Feature**: `077-plataforma-propostas` | **Date**: 2026-09-29

Decisões de apoio em [research.md](./research.md) (R7, R8, R10, R12, R13, R14).

---

## 1. `usuarios_app` (existente — alteração)

| Coluna | Tipo | Regra |
|---|---|---|
| `acesso_erp` | `BOOLEAN NOT NULL DEFAULT TRUE` | Permite login no ERP e uso das rotas do ERP. |
| `acesso_proposal` | `BOOLEAN NOT NULL DEFAULT FALSE` | Permite login no Proposal. Independente de `permissoes`. |

- Migração inline em `_migrar()` (`backend/app/main.py`): `ALTER TABLE usuarios_app ADD COLUMN IF NOT EXISTS ...`. Os defaults cobrem o FR-002 (usuários atuais: ERP sim, Proposal não).
- Só `admin` altera esses campos (endpoints de `configuracoes.py` já usam `require_admin`).
- Um admin não pode definir `acesso_erp = false` para si mesmo (400).
- Colunas existentes (`papel`, `permissoes`, `ativo`) e a tabela `usuarios_auth` (2FA) não mudam.

---

## 2. `propostas` (nova)

| Coluna | Tipo | Regra |
|---|---|---|
| `id` | `SERIAL PK` | Uso interno; nunca exposto na página pública. |
| `codigo` | `VARCHAR(64) NOT NULL UNIQUE` | `secrets.token_urlsafe(24)`; compõe o link público. |
| `cliente_nome` | `VARCHAR(255) NOT NULL` | Obrigatório, sem espaços nas pontas, 1–255 caracteres. |
| `cnpj` | `VARCHAR(14) NOT NULL` | Normalizado (só caracteres válidos, sem máscara); validado por `validar_cnpj`. |
| `valor` | `NUMERIC(14,2) NOT NULL` | `> 0`. |
| `imposto_ativo` | `BOOLEAN NOT NULL DEFAULT FALSE` | Estado do toggle. |
| `aliquota` | `NUMERIC(5,2) NULL` | Obrigatória e `0 < aliquota < 100` quando `imposto_ativo`; `NULL` caso contrário. |
| `valor_imposto` | `NUMERIC(14,2) NOT NULL DEFAULT 0` | `round_half_up(valor × aliquota / 100, 2)`; `0` sem imposto. |
| `total` | `NUMERIC(14,2) NOT NULL` | `valor + valor_imposto`. |
| `emitida_em` | `TIMESTAMP NOT NULL DEFAULT NOW()` | Data e hora da geração (UTC). |
| `validade` | `DATE NOT NULL` | Padrão: data de emissão (São Paulo) + 30 dias; deve ser `>` data de emissão. |
| `status` | `VARCHAR(20) NOT NULL DEFAULT 'aguardando'` | Persistido: `aguardando` · `visualizada` · `assinada` · `cancelada`. |
| `visualizada_em` | `TIMESTAMP NULL` | Primeira abertura do link público. |
| `assinada_em` | `TIMESTAMP NULL` | Momento da assinatura. |
| `cancelada_em` | `TIMESTAMP NULL` | Momento do cancelamento. |
| `conteudo_hash` | `VARCHAR(64) NOT NULL` | SHA-256 do conteúdo canônico (R8), calculado na criação. |
| `criado_por_id` | `INTEGER NULL FK → usuarios_app(id) ON DELETE SET NULL` | Dono da proposta (visibilidade). |
| `criado_por_usuario` | `VARCHAR(255) NOT NULL` | Snapshot do login do criador, para exibição. |

**Índices**: `UNIQUE (codigo)`; `INDEX (criado_por_id, emitida_em DESC)`; `INDEX (status)`.

**Constraints de banco** (defesa em profundidade):
- `CHECK (valor > 0)`
- `CHECK (status IN ('aguardando','visualizada','assinada','cancelada'))`
- `CHECK ((imposto_ativo AND aliquota > 0 AND aliquota < 100) OR (NOT imposto_ativo AND aliquota IS NULL))`

**Imutabilidade (FR-015)**: nenhum endpoint altera `cliente_nome`, `cnpj`, `valor`, `imposto_ativo`, `aliquota`, `valor_imposto`, `total`, `validade` ou `codigo` depois da criação. Só `status` e as datas de acompanhamento mudam.

### Status efetivo (derivado)

```text
status_efetivo =
  'expirada'  se status ∈ {aguardando, visualizada} e agora_SP > validade 23:59:59
  status      caso contrário
```

Calculado em um único helper (`backend/app/services/propostas.py`) e usado por listagem, detalhe, página pública, assinatura e cancelamento.

### Transições

```text
                 1º GET público
  aguardando ───────────────────▶ visualizada
      │  │                          │  │
      │  └──── assinar ──────┐      │  └──── assinar ────┐
      │                      ▼      │                    ▼
      │                   assinada ◀┘               (assinada)
      │
      ├──── cancelar (usuário) ──▶ cancelada ◀── cancelar ── visualizada
      │
      └──── validade vencida ────▶ [expirada]  (derivado; também a partir de visualizada)
```

| De (efetivo) | Ação | Para | Quem |
|---|---|---|---|
| aguardando | 1ª abertura do link público | visualizada | Cliente (sistema grava) |
| aguardando / visualizada | Assinar | assinada | Cliente |
| aguardando / visualizada | Cancelar (com confirmação) | cancelada | Criador ou `admin` |
| aguardando / visualizada | Passa a validade | expirada (derivado) | — |
| assinada / cancelada / expirada | Qualquer ação | — (recusada) | — |

---

## 3. `propostas_assinaturas` (nova)

| Coluna | Tipo | Regra |
|---|---|---|
| `id` | `SERIAL PK` | — |
| `proposta_id` | `INTEGER NOT NULL UNIQUE FK → propostas(id) ON DELETE CASCADE` | No máximo uma assinatura por proposta. |
| `nome` | `VARCHAR(255) NOT NULL` | Nome completo; 3–255 caracteres, sem espaços nas pontas. |
| `email` | `VARCHAR(255) NOT NULL` | Validado (`validar_email` de `services/documento.py`); guardado em minúsculas. |
| `aceite` | `BOOLEAN NOT NULL` | Deve ser `true` (declaração marcada). |
| `assinada_em` | `TIMESTAMP NOT NULL DEFAULT NOW()` | — |
| `ip` | `VARCHAR(64) NOT NULL` | 1º endereço de `X-Forwarded-For`, com fallback em `request.client.host`. |
| `user_agent` | `VARCHAR(500) NULL` | Cabeçalho `User-Agent`, truncado. |
| `conteudo_hash` | `VARCHAR(64) NOT NULL` | Hash recalculado no momento do aceite; deve ser igual a `propostas.conteudo_hash`. |

---

## 4. Conteúdo canônico para o hash

JSON com chaves ordenadas, sem espaços, decimais como string com 2 casas e datas em ISO-8601:

```json
{"aliquota":"14.53","cliente_nome":"ACME Ltda","cnpj":"11222333000181","codigo":"…","emitida_em":"2026-09-29T22:10:00","imposto_ativo":true,"total":"11453.00","validade":"2026-10-29","valor":"10000.00","valor_imposto":"1453.00"}
```

Sem imposto: `"aliquota": null`, `"imposto_ativo": false`, `"valor_imposto": "0.00"`.

---

## 5. Visibilidade (FR-026)

| Papel do usuário (no token do Proposal) | Lista / detalhe / cancelar |
|---|---|
| `admin` | Todas as propostas |
| `visualizador` | Só `criado_por_id = uid do token` |

Tentativa de abrir ou cancelar uma proposta alheia sem ser `admin` → 404 (não revela existência).

---

## 6. Migração

Tudo em `_migrar()` (padrão atual do projeto), idempotente:
1. `ALTER TABLE usuarios_app ADD COLUMN IF NOT EXISTS acesso_erp ...` e `acesso_proposal ...`
2. `CREATE TABLE IF NOT EXISTS propostas (...)` + índices
3. `CREATE TABLE IF NOT EXISTS propostas_assinaturas (...)`

Modelos SQLAlchemy `Proposta` e `PropostaAssinatura` em `backend/app/models/__init__.py` (o `Base.metadata.create_all` também cria as tabelas em ambiente novo). Depois do deploy em produção, rodar `backend/scripts/enable_rls_supabase.sql` (R14).
