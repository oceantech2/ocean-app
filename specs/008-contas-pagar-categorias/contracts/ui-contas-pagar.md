# Contrato UI: Contas a Pagar (Categorias)

**Feature**: `008-contas-pagar-categorias` | **Date**: 2026-07-26  
**Spec**: [spec.md](./spec.md) · **Modelo**: [data-model.md](../data-model.md)

## Página Contas a Pagar (`/contas`)

### Rótulos

| Antes | Depois |
|-------|--------|
| Centro de Custo / Centro | **Categorias** |
| Desc. menu “por centro de custo” | Ajustar para categorias (Layout) |

Aplicar em: título de filtro, coluna/grupo da lista, modal criar/editar, export CSV headers se visíveis ao usuário, exemplo do ImportCSV.

### Ações

| Ação | Status |
|------|--------|
| Criar / editar / excluir individual | Mantém (admin) |
| Import CSV / XLSX | Mantém; exemplos com taxonomia nova |
| **Deletar todas** | **Removida** (não renderizar) |
| Marcar paga / comprovante | Mantém; permitido em pendentes |

### Formulário Categorias

1. Select **Categorias**: 7 opções (labels oficiais).
2. Se **Recursos Humanos**: select **Subcategoria** (5 opções) visível e obrigatório.
3. Se outra categoria: ocultar/limpar subcategoria.
4. Salvar bloqueado (cliente + API) se RH sem sub ou categoria vazia → toast/erro.

### Filtros

- Select categoria (inclui “Todas”).
- Se categoria = Recursos Humanos: select subcategoria opcional (“Todas as de RH” / Salário / …).
- Filtro pago existente permanece.

### Pendência

- Badge/indicação clara (ex.: “Reclassificar”) na linha/grupo quando `categoria_pendente`.
- Exibir label do valor legado de forma legível.
- Não bloquear pagar/editar outros campos.

### Papéis

- **admin**: CRUD + import (sem delete-all).
- **visualizador**: só lista/filtros; sem botões de escrita.

## Telas auxiliares (ajuste mínimo)

| Tela | Mudança |
|------|---------|
| Impostos | Continuar listando/somando contas com categoria Impostos (novo código) |
| Retiradas | Filtrar RH + Retirada Sócios; texto de ajuda se mencionar “centro de custo / Retirada de Lucro” → atualizar para nova nomenclatura mínima |
| Dashboard custo por categoria | Consumir agregação por `categoria`; labels das fatias = labels oficiais |

Sem redesign de layout dessas páginas.
