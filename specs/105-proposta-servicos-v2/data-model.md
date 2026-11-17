# Data Model: Propostas v2

## Serviços (catálogo fixo)

| id | Layout | Observação |
|----|--------|------------|
| inteligencia-de-mercado | cols | |
| recrutamento-e-selecao | steps (6) | |
| assessment | cols | |
| outplacement | steps (3) | |
| solucoes-personalizadas | cols | |

## Setores

Existentes + `outros` (sem foto; capa navy).

## Proposta (alterações)

| Campo | Tipo | Notas |
|-------|------|-------|
| modelo | string | novos: `ocean`; legado: executive-search… |
| modelo_versao | int | `1` para ocean |
| servicos | JSONB array string | obrigatório se modelo=ocean; 1..5 ids válidos |
| observacoes_investimento | JSONB array string | opcional |
| observacoes_garantias | JSONB array string | opcional |
| setor | string | inclui `outros` |

## Modelo de proposta (atalho)

| Campo | Notas |
|-------|-------|
| divisao | passa a aceitar `ocean` (ou mantém legado só para registros antigos) |
| servicos | JSONB — serviços pré-selecionados |
| observacoes_* | opcional, mesmo formato |

## Migração de leitura

```
modelo → servicos padrão
executive-search | outsourcing | offshore-talent → [recrutamento-e-selecao]
outplacement-development → [outplacement]
```
