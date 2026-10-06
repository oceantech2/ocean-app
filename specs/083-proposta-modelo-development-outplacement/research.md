# Research: Modelo Development & Outplacement, Vários Projetos e Idioma Independente da Moeda

Nenhum item do Technical Context ficou como NEEDS CLARIFICATION. As decisões abaixo resolvem as escolhas de desenho.

## R1. Como guardar vários projetos

- **Decision**: Coluna nova `projetos JSONB` em `propostas`, com uma lista ordenada de objetos `{ "nome": str, "investimentos": [ {tipo, taxa_tipo, taxa, entrada} ] }`. A ordem da lista é a ordem de exibição.
- **Rationale**: Os investimentos já são JSONB desde a 080; os projetos são sempre lidos e gravados junto com a proposta, nunca consultados isoladamente, e o histórico/hash trabalham com o objeto inteiro. Mantém a migração inline simples.
- **Alternatives considered**: Tabela `propostas_projetos` (1:N) — exigiria join, ordenação explícita, cascata na edição e reescrita do hash e do histórico sem ganho de consulta; reaproveitar a coluna `investimentos` com outro formato — misturaria dois formatos na mesma coluna e quebraria o canônico das assinadas.

## R2. Convivência dos formatos antigo e novo

- **Decision**: O formato é decidido pela presença de `projetos`: `projetos IS NOT NULL` = formato novo (ES v3 e D&O v1); `NULL` = formato antigo (ES v1/v2, só assinadas ou canceladas após a migração). As colunas antigas (`projeto_nome`, `investimentos`, `garantia_meses`) ficam `NULL` no formato novo. A constraint `ck_propostas_campos_modelo` é substituída por `ck_propostas_campos_modelo_v2`, que aceita os dois formatos.
- **Rationale**: Uma única fonte de verdade por proposta; o código decide o formato por um teste simples (`p.projetos is not None`), sem depender de tabela de versões no backend.
- **Alternatives considered**: Decidir pelo par modelo/versão no backend — acopla regras de dados a números de versão e complica a constraint SQL.

## R3. Idioma

- **Decision**: Coluna `idioma VARCHAR(5)` (`pt-BR` ou `en-US`), obrigatória nas propostas por modelo e nula nas simples (`ck_propostas_idioma`). Preenchida no boot a partir da moeda (USD → `en-US`, demais → `pt-BR`). No formulário, campo próprio; padrão `pt-BR`. Fixa após a criação, como a moeda.
- **Rationale**: A moeda deixa de determinar o idioma (pedido do usuário). Os componentes de formatação já recebem idioma e moeda separados (`formatarTaxa(inv, { idioma, moeda })`), então a mudança na página é trocar `idiomaDaMoeda(moeda)` por `dados.idioma`.
- **Alternatives considered**: Derivar o idioma do navegador do cliente — rejeitado pela spec 081 (edge case "navegador em outro idioma").
- **Hash**: no formato antigo o idioma não entra no canônico (é sempre o derivado da moeda, então não muda o que foi aceito). No formato novo, entra sempre.

## R4. Migração das propostas existentes

- **Decision**: No `_migrar()`, depois das colunas e constraints:
  1. `UPDATE propostas SET idioma = CASE WHEN moeda = 'USD' THEN 'en-US' ELSE 'pt-BR' END WHERE modelo <> 'simples' AND idioma IS NULL`.
  2. Para cada proposta `executive-search` pendente (status em `STATUS_PENDENTES`, inclusive as expiradas, que continuam editáveis) com `projetos IS NULL`: `projetos = [{nome: projeto_nome, investimentos}]`, `garantia_texto` = "N meses"/"1 mês" ou "N months"/"1 month" conforme o idioma, `shortlist`/`sla` = textos padrão do idioma, `validade_dias = validade - data_proposta` (dias), colunas antigas = `NULL`, `modelo_versao = 3`, hash recalculado. Substitui o laço da 082 (v1 → v2), que passa a ir direto para a versão atual.
- **Rationale**: Edição só é possível em pendentes; convertendo-as, o formulário e o histórico só lidam com o formato novo. Assinadas e canceladas ficam como estão (FR-034).
- **Detalhe**: `validade_dias` pode ficar 0 numa pendente em que a Data é igual à validade, ou acima de 365 em casos antigos; a constraint aceita `>= 0` e a API exige 1 a 365 apenas ao salvar (edge case da spec).
- **Alternatives considered**: Converter também assinadas — invalida a prova do aceite.

