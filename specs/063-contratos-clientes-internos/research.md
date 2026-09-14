# Research: Renomear Atalhos da Página Contratos

**Feature**: `063-contratos-clientes-internos` | **Date**: 2026-09-14

## 1. Superfície de alteração

**Decision**: Alterar somente os dois campos `rotulo` do array `ATALHOS` em `frontend/src/pages/Contratos.tsx`.

**Rationale**: Grep no frontend confirma que **Contratos ativos** e **Contratos arquivados** existem só nesse arquivo. Menu, catálogo (`label: 'Contratos'`), rota `/contratos` e descrição da página não usam os nomes antigos dos atalhos. Constituição V: menor mudança que atende a spec.

**Alternatives considered**:
- Extrair rótulos para i18n / arquivo de copy — rejeitado (o app não usa i18n; over-engineering).
- Tornar rótulos configuráveis em Configurações — rejeitado (spec fixa os textos; mudança futura = nova entrega).

## 2. Destinos (URLs) inalterados

**Decision**: Manter as URLs atuais:

| Ordem | Novo rótulo | URL (inalterada) |
|-------|-------------|------------------|
| 1 (cima) | Contratos Clientes | `https://drive.google.com/drive/u/2/folders/1pJGZNasVVx2pGdk0-mu6GA0L4x59gj9H` |
| 2 (baixo) | Contratos Internos | `https://drive.google.com/drive/u/2/folders/1t8HPQgoqgyG1wWy7CjJbDoEJoayi_PJ-` |

**Rationale**: FR-005; usuário pediu **renomear**, não trocar pastas. `key={atalho.url}` no map continua estável.

**Alternatives considered**:
- Trocar ou reordenar pastas do Drive — rejeitado (fora da spec).
- Atualizar o `u/2` da URL do Drive — rejeitado (não solicitado; risco de quebrar atalho).

## 3. Capitalização e texto canônico

**Decision**: Usar exatamente **Contratos Clientes** e **Contratos Internos** (ambas as palavras com inicial maiúscula), como no pedido do usuário. Sem “de”, sem hífen, sem minúsculas no segundo termo.

**Rationale**: Spec e input do usuário já fixam a grafia; testes de aceitação comparam o texto visível.

**Alternatives considered**:
- “Contratos de Clientes” / “Contratos-clientes” — rejeitados (não correspondem ao pedido).

## 4. Catálogo, menu e backend

**Decision**: Não alterar `paginasCatalogo.ts`, `App.tsx`, `navIcons.tsx`, `paginas_visibilidade.py` nem permissões.

**Rationale**: FR-006; título e item de menu continuam **Contratos**. A descrição do catálogo (“Acesso às pastas de contratos no Google Drive”) não cita os nomes antigos dos atalhos.

**Alternatives considered**:
- Atualizar a `desc` do catálogo para citar Clientes/Internos — rejeitado (não visível na página Contratos; spec fecha escopo nesta tela).

## 5. Artefatos históricos da feature 052

**Decision**: Não reescrever `specs/052-pagina-contratos/*`. A nomenclatura vigente passa a ser a desta feature (063).

**Rationale**: Specs históricas documentam a entrega original; reescrevê-las gera drift e não muda o produto.

**Alternatives considered**:
- Patch em 052 para refletir novos rótulos — rejeitado (histórico; a fonte de verdade da nomenclatura atual é 063).
