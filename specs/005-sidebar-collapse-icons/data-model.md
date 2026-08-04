# Data Model: Barra Lateral Colapsável com Ícones

**Feature**: `005-sidebar-collapse-icons` | **Date**: 2026-07-26  
**Spec**: [spec.md](./spec.md)

> Modelo de **estado de UI no client**. Não há entidades de banco nem migrations.

## Entidades

### Item de Menu

Representa uma entrada da navegação lateral (já existente no array `MENU` de `Layout.tsx`).

| Campo | Tipo | Regras |
|-------|------|--------|
| `label` | string | Rótulo visível no modo expandido; dica no colapsado |
| `path` | string | Destino React Router; chave do ícone |
| `desc` | string | Busca rápida (inalterado) |
| `permKey` | string? | Visibilidade por permissão (inalterado) |
| `adminOnly` | boolean? | Só `admin` (inalterado) |
| `notifKey` | string? | Chave do contador de notificação (inalterado) |
| `icon` | componente visual | Novo — SVG associado via mapa `path → ícone` |

**Validação**: Todo item visível MUST ter ícone distinto (FR-001). Regras de filtro por papel/permissão não mudam (FR-010).

### Estado da Barra Lateral

Preferência de apresentação da sidebar para um usuário no navegador.

| Campo | Tipo | Regras |
|-------|------|--------|
| `collapsed` | boolean | `false` = expandido (ícone+rótulo); `true` = só ícones |
| `usuarioKey` | string | Identificador do usuário logado (ex.: valor de `usuario` no auth) |

**Persistência** (client):

| Chave localStorage | Valor | Default |
|--------------------|-------|---------|
| `ocean-sidebar-collapsed:{usuarioKey}` | `"true"` \| `"false"` | ausente → expandido (`collapsed = false`) |

**Relacionamentos**:
- 1 Estado da Barra Lateral por `(navegador, usuarioKey)`.
- N Itens de Menu renderizados conforme o mesmo `collapsed`.

## Transições de estado

```text
[Expandido] --controle explícito--> [Colapsado]
[Expandido] --clique na área de conteúdo--> [Colapsado]
[Colapsado] --controle explícito--> [Expandido]
[Colapsado] --clique na área de conteúdo--> [Colapsado]  (no-op)
[sem chave / 1ª visita] --> [Expandido]
[login usuário B] --> carrega chave de B (ou Expandido)
```

Cada transição que altera `collapsed` MUST gravar imediatamente em `localStorage` na chave do usuário atual.

## Fora de escopo deste modelo

- Preferência sincronizada no servidor
- Menu overlay / drawer
- Alteração de papéis, permissões ou rotas
