# Contrato UI: Contas a Receber — Campos Maggo e Ocean

**Feature**: `018-contas-receber-campos` | **Date**: 2026-08-12  
**Spec**: [spec.md](../spec.md) · **API**: [api-contas-receber-campos.md](./api-contas-receber-campos.md)

## Superfície

| Item | Valor |
|------|-------|
| Página | Contas a Receber (`frontend/src/pages/NFs.tsx`) |
| Rota | `/nfs` (inalterada) |
| Papéis | admin preenche Ocean (e os dois grupos se manual); visualizador só consulta |

## Rótulos canônicos

| Dado | Rótulo UI |
|------|-----------|
| `posicao` | **Vaga** |
| `razao_social` | **Empresa** |
| `tipo` | **Método de pagamento** |
| `valor_bruto` | Valor bruto |
| `valor_imposto` | **Imposto** |
| `valor_liquido` | Valor líquido |
| `data_ent_pgto` | **Data ent. pgto** |
| `numero` | **NF** |
| `data_emissao` | **Data de emissão** |
| `data_vencimento` | **Vencimento** |
| `data_pagamento` | **Pagamento** (estado Pendente \| Recebido + data) |
| `status` | **Status** (somente leitura) |

Não usar “Razão social”, “Posição” ou “Tipo” como rótulo principal nesta página.

## Listagem — colunas mínimas (FR-014)

Ordem sugerida (pode compactar com truncate; sticky Ações permanece):

Vaga · Empresa · Origem · Método de pagamento · Bruto · Imposto · Líquido · Data ent. pgto · NF · Emissão · Vencimento · Pagamento · Status · Caixa · Ações

| Valor nulo | Exibição |
|------------|----------|
| NF, datas, imposto, vaga, data ent. pgto | **—** |
| Imposto `0` | `R$ 0,00` (não `—`) |

**Data ent. pgto** e **Pagamento** são colunas distintas (nunca fundir).

Export CSV da página: mesmos campos (Empresa, Vaga, Imposto, Data ent. pgto, NF, Emissão, Vencimento, Pagamento, Status, …). XLSX do backend: incluir as colunas novas quando o exportador da página for ajustado.

## Modal — dois grupos

### Dados Maggo (ou equivalentes no manual)

Vaga, Empresa, Método de pagamento, Valor bruto, Imposto, Valor líquido, Data ent. pgto. Candidato permanece no grupo Maggo na **edição** (já existia; fora da criação, como hoje).

| Origem | Editável? |
|--------|-----------|
| Maggo | somente leitura (`INPUT_RO`) |
| Manual / criação | editável; `*` só em Empresa, Método, Bruto, Líquido |

### Dados Ocean (mesmo passo)

**NF** e **Data de emissão** lado a lado (FR-010). Depois: Vencimento, Pagamento (Pendente \| Recebido), Caixa (se Recebido), Status (texto, não combo).

| Origem | NF / emissão / vencimento / pagamento |
|--------|----------------------------------------|
| Maggo | **editáveis** pelo admin (mudança vs. tela atual) |
| Manual | editáveis |
| Visualizador | tudo RO |

Validação client:

- Criação: exigir Empresa, Método, Bruto, Líquido (não exigir emissão/vencimento).
- Se NF preenchida → exigir data de emissão (toast claro).
- Recebido → Caixa + data de pagamento.

Payload Maggo PUT: **não** enviar grupo Maggo; enviar Ocean (`numero`, `data_emissao`, `data_vencimento`, pagamento, Caixa, colaboradores).

Payload create: omitir ou `null` nas datas/NF vazias (não mandar string vazia de data).

## Status na UI

Somente leitura. Badges atuais (`pendente` / `vencida` / `paga`). Conta sem vencimento e sem pagamento → badge **Pendente**.

## Fora de escopo visual

- OCR / upload / pasta de arquivos da nota.
- Combo de status.
- Recalcular líquido na tela.
- Renomear tipos (já 017).
- Filtro dedicado “sem NF” (já 016).
