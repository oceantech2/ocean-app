# Contrato UI: Página Bônus e Comissão com abas

**Feature**: `062-bonus-comissao-abas`  
REST: [rest-bonus-comissao-abas.md](./rest-bonus-comissao-abas.md)  
Modelo: [data-model.md](../data-model.md)

---

## 1. Nomenclatura da sessão

| Superfície | Texto |
|------------|--------|
| Menu lateral | **Bônus e Comissão** (`paginasCatalogo` `key: 'bonus'`, `path: '/comissoes'`) |
| Título `Bonus.tsx` | **Bônus e Comissão** — Total: {soma da aba ativa} |
| Catálogo Configurações | label **Bônus e Comissão**; desc. alinhada (ex.: Bônus e comissões por fornecedor) |

**Fora**: Dashboard (`BONUS: 'Comissões'`), Contas a Pagar `Comissões (legado)`, título do bloco Comissões no form da NF.

---

## 2. Página `/comissoes` — abas

Padrão visual: botões de aba como no Dashboard (Receita Por Caixa / Por Competência).

| Elemento | Comportamento |
|----------|---------------|
| Ordem | **Bônus** à esquerda, **Comissão** à direita |
| Padrão | **Comissão** a cada abertura da página (não persistir aba no store) |
| Troca de aba | mantém filtros (fornecedor, ano, recorte); limpa seleção e página `0`; GET com `tipo` da aba; total e gráfico só da aba |
| Filtros | os já existentes, acima das abas ou entre título e abas — compartilhados |
| Visualizador | vê abas e colunas; sem checkboxes nem Liberar/Pagar |

Estados vazios próprios:

- Comissão: “Nenhuma comissão encontrada”
- Bônus: “Nenhum bônus encontrado”

Gráfico: título “Evolução de {Bônus\|Comissões} por Mês — {ano}”; série só do `tipo` ativo.

### Aba Comissão

Listagem atual (045/048): Atividade, Percentual, Valor, Liberado, Pago, Editar→`/nfs?edit=`, Liberar, Pagar, checkboxes, lote, Importar CSV.

### Aba Bônus

| Coluna | Conteúdo |
|--------|----------|
| (checkbox) | só admin |
| Mês/Ano | |
| Cliente / Posição | da NF vinculada |
| NF Ref. | |
| Valor | `valor_bonus` informado |
| Liberado | valor se `liberado`, senão “—” |
| Pago | Pago / Pendente |
| ações | Liberar / Pagar / Editar (mesmo pacote) |

**Não** exibir Atividade nem Percentual.

Exportar CSV da aba Bônus: Fornecedor, Mês, Ano, Nº NF, Cliente, Posição, Valor, Liberado, Pago — sem percentual/atividade.

Importar CSV: **oculto** nesta aba (colunas do import atual são de comissão).

Confirmações: “Liberar bônus de …?” / “Marcar como pago bônus de …?” / lote equivalente.

Editar sem `nf_id`: toast “Sem Conta a receber associada” (igual comissão).

---

## 3. Contas a Receber (`/nfs`) — modal

### Bloco Comissões

Inalterado (`ComissoesLinhasForm`). Carregar `GET /api/bonus?nf_id={id}&tipo=comissao`.

### Bloco Bônus (novo)

Posição: imediatamente **após** o bloco Comissões, antes de Salvar/Cancelar.

| Elemento | Comportamento |
|----------|---------------|
| Título | **Bônus** |
| Adicionar linha | `+ Adicionar bônus` |
| Zero linhas | permitido |
| Fornecedor | select de ativos |
| Mês / Ano | default mês/ano corrente |
| Valor (R$) | input numérico **editável**; **não** preview de % |
| Remover | só linha não liberada |
| Liberada / Paga | campos disabled + badge |

Validação cliente: linha parcial → recusar save; `valor <= 0` → recusar.

PUT/POST: enviar `bonus` (linhas válidas mapeadas para `BonusLinhaInput`) **e** `comissoes` como hoje. Não enviar percentual/atividades em `bonus`.

Deep-link `/nfs?edit={nfId}`: abrir modal e popular **os dois** blocos.

Visualizador: ambos os blocos somente leitura.

---

## 4. Papéis

| Ação | admin | visualizador |
|------|-------|--------------|
| Ver abas, colunas, totais | sim | sim |
| Liberar / Pagar / lote / seleção | sim | não |
| Editar (navegar à NF) | sim | não (sem persistência) |
| Alterar blocos no form da NF | sim | não |
