# Research: Página Contratos

**Feature**: `052-pagina-contratos` | **Date**: 2026-09-06

## 1. Conteúdo da página: estático vs. API

**Decision**: Página 100% frontend com dois links constantes (rótulo + URL). Sem endpoint REST de contratos e sem leitura do Google Drive pela API Ocean.

**Rationale**: Spec exige apenas atalhos; escopo fechado (constituição V). Login/permissão Drive ficam no Google.

**Alternatives considered**:
- Proxy/API Drive — rejeitado (complexidade OAuth, fora do escopo).
- URLs editáveis em Configurações — rejeitado (spec fixa as URLs; mudança futura = nova entrega).

## 2. Integração ao catálogo e rotas

**Decision**:
- Adicionar em `PAGINAS_CATALOGO`:
  - `key`: `contratos`
  - `label`: `Contratos`
  - `path`: `/contratos`
  - `desc`: acesso às pastas de contratos no Google Drive
  - `ocultavel`: `true`
  - sem `adminOnly`
- Posição: após `patrimonio`, antes de `auditoria` / `seguranca`.
- Registrar `contratos: Contratos` em `PAGE_COMPONENTS` (`App.tsx`).
- Ícone em `navIcons.tsx` para `/contratos`.

**Rationale**: Menu, busca, visibilidade e permissões já consomem o catálogo; rotas ocultáveis já passam por `PaginaVisivelGuard`.

**Alternatives considered**:
- Rota manual fora do catálogo — rejeitado (drift com Configurações).
- `adminOnly: true` — rejeitado (assumption da spec: visualizador pode receber permissão).

## 3. Visibilidade global no backend

**Decision**: Incluir `"contratos": True` em `PAGINAS_VISIBILIDADE_DEFAULT` (`paginas_visibilidade.py`). `ler_paginas_visibilidade` já faz merge com defaults, então ambientes com JSON antigo ganham a chave como visível sem migração destrutiva.

**Rationale**: Sem a chave nos defaults, salvamentos/listagens de Configurações podem ignorar ou omitir a página.

**Alternatives considered**:
- Migration SQL reescrevendo o JSON — desnecessário; merge por chave resolve.
- Só frontend sem backend — rejeitado (PUT de visibilidade filtra por chaves válidas do backend).

## 4. Comportamento dos links externos

**Decision**: Elementos `<a href="..." target="_blank" rel="noopener noreferrer">` (ou equivalente acessível). Não usar `window.open` como único mecanismo.

**Rationale**: FR-004; edge case de pop-up bloqueado; segurança (`noopener`).

**Alternatives considered**:
- Navegar na mesma aba — rejeitado (spec: preservar sessão Ocean).
- Só `onClick` + `window.open` — rejeitado (pior sem JS / bloqueio de pop-up).

## 5. Layout da página

**Decision**: Página dentro do padrão Layout (título **Contratos**, texto de apoio mínimo, lista/stack com os dois atalhos). Sem cards de métricas, tabelas ou modais. Estilo alinhado ao Tailwind/dark mode existentes.

**Rationale**: FR-005; consistência visual (constituição IV).

**Alternatives considered**:
- Dashboard-like com widgets — rejeitado (fora do escopo).
- Iframe embutido do Drive — rejeitado (auth Google, UX frágil, escopo).

## 6. Permissões de visualizador

**Decision**: Mesmo fluxo das demais páginas do catálogo: toggle em Configurações ao editar visualizador; admin vê sempre (sujeito à ocultação global no menu). Sem seed especial forçando permissão em visualizadores existentes (permanecem sem acesso até o admin conceder).

**Rationale**: FR-006/FR-007; padrão já usado em Patrimônio e similares.

**Alternatives considered**:
- Liberar `contratos` automaticamente para todos os visualizadores — rejeitado (surpresa de acesso; admin decide).
