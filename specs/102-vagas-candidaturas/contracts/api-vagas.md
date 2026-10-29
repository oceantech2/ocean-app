# Contrato: API de vagas e candidaturas (102)

Base: `VITE_API_URL` (dev `http://localhost:8001/api`). Mensagens de erro em `detail` (pt-BR).

## Painel — `/api/proposal/vagas` (token do Proposal obrigatório)

| Método | Caminho | Quem | Resposta |
|--------|---------|------|----------|
| GET | `/proposal/vagas/?status=&busca=` | todos | `{ items: VagaPainel[], total }`, mais recentes primeiro |
| GET | `/proposal/vagas/{id}` | todos | `VagaPainel` |
| POST | `/proposal/vagas/` | todos | 201 `VagaPainel` (status `aberta`) |
| PUT | `/proposal/vagas/{id}` | autor/admin | `VagaPainel` |
| POST | `/proposal/vagas/{id}/encerrar` | autor/admin | `VagaPainel` |
| POST | `/proposal/vagas/{id}/reabrir` | autor/admin | `VagaPainel` |
| DELETE | `/proposal/vagas/{id}` | autor/admin | 204; 409 "Vaga com candidaturas não pode ser excluída. Encerre a vaga." |
| GET | `/proposal/vagas/{id}/candidaturas` | todos | `CandidaturaPainel[]`, mais recentes primeiro |
| POST | `/proposal/vagas/{id}/reenviar-planilha` | todos | `{ enviadas: n, pendentes: n }` |
| GET | `/proposal/vagas/candidaturas/{id}/curriculo` | todos | arquivo (`Content-Disposition: inline`) |

Erros: 403 "Ação permitida apenas ao autor da vaga ou administradores"; 404 "Vaga não encontrada" / "Candidatura não encontrada"; 422 mensagens de validação.

**Entrada (`VagaIn`)**: `titulo, area, nivel, localidade, resumo, descricao?, responsabilidades?, requisitos, diferenciais?, cliente?, codigo_planilha?`.

**`VagaPainel`**: entrada + `id, slug, status, criado_por_usuario, criado_em, atualizado_por_usuario, atualizado_em, encerrada_em, candidaturas_total, candidaturas_pendentes, pode_editar`.

**`CandidaturaPainel`**: `id, nome, email, telefone, linkedin, localidade, cargo_atual, empresa_atual, formacao, experiencia, ingles, outros_idiomas, pretensao_min, pretensao_max, disponibilidade, mobilidade, curriculo_nome, criada_em, planilha_status ('enviada'|'pendente'), planilha_enviada_em, planilha_erro`.

Auditoria (`registrar_auditoria`, entidade `Vaga`): `criar`, `editar`, `encerrar`, `reabrir`, `excluir`.

## Público — `/api/public/vagas` (sem login)

| Método | Caminho | Resposta |
|--------|---------|----------|
| GET | `/public/vagas/` | `VagaPublica[]` só abertas, mais recentes primeiro |
| GET | `/public/vagas/{id}` | `VagaPublica`; 404 "Vaga não disponível" se encerrada/inexistente |
| POST | `/public/vagas/{id}/candidaturas` | 201 `{ ok: true }`; 404 vaga indisponível; 413/400 currículo; 422 validação; 503 Storage não configurado |

**`VagaPublica`**: `id, slug, titulo, area, nivel, localidade, resumo, descricao, responsabilidades, requisitos, diferenciais, criado_em`. **Nunca** `cliente`, `codigo_planilha`, autor ou contagens.

**Candidatura (multipart/form-data)**: `nome, email, telefone, localidade, cargo_atual, empresa_atual, pretensao_min, pretensao_max, consentimento ('true'), curriculo (arquivo)` obrigatórios; `linkedin, formacao, experiencia, ingles, outros_idiomas, disponibilidade, mobilidade` opcionais; `site` = campo isca (preenchido → 201 sem gravar).

Erros de validação: 422 com `detail` = `{ campo: mensagem }` (chaves iguais aos nomes dos campos) para o site destacar cada campo; o site traduz pelas chaves e só usa o texto da API como fallback.
