# Contrato: endereços (102)

## Site (`oceantalentsolutions.com`, `www.`, `landing.`)

| Página | pt | en |
|--------|----|----|
| Lista de vagas (existente) | `/vagas` | `/en/jobs` |
| Página da vaga (nova) | `/vagas/<slug>-<id>` | `/en/jobs/<slug>-<id>` |

- `<slug>`: título em minúsculas, sem acentos, não alfanuméricos → `-`, até 60 caracteres.
- A página resolve pelo `<id>`; slug diferente do atual é corrigido no endereço sem recarregar.
- Troca de idioma na página da vaga leva à mesma vaga no outro idioma.
- Formulário de candidatura fica na própria página da vaga (âncora `#candidatura`).

## Consultant Panel (`consultantpanel.oceantalentsolutions.com`)

| Tela | Caminho |
|------|---------|
| Lista de vagas | `/vagas` |
| Nova vaga | `/vagas/nova` |
| Detalhe + candidaturas | `/vagas/<id>` |
| Editar | `/vagas/<id>/editar` |
| Abrir currículo (link da planilha) | `/candidaturas/<id>/curriculo` |

Sem sessão, qualquer tela leva ao login e, depois de entrar, volta ao endereço pedido.
