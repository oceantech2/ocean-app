# Research: Proposta em Português ou Inglês conforme a Moeda

Decisões técnicas da feature 081. Nenhum item ficou como "NEEDS CLARIFICATION".

## R1. Como organizar o i18n

**Decisão**: Dicionário tipado próprio, sem biblioteca. `executive-search/v1/i18n/tipos.ts` define `type TextosES` com todas as chaves (textos simples e funções para textos com dados, ex.: `validadeAte: (data: string) => string`). `pt-BR.ts` e `en-US.ts` exportam `const textos: TextosES`. `index.ts` expõe `textosES(idioma)`. O componente chama `const t = textosES(idioma)` e usa `t.servico.titulo`, `t.validadeAte(data)` etc.

**Rationale**: Atende ao pedido de i18n (textos fora do layout, um arquivo por idioma). O TypeScript recusa o build se faltar uma chave em qualquer idioma, o que cobre o FR-024 (nenhuma chave ou texto vazio na página) em tempo de compilação. Sem dependência nova, sem inicialização assíncrona e sem efeito no ERP. Funções para frases com dados resolvem a ordem das palavras diferente entre os idiomas.

**Alternativas consideradas**:
- `react-i18next` + arquivos JSON: padrão de mercado, mas acrescenta ~40 KB, inicialização e detecção de idioma que não usamos (o idioma vem da moeda), e chave faltando só aparece em tempo de execução. Fica como evolução se o Proposal inteiro precisar de vários idiomas.
- `Intl.MessageFormat`/ICU: plural e interpolação ricos, mas desnecessários para 2 idiomas e poucas frases com variável.

## R2. Onde guardar o idioma

**Decisão**: Guardar só a `moeda` (`BRL`/`USD`) em `propostas`; o idioma é derivado (`BRL` → `pt-BR`, `USD` → `en-US`) em um único ponto de cada lado (`idiomaDaMoeda` no frontend; o backend não precisa do idioma).

**Rationale**: A spec define que a moeda determina o idioma, sem escolha separada (FR-002). Uma segunda coluna permitiria combinações proibidas.

**Alternativas consideradas**: coluna `idioma` além de `moeda` (redundante); só `idioma` (valores em dólar ficariam implícitos).

## R3. Migração e propostas existentes

**Decisão**: No `_migrar()`, bloco "Proposal (feature 081)": `ALTER TABLE propostas ADD COLUMN IF NOT EXISTS moeda VARCHAR(3)`; `UPDATE propostas SET moeda = 'BRL' WHERE modelo <> 'simples' AND moeda IS NULL`; constraint `ck_propostas_moeda` criada se não existir: `(modelo = 'simples' AND moeda IS NULL) OR (modelo <> 'simples' AND moeda IN ('BRL', 'USD'))`.

**Rationale**: Idempotente, no mesmo padrão das features 077–080. Propostas simples continuam sem moeda (FR-009); propostas Executive Search existentes viram `BRL`. Sem `DEFAULT` na coluna, porque as simples precisam de `NULL`; o backend sempre grava a moeda na criação por modelo.

**Alternativas consideradas**: alterar `ck_propostas_campos_modelo` (já está em produção; trocar uma constraint existente exige `DROP`/`ADD` e aumenta o risco); `DEFAULT 'BRL'` (quebraria as simples).

## R4. Impressão digital (hash) com a moeda

**Decisão**: Em `conteudo_canonico`, para propostas por modelo, acrescentar a chave `"moeda"` **somente quando a moeda não for `BRL`**. Documentar a regra: ausência da chave = `BRL`.

**Rationale**: O aceite compara o hash recalculado com o `conteudo_hash` gravado (`public_propostas.py`). Incluir a chave sempre mudaria o hash de todas as propostas da 080: as pendentes não poderiam mais ser aceitas e as assinadas deixariam de ser demonstráveis pelo formato atual. Com a regra, propostas em real ficam com o hash idêntico ao de hoje, e propostas em dólar incluem a moeda (FR-021).

**Alternativas consideradas**: incluir sempre e recalcular os hashes pendentes na migração (as assinadas continuariam no formato antigo, ficando dois formatos para a mesma moeda); versionar o formato canônico com um campo extra (mais complexo para o mesmo efeito).

## R5. Moeda na criação, edição e cópia

**Decisão**: `PropostaCreate.moeda: Optional[str]`. No `POST`, vazio → `BRL`; fora de `BRL`/`USD` → `422 "Moeda inválida"`. No `PUT` de proposta por modelo, `moeda` preenchida e diferente da atual → `422 "A moeda da proposta não pode ser alterada"` (mesmo padrão da troca de modelo); vazia ou igual → ignorada. A cópia (`/nova?copiar=`) preenche a moeda da origem, editável.

**Rationale**: FR-001, FR-004 e FR-005. Mantém compatível quem chama a API sem a moeda.

## R6. Formatação por idioma

