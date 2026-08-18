# Data Model: Alíquota do mês no tooltip de Imposto

**Feature**: `037-contas-receber-aliquota-tooltip` | **Date**: 2026-08-18  
**Spec**: [spec.md](./spec.md)

Nenhuma tabela nova. Entidades de leitura já existentes.

## Conta a receber (NF)

Já persistida em `nfs`. Campos usados pelo tooltip:

| Campo | Uso |
|-------|-----|
| `valor_imposto` | Exibido na célula (reais ou “—”); **não** entra no cálculo da alíquota |
| `data_emissao` | Competência primária (mês/ano) |
| `data_vencimento` | Competência se emissão vazia |

Relação: N lançamentos → 1 alíquota do mês (mesmo `ano` + `mes` de competência).

## Alíquota do mês (visão calculada)

Não é linha de cadastro. Cada item de `GET /api/impostos/de-contas?ano=` representa:

| Campo | Significado |
|-------|-------------|
| `ano` | Ano consultado |
| `mes` | 1–12 |
| `percentual_imposto` | Percentual efetivo (impostos do mês ÷ faturamento líquido de NFs pagas no mês) |
| `faturamento` / `valor_imposto` | Contexto do acompanhamento; **não** no tooltip desta feature |

### Regras

1. Chave: `(ano, mes)` da competência do lançamento.
2. **Disponível** se `percentual_imposto > 0` (alinha ao “—” da página Impostos).
3. **Indisponível** se competência indefinida, ano/mês sem item, `percentual_imposto` ausente ou `≤ 0`, ou falha ao obter `de-contas`.
4. `valor_imposto` da NF nulo/ausente **não** torna a alíquota indisponível (FR-009).

## Mapa no cliente (efêmero)

Estrutura em memória na página, não persistida:

- chave `"YYYY-MM"` → `percentual_imposto` (number)
- função pura: competência da NF + mapa → texto do tooltip

Sem estado Zustand global: o mapa vive no `NFs.tsx` junto da lista.

## Transições

Não há ciclo de vida. Recarregar a lista (filtro mês/ano/status) recarrega `de-contas` dos anos presentes.
