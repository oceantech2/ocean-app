# Research: Modelos de Proposta por Divisão (Executive Search)

**Feature**: `080-proposta-modelo-executive-search` | **Data**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

Base de código considerada: Proposal das features 077 (criação, página pública, assinatura) e 079 (edição com `versao`, histórico `propostas_edicoes`, assinatura condicionada à versão), esta última ainda não commitada na árvore de trabalho. Material de origem: `Proposta_Comercial_Executive_Search.html` (HTML único com CSS/JS e duas imagens embutidas: JPEG da capa ≈ 289 KB e PNG da logo da divisão ≈ 6 KB) e `Instrucoes_Desenvolvedor_Proposta_Comercial.md`.

---

## R1. Como gerar a página do cliente a partir do HTML de referência

**Decisão**: Reproduzir o modelo como **componente React por modelo e versão** (`ExecutiveSearchV1`), renderizado na rota pública já existente `/p/:codigo` do app do Proposal, alimentado pelo JSON do `GET /api/public/propostas/{codigo}`. A estrutura de marcação, as classes e o CSS são copiados do HTML de referência; os marcadores `[Empresa]`, `[Data]` etc. viram expressões JSX.

**Rationale**:
- Mantém o mesmo link (`proposal.oceantalentsolutions.com/p/{codigo}`), o mesmo fluxo de status/visualização e a mesma chamada de assinatura das features 077 e 079.
- O React escapa texto por padrão, o que atende FR-020 (dados digitados exibidos como texto literal) sem sanitização manual.
- Os quadros de investimento (1 a 3) e as condicionais (entrada opcional, assinada, "Atualizada em") são naturais em JSX.
- O modo de destaque `?campos`/Shift+C e os atributos `data-field`/`data-example` simplesmente não são portados (FR-014).

**Alternativas consideradas**:
- *Backend renderiza o HTML (Jinja2) e serve a página*: exigiria servir a página pela API (Render), em outro domínio, ou um proxy na Vercel; duplicaria a lógica de status/assinatura já feita no SPA. Rejeitada.
- *Guardar o HTML como string e preencher via DOM (`data-field` + `textContent`) dentro de um `iframe srcdoc`*: máxima fidelidade literal, mas diálogo de aceite, impressão e chamadas à API dentro do iframe complicam; repetição de blocos (`data-repeat`) teria de ser feita à mão. Rejeitada.
- *Entrada HTML separada (sem Tailwind) só para a página pública*: isolaria o CSS por completo, mas muda `vercel.json`, o plugin de dev do Vite e o roteamento por host. Mantida como **plano B** caso R2 não atinja a fidelidade (SC-003).

## R2. Isolamento do CSS do modelo dentro do app (Tailwind)

**Decisão**: Copiar o `<style>` do modelo para `frontend/src/proposal/modelos/executive-search/v1/executive-search-v1.css`, **escopado** sob a classe raiz `.tpl-es`:
- `:root{...}` (tokens) → `.tpl-es{...}`; `body{...}` → `.tpl-es{...}`; seletores de elemento (`h1,h2,h3`, `a`, `nav`, `section`, `table`, `dialog`, `footer`) prefixados com `.tpl-es`.
- Restaurar explicitamente o que o *preflight* do Tailwind zera e o modelo pressupõe do navegador: `list-style` e `padding-left` das listas de Observações (`.notes ul`), margens de `p`, estilo de `button`, `border-collapse` da tabela, `img` inline na logo.
- `@media print` mantido, escopado; o app não tem outro "chrome" na rota pública, então a impressão sai como no modelo.
- Fontes Inter e Poppins carregadas por `<link>` (com `preconnect`) no `frontend/proposal.html`, como no modelo.

**Rationale**: menor mudança de infraestrutura; a fidelidade é verificável lado a lado (quickstart, seção 4). O escopo impede que o CSS do modelo vaze para as telas internas do Proposal e vice-versa.

**Alternativas**: CSS Modules (renomeia classes, dificulta a comparação com o HTML de referência); Shadow DOM (incompatível com `<dialog>` + impressão de forma previsível e com o React Router). Rejeitadas.

## R3. Imagens (capa por setor e logo da divisão)

**Decisão**: Extrair as duas imagens embutidas para arquivos estáticos:
- `frontend/public/propostas/executive-search/logo-divisao.png` (logo branca Executive Search);
- `frontend/public/propostas/setores/infraestrutura.jpg` (capa atual).

