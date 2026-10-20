# Quickstart: Painel do consultor em domínio próprio

## Pré-requisitos (dev)

- `docker compose up -d` e `cd frontend && npm run dev` (5193)
- Navegadores resolvem `*.localhost` para 127.0.0.1 (Chrome/Edge/Firefox já resolvem)

## Validações estáticas

```bash
cd frontend && npx tsc --noEmit && npx vite build
cd backend && python -m py_compile app/config.py app/services/email_aceite.py
```

## Roteiro manual (dev)

1. **Cliente (US1)**: abrir `http://proposal.localhost:5193/p/<código>` em janela anônima → página do cliente; status vai para "Visualizada".
2. **Redirecionamento (US1)**: abrir `http://proposal.localhost:5193/` e `/propostas/1` → vai para `http://consultantpanel.localhost:5193/` e `/propostas/1`.
3. **Painel (US2)**: em `consultantpanel.localhost:5193`, entrar → cabeçalho e aba mostram "Consultant Panel"; copiar link do cliente → `http://proposal.localhost:5193/p/<código>`.
4. **ERP (US2)**: no ERP (`localhost:5193`), clicar em "Consultant Panel" → entra direto no painel novo.
5. **Convite (US2)**: gerar convite em Fornecedores → link `consultantpanel.localhost:5193/convite#t=…`; link antigo `proposal.localhost:5193/convite#t=…` também funciona (redireciona com o hash).
6. **Pré-visualização (US3)**: proposta "Aguardando" → "Abrir página do cliente" → abre `consultantpanel.localhost:5193/p/<código>` com faixa de pré-visualização; o status continua "Aguardando".

## Produção (ativação)

1. DNS: CNAME `consultantpanel` → Vercel; adicionar o domínio no projeto Vercel.
2. Render: `CORS_ORIGINS` += `https://consultantpanel.oceantalentsolutions.com`; `CONSULTANT_PANEL_URL=https://consultantpanel.oceantalentsolutions.com`.
3. Vercel: `VITE_CONSULTANT_PANEL_URL=https://consultantpanel.oceantalentsolutions.com` e rebuild.
