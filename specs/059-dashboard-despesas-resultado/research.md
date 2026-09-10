# Research: Despesas & Resultado no Dashboard

**Feature**: `059-dashboard-despesas-resultado` | **Date**: 2026-09-10

## 1. Onde agregar Despesas (client vs API)

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Agregar no **client** via reescrita de `frontend/src/utils/dashboardDespesas.ts` (`totaisDespesa`), consumindo a lista já carregada por `contasService.listar(0, 1000)` no Dashboard. Sem endpoint novo nesta entrega. |
| **Rationale** | Constitution V: a lista já existe no `carregarDados`; regras são filtros simples sobre Conta a Pagar; evita acoplar `relatorios.py` enquanto Centro/Demonstrativo (que usam vencimento/categoria) ficam intencionalmente divergentes (clarify Q1). |
| **Alternatives considered** | `GET /api/relatorios/despesas-periodo` — melhor se volume > 1000; adiar até evidência de truncamento. Duplicar agregação no DRE/`custo-por-categoria` — rejeitado (FR-019: não alterar Centro/Demonstrativo). |

## 2. Mapeamento das regras do briefing → Conta a Pagar

| Decisão | Detalhe |
|---------|---------|
| **Decision** | **Fixas**: `tipo_despesa === 'fixo'` ∧ `data_pagamento` no período. **Variáveis**: `tipo_despesa === 'variavel'` ∧ `data_pagamento` no período. **Pendentes**: `data_vencimento` no período ∧ `data_pagamento` null/ausente. Flag `pago` **ignorado** em todos os casos. Excluir `categoria` imposto (`impostos` / aliases já cobertos por `categoriaEhImpostos`). Período: mês (`mes`+`ano`) ou só-ano (`ano`, meses 1–12); manter suporte a `mesAte` YTD só se o Dashboard ainda o usar no mesmo bloco — para o card canônico Seção 07, modo só-ano = ano civil completo. |
| **Rationale** | Spec FR-002–004, FR-012–013, FR-020; clarify Q2–Q4; campos já no modelo (`tipo_despesa`, `data_pagamento`). |
| **Alternatives considered** | Heurística por categoria FIXAS/VARIAVEIS sets — legado a remover nos cards canônicos. Exigir `pago === true` — rejeitado no clarify. Inferir pagamento pela data de vencimento — rejeitado. |

## 3. Fonte de receita para Resultado (coerência FR-015)

| Decisão | Detalhe |
|---------|---------|
| **Decision** | **receita_comp** = `valorPorVisao(pipeline.fechado)` (Total Fechado / Por Competência). **receita_caixa** = `valorPorVisao(receitaCaixa.recebido)` (Recebido / Por Caixa). Ambas já dual-base no payload; toggle só escolhe a base no client. |
| **Rationale** | SC-005 / FR-015 exigem igualdade com as abas; reutilizar 056–058 evita segundo cálculo de NF. |
| **Alternatives considered** | Recalcular receita no client a partir de `nfsService.listar` — rejeitado (universo/exclusões do Pipeline). Endpoint único “resultado” no backend — desnecessário se despesas forem client-side. |

## 4. Fórmulas de Resultado e percentual

| Decisão | Detalhe |
|---------|---------|
| **Decision** | `despesas_totais = fixas + variaveis` (não inclui pendentes). `resultado_* = receita_* − despesas_totais`. `pct = receita > 0 ? (resultado / receita) * 100 : null` (omitir % se null). Helpers puros em `dashboardDespesas.ts` (ex.: `calcularResultado(receita, despesasTotais)`), substituindo o uso canônico de `lucroCard` neste bloco. |
| **Rationale** | Briefing Seção 07; FR-007–011; clarify Q5 (só valor + %). |
| **Alternatives considered** | Percentual sobre despesas — fora do briefing. Mostrar composição no card — rejeitado no clarify. |

## 5. UI: Lucro legado vs dois cards

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Remover o card único **Lucro** da seção Despesa/Resultado. Renderizar **Resultado Competência** e **Resultado Caixa** lado a lado (grid), cada um com título, valor formatado e linha de % (ou “—” / omitido se pct null). Manter os três cards de Despesa (Fixas / Variáveis / Pendentes) com rótulos atualizados se necessário (“Pagas no período” com base em data de pagamento). |
| **Rationale** | FR-006, FR-016, SC-007. |
| **Alternatives considered** | Manter Lucro + adicionar os dois — duas verdades. Ocultar Pendentes — fora do briefing. |

## 6. Centro de Despesa / Demonstrativo

| Decisão | Detalhe |
|---------|---------|
| **Decision** | **Zero alterações** em `custo-por-categoria`, DRE mensal e UI Centro/Demonstrativo nesta feature. Documentar divergência esperada no quickstart. |
| **Rationale** | Clarify Q1 / FR-019. |
| **Alternatives considered** | Alinhar gráficos agora — escopo expandido sem regra no módulo 4. Ocultar seções — rejeitado no clarify. |

## 7. Limite `listar(0, 1000)`

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Aceitar o limite atual na v1; se validação mostrar truncamento, follow-up = endpoint de agregação server-side (mesmo contrato de totais). |
| **Rationale** | Padrão atual do Dashboard; volume típico interno < 1000. |
| **Alternatives considered** | Endpoint obrigatório já nesta feature — adiado por simplicidade. |

## 8. Testes

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Validação manual via [quickstart.md](./quickstart.md) + lint/type-check frontend. |
| **Rationale** | Padrão 056–058. |
| **Alternatives considered** | Unit tests do util — opcional no implement se o time quiser; não bloqueia o plan. |
