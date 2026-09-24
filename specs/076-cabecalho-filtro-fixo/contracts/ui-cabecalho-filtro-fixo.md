# Contrato UI: Cabeçalho com Filtros Fixo no Scroll

**Feature**: `076-cabecalho-filtro-fixo`  
**Modelo**: [data-model.md](../data-model.md) · **Research**: [research.md](../research.md)

## Padrão geral

**Referência visual**: Fluxo de Caixa (bloco sticky título+filtros), com **offset** abaixo do header global do `Layout` (~`5.5rem`).

| Aspecto | Contrato |
|---------|----------|
| Quando aplicar | Toda tela com controles de filtro no topo da área de conteúdo, **incluindo Dashboard** |
| O que fica fixo | Título da tela, ações do topo e controles de filtro |
| O que NÃO fica fixo | Cards de KPI/resumo; conteúdo da listagem/gráficos; header global (já sticky) |
| Offset | Sticky abaixo do header da app (`top-[5.5rem]` no bloco combinado / título) |
| Fundo | Opaco em tema claro e escuro |
| Interação | Filtros e botões do cabeçalho permanecem clicáveis após rolar |
| Tabela (073) | Cabeçalho de colunas sticky **preservado**; não misturar com este contrato |
| Impressão | Sticky não obrigatório |

## Modo combinado (um bloco)

| Aspecto | Contrato |
|---------|----------|
| Estrutura | Título + filtros (+ ações) no mesmo card |
| Classes | Usar `PAGE_HEADER_COMBINED_STICKY_CLASS` (ou equivalente) de `pageHeaderSticky.ts` |
| Exemplos | Fluxo de Caixa, Dashboard (card principal de período) |

## Modo dual (dois blocos)

| Aspecto | Contrato |
|---------|----------|
| Título/ações | `PAGE_TITLE_STICKY_CLASS` — `top` = altura do header global |
| Filtros | `PAGE_FILTERS_STICKY_CLASS` — `top` = header global + altura do card de título |
| KPIs entre os blocos | Sem sticky; ao rolar, título e filtros ficam contíguos (SC-005) |
| Exemplos | Contas a Pagar; NFs quando título e filtros forem cards distintos |

## Classes canônicas (quando existir `pageHeaderSticky.ts`)

As páginas MUST usar as constantes exportadas (ou classes pixel-equivalentes):

- Combinado: `sticky top-[5.5rem] z-30` + fundo opaco do card
- Título: `sticky top-[5.5rem] z-30` + fundo opaco
- Filtros: `sticky top-[calc(5.5rem+5.5rem)] z-20` + fundo opaco (ajustar constante se o título for sistematicamente mais alto/baixo)

Z-index MUST ser **menor** que o header global (`z-50`).

## Páginas no escopo

- Dashboard
- Fluxo de Caixa
- Contas a Pagar
- Contas a Receber (NFs)
- Bônus / Comissões
- Férias
- DH
- Fornecedores
- Patrimônio
- Impostos
- Retiradas
- Auditoria

## Fora de contrato

- Telas sem filtro no topo (Calendário, Segurança, Contratos, etc.)
- Alteração de endpoints, payloads, permissões ou lógica de filtro
- Sticky do cabeçalho de colunas da tabela (feature 073)
- Bloco “Limiar do Alerta” e demais faixas secundárias do Dashboard (não fazem parte do cabeçalho de filtro)
- Impressão / sticky na mídia print
