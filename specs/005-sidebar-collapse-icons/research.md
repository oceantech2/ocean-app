# Research: Barra Lateral Colapsável com Ícones

**Feature**: `005-sidebar-collapse-icons` | **Date**: 2026-07-26  
**Spec**: [spec.md](./spec.md)

## 1. Biblioteca de ícones vs. SVG inline

**Decision**: Componentes SVG inline em `frontend/src/components/navIcons.tsx` (um ícone por item de menu), no mesmo estilo de stroke já usado no `Layout` e no `PencilIcon` da Dashboard. **Não** adicionar `lucide-react` / Heroicons nesta feature.

**Rationale**: Zero dependência nova; consistente com o código atual; árvore de bundle estável; ícones fixos e poucos (~16).

**Alternatives considered**:
- `lucide-react` — rejeitado (dep nova só para nav; overkill vs. escopo fechado).
- Emoji / texto Unicode — rejeitado (inconsistente com UI e dark mode).

## 2. Onde guardar o estado colapsado

**Decision**: Estender `useUIStore` com `sidebarCollapsed: boolean`, `setSidebarCollapsed` / `toggleSidebarCollapsed`, e persistência em `localStorage` com chave por usuário, ex.: `ocean-sidebar-collapsed:{usuario}`. Valor `"true"` = colapsado; ausência ou outro valor = expandido (FR-012).

**Rationale**: Mesmo padrão de `ocean-dark`; FR-009 exige preferência por usuário logado; `usuario` já está em `useAuthStore` / `localStorage`.

**Alternatives considered**:
- Preferência só de sessão (`useState`) — rejeitado (quebra User Story 4 / SC-006).
- Preferência no backend/perfil — rejeitado (fora do escopo; overkill).
- Chave global `ocean-sidebar-collapsed` sem usuário — rejeitado (clarify: por usuário).

## 3. Momento de carregar/salvar a preferência

**Decision**:
- Ao montar o Layout (usuário autenticado): ler `localStorage` da chave daquele `usuario` e hidratar `sidebarCollapsed`.
- Em todo toggle / colapso por clique fora: atualizar store + `localStorage` imediatamente.
- No logout: não precisa limpar a chave (preferência permanece para o próximo login do mesmo usuário no browser); ao login de outro usuário, carregar a chave dele (ou default expandido).

**Rationale**: Atende cenários A/B da User Story 4; troca de usuário no mesmo browser não herda estado.

**Alternatives considered**: Limpar no logout — desnecessário e pioraria UX do retorno.

## 4. Clique fora (conteúdo) colapsa

**Decision**: No container do conteúdo (`main` ou wrapper do body à direita da sidebar), `onMouseDown`/`onClick` que chama colapso **somente se** `sidebarCollapsed === false`. Cliques na `<aside>` (itens + controle) não disparam. Não reabrir ao clicar no conteúdo (FR-015).

**Rationale**: Spec clarify; evita listeners globais frágeis no `document` (busca/modais do topo).

**Alternatives considered**:
- `mousedown` no `document` com `contains(aside)` — funciona, mas mais propenso a conflito com overlays do header; preferir escopo no `main`.
- Overlay semi-transparente — rejeitado (spec: sem drawer/overlay).

## 5. Tooltip no modo colapsado

**Decision**: No modo colapsado, cada `Link` recebe `title={label}` (nativo) e, se viável sem complexidade, `aria-label={label}`. No expandido, rótulo visível; `title` opcional.

**Rationale**: Atende FR-005 / SC-005 com zero lib; acessível a teclado no foco em muitos browsers.

**Alternatives considered**: Tooltip custom Tailwind — adiado (pode ser polish posterior se `title` for insuficiente).

## 6. Larguras e controle de colapso

**Decision**:
- Expandido: largura atual ~`w-56` (14rem).
- Colapsado: ~`w-16` / `w-[4.5rem]` — só ícone + badge, labels ocultos (`sr-only` ou não renderizar texto).
- Controle: botão no rodapé ou topo da `<aside>` (ícone chevron/painel), `aria-expanded={!collapsed}`, rótulo acessível (“Recolher menu” / “Expandir menu”).
- Transição CSS curta em `width` (`transition-[width] duration-200`) — polish, não bloqueante.

**Rationale**: SC-001 (controle encontrável), SC-004 (mais espaço), assunção de posição flexível no spec.

**Alternatives considered**: Colapso só por clique fora sem botão — rejeitado (FR-002 exige controle explícito para expandir).

## 7. Contador de notificação colapsado

**Decision**: Manter o mesmo badge numérico (`count > 0`) nos dois estados; ajustar layout (ex.: badge absoluto no canto do ícone quando colapsado) para caber na largura estreita, sem trocar por ponto.

**Rationale**: FR-008 / SC-009; clarify opção A.

**Alternatives considered**: Ponto sem número / ocultar — rejeitados na clarify.

## 8. Mapa de ícones por rota

**Decision**: Tabela estática `path → IconComponent` cobrindo todos os itens de `MENU` em `Layout.tsx` (Dashboard, Calendário, NFs, Contas, Fluxo de Caixa, Impostos, Retiradas, Bônus, DH, Colaboradores, Férias, Patrimônio, Relatórios, Auditoria, Segurança, Configurações). Ícones semanticamente relacionados; stroke `currentColor` para dark mode.

**Rationale**: FR-001; tema claro/escuro via `currentColor`.

**Alternatives considered**: Ícone genérico único — rejeitado (SC-005 / descoberta).
