# Contract: UI — Resultado Competência estável no toggle

**Feature**: `068-resultado-comp-liquido`  
**Página**: `frontend/src/pages/Dashboard.tsx`  
**Cálculo**: [calc-resultado-comp-liquido.md](./calc-resultado-comp-liquido.md)  
**Referência de estabilidade numérica**: campo **Impostos Recolhidos** (aba Por Caixa)  
**Clarify**: subtítulo canônico **“base líquida”** (sempre)

## Layout

Mantém o bloco **Resultado** de `059`: dois cards — **Resultado Competência** e **Resultado Caixa**.  
MUST NOT redesenhar o bloco (sem novos cards, sem linhas de composição receita/despesa).  
Permitido: adicionar/ajustar **apenas** o subtítulo canônico no Competência.

## Exibição

| Card | Valor / % | Subtítulo | Reage ao toggle? |
|------|-----------|-----------|------------------|
| Resultado Competência | `calcularResultado(fechado.valor_liquido, fixas+variaveis)` | **MUST** **“base líquida”** | **Não** (valor, % e subtítulo) |
| Resultado Caixa | `calcularResultado(valorPorVisao(recebido…), fixas+variaveis)` | MUST NOT “base líquida” | **Sim** (valor e %) |

Formatação: mesma de `059` (`fmt`, `%` com padrão atual, negativo em estilo de prejuízo).

### Subtítulo (MUST — FR-009 / SC-007)

No card **Resultado Competência**, exibir texto auxiliar canônico:

> base líquida

Regras:

1. Visível com toggle em **Líquido** e em **Bruto**.
2. Visível em modo mês e só-ano.
3. Visível mesmo com receita líquida = 0 ou resultado negativo.
4. Texto exatamente **“base líquida”** (pt-BR); não substituir por “Não alterna com Bruto/Líquido” nem por rótulo dinâmico do toggle.
5. Card **Resultado Caixa** MUST NOT exibir “base líquida” (mesmo com toggle em Líquido).

## Interações

| Evento | Resultado Competência | Resultado Caixa |
|--------|----------------------|----------------|
| Toggle Bruto/Líquido | Valor, % e subtítulo **inalterados** | Recalcula na base ativa |
| Mudança mês/ano | Recalcula na base **líquida**; subtítulo permanece | Recalcula na base do toggle |
| Modo só-ano | Agrega ano inteiro em líquido; subtítulo permanece | Agrega ano; base do toggle |

## Coexistência com aba Por Competência

Com toggle em **Bruto**, a aba pode mostrar Total Fechado **bruto** enquanto o card Resultado Competência usa **líquido**. Intencional (spec US2); o subtítulo “base líquida” deixa a base explícita.

## Papéis

`admin` e `visualizador`: mesma leitura; sem edição.

## Loading / erro / vazio

- Mesmas regras de `059`.
- Pipeline em erro: Resultado Competência indisponível/erro; não inventar base bruta.
- Receita líquida 0: valor exibido (`0 − despesas`); % “—” / omitido; subtítulo **“base líquida”** permanece.

## Fora deste contrato

- Impostos Recolhidos (cálculo), Aging, Alerta, Pipeline card, Centro/Demonstrativo
- Alterar Despesas Fixas/Variáveis/Pendentes
- Subtítulo “base líquida” no Resultado Caixa
