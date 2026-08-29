# Quickstart: Página Comissões

**Feature**: `044-comissoes-pagina`  
Contratos: [ui-comissoes-pagina.md](./contracts/ui-comissoes-pagina.md), [rest-comissoes-pagina.md](./contracts/rest-comissoes-pagina.md)  
Modelo: [data-model.md](./data-model.md)

## Pré-requisitos

- API `http://localhost:8001`, frontend `http://localhost:5193`
- PostgreSQL porta **5433**
- Login `admin` / `123456` e `visualizador` / `123456` (dev)

## Subir ambiente

```bash
docker compose up -d
cd frontend && npm run dev
```

## Validação ponta a ponta

### 1. Nomenclatura e rota

1. Menu exibe **Comissões** (não Bônus) e abre `/comissoes`.
2. Título, gráfico, estado vazio, editar, toasts, importar/exportar nesta página: sem a palavra bônus.
3. Configurações: catálogo desta página diz **Comissões**.
4. Dashboard: categoria que era Bônus diz **Comissões**.
5. Contas a Pagar: **Comissões** / **Comissões (legado)**; a subcategoria **Comissão** (`comissao`) permanece distinta.
6. Auditoria: filtro/exibição **Comissão** (não Bonus/Bônus).

### 2. Endereço antigo

1. Autenticado, abrir `/bonus`.
2. A listagem de Comissões **não** aparece.
3. Não há ida automática para `/comissoes` nem Dashboard.

### 3. Sem criação avulsa

1. Como admin em `/comissoes`: **não** há botão Novo bônus / Nova comissão.
2. Importar CSV (admin), Editar e Deletar um registro existente: ainda funcionam.
3. Como visualizador: sem botão de novo, sem importar/editar/excluir.

### 4. Filtro de período

Pré-condição: registros no mesmo ano em pelo menos dois meses de trimestres diferentes (ex.: março e agosto).

1. Abertura: ano corrente + **ano inteiro**; listagem e total do ano; gráfico com 12 meses.
2. Recorte **mês** = março → listagem e total só março; gráfico ainda 12 meses.
3. Recorte **1º trimestre** → janeiro–março, sem abril+; gráfico ainda 12 meses.
4. Voltar a **ano inteiro** → listagem do ano de novo.
5. Mês sem dados → estado vazio e total zero; página utilizável.
6. Exportar CSV com recorte ativo → só as linhas visíveis.

### 5. Papéis

- `visualizador`: vê Comissões, usa filtros, não altera dados.
- `admin`: import/editar/excluir; sem criar avulso.

### 6. Qualidade de código

```bash
cd frontend && npm run lint && npm run type-check
```

## Falhas esperadas

| Ação | Resultado |
|------|-----------|
| Procurar “Bônus” no menu | Item inexistente; há **Comissões** |
| `/bonus` autenticado | Nenhuma tela do produto |
| Botão novo registro | Ausente |
| Mês e trimestre ao mesmo tempo | Impossível; só um recorte ativo |
| Subcategoria RH “Comissão” | Continua distinta de “Comissões” (ex-Bônus) |
