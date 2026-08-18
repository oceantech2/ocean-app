# Quickstart: Validação — Tabela Contas a Receber

**Feature**: `033-contas-receber-tabela` | **Date**: 2026-08-18  
**Contrato**: [contracts/ui-contas-receber-tabela.md](./contracts/ui-contas-receber-tabela.md) · **Modelo**: [data-model.md](./data-model.md)

## Pré-requisitos

- Infra / API conforme o projeto (`docker compose up -d` se necessário; API **8001**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Há registros de contas a receber no período filtrado (vários, com colunas além da largura da tela)
- Credenciais de desenvolvimento do projeto (não documentar senhas neste artefato)

## Setup

```bash
cd frontend
npm run lint
npm run type-check
npm run dev
```

Abrir `http://localhost:5193`, autenticar e ir em **Contas a Receber**.

## Cenários de validação

### 1. Cabeçalho em duas linhas (P1)

1. Observar nomes longos (ex.: Método de pagamento, Data ent. pgto) e curtos (ex.: NF, Bruto).
2. **Esperado**: linha de cabeçalho mais alta; longos quebram em até duas linhas; curtos podem ficar em uma; colunas não estão largas só por causa do rótulo em uma linha.
3. Se algum nome passar de duas linhas, hover mostra o texto completo.

### 2. Área restante da tela (P1)

1. Com título, filtros e cards visíveis, ver o card da lista.
2. **Esperado**: a grade usa o espaço até o rodapé da janela (não uma caixa baixa de 10 linhas). Paginação fica abaixo da grade, visível sem rolar a página só por causa das linhas.

### 3. Scroll vertical interno (P1)

1. Garantir mais linhas do que a altura da área (aumentar “Exibir” por página se preciso).
2. Rolar as linhas na grade.
3. **Esperado**: nomes das colunas permanecem no topo da **grade**; título da página e filtros não descem. O cabeçalho **não** gruda no logo/header do app.

### 4. Scroll horizontal no cabeçalho (P1)

1. Estreitar a janela ou usar notebook para as colunas ultrapassarem a largura.
2. Usar a rolagem horizontal **junto aos nomes das colunas**.
3. **Esperado**: colunas do meio andam alinhadas aos nomes; **Projeto** fica à esquerda; **Ações** fica à direita; não é necessário ir ao fim da lista para achar a barra horizontal.

### 5. Cantos e papéis (P1)

1. Rolar vertical e horizontal ao mesmo tempo.
2. **Esperado**: canto Projeto (cabeçalho) e canto Ações (cabeçalho) visíveis e alinhados.
3. Login visualizador: mesma grade e scrolls; sem botões de escrita.

### 6. Estados e regressão (P2)

1. Filtro sem resultados / loading: sem barras falsas; mensagem/spinner atuais.
2. Ordenar por uma coluna, paginar, abrir editar/pagar (admin): fluxos atuais funcionam.
3. Outra página (ex.: Contas a Pagar): scroll da página **não** ficou preso (Layout não quebrou o restante do app).

### 7. Resize (P2)

1. Redimensionar a janela.
2. **Esperado**: a área da tabela acompanha a altura/largura; sticky e alinhamento se mantêm.
