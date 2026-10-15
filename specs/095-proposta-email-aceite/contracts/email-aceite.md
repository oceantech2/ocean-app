# Contrato: e-mails do aceite da proposta

## Gatilho

`POST /api/public/propostas/{codigo}/assinar` → **200** (resposta inalterada). Após o commit, tarefa em segundo plano `enviar_emails_aceite(proposta_id)`.

## Links

| Nome | URL |
|------|-----|
| Ver proposta | `{PROPOSAL_PUBLIC_URL}/p/{codigo}` |
| Baixar PDF | `{PROPOSAL_PUBLIC_URL}/p/{codigo}?pdf=1` (omitido para `modelo = simples`) |
| Abrir no Proposal | `{PROPOSAL_PUBLIC_URL}/propostas/{id}` (só no interno) |

## E-mail do cliente

- **Para**: `assinatura.email`
- **Idioma**: `proposta.idioma` (`en-US` → inglês; demais → português)
- **Assunto**: `Proposta aceita — {empresa}` / `Proposal accepted — {empresa}`
- **Corpo**: saudação com `assinatura.nome`; confirmação do aceite da proposta comercial da Ocean para `{empresa}` em `{data} às {hora}`; botões Ver proposta e Baixar PDF; contato do consultor (`consultor_nome`, `consultor_email`) quando houver.

## Aviso interno

- **Para**: consultor criador + admins do Proposal (R3), sem duplicados, sem o e-mail do cliente; não envia se a lista ficar vazia.
- **Idioma**: português.
- **Assunto**: `[Proposal] Proposta aceita — {empresa}`
- **Corpo**: empresa, modelo, projeto(s), aceito por `{nome}` (`{email}`), data/hora, criado por `{criado_por_usuario}`; botões Ver proposta, Baixar PDF e Abrir no Proposal.

## Falhas

- Exceções e falhas de SMTP → `logger.error` em `ocean.email`; o aceite já foi confirmado.
- Sem SMTP configurado → dry-run (log `[email DRY-RUN]`).

## Frontend

- `PaginaModelo`: com `?pdf=1` na URL, remove o parâmetro (`history.replaceState`) e chama `baixarPdf()` uma vez após o carregamento.
