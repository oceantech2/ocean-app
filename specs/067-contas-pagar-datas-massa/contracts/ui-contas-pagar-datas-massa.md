# Contrato UI: Contas a Pagar — Edição em massa de datas

**Feature**: `067-contas-pagar-datas-massa`  
**Página**: Contas a Pagar (`Contas.tsx`)  
**REST**: [rest-contas-pagar-datas-massa.md](./rest-contas-pagar-datas-massa.md)

---

## Papéis

| Papel | Seleção | Ação em massa | Edição individual |
|-------|---------|---------------|-------------------|
| admin | sim | sim | sim (já existe) |
| visualizador | não | não | não |

---

## Seleção

1. Coluna de checkbox por linha (só admin), à esquerda.
2. **Cabeçalho de grupo Mês/Ano**: linhas intercaladas na tabela plana (ou faixa acima das linhas do mesmo `chaveMesVencimento`) com checkbox que marca/desmarca todas as contas **visíveis** daquele mês/ano no recorte filtrado. Rótulo = `rotuloMesAnoColuna` (ou “Sem vencimento”).
3. Opcional: checkbox no `thead` “marcar todas as linhas visíveis” do recorte atual.
4. Contador visível: “N selecionada(s)” quando N ≥ 1.
5. Limpar seleção ao mudar: status, categoria, descrição, intervalo, mês/ano (incl. Todos), ou qualquer filtro que altere o recorte.
6. **Não** oferecer “selecionar todas as contas do filtro no servidor” além do visível.

---

## Ação e modal

1. Com N ≥ 1 e admin: botão **Editar datas em massa** (única ação de datas em lote).
2. Sem seleção: botão oculto ou desabilitado.
3. Modal:
   - Campo **Data de vencimento** (`type="date"`), opcional
   - Campo **Data de pagamento** (`type="date"`), opcional
   - Texto de ajuda: deixar em branco = não alterar esse campo
   - Sem controle de limpar datas
   - Botões Cancelar / Continuar (ou equivalente)
4. Validação UI: ao menos um campo preenchido; senão mensagem e não avança.
5. Passo de confirmação (mesmo modal ou confirm): resumo “Aplicar [vencimento e/ou pagamento] a N conta(s)?”.
6. Cancelar em qualquer passo: nenhuma gravação; seleção permanece.

---

## Após o lote

| Resultado | UI |
|-----------|-----|
| Sucesso (processados ≥ 1 ou 0 com ignorados) | Toast com processados/ignorados; recarregar listagem e cards; **limpar seleção** se o request HTTP concluiu sem erro de rede/5xx (mesmo se todos ignorados — ver nota) |
| Cancelamento | Sem toast de sucesso; seleção permanece |
| Erro HTTP 4xx/5xx | Toast de erro; seleção permanece; datas locais não mudam |

**Nota**: Preferência: limpar seleção quando a API responde **200** (FR-007a “após lote bem-sucedido” = request aceito). Se `processados=0` e `ignorados=N`, ainda limpar e informar no toast para o admin reavaliar.

---

## Fora de escopo na UI

- Contas a Receber
- Edição em massa de outros campos
- Restaurar blocos colapsáveis Por mês/Por categoria (`034`)
- Remover edição individual de datas
