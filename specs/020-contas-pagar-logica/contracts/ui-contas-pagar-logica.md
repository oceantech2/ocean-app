# Contrato UI: Contas a Pagar — Lógica do input manual

**Feature**: `020-contas-pagar-logica` | **Date**: 2026-08-12  
**Spec**: [spec.md](../spec.md) · **API**: [api-contas-pagar-logica.md](./api-contas-pagar-logica.md)

## Superfície

| Item | Valor |
|------|-------|
| Página | Contas a Pagar (`frontend/src/pages/Contas.tsx`) |
| Rota | `/contas` |
| Papéis | admin escreve; visualizador só consulta |

## Ações

| Ação | Admin | Visualizador |
|------|-------|--------------|
| **Nova conta a pagar** | visível | ausente |
| Importar CSV / Excel | visível | ausente |
| Deletar todas | **ausente** | ausente |
| **Pagar** (lista, só pendente/vencida) | um clique; data = **hoje**; **sem** modal de data | ausente |
| **Desfazer pagamento** (lista) | **ausente** | ausente |
| Editar / Deletar | visível | ausente |
| Coluna Origem / campo Caixa | **ausentes** | ausentes |

CTA criação: **“Nova conta a pagar”**. Modal edição: **“Editar conta a pagar”**.

## Formulário

| Campo | Obrigatório | Notas |
|-------|-------------|-------|
| Descrição | sim | |
| Categorias | sim | taxonomia 008 |
| Subcategoria RH | se RH | |
| Valor | sim | máscara BRL; > 0 |
| Data de vencimento | sim | |
| Data de pagamento | não | qualquer dia; preenchida ⇒ paga; vazia ⇒ pendente; **sem** seletor Pendente\|Pago; **sem** min/max |

### Comportamentos

1. Create sem data → pendente; com data (incl. futura) → paga.
2. Duas contas iguais: ambas aparecem; sem aviso de duplicidade.
3. Edit conta paga: valor editável; continua paga se a data permanecer.
4. Limpar data na edição e salvar → pendente (único desfazer).
5. **Pagar**: sem confirmação de data; toast de sucesso.
6. Pendente com vencimento passado: rótulo **Vencida**; ainda pode Pagar/Editar.
7. Visualizador: sem CTA nem ações de escrita.

## Feedback

- Sucesso/erro: toast (`react-hot-toast` / `mensagemErro`).
- Salvar: botão desabilitado enquanto `salvando`.

## Fora deste contrato

- Redesign de layout/cards.
- Máscara na importação.
- Modal de data no Pagar (fluxo Recebido de Contas a Receber).
