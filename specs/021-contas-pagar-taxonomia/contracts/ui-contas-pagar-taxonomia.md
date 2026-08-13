# Contrato UI: Contas a Pagar — Taxonomia

**Feature**: `021-contas-pagar-taxonomia` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md) · **Modelo**: [data-model.md](../data-model.md)

## Página Contas a Pagar (`/contas`)

### Select Categorias (criar, editar, filtro)

Ordem fixa:

1. Adm/Financeiro  
2. Operações  
3. Marketing  
4. Comercial  
5. Recursos Humanos  
6. Benefícios  
7. Tecnologia  
8. Impostos  

Filtro: opção “Todas” no topo, depois a mesma ordem.

### Subcategoria RH

- **Novo lançamento** e edição de conta **não** legado: quatro opções — Salário, Bônus, Comissão, Retirada Sócios. Obrigatória se Categorias = Recursos Humanos. Ocultar se outra categoria.
- **Edição de legado** RH / Benefícios: mostrar o valor atual **Benefícios** no select de sub (opção só dessa conta). Sem banner/badge de pendência. Salvar valor/datas/pagar sem trocar Categorias mantém o par.
- Para reclassificar: mudar Categorias para **Benefícios** (primeiro nível) e limpar sub; salvar.

### Listagem

- Rótulo legado: **Recursos Humanos / Benefícios** (mesmo padrão `Categoria / Sub` das outras de RH).
- Agrupamento por categoria: legado permanece no grupo RH (sub Benefícios); contas `beneficios` no grupo Benefícios.
- Sem aviso “Reclassificar” para esse par (`categoria_pendente` continua só para pendências 008).

### Filtros

| Filtro | Resultado |
|--------|-----------|
| RH sem sub | Oficiais de RH **e** legado Benefícios |
| RH + Salário (etc.) | Só essa sub oficial |
| Benefícios | Só categoria de primeiro nível |
| Todas | Sem restrição de categoria |

### Import CSV na página

- Exemplo/colunas: `categoria=beneficios` (ou label Benefícios) sem sub.
- Linha com sub Benefícios em RH: erro visível na linha (espelha a API).

### Papéis

- **admin**: criar/editar/importar com as regras acima.
- **visualizador**: lista e filtros; vê rótulo legado; sem escrita.

## Dashboard — custo por categoria

- Se existir valor em `beneficios`, fatia **Benefícios** com cor própria (não reutilizar a de RH).
- Sem fatia zerada (omitir se total 0, padrão atual).
- Fatia RH **não** inclui contas já gravadas como categoria Benefícios; **inclui** o legado até reclassificar.

## Impostos e Retiradas

Sem mudança de layout. Retiradas continuam só RH / Retirada Sócios. Impostos só categoria Impostos.
