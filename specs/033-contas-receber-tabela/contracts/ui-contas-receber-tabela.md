# Contrato de UI: Tabela Contas a Receber

**Feature**: `033-contas-receber-tabela` | **Date**: 2026-08-18  
**Página**: Contas a Receber (`/nfs`, `frontend/src/pages/NFs.tsx`)  
**Spec**: [spec.md](../spec.md)

Não há contrato REST. Este documento descreve o comportamento visual e de interação da grade.

## Superfície

| Região | Comportamento |
|--------|----------------|
| Título da página + botões | Fora da área da tabela; não rolam com as linhas |
| Filtros (mês, ano, status, cliente, paginação “exibir N”) | Fora da área da tabela |
| Cards de resumo | Fora da área da tabela, quando existirem |
| Área da tabela | Ocupa o espaço restante da tela; scroll interno |
| Paginação (números de página) | Abaixo da área da tabela, sempre visível no card da lista |

## Cabeçalho (nomes das colunas)

| Requisito | Contrato |
|-----------|----------|
| Quebra | Até 2 linhas por nome; nomes curtos podem usar 1 linha |
| Largura | Coluna não se alarga só para caber o nome em 1 linha |
| Truncamento | Acima de 2 linhas: ellipsis; nome completo em `title` (hover/foco) |
| Fixação | Permanece no topo da **área da tabela** na rolagem vertical |
| Ordenação | Clique nos nomes ordenáveis inalterado; ícone não impede leitura em 2 linhas |
| Escopo da quebra | Só os nomes do `thead`, não as células de dados |

## Âncoras horizontais

| Coluna | Contrato |
|--------|----------|
| Primeira (Projeto) | Fixa à esquerda; conteúdo de dados inalterado |
| Meio | Deslizam com o scroll horizontal |
| Última (Ações) | Fixa à direita; botões admin inalterados; visualizador sem escrita |

Cantos superiores (Projeto e Ações no `thead`) permanecem visíveis na rolagem combinada.

## Rolagem

| Eixo | Onde | Sincronização |
|------|------|----------------|
| Vertical | Corpo da área da tabela | Cabeçalho não sobe com as linhas |
| Horizontal | Trilho junto ao cabeçalho | `scrollLeft` do corpo = trilho; colunas alinhadas aos nomes |

Não exigir ir ao fim da lista nem ao rodapé da **página** para deslocar colunas. Não grudar o cabeçalho da tabela no header global do Ocean App.

## Papéis

| Papel | Layout da grade |
|-------|-----------------|
| `admin` | Igual + ações de escrita na coluna fixa |
| `visualizador` | Mesma grade e scrolls; sem ações de escrita (regra já existente) |

## Fora de escopo (não quebrar)

- CRUD, filtros, export CSV/Excel/PDF, arquivar, modal pagar/editar
- Outras páginas (Contas a Pagar, Dashboard, Fluxo de Caixa)
- API `/api/nfs` e persistência

## Estados

| Estado | UI |
|--------|-----|
| Loading | Spinner atual; sem grade de scroll |
| Zero registros | Mensagem atual; sem trilho horizontal falso |
| Poucas linhas/colunas que cabem | Conteúdo legível sem obrigar uso das barras |
