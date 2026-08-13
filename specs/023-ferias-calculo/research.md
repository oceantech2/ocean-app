# Research: Correção do cálculo de férias

**Feature**: `023-ferias-calculo` | **Date**: 2026-08-12

## 1. Onde calcular direito e saldo

**Decision**: Agregar no frontend a partir da lista já filtrada (`colaborador_id`, `ano`), com funções puras em `frontend/src/utils/feriasCalculo.ts`. No backend, as mesmas regras puras em `backend/app/services/ferias_calculo.py` para DELETE (transferência) e validação de intervalo/sobreposição (aviso não bloqueia).

**Rationale**: A lista atual já carrega até 200 registros do filtro; não há necessidade de endpoint novo. A transferência **precisa** ser no servidor, senão o direito some do banco.

**Alternatives considered**:
- Tabela `ferias_direito_anual` (colaborador, ano, dias) — correto a longo prazo, migration e CRUD extras (Viola V).
- `GET /ferias/resumo` — útil se a lista paginar de verdade; hoje a página já pede o conjunto filtrado.

## 2. Direito anual = max, não soma

**Decision**: `direito_anual = max(dias_direito)` no grupo `(colaborador_id, ano)`. Saldo = esse máximo − `sum(dias_tirados)` de **todos** os registros do grupo (aprovado ou não).

**Rationale**: O primeiro período grava 30 e os seguintes 0; somar infla o saldo. Dados legados com 30 em várias parcelas: `max` = 30, não 60/90.

**Alternatives considered**: Somar só o primeiro registro por `criado_em` — frágil se a ordem mudar. Usar só registros com `dias_direito > 0` e somá-los — falha no legado com 30 repetido.

## 3. Transferência na exclusão

**Decision**: No `DELETE /ferias/{id}`, se existirem outras parcelas do mesmo colaborador/ano e `dias_direito` do excluído for **estritamente maior** que o max das restantes, copiar esse valor para a parcela restante de **menor `id`**. Se o max restante já for ≥ ao excluído, não gravar nada. Se for o último registro, só apagar.

**Rationale**: Atende FR-013 sem UI extra. Destino = menor `id` é determinístico.

**Alternatives considered**: Impedir exclusão da parcela-base (FR recusou). Recalcular só com o que restou (direito vira 0).

## 4. Datas corridas e intervalo invertido

**Decision**: Dias tirados sugeridos = diferença civil inclusiva (`fim − início + 1`) em calendário local (já existe `parseDateLocal` + `diffDias` na página — extrair para o util). Se ambas as datas existem e `fim < início`: não sugerir valor positivo; **bloquear save** na UI; **422** na API (create/update) para o mesmo caso. Período sem as duas datas permanece válido.

**Rationale**: Spec FR-007/FR-008. API impede import/cliente HTTP de gravar invertido.

**Alternatives considered**: Só UI (API aceitaria lixo). Troca automática início/fim (clarify recusou).

## 5. Sobreposição

**Decision**: Dois intervalos se sobrepõem se ambos têm início e fim e `inícioA ≤ fimB` e `inícioB ≤ fimA`. UI avisa (toast ou faixa no modal) e **permite salvar**. API **não** retorna 422 por overlap.

**Rationale**: Clarify opção A. Saldo continua soma dos `dias_tirados` informados.

**Alternatives considered**: 409 no backend; ignorar detecção.

## 6. Resumo vs linhas (UX)

**Decision**: Acima da tabela (ou à esquerda dos filtros, em cards), um **resumo por colaborador** presente no resultado filtrado: nome, direito anual, total tirado, saldo (cor: positivo azul, zero cinza, negativo vermelho). Tabela: colaborador (se filtro “Todos”), ano, dias tirados da parcela, período, status, ações. Sem colunas Direito/Saldo na linha.

Com um único colaborador filtrado, um card basta. Com “Todos”, lista compacta de cards ou mini-tabela de resumos — mesmo padrão visual da página (cards brancos, Tailwind).

**Rationale**: Clarify C; evita 30−10=12 na mesma linha.

**Alternatives considered**: Repetir direito/saldo anual em cada linha (clarify A/B).

## 7. Banner de pendência e sino

**Decision**: Banner da página: um item por `(colaborador_id, ano)` com **pelo menos um** `aprovado === false`, **independente do saldo**. O contador do menu (`useNotificacoes`) já conta registros não aprovados; **não** mudar a fórmula do sino nesta feature (evita divergência de “quantidade de registros” vs “colaboradores”). Só o texto do banner da página deixa de exigir `saldo > 0`.

**Rationale**: FR-012 é o aviso da página. Alterar o sino para “únicos colaborador/ano” mudaria o número visível no menu sem pedido explícito.

**Alternatives considered**: Unificar sino e banner na mesma unicidade — melhor depois, fora do escopo mínimo.

## 8. Update de `dias_direito`

**Decision**: Incluir `dias_direito` opcional em `FeriasUpdate`. Hoje o PUT ignora o campo enviado pelo modal.

**Rationale**: Sem isso, editar o direito do registro-base não persiste e o max anual fica preso.

**Alternatives considered**: Só alterar direito na criação — insuficiente para FR-006.

## 9. Exportação CSV

**Decision**: CSV de parcelas: Colaborador, Ano, Dias tirados, Data início, Data fim, Status. **Sem** Direito/Saldo por linha. Totais anuais ficam só na tela (resumo). Sem segundo arquivo nesta feature.

**Rationale**: Spec: não apresentar direito/saldo como se fossem da parcela; não redesenhar import.

**Alternatives considered**: Dois CSVs (parcelas + resumo) — extra sem pedido.

## 10. Testes

**Decision**: Sem suíte pytest no repositório. Validar com [quickstart.md](./quickstart.md) (curl + UI) e `npm run lint` / `npm run type-check`. Não criar pasta `tests/` só para esta feature.

**Rationale**: Constitution V. O serviço Python existe para a transferência no DELETE, não para inaugurar CI.

## 11. Gaps confirmados no código (2026-08-12)

**Decision**: O plano ataca exatamente estes pontos:

| Onde | Hoje | Alvo |
|------|------|------|
| `Ferias.tsx` `resumoPorAno` | soma `dias_direito` | `max` |
| `infoModal` | soma direitos dos outros | max + fórmula do data-model |
| `feriasComAviso` | exige `saldo > 0` | qualquer `aprovado === false` |
| Tabela/CSV | colunas Direito e Saldo na linha | só parcela; resumo à parte |
| `FeriasUpdate` | sem `dias_direito` | campo opcional |
| POST/PUT | aceita `data_fim < data_inicio` | 422 |
| `DELETE` | apaga sem transferir | FR-013 |
| `email.py` saldo por linha | soma por registro | **fora de escopo** (não é a página Férias) |

**Rationale**: Spec da tela Férias. E-mail de saldo é consumidor antigo; alterar agora seria escopo extra.

**Alternatives considered**: Incluir `email.py` nesta feature — rejeitado (V).
