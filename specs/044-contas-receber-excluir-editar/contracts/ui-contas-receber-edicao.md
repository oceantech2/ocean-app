# Contrato de UI: Contas a Receber — excluir, Tipo e Maggo editável

**Feature**: `044-contas-receber-excluir-editar` | **Date**: 2026-08-28  
**Páginas**: Contas a Receber (`/nfs`, `NFs.tsx`), DH (`DH.tsx`); rótulos em pontos que mostrem o tipo  
**Spec**: [spec.md](../spec.md)

## Contas a Receber — listagem

| Elemento | Contrato |
|----------|----------|
| Coluna de tipo | Cabeçalho **Tipo** (não “Método de pagamento”) |
| Célula de tipo | Retainer, Sucesso ou **Parcela** |
| Coluna Ações (admin) | Ações atuais **mais** Excluir, distinta de Arquivar |
| Excluir | `confirm` antes de chamar `DELETE`; toast sucesso/erro; linha some da tabela |
| Visualizador | Sem Excluir, sem edição |
| CSV/export da página | Coluna **Tipo**; valores com rótulo **Parcela** |

## Contas a Receber — formulário

| Elemento | Contrato |
|----------|----------|
| Rótulo do campo | **Tipo** * |
| Opções | Retainer, Sucesso, **Parcela** (`value` interno `parcelamento`) |
| Origem Maggo | Grupo Maggo **editável** para admin (projeto, tipo, empresa, candidato, bruto, imposto, líquido, data de fechamento) |
| Texto de ajuda | Origem Maggo: dados Maggo e Ocean editáveis no Ocean (não “somente leitura”) |
| Origem | Continua exibindo Maggo após salvar edição Maggo |

## DH e demais rótulos de tipo

| Superfície | Contrato |
|------------|----------|
| Select e badges DH | **Parcela** no lugar de Parcelamento |
| Cards de totais DH | Terceiro card **Parcela** |
| Assunto de DH **novo** | `… :: Parcela` |
| Relatórios / calendário | Se ainda mostrarem o nome do tipo, usar **Parcela**; não reescrever e-mails antigos |

## Fora desta UI

- Sem “Deletar Todas”
- Sem lixeira / desarquivar exclusão
- Fluxo de caixa não muda ao excluir a linha
