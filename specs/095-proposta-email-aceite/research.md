# Research: E-mail com link e PDF no aceite da proposta

## R1. Envio fora do caminho crítico

- **Decisão**: Usar `BackgroundTasks.add_task(enviar_emails_aceite, p.id)` em `assinar_proposta`, depois do `commit`. A tarefa abre o próprio `SessionLocal()`, captura qualquer exceção e registra no log `ocean.email`.
- **Rationale**: O FastAPI executa a tarefa depois de enviar a resposta, então o cliente não espera o SMTP (FR-007). A sessão da requisição já estará fechada nesse momento, por isso a tarefa precisa de uma sessão própria.
- **Alternativas consideradas**: Celery/Redis (descartada: o Redis não está ativo no Render e seria complexidade a mais para poucos e-mails); envio síncrono (descartada: atrasa o aceite e uma falha poderia parecer erro do aceite).

## R2. PDF sem anexo

- **Decisão**: Link `{PROPOSAL_PUBLIC_URL}/p/{codigo}?pdf=1`. Em `PaginaModelo`, um `useEffect` de montagem lê `pdf=1`, remove o parâmetro com `history.replaceState` e chama `baixarPdf()` depois de ~600 ms (tempo para fontes e imagens carregarem). As propostas simples antigas (sem botão de PDF) recebem só "Ver proposta".
- **Rationale**: Reusa exatamente o PDF da página (FR-006). Remover o parâmetro evita repetir o download ao recarregar.
- **Alternativas consideradas**: gerar o PDF no servidor com `reportlab` ou navegador headless (descartada pelo usuário: "sem anexo").

## R3. Destinatários

- **Decisão**:
  - **Cliente**: `assinatura.email`, normalizado.
  - **Consultor**: o `UsuarioApp` de `criado_por_id`, se o login dele passar em `email_liberavel`; senão, `p.consultor_email`, se válido.
  - **Admins**: `UsuarioApp` com `papel = 'admin'`, `ativo`, `acesso_proposal` e login de e-mail válido.
  - **Internos**: consultor + admins, sem duplicados (ordem preservada) e sem o e-mail do cliente.
- **Rationale**: Segue o clarify (admins do Proposal com login de e-mail). O e-mail do cliente sai da lista interna para que ele não receba duas versões (FR-005).

## R4. Conteúdo e segurança do HTML

- **Decisão**: HTML simples com estilos inline, montado com f-strings e `html.escape` em todo dado vindo de usuário (FR-008). Data e hora do aceite em `America/Sao_Paulo`: em pt-BR `15/10/2026 às 14:30 (horário de Brasília)`; em en-US `10/15/2026 at 14:30 (Brasília time)`. Assuntos: cliente pt-BR `Proposta aceita — {empresa}`, cliente en-US `Proposal accepted — {empresa}`, interno `[Proposal] Proposta aceita — {empresa}`.

## R5. Endereço público

- **Decisão**: `settings.PROPOSAL_PUBLIC_URL` (env `PROPOSAL_PUBLIC_URL`, padrão `http://proposal.localhost:5193`, sem barra final), espelhando o `VITE_PROPOSAL_PUBLIC_URL` do front.

## R6. SMTP em produção

- **Constatação**: `.env.deploy.example` traz `SMTP_USER`/`SMTP_PASSWORD` vazios. Sem eles, `enviar_email` entra em dry-run e só registra no log.
- **Decisão**: Documentar no checklist de deploy e no quickstart. A feature funciona assim que as variáveis forem preenchidas no Render, sem novo deploy de código.
