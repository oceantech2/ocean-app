# Contrato UI: Caixa em Contas a Receber

**Feature**: `011-contas-receber-caixa` | **Date**: 2026-08-06  
**Spec**: [spec.md](../spec.md) · **API**: [api-caixa-contas-receber.md](./api-caixa-contas-receber.md)

## Superfície

| Item | Valor |
|------|-------|
| Página | Contas a Receber (`frontend/src/pages/NFs.tsx`) |
| Rota | `/nfs` (inalterada) |
| Papéis | admin edita; visualizador só consulta |

## Listagem — coluna Caixa

| Estado | Exibição |
|--------|----------|
| `corrente` | **Corrente** |
| `investimento` | **Investimento** |
| `null` / ausente | **—** (não usar o texto “Não definido”) |

Legados já recebidos sem Caixa: aparecem normalmente com **—**; sem banner de bloqueio da página.

## Modal de edição

| Controle | Comportamento |
|----------|---------------|
| Select Caixa | Opções: (vazio) · Corrente · Investimento |
| Salvar com conta **não** recebida | Vazio permitido |
| Salvar com `data_pagamento` preenchida e Caixa vazia | Bloquear no cliente + toast; API também rejeita |
| Visualizador | Sem edição |

## Modal Pagar / marcar como recebida

| Controle | Comportamento |
|----------|---------------|
| Data de pagamento | Já existente |
| Select Caixa | **Obrigatório** neste fluxo (Corrente ou Investimento) |
| Confirmar sem Caixa | Bloquear + mensagem clara |
| Payload | Enviar `data_pagamento` **e** `caixa` no PUT |

## Exportações

| Canal | Caixa |
|-------|-------|
| CSV (cliente) | Coluna Caixa: Corrente / Investimento / — ou vazio |
| XLSX (API) | Coluna Caixa com o mesmo significado |

## Feedback

| Situação | UX |
|----------|-----|
| Sucesso ao salvar/pagar | toast de sucesso (padrão atual) |
| Validação Caixa faltando | toast de erro; modal permanece aberto |
| 422 da API | toast com mensagem do backend (ou fallback pt-BR) |
| Erro de rede | toast de erro; sem sucesso falso na lista |

## Fora deste contrato

- Filtro por Caixa.
- Redesign da página.
- Integração visual com Fluxo de Caixa.
