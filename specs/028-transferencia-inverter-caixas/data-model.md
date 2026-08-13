# Data Model: Fluxo de Caixa — Inverter origem e destino da transferência

**Feature**: `028-transferencia-inverter-caixas` | **Date**: 2026-08-13  
**Spec**: [spec.md](./spec.md)

Persistência **inalterada**. Entidades gravadas continuam as da [026](../026-fluxo-caixa-transferencia/data-model.md).

## Enums (existentes)

| Nome | Valores | Rótulos UI |
|------|---------|------------|
| Fluxo / conta | `corrente` \| `investimento` | Conta corrente \| Conta investimento |

## Entidades persistidas

Nenhuma alteração em `fluxo_movimentos`, `par_id`, saldos, CR ou CP.

## Entidades de tela

### Par origem–destino (estado do modal)

| Campo | Tipo | Regra |
|-------|------|--------|
| origem | `corrente` \| `investimento` | Texto somente leitura; default = fluxo ativo ao abrir |
| destino | `corrente` \| `investimento` | Texto somente leitura; **sempre** `outraConta(origem)` |
| valor | string do input | Preservado ao inverter |
| data_movimento | data | Preservada ao inverter |
| observacao | string opcional | Preservada ao inverter |

**Invariante**: `origem !== destino` enquanto o modal está aberto. A UI não oferece caminho para violar.

### Transições

```text
abrir Transferência (admin)     → origem = fluxoAtivo; destino = outraConta(origem)
Inverter                        → swap origem ↔ destino; demais campos iguais
clique nos textos origem/destino → nenhum efeito no par
Confirmar                       → mesmas regras 026 (teto da origem atual, POST par)
Cancelar / fechar               → descarta estado; próxima abertura = padrão
visualizador                    → sem modal, sem Inverter
```

## Validação (só UI desta feature)

| Regra | Momento |
|-------|---------|
| Destino = o outro caixa | Sempre (derivado) |
| Textos não editáveis | Sempre |
| Valor / teto / data | Na confirmação (026) |

## Fora deste modelo

- Novo campo no banco
- Terceiro valor de conta
- Histórico da última inversão após fechar o modal
