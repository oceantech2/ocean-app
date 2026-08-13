# Research: Dashboard — Filtro de Ano Independente e Donut Anual

**Feature**: `015-dashboard-filtro-ano` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md)

## 1. Representar “sem mês” no estado

**Decision**: `mes: number | null` no `useState` da Dashboard. `null` = visão do ano (“Todos os meses”). Select controlado com `value={mes ?? ''}` e `<option value="">Todos os meses</option>`. **Não** usar `0`: `metasService.progresso(0, ano)` já significa **meta anual**.

**Rationale**: Evita colidir com o sentinela de meta anual. `null` é explícito no TypeScript e no `onChange`.

**Alternatives considered**:
- `mes = 0` — conflito direto com meta anual; risco de gravar/ler meta do ano no card mensal.
- String `"all"` — força parse em todo o fluxo numérico (clamp, API).
- `useFilterStore` — spec não pede persistência entre páginas; acoplaria outras telas.

## 2. Rótulo da opção sem mês

**Decision**: Texto canônico **“Todos os meses”** (primeira opção do select, acima de Jan…Dez permitidos).

**Rationale**: Clarify deixou o rótulo para o plano; a frase é clara em pt-BR e aparece nos exemplos da spec.

**Alternatives considered**:
- “Ano inteiro” / “Sem mês” — também válidos; menos alinhados ao controle que lista meses.

## 3. Donut do ano vs donut do mês (API)

**Decision**: Reutilizar `GET /api/relatorios/custo-por-categoria` **duas vezes** no mesmo `Promise.all` (quando há mês):

| Donut | Chamada |
|-------|---------|
| Mês | `custoPorCategoria(ano, mes, mes)` → `mes_de = mes_ate = mes` |
| Ano | `custoPorCategoria(ano, mesAteAno, 1)` → `mes_de = 1`, `mes_ate = mesAteAno` |

`mesAteAno`: ano corrente → `MES_ATUAL`; ano anterior → `12`; ano futuro → **não chamar** (estado vazio, como hoje).

Sem mês: só a chamada anual. Trocar só o mês **não** muda os parâmetros da chamada anual (FR-012 / SC-003).

**Rationale**: O endpoint já implementa intervalo `[mes_de, mes_ate]` (feature 009). YTD/ano completo é exatamente `mes_de=1`. Sem endpoint novo e sem “desacumular” no frontend.

**Alternatives considered**:
- Endpoint `/custo-por-categoria-ano` — duplicação.
- Um único YTD e derivar o mês no client — impossível sem dados mensais por categoria.
- `mes_ate` = mês do filtro no donut anual — rejeitado no clarify (opção A).

## 4. Layout dos donuts

**Decision**:
- Com mês: `grid grid-cols-1 md:grid-cols-2 gap-4` — mês à esquerda, ano à direita; empilhados no mobile (mês acima). Remover o slot vazio `hidden md:block`.
- Sem mês: **não** renderizar o bloco do mês; o donut do ano em um único card com largura total (`w-full`, sem grid de 2 colunas).
- Extrair um helper/componente **local** no mesmo arquivo (`DonutCustoBloco`) para título, estados vazio/erro e `PieChart`, evitando duplicar markup.

**Rationale**: Clarify Q1 (largura total sem mês) e Q3 (só o donut mensal some). Extração local atende simplicidade sem arquivo/componente de design system novo.

**Alternatives considered**:
- Manter coluna vazia no grid — rejeitado (clarify).
- Componente em `components/` — overkill para um único consumidor.

## 5. Indicadores mensais sem mês (exceto donut)

**Decision**: Meta mensal e cards de resumo (faturamento bruto/líquido / NFs pendentes) **permanecem no layout** com mensagem do tipo “Selecione um mês para ver este indicador”. Não chamar `metasService.progresso(mes)` nem `resumoFinanceiro(ano, mes)` sem mês concreto (evita `mes=0` e totais anuais silenciosos nos cards mensais). Admin **não** edita meta mensal nessa visão.

Saldos: mais recente do **ano** (`registro.ano === ano`, maior `mes`); se nenhum, “Sem registro” (FR-006).

Séries anuais (DRE, faturamento por mês, meta anual, donut do ano) carregam normalmente.

**Rationale**: Clarify Q3. KPI cards hoje passam `mes` — são indicadores mensais; preenchê-los com o ano inteiro mudaria o significado sem pedido.

**Alternatives considered**:
- Esconder meta mensal e KPIs — rejeitado no clarify.
- `resumoFinanceiro(ano)` sem `mes` nos KPIs — mistura visão anual em cards que o usuário associa ao mês.

## 6. Clamp ao trocar o ano

**Decision**: Se `mes === null`, permanecer `null`. Se `mes` concreto e `mes > maxMesPermitido(novoAno)`, clamp para o máximo (regra 009). Opções do select = `Todos os meses` + `mesesPermitidos(ano)`.

**Rationale**: FR-016.

**Alternatives considered**:
- Ao mudar o ano, voltar sempre ao mês corrente — rejeitado (perda da visão anual consciente).

## 7. Remoção de Próximas Ações

**Decision**: Apagar o bloco JSX e qualquer texto “Próximas Ações”. Não migrar itens. `resumo.quantidade_pendentes` continua nos cards de KPI (quando há mês).

**Rationale**: FR-013; o resumo ainda alimenta os KPIs.

**Alternatives considered**:
- Mover a lista para outro widget — fora do escopo.

## 8. Backend / api.ts

**Decision**: **Nenhuma** alteração de rota, schema ou assinatura de `custoPorCategoria`. `api.ts` já aceita `mesDe` com default `1`.

**Rationale**: Contrato 009 cobre os dois recortes. Escopo fechado.

**Alternatives considered**:
- Tornar `mes_ate` opcional no backend — desnecessário; o client sempre envia `mesAteAno` explícito.
