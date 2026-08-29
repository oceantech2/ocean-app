# Research: Ocultar Páginas — Configuração em Settings

**Feature**: `042-ocultar-paginas-config` | **Date**: 2026-08-27

## 1. Onde persistir a configuração global

**Decision**: Tabela `configuracao_app` com par chave/valor; registro único `paginas_visibilidade` contendo JSON `Record<permKey, boolean>` (`true` = visível, `false` = oculta).

**Rationale**: Spec exige servidor compartilhado. O projeto não tem store de settings de app; key-value é a forma mínima (constituição V). Permissões de usuário já usam JSON em texto — padrão familiar.

**Alternatives considered**:
- Coluna em `UsuarioApp` — rejeitado (config é global, não por usuário).
- Arquivo/env no backend — rejeitado (não compartilhável entre instâncias Render/Docker sem volume).
- `localStorage` — rejeitado pela spec e clarify.

## 2. Endpoints e hidratação no cliente

**Decision**:
- `GET /api/configuracoes/paginas-visibilidade` — qualquer usuário autenticado.
- `PUT /api/configuracoes/paginas-visibilidade` — somente admin.
- Incluir campo `paginas_visibilidade` nas respostas de `POST /auth/token` (login) e `GET /auth/me`.

**Rationale**: Menu e guarda de rota precisam da config em toda sessão; embutir no auth evita fetch extra no carregamento inicial. PUT separado para a seção de Configurações (admin salva e atualiza store local).

**Alternatives considered**:
- Só GET dedicado no mount do Layout — rejeitado (flash de menu incorreto antes do fetch).
- WebSocket/polling — rejeitado (alterações raras; reload ou re-login aceitável).

## 3. Catálogo de páginas e chaves

**Decision**: Arquivo único `frontend/src/utils/paginasCatalogo.ts` exportando lista ordenada com: `key`, `label`, `path`, `desc`, `ocultavel`, `adminOnly?`, `alertDestino?` (mapeamento alerta → key).

Chaves alinhadas ao `permKey` existente em `Layout.tsx` e ao JSON de permissões em `Configuracoes.tsx`. Incluir **Patrimônio** (`patrimonio`) em Configurações (hoje ausente).

Páginas **não ocultáveis**:
- `dashboard` — listada com toggle desabilitado (sempre visível).
- `configuracoes` — fora da lista (admin-only fixo).

**Rationale**: FR-002/FR-003; evita drift entre menu, settings e permissões. Clarify: Dashboard não ocultável.

**Alternatives considered**:
- Manter três listas separadas — rejeitado (risco de Patrimônio/DH inconsistentes).

## 4. Guarda de rota e redirect

**Decision**: Componente `PaginaVisivelGuard` envolvendo rotas ocultáveis em `App.tsx`. Se página oculta **e** papel `visualizador` → `<Navigate to="/dashboard" replace />`. Se **admin** → renderiza children normalmente.

**Rationale**: FR-006; espelha redirect de `/relatorios` → `/dashboard` (feature 022). Admin bypass por URL conforme clarify.

**Alternatives considered**:
- Guard só no Layout — rejeitado (URL direta bypass menu).
- Bloquear admin também — rejeitado (clarify C).

## 5. Alertas do menu

**Decision**: Em `Layout.tsx`, filtrar array `alertas` excluindo itens cujo destino (`/nfs`, `/contas`, `/ferias`) mapeia para `permKey` com visibilidade `false`.

**Rationale**: FR-012; clarify A (suprimir, não redirecionar). Implementação local sem alterar contagens em `useNotificacoes`.

**Alternatives considered**:
- Suprimir no hook — rejeitado (hook não conhece destino de navegação; Layout já monta alertas).

## 6. Seed e estado inicial

**Decision**: Na migração inline de `main.py`, após criar tabela, inserir registro default se ausente:

```json
{
  "dashboard": true,
  "calendario": true,
  "nfs": true,
  "contas": true,
  "fluxo_caixa": true,
  "impostos": true,
  "retiradas": true,
  "bonus": true,
  "dh": false,
  "colaboradores": true,
  "ferias": true,
  "patrimonio": true,
  "auditoria": true,
  "seguranca": true
}
```

**Rationale**: FR-011 — DH oculta na implantação; demais visíveis. `INSERT ... ON CONFLICT DO NOTHING` preserva instalações que já alteraram a config.

**Alternatives considered**:
- Migration Alembic — rejeitado (projeto usa `_migrar()` inline).
- Ocultar DH só via script manual — rejeitado (clarify B).

## 7. Permissões de visualizador vs visibilidade global

**Decision**: No modal de usuário em `Configuracoes.tsx`, ocultar ou desabilitar toggles de módulos globalmente ocultos; exibir indicação “Oculta no sistema”. Permissões JSON existentes **não** são apagadas.

**Rationale**: FR-007, FR-008, FR-009. Precedência global documentada na spec.

**Alternatives considered**:
- Limpar permissão no PUT global — rejeitado (FR-009 proíbe exigir recadastro).
