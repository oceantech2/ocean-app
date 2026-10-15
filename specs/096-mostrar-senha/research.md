# Research: Mostrar/ocultar senha

## R1. Componente único vs. ajuste em cada tela

- **Decisão**: `CampoSenha` sem `forwardRef` (nenhuma tela usa ref), com props `InputHTMLAttributes` sem `type`; estado local `visivel` (começa `false`, FR-002). Modal de Configurações desmonta ao fechar, então reabrir volta oculto.
- **Rationale**: Garante o mesmo comportamento e acessibilidade nos 5 campos (FR-001, FR-004).
- **Alternativas consideradas**: Biblioteca de ícones (descartada: o projeto usa SVG inline; dependência a mais para 2 ícones).

## R2. Acessibilidade

- **Decisão**: `<button type="button">` (não envia o form), `aria-label` alternando "Mostrar senha"/"Ocultar senha", `aria-pressed={visivel}`, foco visível via `focus:ring`. Fica na ordem natural do Tab, logo após o input.

## R3. Layout

- **Decisão**: Wrapper `relative`; input recebe a classe da tela + `pr-10`; botão `absolute inset-y-0 right-0 px-3` com `text-gray-500 hover:text-gray-700 dark:text-gray-400`. Ícones: olho (`M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z` + círculo) e olho riscado (mesmo + diagonal).
