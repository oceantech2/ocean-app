# Research: Ajuste de Modais no Viewport

**Feature**: `072-ajuste-modais-viewport` | **Date**: 2026-09-14

## 1. Problema atual no código

**Decision**: Tratar como bug de layout: vários overlays usam `fixed inset-0 … flex items-center justify-center` com painel sem `max-height` efetivo (ex.: Contas) ou com `max-h-[90vh] overflow-y-auto` no painel inteiro (ex.: DocumentosModal), o que faz o conteúdo “bater” nas bordas e/ou rolar cabeçalho e ações juntos.

**Rationale**: Spec e clarify pedem margem ~24px e miolo rolável com chrome fixo.

**Alternatives considered**: Ajustar só Contas/NFs (rejeitado — FR-003 exige todas as modais do padrão).

## 2. Componente compartilhado vs classes duplicadas

**Decision**: Criar `frontend/src/components/Modal.tsx` (shell apresentacional) e migrar consumidores do padrão fundo escurecido + painel.

**Rationale**: Constituição V + FR-003 — uma única definição de margem/altura/regiões evita drift; custo de migração é mecânico.

**Alternatives considered**:
- Só utilitários CSS em `index.css` (menos tipagem/estrutura de regiões header/body/footer)
- Copiar as mesmas classes Tailwind em cada arquivo (alto risco de inconsistência)
- Biblioteca de dialog (Headless UI / Radix) — fora do escopo e desnecessária para o problema

## 3. Contrato visual do shell

**Decision**:

| Região | Comportamento |
|--------|----------------|
| Backdrop | `fixed inset-0`, fundo escurecido existente (`bg-black/50` ou equivalente já usado), `flex items-center justify-center`, padding vertical e horizontal ≥ `1.5rem` (24px) — ex.: `p-6` |
| Painel | `max-h-[calc(100vh-3rem)]` (100vh − 2×1,5rem), `w-full`, `max-w-*` via prop, `flex flex-col`, `overflow-hidden`, classes visuais atuais (`rounded-xl shadow-2xl bg-white dark:bg-gray-800`) |
| Header | `shrink-0` (título / fechar) |
| Body | `flex-1 min-h-0 overflow-y-auto` (miolo rolável) |
| Footer | `shrink-0` (Cancelar / Salvar / Fechar / etc.) |

**Rationale**: Atende FR-001, FR-002, FR-006, FR-007; `min-h-0` é necessário para flex + overflow funcionar.

**Alternatives considered**: `max-h-[90vh]` sem padding no backdrop (ainda pode colar visualmente); sticky CSS sem flex column (mais frágil com alturas dinâmicas).

## 4. Inventário de migração (escopo)

**Decision**: Migrar todos os `fixed inset-0 bg-black/50` (e equivalentes) em:

- Páginas: `Contas.tsx`, `NFs.tsx`, `Ferias.tsx`, `DH.tsx`, `Patrimonio.tsx`, `FluxoCaixa.tsx`, `Fornecedores.tsx`, `Configuracoes.tsx`
- Componentes: `DocumentosModal.tsx`, `ImportCSV.tsx`, `GerenciadorArquivos.tsx`

**Fora do escopo** (clarify): dropdown de notificações e menus; `window.confirm` / `alert`.

**Layout busca global** (`Layout.tsx`, `bg-black/40`, alinhado ao topo com `pt-24`): **incluir** se for reescrito para o mesmo shell com margem 24px (recomendado para FR-003), mantendo comportamento de fechar ao clicar fora / Esc. Se a UX de “ancorado no topo” for intencional, documentar como exceção no contrato UI e não forçar centralização vertical.

**Rationale**: Lista bate com grep do padrão; Bonus/Contratos/etc. não usam esse overlay hoje.

## 5. API do componente (props mínimas)

**Decision**: Props sugeridas (nomes podem ajustar na implementação):

- `open` implícito pelo render condicional do pai (padrão atual) **ou** `children` sempre montados pelo pai — manter o padrão `{condicao && <Modal>…}` para mudança mínima
- `maxWidth?: string` (ex.: `max-w-md` | `max-w-lg` | `max-w-2xl`) — default `max-w-md`
- `titulo` **ou** `header: ReactNode`
- `children` — corpo
- `footer?: ReactNode`
- `onBackdropClick?: () => void` — só onde já fecha no backdrop hoje
- `className` / `panelClassName` opcionais para casos raros

**Rationale**: Não forçar unificar handlers; só o chrome.

**Alternatives considered**: Portal obrigatório (`createPortal`) — opcional; só adotar se z-index/stacking context quebrar em alguma página (hoje overlays já são `fixed` na árvore da página).

## 6. Modais sem header/footer claros

**Decision**: Se o markup atual não separa regiões, na migração **introduzir** a separação mínima (título no header, botões de ação no footer, resto no body) sem mudar textos/handlers. Se for um overlay realmente monolítico sem ações, body = conteúdo inteiro com rolagem; garantir que ações principais não fiquem fora da área útil (FR-007).

**Rationale**: Clarify exigiu chrome fixo sempre que houver título/ações.

## 7. Backend / dados

**Decision**: Nenhuma alteração em FastAPI, schemas, migrations ou `api.ts`.

**Rationale**: Spec Assumptions — só apresentação.

## Resoluções NEEDS CLARIFICATION

Nenhum item técnico bloqueante. Detalhe fino de `maxWidth` por modal e se a busca do Layout centraliza ou permanece top-anchored fica no contrato UI e pode ser ajustado na implementação sem mudar requisitos de negócio.
