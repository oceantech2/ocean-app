# Data Model: Dashboard — Cards de Metas Lado a Lado

**Feature**: `002-dashboard-metas-cards` | **Date**: 2026-07-26  
**Baseline**: [../001-ocean-app-baseline/data-model.md](../001-ocean-app-baseline/data-model.md)  
**Schema delta**: **nenhum** — esta feature não cria/altera tabelas.

## Entidades persistidas (reuso)

### MetaFinanceira (`metas_financeiras`)

| Campo | Tipo | Notas |
|-------|------|--------|
| id | int PK | |
| mes | int | `1–12` = meta mensal; `0` = meta anual do ano |
| ano | int | Ano da meta |
| valor_meta | float | Meta de faturamento líquido |
| criado_em / atualizado_em | datetime | |

**Unicidade lógica**: par `(mes, ano)` — upsert via `PUT /api/metas`.

**Validação de exibição (UI)**:
- Sem registro ou `valor_meta <= 0` → tratar como ausência de meta utilizável (sem barra de progresso enganosa), alinhado ao edge case do spec.
- `tem_meta` vem do endpoint de progresso (`meta is not None`).

## View-model da faixa de cards (UI)

Não é tabela; descreve o contrato de dados consumido por cada card na Dashboard.

### Card Meta Anual

| Campo UI | Origem |
|----------|--------|
| Título | `Meta de Faturamento Anual — {ano}` |
| valor_meta / tem_meta | `metasService.progresso(0, ano)` |
| realizado | Soma de `faturamento[].valor` (série anual já carregada) |
| percentual (barra) | `min(100, realizado / valor_meta * 100)` quando `tem_meta` e `valor_meta > 0` |
| edição | `metasService.definir(0, ano, valor)` — só admin |

### Card Meta de Faturamento (mês)

| Campo UI | Origem |
|----------|--------|
| Título | `Meta de Faturamento — {MESES_NOME[MES_ATUAL-1]}/{ano}` |
| valor_meta / realizado / percentual / tem_meta | `metasService.progresso(MES_ATUAL, ano)` |
| edição | `metasService.definir(MES_ATUAL, ano, valor)` — só admin |

## Relacionamentos

```text
MetaFinanceira (mes=0, ano)  ──progresso──►  Card Anual (+ realizado client-side)
MetaFinanceira (mes=N, ano)  ──progresso──►  Card Mensal
NF status=PAGA               ──agregação──►  realizado (servidor no progresso; client no anual)
```

## Transições de estado (UI)

| Estado | Descrição |
|--------|-----------|
| visualização | Mostra meta / realizado / barra se `tem_meta` |
| edição inline | Input + Salvar/Cancelar no card; independente por card |
| sem meta | Card visível; meta “—”; sem barra; admin vê “Definir meta” |

Não há máquina de estados no backend além do upsert create/update.
