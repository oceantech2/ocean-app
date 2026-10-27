# Quickstart: Site institucional da Ocean

## 1. Rodar local

```bash
cd frontend && npm run dev
```

Abrir `http://site.localhost:5193` (Chrome/Edge resolvem `*.localhost` sem configurar hosts).

Conferir que `http://localhost:5193` continua abrindo o ERP e `http://proposal.localhost:5193/login` o Consultant Panel.

## 2. Roteiro de validação

### 2.1 Home (US1)

1. Comparar seção a seção com a exportação aprovada: cabeçalho, hero e números, Quem Somos + 4 cards, Valores, Equipe (8 fotos), 12 logos de clientes, 3 casos, Contato, rodapé.
2. "Fale com um consultor" e "Contato" no menu rolam até o formulário.
3. Ícone de LinkedIn de um consultor abre o perfil em nova aba.
4. Botão verde flutuante abre `wa.me/5521966326588` com a mensagem preenchida.
5. DevTools em 375 px: sem rolagem horizontal; o botão de menu abre Home, Soluções, Vagas e Contato.
6. Não há "Notícias" nem "PT | EN" em lugar nenhum.

### 2.2 Vagas (US2)

1. `/vagas` mostra 5 vagas e "5 vagas".
2. Área "Tecnologia" → só VP de Engenharia, "1 vaga". Área "Finanças" + Nível "Gerência" → "Nenhuma vaga encontrada para os filtros atuais." e "0 vagas".
3. "Tenho interesse" abre o modal com o título e "área · nível · local".
4. Enviar vazio → erros em Nome, E-mail e LinkedIn. LinkedIn "linkedin.com/in/x" (sem `https://`) → "URL inválida".
5. Enviar preenchido → "Interesse registrado. Em breve retornaremos.", modal fecha; reabrir mostra os campos vazios.
6. Aba Network do DevTools: nenhuma requisição ao enviar.

### 2.3 Soluções (US3)

1. `/solucoes` abre com a aba Executive Search e a Metodologia (6 etapas).
2. Clicar em cada aba e em "Offshore Talent →" / "← Executive Search": conteúdo troca, página rola e a URL ganha `#offshore` etc.
3. Na Home, "Saiba mais" do card Outsourcing → `/solucoes#outsourcing` com a aba Outsourcing aberta.
4. "Falar com um consultor" → Home na seção Contato; "Ver nossas vagas" → `/vagas`.

### 2.4 Contato (US4)

1. Enviar vazio → erros em Nome, E-mail, Telefone, Cargo, Empresa e "Sou...".
2. Enviar preenchido → confirmação e campos limpos; nenhuma requisição na aba Network.

### 2.5 Bordas

- `/noticias` e `/xyz` → redirecionam para `/`.
- Lighthouse (mobile) na Home: textos visíveis rapidamente; nenhuma imagem acima de ~400 KB.

## 3. Build

```bash
cd frontend && npx tsc --noEmit && npx vite build
```

`dist/` deve ter `site.html`, `proposal.html` e `app.html` (sem `index.html`) e `dist/site/` com `site.css` e as imagens.

## 4. Publicação

1. Deploy normal (push → Vercel). O rewrite só vale para os hosts do site, então publicar antes do DNS não muda nada para ERP e Proposal.
2. Teste: Vercel → projeto → Domains: adicionar `landing.oceantalentsolutions.com`; na Hostinger, CNAME `landing` → valor exibido pela Vercel. Validar 2.1–2.4 em `https://landing.oceantalentsolutions.com`.
3. Produção (depois de aprovado no teste): Vercel → projeto → Domains: adicionar `oceantalentsolutions.com` e `www.oceantalentsolutions.com` (um redirecionando para o outro, a critério da Ocean).
4. DNS: registro A do domínio raiz para a Vercel e CNAME `www` → `cname.vercel-dns.com` (valores exibidos pela Vercel), sem mexer em MX/TXT.
5. Repetir 2.1–2.4 no domínio de produção. Backend/Render: nada a fazer (o site não chama a API).
