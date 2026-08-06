# Contrato UI: Contas a Receber — Inserção Manual

**Feature**: `012-contas-receber-manual` | **Date**: 2026-08-06  
**Spec**: [spec.md](../spec.md) · **API**: [api-contas-receber-manual.md](./api-contas-receber-manual.md)

## Superfície

| Item | Valor |
|------|-------|
| Página | Contas a Receber (`frontend/src/pages/NFs.tsx`) |
| Rota | `/nfs` (inalterada) |
| Papéis | admin cria/edita/arquiva; visualizador só consulta |

## Ações da página

| Ação | Admin | Visualizador |
|------|-------|--------------|
| **Nova conta a receber** | visível | ausente |
| Importar Excel/CSV | **ausente** | ausente |
| Deletar / Deletar todas | ausente | ausente |
| Pasta NFs | ausente | ausente |
| Arquivar / exportar / filtros | como hoje | só consulta/export se já permitido |

CTA e título do modal de criação: **“Nova conta a receber”** (não “Nova NF” / não “Nova receita” como rótulo principal).

## Listagem — coluna Origem

| `origem` | Exibição |
|----------|----------|
| `manual` | **Manual** |
| `maggo` | **Maggo** |

Coluna legível junto às demais (ex. após NF ou status). Export CSV/XLSX: incluir Origem quando o export da página for acionado (paridade com a tela).

## Modal — criação

Campos:

| Campo | Obrigatório | Notas |
|-------|-------------|-------|
| NF (número) | sim | |
| Razão social | sim | |
| Valor bruto / líquido | sim | |
| Data de emissão | sim | referente à nota |
| Data de vencimento | sim | |
| Tipo | sim | retainer/sucesso (+ abertura/fechamento se aplicável) |
| Pagamento | sim | **Pendente** \| **Recebido** |
| Data de pagamento | se Recebido | |
| Caixa | se Recebido | Corrente \| Investimento |

**Fora do create**: posição, candidato, colaboradores.

Validação cliente + API; toasts de erro claros; conflito de número: mensagem (+ atalho 013 se disponível).

## Modal — edição

| Origem | Campos editáveis |
|--------|------------------|
| Manual | Negócio do create + Caixa, pagamento, colaboradores, arquivar |
| Maggo | Só enriquecimento (Caixa, pagamento, colaboradores, arquivar); demais readonly |

Pagamento na edição: mesmos estados Pendente \| Recebido (mapeados a `data_pagamento`).

## Feedback Maggo

| Situação | UI |
|----------|----|
| Header `X-Ocean-Maggo-Ignorados` | Toast informativo (números ignorados) — opcional mas desejável |
| Maggo unavailable | Toast de aviso; lista ainda mostra registros Ocean (incl. Manual) |

## Fora de escopo visual

- Reintroduzir import, exclusão, pasta de arquivos.
- Filtro dedicado por origem (não exigido; coluna basta).
