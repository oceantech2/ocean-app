# Quickstart: Correção de Férias (fornecedor, listagem, direito e folha)

**Feature**: `062-fix-ferias-fornecedor`  
**Contratos**: [rest-fornecedores-ferias.md](./contracts/rest-fornecedores-ferias.md) · [ui-ferias-fornecedor.md](./contracts/ui-ferias-fornecedor.md)  
**Modelo**: [data-model.md](./data-model.md)

## Pré-requisitos

```bash
docker compose up -d
cd frontend && npm run dev
```

- API: `http://localhost:8001` · Frontend: `http://localhost:5193`
- Login: `admin` / `123456` (e `visualizador` / `123456` para leitura)

No cadastro **Fornecedores**, garantir ao menos:

1. **Fixo** ativo, `data_admissao` ≥ 12 meses atrás, com `salario`
2. **Fixo** ativo, `data_admissao` &lt; 12 meses (conclusão ainda neste ano ou no futuro), com `salario`
3. **Spot** ativo, com ou sem salário (deve aparecer no seletor; **não** entra no Total da Folha)
4. Um inativo (não deve aparecer no seletor de Novo Período)

## Validação rápida da API

```bash
# Com token JWT de admin
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8001/api/fornecedores?ativo=true&limit=1000"
```

Esperado: **200** e array com os mesmos ativos da página Fornecedores (`nome`, `tipo_fornecedor`, `data_admissao`, `salario`).  
`GET /api/colaboradores?ativo=true&limit=1000` continua funcionando (compat).

## Cenários manuais (UI)

### 1. Listagem com nomes + rótulos

1. Abrir `/ferias` como admin.
2. Confirmar título, filtro, avisos e exportação visível com texto **Fornecedor**.
3. **Novo Período** → o select lista **nomes** dos ativos (1, 2 e 3; **não** o 4), iguais à página Fornecedores.

### 2. Ano sugerido + override &lt; 1 ano

1. Novo Período → selecionar fornecedor (2).
2. Conferir ano sugerido: se a data de entrada + 12 meses já passou, ano corrente; se cai no futuro, esse ano futuro.
3. Alterar o ano manualmente (deve aceitar).
4. Salvar → confirm aparece; **Cancelar** → não grava.
5. Salvar de novo → **OK** → período criado.

### 3. Direito sem aviso (≥ 1 ano)

1. Novo Período → fornecedor (1) → ano sugerido = ano corrente.
2. Salvar **sem** confirm de elegibilidade.

### 4. Datas opcionais

1. Criar período **sem** data início/fim → sucesso.
2. Editar com fim &lt; início → bloqueio até corrigir.
3. Salvar com **só uma** das datas → sucesso.

### 5. Salário e Total da Folha

1. Com filtro **Todos**, card **Total da Folha** = soma dos salários dos **Fixo ativos** (1 e 2; **não** o Spot).
2. Filtrar o Fixo (1) → card = salário dele; mudar só o **ano** → card **igual**.
3. Filtrar o Spot (3) → card = **0**.
4. Coluna Salário na tabela e campo no modal batem com o cadastro.
5. Abrir edição de um período existente → ano **não** muda sozinho.

### 6. Visualizador

1. Login visualizador → vê listagem, salários e Total da Folha; sem criar/editar/aprovar.

## Checks estáticos

```bash
cd frontend && npm run lint && npm run type-check
```

## Critério de pronto

Todos os cenários 1–6 passam; SC-001 a SC-006 da spec cobertos pelo smoke acima.
