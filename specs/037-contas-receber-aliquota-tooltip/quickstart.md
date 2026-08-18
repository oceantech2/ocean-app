# Quickstart: Alíquota do mês no tooltip de Imposto

**Feature**: `037-contas-receber-aliquota-tooltip` | **Date**: 2026-08-18  
**Spec**: [spec.md](./spec.md) · **UI**: [contracts/ui-contas-receber-aliquota-tooltip.md](./contracts/ui-contas-receber-aliquota-tooltip.md) · **REST**: [contracts/rest-impostos-de-contas.md](./contracts/rest-impostos-de-contas.md)

## Pré-requisitos

- API em `http://localhost:8001`, frontend em `http://localhost:5193`
- Usuário `admin` ou `visualizador` (senha de desenvolvimento do projeto)
- Pelo menos um mês em que a página **Impostos** mostre “% Imposto” numérico (percentual efetivo > 0)
- Pelo menos um lançamento em **Contas a Receber** com `data_emissao` (ou só vencimento) nesse mês

## Subir o ambiente

```bash
docker compose up -d
cd frontend && npm run dev
```

## Validação

1. Abrir Impostos, anotar o **% Imposto** de um mês com valor (ex.: Mar/2026 = 6%).
2. Abrir Contas a Receber no mesmo ano. Passar o cursor na coluna **Imposto** de um lançamento com emissão (ou vencimento) naquele mês.
   - Esperado: tooltip `Alíquota do mês (Mar/2026): 6%` (ou `6,00%`), **igual** ao da tela Impostos — não o imposto÷bruto da linha.
3. Comparar duas linhas do **mesmo** mês: o texto da alíquota é **idêntico**.
4. Linha com Imposto “—” e o mesmo mês com %: tooltip **ainda** mostra a alíquota do mês.
5. Linha sem emissão e sem vencimento, **ou** mês em que Impostos mostra “—” em %: tooltip `Alíquota do mês indisponível` (sem percentual inventado).
6. Filtro da lista em outro mês que o da competência da linha: o tooltip segue o mês da **linha**, não o filtro.
7. Tab até a célula Imposto: o mesmo texto está acessível (foco + `aria-label`).
8. Repetir o passo 2 como **visualizador**: mesmo tooltip; sem mudança de permissão.
9. Confirmar que Impostos, Dashboard e o valor em reais na célula **não** mudaram.

## Checagem rápida de código

```bash
cd frontend && npm run lint && npm run type-check
```

Esperado: sem erro novo em `NFs.tsx` / `aliquotaMes.ts`.
