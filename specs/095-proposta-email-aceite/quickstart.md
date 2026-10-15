# Quickstart: E-mail com link e PDF no aceite da proposta

## Pré-requisitos

- Backend com `PROPOSAL_PUBLIC_URL` apontando para o Proposal do ambiente (local: `http://proposal.localhost:5193`).
- Para envio real: `SMTP_SERVER`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` e `SENDER_EMAIL` configurados (no Gmail, use uma "senha de app"). Sem eles, os envios aparecem no log como `[email DRY-RUN]`.

## Cenários

1. **Cliente (pt-BR)**: aceitar uma proposta em português com um e-mail de teste → a confirmação aparece na página na hora. O e-mail chega em português com empresa, data/hora, consultor e os botões.
2. **Cliente (en-US)**: repetir com proposta em inglês → e-mail em inglês.
3. **Baixar PDF**: clicar no botão do e-mail → a proposta abre e a janela de impressão/salvar PDF aparece uma vez. O parâmetro some da URL, e recarregar não repete.
4. **Ver proposta**: abre a proposta com "Aceita em … por …", sem disparar o PDF.
5. **Internos**: o consultor criador e cada admin do Proposal com login de e-mail recebem um aviso em português, com "Abrir no Proposal" levando à página da proposta. Um consultor que também é admin recebe um só.
6. **Falha de SMTP**: com credenciais erradas, o aceite continua funcionando e o log mostra `[email] Falha ao enviar`.

## Produção

- Render: preencher `PROPOSAL_PUBLIC_URL=https://proposal.oceantalentsolutions.com` e as variáveis SMTP.
