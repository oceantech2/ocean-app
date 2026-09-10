# Research: Alerta de Fluxo de Caixa no Dashboard

**Feature**: `061-dashboard-alerta-fluxo` | **Date**: 2026-09-10

## 1. Fonte do % não recebida

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Calcular no client a partir do Pipeline já carregado: `metricasCompetencia(pipeline)` → `total_fechado` / `ja_recebido`; `% = (fechado − recebido) / fechado × 100` na base de `visaoReceita`. Se `fechado = 0` → % indisponível. Se `recebido > fechado` → % = 0. |
| **Rationale** | FR-002 / FR-012 / FR-003a; “Recebido” do briefing = Já Recebido por competência (`pipeline.recebido`), não Caixa. Evita endpoint duplicado. |
| **Alternatives considered** | Novo endpoint que refaz agregação de competência — rejeitado (duplica 058). Usar `receita-caixa.recebido` — rejeitado (filtro por pagamento, não fechamento). |

## 2. Aging em atenção

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Consumir `aging.d60_90` do `GET /aging-recebiveis` já existente; valor via `valorAging` / `valorPorVisao`. |
| **Rationale** | FR-005 / FR-012; bucket estável definido em 060. |
| **Alternatives considered** | Recalcular 60–90 no alerta — rejeitado. Incluir COUNT — fora do escopo. |

## 3. Próximo recebimento — API dedicada

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Novo `GET /api/relatorios/proximo-recebimento` (sem `ano`/`mes`): entre `nfs` em aberto (`data_emissao` NOT NULL, `data_pagamento` NULL, exclusões canônicas) com `data_vencimento ≥ hoje`, retornar a de `MIN(data_vencimento)`. Empate estável no servidor: maior `valor_liquido`, depois maior `valor_bruto`, depois menor `id` (resposta dual-base; UI só escolhe qual valor mostrar via toggle). Sem elegíveis → `encontrado: false`. “Hoje” = `date.today()` no servidor. |
| **Rationale** | Clarify Q1; FR-004 / FR-004a / FR-013. Ordem fixa no servidor evita oscilar quando o toggle muda. Agregar no client via `nfsService.listar` é frágil (volume/arquivadas). |
| **Alternatives considered** | MIN absoluto incluindo vencidos — rejeitado no clarify. Desempatar só pela “base ativa” no servidor — rejeitado (exigiria refetch ao toggle). Endpoint composto alerta — acopla limiar/%; preferir peça única. |

## 4. Limiar em `configuracao_app`

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Chave `limiar_alerta_fluxo`, valor texto do **inteiro** (ex. `"60"`). `GET` autenticado (default 60 se ausente); `PUT` só `admin`, validação **inteiro** `1..100` (rejeitar float/decimal). Serviço fino espelhando `paginas_visibilidade`. UI só no Dashboard. |
| **Rationale** | FR-008 / FR-008c / FR-009; clarify limiar só inteiros; tabela já existe; não misturar com `metas_financeiras` mensal. |
| **Alternatives considered** | Campo em Configuração do Período — rejeitado (clarify + FR). Decimais (1 casa) — rejeitado no clarify. Nova tabela — desnecessário. |

## 5. Decisão de exibir o banner (client)

| Decisão | Detalhe |
|---------|---------|
| **Decision** | `exibir = pctDisponivel && pctCalculado > limiar` na base ativa, usando **precisão completa** do `%` (não o texto arredondado da UI). Sem dismiss. Toggle pode ligar/desligar o banner sem refetch. Limiar editável sempre (`admin`), mesmo com banner oculto. |
| **Rationale** | FR-001 / FR-001a / FR-001b / FR-007 / FR-008b; clarify comparação + dismiss. |
| **Alternatives considered** | Comparar % arredondado a 1 casa — rejeitado (clarify). Servidor devolver `exibir` — ok mas força refetch ao mudar limiar. |

## 6. Falha parcial

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Isolar catches no `carregarDados` (padrão Dashboard): falha de Aging ou próximo → campo “indisponível” se banner ainda exibível; falha de Pipeline (sem %) → banner oculto. MUST NOT mostrar R$ 0 quando o dado falhou. |
| **Rationale** | FR-014 / FR-015; clarify falha parcial. |
| **Alternatives considered** | Esconder banner se qualquer campo falhar — rejeitado (clarify). Forçar zero — rejeitado. |

## 7. Modo só-ano

| Decisão | Detalhe |
|---------|---------|
| **Decision** | % usa Pipeline do ano (`mes` omitido / agregado anual já existente). Próximo e Aging permanecem globais. Limiar inalterado. |
| **Rationale** | Spec edge case; Pipeline já agrega ano em 056/058. |
| **Alternatives considered** | Desabilitar alerta no modo só-ano — não pedido. |

## 8. Testes

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Validação manual via [quickstart.md](./quickstart.md) + lint/type-check; smoke limiar + próximo-recebimento. |
| **Rationale** | Padrão 056–060. |
| **Alternatives considered** | pytest de empate de vencimento — opcional futuro. |