Um mapa `setor → URL` em `frontend/src/proposal/modelos/setores.ts` aponta os 5 setores para `infraestrutura.jpg` até o `fundos-por-setor.zip` chegar; quando chegar, basta adicionar `oil-gas.jpg`, `energia.jpg`, `mineracao.jpg`, `industria-servicos.jpg` e atualizar o mapa. Se a imagem falhar (`onError`), o `<img>` é ocultado e a capa fica com o fundo azul-marinho do modelo (edge case "Foto do setor indisponível").

**Rationale**: tira ≈ 400 KB de base64 do bundle/JSON, permite cache de CDN da Vercel e atende a premissa "uma foto padrão por setor". Foto gerada por IA fica fora do escopo (spec, Assumptions).

**Alternativas**: manter base64 no componente (bundle pesado em todas as telas do Proposal); servir as imagens pela API (sem cache de CDN, mais carga no Render). Rejeitadas.

## R4. Versionamento do texto do modelo (FR-025, SC-005)

**Decisão**: A proposta guarda `modelo` (`executive-search`) e `modelo_versao` (inteiro, hoje `1`).
- Registros espelhados: backend `app/services/proposta_modelos.py` (`MODELOS = {"executive-search": {"nome": "Executive Search", "versao_atual": 1, "disponivel": True}}`) e frontend `frontend/src/proposal/modelos/index.ts` (`{ "executive-search": { nome, disponivel, versoes: { 1: ExecutiveSearchV1 } } }`).
- Criação e edição gravam `modelo_versao = versao_atual`. Propostas assinadas nunca mudam de versão.
- Mudar texto fixo do modelo no futuro = criar `ExecutiveSearchV2` e subir `versao_atual`; o componente V1 permanece no código para as propostas que o usam.
- `modelo` e `modelo_versao` entram no hash canônico (R7). Junto com o histórico do repositório (o componente da versão é imutável), isso permite demonstrar o texto exato aceito.

**Rationale**: atende FR-025 sem guardar snapshot do HTML inteiro por proposta.

**Alternativas**: snapshot do HTML renderizado na assinatura (dezenas de KB por proposta, e o HTML final é gerado no navegador, não no servidor); tabela de modelos no banco com o texto (CMS desnecessário: o texto muda raramente e só por deploy). Rejeitadas (Princípio V).

## R5. Armazenamento dos campos do modelo

**Decisão**: Colunas novas em `propostas` para os campos escalares e uma coluna `investimentos JSONB` para os 1 a 3 quadros:
- `modelo VARCHAR(40) NOT NULL DEFAULT 'simples'` (backfill automático das propostas antigas), `modelo_versao INTEGER`;
- `cliente_nome` é **reaproveitada como "Empresa"** (já é obrigatória, já aparece na lista e no detalhe; FR-030 pede "empresa = nome do cliente" nas propostas simples);
- `data_proposta DATE`, `setor VARCHAR(40)`, `consultor_nome`, `consultor_cargo`, `consultor_telefone`, `consultor_email`, `projeto_nome`, `garantia_meses SMALLINT`;
- `cnpj`, `valor`, `total` passam a aceitar `NULL`; um `CHECK` por modelo garante que propostas `simples` continuam com CNPJ/valor/total e que propostas por modelo têm os campos do modelo e `jsonb_array_length(investimentos)` entre 1 e 3.

**Rationale**: os campos são os mesmos para as 4 divisões (FR-004), então colunas fixas servem a todas; a lista ordena/filtra por colunas; os investimentos são sempre lidos e gravados juntos, e o JSONB simplifica diff (R8) e hash (R7).

**Alternativas**: tabela filha `propostas_investimentos` (joins e diff linha a linha para no máximo 3 itens); um único `dados JSONB` com tudo (perde colunas para lista e constraints); tabela separada para propostas por modelo (duplicaria status, assinatura, edição e histórico). Rejeitadas.

**Convenções**: segue o padrão do projeto (migração inline idempotente em `_migrar()`, `TIMESTAMP` em UTC, `VARCHAR`), por consistência (Princípio IV). Constraints novas criadas em bloco `DO $$ ... IF NOT EXISTS (pg_constraint) $$`, porque o Postgres não tem `ADD CONSTRAINT IF NOT EXISTS`.

