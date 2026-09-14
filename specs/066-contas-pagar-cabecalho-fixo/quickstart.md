# Quickstart: Cabeçalho Fixo — Contas a Pagar

**Feature**: `066-contas-pagar-cabecalho-fixo`  
**Modelo**: [data-model.md](./data-model.md) · **Contrato UI**: [ui-contas-pagar-cabecalho-fixo.md](./contracts/ui-contas-pagar-cabecalho-fixo.md)

## Pré-requisitos

- Docker: API **8001**, Postgres **5433**
- Frontend: `cd frontend && npm run dev` → `http://localhost:5193`
- Login: `admin` / `123456` (e opcionalmente `visualizador` / `123456`)
- Listagem com linhas suficientes para exigir rolagem (filtro “Todos” os meses ou período amplo)

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

## Validação — área rolável + cabeçalho fixo (P1 / US1)

1. Logar como **admin**.
2. Abrir **Contas a Pagar**.
3. Confirmar que título, cards e filtros ficam **acima** da tabela e **não** rolam junto com as linhas.
4. Com listagem longa, rolar **somente** a área da tabela para baixo:
   - Cabeçalho das colunas permanece visível no topo dessa área.
   - Rótulos legíveis e alinhados às colunas.
5. Rolar até o fim da listagem: cabeçalho continua visível.

## Validação — voltar ao topo (P2 / US2)

1. Com a área já rolada, voltar ao topo da área da tabela.
2. Confirmar: um único cabeçalho; sem duplicação nem sobreposição ilegível das linhas.

## Validação — scroll horizontal (edge)

1. Estreitar a janela (ou zoom) até aparecer rolagem horizontal na tabela.
2. Rolar horizontalmente: cabeçalho e corpo permanecem alinhados.

## Validação — listagem curta (edge)

1. Filtrar até poucas linhas (sem scroll na área).
2. Cabeçalho no topo normal; sem artefato estranho de “fixação”.

## Validação — impressão / PDF

1. Com listagem longa na tela, acionar **Exportar PDF** / impressão.
2. Confirmar que o documento inclui as linhas além da viewport (não só o trecho visível na área rolável).

## Validação — visualizador (FR-005)

1. Logar como **visualizador**.
2. Abrir Contas a Pagar e repetir o scroll da área da tabela: mesmo cabeçalho fixo; permissões de ação inalteradas.

## Validação — regressão funcional (SC-004)

1. Como admin: filtrar, ordenar por coluna, abrir editar/criar (se aplicável) — mesmos fluxos de antes.

## Validação — qualidade

```bash
cd frontend && npm run lint && npm run type-check
```

## Resultado esperado

- [ ] Cabeçalho fixo na área rolável da tabela
- [ ] Chrome da página fora do scroll das linhas
- [ ] Sem duplicação / sobreposição ilegível
- [ ] Impressão completa
- [ ] Lint e type-check OK
