# Contrato UI: Calendário — Legenda e Marcadores

**Feature**: `006-calendario-legenda` | **Date**: 2026-07-26  
**Spec**: [spec.md](./spec.md) · **Modelo**: [data-model.md](../data-model.md)

> Contrato de apresentação da página `/calendario`. Sem contrato HTTP novo.

## Superfície

| Item | Valor |
|------|-------|
| Rota | `/calendario` |
| Componente | `frontend/src/pages/Calendario.tsx` |
| Dados | `nfsService.listar`, `contasService.listar` (inalterados) |

## Legenda

| Ordem | Rótulo (exato) | Indicador de cor |
|-------|----------------|------------------|
| 1 | A receber | azul (`bg-blue-500`) |
| 2 | Recebido | verde (`bg-green-500`) |
| 3 | A pagar | laranja (`bg-orange-500`) |
| 4 | Pago | verde (`bg-green-500`) — idêntico a Recebido |

- Visível sempre que a página carrega (mesmo sem eventos / durante loading após header).
- **Não** exibir rótulos legados: “NF”, “Conta a pagar”, “Quitado/Pago” como itens da legenda.

## Marcadores (grade e detalhe)

| Status visual | Grade (chip) | Detalhe (bolinha) |
|---------------|--------------|-------------------|
| A receber | fundo/texto azul | bolinha azul |
| Recebido | fundo/texto verde | bolinha verde |
| A pagar | fundo/texto laranja | bolinha laranja |
| Pago | fundo/texto verde (iguais a Recebido) | bolinha verde |

- Detalhe do dia continua mostrando tipo textual `(NF)` / `(Conta)` para separar Recebido de Pago.
- Sem ícones adicionais nem segundo tom de verde.

## Inclusão / exclusão de eventos

| Fonte | Inclui quando | Exclui quando |
|-------|---------------|---------------|
| NF | tem `data_vencimento` e `status ≠ cancelada` | `status === cancelada` ou sem data |
| Conta | tem `data_vencimento` | sem data |

Mapeamento NF: `paga` → quitado (`pago=true`); `pendente` e `vencida` → em aberto.

## Comportamento preservado (não-regressão)

- Navegação mês/ano, destaque “hoje”, seleção de dia, truncamento “+N mais”, empty do dia, toast de erro de carga.
- Botões Importar CSV (toast informativo), Exportar CSV, Exportar PDF.
- Refresh via `calendarioTick` do store de notificações.

## Fora de escopo deste contrato

- Endpoints novos; filtros por status; CRUD; outros tipos de evento (bônus, férias, DH).
- Renomear valores da coluna Status do CSV exportado.