**Decisão**: `formatacao.ts` passa a receber opções `{ idioma?: Idioma; moeda?: Moeda }` (padrão `pt-BR`/`BRL`, então a interface interna não muda):
- Percentual: `Intl.NumberFormat(idioma, { maximumFractionDigits: 2 })` + `%` → `17,5%` / `17.5%`.
- Valor: prefixo `R$ ` ou `US$ ` + `Intl.NumberFormat(idioma)` sem casas quando inteiro, com 2 casas quando houver centavos → `R$ 50.000`, `US$ 50,000`, `US$ 50,000.50`. Na interface interna (sempre `pt-BR`), um valor em dólar aparece como `US$ 50.000`.
- Data ISO (`yyyy-mm-dd`): `pt-BR` → `24/10/2026` (função atual); `en-US` → `Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })` → `October 24, 2026` (UTC para não deslocar o dia).
- Data e hora (timestamps): fuso `America/Sao_Paulo`; `en-US` com `hour: 'numeric', minute: '2-digit'` → `10:24 AM`.
- Pagamento e garantia: frases vêm do dicionário do modelo (R1), não do `formatacao.ts`, porque são texto do modelo.

**Rationale**: FR-013 a FR-015. `Intl` é nativo e já usado no projeto. O prefixo manual evita o `$` sem país que `Intl` gera para USD em `en-US`.

## R7. Idioma das mensagens fora da página do modelo

**Decisão**:
- Cancelada/expirada: o `GET` público passa a incluir `moeda` nessas respostas quando a proposta for por modelo. `PropostaPublica.tsx` usa `textosES(idiomaDaMoeda(moeda))` para a mensagem e o título da moldura ("Commercial proposal"), ignorando a `mensagem` em português do servidor quando o idioma for inglês.
- Link inválido (404) e carregamento inicial: continuam em português, porque o idioma ainda não é conhecido (edge case da spec).
- Fallback do `Suspense` (carregando o chunk do modelo, com os dados já recebidos): texto no idioma da proposta.
- Erros do aceite: o diálogo já não exibe o `detail` do servidor, exceto no `409` de versão desatualizada; passa a exibir a frase do dicionário (`t.aceite.versaoAtualizada`) e a detectar o caso pelo prefixo do `detail` do servidor, que não muda (FR-019).

**Rationale**: Mantém o contrato de assinatura e as mensagens do servidor como estão (o Proposal interno e as propostas simples continuam em português) e resolve a tradução no cliente, onde o idioma é conhecido.

**Alternativas consideradas**: servidor devolver mensagens em dois idiomas (espalha textos do modelo pelo backend); cabeçalho `Accept-Language` (o idioma depende da proposta, não do navegador).

## R8. Atributo `lang` e título

**Decisão**: `ExecutiveSearchV1` define `document.documentElement.lang` (`pt-BR` ou `en`) e `document.title` a partir do dicionário no `useEffect`, restaurando os valores anteriores ao desmontar. O nome do PDF vem de `t.pdf.nomeArquivo(cliente)`.

**Rationale**: FR-017 e FR-018. O `proposal.html` continua com `lang="pt-BR"`, que vale para o Proposal interno e as propostas simples.

## R9. Conteúdo fixo com particularidades brasileiras

**Decisão**: Traduzir literalmente, como manda a spec (Assumptions). Pontos que a Ocean deve revisar estão marcados em [contracts/textos-executive-search.md](./contracts/textos-executive-search.md): "Valor mínimo de R$ 15.000,00 por projeto" (no inglês, `BRL 15,000.00`, sem conversão), "13º salário e adicional de férias" e "Impostos (até 19,55%)".

**Rationale**: Conteúdo comercial é decisão da Ocean; deixar essas frases como chaves isoladas permite trocá-las sem tocar no layout (US4).

## R10. Fidelidade da página em português

**Decisão**: `pt-BR.ts` recebe os textos atuais **literais** do `ExecutiveSearchV1.tsx`, e o markup não muda (mesmas tags, classes e ordem). Validar repetindo a comparação de estilos computados da 080 (1280 px e 390 px) entre a versão atual e a nova, esperando diferença zero.

**Rationale**: SC-003. A refatoração para o dicionário é o maior risco de regressão da página em português.

## R11. Interface interna

**Decisão**: `ModeloForm` ganha o campo **Moeda** no topo do formulário (logo abaixo do seletor de modelo da `Nova.tsx`), como `<select>` com "Real (R$) — apresentação em português" e "Dólar (US$) — apresentação em inglês"; na edição, `disabled` com a mesma informação. O alternador de taxa mostra `%`/`R$` ou `%`/`US$`. Lista: a coluna Modelo mostra "Executive Search" e, abaixo, "Real · português" ou "Dólar · inglês". Detalhe: cabeçalho "Executive Search · Dólar (inglês) · {projeto}"; taxas formatadas na moeda.

**Rationale**: FR-003, FR-006, FR-007 e FR-008, com o mínimo de mudança visual.
