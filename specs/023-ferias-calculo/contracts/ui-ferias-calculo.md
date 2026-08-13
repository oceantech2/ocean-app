# Contract: UI — Cálculo de férias

**Feature**: `023-ferias-calculo`  
**Página**: `frontend/src/pages/Ferias.tsx`  
**Papéis**: `admin` cria/edita/aprova/exclui; `visualizador` só consulta resumo, lista e exportações de leitura.

## Filtros

Inalterados: colaborador (Todos + lista) e ano. Recarregam a lista e o resumo.

## Resumo por colaborador/ano

Visível quando houver pelo menos um registro no filtro.

| Dado | Formato |
|------|---------|
| Colaborador | Nome |
| Direito | `{n}d` |
| Tirados | `{n}d` (soma das parcelas, pendentes + aprovados) |
| Saldo | `{n}d` — positivo destaque azul; negativo vermelho; zero cinza |

Um bloco por colaborador presente no resultado (ano = filtro). Não misturar anos.

## Tabela de parcelas

Colunas: Colaborador (ocultável se filtro de um só), Ano, **Tirados** (só da linha), Período (`início → fim` ou `–`), Status, ações admin.

**Não** exibir Direito nem Saldo como colunas da parcela.

## Banner de pendência

Texto alinhado a “há período não aprovado”. Aparece se existir parcela `aprovado === false` no conjunto carregado. Um colaborador/ano no máximo uma vez. **Não** exige saldo &gt; 0.

## Modal criar/editar

| Campo | Criar 1º do grupo | Criar fracionamento | Editar |
|-------|-------------------|---------------------|--------|
| Colaborador | Obrigatório | Obrigatório | Somente leitura (já hoje) |
| Ano | Obrigatório | Obrigatório | Editável |
| Dias de direito | Padrão 30, editável | 0, desabilitado | Editável |
| Datas | Opcional | Opcional | Opcional |
| Dias tirados | Preenchido pelas datas ou manual | Idem | Idem |

Faixa informativa:

- Primeiro do ano: direito padrão 30 / saldo disponível = direito do form.
- Fracionamento / edição: `Saldo disponível: {disponivel}d` com a fórmula do [data-model](../data-model.md).
- Datas invertidas: faixa de erro; botão Salvar **desabilitado**.
- Dias (calculados ou manuais) &gt; disponível: aviso de excesso; Salvar **habilitado**.
- Sobreposição com outra parcela do mesmo colaborador/ano (ambas com datas): aviso; Salvar **habilitado**.

Alterar datas (intervalo válido) atualiza dias tirados; edição manual de dias prevalece até nova mudança de data.

## Exclusão

`window.confirm` como hoje. Após sucesso, lista/resumo refletem transferência de direito (sem tela extra).

## Exportar CSV

Colunas de parcela apenas (sem Direito/Saldo por linha). PDF/print inalterado no restante, sem colunas enganosas se a tabela impressa seguir o novo cabeçalho.

## Importar CSV

Fora de redesenho: mesmas colunas. Após importar, o resumo usa max/soma (se várias linhas vierem com 30, o max evita inflar).

## Acessibilidade mínima

- Resumo distinguível da tabela (título “Resumo do ano” ou equivalente em pt-BR).
- Mensagens de intervalo inválido, excesso e sobreposição em português.
- Salvar desabilitado no intervalo invertido também para teclado.

## Fora de escopo UI

- Calendário de férias / mapa de sobreposição visual.
- Bloqueio de 5 dias mínimos ou parcela ≥ 14.
- Cálculo proporcional por admissão.
- Segundo arquivo CSV de totais anuais.
