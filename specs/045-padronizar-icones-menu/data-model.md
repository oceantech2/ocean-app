# Data Model: Padronizar ícones, menu aberto e botões

**Feature**: `045-padronizar-icones-menu` | **Date**: 2026-08-29  
**Spec**: [spec.md](./spec.md)

> Modelo de **estado de UI e catálogo de ações** no client. Sem entidades de banco nem migrations.

## Entidades

### Item de menu

Entrada da navegação lateral (`PAGINAS_MENU` / `Layout.tsx`).

| Campo | Tipo | Regras |
|-------|------|--------|
| `label` | string | Rótulo visível expandido; `title`/`aria-label` colapsado |
| `path` | string | Destino React Router |
| `icon` | componente SVG | Mesmo estilo/tamanho (`navIcons.tsx`) |
| `notifKey` | string? | Contador numérico expandido/colapsado (FR-016) |

**Validação**: FR-005, FR-010 — tamanho de texto uniforme entre itens.

### Estado do menu

| Campo | Tipo | Regras |
|-------|------|--------|
| `collapsed` | boolean | `false` no mount e após reload/login |
| `persisted` | — | **Não** persiste entre visitas (FR-004) |

**Persistência**: Nenhuma para sidebar após esta feature. Chaves legadas `ocean-sidebar-collapsed:{usuario}` ignoradas/removidas no hydrate.

### Botão de ação

Controle padronizado em listagens/CRUD.

| Campo | Tipo | Regras |
|-------|------|--------|
| `variant` | enum | Tipo semântico (ver catálogo abaixo) |
| `context` | `header` \| `row` | Define tamanho de texto/padding |
| `label` | string | Visível junto ao ícone (FR-007) |
| `icon` | componente | De `actionIcons.tsx` por variant |
| `order` | number | Posição na ordem canônica |
| `disabled` | boolean? | Mantém posição/estilo; só opacidade/cursor |

#### Catálogo de variants

| Variant | Grupo ordem | Ícone | Cor linha (fundo suave) | Rótulo canônico (ex.) |
|---------|-------------|-------|-------------------------|------------------------|
| `importar` | cabeçalho 1 | upload | n/a (header) | Importar CSV / Excel |
| `exportar-csv` | cabeçalho 2 | download | n/a | Exportar CSV |
| `exportar-xlsx` | cabeçalho 3 | download/table | n/a | Exportar Excel |
| `exportar-pdf` | cabeçalho 4 | file | n/a | Exportar PDF |
| `criar` | cabeçalho 5 | plus | n/a | Novo / Nova … |
| `auxiliar` | linha 1 | doc/history | cinza/roxo | Docs, Histórico |
| `anexar` | linha 1 | paperclip | cinza | Anexar |
| `fluxo` | linha 2 | check/pay | verde | Pagar, Receber, Aprovar |
| `rejeitar` | linha 2 | x-circle | amarelo | Rejeitar |
| `editar` | linha 3 | pencil | azul | Editar |
| `arquivar` | linha 4 | archive | cinza | Arquivar / Exibir |
| `desativar` | linha 4 | ban | amarelo/vermelho | Desativar |
| `reativar` | linha 4 | refresh | verde | Reativar |
| `excluir` | linha 5 | trash | vermelho | **Excluir** (nunca Deletar) |

## Transições de estado — menu

```text
[Mount / Reload / Login] --> [Expandido]   (sempre)
[Expandido] --controle explícito--> [Colapsado]   (sessão)
[Colapsado] --controle explícito--> [Expandido]   (sessão)
[Expandido] --clique no main--> [Expandido]   (no-op)
[Reload] --> [Expandido]   (ignora sessão anterior)
```

## Relacionamentos

- 1 `Layout` renderiza N itens de menu + estado do menu (sessão).
- Cada página no escopo compõe 0..N botões de ação mapeados ao catálogo.
- Modais de CRUD herdam rodapé: Cancelar → Confirmar (FR-013).

## Fora do escopo deste modelo

- Dashboard / Configurações (botões não padronizados)
- Preferência de menu no servidor
- Alteração de permissões ou rotas de API
