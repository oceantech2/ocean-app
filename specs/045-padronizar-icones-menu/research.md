# Research: Padronizar ícones, menu aberto e botões

**Feature**: `045-padronizar-icones-menu` | **Date**: 2026-08-29  
**Spec**: [spec.md](./spec.md)

## 1. Persistência do menu lateral

**Decision**: Remover persistência entre visitas. Em todo mount/login autenticado, `sidebarCollapsed = false`. Recolher/expandir via controle explícito altera **apenas** o estado Zustand na sessão corrente — **sem** `localStorage.setItem` para sidebar. Opcionalmente, no hydrate, **ignorar ou remover** chaves `ocean-sidebar-collapsed:{usuario}` legadas.

**Rationale**: Clarify Q1 (sempre aberto ao entrar; ignora preferência anterior). Substitui comportamento de `005-sidebar-collapse-icons` que gravava preferência por usuário.

**Alternatives considered**:
- Manter localStorage mas só gravar expandido — rejeitado (ainda herdaria recolhido se usuário recolher na sessão e algo gravar).
- Sempre expandido sem permitir recolher — rejeitado (usuário ainda pode recolher na sessão via controle).

## 2. Clique na área de conteúdo (`main`)

**Decision**: Remover `handleMainClick` que colapsa o menu em `Layout.tsx` (linha ~117–119, `onClick` no `<main>`). Cliques no conteúdo não alteram `sidebarCollapsed`.

**Rationale**: FR-002; invertendo contrato de `005-sidebar-collapse-icons`.

**Alternatives considered**:
- Manter colapso no clique fora — rejeitado na spec/clarify.

## 3. Componentização dos botões de ação

**Decision**: Criar `ActionButton.tsx` + `actionIcons.tsx` + `actionButtonStyles.ts` com:
- Prop `variant`: `importar` | `exportar` | `criar` | `auxiliar` | `fluxo` | `editar` | `arquivar` | `desativar` | `reativar` | `excluir` | …
- Prop `context`: `header` | `row` (controla `text-sm` vs `text-xs`, padding)
- Renderização: **ícone + rótulo** visível (FR-007)
- Linha: **fundo colorido suave** por variant (FR-019)

**Rationale**: Hoje classes duplicadas em ~10 páginas; `NFs.tsx` usa botões só-ícone (`BTN_ICON w-7 h-7`) enquanto outras usam texto; unificar reduz drift.

**Alternatives considered**:
- Só documentar classes Tailwind canônicas — rejeitado (fácil regressão).
- Adicionar `lucide-react` — rejeitado (constitution V / padrão SVG inline existente).

## 4. Mapa de cores por tipo de ação (linha)

**Decision**: Reutilizar paleta já dominante no produto (Tailwind):

| Variant | Classes base (linha) |
|---------|----------------------|
| `editar` | `bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400` |
| `excluir` | `bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400` |
| `fluxo` (pagar/receber/aprovar) | `bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400` |
| `auxiliar` (docs/histórico) | `bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300` ou roxo onde já usado |
| `arquivar` / neutro | `bg-gray-100 ...` |
| `desativar` | `bg-yellow-100 text-yellow-700 ...` ou vermelho suave conforme ação |
| `reativar` | `bg-green-100 ...` |

Hover: intensificar levemente (`hover:bg-*-200`).

**Rationale**: FR-019; alinha com Contas, Fornecedores, Férias; substitui borda em Fluxo de Caixa.

**Alternatives considered**:
- Estilo só borda — rejeitado no clarify Q5.
- Cor única para todos — rejeitado (perde semântica visual).

## 5. Ordem canônica de ações

**Decision**:

**Cabeçalho** (da esquerda para a direita):  
`importar` → `exportar-csv` → `exportar-xlsx` (se houver) → `exportar-pdf` → `criar` (Novo/Nova)

**Linha**:  
`auxiliar*` → `fluxo*` → `editar` → `arquivar|desativar` → `excluir` (sempre último)

Implementação: ordenar JSX ou usar array `.map` com `sortOrder` por variant; em NFs mover `+ Nova conta a receber` para depois dos export.

**Rationale**: Clarify Q2; FR-011/FR-012.

## 6. Rótulo destrutivo

**Decision**: Substituir todas as ocorrências visíveis de **Deletar** por **Excluir** no escopo (ex.: `Contas.tsx`). Manter `window.confirm` e toasts existentes; só padronizar rótulo visível.

**Rationale**: Clarify Q4; FR-018.

## 7. Escopo de páginas

**Decision**: Migrar botões apenas em páginas de **listagem/CRUD com tabelas**:

| Incluídas | Excluídas (botões) |
|-----------|-------------------|
| NFs, Contas, Fornecedores, Férias, DH, Comissões (`Bonus.tsx`), Patrimônio, Fluxo de Caixa, Retiradas, Impostos, Calendário | **Dashboard**, **Configurações** |
| Auditoria, Segurança — incluir **se** tiverem botões de linha/cabeçalho de CRUD | |

Menu lateral: **todas** as páginas autenticadas via `Layout`.

**Rationale**: Clarify Q3; FR-017.

## 8. Ícones de ação — fonte única

**Decision**: Extrair ícones já definidos em `NFs.tsx` (`IconEditar`, `IconExcluir`, `IconPagar`, etc.) para `actionIcons.tsx`. Adicionar ícones faltantes (Importar, Exportar, Novo, Docs, Histórico) no mesmo estilo stroke `currentColor`, viewBox 24×24.

**Rationale**: FR-006; NFs já tem referência visual madura; demais páginas deixam de usar `↑`/`↓`/`+` no texto.

**Alternatives considered**:
- Manter ícones locais por página — rejeitado (FR-006).

## 9. Cabeçalho — estilo visual

**Decision**: Cabeçalho mantém estilo **borda/neutro** já usado na maioria (`px-4 py-2 border border-gray-200 ... text-sm`); primário `criar` pode usar destaque existente (`bg-blue-600 text-white` onde já houver). Foco da padronização de cor suave é **linha** (FR-019).

**Rationale**: Assumption da spec — detalhe de cabeçalho deferido; coerência via `context="header"` no `ActionButton`.

## 10. Compatibilidade com feature 005

**Decision**: Tratar como **evolução/reversão parcial** do contrato `005-sidebar-collapse-icons`: colapso manual e ícones do menu permanecem; persistência e clique-fora são removidos. Documentar delta no contrato desta feature.

**Rationale**: Evita ambiguidade para quem implementa ou valida regressões.
