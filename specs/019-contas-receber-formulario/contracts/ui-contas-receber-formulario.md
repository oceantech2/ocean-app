# Contrato UI: Contas a Receber — Subtítulo, Recebido e Caixa oculta

**Feature**: `019-contas-receber-formulario` | **Date**: 2026-08-12  
**Spec**: [spec.md](../spec.md) · **API**: [api-contas-receber-formulario.md](./api-contas-receber-formulario.md)

## Superfície

| Item | Valor |
|------|-------|
| Página | Contas a Receber (`frontend/src/pages/NFs.tsx`) |
| Rota | `/nfs` (inalterada) |
| Papéis | admin cria/edita/Recebido; visualizador só consulta |

## Rótulos canônicos (esta página)

| Dado | Rótulo UI |
|------|-----------|
| `posicao` | **Título** |
| `razao_social` | **Subtítulo** |
| Ação rápida / modal | **Recebido** (não Pagar) |
| Data no modal Recebido | **Data de pagamento** |

Não usar **Vaga** nem **Empresa** como rótulo desses campos no formulário nem como cabeçalhos de coluna separados. Não usar **Pagar** na ação rápida.

**Candidato** permanece na edição (rótulo inalterado). Não é o subtítulo.

## Listagem

Colunas (ordem sugerida):

**Título** (célula composta) · Origem · Método de pagamento · Bruto · Imposto · Líquido · Data ent. pgto · NF · Emissão · Vencimento · Pagamento · Status · Ações

A coluna composta:

```text
[ posicao em destaque, truncada ]
[ razao_social menor / cinza, truncada ]
```

| Estado | Linha 1 (título) | Linha 2 (subtítulo) |
|--------|------------------|---------------------|
| Ambos preenchidos | vaga | empresa |
| Sem vaga | **—** | empresa |
| Sem empresa | não ocorre em dado válido | — |

**Não** há coluna Caixa. **Não** há colunas Vaga e Empresa lado a lado.

Ação rápida: `title` e `aria-label` = **Recebido**. Ícone de confirmação inalterado. Desabilitada se `paga` / `cancelada` / arquivada.

## Modal criar / editar

### Dados Maggo (ou equivalentes)

**Título**, **Subtítulo** \*, Método de pagamento \*, Valor bruto \*, Imposto, Valor líquido \*, Data ent. pgto. Candidato só na edição (como hoje).

`*` obrigatório na criação: Subtítulo, Método, Bruto, Líquido. Título opcional.

| Origem | Título / Subtítulo |
|--------|--------------------|
| Maggo | somente leitura |
| Manual / criação | editáveis |

### Dados Ocean

NF, Data de emissão, Vencimento, Pagamento (Pendente \| Recebido). Se Recebido: **só Data de pagamento** — **sem** campo Caixa.

**Não** exibir Lead, Condução, Placement.

Payload:

- Transição para Recebido (create já recebido ou pendente→recebido): `data_pagamento` + `caixa: 'corrente'`.
- Demais PUTs: omitir `caixa` e os três `colaborador_*`.
- PUT Maggo: não enviar grupo Maggo.

Toast se Recebido sem data (no lugar de “Caixa obrigatória”).

## Modal Recebido

| Elemento | Texto |
|----------|-------|
| Título | **Recebido** (ou “Marcar como recebido”) |
| Campo | Data de pagamento \* (default = hoje) |
| Caixa | **ausente** |
| Confirmar | **Confirmar recebimento** (não “Confirmar Pagamento”) |
| Sucesso | “Marcada como recebida!” (já próximo do atual) |

PUT: `{ data_pagamento, caixa: 'corrente' }`. Sem data → toast, não chama API.

## Export CSV da página

Colunas: NF, **Título**, **Subtítulo**, Origem, Método de pagamento, Bruto, Imposto, Líquido, Data ent. pgto, Emissão, Vencimento, Pagamento, Status. **Sem Caixa**.

## Visualizador

Vê listagem composta e formulário em consulta; sem criar, editar ou Recebido; sem Caixa e sem os três colaboradores.
