# Research: Correção de Férias (fornecedor, listagem e folha)

**Feature**: `050-ferias-fornecedor-correcao` | **Date**: 2026-09-06

## R1 — “Trocar endpoint” sem migrar FKs

**Decision**: Montar o mesmo router de `colaboradores` também em `/api/fornecedores` e criar `fornecedoresService` no frontend apontando para `/fornecedores`. A página de Férias passa a usar esse serviço. Manter `/api/colaboradores` e `colaboradoresService` para compatibilidade (outras telas / Fornecedores.tsx).

**Rationale**: A spec exige fonte oficial “fornecedores”. A tabela e o FK `ferias.colaborador_id` são legado estável (043 manteve a coleção interna). Alias de prefixo entrega o contrato sem migration nem rename de coluna.

**Alternatives considered**:
- Renomear tabela/coluna para `fornecedor_id` → rejeitado (alto risco, fora do escopo).
- Só renomear rótulos e continuar em `/colaboradores` → rejeitado (contradiz pedido explícito de trocar endpoint).
- Proxy só no Axios reescrevendo path → menos explícito que um serviço nomeado.

## R2 — Listagem vazia / “não abre com nomes”

**Decision**: Em `Ferias.tsx`, (1) carregar via `fornecedoresService.listar(0, 200, true, { elegivel_equipe: true })`; (2) em falha, `toast.error` (hoje o `catch` é silencioso); (3) se lista vazia sem erro, manter seletor utilizável com opção vazia e mensagem contextual se útil.

**Rationale**: O filtro `elegivel_equipe` já é o contrato de telas de equipe (043). O bug perceptível mais grave é falha silenciosa — o usuário vê seletor sem nomes e assume “não funciona”.

**Alternatives considered**:
- Remover filtro `elegivel_equipe` e listar todos os fornecedores → rejeitado (spec/assumptions: só elegíveis).
- Aumentar `limit` acima de 200 → desnecessário no volume atual; adiar se escala.

## R3 — Direito após 12 meses + override

**Decision**: Util puro `temDireitoAdquirido(dataAdmissao, ref = hoje)`: `true` se `data_admissao` existe e `ref >= data_admissao + 1 ano` (aniversário inclusivo, timezone local `T00:00:00`). No `salvar` (admin): se `!temDireitoAdquirido`, `window.confirm` com mensagem clara; só grava se confirmar. Backend `/ferias` **não** bloqueia (override permitido; evita divergência admin vs API).

**Rationale**: Clarify escolheu aviso + override. Validação só no backend sem flag de override forçaria novo campo de request. Confirm no cliente alinha ao padrão do produto (`window.confirm` em exclusões).

**Alternatives considered**:
- Bloqueio rígido backend → rejeitado (clarify C).
- Campo `override_elegibilidade` no POST → YAGNI para esta feature.
- Contagem em meses comerciais sem dia → menos previsível que aniversário de data.

## R4 — Datas opcionais

**Decision**: Manter `data_inicio`/`data_fim` nullable no payload (`null` se vazio); UI sem asterisco de obrigatório; regras atuais de `intervaloInvertido` / `diasCorridos` em `feriasCalculo.ts` e `datas_validas` no backend.

**Rationale**: Backend e formulário já aceitam null; a spec pede restaurar/garantir opcionalidade explícita na UX e nos testes do quickstart.

**Alternatives considered**:
- Exigir as duas datas juntas ou nenhuma → rejeitado (spec permite uma só).

## R5 — Salário e Total da Folha

**Decision**: Salário somente leitura a partir do objeto fornecedor já carregado (`salario`). Coluna na tabela + campo no modal. Card **Total da Folha** = `sum(salario ?? 0)` sobre a lista de elegíveis ativos em memória; se filtro de fornecedor ativo, soma só esse id. Filtro de ano **não** entra no cálculo. Card sempre visível (mesmo com total 0).

**Rationale**: Clarify A + A (escopo da folha e local do salário). Sem endpoint novo de agregação — volume pequeno e dados já no GET de fornecedores.

**Alternatives considered**:
- Endpoint `GET /ferias/total-folha` → desnecessário.
- Somar só quem tem período no ano → rejeitado no clarify.

## R6 — Nomenclatura UI vs payload

**Decision**: UI, export CSV e textos usam **Fornecedor**. Import CSV pode aceitar coluna rotulada como fornecedor no exemplo da UI; payload interno continua `colaborador_id` na API de férias (contrato REST existente).

**Rationale**: Mudar o schema Pydantic de férias para `fornecedor_id` exigiria alias/breaking change; valor de negócio está na UI.

**Alternatives considered**:
- Alias Pydantic `fornecedor_id` → possível depois; fora do mínimo desta feature.
