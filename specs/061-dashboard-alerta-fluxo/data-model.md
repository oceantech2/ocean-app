# Data Model: Alerta de Fluxo de Caixa

**Feature**: `061-dashboard-alerta-fluxo` | **Date**: 2026-09-10

Sem migration DDL. Persistência nova = uma chave em `configuracao_app`. Leituras de receita/aging reutilizam modelos já existentes.

## 1. Limiar de exibição (persistido)

| Item | Detalhe |
|------|---------|
| Tabela | `configuracao_app` (`ConfiguracaoApp`) |
| Chave | `limiar_alerta_fluxo` |
| Valor | string do **inteiro** percentual (ex. `"60"`) |
| Default | `60` se linha ausente |
| Validação no PUT | **inteiro** finito, `1 ≤ x ≤ 100` (rejeitar decimal / não inteiro) |
| Quem escreve | `admin` |
| Quem lê | `admin` e `visualizador` |

Não faz parte de `metas_financeiras` / Configuração do Período.

## 2. Conta a Receber (`nfs`) — leituras

### Universo do próximo recebimento

```text
excluida_em IS NULL
AND status != cancelada
AND data_emissao IS NOT NULL
AND data_pagamento IS NULL
AND data_vencimento IS NOT NULL
AND data_vencimento >= hoje   -- data civil do servidor
```

| Campo | Papel |
|-------|-------|
| `data_vencimento` | `data_vencimento_nf` — ordenação MIN |
| `valor_bruto` / `valor_liquido` | valor do próximo (dual-base) |
| `id` | desempate final (menor id) |

**Empate**: mesma `data_vencimento` mínima → ordenação estável no servidor: maior `valor_liquido`, depois maior `valor_bruto`, depois menor `id`. A resposta expõe ambos os valores; a UI só escolhe a base do toggle para **exibir** o valor (não reescolhe a NF).

**Sem elegíveis**: não há linha — estado “sem próximo / sem previsão” (não é falha).

### Universo do % (via Pipeline — não redefinir)

Fechamento no período (`data_ent_pgto` / regra canônica 056–058): `fechado` e `recebido` dual-base.

### Universo Aging em atenção (via Aging — não redefinir)

Bucket `d60_90` do estoque global 060.

## 3. Derivados (não persistidos)

| Conceito | Definição |
|----------|-----------|
| `% não recebida` | Se `fechado > 0` e `recebido ≤ fechado`: `(fechado − recebido) / fechado × 100`. Se `recebido > fechado`: `0`. Se `fechado = 0` ou Pipeline indisponível: indisponível |
| `exibir_banner` | `% disponível` AND `% calculado > limiar` (base ativa; **sem** arredondar antes da comparação) |
| `aging_em_atencao` | `d60_90.valor_*` |
| Campo “indisponível” | Fonte falhou (erro de rede/API); distinto de zero legítimo e de “sem previsão” |

## 4. Relacionamentos

```text
ConfiguracaoApp (limiar_alerta_fluxo)
        │
        ▼
Dashboard Alerta ──► Pipeline (fechado/recebido) ──► %
                 ──► Aging (d60_90)               ──► Aging em atenção
                 ──► GET proximo-recebimento      ──► próximo
                 ──► toggle visaoReceita          ──► base monetária / %
```

## 5. Validação

- PUT limiar inválido (fora de 1–100, não inteiro) → 422; valor anterior permanece
- Sem CREATE de Conta a Receber nesta feature
- Zerar dados / wipe: chave pode sumir — GET volta ao default 60 (ou reseed opcional pós-wipe, alinhado a outras chaves estruturais)
