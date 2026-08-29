# Contrato UI: Visibilidade de Páginas

**Feature**: `042-ocultar-paginas-config`

## Configurações — seção “Visibilidade de páginas”

**Local**: `frontend/src/pages/Configuracoes.tsx`, abaixo ou acima da tabela de usuários (card separado).

**Acesso**: somente `papel === 'admin'`.

**Conteúdo**:
- Título: **Visibilidade de páginas**
- Subtítulo: indica que afeta o menu de todos os usuários
- Lista com toggle/checkbox por página do [catálogo](../research.md#3-catálogo-de-páginas-e-chaves)
- **Dashboard**: item presente, toggle **desabilitado**, sempre ligado, tooltip “Sempre visível”
- **Configurações**: **não listada**
- Botão **Salvar** (toast sucesso/erro; padrão das demais páginas)

**Estados**:
- Loading spinner ao carregar config
- Salvando: botão disabled + “Salvando...”

## Menu lateral (`Layout.tsx`)

**Filtro adicional** (após regras de papel/permissão):

```text
exibir item SE paginasVisibilidade[permKey] !== false
```

Aplica-se a **admin e visualizador** (FR-005).

**Busca rápida (`/`):** mesmos itens filtrados.

## Alertas do topo (`Layout.tsx`)

Suprimir item se `paginasVisibilidade[destinoKey] === false`:

| Item | destinoKey |
|------|------------|
| NFs vencidas | `nfs` |
| Contas a vencer / vencidas / 7 dias | `contas` |
| Contas com NF pendente | `nfs` |
| Férias aguardando aprovação | `ferias` |

## Guarda de rota (`App.tsx` + `PaginaVisivelGuard`)

Para rotas ocultáveis (todas exceto `/login`, `/dashboard`, `/configuracoes`):

| Papel | Página oculta |
|-------|---------------|
| visualizador | `<Navigate to="/dashboard" replace />` |
| admin | renderiza página normalmente |

## Modal de usuário — permissões de menu

Para `papel === 'visualizador'`:
- Módulo globalmente oculto: toggle desabilitado + badge/texto **“Oculta no sistema”**
- Não permitir habilitar até reativação global

**Admin** no modal: bloco “Acesso total” inalterado.

## Catálogo compartilhado

**Arquivo**: `frontend/src/utils/paginasCatalogo.ts`

Exporta constantes consumidas por `Layout`, `Configuracoes`, `PaginaVisivelGuard` e mapeamento de alertas.

**Alinhamento obrigatório**: incluir **Patrimônio** (`patrimonio`, `/patrimonio`) — hoje em Layout mas ausente em Configurações MENUS.

## Feedback

- Salvar visibilidade: `toast.success('Visibilidade atualizada!')`
- Erro API: `toast.error(mensagemErro(...))`

## Fora de escopo UI

- Não remover rotas do React Router (módulo continua existindo).
- Não alterar conteúdo das páginas ocultas.
- Não adicionar confirmação modal ao ocultar (opcional futuro; spec não exige).