## R5. Página do cliente para duas divisões

- **Decision**: Extrair `ExecutiveSearchV1.tsx` para `modelos/pagina/PaginaModelo.tsx`, que recebe `divisao: ConteudoDivisao` (por idioma) e `recursos` (por versão). `ConteudoDivisao` contém: `logo` (src, alt, largura), `tituloDivisao`, `textoServico`, `secaoMeio` (`{ tipo: 'metodologia', titulo, passos }` ou `{ tipo: 'servicos', titulo, cartoes }`), `tituloEscopo`, `observacoesInvestimento`, `observacoesGarantias` (vazio no D&O) e `garantiasSempreVisivel` (ES: true). Os textos comuns (capa, menu, investimento, garantias, próximos passos, contato, aceite, rodapé) vão para `modelos/pagina/i18n`. O CSS vira `pagina-modelo.css`, com a classe raiz `.tpl-es` mantida (evita reescrever 160 regras) e as regras novas do HTML (`.svcs`, `.svc`, `.rate-sub`).
- **Rationale**: As duas páginas compartilham estrutura, CSS e aceite; diferenças são de conteúdo. A versão 1/2 do ES continua renderizando igual porque o layout preserva o comportamento atual quando `recursos.formatoNovo` é falso.
- **Alternatives considered**: Componente separado para D&O — duplicação (ver Complexity Tracking).

## R6. Ícones dos cartões de serviços

- **Decision**: Copiar os três SVGs inline do HTML de referência para o conteúdo da divisão como elementos JSX (`stroke="currentColor"`), identificados por chave (`assessment`, `outplacement`, `solucoes`).
- **Rationale**: Mantém a fidelidade visual sem dependência de biblioteca de ícones e sem `innerHTML`.

## R7. Logo da divisão

- **Decision**: Extrair o PNG embutido (data URI de ~72 KB em base64) do HTML para `frontend/public/propostas/outplacement-development/logo-divisao.png`, exibido com largura de 290px no computador e 190px no celular, como no HTML (o ES usa 220px no CSS atual).
- **Rationale**: Mesmo padrão do Executive Search (arquivo estático em `public/propostas/<divisao>/`). Quando a Ocean enviar o SVG oficial, basta trocar o arquivo.

## R8. Validade em dias

- **Decision**: Coluna `validade_dias SMALLINT`. Na criação e na edição, a API recebe `validade_dias` (1 a 365) e calcula `validade = data_proposta + validade_dias`; recusa quando `validade <= hoje_sp()` com "A validade calculada já passou. Ajuste a data ou os dias.". A coluna `validade` continua sendo a fonte da expiração e da frase da página. O campo `validade` do payload deixa de ser usado nas propostas por modelo (continua nas simples).
- **Rationale**: Nenhuma regra de expiração muda; só a forma de informar.

## R9. Histórico de edições com vários projetos

- **Decision**: O diff compara os projetos por posição: para cada posição `i` presente antes ou depois, se o objeto mudou, grava `{ campo: "projeto.<i+1>", anterior: {nome, investimentos} | null, novo: {nome, investimentos} | null }`. Inclusão aparece com `anterior: null`, remoção com `novo: null`, renomeação e alteração de investimentos como mudança na posição, e reordenação como mudança nas posições afetadas. Campos simples novos: `shortlist`, `sla`, `garantia_texto`, `validade_dias` (além de `validade`, já existente).
- **Rationale**: Legível no detalhe ("Projeto 2: Posição 2 · Retainer 15% … → —") e sem heurística de identidade de projeto, já que projetos não têm identificador estável.
- **Alternatives considered**: Id estável por projeto — exigiria gerar e manter ids no formulário só para o histórico.

## R10. Textos padrão de Shortlist e SLA

- **Decision**: Definidos no backend (`proposta_modelos.py`, usados na migração) e no frontend (`formatoProposta.ts`, usados no formulário), em sincronia: pt-BR "3 a 5 candidatos" / "5 a 10 dias úteis"; en-US "3 to 5 candidates" / "5 to 10 business days". No formulário, a troca de idioma substitui o texto apenas quando ele é igual ao padrão do idioma anterior (FR-021).
