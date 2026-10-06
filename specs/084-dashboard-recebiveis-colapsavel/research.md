# Research: Previsão de Recebíveis Recolhível no Dashboard

## 1. Mecanismo de collapse

- **Decision**: `useState<boolean>(false)` em `Dashboard.tsx` + `<button type="button">` envolvendo o cabeçalho, com `aria-expanded` e `aria-controls`; conteúdo renderizado condicionalmente.
- **Rationale**: Menor solução; `button` nativo já dá foco e Enter/Espaço (FR-004) sem handlers extras; estado inicial `false` atende FR-001.
- **Alternatives considered**: `<details>/<summary>` (estilização do marcador inconsistente entre navegadores e layout flex do cabeçalho mais frágil); biblioteca de accordion (dependência desnecessária — princípio V).

## 2. Persistência do estado

- **Decision**: Não persistir.
- **Rationale**: Clarify definiu que a seção sempre inicia fechada (SC-001).
- **Alternatives considered**: `localStorage`/Zustand — contrariaria o requisito de iniciar fechada a cada visita.

## 3. Indicador visual

- **Decision**: Reusar `ChevronRightIcon` de `components/navIcons.tsx`, rotacionado 90° quando aberto (`rotate-90` + `transition-transform`).
- **Rationale**: Ícone já usado na sidebar recolhível (feature 005) — consistência visual (princípio IV) sem novo SVG.
- **Alternatives considered**: Novo `ChevronDownIcon` — duplicação desnecessária.

## 4. Busca de dados

- **Decision**: Manter o carregamento do aging como está (no carregamento do Dashboard), independente do estado aberto/fechado.
- **Rationale**: O "Total em aberto" fica visível com a seção fechada, então os dados são necessários de qualquer forma; FR-006 proíbe nova busca ao alternar.
