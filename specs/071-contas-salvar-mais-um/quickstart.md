# Quickstart: Contas a Pagar e Receber — botão +1

**Feature**: `071-contas-salvar-mais-um` | **Date**: 2026-09-14  
**Contrato**: [contracts/ui-contas-salvar-mais-um.md](./contracts/ui-contas-salvar-mais-um.md)

## Pré-requisitos

- Infra: `docker compose up -d` (API **8001**, Postgres **5433**, Redis **6380**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Login: `admin` / `123456` (e, para negativo, `visualizador` / `123456`)
- Ver [data-model.md](./data-model.md) para resets pós-+1

## Smoke Contas a Pagar

1. Abrir `/contas` → **Nova conta a pagar**.
2. Confirmar footer: Cancelar, **+1**, Salvar.
3. Preencher dados válidos **com** data de pagamento e (opcional) arquivo; acionar **+1**.
4. Esperado: toast de sucesso; modal aberta; campos copiados; **data de pagamento vazia**; arquivo limpo; listagem com o novo item.
5. Alterar só o valor (ou vencimento) → **Salvar**.
6. Esperado: segundo registro; modal fecha.
7. Abrir **Editar** em qualquer conta: **sem** botão +1.

## Smoke Contas a Receber

1. Abrir `/nfs` → **Nova conta a receber**.
2. Preencher dados válidos, marcar **Recebida** com data, preencher **número de NF** + emissão; acionar **+1**.
3. Esperado: toast; modal aberta; dados de negócio copiados; status **Pendente**; NF e emissão limpos; anexo limpo.
4. Ajustar um campo → **+1** de novo → terceiro registro; modal ainda aberta.
5. **Cancelar**: modal fecha; registros já criados permanecem.
6. Edição: sem +1.

## Negativos

| Caso | Esperado |
|------|----------|
| +1 com campo obrigatório vazio | Toast de erro; nada novo; modal/form intactos |
| Double-click rápido em +1 | Apenas um create (botões desabilitados enquanto salvando) |
| Visualizador | Sem “Nova conta…” / sem +1 |
| Salvar (criação) | Continua fechando a modal após sucesso |

## Checagens de código

```bash
cd frontend && npm run lint && npm run type-check
```

## Critério de pronto (manual)

- SC-001 a SC-006 da [spec.md](./spec.md) cobertos pelos smokes acima.
- Nenhum endpoint novo; POSTs de create inalterados em contrato.
