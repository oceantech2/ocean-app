# Contrato UI: Headers Fixos em Tabelas com Scroll

**Feature**: `073-tabelas-header-fixo`  
**Modelo**: [data-model.md](../data-model.md) · **Research**: [research.md](../research.md)

## Padrão completo (páginas de listagem)

**Referência visual**: Contas a Pagar (`Contas.tsx`).

| Aspecto | Contrato |
|---------|----------|
| Container da grade | Rolagem própria (`overflow-auto`) com altura máxima equivalente a `max-h-[calc(100vh-22rem)]` |
| Cabeçalho | Permanece visível no topo da área de rolagem ao scroll vertical |
| Fundo do cabeçalho | Opaco em tema claro e escuro (linhas não “vazam” pelo texto) |
| Scroll horizontal | Cabeçalho permanece alinhado às colunas |
| Controles no cabeçalho | Continuam clicáveis (ordenação, seleção, etc.) |
| Filtros / CTAs da página | Fora da área rolável da tabela |

### Classes canônicas (equivalência Contas)

Quando existir `frontend/src/utils/tableScroll.ts`, as páginas MUST usar as constantes exportadas (ou classes pixel-equivalentes):

- Container: `overflow-auto max-h-[calc(100vh-22rem)]` (+ estilos de card já existentes)
- `th`: `sticky top-0 z-10 bg-gray-50 dark:bg-gray-700` + sombra inferior Contas

## Exceção: NFs (Contas a receber)

| Aspecto | Contrato |
|---------|----------|
| Header congelado | Mantido via grade dual sincronizada atual |
| Retrofit Contas | **Proibido** se regredir sync horizontal ou coluna sticky à esquerda |
| Aceite | Usuário vê títulos ao rolar o corpo — SC-001 cumprido |

## Exceção: Dashboard

| Aspecto | Contrato |
|---------|----------|
| `max-h` estilo Contas | **Não** aplicar nos blocos da home |
| Sticky | Só se a tabela já tiver scroll próprio |
| Estado atual | Sem `<table>` HTML de listagem — sem obrigação de mudança |

## Exceção: Modais / painéis

| Aspecto | Contrato |
|---------|----------|
| `max-h` estilo Contas | **Não** forçar |
| Sticky nos `th` | Obrigatório apenas quando o modal ou a tabela já rolam |
| Fundo | Opaco se sticky for aplicado |

## Páginas no escopo do padrão completo

- Contas (referência)
- Fornecedores, Férias, DH, Bônus/Comissões, Patrimônio, Impostos, Retiradas, Auditoria, Configurações
- Fluxo de Caixa (cada tabela de listagem)
- Demais listagens tabulares de página que existirem com `<table>` (exceto Dashboard/modais/NFs conforme acima)

## Fora de contrato

- Alteração de endpoints, payloads, permissões
- Impressão / sticky na mídia print
- Unificação estrutural de NFs com Contas
