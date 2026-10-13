# Research: Filtros padronizados em Contas a Pagar e Receber

## R1 — Fornecedor em Contas a Receber

- **Decision**: Parâmetro `fornecedor_id` em `GET /api/nfs`, filtrando `NF.id IN (SELECT nf_id FROM bonus WHERE colaborador_id = :id)` (comissões e bônus).
- **Rationale**: A lista de NFs não traz os vínculos de comissão; buscar todos os bônus no cliente seria mais pesado. A subconsulta usa o índice de `bonus.nf_id`.
- **Alternatives considered**: Incluir `fornecedor_ids` em `NFResponse` — rejeitado (carregamento extra em toda listagem para um filtro opcional).

## R2 — Tipo e Fornecedor em Contas a Pagar

- **Decision**: Filtro em memória em `contasFiltradas`, junto com busca e datas.
- **Rationale**: A lista já é carregada inteira (até 500); os cards e a seleção já derivam de `contasFiltradas`.

## R3 — Layout

- **Decision**: `BarraFiltros` com `children` (linha principal), `maisFiltros` (painel), `qtdMaisFiltrosAtivos`, `podeLimpar`/`onLimpar` e `resumo`.
- **Rationale**: Mesmo visual nas duas telas (SC-005) mantendo a lógica nas páginas.
- **Período em Pagar**: a caixa "Todos" vira a primeira opção do seletor de mês ("Todos os períodos"), com o ano desabilitado — mesma regra, um controle a menos.
- **Ano em Receber**: campo numérico vira seletor (mesma faixa de anos de Pagar), para padronizar.

## R4 — Limpar filtros

- **Decision**: Padrões — Pagar: mês/ano atuais, status/categoria/subcategoria/alerta vazios, tipo/fornecedor/busca/datas vazios. Receber: mês/ano atuais, status vazio, tipo/fornecedor/cliente vazios, arquivadas desmarcado.
