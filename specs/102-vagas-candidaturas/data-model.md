# Data Model: Vagas e candidaturas (102)

## Vaga (`vagas`)

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | inteiro, PK | usado no endereço público (`<slug>-<id>`) |
| `titulo` | texto ≤ 120 | obrigatório |
| `area` | texto ≤ 20 | `financas`, `tecnologia`, `comercial`, `rh`, `operacoes` |
| `nivel` | texto ≤ 20 | `gerencia`, `diretoria`, `vp`, `c-level` |
| `localidade` | texto ≤ 120 | obrigatório |
| `resumo` | texto ≤ 300 | obrigatório |
| `descricao` | texto ≤ 5000 | opcional, parágrafos |
| `responsabilidades` | texto ≤ 5000 | opcional, um item por linha |
| `requisitos` | texto ≤ 5000 | obrigatório (pré-requisitos), um item por linha |
| `diferenciais` | texto ≤ 5000 | opcional, um item por linha |
| `cliente` | texto ≤ 160 | **interno**; obrigatório se `codigo_planilha` vazio; nunca sai nas rotas públicas |
| `codigo_planilha` | texto ≤ 20 | opcional; `[A-Za-z0-9._-]`, gravado em maiúsculas (ex.: `V0005`) |
| `status` | texto | `aberta` ou `encerrada` (CHECK) |
| `criado_por_id` | FK `usuarios_app.id`, `ON DELETE SET NULL` | autor (permissão de alterar) |
| `criado_por_usuario` | texto ≤ 255 | login do autor (exibição; `sistema` nas migradas) |
| `criado_em` | timestamp | UTC |
| `atualizado_por_usuario`, `atualizado_em` | texto, timestamp | última edição |
| `encerrada_em` | timestamp | preenchido ao encerrar, limpo ao reabrir |

Índice: `(status, criado_em)`.

**Transições**: `aberta` ⇄ `encerrada` (autor ou admin). Exclusão só sem candidaturas.

**Permissão de alterar**: `usuario.papel == "admin"` ou `vaga.criado_por_id == usuario.id`. As 5 vagas migradas (`criado_por_id` nulo) só admin altera.

## Candidatura (`candidaturas`)

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | inteiro, PK | `externalId` enviado à planilha |
| `vaga_id` | FK `vagas.id`, `ON DELETE RESTRICT` | obrigatório; vaga aberta no momento do envio |
| `nome` | texto ≤ 120 | obrigatório, ≥ 2 caracteres |
| `email` | texto ≤ 180 | obrigatório, formato de e-mail, gravado em minúsculas |
| `telefone` | texto ≤ 30 | obrigatório, 10 a 13 dígitos |
| `linkedin` | texto ≤ 200 | opcional, URL http(s) |
| `localidade` | texto ≤ 120 | obrigatório |
| `cargo_atual` | texto ≤ 120 | obrigatório |
| `empresa_atual` | texto ≤ 120 | obrigatório |
| `formacao` | texto ≤ 300 | opcional |
| `experiencia` | texto ≤ 2000 | opcional |
| `ingles` | texto ≤ 20 | opcional: `basico`, `intermediario`, `avancado`, `fluente`, `nativo` |
| `outros_idiomas` | texto ≤ 200 | opcional |
| `pretensao_min` | numérico(12,2) | obrigatório, > 0 |
| `pretensao_max` | numérico(12,2) | obrigatório, ≥ `pretensao_min`, ≤ 10.000.000 |
| `disponibilidade` | texto ≤ 20 | opcional: `imediata`, `15-dias`, `30-dias`, `mais-30-dias` |
| `mobilidade` | texto ≤ 20 | opcional: `sim`, `nao`, `a-combinar` |
| `consentimento_em` | timestamp | obrigatório (aceite LGPD) |
| `curriculo_path` | texto | caminho no Storage (`supabase:curriculos/...`) ou disco local |
| `curriculo_nome` | texto ≤ 255 | nome original do arquivo |
| `criada_em` | timestamp | UTC |
| `ip` | texto ≤ 64 | origem do envio |
| `planilha_enviada_em` | timestamp | nulo = pendente |
| `planilha_id_candidatura` | texto ≤ 40 | devolvido pela planilha |
| `planilha_id_pessoa` | texto ≤ 40 | devolvido pela planilha |
| `planilha_tentativas` | inteiro | default 0 |
| `planilha_erro` | texto ≤ 500 | último erro; limpo ao enviar |

Índice: `(vaga_id, criada_em)`.

**Status do envio** (derivado): `enviada` se `planilha_enviada_em` preenchido, senão `pendente`.

## Rótulos das listas (enviados à planilha em pt)

| Campo | Valor | pt | en |
|-------|-------|----|----|
| área | `financas`/`tecnologia`/`comercial`/`rh`/`operacoes` | Finanças/Tecnologia/Comercial/Recursos Humanos/Operações | Finance/Technology/Commercial/Human Resources/Operations |
| nível | `gerencia`/`diretoria`/`vp`/`c-level` | Gerência/Diretoria/VP/C-Level | Manager/Director/VP/C-Level |
| inglês | `basico`…`nativo` | Básico/Intermediário/Avançado/Fluente/Nativo | Basic/Intermediate/Advanced/Fluent/Native |
| disponibilidade | `imediata`/`15-dias`/`30-dias`/`mais-30-dias` | Imediata/15 dias/30 dias/Mais de 30 dias | Immediate/15 days/30 days/More than 30 days |
| mobilidade | `sim`/`nao`/`a-combinar` | Sim/Não/A combinar | Yes/No/Negotiable |

## Configuração (`configuracao_app`)

- Chave `seed_vagas_102` = `"1"` após inserir as 5 vagas migradas.
