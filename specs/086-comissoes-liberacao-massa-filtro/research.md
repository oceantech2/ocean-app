# Research: Correção da liberação em massa e filtro por status de liberação

## R1 — Causa raiz do "nada acontece"

**Evidências coletadas (2026-10-08)**:

- `POST /api/bonus/acoes/liberar` local: `200 {"processados":0,"ignorados":1}` para ID inexistente; rota declarada antes de `/{bonus_id}` (sem conflito de rota).
- Supabase (produção): 11 comissões `liberado=false`; `audit_logs` com 15+ `liberar` individuais em 05/10, entre 22:37 e 23:39, com 10–40 s de intervalo, e nenhuma em massa.
- Render (produção): nenhuma linha com `/api/bonus/acoes/` nos logs dos últimos 30 dias, ou seja, a requisição nunca sai do navegador.
- Bundle de produção (`assets/Bonus-BxlzHwId.js`): handler `liberarLote` idêntico ao fonte (`if (e.length && confirm(...))`).
- Navegador local: clique real em "Liberar em massa" chama `confirm(...)`, então o handler está ligado.

**Decision**: Tratar duas causas plausíveis e silenciosas: `window.confirm` recusado em silêncio (opção do Chrome "impedir caixas de diálogo adicionais", oferecida após diálogos repetidos, como nas liberações individuais de 05/10) e barra de ações fora de vista (no topo, acima do gráfico, e sob o cabeçalho sticky `z-20/z-30`).

**Rationale**: Ambas produzem exatamente "sem confirmação, sem mensagem, sem requisição". O servidor está correto.

**Alternatives considered**: Bug de rota/permissão no backend, descartado (endpoint responde 200 e `require_admin` valida `papel`); build desatualizado, descartado (bundle idêntico).

## R2 — Confirmação

**Decision**: Modal do sistema usando `components/Modal.tsx`, com título da ação, quantidade de itens elegíveis, valor total e botões Cancelar/Confirmar; Esc e clique no fundo cancelam.

**Rationale**: Não depende de diálogos nativos, que podem ser bloqueados, e mostra o resumo financeiro antes de confirmar.

**Alternatives considered**: Manter `window.confirm` com fallback de detecção por tempo de retorno (frágil); sem confirmação (arriscado para ação financeira em lote).

## R3 — Visibilidade da barra

**Decision**: Barra `fixed` no rodapé da viewport (`bottom-6`, centralizada, `z-40`, abaixo do `Modal` em `z-50` e acima dos stickies `z-20/z-30`), exibida só com seleção; espaçador no fim da lista (`pb-24`) para não cobrir o último item.

**Rationale**: Fica visível em qualquer rolagem, perto da lista onde o usuário marca itens.

**Alternatives considered**: `sticky` dentro do fluxo (depende do ancestral de rolagem e conflita com os stickies de título/filtros); mover a barra para baixo do gráfico (ainda sai de vista em listas longas).

## R4 — Elegibilidade

**Decision**: Liberar envia `selecionados ∩ {!liberado}`; Pagar envia `selecionados ∩ {liberado && !pago}`. A barra mostra "N selecionada(s) · X a liberar · Y a pagar"; o botão sem elegíveis fica desabilitado. A mensagem final inclui ignorados ("já processados por outra pessoa").

**Rationale**: Espelha as regras do servidor; evita "0 liberado(s), N ignorado(s)" sem explicação.

## R5 — Filtro de status

**Decision**: Estado local `statusLiberacao: 'todos' | 'liberados' | 'nao_liberados'` (padrão `'todos'`, não persistido), aplicado em memória sobre `bonusFiltrado`, que alimenta lista, totais e CSV; o gráfico continua usando `bonus` (ano inteiro). A troca limpa a seleção e volta à página 1.

**Rationale**: Os itens do ano já estão carregados (`limit=500`); sem custo de servidor. O padrão local segue o de `aba` na mesma tela.

**Alternatives considered**: Parâmetro `liberado` no `GET /bonus` (mudança de backend desnecessária); persistir em `usePageFilters` (fora do pedido).
