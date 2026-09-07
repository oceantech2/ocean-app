# Quickstart: Zerar Dados do Banco

**Feature**: `055-zerar-dados-banco`  
**Contrato**: [contracts/cli-zerar-dados.md](./contracts/cli-zerar-dados.md)  
**Modelo**: [data-model.md](./data-model.md)

## Pré-requisitos

- Stack sobe (`docker compose up -d`) — Postgres `5433`, API `8001`
- Operador com acesso ao container/backend
- **Backup recomendado (fora da feature)**: `backend/scripts/backup.sh` ou `pg_dump` antes de confirmar

## 1. Baseline (antes)

Registrar contagens (exemplo via `psql` / client):

- `usuarios_app`, `usuarios_auth`
- fornecedores puros: `colaboradores` com `tipo='fornecedor'` e `elegivel_equipe=false`
- amostra de tabelas a zerar: `nfs`, `contas_pagar`, `contas_correntes`, `configuracao_app`, etc.

Validar login no app (`http://localhost:5193`) e listagem de fornecedores.

## 2. Cancelamento (SC-004)

```bash
docker compose exec backend python scripts/zerar_dados.py
# digitar frase errada ou cancelar
```

**Esperado**: exit ≠ 0; contagens iguais ao baseline.

## 3. Execução

```bash
docker compose exec backend python scripts/zerar_dados.py --confirm="ZERAR DADOS OCEAN"
```

**Esperado**: exit `0`; resumo com usuários e fornecedores preservados.

## 4. Verificação pós-wipe

- Login com usuários existentes funciona (SC-001)
- Fornecedores puros ainda listados (SC-002)
- Módulos operacionais / categorias / contas correntes / config de páginas vazios (SC-003)
- Reiniciar backend (`docker compose restart backend`) e **confirmar** que estrutura **não** foi reseedada automaticamente (FR-011)
- Nenhuma ação “zerar dados” na UI (SC-005)

## 5. Seed estrutural (opcional, fora do wipe)

Se precisar recriar categorias/contas/config **depois**, usar o script explícito de seed estrutural (quando implementado), nunca como efeito colateral do wipe.

## 6. Falha tudo-ou-nada (SC-007)

```bash
docker compose exec backend python scripts/zerar_dados.py --confirm="ZERAR DADOS OCEAN" --fail-before-commit
```

**Esperado**: exit `2`; mensagem de rollback; contagens iguais ao baseline (nenhuma aplicação parcial).
