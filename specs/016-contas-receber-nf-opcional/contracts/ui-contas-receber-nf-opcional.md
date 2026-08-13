# Contrato UI: Contas a Receber — NF opcional

**Feature**: `016-contas-receber-nf-opcional` | **Date**: 2026-08-12  
**Spec**: [spec.md](../spec.md) · **API**: [api-contas-receber-nf-opcional.md](./api-contas-receber-nf-opcional.md)

## Superfície

| Item | Valor |
|------|-------|
| Página | Contas a Receber (`frontend/src/pages/NFs.tsx`) |
| Rota | `/nfs` (inalterada) |
| Papéis | admin cria/edita; visualizador só consulta |

## Listagem — coluna Nº / NF

| `numero` | Exibição |
|----------|----------|
| string não vazia | valor |
| `null` / ausente | **—** (em dash, sem inventar número) |

Export CSV/XLSX da página: célula vazia ou equivalente; não gerar número fictício.

Modal “marcar como recebido”: mesmo `—` se não houver NF (`{numero} — {razão social}`).

## Modal — criação e edição manual

| Campo | Obrigatório | Notas |
|-------|-------------|-------|
| NF (número) | **não** | rótulo **NF** sem `*`; placeholder opcional |
| Razão social | sim | `*` |
| Valor bruto / líquido | sim | |
| Data de emissão / vencimento | sim | |
| Tipo | sim | |
| Pagamento | sim | Pendente \| Recebido |
| Caixa / data pagamento | se Recebido | inalterado |

Validação client: **não** bloquear por NF vazia. Toast de obrigatórios **não** deve listar NF (ex.: “Preencha cliente, valores e datas obrigatórias”).

Payload create: `numero: form.numero.trim() || null`.

Payload edit manual: **sempre** enviar `numero` (`string` ou `null`) para permitir limpar.

Conflito 409: toast + atalho existentes (013) — só quando número preenchido.

## Modal — edição Maggo

Campo NF **somente leitura** (valor da fonte ou `—` se um dia vier vazio). Não enviar `numero` no PUT.

## Fora de escopo visual

- Import, exclusão, pasta de arquivos.
- Filtro dedicado “sem NF”.
- Mudança de CTA **Nova conta a receber**.
