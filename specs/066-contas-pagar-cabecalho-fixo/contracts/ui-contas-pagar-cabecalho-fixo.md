# Contrato UI: Cabeçalho Fixo — Contas a Pagar

**Feature**: `066-contas-pagar-cabecalho-fixo`  
**Modelo**: [data-model.md](../data-model.md) · **Research**: [research.md](../research.md)

## Página

**Rota / tela**: Contas a Pagar (`Contas.tsx`).

**Acesso**: inalterado (`admin` / `visualizador` conforme regras vigentes).

## Layout obrigatório

| Região | Contrato |
|--------|----------|
| Título, botões de header, cards de totais, filtros | Fora da área rolável da tabela; não somem ao rolar as linhas |
| Wrapper da listagem | Área com altura máxima e rolagem própria (vertical; horizontal se a tabela for larga) |
| Cabeçalho de colunas (`thead`) | Visível e fixo no topo do wrapper enquanto as linhas rolam |
| Fundo do cabeçalho | Opaco (tema claro/escuro); linhas não cobrem os rótulos de forma ilegível |
| Colunas | Mesmas colunas, ordenação e ações de linha de antes |

## Comportamentos

| Ação do usuário | Resultado esperado |
|-----------------|--------------------|
| Rolar para baixo na área da tabela | Linhas sobem; cabeçalho permanece no topo da área |
| Rolar de volta ao topo da área | Um único cabeçalho; sem duplicação |
| Rolar horizontalmente (se houver) | Cabeçalho e corpo permanecem alinhados |
| Exportar PDF / imprimir | Listagem completa imprimível (sem corte por `max-height` da tela) |

## API REST

Nenhum endpoint alterado ou criado.

## Proibido nesta entrega

- Sticky do cabeçalho baseado na rolagem da **página** (viewport) como solução principal
- Alterar filtros, CRUD, permissões ou colunas de negócio
- Aplicar o padrão a outras páginas “por antecipação”
- Introduzir biblioteca de tabela virtualizada só para este efeito

## Mapeamento de requisitos

| FR | Contrato |
|----|----------|
| FR-001 | Wrapper rolável + cabeçalho sticky no topo da área |
| FR-002 | Alinhamento cabeçalho–colunas (mesmo contenedor de scroll H) |
| FR-003 | Fundo opaco + z-index; sem duplicação |
| FR-004 | Dados/ações/permissões intactos |
| FR-005 | Mesmos papéis |
| FR-006 | Chrome da página fora da área rolável |
