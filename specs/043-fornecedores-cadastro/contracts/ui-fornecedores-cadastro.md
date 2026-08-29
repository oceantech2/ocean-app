# Contrato UI: Fornecedores — cadastro unificado

**Feature**: `043-fornecedores-cadastro`  
Página: `frontend/src/pages/Fornecedores.tsx` (renomeada de `Colaboradores.tsx`)  
Rota: `/fornecedores` | Redirect: `/colaboradores` → `/fornecedores`  
permKey: `colaboradores` (inalterado para ACL)

## Navegação

| Elemento | Antes | Depois |
|----------|-------|--------|
| Menu lateral | Colaboradores | **Fornecedores** |
| path catálogo | `/colaboradores` | `/fornecedores` |
| Título da página | Colaboradores / duas abas | **Fornecedores** (única listagem) |

## Listagem

- Uma tabela sem abas colaborador/fornecedor
- Colunas mínimas: Nome, Documento, **Tipo** (Fixo/Spot), Telefone, E-mail, Status
- Filtros: busca, cargo (somente se houver legados com cargo — opcional manter filtro), inativos
- Ações admin: Novo fornecedor, Editar, Desativar, Importar, Exportar
- Visualizador: somente leitura

## Formulário — novo fornecedor (`elegivel_equipe=false`)

| Seção | Campos |
|-------|--------|
| Identificação | Nome, Documento (CPF/CNPJ), Razão Social (se CNPJ) |
| Classificação | **Tipo** (Fixo / Spot) — obrigatório |
| Contato | Telefone, E-mail |
| PF do CNPJ | Nome, CPF, Endereço, Data de Nascimento — **somente se CNPJ** |
| Observação | Observação |

**Ocultos**: cargo, salário, datas RH, benefício, histórico, documentos RH, data nascimento (CPF).

## Formulário — legado (`elegivel_equipe=true`)

Mesmas seções acima **mais** bloco RH existente:

- Cargo, Salário, Data de Nascimento (obrigatória se CPF), Admissão, Desligamento, Endereço, CEP, Benefício
- Histórico de cargo, Documentos (modais existentes)

Se CNPJ: seção PF obrigatória no save; data nascimento do bloco RH só para CPF legado.

## Comportamentos de validação (cliente)

Espelhar API; mensagens via `react-hot-toast`:

- Tipo Fixo/Spot obrigatório
- CNPJ → razão + PF completa antes de gravar
- Novo CPF → sem campo data nascimento
- Legado CPF → data nascimento obrigatória no bloco RH

## Outras telas (sem renomear rótulo "colaborador")

| Tela | Chamada API | Lista |
|------|-------------|-------|
| Férias | `listar(..., elegivel_equipe: true)` | Só ex-colaboradores |
| Bônus | idem | idem |
| Patrimônio | idem | idem |
| NFs (selects) | idem | idem |
| Contas a Pagar | `listar(..., ativo: true)` todos fornecedores | Todos ativos |

## Arquivos tocados (referência implementação)

- `frontend/src/utils/paginasCatalogo.ts` — label, path, desc
- `frontend/src/App.tsx` — redirect `/colaboradores`
- `frontend/src/pages/Fornecedores.tsx` — UI unificada
- `frontend/src/services/api.ts` — params `elegivel_equipe`, campos PF/tipo_fornecedor
- `frontend/src/types/index.ts` — interface estendida
- `frontend/src/pages/Ferias.tsx`, `Bonus.tsx`, `Patrimonio.tsx`, `NFs.tsx` — filtro equipe
- `frontend/src/components/Layout.tsx` — se label duplicado fora do catálogo
