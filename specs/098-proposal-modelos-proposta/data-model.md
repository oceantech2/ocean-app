# Data Model: Modelos de proposta

## ModeloProposta (novo) — tabela `propostas_modelos`

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | inteiro, PK | |
| `divisao` | texto(40), obrigatório | Uma das divisões disponíveis (`executive-search`, `offshore-talent`, `outsourcing`, `outplacement-development`) |
| `nome` | texto(120), obrigatório | Único por divisão (sem diferenciar maiúsculas na API) |
| `idioma` | texto(5), obrigatório | `pt-BR` ou `en-US` |
| `moeda` | texto(3), obrigatório | `BRL` ou `USD` |
| `setor` | texto(40), opcional | Se informado, um dos setores cadastrados |
| `projeto_escopo` | texto, opcional | HTML canônico de `normalizar_escopo` |
| `projetos` | JSONB, obrigatório | `[{"nome", "investimentos": [{"tipo","taxa_tipo","taxa","entrada"}]}]`, 1 a 10 projetos, 1 a 3 investimentos cada (mesmas regras da proposta; entrada 0–100%) |
| `shortlist`, `sla`, `garantia_texto` | texto(255), opcionais | |
| `validade_dias` | inteiro pequeno, obrigatório | 1 a 365 |
| `criado_por_usuario` | texto(255), obrigatório | Login de quem criou |
| `criado_em` | data/hora, obrigatório | UTC |
| `atualizado_por_usuario` | texto(255), opcional | Último login que editou |
| `atualizado_em` | data/hora, opcional | UTC |

**Restrições**: `UNIQUE (divisao, nome)`; `CHECK (validade_dias BETWEEN 1 AND 365)`; RLS habilitado (API pública do Supabase fechada; o backend acessa como dono).

**Relacionamentos**: nenhum. Propostas criadas a partir de um modelo copiam o conteúdo e não guardam referência (FR-010).

**Ciclo de vida**: criado → editado (n vezes) → excluído (físico). Cada transição gera um registro em `audit_logs` (entidade `ModeloProposta`).

## Proposta (existente)

Sem mudanças de schema.
