# Research: Escopo do Projeto e Título da Divisão (082)

Decisões técnicas da feature. Não restou nenhum "NEEDS CLARIFICATION" no Technical Context.

## R1. Editor de texto formatado no formulário

- **Decision**: TipTap 3 (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, versão `^3`), com o `StarterKit` configurado para manter só `Document`, `Paragraph`, `Text`, `Bold`, `BulletList`, `OrderedList`, `ListItem`, `ListKeymap`, `HardBreak` e `UndoRedo`. Todas as outras extensões ficam desligadas (`heading`, `blockquote`, `code`, `codeBlock`, `horizontalRule`, `italic`, `strike`, `underline`, `link`, `dropcursor`, `gapcursor`, `trailingNode`). O editor fica em `components/EditorEscopo.tsx`, carregado com `React.lazy` só no formulário.
- **Rationale**:
  - Atende ao FR-003 com comandos visíveis (barra com Negrito, Lista numerada, Lista com marcadores, Aumentar recuo e Diminuir recuo), mostrando a formatação enquanto o consultor escreve.
  - Listas aninhadas de verdade (`<li>` com `<ul>` dentro), como no exemplo do modelo.
  - Ao colar, o esquema do ProseMirror descarta sozinho marcas e nós fora das extensões ligadas (cores, fontes, tabelas, imagens, links) e mantém o texto, o que atende ao FR-004 sem código extra.
  - Compatível com React 18 (`peerDependencies: react ^17 || ^18 || ^19`).
  - O carregamento preguiçoso mantém o editor fora do código da página pública do cliente.
- **Alternatives considered**:
  - `contentEditable` com `document.execCommand`: API obsoleta, listas aninhadas inconsistentes entre navegadores e colagem do Word suja. Exigiria um sanitizador próprio no cliente.
  - `textarea` com Markdown: obriga o consultor a digitar marcação, o que viola o FR-003.
  - Quill: o recuo vira classes (`ql-indent-1`), não listas aninhadas; o HTML não casa com o CSS `.scope` do modelo.
  - Lexical: API mais pesada para um único campo; o HTML gerado exige mais conversão.

## R2. Formato de armazenamento do escopo

- **Decision**: HTML canônico restrito numa coluna nova `propostas.projeto_escopo TEXT NULL`. A gramática está em [data-model.md](./data-model.md) §2. Escopo vazio é gravado como `NULL`.
- **Rationale**: é o mesmo formato do exemplo do modelo (`data-example-html`) e do CSS `.scope`. É legível no JSON canônico do hash e no histórico de edições, e o TipTap carrega o conteúdo direto na edição e na cópia.
- **Alternatives considered**: JSON do ProseMirror. É seguro por construção, mas acopla o banco ao editor, fica ilegível no hash e no histórico e exige conversão para exibir.

## R3. Sanitização e normalização no servidor (FR-002, FR-005, FR-006, FR-009)

- **Decision**: nova função `normalizar_escopo(html) -> Optional[str]` em `backend/app/services/escopo_projeto.py`, usando só a biblioteca padrão (`html.parser.HTMLParser` com `convert_charrefs=True`). A saída é **reconstruída**: o HTML recebido nunca é repassado. O resultado é gerado só a partir de tags permitidas, sem atributos, e com o texto escapado por `html.escape(texto, quote=False)`. Regras:
  1. Tags permitidas: `p`, `ol`, `ul`, `li`, `strong`, `br`. `b` vira `strong`. Qualquer outra tag é removida e o texto dela é mantido. `script`, `style`, `template`, `iframe`, `object`, `noscript` e `textarea` são removidas **com** o conteúdo.
  2. `<p>` dentro de `<li>` é desembrulhado (o TipTap gera `<li><p>…</p></li>`); vários parágrafos no mesmo item viram linhas separadas por `<br>`.
  3. Texto solto no nível de topo é envolvido em `<p>`.
  4. Listas com mais de dois níveis são achatadas: os itens a partir do 3º nível sobem para a lista do 2º nível, logo depois do item pai, na mesma ordem.
  5. Espaços em sequência viram um espaço; espaços nas bordas de cada bloco são removidos.
  6. Parágrafos, itens e listas sem texto são removidos. Se não sobrar texto, retorna `None` (FR-006).
  7. Contagem de caracteres = soma do tamanho dos trechos de texto já normalizados, sem marcação. Acima de 5.000 → `422 "Escopo do projeto deve ter no máximo 5.000 caracteres"`. A entrada bruta acima de 100.000 caracteres é recusada antes do parse, com a mesma mensagem.
- **Rationale**: não exige dependência nova. Como a saída é gerada do zero a partir de uma lista branca sem atributos, não há caminho para atributos de evento, `javascript:` ou CSS. A mesma função também garante o formato canônico que o hash e o histórico precisam.
- **Alternatives considered**:
  - `nh3`/`ammonia`: dependência compilada nova, e ainda seria preciso uma segunda passada para desembrulhar `<p>` em `<li>`, achatar níveis e contar caracteres.
  - `bleach`: descontinuado.
  - Confiar no editor: viola o FR-009, porque a API pode ser chamada fora do formulário.

## R4. Exibição do escopo (página do cliente e detalhe)

