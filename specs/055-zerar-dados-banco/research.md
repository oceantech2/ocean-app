# Research: Zerar Dados do Banco

**Feature**: `055-zerar-dados-banco` | **Date**: 2026-09-07

## 1. Forma de entrega da operação

**Decision**: Script Python administrativo `backend/scripts/zerar_dados.py`, executado no host ou via `docker compose exec` no serviço backend; confirmação por frase digitada; sem endpoint HTTP e sem UI.

**Rationale**: Spec exige operação pontual sem tela permanente. O repositório já tem `backend/scripts/` (ex.: `backup.sh`). Script com SQLAlchemy reutiliza models e settings do app.

**Alternatives considered**:
- Endpoint admin REST — rejeitado (FR-006 / clarify: sem exposição no produto)
- SQL puro em `psql` — possível, mas frágil para regra de fornecedores + anexos
- One-liner ad hoc não versionado — rejeitado (sem repetibilidade nem aceite)

## 2. Critério de preservação de fornecedores

**Decision**: Preservar linhas em `colaboradores` onde `tipo = 'fornecedor'` **e** `elegivel_equipe` é falso. Remover equipe (`elegivel_equipe = true`) e qualquer registro que não seja fornecedor puro. Preservar `historico_colaboradores` e `documentos_colaborador` **somente** dos IDs preservados.

**Rationale**: No Ocean, fornecedores e equipe compartilham a tabela; equipe é marcada por `elegivel_equipe`. Spec manda zerar colaboradores de equipe e manter fornecedores + docs/histórico deles.

**Alternatives considered**:
- Preservar todo `tipo='fornecedor'` inclusive equipe — rejeitado (contradiz limpeza de equipe)
- Soft-delete — rejeitado (pedido é zerar dados)

## 3. Escopo de tabelas a zerar

**Decision**: Truncate/delete completo em todas as tabelas de domínio exceto `usuarios_app`, `usuarios_auth` e o subconjunto de `colaboradores` (+ filhos permitidos) acima. Inclui: `nfs`, `bonus`, `ferias`, `contas_pagar`, `categorias_pagar_cadastradas`, `subcategorias_rh_cadastradas`, `contas_correntes`, `fluxo_movimentos`, `saldos`, `dhs`, `impostos`, `audit_logs`, `metas_financeiras`, `patrimonio`, `configuracao_app`, e filhos de colaboradores não preservados.

**Rationale**: Clarify Q2 — zerar também estrutura (categorias, contas, config).

**Alternatives considered**: Preservar estrutura — rejeitado na clarify.

## 4. Atomicidade (tudo ou nada)

**Decision**: Toda mutação de banco em **uma única transação** SQLAlchemy (`commit` só no fim; `rollback` em qualquer erro). Coletar paths de anexos **antes** do commit; apagar arquivos **somente após** commit bem-sucedido (best-effort). Falha de FS pós-commit → log de aviso, banco já consistente com o escopo; não reportar sucesso parcial do banco.

**Rationale**: Postgres garante SC-007/FR-009 no banco. Disco não participa de transação; ordem “DB primeiro, disco depois” evita paths quebrados se houver rollback.

**Alternatives considered**:
- Apagar disco antes do commit — rejeitado (rollback deixaria refs órfãs)
- Two-phase / volume snapshot — fora do escopo (simplicidade)

## 5. Confirmação do operador

**Decision**: Exigir digitação de uma frase fixa (ex.: `ZERAR DADOS OCEAN`) em stdin; flag `--yes` **não** basta sozinha sem a frase (ou exigir `--confirm=ZERAR DADOS OCEAN` para uso não interativo em CI/ops). Cancelamento (EOF / frase errada) → exit ≠ 0 e zero deletes.

**Rationale**: FR-005 / SC-004; operação destrutiva.

**Alternatives considered**: Só `--force` — rejeitado (muito fácil de acionar por engano).

## 6. Seeds de startup vs FR-011 (sem reseeding)

**Decision**: Remover/desligar inserção automática em todo boot de: conta corrente padrão (`corrente`), `seed_subcategorias_rh`, e insert de `paginas_visibilidade`. Extrair seed estrutural para script opcional `backend/scripts/seed_estrutura.py` (ou flag de ambiente explícita) para installs novos. **Não** alterar seed de usuários de login (permanece para garantir acesso).

**Rationale**: Hoje o startup **recria** estrutura após wipe, violando FR-011/clarify Q3. Seeds sob demanda mantêm first-install possível sem desfazer o wipe no próximo restart.

**Alternatives considered**:
- Aceitar reseeding no restart — rejeitado (viola spec)
- Flag `wipe_done` em `configuracao_app` — paradoxal (tabela de config é zerada)

## 7. Redis

**Decision**: Fora do escopo obrigatório do wipe (JWT em localStorage; Redis não é fonte dos dados de negócio listados na spec).

**Rationale**: Simplicidade; dados financeiros estão no Postgres + arquivos.

**Alternatives considered**: `FLUSHDB` — opcional no quickstart se houver cache residual, não requisito.

## 8. Backup

**Decision**: Não implementar backup no script (FR-012). Quickstart recomenda `backend/scripts/backup.sh` ou `pg_dump` **antes**, como responsabilidade do operador.

**Rationale**: Clarify Q5.
