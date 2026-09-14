# Research: Resultado Competência fixo em líquido

**Feature**: `068-resultado-comp-liquido`  
**Date**: 2026-09-14

## 1. Como obter receita de competência sempre líquida

| | |
|--|--|
| **Decision** | Usar diretamente `pipeline.fechado.valor_liquido` (normalizado com `Number(...) \|\| 0`) como `receita_comp` no `calcularResultado`, **sem** `valorPorVisao(..., visaoReceita)`. |
| **Rationale** | Spec exige equivalência ao Total Fechado líquido e estabilidade ao toggle. O payload dual-base do Pipeline (`057`) já expõe `valor_liquido`. |
| **Alternatives considered** | (a) Forçar `visaoReceita === 'liquido'` só no card — mais frágil; (b) endpoint novo só-líquido — overkill; (c) congelar snapshot no clique — rejeitado pelas assumptions da spec. |

## 2. Resultado Caixa permanece no toggle

| | |
|--|--|
| **Decision** | Manter `receitaCaixaValor = valorPorVisao(recebido.liquido, recebido.bruto, visaoReceita)` e `calcularResultado` inalterado para Caixa. Sem subtítulo “base líquida” no Caixa. |
| **Rationale** | Clarify Q1 + FR-004 / FR-010. Evita regressão (SC-003). |
| **Alternatives considered** | Travar Caixa também em líquido — rejeitado na clarificação (opção A). |

## 3. Subtítulo canônico “base líquida”

| | |
|--|--|
| **Decision** | Exibir **sempre** o subtítulo fixo **“base líquida”** no card Resultado Competência (toggle Bruto ou Líquido; mês ou só-ano). Não usar a frase “Não alterna com Bruto/Líquido” como texto canônico. |
| **Rationale** | Clarify Q2 (opção B). SC-007 e FR-009 tornam o hint obrigatório e explícito sobre a **base**, não só sobre o comportamento do toggle. |
| **Alternatives considered** | (A) Sem indicação — rejeitado; (C) hint só em Bruto — rejeitado; reutilizar microcopy de Impostos — rejeitado em favor do texto canônico da clarificação. |

## 4. Fórmulas de despesa e `calcularResultado`

| | |
|--|--|
| **Decision** | Reutilizar `despesasTotais.fixas + variaveis` e `calcularResultado(receita, despesasTotais)` de `059` sem alterar a função. |
| **Rationale** | Só muda o **insumo** `receita` de competência; pct continua `null` se receita ≤ 0. |
| **Alternatives considered** | Nova função `calcularResultadoCompetencia` — desnecessária. |

## 5. Backend / contratos REST

| | |
|--|--|
| **Decision** | Nenhuma mudança de API. Pipeline e receita-caixa já entregam dual-base. |
| **Rationale** | Seleção de base e subtítulo são responsabilidade do cliente. |
| **Alternatives considered** | Flag `base=liquido` no GET — complexidade sem ganho. |

## 6. Relação com Total Fechado na aba (toggle em Bruto)

| | |
|--|--|
| **Decision** | Aceitar que, com toggle em Bruto, a aba Por Competência pode mostrar Total Fechado bruto enquanto Resultado Competência usa líquido — intencional (US2). O subtítulo “base líquida” mitiga a aparente inconsistência. |
| **Rationale** | Spec explícita; evitar forçar a aba a líquido. |
| **Alternatives considered** | Forçar aba Competência a líquido — escopo maior e conflita com toggle global. |

## 7. Gap de implementação atual

| | |
|--|--|
| **Decision** | Tratar como trabalho restante: (1) garantir cálculo em `valor_liquido` (já presente no working tree); (2) substituir microcopy “Não alterna com Bruto/Líquido” por **“base líquida”**; (3) garantir que Caixa não ganhe o subtítulo. |
| **Rationale** | Código parcialmente alinhado ao FR de cálculo; UI ainda não bate FR-009/SC-007. |
| **Alternatives considered** | Reverter cálculo e refazer — desnecessário se o baseline já está correto. |

## Resolved NEEDS CLARIFICATION

Nenhum item técnico em aberto após research + clarify (2/2).