## R6. Contrato de criação/edição e validação por modelo

**Decisão**: Estender o schema `PropostaCreate` com `modelo` e os campos do modelo (todos opcionais no Pydantic, validados no serviço, como hoje):
- `POST /proposal/propostas/` exige `modelo` disponível no registro; `modelo` ausente, `simples` ou desconhecido → `422 "Modelo de proposta inválido"` (FR-012: criação só por modelo).
- `PUT /proposal/propostas/{id}` usa o modelo **da proposta**: propostas `simples` continuam validadas por `validar_dados` (079); propostas por modelo, por `validar_modelo`. `modelo` diferente no corpo → `422 "O modelo da proposta não pode ser alterado"` (FR-003).
- Mensagens de erro em pt-BR, uma por campo, no mesmo formato `detail` string da 077/079.

**Rationale**: mantém um único endpoint de criação e um de edição, sem quebrar a edição das propostas antigas (FR-030).

**Alternativas**: endpoints separados por modelo (`/propostas/executive-search`); união discriminada no Pydantic (mensagens 422 em formato de lista, diferente do padrão do Proposal). Rejeitadas.

## R7. Hash canônico do conteúdo

**Decisão**: `conteudo_canonico(p)` passa a despachar por `p.modelo`:
- `simples`: **inalterado** (hashes já gravados continuam válidos).
- por modelo: JSON ordenado com `codigo`, `emitida_em`, `modelo`, `modelo_versao`, `cliente_nome` (Empresa), `data_proposta`, `setor`, `consultor` (nome, cargo, telefone, e-mail), `projeto_nome`, `garantia_meses`, `investimentos` (ordenados Retainer → Sucesso → Valor fechado; `taxa` como string com 2 casas; `entrada` inteiro ou `null`) e `validade`.

**Rationale**: FR-024/SC-005; a verificação `calcular_hash(p) == p.conteudo_hash` antes de assinar (077) continua funcionando para os dois formatos.

## R8. Diff e histórico de edições com investimentos (FR-028)

**Decisão**: `diff_campos` passa a usar a lista de campos do modelo:
- escalares: `cliente_nome` (rotulado "Empresa"), `data_proposta`, `setor`, `consultor_nome`, `consultor_cargo`, `consultor_telefone`, `consultor_email`, `projeto_nome`, `garantia_meses`, `validade`;
- investimentos: uma entrada por tipo, `investimento.retainer` / `investimento.sucesso` / `investimento.valor-fechado`, com `anterior`/`novo` = objeto canônico `{taxa_tipo, taxa, entrada}` ou `null` (inclusão = `anterior: null`; remoção = `novo: null`).

O formato de `propostas_edicoes.alteracoes` (array de `{campo, anterior, novo}`) não muda; o `Detalhe` formata os objetos ("15% · 40% de entrada + 60% após conclusão").

## R9. Perfil do consultor (US5, FR-031, FR-032)

**Decisão**: Tabela nova `proposal_perfis_consultor` (PK = `usuario_id` → `usuarios_app.id ON DELETE CASCADE`; `nome`, `cargo`, `telefone`, `email` anuláveis; `atualizado_em`). Endpoints `GET` e `PUT /api/proposal/perfil`, sempre do usuário do token (nunca recebem id). Campos vazios são permitidos (perfil incompleto); campos preenchidos passam pelas mesmas validações do formulário.

A proposta **copia** os dados do consultor para as próprias colunas (R5), então mudar o perfil não altera propostas existentes (FR-032).

**Rationale**: decisão da clarify (perfil no Proposal, cadastro do ERP inalterado). PK no `usuario_id` garante "no máximo um perfil por usuário" sem índice extra.

**Alternativas**: colunas em `usuarios_app` (mexe no cadastro do ERP, contra a clarify); `localStorage` (não acompanha o usuário entre dispositivos). Rejeitadas.

## R10. Telefone, e-mail e links de contato

**Decisão**:
- Telefone: aceita máscara e `+`; válido com 10 a 13 dígitos; guardado como digitado (aparado) para exibição. Dígitos para `tel:` e WhatsApp: se tiver 10 ou 11 dígitos, prefixa `55` (edge case "assume +55"). Exceção: se o número digitado começar com `+`, os dígitos são usados como estão (código do país já informado), para não estragar números estrangeiros.
- E-mail: `validar_email` existente (`app/services/documento.py`).
- WhatsApp: `https://wa.me/{digitos}?text=` + mensagem do FR-018 com a Empresa; `tel:+{digitos}`; `mailto:{email}`.

