# Contrato UI: Contas a Pagar e Receber — botão +1

**Feature**: `071-contas-salvar-mais-um` | **Date**: 2026-09-14  
**Spec**: [spec.md](../spec.md) · **Modelo**: [data-model.md](../data-model.md) · **Research**: [research.md](../research.md)

## Superfícies

| Página | Arquivo | Rota | Modal |
|--------|---------|------|-------|
| Contas a Pagar | `frontend/src/pages/Contas.tsx` | `/contas` | Nova conta a pagar |
| Contas a Receber | `frontend/src/pages/NFs.tsx` | `/nfs` | Nova conta a receber |

Papéis: **admin** vê e usa +1 na criação; **visualizador** sem criação / sem +1.

## Footer da modal — criação

| Botão | Visível | Comportamento |
|-------|---------|---------------|
| Cancelar | sim | Fecha modal; não grava a tentativa atual; registros já salvos via +1 permanecem |
| **+1** | sim (só criação) | Valida e cria (mesmo POST do Salvar); toast sucesso; **não** fecha; aplica form pós-+1; limpa anexo; recarrega listagem |
| Salvar | sim | Valida e cria; toast sucesso; **fecha** modal (inalterado) |

Ordem sugerida: `Cancelar` · `+1` · `Salvar`.

### Rótulos e a11y do +1

| Aspecto | Valor |
|---------|-------|
| Texto do botão | `+1` |
| `title` / `aria-label` | `Salvar e cadastrar mais um` |
| Durante gravação | Desabilitado (junto com Salvar) enquanto `salvando`; texto do Salvar pode continuar “Salvando…” |

Estilo: secundário/outline (não substituir o destaque do Salvar primário).

## Footer da modal — edição

| Botão | Visível |
|-------|---------|
| Cancelar | sim |
| Salvar | sim |
| **+1** | **não** |

## Form pós-+1 (obrigatório)

### Contas a Pagar

- Copiar: descrição, categoria, subcategoria, valor, vencimento, fornecedor, caixa, tipo (fixo/variável).
- Limpar: `data_pagamento`, arquivo de NF/comprovante pendente.
- Manter modo criação (`editando = null`).

### Contas a Receber

- Copiar: título/subtítulo (`posicao`/`razao_social`), tipo, valores/alíquota, datas de fechamento/vencimento, caixa, linhas de comissão/bônus do form.
- Limpar / reset: `pagamento_estado = pendente`, `data_pagamento`, `numero` (NF), `data_emissao`, arquivo de anexo pendente.
- Manter `criando = true`.

## Feedback

| Evento | UX |
|--------|-----|
| +1 sucesso | Toast de criação (mesma família do Salvar); modal permanece; listagem/cards atualizam |
| Validação falha | Toast de erro; modal e form intactos; nada persistido |
| Erro de API | Toast; modal e form intactos |
| Upload de anexo falhou após create | Seguir padrão já usado no Salvar da página; se a conta já existir, +1 ainda deve deixar a modal pronta para o próximo (form pós-+1) |

## Fora deste contrato

- Seleção múltipla / pagar-receber em massa na listagem.
- +1 na edição ou em outras páginas.
- Novos endpoints REST.
- Mudança de rótulos canônicos de campos já definidos em specs anteriores.
