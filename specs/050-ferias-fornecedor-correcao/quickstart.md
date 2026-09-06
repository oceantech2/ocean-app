# Quickstart: Correção de Férias (fornecedor, listagem e folha)

**Feature**: `050-ferias-fornecedor-correcao`  
**Contratos**: [rest-fornecedores-ferias.md](./contracts/rest-fornecedores-ferias.md) · [ui-ferias-fornecedor.md](./contracts/ui-ferias-fornecedor.md)  
**Modelo**: [data-model.md](./data-model.md)

## Pré-requisitos

```bash
docker compose up -d
cd frontend && npm run dev
```

- API: `http://localhost:8001` · Frontend: `http://localhost:5193`
- Login: `admin` / `123456` (e `visualizador` / `123456` para leitura)

Garantir no cadastro **Fornecedores** ao menos:

1. Elegível à equipe, ativo, `data_admissao` ≥ 12 meses atrás, com `salario`
2. Elegível, ativo, `data_admissao` &lt; 12 meses (ou sem admissão), com `salario`
3. (Opcional) Fornecedor não elegível — **não** deve aparecer no seletor de Férias

## Validação rápida da API

```bash
# Com token JWT de admin
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8001/api/fornecedores?ativo=true&elegivel_equipe=true&limit=200"
```

Esperado: 200 e array com `nome`, `data_admissao`, `salario`.  
`GET /api/colaboradores?...` deve continuar funcionando (compat).

## Cenários manuais (UI)

### 1. Listagem com nomes + rótulos

1. Abrir `/ferias` como admin.
2. Confirmar filtros/avisos com texto **Fornecedor**.
3. **Novo Período** → select lista **nomes** dos elegíveis (1 e 2 acima; não o 3).

### 2. Override &lt; 1 ano

1. Novo Período → selecionar fornecedor (2).
2. Preencher ano e dias; salvar.
3. Confirmar aparece; **Cancelar** → não grava.
4. Salvar de novo → **OK** → período criado com direito padrão do fluxo.

### 3. Direito sem aviso (≥ 1 ano)

1. Novo Período → fornecedor (1) → salvar sem confirm de elegibilidade.

### 4. Datas opcionais

1. Criar período **sem** data início/fim → sucesso.
2. Editar com fim &lt; início → bloqueio até corrigir.

### 5. Salário e Total da Folha

1. Card **Total da Folha** = soma dos salários dos elegíveis ativos visíveis na carga.
2. Filtrar um fornecedor → card = salário dele; mudar só o **ano** → card **igual**.
3. Coluna Salário na tabela e campo no modal batem com o cadastro.

### 6. Visualizador

1. Login visualizador → vê listagem, salários e Total da Folha; sem criar/editar/aprovar.

## Checks estáticos

```bash
cd frontend && npm run lint && npm run type-check
```

## Critério de pronto

Todos os cenários 1–6 passam; SC-001 a SC-006 da spec cobertos pelo smoke acima.