- **Decision**: componente `modelos/EscopoRico.tsx`. Ele lê o HTML canônico com `DOMParser` e o converte em elementos React pela mesma lista branca (`p`, `ol`, `ul`, `li`, `strong`, `br` e texto). Não usa `dangerouslySetInnerHTML`. Para o histórico de edições, `escopoParaTexto(html)` (em `modelos/escopo.ts`) gera texto simples com "1." e "•" por item e recuo no 2º nível.
- **Rationale**: é uma defesa em profundidade do FR-014. Mesmo um valor fora do padrão gravado direto no banco não executa nada no navegador. São cerca de 30 linhas e nenhuma dependência.
- **Alternatives considered**:
  - `dangerouslySetInnerHTML` confiando só no servidor: um único ponto de falha.
  - DOMPurify: dependência nova para o que a conversão por lista branca já resolve.

## R5. Versão do modelo e propostas já assinadas (FR-016, FR-019)

- **Decision**: o Executive Search passa para a **versão 2** (`versao_atual: 2` em `MODELOS`, no backend e no frontend). A v2 é a v1 com o título da divisão na primeira seção e no menu e com a seção opcional de escopo. O mesmo componente renderiza as duas versões a partir de uma tabela de recursos por versão (`executive-search/v1/versoes.ts`: `{1: {tituloDivisao: false, escopo: false}, 2: {tituloDivisao: true, escopo: true}}`). O registro `MODELOS['executive-search'].versoes` aponta `1` e `2` para o mesmo módulo preguiçoso. `validar_modelo` já grava `versao_atual` na criação e na edição.
- **Rationale**: `modelo_versao` entra no JSON canônico, então uma proposta assinada na v1 continua exibindo "Serviço"/"Service" e sem escopo, como foi aceita (FR-019, FR-025 da 080). Reaproveitar o componente evita duplicar cerca de 370 linhas de JSX, o CSS e os dicionários por duas diferenças pequenas.
- **Alternatives considered**:
  - Pasta `v2/` copiada da v1: duplicação de código, CSS e traduções, com risco de divergência.
  - Trocar o título sem mudar a versão: a proposta assinada passaria a mostrar um conteúdo diferente do aceito, o que quebra a integridade.

## R6. Propostas pendentes criadas antes da feature (FR-020)

- **Decision**: novo bloco "Proposal (feature 082)" em `_migrar()` (`backend/app/main.py`). Ele adiciona a coluna e a constraint e depois, com `SessionLocal`, seleciona com `FOR UPDATE` as propostas `modelo <> 'simples' AND modelo_versao = 1 AND status IN ('aguardando','visualizada')`. Em cada uma, grava `modelo_versao = 2` e recalcula `conteudo_hash = calcular_hash(p)`. Não altera `versao`, `atualizada_em` nem `status`, e não cria registro em `propostas_edicoes`, porque só o texto fixo muda e nenhum dado da proposta. Inclui as pendentes já vencidas (o status gravado delas continua pendente). É idempotente, porque o filtro deixa de achar as linhas na segunda execução.
- **Rationale**: a assinatura compara o hash gravado com o recalculado (`public_propostas.assinar_proposta`), então trocar a versão sem regravar o hash bloquearia o aceite. Manter `versao` evita o aviso "Esta proposta foi atualizada" para um cliente que estivesse com a página aberta.
- **Alternatives considered**:
  - Deixar as pendentes na v1 até serem editadas: contraria o FR-020.
  - Decidir o título na hora de exibir, pelo status: a proposta seria assinada com o hash da v1 mostrando conteúdo da v2.

## R7. Hash, histórico e cópia

- **Decision**: `conteudo_canonico` inclui `"projeto_escopo"` **só quando não for nulo** (mesmo padrão da `moeda` na 081), preservando os hashes já gravados. `projeto_escopo` entra em `CAMPOS_MODELO`, então `diff_campos` registra inclusão, alteração e remoção com o HTML anterior e o novo (FR-008). A cópia (`formDeModelo`) copia o campo (FR-007).
- **Rationale**: atende ao FR-018 sem invalidar assinaturas antigas e reaproveita o mecanismo de histórico existente.

## R8. Contagem de caracteres igual no formulário e no servidor

- **Decision**: o formulário conta `editor.state.doc.textContent.length`. É a soma dos textos sem separadores entre blocos, e `<br>` conta 0, a mesma regra do R3.7. O contador mostra "N / 5.000" e o formulário bloqueia o envio acima do limite.
- **Rationale**: o ProseMirror já colapsa espaços ao carregar o HTML, igual à normalização do servidor; assim, o número que o consultor vê é o mesmo que o servidor valida.

## R9. Limite de dois níveis no editor

- **Decision**: em `EditorEscopo`, Tab e o botão "Aumentar recuo" só executam `sinkListItem` quando o item está no 1º nível. Shift+Tab e "Diminuir recuo" usam `liftListItem`. Listas mais profundas que cheguem por colagem são achatadas pelo servidor ao salvar (R3.4) e aparecem já achatadas na próxima edição.
- **Rationale**: evita criar algo que o servidor vai alterar, sem exigir um normalizador no cliente.

## R10. Textos fixos novos (i18n)

- **Decision**: acrescentar a `TextosES` as chaves `nav.escopo` ("Escopo do Projeto" / "Project Scope") e `servico.tituloDivisao` ("Executive Search" nos dois idiomas). `nav.servico` ("Serviço"/"Service") continua existindo para a v1.
- **Rationale**: o tipo `TextosES` obriga os dois idiomas a terem as chaves (FR-024 da 081). O nome da divisão fica no conteúdo fixo do modelo (FR-017).
