# Research: Modelo por seção na nova proposta

## R1. Como saber se a seção ainda é igual ao modelo (FR-006, FR-007)

- **Decision**: Guardar, para cada seção, o id do modelo aplicado e uma **assinatura** do conteúdo da seção naquele momento (texto serializado só com os campos da seção). O seletor mostra o modelo apenas quando a assinatura do conteúdo atual é igual à guardada; caso contrário, mostra "Usar modelo…".
- **Rationale**: É estado derivado; não exige marcar "editado" em cada setter do formulário (são dezenas de pontos de edição, inclusive os investimentos de cada projeto). Também cobre o caso de o consultor desfazer a edição à mão (US2/AC4). Como o seletor volta a "Usar modelo…" quando há divergência, escolher o mesmo modelo de novo dispara a troca e restaura o conteúdo (resolve a falha da primeira versão).
- **Alternatives considered**: (a) marcar a seção como editada em cada `set*`, frágil e espalhado pelo arquivo; (b) manter o seletor sempre em "Usar modelo…" e mostrar a origem num texto à parte, que perde a indicação direta no próprio seletor; (c) botão "Restaurar" separado, que é mais um controle por seção sem necessidade.

## R2. Assinatura por seção

- **Decision**: A assinatura usa só os campos da seção: Apresentação (idioma, moeda), Cliente (setor), Escopo (texto do escopo), Projetos (nome e investimentos de cada projeto, **sem** a chave interna de lista), Garantias (shortlist, SLA, garantia), Validade (dias).
- **Rationale**: A chave interna dos projetos muda a cada aplicação e não é conteúdo; incluí-la faria a assinatura nunca bater.
- **Alternatives considered**: comparar com o modelo original a cada render, o que não serve para o formulário inicial vindo do seletor geral com perfil e defaults, e repete a conversão modelo→formulário.

## R3. Editor do escopo (TipTap) e troca externa de valor

- **Decision**: Remontar o editor (chave incremental) quando um modelo substitui o escopo.
- **Rationale**: O editor só lê o valor ao montar; atualizar só o estado deixaria o texto antigo na tela. O editor só emite mudança em edição do usuário, então o valor do modelo fica intacto até ser editado e a assinatura bate.
- **Alternatives considered**: `editor.commands.setContent` via ref, que exige expor o editor para fora do componente e complica o `EditorEscopo`.

## R4. Seção Cliente

- **Decision**: O seletor da seção Cliente aplica só o setor e lista só modelos com setor válido (presente na lista de setores atual).
- **Rationale**: Empresa e data nunca vêm de modelo (feature 098). Um modelo sem setor não tem o que aplicar; listá-lo faria a escolha apagar o setor ou não fazer nada.
- **Alternatives considered**: listar todos e, para modelo sem setor, limpar o setor, o que confunde e pode apagar uma escolha do consultor.

## R5. Regras de confirmação (FR-005)

- **Decision**: Confirmar antes de substituir quando a seção "tem conteúdo": Cliente com setor escolhido; Escopo com texto; algum projeto com nome ou investimento marcado; Garantias diferentes do padrão do idioma. Apresentação e Validade nunca confirmam. Também não confirmar quando o conteúdo atual já é igual ao do modelo escolhido.
- **Rationale**: Mesmo critério do seletor geral (só pergunta quando há algo a perder), aplicado por seção.

## R6. Origem inicial vinda do seletor geral (FR-008)

- **Decision**: Quando o formulário é montado a partir do seletor geral, todas as seções começam com origem = esse modelo e assinatura = conteúdo inicial de cada seção. O formulário já é remontado a cada troca do seletor geral, então a origem é recalculada.
- **Rationale**: Reaproveita o mecanismo de remontagem que já existe em `Nova.tsx`.
- **Observação**: se o modelo geral não tiver setor, a seção Cliente começa sem origem (o setor fica vazio e o modelo nem aparece no seletor dessa seção).

## R7. Backend e conector do Claude

- **Decision**: Nenhuma mudança.
- **Rationale**: O payload da proposta é o mesmo; a origem das seções não é gravada (FR-010).
