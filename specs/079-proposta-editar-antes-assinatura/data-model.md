# Data Model: Editar Proposta Antes da Assinatura

**Feature**: `079-proposta-editar-antes-assinatura` | **Date**: 2026-10-02

Parte do modelo da feature 077 ([data-model.md](../077-plataforma-propostas/data-model.md)). Decisões de apoio em [research.md](./research.md) (R1, R3, R5, R6, R7).

---

## 1. `propostas` (existente — alteração)

### Colunas novas

| Coluna | Tipo | Regra |
|---|---|---|
| `versao` | `INTEGER NOT NULL DEFAULT 1` | Começa em 1 na criação; `+1` a cada edição efetiva. Enviada pelo cliente ao assinar (R1). |
| `atualizada_em` | `TIMESTAMP NULL` | Data e hora (UTC) da última edição efetiva; `NULL` se nunca editada. Exibida na página pública como "Atualizada em" (R6). |
| `versao_visualizada_em` | `TIMESTAMP NULL` | Primeira abertura do link pelo cliente **na versão atual**. Zerada a cada edição (R3). |

### Colunas existentes com regra alterada

| Coluna | Antes (077) | Agora |
|---|---|---|
| `cliente_nome`, `cnpj`, `valor`, `imposto_ativo`, `aliquota`, `valor_imposto`, `total`, `validade` | Imutáveis após a criação | Editáveis enquanto o status efetivo for `aguardando`, `visualizada` ou `expirada` |
| `conteudo_hash` | Calculado só na criação | Recalculado a cada edição efetiva (formato canônico inalterado, R7) |
| `status` | `aguardando` → `visualizada` só na 1ª abertura | Volta para `aguardando` a cada edição efetiva; passa a `visualizada` na 1ª abertura da versão atual |
| `visualizada_em` | Primeira abertura do link | Igual: primeira abertura do link, **nunca** zerada pela edição |

Sem mudança: `id`, `codigo`, `emitida_em`, `criado_por_id`, `criado_por_usuario`, `assinada_em`, `cancelada_em`, constraints `CHECK` e índices existentes.

### Transições (complementa 077, data-model §2)

| De (efetivo) | Ação | Para | Efeitos |
|---|---|---|---|
| aguardando / visualizada / expirada | Editar com mudança real e validade > hoje | aguardando | `versao+1`, `atualizada_em=now`, `versao_visualizada_em=NULL`, `conteudo_hash` recalculado, 1 registro em `propostas_edicoes` |
| aguardando / visualizada / expirada | Editar sem mudança | (inalterado) | Nada é gravado |
| aguardando (versão atual nunca vista) | Cliente abre o link (sem token do Proposal do criador/admin) | visualizada | `versao_visualizada_em=now`, `visualizada_em=COALESCE(visualizada_em, now)` |
| aguardando / visualizada | Assinar com `versao` igual à atual | assinada | Como na 077 |
| aguardando / visualizada | Assinar com `versao` diferente | (inalterado) | `409` "proposta atualizada" |
| assinada / cancelada | Editar | — (recusada, `409`) | — |

---

## 2. `propostas_edicoes` (nova)

Registro append-only de cada edição efetiva (FR-011, FR-018).

| Coluna | Tipo | Regra |
|---|---|---|
| `id` | `SERIAL PK` | — |
| `proposta_id` | `INTEGER NOT NULL FK → propostas(id) ON DELETE CASCADE` | Proposta editada. |
| `versao` | `INTEGER NOT NULL` | Versão resultante da edição (`propostas.versao` depois do incremento). |
| `editada_em` | `TIMESTAMP NOT NULL DEFAULT NOW()` | UTC; igual a `propostas.atualizada_em` da mesma edição. |
| `editado_por_id` | `INTEGER NULL FK → usuarios_app(id) ON DELETE SET NULL` | Quem editou. |
| `editado_por_usuario` | `VARCHAR(255) NOT NULL` | Snapshot do login, para exibição mesmo se o usuário for removido. |
| `alteracoes` | `JSONB NOT NULL` | Lista não vazia de `{"campo", "anterior", "novo"}` (formato abaixo). |

**Índices**: `UNIQUE (proposta_id, versao)` (uma edição por versão; também serve para listar o histórico em ordem).

**Constraint**: `CHECK (jsonb_typeof(alteracoes) = 'array' AND jsonb_array_length(alteracoes) > 0)`.

### Formato de `alteracoes`

Valores na forma canônica (a mesma do conteúdo do hash): decimais como string com 2 casas, datas ISO, booleanos, CNPJ sem máscara, `null` para alíquota ausente. Ordem fixa dos campos: `cliente_nome`, `cnpj`, `valor`, `imposto_ativo`, `aliquota`, `valor_imposto`, `total`, `validade`. Só entram os campos que mudaram.

```json
[
  {"campo": "valor", "anterior": "10000.00", "novo": "9000.00"},
  {"campo": "valor_imposto", "anterior": "1453.00", "novo": "1307.70"},
  {"campo": "total", "anterior": "11453.00", "novo": "10307.70"},
  {"campo": "validade", "anterior": "2026-10-29", "novo": "2026-11-15"}
]
```

### Regras

- Nenhum endpoint faz `UPDATE` ou `DELETE` nesta tabela; a remoção só acontece em cascata se a proposta for apagada (não há endpoint para isso).
- Visível apenas no detalhe autenticado, com a mesma regra de visibilidade da proposta (criador ou `admin`); nunca na rota pública.

---

## 3. `propostas_assinaturas` (existente — sem alteração)

A coluna `conteudo_hash` continua recebendo o hash calculado no momento do aceite, que agora corresponde à versão vigente garantida pela checagem de `versao` (R1, R7).

---

## 4. Migração

Em `_migrar()` (`backend/app/main.py`), bloco novo "Proposal (feature 079)", idempotente:

1. `ALTER TABLE propostas ADD COLUMN IF NOT EXISTS versao INTEGER NOT NULL DEFAULT 1`
2. `ALTER TABLE propostas ADD COLUMN IF NOT EXISTS atualizada_em TIMESTAMP`
3. `ALTER TABLE propostas ADD COLUMN IF NOT EXISTS versao_visualizada_em TIMESTAMP`
4. Preenchimento único das propostas nunca editadas: `UPDATE propostas SET versao_visualizada_em = visualizada_em WHERE versao_visualizada_em IS NULL AND visualizada_em IS NOT NULL AND versao = 1 AND atualizada_em IS NULL`
5. `CREATE TABLE IF NOT EXISTS propostas_edicoes (...)` com a `CHECK` e o índice único `(proposta_id, versao)`

Modelos SQLAlchemy: colunas novas em `Proposta` (e docstring sem "imutável"), classe nova `PropostaEdicao` com `relationship` `Proposta.edicoes` (ordenada por `versao` desc). Depois do deploy, rodar de novo `backend/scripts/enable_rls_supabase.sql` (o script habilita RLS em todas as tabelas sem RLS, incluindo a nova).
