# Quickstart: Cards Total de Despesas e Impostos Pagos

**Feature**: `085-dashboard-despesa-total-impostos`

## Pré-requisitos

```bash
docker compose up -d          # infra + backend (porta 8001)
cd frontend && npm run dev    # http://localhost:5193
```

Login como `admin` (repetir com `visualizador`).

## Verificações estáticas

```bash
cd frontend
npm run type-check
npm run lint
npm run build
```

## Cenários

1. **Ordem dos cards** — Dashboard com um mês selecionado: a seção Despesa mostra, nesta ordem, Total de Despesas, Despesas Fixas, Despesas Variáveis, Despesas Pendentes, Impostos Pagos (US1-1, US2-5).
2. **Total = Fixas + Variáveis** — somar os valores dos cards Fixas e Variáveis; conferir com Total de Despesas (± R$ 0,01). Pendentes não entra (US1-2, US1-3).
3. **Impostos Pagos = Impostos Recolhidos do mês anterior** — selecionar Setembro/2026, abrir a aba Por Caixa e anotar "Impostos Recolhidos"; selecionar Outubro/2026 e conferir que Impostos Pagos mostra o mesmo valor e o texto "Recolhidos em Set/2026" (US2-1, US2-3).
4. **Virada de ano** — selecionar Janeiro/2026: Impostos Pagos = Impostos Recolhidos de Dez/2025 (US2-2).
5. **Modo só-ano** — limpar o mês: Impostos Pagos mostra "Recolhidos de Dez/{A−1} a Nov/{A}" e o valor = soma desses meses no card Impostos Recolhidos (US2-4).
6. **Toggle Bruto/Líquido** — alternar: Impostos Pagos não muda; Resultado não muda por causa dele (US2-6, US2-7).
7. **Regressão** — Fixas, Variáveis, Pendentes, Resultado Competência/Caixa e Impostos Recolhidos com os mesmos valores de antes (SC-004).
8. **Responsivo** — largura mobile e desktop: cards quebram em linhas sem cortar valores; Resultado aparece abaixo de Despesa.
