# Contrato: ferramentas do conector

Todas executam como o consultor da conexão, chamando as rotas do Proposal existentes (mesmas validações, permissões e mensagens). Resultado em `content[0].text` como JSON. Erros de negócio → `isError: true` com a mensagem do painel.

Links acrescentados: `link_painel` (propostas: `{PAINEL}/propostas/{id}`; vagas: `{PAINEL}/vagas/{id}`), `link_cliente` (propostas: `{PROPOSAL_PUBLIC_URL}/p/{codigo}`), `link_curriculo` (candidaturas: `{PAINEL}/candidaturas/{id}/curriculo`).

## Propostas

| Ferramenta | Anotações | Entrada | Rota reaproveitada |
|------------|-----------|---------|--------------------|
| `listar_propostas` | somente leitura | `status` (aguardando, visualizada, assinada, cancelada, expirada), `empresa`, `modelo`, `projeto`, `data_de`, `data_ate` (AAAA-MM-DD), `criado_por`, `pagina` (≥1; 50 por página) | `proposal_propostas.listar_propostas` |
| `ver_proposta` | somente leitura | `id` (obrigatório) | `proposal_propostas.obter_proposta` |
| `criar_proposta` | escrita, não destrutiva | `modelo` (executive-search, offshore-talent, outsourcing, outplacement-development), `cliente_nome`, `setor` (oil-gas, energia, infraestrutura, mineracao, tecnologia, industria-servicos), `projetos` [{`nome`, `investimentos` [{`tipo` retainer/sucesso/valor-fechado, `taxa_tipo` percentual/valor, `taxa`, `entrada` 0–100}]}] (1–10 projetos, 1–3 investimentos cada), `validade_dias` (1–365) — obrigatórios; `idioma` (pt-BR/en-US), `moeda` (BRL/USD), `data_proposta`, `projeto_escopo`, `shortlist`, `sla`, `garantia`, `consultor_nome`, `consultor_cargo`, `consultor_telefone`, `consultor_email` (padrão: Meu perfil) | `proposal_propostas.criar_proposta` |
| `editar_proposta` | escrita, não destrutiva | `id` (obrigatório) + qualquer campo de `criar_proposta` exceto `modelo`, `moeda`, `idioma` (imutáveis no painel); campos omitidos mantêm o valor atual; `projetos`, quando enviado, substitui a lista inteira | `proposal_propostas.editar_proposta` |

Saída de criar/editar: detalhe da proposta + `link_painel`, `link_cliente`; editar inclui `alterada` (false quando nada mudou). Auditoria: `criar`/`editar` em `Proposta` com "· via Claude". Proposta simples → `isError` "Propostas simples só podem ser editadas pelo painel".

## Modelos de proposta

| Ferramenta | Anotações | Entrada | Rota |
|------------|-----------|---------|------|
| `listar_modelos` | somente leitura | `divisao` (modelos acima), `nome` | `proposal_modelos.listar_modelos` (até 200) |
| `ver_modelo` | somente leitura | `id` | `proposal_modelos.obter_modelo` |

## Vagas

| Ferramenta | Anotações | Entrada | Rota |
|------------|-----------|---------|------|
| `listar_vagas` | somente leitura | `status` (aberta, encerrada), `busca` | `proposal_vagas.listar_vagas` |
| `ver_vaga` | somente leitura | `id` | `proposal_vagas.obter_vaga` |
| `criar_vaga` | escrita, não destrutiva | `titulo`, `area` (financas, tecnologia, comercial, rh, operacoes), `nivel` (gerencia, diretoria, vp, c-level), `localidade`, `resumo`, `requisitos` (um por linha) — obrigatórios; `descricao`, `responsabilidades`, `diferenciais`, `cliente` (obrigatório sem `codigo_planilha`; nunca aparece no site), `codigo_planilha` | `proposal_vagas.criar_vaga` |
| `editar_vaga` | escrita, não destrutiva | `id` + qualquer campo de `criar_vaga`; omitidos mantêm o valor atual | `proposal_vagas.editar_vaga` |

A vaga criada fica "aberta" e aparece no site. Auditoria das rotas com "· via Claude".

## Candidaturas

| Ferramenta | Anotações | Entrada | Rota |
|------------|-----------|---------|------|
| `listar_candidaturas` | somente leitura | `vaga_id` | `proposal_vagas.listar_candidaturas` |

Saída: `{vaga: {id, titulo, link_painel}, items: [... campos de serializar_candidatura + link_curriculo]}`. O arquivo do currículo não é entregue.

## Fora do conector (FR-017)

Excluir/cancelar proposta, encerrar/reabrir/excluir vaga, reenviar à planilha, criar/editar/excluir modelos, perfil, download de currículo.
