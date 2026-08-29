# Quickstart: Fornecedores — cadastro unificado

**Feature**: `043-fornecedores-cadastro`  
Contratos: [rest-fornecedores-cadastro.md](./contracts/rest-fornecedores-cadastro.md), [ui-fornecedores-cadastro.md](./contracts/ui-fornecedores-cadastro.md)  
Modelo: [data-model.md](./data-model.md)

## Pré-requisitos

- API `http://localhost:8001`, frontend `http://localhost:5193`
- PostgreSQL porta **5433**
- Login `admin` / `123456` (dev)

## Subir ambiente

```bash
docker compose up -d
cd frontend && npm run dev
```

Aguardar migração inline no boot do backend (`docker logs ocean_backend`).

## Validação ponta a ponta

### 1. Navegação e rota

1. Menu exibe **Fornecedores** (não Colaboradores).
2. Abrir `/fornecedores` — listagem única, sem abas.
3. Acessar `/colaboradores` — redirect para `/fornecedores`.

### 2. Legado (ex-colaborador)

1. Registro antigo aparece na listagem com **Tipo = Fixo** (padrão migrado).
2. Editar: bloco RH visível (cargo, salário, data nascimento se CPF).
3. Em **Férias** ou **Bônus**, o registro continua no select.

### 3. Novo fornecedor

1. **Novo fornecedor** → Tipo Spot, CPF, nome e contato — **sem** data nascimento nem cargo.
2. Gravar e reabrir — Tipo Spot persistido.
3. Em **Férias**, o novo registro **não** aparece no select.
4. Em **Contas a Pagar**, o novo registro **aparece** no select de fornecedor.

### 4. Fornecedor CNPJ

1. Criar CNPJ + Razão Social + PF (nome, CPF, endereço, data nascimento).
2. Tentar gravar sem PF — recusa com mensagem clara.
3. Reabrir — todos os campos PF persistidos.

### 5. CNPJ legado sem PF

1. Se existir CNPJ migrado sem PF: listagem OK; vínculo em conta OK.
2. Editar e tentar salvar sem PF — recusa.
3. Completar PF e salvar — sucesso.

### 6. Importação

1. Importar planilha com colunas de equipe completas → `elegivel_equipe` e aparece em Férias.
2. Importar linha mínima (sem RH) → fornecedor Fixo, não aparece em Férias.

### 7. Papéis

- `visualizador`: vê fornecedores e Tipo; não edita.
- `admin`: CRUD completo.

### 8. Qualidade de código

```bash
cd frontend && npm run lint && npm run type-check
```

## Falhas esperadas

| Ação | Resultado |
|------|-----------|
| Gravar sem Tipo Fixo/Spot | Toast de erro; não grava |
| CNPJ sem PF no save | Toast de erro; não grava |
| Documento duplicado ativo | Mensagem de duplicidade |
| Novo fornecedor em Férias | Não listado |
| `/colaboradores` | Redirect 302/client para `/fornecedores` |

## Rollback manual (dev)

Reverter branch e reiniciar backend; colunas novas são aditivas — rollback de código deve ignorar campos novos na API antiga.
