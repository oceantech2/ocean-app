# Contract: UI — Dashboard Toggle + Configuração do Período

**Feature**: `057-dashboard-toggle-periodo`  
**Superfície**: `Dashboard.tsx` apenas

## 1. Toggle Bruto / Líquido

| Item | Contrato |
|------|----------|
| Posição | Header direito do Dashboard |
| Opções | **Líquido** \| **Bruto** |
| Default | Líquido a cada entrada/sessão na página |
| Efeito imediato | Recalcula exibição local (sem obrigatoriedade de novo fetch se payload dual-base já carregado) |

### O que muda com o toggle

- Pipeline (valores e % na base ativa; contagens fixas)
- Meta mensal exibida e barra/progresso mensal (`realizado` na mesma base)
- Cards de **receita** já existentes (não exibir bruto e líquido lado a lado como duas verdades ao mesmo tempo)

### O que NÃO muda

- Impostos (valor absoluto / regra já vigente do card)
- Despesas e demais KPIs não-receita
- Meta **anual** (permanece no fluxo atual; fora da Configuração do Período)

## 2. Configuração do Período (substitui meta mensal isolada)

| Item | Contrato |
|------|----------|
| Quando | Visível com mês selecionado (`mes` 1–12); não aplica em “todos os meses” sem mês |
| Campos | Meta líquida (R$) + Alíquota do período (%) |
| Quem edita | Só `admin`; `visualizador` vê efeitos / valores somente leitura |
| Save | Ambos obrigatórios; validação local + API |
| Sem config | Estado vazio claro (“Configure meta e alíquota”) — sem inventar números |

### Confirmação de massa

1. Admin altera alíquota e aciona salvar.
2. UI chama PUT; se 409 → modal/confirm nativo com texto incluindo `registros_afetaveis`.
3. Confirmar → PUT de novo com `confirmar_atualizacao_massa: true`.
4. Cancelar → nenhuma alteração; formulário pode manter valores editados não salvos ou reverter (preferir manter edição local até novo save, sem persistir).

Se só a meta líquida mudou: save direto, sem modal de massa.

## 3. Feedback

- Sucesso: toast (padrão do produto)
- 403 visualizador: não mostrar controles de save (ou desabilitar)
- 422: mensagem clara (alíquota inválida, campos obrigatórios)
- Após save com massa: toast indicando quantos registros atualizados (se API devolver `registros_atualizados`)

## 4. Acessibilidade / clareza

- Toggle com rótulos textuais “Líquido” / “Bruto” (não só ícone)
- Indicar visualmente a base ativa junto aos totais de receita (ex. subtítulo “visão líquida”)

## Fora de escopo UI

- Cards Por Caixa / Competência / Aging / Alerta
- Redesign da página NFs
- Edição de meta anual neste formulário de período
