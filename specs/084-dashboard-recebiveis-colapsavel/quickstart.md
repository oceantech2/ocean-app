# Quickstart: Previsão de Recebíveis Recolhível no Dashboard

## Pré-requisitos

```bash
docker compose up -d
cd frontend && npm run dev   # http://localhost:5193
```

Login com um usuário de desenvolvimento (`admin` ou `visualizador`).

## Verificações estáticas

```bash
cd frontend
npm run type-check
npm run lint
```

Esperado: sem erros novos.

## Cenários manuais

1. **Fechada por padrão (US1 / FR-001, FR-002)** — abrir `/dashboard`. A seção "Previsão de Recebíveis" mostra título, subtítulo e "Total em aberto"; os cards por faixa **não** aparecem; seta aponta para a direita.
2. **Expandir (US2 / FR-003, FR-005)** — clicar no cabeçalho. Os 4 cards por faixa aparecem; seta aponta para baixo.
3. **Recolher (US2)** — clicar de novo. Os cards somem.
4. **Teclado (FR-004)** — navegar com Tab até o cabeçalho e pressionar Enter e Espaço; a seção alterna. Leitor de tela anuncia expandido/recolhido.
5. **Filtros não alteram o estado (US1 cenário 2)** — com a seção fechada, trocar mês/ano/visão de receita; continua fechada e o total acompanha a visão.
6. **Recarregar (US2 cenário 4)** — com a seção aberta, recarregar a página; volta fechada.
7. **Sem nova busca (FR-006)** — DevTools > Network: alternar a seção não dispara requisições.
8. **Papel visualizador (FR-007)** — repetir 1–3 com `visualizador`.
