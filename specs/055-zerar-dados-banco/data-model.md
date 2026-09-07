# Data Model: Zerar Dados do Banco

**Feature**: `055-zerar-dados-banco` | **Date**: 2026-09-07

Este artefato descreve o **efeito** da operação sobre o modelo existente (não cria entidades novas de negócio).

## Entidades preservadas

### UsuarioApp (`usuarios_app`)

- Conta de login (username, hash, papel, permissões de menu)
- **Regra**: 100% das linhas permanecem intactas

### UsuarioAuth (`usuarios_auth`)

- Segredo TOTP / 2FA por usuário
- **Regra**: 100% das linhas permanecem intactas

### Colaborador — fornecedor puro (`colaboradores`)

- **Preservar quando**: `tipo = 'fornecedor'` **e** `elegivel_equipe = false`
- Inclui campos de cadastro (documento, dados bancários, tipo_fornecedor, etc.)

### HistoricoColaborador / DocumentoColaborador (vinculados a preservados)

- **Preservar quando**: `colaborador_id` ∈ conjunto de fornecedores puros preservados
- Arquivos em disco referenciados por esses documentos **permanecem**

## Entidades removidas (zerar)

| Entidade / tabela | Regra |
|-------------------|--------|
| `nfs` | DELETE all (Contas a Receber — origem manual e maggo, inclusive soft-deleted) |
| `bonus` | DELETE all |
| `ferias` | DELETE all |
| `contas_pagar` | DELETE all |
| `fluxo_movimentos` | DELETE all |
| `saldos` | DELETE all |
| `dhs` | DELETE all |
| `impostos` | DELETE all |
| `audit_logs` | DELETE all |
| `metas_financeiras` | DELETE all |
| `patrimonio` | DELETE all |
| `categorias_pagar_cadastradas` | DELETE all |
| `subcategorias_rh_cadastradas` | DELETE all |
| `contas_correntes` | DELETE all |
| `configuracao_app` | DELETE all; em seguida INSERT `maggo_stub_empty=true` (impede stub Maggo recriar Contas a Receber na listagem) |
| `historico_colaboradores` | DELETE onde colaborador **não** preservado |
| `documentos_colaborador` | DELETE onde colaborador **não** preservado (+ arquivo em disco) |
| `colaboradores` | DELETE onde **não** (tipo fornecedor ∧ ¬elegivel_equipe) |

## Ordem de exclusão (FK)

Ordem lógica (filhos → pais), dentro da mesma transação:

1. `bonus` (FK → `nfs`, `colaboradores`)
2. `nfs`, `ferias`, `contas_pagar`, `patrimonio`
3. `historico_colaboradores` / `documentos_colaborador` (não preservados)
4. Tabelas sem dependência de colaborador preservado: fluxo, saldos, dhs, impostos, audit, metas, categorias, subcategorias, contas_correntes, configuracao_app
5. `colaboradores` não preservados
6. Commit (inclui flag `maggo_stub_empty`)
7. Remoção de arquivos coletados (anexos NF, comprovantes, docs de equipe, bibliotecas soltas conforme contrato)

## Validação pós-operação

- `COUNT(*)` em `usuarios_app` / `usuarios_auth` = contagens pré-wipe
- `colaboradores`: só fornecedores puros; count = pré-wipe desse filtro
- Demais tabelas listadas em “removidas”: `COUNT(*) = 0` (exceto `configuracao_app` com 1 linha `maggo_stub_empty`)
- Sem reseeding automático no próximo start do backend (estrutura permanece vazia até seed explícito); stub Maggo não recria Contas a Receber enquanto a flag existir

## Estado / ciclo de vida da operação

```text
idle → confirmação pedida → (cancelado → idle, sem mudanças)
                         → executando (transação aberta)
                              → sucesso (commit + limpeza arquivos)
                              → falha (rollback, estado anterior)
```

Não há entidade persistida de “job de wipe”.
