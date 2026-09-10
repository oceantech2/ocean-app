# Contract: UI — Pipeline de Receita (Dashboard)

**Feature**: `056-status-conta-receber`  
**Página**: `frontend/src/pages/Dashboard.tsx`  
**Fonte de dados**: `relatoriosService.pipelineReceita` → [rest-pipeline-receita.md](./rest-pipeline-receita.md)

## Colocação

- Card na seção **Receita** do Dashboard (junto aos cards de receita existentes; não substitui Por Caixa/Competência — esses não existem ainda nesta feature).
- Respeita filtros já existentes de **ano** e **mês** (mesmo `useEffect` / `carregarDados`).

## Conteúdo obrigatório

| Bloco | Rótulo | Badge | Dados |
|-------|--------|-------|-------|
| Base | Fechado no mês (ou “Fechado no período” se mes=null) | — | valor + contagem; 100% |
| Estágio | A Faturar | sem NF | valor + contagem + % |
| Estágio | Faturado · Ag. Pagamento | NF emitida | valor + contagem + % |
| Estágio | Recebido | pago | valor + contagem + % |

## Comportamento

1. Loading: spinner/esqueleto coerente com outros cards do Dashboard.
2. Erro da API: toast ou estado de erro local sem quebrar o restante do Dashboard.
3. Período vazio: zeros / “—” nos %, sem crash.
4. **MUST NOT** exibir input/select de “status de ciclo”.
5. **MUST NOT** alterar a página NFs / Contas a Receber.
6. Papéis: `admin` e `visualizador` veem o mesmo card (somente leitura).

## Visual (orientação)

- Distinção clara entre os três estágios (âmbar / azul / verde sugeridos pelo mockup).
- Sem exigência de fidelidade pixel-perfect ao HTML do briefing.
- Contagens auxiliares (“vagas”, “NFs”, “NFs pagas”) opcionais se couberem sem poluir.

## Fora de escopo UI

- Toggle Bruto/Líquido no header
- Meta bar do Pipeline
- Aging, alerta de fluxo, Despesas & Resultado
- Edição inline de datas a partir do card
