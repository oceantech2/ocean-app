# Contrato de UI: Contas a Receber — Maggo editável

**Feature**: `051-contas-receber-maggo-editavel` | **Date**: 2026-09-06  
**Página**: Contas a Receber (`/nfs`, `NFs.tsx`)  
**Spec**: [spec.md](../spec.md)

## Modal de edição / criação

| Elemento | Contrato |
|----------|----------|
| Bloco “Dados Maggo” | Visível |
| Projeto (`posicao`) | Editável se admin |
| Tipo | Select editável se admin (Retainer / Sucesso / Parcela) |
| Empresa | Editável se admin |
| Candidato | Editável se admin (edição; regra atual de criação) |
| Valor bruto | Editável se admin; ao mudar, recalcula imposto/líquido na tela |
| Alíquota (%) | Editável se admin; ao mudar, recalcula imposto/líquido na tela |
| Imposto | **Somente leitura** (valor calculado) |
| Valor líquido | **Somente leitura** (valor calculado) |
| Data de fechamento | Editável se admin |
| Bloco “Dados Ocean” | Regras vigentes inalteradas (NF, emissão, vencimento, pagamento, Conta, etc.) |
| Comissões no modal | Podem ser editadas como hoje; salvar Maggo **não** deve mudar sozinho os valores de bônus já listados só porque o líquido mudou (backend FR-012) |
| Origem | Exibe Maggo ou Manual; após salvar edição Maggo continua **Maggo** |
| Ajuda / texto | Deixar claro que a correção fica no Ocean e **não** atualiza a Maggo |
| Visualizador | Todos os campos Maggo e Ocean somente leitura; sem salvar |

## Listagem

| Elemento | Contrato |
|----------|----------|
| Após salvar e recarregar | Células refletem valores Maggo novos |
| Totais da página / resumo | Refletem novos brutos/líquidos |
| Conta Recebida editada | Valores novos na lista; **não** exige mudança visual no Fluxo de Caixa |

## Fora desta UI

- Badge “editado localmente”
- Digitação livre de imposto/líquido
- Ações de exclusão / renomear Tipo (já 044)
- Telas de Comissões ou Fluxo de Caixa além da verificação de não-regressão no quickstart
