# Contrato de UI: Liberação em massa e filtro por status (tela Bônus e Comissão)

Rota: `/comissoes` (`frontend/src/pages/Bonus.tsx`). REST inalterado: `POST /api/bonus/acoes/liberar` e `POST /api/bonus/acoes/pagar` com `{ ids: number[] }` → `{ processados, ignorados }` (`require_admin`).

## Filtro Status (barra de filtros)

- Rótulo `Status`; `select` com `Todos` (`todos`, padrão), `Liberados` (`liberados`), `Não liberados` (`nao_liberados`)
- Visível para `admin` e `visualizador`, após "Recorte" (e Mês/Trimestre quando houver)
- Aplica-se a: lista agrupada, total do título, totais por fornecedor e CSV; **não** ao gráfico anual
- Ao trocar: limpa a seleção e vai para a página 1
- Lista vazia: "Nenhum(a) {bônus|comissão} {liberado(a)|não liberado(a)} encontrado(a)" quando status ≠ todos

## Selecionar todos exibidos (somente `admin`)

- Checkbox acima da lista: "Selecionar todos exibidos (N)", em que N = itens dos fornecedores da página atual
- Marcado quando todos os N estão selecionados; clicar alterna entre marcar todos e limpar

## Barra de ações em massa (somente `admin`, com seleção > 0)

- Posição: `fixed`, rodapé da viewport, centralizada, `z-40`, sombra, fundo opaco (claro/escuro)
- Conteúdo: "{N} selecionada(s)" · botão **Liberar em massa ({X})** · botão **Pagar em massa ({Y})** · botão "Limpar seleção"
- X = elegíveis para liberar (não liberados); Y = elegíveis para pagar (liberados e não pagos)
- Botão com 0 elegíveis: desabilitado, com `title` "Nenhum item selecionado a liberar/pagar"
- `processando`: todos os botões desabilitados
- Fim da lista com espaçador para a barra não cobrir o último item

## Modal de confirmação (substitui `window.confirm` nas ações em massa)

- Shell `components/Modal.tsx`; título "Liberar em massa" / "Pagar em massa"
- Corpo: "Liberar {X} {bônus|comissão(ões)} no valor total de {R$}?"; para pagar, o equivalente com Y
- Rodapé: `Cancelar` (secundário) e `Confirmar` (âmbar para liberar, verde para pagar); Confirmar desabilitado e com spinner (`animate-spin`) durante o envio
- Esc ou clique no fundo cancelam (exceto durante o envio)
- Envio: apenas IDs elegíveis
- Sucesso: toast "{processados} liberado(s)" e, se `ignorados > 0`, " · {ignorados} ignorado(s) (já processados)"; recarrega a lista, limpa a seleção e fecha o modal
- Erro: toast `mensagemErro(e, 'Erro na liberação em massa' | 'Erro no pagamento em massa')`; mantém a seleção e fecha o modal

## Fora do escopo

- Ações por linha (Liberar/Pagar/Editar) continuam com o comportamento atual
- Backend, auditoria e schema inalterados
