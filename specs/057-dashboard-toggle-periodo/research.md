# Research: Toggle Bruto/Líquido + Configuração do Período

**Feature**: `057-dashboard-toggle-periodo` | **Date**: 2026-09-10

## 1. Onde persistir a Configuração do Período

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Estender `metas_financeiras` (`MetaFinanceira`) com coluna `aliquota_periodo` (float, nullable). Para `mes` 1–12, o registro mensal **é** a Configuração do Período: `valor_meta` = meta líquida; `aliquota_periodo` = alíquota do mês. Meta anual (`mes=0`) **não** usa `aliquota_periodo` e permanece com o fluxo atual. |
| **Rationale** | Spec substitui a edição isolada de meta mensal; a tabela já é o upsert por mês/ano usado no Dashboard. Evita segunda fonte de verdade e migration de dados paralela. Constitution V (simplicidade). |
| **Alternatives considered** | Nova tabela `configuracoes_periodo` espelhando o briefing — rejeitada: duplicaria meta mensal e exigiria sync com `metas_financeiras`. Guardar alíquota só em settings globais — rejeitada: alíquota é por período (Simples Nacional). |

## 2. Toggle: estado e agregação

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Toggle só no **frontend** (`useState`, padrão `liquido`), resetado a cada carga/sessão do Dashboard (sem preferência no servidor). Agregações de receita que alimentam o Dashboard passam a expor **bruto e líquido** na mesma resposta (ou já o fazem, como `resumo-financeiro`); o UI escolhe a base ativa. Pipeline: estender resposta com valores nas duas bases + contagem única. |
| **Rationale** | Spec: preferência de sessão; SC-002 (mudança perceptível &lt; 5s) sem refetch a cada clique; evita visão mista. |
| **Alternatives considered** | Query `?base=bruto\|liquido` com refetch — rejeitada: latência e flicker. Persistir preferência no usuário — fora do clarificado (não exigido). |

## 3. Quais KPIs de receita entram no toggle

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Na seção Receita (e correlatos de receita já no Dashboard): Pipeline; meta mensal exibida / barra de progresso mensal; cards que hoje mostram faturamento/receita (bruto pago, líquido pago, pendente). **Não** alternar: card Impostos (valor absoluto / competência já definida); despesas; retiradas; saldos; DRE/custo quando forem despesas ou impostos absolutos — se um trecho misturar receita+despesa, só a parcela de receita segue o toggle. |
| **Rationale** | Clarify Q4; FR-007/FR-008. Hoje Receita Bruta e Receita Líquida aparecem juntas — após a feature, o card de receita “ativa” segue a base do toggle (rótulo/valor coerentes), sem exibir as duas bases ao mesmo tempo. |
| **Alternatives considered** | Só Pipeline+meta — rejeitado no clarify. Esconder Impostos no toggle Bruto — rejeitado pelo briefing. |

## 4. Fórmula de meta bruta e arredondamento

| Decisão | Detalhe |
|---------|---------|
| **Decision** | `meta_bruta = round(meta_liquida / (1 - aliquota_periodo/100), 2)` com `0 ≤ aliquota_periodo < 100`. Alíquota `0` ⇒ `meta_bruta = meta_liquida`. Rejeitar save se alíquota &lt; 0 ou ≥ 100. |
| **Rationale** | Spec FR-006 / exemplo R$ 300.000 @ 18,5% → R$ 368.098,16; SC-001 tolerância R$ 0,01. |
| **Alternatives considered** | Multiplicar por `(1+aliquota)` — rejeitado (não é o briefing). Calcular no client só — rejeitado: servidor deve devolver `meta_bruta` para consistência admin/visualizador. |

## 5. Recálculo em massa nas NFs

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Universo afetado: `nfs` com `excluida_em IS NULL`, `status != cancelada`, `data_emissao` no mês/ano da configuração. Para cada registro: set `aliquota_imposto = aliquota_periodo` e recalcular via `calcular_imposto_liquido` (`valor_imposto`, `valor_liquido`) a partir de `valor_bruto`. Sem emissão → fora do update. Confirmação: se a alíquota nova ≠ salva, API exige flag `confirmar_atualizacao_massa=true` após o client mostrar `registros_afetaveis`; senão 409 com contagem. Só meta muda → save sem flag. Cancelar no UI = não chamar save (ou chamar sem confirmar → nada persiste). |
| **Rationale** | Clarify Q2/Q3; reutiliza `backend/app/services/nf_valores.py` e o padrão de `_aplicar_recalculo_fiscal` em `nfs.py`. |
| **Alternatives considered** | Atualizar só `aliquota_imposto` — rejeitado no clarify. Job assíncrono — overkill para volume interno típico. |

## 6. API de período vs rotas atuais de meta

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Introduzir contrato dedicado de **Configuração do Período** (GET/PUT) sobre `metas_financeiras` mensal + preview de contagem. UI mensal do Dashboard **deixa de** usar o fluxo “só valor_meta” isolado; `PUT /api/metas` genérico pode permanecer para **meta anual** (`mes=0`) e compatibilidade, mas o Dashboard mensal usa só o contrato de período. `GET /metas/progresso` mensal passa a considerar `realizado` na base do toggle (ou retornar realizado bruto e líquido). |
| **Rationale** | Substituição clara da UX mensal; anual intacta. |
| **Alternatives considered** | Sobrecarregar só `PUT /metas` com alíquota opcional — ambíguo para anual e confirmação de massa. |

## 7. Migration

| Decisão | Detalhe |
|---------|---------|
| **Decision** | `ALTER TABLE metas_financeiras ADD COLUMN IF NOT EXISTS aliquota_periodo DOUBLE PRECISION` em `_migrar()` (`main.py`). Sem Alembic. |
| **Rationale** | Padrão do repositório. |
| **Alternatives considered** | Alembic — não operacional no projeto. |

## 8. Testes

| Decisão | Detalhe |
|---------|---------|
| **Decision** | Validação manual via [quickstart.md](./quickstart.md) + `npm run lint` / `npm run type-check`; smoke API 8001. |
| **Rationale** | Alinhado aos plans 056/047. |
| **Alternatives considered** | pytest de recálculo em massa — opcional futuro. |
