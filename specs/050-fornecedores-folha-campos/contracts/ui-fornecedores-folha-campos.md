# Contrato UI: Fornecedores — PF parcial, período, salário e Total da folha

**Feature**: `050-fornecedores-folha-campos`  
Página: `frontend/src/pages/Fornecedores.tsx`  
Rota: `/fornecedores` (inalterada)  
permKey: `colaboradores`

## Card Total da folha

| Elemento | Comportamento |
|----------|----------------|
| Posição | Área de resumo no topo da página (próximo ao título / contagem), visível para admin e visualizador |
| Título | **Total da folha** |
| Valor | Soma em BRL (`pt-BR`) dos `salario` de registros com `ativo` e `tipo_fornecedor === 'fixo'` |
| Base | Lista completa carregada (antes do filtro de busca/cargo da tabela) |
| Exclusões | Spot, inativos, salário ausente/null |
| Atualização | Após create/update/desativar/reativar e `carregarFornecedores` |

## Formulário — todos os fornecedores

| Campo | Visibilidade | Obrigatório | Notas |
|-------|--------------|-------------|-------|
| Salário | Sempre | Não | Sem `*`; number ≥ 0 |
| Data de início | Sempre | Não | Bind `data_admissao`; rótulo **não** é “Admissão” |
| Data de término | Sempre | Não | Bind `data_desligamento`; rótulo **não** é “Desligamento” |

## Formulário — seção Pessoa física do CNPJ

| Campo | Obrigatório na UI |
|-------|-------------------|
| Nome | Sim (`*`) |
| Endereço | Sim (`*`) |
| CPF | Não (sem `*`) |
| Data de Nascimento | Não (sem `*`) |

Validação cliente espelha API; toasts via `react-hot-toast`.

## Formulário — bloco RH legado (`elegivel_equipe`)

| Campo | Visibilidade |
|-------|--------------|
| Cargo, benefício, CEP, endereço completo, data nascimento (CPF), histórico, documentos | Só legado (inalterado vs 043) |
| Salário / início / término | **Já cobertos** na seção “todos”; não duplicar campos se já exibidos fora do bloco |

## Listagem

Sem obrigatoriedade de nova coluna; opcional manter salário visível se já existir. Card não depende de coluna na tabela.

## Papéis

| Papel | Card | Formulário |
|-------|------|------------|
| admin | vê | cria/edita |
| visualizador | vê | somente leitura |

## Arquivos tocados (referência)

- `frontend/src/pages/Fornecedores.tsx` — principal
- `frontend/src/types/index.ts` / `services/api.ts` — só se payload precisar ajuste explícito
- `backend/app/api/routes/colaboradores.py` — validação (ver contrato REST)
