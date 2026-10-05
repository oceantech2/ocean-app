# Contrato: telas do Proposal (alterações)

App: `frontend/src/proposal/`. Complementa [ui-proposal.md](../../077-plataforma-propostas/contracts/ui-proposal.md) da 077. Padrões mantidos: toast (`react-hot-toast`), spinner `animate-spin` no carregamento, layout `ProposalLayout`.

---

## Rotas

| Rota | Tela | Proteção |
|---|---|---|
| `/propostas/:id/editar` (nova) | `pages/Editar.tsx` | `ProtectedRoute` |

As demais rotas (`/login`, `/`, `/nova`, `/propostas/:id`, `/p/:codigo`) continuam iguais.

---

## Componente `components/PropostaForm.tsx` (novo, extraído de `Nova.tsx`)

- Campos: nome do cliente, CNPJ (máscara), valor (R$), toggle "Incluir imposto", alíquota (%) quando ligado, validade (`min` = amanhã em São Paulo).
- Resumo lateral: valor, imposto (com alíquota) e total, em centavos com arredondamento half-up (`utils/propostaCalculo.ts`).
- Validação local com as mesmas mensagens do backend, incluindo `Validade deve ser posterior a hoje`.
- Props: valores iniciais, rótulo do botão principal, estado de salvando, `onSubmit(payload)` e um link/ação secundária ("Voltar para a lista" na criação, "Cancelar" na edição).
- `Nova.tsx` passa a usar o componente, sem mudar comportamento (inclui "Criar cópia" via `?copiar=`).

---

## Tela `pages/Editar.tsx` (nova)

1. Carrega `GET /proposal/propostas/:id` com spinner.
2. Se `404`: "Proposta não encontrada" + link para a lista.
3. Se status `assinada` ou `cancelada`: mensagem "Esta proposta não pode mais ser editada" + link para o detalhe (o formulário não aparece).
4. Caso contrário: título "Editar proposta", `PropostaForm` preenchido com os valores atuais (valor e alíquota em formato brasileiro; validade atual, mesmo que vencida, para o usuário ajustar).
5. Aviso fixo acima do formulário: "O cliente verá as alterações no mesmo link. Se ele já tiver visualizado, a proposta volta para Aguardando assinatura."
6. Botão "Salvar alterações" → `PUT`:
   - `alterada: true` → toast "Proposta atualizada" e navega para `/propostas/:id`.
   - `alterada: false` → toast "Nenhuma alteração para salvar" e navega para o detalhe.
   - `409` → toast com o `detail` (ex.: "Proposta já assinada") e navega para o detalhe.
   - `422` → toast com o `detail`; o formulário continua aberto.
7. "Cancelar" volta para o detalhe sem enviar nada (FR-007).

---

## Tela `pages/Detalhe.tsx` (alterada)

- **Ação "Editar"** (link para `/propostas/:id/editar`), ao lado de "Copiar link", visível quando o status for `aguardando`, `visualizada` ou `expirada`.
- **Campos novos** na grade:
  - "1ª visualização do link" (rótulo novo do campo atual `visualizada_em`).
  - "Visualização da versão atual": exibido só quando `versao > 1`; mostra `versao_visualizada_em` ou "Ainda não visualizada".
  - "Última edição": exibido só quando `atualizada_em` existir; data e hora + usuário (do primeiro item de `edicoes`).
- **Seção "Histórico de edições"** (abaixo dos dados, acima da assinatura), só quando `edicoes` não for vazio:
  - Um bloco por edição, da mais recente para a mais antiga: "dd/mm/aaaa hh:mm · usuário".
  - Uma linha por campo alterado: rótulo amigável + "anterior → novo", formatados:

| `campo` | Rótulo | Formatação |
|---|---|---|
| `cliente_nome` | Cliente | texto |
| `cnpj` | CNPJ | máscara `00.000.000/0000-00` |
| `valor` | Valor | moeda |
| `imposto_ativo` | Imposto | "Sim" / "Não" |
| `aliquota` | Alíquota | `14,53%` ou "—" quando `null` |
| `valor_imposto` | Valor do imposto | moeda |
| `total` | Total | moeda |
| `validade` | Validade | `dd/mm/aaaa` |

---

## Tela `pages/PropostaPublica.tsx` (alterada)

- Mostra "Atualizada em dd/mm/aaaa" abaixo da data de emissão quando `atualizada_em` não for `null`.
- Guarda a `versao` recebida no `GET` e a envia no `POST /assinar`.
- Em `409` com a mensagem de proposta atualizada: toast com a mensagem, recarrega os dados (comportamento atual em `409`) e mantém nome e e-mail já digitados, para o cliente revisar e assinar de novo.

## Serviço `services/proposalApi.ts` (alterado)

- Tipos: `Proposta` ganha `versao`, `atualizada_em`, `versao_visualizada_em`, `edicoes`; `PropostaPublicaData` ganha `versao` e `atualizada_em`; novo tipo `PropostaEdicao`.
- `editarProposta(id, payload)` → `PUT /proposal/propostas/{id}`.
- `consultarPublica` envia `Authorization` com o token salvo (`proposal_access_token`), quando existir, sem acionar o redirecionamento para `/login` em caso de `401` (usa o cliente `publicHttp`).
- `assinarPublica` passa a receber `versao`.
