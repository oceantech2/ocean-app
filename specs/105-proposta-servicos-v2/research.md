# Research: Propostas v2

## 1. Fonte de verdade

**Decision**: Usar `ocean-propostas-v2.zip` (`src/content.js`, `render.js`, `brand.js`, `app.html`, `img/`) como referência de conteúdo, UI e CSS de impressão.

**Rationale**: Pacote entregue pelo time comercial/design (11/2026) com LEIA-ME de portabilidade.

**Alternatives**: Incremental patch no `PaginaModelo` atual — rejeitado: CSS/estrutura e conteúdo divergem demais.

## 2. Identidade da proposta no banco

**Decision**: Introduzir `modelo = "ocean"` (versão 1) + coluna JSONB `servicos` (lista de ids). Legado continua com executive-search etc.

**Rationale**: Check constraints atuais exigem `modelo <> 'simples'` com campos de consultor/setor; um id unificado evita explode de “modelos” por serviço.

**Alternatives**: Remover coluna `modelo` — rejeitado: migração grande e quebra MCP/listagens.

## 3. Mapeamento legado

**Decision**: Na leitura, se `servicos` vazio: executive-search / outsourcing / offshore-talent → `["recrutamento-e-selecao"]`; outplacement-development → `["outplacement"]`. Página pública: se `modelo != ocean`, manter renderer antigo; opcionalmente ocean+servicos derivados só em cópia/nova.

**Rationale**: LEIA-ME do zip; não reescrever PDF legado nesta feature.

## 4. Observações

**Decision**: Persistir `observacoes_investimento` e `observacoes_garantias` como arrays JSONB. UI mescla padrões dos serviços até edição manual.

**Rationale**: Protótipo; permite customizar sem perder default por serviço.

## 5. Rótulo de impostos

**Decision**: Substituir `Impostos (até {imposto})` → `Impostos ({imposto})` e `Taxes (up to {imposto})` → `Taxes ({imposto})`.

**Rationale**: Pedido explícito do usuário vs. texto do zip.

## 6. PDF

**Decision**: Portar bloco `@page` / `.pf` / `@media print` de `render.js`; mobile só em `@media screen`.

**Rationale**: Corrige cabeçalho Chrome e quebras; já validado no protótipo (2–3 páginas nos casos de teste).

## 7. Modelos de proposta (098/104)

**Decision**: Cadastro de modelos passa a usar `servicos` no lugar de `divisao` como eixo principal (manter coluna `divisao` mapeada para `ocean` ou primeiro serviço conforme tasks). Seletores por seção da 104 saem do formulário novo.

**Rationale**: Spec FR-010; formulário v2 não tem divisão.
