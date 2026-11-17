# Contrato: endereços do site e do painel (106)

## Site institucional

| PT | EN | Descrição |
|----|----|-----------|
| `/noticias` | `/en/news` | Lista (já existente); passa a consumir API pública |
| `/noticias/<slug>-<id>` | `/en/news/<slug>-<id>` | Página da notícia (novo) |

- `slug` derivado de `titulo_pt` (pode ficar “desatualizado” se o título mudar; o `id` no final é a chave).
- Troca PT ↔ EN na página de detalhe mantém o mesmo `id` (e o slug atual recalculado ou o segmento da URL atual, como nas vagas).
- Notícia não elegível / inexistente: mensagem + link para a lista.

## Consultant Panel

| Caminho | Descrição |
|---------|-----------|
| `/noticias` | Lista |
| `/noticias/nova` | Formulário de criação |
| `/noticias/:id` | Detalhe + ações |
| `/noticias/:id/editar` | Edição |

Menu: item **Notícias** ao lado de Vagas / Propostas.
