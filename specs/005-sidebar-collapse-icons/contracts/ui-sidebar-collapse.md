# Contracts: Sidebar Colapsável com Ícones

**Feature**: `005-sidebar-collapse-icons` | **Date**: 2026-07-26  
**Delta REST**: nenhum — feature só de UI.

## 1. REST

Sem endpoints novos ou alterados. Navegação continua usando rotas existentes do frontend; dados de notificação seguem o hook/serviço já usados pelo `Layout`.

## 2. Contrato de UI — barra lateral

**Superfície**: `Layout` autenticado — `<aside>` de navegação + área `<main>` de conteúdo.

### Estados visuais

| Estado | Largura (aprox.) | Item de menu | Contador |
|--------|------------------|--------------|----------|
| Expandido (default) | ~`w-56` | ícone + rótulo | badge numérico (como hoje) |
| Colapsado | ~`w-16` | só ícone; rótulo via `title`/`aria-label` | mesmo contador numérico (posição ajustada no ícone) |

### Controles e interação

| Elemento | Contrato |
|----------|----------|
| Botão colapsar/expandir | Visível na aside; `aria-expanded={!collapsed}`; rótulos acessíveis “Recolher menu” / “Expandir menu” |
| Clique no item | Navega para `path` nos dois estados; item ativo destacado nos dois |
| Clique em `<main>` (conteúdo) | Se expandido → colapsa; se colapsado → no-op |
| Clique dentro da aside | Nunca conta como “fora” |
| Hover/foco no item colapsado | Nome do item disponível (`title` e/ou `aria-label`) |

### Persistência (contrato client)

| Operação | Comportamento |
|----------|---------------|
| Leitura no mount | `localStorage.getItem('ocean-sidebar-collapsed:' + usuario)` → `true` só se valor `"true"` |
| Escrita em mudança | `setItem` com `"true"` ou `"false"` na chave do usuário atual |
| Troca de usuário | Rehidratar com a chave do novo usuário; não herdar estado do anterior |
| Primeira visita | Sem chave → expandido |

### Permissões

| Papel | Efeito |
|-------|--------|
| admin / visualizador / permissões granulares | Mesmo filtro de itens de hoje; todos os itens **visíveis** têm ícone e participam do colapso |

### Fora do contrato

- Overlay/drawer mobile
- Mudança de busca rápida / alertas do topo (exceto não quebrar)
- Endpoints de preferência no servidor

## 3. Store (Zustand)

```text
useUIStore:
  sidebarCollapsed: boolean
  setSidebarCollapsed(collapsed: boolean): void
  toggleSidebarCollapsed(): void
```

Persistência acoplada às actions (como `toggleDarkMode` + `ocean-dark`).
