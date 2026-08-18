# Data Model: Tabela Contas a Receber — Layout da Consulta

**Feature**: `033-contas-receber-tabela` | **Date**: 2026-08-18  
**Spec**: [spec.md](./spec.md)

> Modelo de **apresentação na UI**. Não há entidades de banco, migrations nem novos campos de API. O item de Contas a Receber permanece o registro já existente (NF/conta).

## Entidades

### Área da tabela

Região de consulta da lista na página Contas a Receber.

| Campo | Tipo | Regras |
|-------|------|--------|
| Altura | restante do viewport | Abaixo de título da página, ações, filtros e cards de resumo; não é N linhas fixas |
| Rolagem vertical | interna | Só as linhas de dados; cabeçalho permanece no topo **desta** área |
| Rolagem horizontal | no cabeçalho | Controle no trilho do topo; corpo alinhado via `scrollLeft` |
| Vazia / loading | boolean implícito | Sem barras de rolagem enganosas |

**Validação**: Ao redimensionar a janela, a área acompanha o espaço restante (spec: edge case).

### Cabeçalho da tabela

Linha de nomes das colunas.

| Campo | Tipo | Regras |
|-------|------|--------|
| Nomes | lista fixa atual | Projeto, Origem, Método de pagamento, Bruto, Imposto, Líquido, Data ent. pgto, NF, Emissão, Vencimento, Pagamento, Status, Ações |
| Linhas de texto | 1–2 | Quebra permitida; acima de 2 → truncar + `title` completo |
| Fixação | topo da área | Não gruda no header do Layout / janela |
| Ordenação | inalterada | Clique no nome + ícone ▲/▼/⇅ |

### Coluna âncora esquerda (Projeto)

| Campo | Tipo | Regras |
|-------|------|--------|
| Posição | primeira coluna | `sticky` à esquerda na rolagem horizontal |
| Células de dados | inalteradas | Projeto + razão social como hoje; **sem** regra nova de duas linhas no conteúdo |

### Coluna âncora direita (Ações)

| Campo | Tipo | Regras |
|-------|------|--------|
| Posição | última coluna | `sticky` à direita (já existente, agora obrigatório) |
| Visibilidade | admin vê botões | Visualizador: coluna/cabeçalho ainda fixos; ações de escrita seguem regra atual |

### Item de Contas a Receber (existente)

Nenhuma alteração de atributos, ciclo de vida ou persistência. A feature só muda como a **grade** apresenta os registros já paginados/filtrados.

## Relacionamentos

```text
Página Contas a Receber
  ├── Faixa superior (título, botões)
  ├── Filtros
  ├── Cards de resumo (quando houver dados)
  └── Card da lista
        ├── Área da tabela
        │     ├── Cabeçalho (nomes + trilho horizontal)
        │     └── Corpo (linhas = Itens)
        └── Paginação
```

## Transições de estado (UI)

| Evento | Efeito |
|--------|--------|
| Conteúdo mais alto que a área | Aparece scroll vertical no corpo |
| Conteúdo mais largo que a área | Aparece scroll horizontal no cabeçalho |
| Usuário rola o trilho horizontal | Colunas do meio deslocam; Projeto e Ações ficam |
| Usuário rola o corpo na vertical | Cabeçalho permanece; linhas passam |
| Filtro / página / ordenação | Comportamento atual; layout da grade se mantém |
| Lista vazia ou loading | Sem viewport de scroll da grade |

## Regras de validação (layout)

- Primeira coluna fixa não pode cobrir a maior parte da largura em janela estreita: colunas do meio continuam acessíveis pelo trilho horizontal.
- Fundos das células sticky opacos (tema claro e escuro).
- Alinhamento: cada `th` permanece na mesma coluna que os `td` correspondentes após qualquer `scrollLeft`.
