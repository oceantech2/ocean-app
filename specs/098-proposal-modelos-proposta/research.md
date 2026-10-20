# Research: Modelos de proposta no Proposal

## R1 — Onde guardar o conteúdo do modelo

- **Decision**: Tabela própria `propostas_modelos` com colunas espelhando o conteúdo da proposta no formato novo (idioma, moeda, setor, escopo, `projetos` JSONB, shortlist, SLA, garantia, validade em dias).
- **Rationale**: Reaproveita as mesmas regras e formatos de `propostas` (JSONB de projetos já validado por `validar_projetos`); a conversão para o formulário usa a mesma lógica de `formDeModelo`.
- **Alternatives considered**: Guardar uma proposta "fantasma" com flag de modelo (poluiria lista, filtros, hash e status); um único JSON com o payload inteiro (perde validação de colunas e dificulta filtro por divisão).

## R2 — Validação

- **Decision**: Nova função `validar_modelo_proposta` em `services/proposta_modelos.py` que reutiliza `validar_projetos`, `normalizar_escopo`, `validar_idioma`, `validar_moeda`, `_texto_opcional`; setor é opcional (se informado, precisa existir); validade em dias de 1 a 365; nome obrigatório até 120 caracteres; divisão precisa estar disponível.
- **Rationale**: FR-004 — o conteúdo do modelo deve ser válido como proposta; empresa, data e consultor ficam fora. Setor opcional porque o mesmo modelo pode servir a clientes de setores diferentes; a nova proposta continua exigindo o setor.
- **Alternatives considered**: Exigir setor (forçaria um modelo por setor × divisão).

## R3 — Nome único

- **Decision**: `UniqueConstraint(divisao, nome)` no banco + checagem sem diferenciar maiúsculas na API (mensagem "Já existe um modelo com esse nome nesta divisão").
- **Rationale**: Índice funcional `lower(nome)` não é criado de forma portátil por `create_all` no padrão do projeto; a checagem na API cobre o caso comum e a constraint protege duplicatas exatas.

## R4 — Permissões e auditoria

- **Decision**: Leitura com `get_proposal_user`; escrita exige `papel == "admin"` (403 caso contrário). `registrar_auditoria(db, usuario, "criar"|"editar"|"excluir", "ModeloProposta", id, "<divisão> — <nome>")`.
- **Rationale**: Mesmo padrão da exclusão de propostas (feature 094).

## R5 — Formulário

- **Decision**: `ModeloForm` ganha a prop `variante: 'proposta' | 'modelo'`. Na variante modelo: some a seção Consultor, a seção Cliente mostra só Setor (opcional), a validade mostra só os dias e a validação ignora empresa/data/consultor. A prop `onAlterado` avisa a página quando o usuário mexe no formulário (para a confirmação de troca de modelo na nova proposta).
- **Rationale**: Um formulário só evita divergência de regras entre proposta e modelo.

## R6 — Seletor na nova proposta

- **Decision**: A nova proposta carrega uma vez a lista de modelos (até 200) e filtra pela divisão no cliente. Aplicar modelo = `reiniciarForm(formDeModeloProposta(modelo, perfil))`. `?modelo=<id>` na URL pré-seleciona divisão e modelo (atalho "Usar este modelo"). Confirmação quando o formulário foi alterado ou veio de "Criar cópia".
- **Rationale**: Volume pequeno; evita uma consulta a cada troca de divisão.

## R7 — Nomenclatura

- **Decision**: O campo de divisão da nova proposta e o filtro/coluna da lista passam a se chamar "Divisão"; "Modelo" passa a designar o modelo de proposta.
- **Rationale**: Premissa da spec, evita ambiguidade.
