# Research: Correção de Férias (fornecedor, listagem, direito e folha)

**Feature**: `062-fix-ferias-fornecedor` | **Date**: 2026-09-14

## R1 — Lista vazia: `elegivel_equipe` vs página Fornecedores

**Decision**: Em Férias, carregar **todos os fornecedores ativos**, com o mesmo critério da página Fornecedores: `listar(0, 1000, true)` **sem** `elegivel_equipe`. Inativos ficam de fora do seletor e do filtro (períodos históricos de inativos continuam na tabela).

**Rationale**: A spec (clarify A) exige a **mesma lista** da página Fornecedores. Hoje `Ferias.tsx` chama `colaboradoresService.listar(0, 200, true, { elegivel_equipe: true })`. Após a unificação, `GET /colaboradores` já restringe `tipo == "fornecedor"`; `elegivel_equipe=true` reduz ao subconjunto de RH e deixa o seletor vazio na operação. Fornecedores.tsx usa `limit=1000` e `ativo=true` sem esse filtro.

**Alternatives considered**:
- Manter `elegivel_equipe=true` (plano 050) → rejeitado (contradiz clarify A; é a causa do bug).
- Limit 200 → rejeitado (pode omitir nomes que a página Fornecedores mostra).
- Listar inativos no seletor de criação → rejeitado (spec: só ativos).

## R2 — “Trocar endpoint” sem migrar FKs

**Decision**: Registrar o mesmo router de `colaboradores` também em `/api/fornecedores` (`main.py`). Criar `fornecedoresService` no frontend apontando para `/fornecedores` (mesmos métodos de listagem). Férias usa esse serviço. Manter `/api/colaboradores` e `colaboradoresService` (página Fornecedores e demais telas). Query/body de férias continua `colaborador_id`.

**Rationale**: Pedido explícito de trocar a fonte na tela de Férias. A tabela `colaboradores` e o FK `ferias.colaborador_id` são legado estável (043). Alias de prefixo entrega o contrato sem migration.

**Alternatives considered**:
- Renomear tabela/coluna para `fornecedor_id` → rejeitado (alto risco, fora do escopo).
- Só trocar rótulos e continuar em `/colaboradores` → rejeitado (contradiz “trocar endpoint”).
- Alias Pydantic `fornecedor_id` no POST de férias → YAGNI; payload interno permanece `colaborador_id`.

## R3 — Direito após 12 meses + override só na criação

**Decision**: Util `temDireitoAdquirido(dataAdmissao, ref = hoje)`: `true` se `data_admissao` existe e `início do dia(ref) >= data_admissao + 1 ano` (aniversário inclusivo, parse local `T00:00:00`). No `salvar` de **criação** (admin): se `!temDireitoAdquirido`, `window.confirm`; só grava se confirmar. **Edição** não re-pede override. Backend `/ferias` **não** bloqueia (evita flag de override no body).

**Rationale**: Clarify 050/062: aviso + override. Confirm no cliente alinha ao produto (`window.confirm` em exclusões). Spec FR-006: override só na criação.

**Alternatives considered**:
- Bloqueio rígido no backend → rejeitado (override permitido).
- Campo `override_elegibilidade` no POST → YAGNI.
- Reconfirmar na edição → rejeitado (FR-006).

## R4 — Sugestão de ano aquisitivo

**Decision**: Util `sugerirAnoAquisitivo(dataAdmissao, ref = hoje)`:
1. Sem `data_admissao` → ano corrente.
2. `conclusao = data_admissao + 12 meses`; se `conclusao` já passou (≤ ref) → ano corrente; senão → ano civil de `conclusao`.
3. Ao selecionar/trocar fornecedor **na criação**, preencher `form.ano` com o resultado (admin pode editar). Na **edição**, não recalcular.

**Rationale**: Clarify B. Quem já completou 1 ano registra férias no ano operacional atual; quem ainda não completou vê o ano em que o direito nasce (pode ser futuro) e o override continua.

**Alternatives considered**:
- Sempre ano corrente (comportamento atual) → rejeitado (clarify B).
- Travar o ano (não editável) → rejeitado (admin deve poder alterar).
- Ano = ano civil da admissão → errado para quem tem anos de casa.

## R5 — Datas opcionais

**Decision**: Manter `data_inicio`/`data_fim` nullable (`null` se vazio); UI sem asterisco; regras atuais de `intervaloInvertido` / `diasCorridos` e `datas_validas` no backend.

**Rationale**: Backend e formulário já aceitam null; a spec pede garantir a opcionalidade (uma data só, ou nenhuma).

**Alternatives considered**:
- Exigir as duas datas juntas ou nenhuma → rejeitado (spec permite uma só).

## R6 — Salário e Total da Folha (Tipo Fixo)

**Decision**: Salário somente leitura a partir do objeto já carregado (`salario`). Coluna na tabela + campo no modal. Card **Total da Folha** replica a fórmula de `Fornecedores.tsx`:

`sum(salario ?? 0)` onde `ativo && (tipo_fornecedor || 'fixo') === 'fixo'`.

Filtro de fornecedor na página: se “Todos”, soma todos os Fixo ativos da carga; se um **Fixo**, só o salário dele; se um **Spot**, **zero**. Filtro de **ano não entra**. Card sempre visível (total 0 ok). Sem endpoint de agregação.

**Rationale**: Clarify B. Alinha Férias ao card da página Fornecedores. Spot permanece no seletor.

**Alternatives considered**:
- Somar todos os ativos do seletor (incluindo Spot) → rejeitado (clarify B).
- `GET /ferias/total-folha` → desnecessário no volume atual.

## R7 — Nomenclatura UI vs payload

**Decision**: UI, export CSV visível e avisos usam **Fornecedor**. Import: exemplo/rótulo visível orientado a fornecedor; payload da API de férias continua `colaborador_id`. Auditoria pode continuar com o ID; texto “Fornecedor {id}” é cosmética opcional.

**Rationale**: Valor de negócio está na UI; breaking change no schema de férias está fora do escopo.

**Alternatives considered**:
- Redesenhar importador CSV → rejeitado (spec: fora de escopo além de rótulos visíveis).
