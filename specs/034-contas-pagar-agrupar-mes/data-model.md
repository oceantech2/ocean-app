# Data Model: Contas a Pagar — Agrupamento e Filtro (apresentação)

**Feature**: `034-contas-pagar-agrupar-mes` | **Date**: 2026-08-18  
**Spec**: [spec.md](./spec.md)

> Modelo de **apresentação na UI**. Sem entidades de banco, migrations ou novos campos de API. `ContaPagar` permanece o registro já existente.

## Entidades

### Conta a pagar (existente)

Atributos usados pelo agrupamento/filtro (já persistidos):

| Campo | Uso nesta feature |
|-------|-------------------|
| `valor` | Soma do total do grupo |
| `data_vencimento` | Chave do grupo mensal (`YYYY-MM`); ausente → Sem vencimento |
| `pago` / alertas | Filtro de status já existente; entra no total só se a conta passou no filtro |
| `categoria`, `subcategoria` | Filtro e agrupamento por categoria |
| `categoria_pendente` | Fora do filtro nomeado; no mês entra pelo vencimento; no modo categoria permanece no grupo de pendência |

Nenhuma transição de ciclo de vida nova (criar, pagar, reclassificar inalterados).

### Modo de agrupamento (estado de UI)

| Campo | Tipo | Regras |
|-------|------|--------|
| Valor | `categoria` \| `mes` | Padrão ao montar a página: `mes` |
| Persistência | memória da página | Perde ao desmontar a rota |
| Relação com filtros | independente | Trocar modo não limpa filtros; trocar filtros não muda o modo |

### Grupo mensal (derivado)

| Campo | Tipo | Regras |
|-------|------|--------|
| `chave` | `YYYY-MM` ou `sem-vencimento` | Só grupos com ≥ 1 conta visível |
| `rotulo` | texto pt-BR | “Agosto 2026” ou “Sem vencimento” |
| `contas` | lista | Subconjunto de `contasFiltradas` |
| `total` | número | Soma de `valor` de **todas** as contas do grupo visível (um único total) |
| `aberto` | boolean | Só no modo `mes`. Inicial: verdadeiro só no mês datado mais recente; se único grupo, verdadeiro |

**Validação**: Filtro que zera um mês → o grupo deixa de existir (não renderizar vazio).

### Grupo por categoria (existente, inalterado na forma)

Mesma chave atual (`pendente:…`, `rh:…`, código da categoria). Sempre **aberto**. Total do cabeçalho já existente permanece.

## Relacionamentos

```text
Página Contas a Pagar
  ├── Cartões de resumo (regra vigente; fora desta feature)
  ├── Filtros (categoria, sub RH, status, descrição, venc. de/até)
  ├── Controle modo: Por mês | Por categoria
  └── Lista de grupos
        └── Grupo
              ├── Cabeçalho (rótulo + total [+ abrir/fechar se modo mês])
              └── Tabela de contas (oculta se modo mês e fechado)
```

## Transições de estado (UI)

| Evento | Efeito |
|--------|--------|
| Abrir a página | Modo `mes`; colapso inicial |
| Escolher Por categoria | Grupos por categoria, todos abertos; filtros iguais |
| Escolher Por mês de novo | Reaplica colapso inicial sobre os grupos visíveis atuais |
| Abrir/fechar um mês | Só aquele grupo; demais inalterados |
| Filtro reduz a lista | Recalcula grupos; descarta chaves abertas inexistentes; se nenhuma aberta restar, abre o mês mais recente visível |
| Zero contas após filtro | Mensagem “Nenhuma conta encontrada”; nenhum grupo |

## Regras de validação

- Chave mensal não usa parse UTC de data ISO incompleta.
- “Mês mais recente” = primeira chave `YYYY-MM` na ordem decrescente, nunca `sem-vencimento`.
- Total do grupo fechado = total do grupo aberto (mesma soma).
- Visualizador: mesmos grupos e filtros; sem ações de escrita (já existente).
