# Research: Contas a Pagar — Cadastro de Nova Categoria

**Feature**: `032-cadastro-categoria-pagar` | **Date**: 2026-08-17  
**Spec**: [spec.md](./spec.md)

## 1. Onde persistir categorias cadastradas

**Decision**: Tabela PostgreSQL `categorias_pagar_cadastradas` (modelo SQLAlchemy + `CREATE TABLE IF NOT EXISTS` em `main.py`, padrão do projeto). Cada linha tem `id`, `codigo` estável `cat_{id}`, `nome` (rótulo gravado após trim), `criado_em`.

**Rationale**: O cadastro precisa existir **antes** de salvar a conta (seleção automática no formulário aberto). Inferir categorias só a partir de `contas_pagar.categoria` não atende. JSON em configuração ou lista hardcoded não escala nem impõe unicidade no banco. Código `cat_{id}` evita colisão com slugs oficiais (`marketing`, `salario`, etc.).

**Alternatives considered**:
- Só gravar o nome livre em `contas_pagar.categoria` sem catálogo — quebra filtro, import e cadastro sem lançamento.
- Slug derivado do nome (`frota`) — risco de colidir com códigos oficiais/subcategorias; exige regras extras.
- Tabela genérica de taxonomia incluindo oficiais — fora do escopo; oficiais continuam no módulo `categorias_contas.py`.

## 2. Fonte única de catálogo (oficial + cadastrada)

**Decision**: Estender `categorias_contas.py` com funções que recebem `Session`: `listar_catalogo(db)`, `validar_nome_nova`, `criar_cadastrada`, `validar_classificacao(..., db)`, `resolver_import_categoria(..., db)`, `label_categoria(..., db)`. Oficiais permanecem constantes; cadastradas vêm da tabela.

**Rationale**: POST/PUT/import e relatório já passam por esse módulo. O frontend deixa de duplicar `CATEGORIAS_OPCOES` e passa a consumir `GET /api/contas/categorias`.

**Alternatives considered**: Validar só no frontend — inaceitável (import e visualizador). Segundo serviço paralelo — duplicaria regras de RH/legado.

## 3. Contrato REST

**Decision**: Sob o prefixo existente `/api/contas`:
- `GET /api/contas/categorias` — autenticado (admin e visualizador); oficiais na ordem vigente + cadastradas alfabéticas.
- `POST /api/contas/categorias` — só `admin`; body `{ "nome": "..." }`; **201** com a categoria criada.

Rotas estáticas **antes** de `/{id}`. Sem PATCH/DELETE nesta entrega.

**Rationale**: Cadastro no contexto de Contas a Pagar; mesmo JWT/`require_admin` das demais escritas do módulo. Espelha o padrão de `contas-correntes` (cadastro + código estável), sem menu novo.

**Alternatives considered**: `/api/categorias-pagar` isolado — mais uma superfície sem ganho. Prompt só no cliente sem POST — não persiste para outros usuários nem para import.

## 4. Validação de nome

**Decision** (servidor é a fonte da verdade; UI espelha):
1. Trim nas pontas; vazio → 422.
2. Comprimento ≤ 20 no texto já aparado → 422 se maior.
3. Regex permitida: letras Unicode (incluindo acentos), dígitos, espaço, hífen `-` e barra `/`. Recusar `_`, pontuação, emoji.
4. Unicidade **case-insensitive** contra: labels oficiais, nomes já cadastrados, labels das subcategorias oficiais de RH (incluindo Benefícios legado na lista de subs se ainda existir no código).
5. Reservar códigos oficiais e de subcategoria: se `normalizar_codigo(nome)` coincidir com código reservado, recusar (além da comparação de label).

Índice único funcional `LOWER(nome)` na tabela.

**Rationale**: Fecha FR-005/FR-006 e evita `cat_N` vs slug ambíguo. Underscore não está na spec.

**Alternatives considered**: Unicidade só no cliente; normalização NFD de acentos (“Salario” vs “Salário”) — a spec pede case-insensitive, não folding de acento; “Salario” pode ser recusado pelo código reservado `salario`.

## 5. UI no campo Categorias

**Decision**: No `<select>` de criar/editar (admin), após as opções oficiais + cadastradas, uma opção sentinela **“Nova categoria…”**. Ao escolhê-la, o formulário mostra campo de nome + confirmar/cancelar (não `window.prompt`). Sucesso: toast, recarrega catálogo, **seleciona** `codigo` novo, esconde o extra. Cancelar: volta à categoria anterior. Visualizador: select sem a sentinela. Listagem: sem botão avulso de cadastro. Filtro: mesmas opções sem a sentinela.

**Rationale**: Spec (clarify Q1/Q2): só a partir do campo; seleção automática. Modal enorme seria outra tela; sentinela no select é o menor desvio do padrão atual.

**Alternatives considered**: `prompt()` — ruim para validação. Botão na listagem — fora do escopo.

## 6. Importação, relatório e telas irmãs

**Decision**:
- Import (API + mapeamento na UI): resolver categoria cadastrada por `codigo` ou por nome com a mesma tolerância das oficiais (trim + case-insensitive), alinhado a FR-008. Linha inexistente continua erro.
- `custo-por-categoria`: `label_categoria` consulta o catálogo (DB); o Dashboard já usa `c.label` e cores de fallback para códigos novos.
- Impostos / Retiradas: **não** alterar filtros (`impostos`, RH + `retirada_socios`).
- Sem UPDATE em massa em `contas_pagar`.

**Rationale**: Relatório já devolve `label`; fatia identificável sem mapa fixo no Dashboard. Recortes de Impostos/Retiradas são por código oficial.

**Alternatives considered**: Inferir categoria na importação pela descrição para nomes novos — fora da spec (só aceitar cadastradas vigentes).

## 7. Auditoria e papéis

**Decision**: `POST` de categoria chama `registrar_auditoria` (ação de criação). `visualizador` recebe 403 no POST; GET liberado para montar filtro/consulta.

**Rationale**: Domínio financeiro interno e padrão das rotas de Contas.

## Conclusão

Não restam `[NEEDS CLARIFICATION]` de contexto técnico. Oficiais continuam no código; cadastradas na tabela; API de catálogo; UI só no select do formulário.
