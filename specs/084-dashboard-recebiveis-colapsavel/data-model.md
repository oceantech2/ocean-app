# Data Model: Previsão de Recebíveis Recolhível no Dashboard

Nenhuma entidade persistida é criada ou alterada. Backend, schemas e endpoint da Previsão de Recebíveis (feature 060) permanecem intocados.

## Estado de UI (efêmero)

| Nome | Tipo | Inicial | Escopo | Descrição |
|------|------|---------|--------|-----------|
| `agingAberto` | `boolean` | `false` | Componente `Dashboard` | Indica se os cards por faixa da seção "Previsão de Recebíveis" estão visíveis |

### Transições

- `false → true`: clique (ou Enter/Espaço) no cabeçalho da seção.
- `true → false`: clique (ou Enter/Espaço) no cabeçalho da seção.
- Qualquer → `false`: novo carregamento/montagem do Dashboard.

Trocar mês, ano, visão de receita ou aba de receita **não** altera `agingAberto`.
