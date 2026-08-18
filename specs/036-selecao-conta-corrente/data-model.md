# Data Model: Seleção de conta corrente

**Feature**: `036-selecao-conta-corrente` | **Date**: 2026-08-18  
**Spec**: [spec.md](./spec.md)

## Enums / códigos (herdados da 031)

| Código persistido | Significado | Onde pode ser escolhido |
|-------------------|-------------|-------------------------|
| `corrente` / `cc_{id}` | Conta corrente cadastrada | Origens **e** transferência |
| `investimento` | Conta investimento (sentinela) | **Só** transferência |
| `null` | Sem classificação | NF/receber/pagar ainda não recebido/pago |

## Entidades persistidas

### NF (`nfs.caixa`) — existente, regra muda

VARCHAR(64). Valores: `null`, codigo de corrente, ou `investimento` (legado).

| Evento | Caixa |
|--------|--------|
| criar/receber **sem** `caixa` no body | codigo da padrão |
| criar/receber **com** `caixa` de corrente ativa | o codigo informado |
| criar/receber com `investimento` ou inativa | recusa 400 |
| editar já recebida para outra corrente ativa | o codigo informado (movimento muda de fluxo, sem duplicar) |
| limpar pagamento | `null` |
| legado `investimento` | listagem mostra o rótulo; o select **não** oferece investimento; ao salvar recebido de novo, exige corrente |

### ContaPagar (`contas_pagar.caixa`) — nova coluna

VARCHAR(64) nullable. Sem `investimento` em gravações novas.

| Evento | Caixa |
|--------|--------|
| criar/atualizar **não pago** | `null` (campo opcional; pode pré-preencher padrão na UI sem persistir se ainda não pago) |
| marcar pago / criar já paga | codigo de corrente **ativa** obrigatório |
| omitir no pago | recusa 400 (UI pré-seleciona padrão; API não inventa se o cliente mandar vazio no pago) |
| legado pago sem caixa | espelho no fluxo da **padrão** até o admin salvar com codigo |
| desmarcar pago | `null` |

**Migração**: `ALTER TABLE contas_pagar ADD COLUMN IF NOT EXISTS caixa VARCHAR(64)`; pagos existentes ficam `null` (legado → padrão no espelho).

### FluxoMovimento — sem mudança de schema

Transferência: origem e destino ∈ correntes **ativas** ∪ `{investimento}`, distintos. Sem botão Inverter na UI; o par gravado continua o mesmo modelo (dois lados, `par_id`).

### ContaCorrente — sem mudança de schema

Cadastro continua na 031. Esta feature só **lê** ativas (campo) e ativas+investimento (transferência). Inativas: não listar para nova escolha; histórico já classificado permanece no fluxo.

## Entidades de tela

### Campo Conta corrente (origens)

Select: contas correntes **ativas** (rótulo = `nome`). Pré-seleção = `padrao`. Visualizador: somente leitura. Admin: edição no receber/pagar.

### Coluna nas listagens

NFs/Receber, Contas a Pagar: nome da corrente ou “—” se `null`. Legado investimento: mostrar “Conta investimento” para conferência.

### Transferência

Dois selects (origem, destino) = correntes ativas + Conta investimento. Sem Inverter. Abertura: ver FR-011 na spec.

## Relacionamentos

```text
ContaCorrente.codigo ──< NF.caixa
ContaCorrente.codigo ──< ContaPagar.caixa
ContaCorrente.codigo ∪ investimento ──< FluxoMovimento.conta (transferência)
```

## Validação

- Origem (NF/Pagar) com `investimento` → 400
- Origem com corrente inativa → 400
- Pago/recebido sem caixa válido → 400
- Transferência origem = destino → 400
- Transferência com corrente inativa → 400
- Transferência valor &gt; saldo visível da origem → 400 (já vigente)
