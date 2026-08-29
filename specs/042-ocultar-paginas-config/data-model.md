# Data Model: Ocultar Páginas — Configuração em Settings

**Feature**: `042-ocultar-paginas-config` | **Date**: 2026-08-27

## ConfiguracaoApp (`configuracao_app`)

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | INTEGER | PK, autoincrement | Identificador |
| `chave` | VARCHAR(64) | UNIQUE, NOT NULL | Nome da configuração |
| `valor` | TEXT | NOT NULL | Payload JSON serializado |

### Registro inicial

| chave | valor (JSON) |
|-------|----------------|
| `paginas_visibilidade` | Objeto `permKey → boolean` (ver seed em [research.md](./research.md)) |

**Invariantes**:
- Existe no máximo um registro com `chave = 'paginas_visibilidade'`.
- Chaves desconhecidas no JSON são ignoradas pelo cliente (forward-compatible).
- Chaves ausentes no JSON tratadas como `true` (visível), exceto seed inicial que define `dh: false`.
- `dashboard` sempre forçado `true` no PUT (backend valida).
- `configuracoes` não aparece no JSON (não ocultável).

## Página navegável (visão lógica, não tabela)

| Campo | Valores |
|-------|---------|
| `key` | `dashboard`, `calendario`, `nfs`, `contas`, `fluxo_caixa`, `impostos`, `retiradas`, `bonus`, `dh`, `colaboradores`, `ferias`, `patrimonio`, `auditoria`, `seguranca` |
| `path` | Rota React Router (ex.: `/dh`) |
| `visivel` | Derivado de `paginas_visibilidade[key]` |
| `ocultavel` | `false` para `dashboard`; demais elegíveis `true` |
| `adminOnly` | `true` para `auditoria`, `seguranca` (regra de papel inalterada) |

## Permissão de menu por usuário (`usuarios_app.permissoes`)

Sem alteração de schema. JSON existente permanece; **efetividade** no menu:

```text
menuItemVisivel =
  paginas_visibilidade[key] !== false   # global
  AND (admin OR permissoes[key] === true OR adminOnly bypass)
  AND (NOT adminOnly OR papel === 'admin')
```

## Alerta in-app (visão, não tabela)

| alerta | permKey destino | Comportamento se oculta |
|--------|-----------------|-------------------------|
| NFs vencidas | `nfs` | Suprimido |
| Contas vencidas / hoje / 7 dias | `contas` | Suprimidos |
| NF pendente | `nfs` | Suprimido |
| Férias aguardando | `ferias` | Suprimido |

## Estado no cliente (Zustand `useAuthStore`)

| Campo | Tipo | Origem |
|-------|------|--------|
| `paginasVisibilidade` | `Record<string, boolean> \| null` | Login, `/auth/me`, PUT visibilidade |

## Transições

```text
Deploy inicial          → dh=false, demais true (seed)
Admin oculta página X   → PUT { ..., X: false }
Admin reativa X         → PUT { ..., X: true }
Visualizador + URL X oculta → redirect /dashboard
Admin + URL X oculta    → página renderiza
Página X reativada      → menu restaurado conforme permissoes do usuário (sem migrar JSON de permissão)
```
