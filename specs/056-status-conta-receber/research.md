# Research: Status Derivado + Pipeline de Receita

**Feature**: `056-status-conta-receber` | **Date**: 2026-09-10

## 1. Mapeamento Conta a Receber → tabela `nfs`

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Conta a Receber do briefing = entidade `NF` / tabela `nfs`. Datas: fechamento → `data_ent_pgto`; emissão → `data_emissao`; recebimento → `data_pagamento`. Valor do Pipeline → `valor_liquido`. |
| **Rationale** | Cadastro já rotula `data_ent_pgto` como “Data de fechamento”; emissão e pagamento/recebimento já existem; spec assume visão líquida até o toggle (Seção 02). |
| **Alternatives considered** | Usar `data_emissao` como universo (padrão atual de `resumo-financeiro`) — rejeitado: FR-007 exige fechamento. Usar `valor_bruto` — rejeitado: assumption explícita de líquido. |

## 2. Status de ciclo vs status legado

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Status de ciclo é **derivado em tempo de leitura** (prioridade: `data_pagamento` preenchido ⇒ Recebido; senão `data_emissao` preenchida ⇒ Faturado · Ag. Pagamento; senão A Faturar). **Não** persistir; **não** alterar enum `StatusNF` nem a coluna `status` da listagem NFs. |
| **Rationale** | Spec FR-001/FR-015; enum legado (`paga`/`pendente`/`vencida`/`cancelada`) serve outros fluxos (e-mail, metas, Impostos). |
| **Alternatives considered** | Substituir coluna Status na página NFs — fora de escopo. Migrar enum para os 3 estágios — alto rework e quebra cancelada/vencida. |

### Algoritmo canônico

```text
se data_pagamento IS NOT NULL → recebido
senão se data_emissao IS NOT NULL → faturado_ag_pagamento
senão → a_faturar
```

## 3. Universo do Pipeline (exclusões)

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Incluir apenas `excluida_em IS NULL` e `status != cancelada`. **Incluir arquivadas** (`arquivada` true ou false), alinhado aos KPIs de receita do Dashboard (`resumo-financeiro`, DRE, metas), que hoje **não** filtram `arquivada`. |
| **Rationale** | Clarify: cancelados/excluídos fora; arquivados = comportamento vigente. Nos KPIs de receita o vigente é incluir arquivadas. Listagem NFs exclui arquivadas por default — não é a base normativa dos cards de receita. |
| **Alternatives considered** | Excluir arquivadas (como `nfsService.listar`) — rejeitado para não criar regra nova divergente dos KPIs. Incluir canceladas — rejeitado pelo clarify. |

## 4. Filtro de período

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Filtrar por ano/mês de **`data_ent_pgto`**. Com `mes` informado: ano+mês. Com `mes` omitido/null (visão anual do Dashboard): todos os meses do `ano` com `data_ent_pgto` não nula. Registros sem `data_ent_pgto` **não** entram (não há “fechamento”). |
| **Rationale** | FR-007; Dashboard já passa `ano` e `mes` (ou ano com `mes_ate` em outros cards). Pipeline “Fechado no mês” no mockup é mensal; na visão anual, agregar o ano inteiro mantém o card útil sem inventar mês default. |
| **Alternatives considered** | Sempre exigir `mes` — rejeitado: Dashboard permite ano sem mês. Usar COALESCE(emissão, fechamento) — rejeitado: foge do briefing. |

## 5. Onde agregar (API vs client)

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Novo endpoint `GET /api/relatorios/pipeline-receita?ano=&mes=` retornando totais por estágio (valor, contagem, percentual). Frontend só renderiza. |
| **Rationale** | Universo por `data_ent_pgto` + inclusão de arquivadas diverge da listagem NFs; agregar no backend evita carregar milhares de linhas e garante SC-002 (soma = fechado) no servidor. |
| **Alternatives considered** | Agregar no client a partir de `nfsService.listar` — rejeitado: default exclui arquivadas e filtra status; risco de divergência. Estender `resumo-financeiro` — rejeitado: mistura conceitos (emissão vs fechamento) e aumenta acoplamento. |

## 6. UI / colocação do card

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Card novo na seção **Receita** do `Dashboard.tsx`, com quatro blocos: Fechado no mês + três estágios; badges canônicos (sem NF / NF emitida / pago); cores distintas alinhadas ao mockup (âmbar / azul / verde), sem pixel-perfect. Sem campo editável de status. |
| **Rationale** | Spec FR-006/FR-013; constitution IV (padrão Dashboard). |
| **Alternatives considered** | Página nova — rejeitado (escopo Dashboard). Substituir cards de Receita existentes — fora de escopo (Seções 05–06). |

## 7. Percentuais e zero

| Decisão | Detalhe |
|---------|---------|
| **Decision** | `percentual = (valor_estagio / valor_fechado) * 100` quando `valor_fechado > 0`; senão `null` ou 0 com label “—” no UI (sem NaN). Contagens seguem a mesma identidade: soma dos COUNT dos três estágios = COUNT fechado. |
| **Rationale** | Edge case da spec; evita divisão por zero. |

## 8. Testes

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Validação manual via quickstart + lint/type-check; sem introduzir suíte pytest nesta feature (repo sem padrão estabelecido para dashboard). |
| **Rationale** | Consistente com plans 047/040; quickstart cobre SC-001–007. |
| **Alternatives considered** | Criar pytest agora — adiado; pode ser tarefa futura se o time padronizar testes de agregação. |
