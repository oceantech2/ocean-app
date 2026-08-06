# Contrato UI: Contas a Pagar — Input Manual de Valores

**Feature**: `014-contas-pagar-manual` | **Date**: 2026-08-06  
**Spec**: [spec.md](../spec.md) · **API**: [api-contas-pagar-manual.md](./api-contas-pagar-manual.md)

## Superfície

| Item | Valor |
|------|-------|
| Página | Contas a Pagar (`frontend/src/pages/Contas.tsx`) |
| Rota | `/contas` (inalterada) |
| Papéis | admin cria/edita/deleta individual; visualizador só consulta |

## Ações da página

| Ação | Admin | Visualizador |
|------|-------|--------------|
| **Nova conta a pagar** | visível | ausente |
| Importar CSV / Excel | disponível (inalterado) | ausente / sem escrita |
| Deletar todas | **ausente** | ausente |
| Editar / Deletar / Pagar | como hoje | ausente |
| Comprovantes | como hoje | consulta se já permitido |

CTA e título do modal de **criação**: **“Nova conta a pagar”** (não “Nova Conta”).

Título do modal de **edição**: preferir **“Editar conta a pagar”**.

## Listagem — valor

- Coluna Valor: formato monetário brasileiro (já existente via `fmt`).
- Contas criadas/editadas manualmente entram nos mesmos filtros, totais e exportação.

## Modal — criação / edição

| Campo | Obrigatório | Notas |
|-------|-------------|-------|
| Descrição | sim | |
| Categorias | sim | taxonomia 008 |
| Subcategoria | se RH | |
| **Valor** | sim | **máscara monetária brasileira** (R$ 1.234,56); parse → number > 0 |
| Data de vencimento | sim | |
| Data de pagamento | não | preenchida ⇒ paga; vazia ⇒ pendente; **sem** seletor Pendente\|Pago |

### Comportamentos

1. Digitação do valor com máscara BRL; bloquear salvar se parse ≤ 0 ou inválido (toast).
2. Create com data de pagamento → POST inclui `data_pagamento`; nasce paga.
3. Create sem data → POST com `data_pagamento` omitido ou null; nasce pendente.
4. Edit conta paga: valor editável; salvar envia novo valor.
5. Edit: limpar data de pagamento → PUT com `data_pagamento: null` (e/ou `pago: false`); lista mostra pendente.
6. Visualizador: botão/modal de criação e ações de escrita ausentes.

## Feedback

- Sucesso: toast (criar/atualizar).
- Erro de validação local ou 422: toast com mensagem clara (`mensagemErro`).
- Loading: botão salvar desabilitado enquanto `salvando`.

## Fora deste contrato

- Redesign de layout/cards da página.
- Máscara no fluxo de importação.
- Alteração da taxonomia de Categorias.
