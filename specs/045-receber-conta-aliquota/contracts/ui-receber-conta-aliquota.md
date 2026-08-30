# Contrato de UI: Conta, Alíquota e cards líquidos

**Feature**: `045-receber-conta-aliquota` | **Date**: 2026-08-29  
**Página**: Contas a Receber (`/nfs`, `frontend/src/pages/NFs.tsx`)  
**Spec**: [spec.md](../spec.md)

## Formulário “Nova conta a receber” / Edição

### Campo Conta

| Aspecto | Regra |
|---------|--------|
| Rótulo | **Conta** (ou **Conta corrente** — alinhar ao restante da página) |
| Visibilidade | Sempre (Pendente **e** Recebida) |
| Opções | Correntes **ativas** (`contasCorrentes.filter(c => c.ativo)`) — **sem** investimento |
| Valor inicial (criar) | Slot 1 (`codigoSlot1`) → fallback `codigoPadrao` |
| Valor inicial (editar) | `nf.caixa` se corrente ativa; senão slot 1/padrão |
| Obrigatoriedade | Sempre selecionável; backend valida corrente ativa |

### Campo Alíquota (imposto)

| Aspecto | Regra |
|---------|--------|
| Tipo | Numérico, percentual (usuário digita `6` para 6%) |
| Visibilidade | Criação e edição (admin) |
| Valor inicial (editar) | `nf.aliquota_imposto` ou vazio se legado NULL |
| Validação UI | 0–100; negativo ou &gt;100 → toast e bloqueio de salvar |

### Campos Impostos e Valor líquido

| Aspecto | Regra |
|---------|--------|
| Edição | **Proibida** (`readOnly` + `disabled`, classe `INPUT_RO`) |
| Atualização | Automática ao mudar **Valor bruto** ou **Alíquota** |
| Fórmula | Impostos = bruto × (alíquota/100); Líquido = bruto − Impostos (centavos) |
| Exemplo | Bruto 10.000 + 6% → Impostos 600, Líquido 9.400 |

### Fluxo salvar (criar)

1. Validar empresa, bruto, tipo, Conta, alíquota ∈ [0,100].
2. Enviar `aliquota_imposto`, `caixa` (sempre), `valor_bruto`; imposto/líquido calculados no cliente (servidor recalcula).
3. Pendente: `data_pagamento: null`, **`caixa` preenchido**.
4. Recebida: `data_pagamento` + `caixa` obrigatórios.

### Modal “Marcar como recebido”

- Mantém select Conta.
- Pré-selecionar `nf.caixa` quando já gravado no registro pendente.
- Inalterado quanto a data de pagamento.

## Cards de resumo (topo da página)

| Rótulo anterior | Rótulo novo | Campo `resumo` |
|-----------------|-------------|----------------|
| Pendente | **Líquido Pendente** | `total_liquido_pendente` |
| Vencido | **Líquido Vencido** | `total_liquido_vencido` |
| Bruto Recebido | (inalterado) | `total_bruto_pago` |
| Líquido Recebido | (inalterado) | `total_liquido_pago` |

Contadores `qtd_pendentes` / `qtd_vencidas` permanecem.

## Papéis

| Papel | Formulário | Cards |
|-------|------------|-------|
| admin | Cria/edita Conta e Alíquota; vê imposto/líquido calculados | Lê todos |
| visualizador | Sem botão criar/editar | Lê todos (mesmos rótulos e bases) |

## Fora de escopo (não quebrar)

- Tooltip alíquota **mensal** na coluna Imposto da tabela (037)
- Coluna Conta corrente na listagem (036)
- Exclusão por linha, arquivar, anexo NF, filtros, export CSV/XLSX
- Dashboard e página Impostos

## Helper frontend sugerido

`frontend/src/utils/nfValores.ts`:

- `calcularImpostoLiquido(bruto: number, aliquotaPct: number | null)`
- `codigoSlot1(contas: ContaCorrente[]): string`
