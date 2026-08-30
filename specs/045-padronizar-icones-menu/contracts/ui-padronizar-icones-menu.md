# Contracts: Padronizar ícones, menu aberto e botões

**Feature**: `045-padronizar-icones-menu` | **Date**: 2026-08-29  
**Delta REST**: nenhum — feature só de UI.

## 1. REST

Sem endpoints novos ou alterados.

## 2. Contrato de UI — menu lateral (delta sobre 005)

**Superfície**: `Layout` autenticado — `<aside>` + `<main>`.

### Estados visuais

| Estado | Comportamento |
|--------|---------------|
| Expandido (default em **todo** mount/reload) | Ícone + rótulo; largura ~`w-56` |
| Colapsado (sessão) | Só ícones; largura ~`w-16`; tooltip/`title` |

### Interação (alterações vs. 005)

| Elemento | Contrato |
|----------|----------|
| Mount / reload / login | `sidebarCollapsed = false` sempre (FR-001) |
| Clique em `<main>` | **No-op** — não colapsa nem expande (FR-002) |
| Controle explícito na aside | Alterna expandido/colapsado (FR-003) |
| Persistência | **Nenhuma** entre visitas; estado só na sessão (FR-004) |
| Chaves legadas `ocean-sidebar-collapsed:*` | Ignoradas ou removidas no hydrate |

Demais itens (ícones, contadores, permissões, tooltips colapsado) permanecem como em `005-sidebar-collapse-icons`.

## 3. Contrato de UI — botões de listagem/CRUD

**Superfície**: páginas no escopo (ver [data-model.md](../data-model.md)); **exclui** Dashboard e Configurações.

### Cabeçalho

| Regra | Contrato |
|-------|----------|
| Ordem | importar → exportar CSV → exportar planilha → exportar PDF → criar |
| Criar | Sempre **último** do grupo |
| Conteúdo | Ícone + rótulo visível |
| Tamanho texto | `text-sm` uniforme (`context="header"`) |
| Prefixos `↑` `↓` `+` | Substituídos por ícones |

### Linha de tabela

| Regra | Contrato |
|-------|----------|
| Ordem | auxiliar → fluxo → editar → arquivar/desativar → excluir |
| Excluir | Sempre último; rótulo **Excluir** |
| Conteúdo | Ícone + rótulo visível (não só ícone) |
| Estilo | Fundo colorido suave por variant (`context="row"`) |
| Tamanho texto | `text-xs` uniforme entre listagens |
| Desabilitado | Mesma posição/variant; estado visual disabled |

### Modal CRUD (aberto da listagem)

| Regra | Contrato |
|-------|----------|
| Rodapé | Cancelar antes de Salvar/Criar/Confirmar |
| Tamanho | Mesmo padrão de botões de cabeçalho |

## 4. Componentes compartilhados

```text
actionIcons.tsx     → export Icon* por tipo de ação
actionButtonStyles.ts → VARIANT_STYLES[variant][context]
ActionButton.tsx    → props: variant, context, label, onClick, disabled?, icon?
```

Páginas no escopo SHOULD usar `ActionButton` em novas/edited actions; ícones MUST vir de `actionIcons.tsx`.

## 5. Store (Zustand)

```text
useUIStore:
  sidebarCollapsed: boolean        // default false; session-only
  setSidebarCollapsed(collapsed)    // NÃO grava localStorage
  toggleSidebarCollapsed()          // NÃO grava localStorage
  hydrateSidebarCollapsed(usuario)  // force false; opcional removeItem legado
```

## 6. Fora do contrato

- Botões em Dashboard.tsx e Configuracoes.tsx
- Endpoints de preferência de UI
- Redesign de cores institucionais ou ordem de itens do menu
