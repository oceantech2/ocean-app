# Quickstart: Validação — Contas a Pagar listagem plana e filtro Mês/Ano

**Feature**: `046-contas-pagar-listagem-colunas` | **Date**: 2026-08-29  
**Contrato UI**: [contracts/ui-contas-pagar-listagem-colunas.md](./contracts/ui-contas-pagar-listagem-colunas.md) · **Modelo**: [data-model.md](./data-model.md)

## Pré-requisitos

- Infra / API (`docker compose up -d` se necessário; API **8001**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Contas com vencimento em **≥2 meses** e **≥2 categorias**; ao menos uma **sem vencimento** (opcional); contas **Fixo** e **Variável**
- Credenciais de desenvolvimento do projeto

## Setup

```bash
cd frontend
npm run lint
npm run type-check
npm run dev
```

Abrir `http://localhost:5193`, autenticar, ir em **Contas a Pagar**.

## Cenários de validação

### 1. Tabela plana e colunas (P1)

1. Entrar em Contas a Pagar.
2. **Esperado**: uma única tabela (sem blocos por mês/categoria); sem controle “Agrupar”.
3. Conferir ordem das colunas: Descrição → Categoria → Mês/Ano → … → Ações.
4. Linha RH: Categoria = `Recursos Humanos / …`; Mês/Ano = `Agosto/2026` (ex.); Tipo = Fixo ou Variável.
5. Conta sem vencimento: só aparece com filtro **Todos**; Mês/Ano = `—`.

### 2. Filtro Mês/Ano padrão (P1)

1. Recarregar a página.
2. **Esperado**: Mês e Ano = correntes; **Todos** desmarcado.
3. Só contas do mês/ano corrente listadas.
4. Marcar **Todos**: contas de vários meses; Mês/Ano desabilitados.
5. Ano: opções de corrente−5 a corrente+5.
6. No ano corrente, selecionar mês futuro (ex.: dezembro): permitido; contas daquele mês aparecem se existirem.

### 3. Filtros combinados e cards (P1)

1. Categoria = Marketing + Mês/Ano = mês corrente.
2. **Esperado**: só Marketing naquele mês.
3. Cards Total, Pago, A pagar, Vencido = soma das linhas visíveis; Total = Pago + A pagar + Vencido.

### 4. Ordenação (P2)

1. Abrir página: linhas por vencimento ascendente.
2. Clicar Mês/Ano desc: ordem cronológica invertida.
3. Mudar filtro de categoria: ordenação volta a vencimento asc.

### 5. Alertas e notificações (P2)

1. Menu notificações → **Contas vencidas** (ou status “Vencida”).
2. **Esperado**: recorte mensal em **Todos**; vencidas de meses anteriores visíveis.
3. Voltar status “Todos”: filtro mensal retorna ao padrão (mês/ano correntes).

### 6. Exportação (P2)

1. Com filtro mês corrente ativo, **Exportar CSV**.
2. **Esperado**: colunas Categoria, Mês/Ano, Tipo na ordem da tabela; só linhas visíveis.
3. **Exportar PDF**: colunas legíveis na impressão.
4. **Exportar Excel**: arquivo inclui Categoria, Mês/Ano, Tipo; respeita categoria/status/mês/ano da API.

### 7. Regressão (P2)

1. Admin: criar/editar/pagar conta, anexo NF, import — inalterados.
2. Visualizador: mesma tabela e filtros; sem edição.
3. Dashboard / Contas a Receber inalterados.

## Backend (se alterado export)

```bash
docker logs ocean_backend -f
```

Testar `GET /api/contas/exportar-xlsx?mes=8&ano=2026&categoria=marketing` com token válido.

## Critérios de aceite rápidos

- [ ] SC-001: abertura com mês/ano correntes
- [ ] SC-002: **Todos** mostra multi-mês sem grupos
- [ ] SC-003: colunas batem com dados
- [ ] SC-004: cards = linhas visíveis
- [ ] SC-006: exportações com colunas novas
