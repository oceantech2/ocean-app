# Research: Imposto mensal nas propostas

## R1 — Onde guardar o imposto do mês

| | |
|---|---|
| **Decision** | Tabela nova `impostos_proposta` (ano, mês, percentual), única por (ano, mês). |
| **Rationale** | Esclarecimento: cadastro próprio em Configurações. A tabela `impostos` existente é legada (página `/impostos` redireciona ao Dashboard), exige faturamento e valor e representa alíquota efetiva calculada. `metas_financeiras.aliquota_periodo` está acoplada à meta e dispara atualização em massa de NFs. |
| **Alternatives** | Reusar `impostos.percentual_imposto` (semântica diferente, campos obrigatórios irrelevantes); reusar `aliquota_periodo` (acoplamento com metas/NFs — rejeitado pelo usuário); chave/valor em tabela de configurações (perde unicidade por mês e histórico). |

## R2 — Onde gravar o percentual aplicado na proposta

| | |
|---|---|
| **Decision** | Coluna nova `propostas.imposto_percentual NUMERIC(5,2) NULL`. Nula = proposta antiga não editada (exibe 19,55%). |
| **Rationale** | Explícita e independente das colunas `imposto_ativo`/`aliquota` da proposta simples, cuja constraint `ck_propostas_aliquota` e cálculo de total têm outra semântica. |
| **Alternatives** | Reusar `aliquota` com `imposto_ativo=true` (mistura semânticas e afeta serialização/diff da proposta simples). |

## R3 — Resolução do imposto vigente

| | |
|---|---|
| **Decision** | `imposto_vigente(db, hoje)`: registro com (ano, mês) ≤ mês corrente de São Paulo, ordenado desc, `LIMIT 1`. `origem = "mes"` se igual ao mês corrente, `"anterior"` se de mês anterior, `"padrao"` (18,75) se não houver nenhum. |
| **Rationale** | Esclarecimentos 2 e 3. Meses futuros cadastrados com antecedência nunca são usados antes da hora. |
| **Alternatives** | Bloquear geração sem mês cadastrado (rejeitado pelo usuário). |

## R4 — Integridade (hash) das propostas

| | |
|---|---|
| **Decision** | No formato novo de `conteudo_canonico`, incluir `"imposto_percentual"` **somente quando não nulo**. |
| **Rationale** | Mesmo padrão já usado para `moeda`/`projeto_escopo` no formato antigo: hashes de propostas existentes (sem o valor) permanecem idênticos; propostas novas/editadas protegem o percentual (FR-013). Assinadas não podem ser editadas, logo nunca ganham o campo. |
| **Alternatives** | Sempre incluir a chave (invalidaria hashes de pendentes existentes e exigiria regravar no boot). |

## R5 — Edição aplica o imposto vigente

| | |
|---|---|
| **Decision** | No `PUT` de proposta por modelo, `dados["imposto_percentual"] = imposto_vigente(...)`. `_diff_modelo` compara o campo; quando o valor anterior é nulo, o histórico registra `"19.55"` como anterior (o que o cliente via). Se só o imposto mudou, há nova versão. |
| **Rationale** | Esclarecimento 5 + FR-010/FR-011; reaproveita o fluxo de versões/histórico existente. |
| **Alternatives** | Recalcular só se outro campo mudar (deixaria propostas pendentes com 19,55% mesmo após "salvar"). |

## R6 — Frase na página do cliente

| | |
|---|---|
| **Decision** | Remover a frase fixa de `observacoesInvestimento` dos 4 arquivos de conteúdo e adicionar `observacaoImpostos: (percentual: string) => string` em `ConteudoDivisao`; `PaginaModelo` acrescenta a frase como último item, com `Intl.NumberFormat(idioma, { maximumFractionDigits: 2 })` sobre `dados.imposto_percentual ?? '19.55'`. |
| **Rationale** | Mantém a ordem atual (a frase já é o último item nos dois modelos), formata por idioma (18,75 / 18.75) e preserva o texto das propostas antigas. |
| **Alternatives** | Substituição de string ("19,55" → valor) no array (frágil, depende do texto). |

## R7 — Acesso do Proposal ao imposto vigente

| | |
|---|---|
| **Decision** | `GET /api/proposal/propostas/imposto-vigente` com `get_proposal_user`. Declarado antes de `/{proposta_id}` no router. |
| **Rationale** | O app Proposal usa token próprio e não acessa rotas do ERP (`require_erp`). Só leitura, sem dados sensíveis. |
| **Alternatives** | Retornar o valor só após criar (consultor não veria antes — viola FR-009). |

## R8 — Migração, RLS e seed

| | |
|---|---|
| **Decision** | Tabela criada por `create_all`; em `_migrar()`: `ALTER TABLE propostas ADD COLUMN IF NOT EXISTS imposto_percentual NUMERIC(5,2)`, `ALTER TABLE impostos_proposta ENABLE ROW LEVEL SECURITY`, `INSERT ... (2026, 10, 18.75) ON CONFLICT (ano, mes) DO NOTHING`. |
| **Rationale** | Padrão do projeto (sem Alembic); RLS segue a feature 088 para fechar a API pública do Supabase; seed idempotente não sobrescreve ajuste feito pelo admin. |
