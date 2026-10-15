# Quickstart: Filtros e exclusão de propostas no Proposal

## Pré-requisitos

- API (8001) e frontend (5193) rodando; acesso ao Proposal com um admin e um consultor.
- Pelo menos 3 propostas de empresas, modelos e datas diferentes, uma com vários projetos e uma assinada.

## Cenários

1. **Empresa**: digitar parte do nome em minúsculas → só as propostas da empresa; total e paginação acompanham.
2. **Modelo**: escolher "Development & Outplacement" → só esse modelo.
3. **Projeto**: buscar o nome do 2º projeto de uma proposta com vários projetos → ela aparece.
4. **Data**: informar só "até" com a data de uma proposta → ela aparece (limite inclusivo); período invertido → "Nenhuma proposta encontrada com esses filtros".
5. **Combinação + limpar**: empresa + status → interseção; "Limpar filtros" → lista completa.
6. **Criado por (admin)**: opções listam todos os autores; escolher um → só as propostas dele. Como consultor, o filtro não aparece.
7. **Literal**: buscar `%` em Empresa → não retorna tudo.
8. **Excluir (admin)**: na lista, Excluir em proposta pendente → confirmar → some; no detalhe de proposta assinada → confirmação reforçada → volta à lista. O link público da excluída mostra "não encontrada". A Auditoria do ERP lista as duas exclusões com código, empresa e status.
9. **Consultor**: sem botão Excluir; `DELETE /api/proposal/propostas/{id}` com token de consultor → 403.