## R11. Formatação exibida ao cliente

**Decisão**: Funções puras no frontend (`frontend/src/proposal/modelos/formatacao.ts`), a partir dos valores canônicos do JSON:
- taxa percentual: pt-BR sem zeros à direita, até 2 casas (`15%`, `17,5%`, `17,25%`);
- taxa em reais: `R$ 50.000` quando inteira, `R$ 50.000,50` com centavos;
- forma de pagamento: `{e}% de entrada + {100−e}% após conclusão` ou `100% após conclusão` (entrada `null`/0);
- garantia: `1 mês` / `N meses`;
- datas: `DD/MM/AAAA` (data da proposta é `DATE`, sem fuso; "Atualizada em" converte de UTC para São Paulo, como na 079).

O backend devolve só valores canônicos (como hoje), para que lista, detalhe e página pública formatem igual.

## R12. Aceite pelo botão do modelo (US3, FR-022/023)

**Decisão**: O `<dialog id="accept-dialog">` do modelo vira um `<dialog>` React aberto com `showModal()` via `ref`, mantendo título, texto, estilos e botões do modelo, e ganhando os campos nome completo, e-mail e "Li e aceito os termos desta proposta" (validações iguais às da 077). Confirmar chama `assinarPublica(codigo, {nome, email, aceite, versao})`:
- sucesso → mensagem `Aceite registrado. Nossa equipe enviará o contrato em breve.` (classe `.msg.ok`), esconde "Confirmar aceite" e, ao fechar, a página mostra o estado assinado;
- `409` de versão desatualizada → mensagem da 079 e recarga dos dados mantendo nome/e-mail;
- `409`/`404` de status → recarrega e cai na mensagem de cancelada/expirada;
- outras falhas → `.msg.err` com `Erro: não foi possível registrar o aceite. Tente novamente ou fale com o consultor.`

`CONFIG.erpEndpoint`, `contractUrl` e o aceite por `mailto:` do modelo não são portados (spec, Assumptions).

## R13. Estados da página pública por status

**Decisão**:
- `aguardando`/`visualizada`: layout completo com "Aceitar proposta".
- `assinada`: layout completo; na seção "Vamos avançar?", o botão "Aceitar proposta" dá lugar a `Proposta aceita em DD/MM/AAAA às HH:MM por {nome}.`; "Falar com o consultor" e "Baixar PDF" continuam.
- `cancelada`/`expirada`/não encontrada: mesmas telas de mensagem atuais (sem dados), inclusive para propostas por modelo.
- Propostas `simples`: continuam com a página atual (componente legado), escolhida pelo campo `modelo` do JSON.

## R14. Data da proposta, validade e "Atualizada em"

**Decisão**:
- `data_proposta` padrão = hoje (São Paulo); aceita passado e futuro; `422 "Data da proposta não pode ser posterior à validade"` se `data_proposta > validade`.
- Frase `Esta proposta é válida até DD/MM/AAAA.` como último parágrafo antes dos botões em "Vamos avançar?" (FR-033).
- "Atualizada em DD/MM/AAAA" como linha secundária sob a Data na capa (FR-021), no estilo do rótulo `.meta span`.

## R15. Disponibilidade de modelos sem tabela nem endpoint

**Decisão**: A lista de modelos disponíveis vem do registro do frontend (R4); o backend valida contra o próprio registro. Não há tabela `modelos` nem `GET /modelos`.

**Rationale**: incluir um modelo exige deploy de qualquer forma (novo componente e conteúdo); um endpoint só duplicaria a fonte da verdade (Princípio V). Os dois registros são pequenos e ficam documentados em [contracts/ui-proposal.md](./contracts/ui-proposal.md) e [contracts/api-proposal.md](./contracts/api-proposal.md).

## R16. Desempenho da página do cliente

**Decisão**: Meta prática de "conteúdo visível em até 3 s numa conexão 4G" para a página pública, atingida com: imagens como arquivos estáticos com cache de CDN (R3), JSON público pequeno (< 2 KB) e o componente do modelo carregado com `React.lazy` só na rota pública (as telas internas não pagam o custo do CSS/imagens do modelo). O indicador de carregamento atual da 077 continua no primeiro acesso.
