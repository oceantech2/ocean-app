# Contrato UI: Contas a Receber — Novos nomes dos tipos

**Feature**: `017-contas-receber-tipos` | **Date**: 2026-08-12  
**Spec**: [spec.md](../spec.md) · **API**: [api-contas-receber-tipos.md](./api-contas-receber-tipos.md)

## Nomes visíveis (canônicos)

| Valor API | Rótulo na UI |
|-----------|----------------|
| `retainer` | Retainer |
| `sucesso` | Sucesso |
| `parcelamento` | Parcelamento |

**Proibido** nas telas desta feature: `Retainer - Abertura`, `Retainer - Fechamento`, e **Sucesso** com o significado antigo (grupo que agora é Parcelamento).

## Contas a Receber (`NFs.tsx`, rota `/nfs`)

### Listagem e exportação

Badge/coluna Tipo e CSV: só os três rótulos canônicos. Maggo e manual iguais na exibição.

### Formulário create / edit manual

Select obrigatório, três opções, **sem** pipe `retainer|abertura`:

| option value | label |
|--------------|-------|
| `retainer` | Retainer |
| `sucesso` | Sucesso |
| `parcelamento` | Parcelamento |

Default create: `retainer`. Payload: `{ tipo: form.tipo }` (sem `tipo_abertura_fechamento`).

### Edit Maggo

Tipo **somente leitura** com o rótulo canônico. Não enviar `tipo` no PUT.

### Papéis

Visualizador: vê rótulos; sem create/edit.

## DH (`DH.tsx`)

Três opções no select (mesmos rótulos). Totais: três cards (Retainer / Sucesso / Parcelamento) no lugar de dois. Preview de assunto e assunto gravado: nomes canônicos. Lista/export: rótulos canônicos.

## Relatórios (`Relatorios.tsx`)

Gráfico e texto de fechamentos por tipo: **três** fatias/legendas (Retainer, Sucesso, Parcelamento). Não somar retainer+sucesso como o par antigo.

## Dashboard (`Dashboard.tsx`)

Exibir o mix de três grupos a partir de `fechamentosPorTipo` (endpoint já chamado). Mesmos três nomes. Não reintroduzir o par retainer vs sucesso.

## Calendário

Sem mudança: a tela não mostra tipo de fechamento.

## E-mails

Só mensagens **novas** (assunto DH gerado no create). Caixa de entrada antiga intocada.

## Fora de escopo visual

- Import, exclusão, pasta de NFs.
- Reescrever histórico de auditoria na UI.
- Incluir tipo de fechamento no Calendário.
