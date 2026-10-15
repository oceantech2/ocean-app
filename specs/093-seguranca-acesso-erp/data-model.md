# Data Model: Segurança de acesso ao ERP

Sem tabelas ou colunas novas. Mudanças de regra sobre entidades existentes:

## UsuarioApp (`usuarios_app`)

| Campo | Regra nova |
|-------|-----------|
| `usuario` | Gravado normalizado: `strip()` e, se contém `@`, minúsculas. A unicidade considera o valor normalizado. |
| `senha_pendente` | Vira `false` quando o admin define a senha em Configurações (criação ou edição), além do aceite do convite (já existente). |
| `acesso_erp` | Não pode ser ligado (resultado final `true`) enquanto `senha_pendente = true` sem uma senha na mesma operação → 400. |
| `papel`, `ativo`, `acesso_erp` | Lidos do banco a cada requisição do ERP (não do token). |

**Apto ao ERP** = existe ∧ `ativo` ∧ `acesso_erp` ∧ ¬`senha_pendente`.

### Transições de `senha_pendente`

```text
liberado como fornecedor (088) ──► true
true ──(aceite do convite no Proposal)──► false   [existente]
true ──(admin define senha em Configurações)──► false + convites invalidados   [novo]
```

## TokenAcesso (`tokens_acesso`, tipo `convite`)

- Invalidado (`invalidado_em = agora`) quando o admin define a senha do usuário.

## UsuarioAuth (`usuarios_auth`)

- Removido junto com o usuário (mesmo `usuario`) na exclusão.

## AuditLog (`audit_logs`)

- Novos registros com `entidade = "UsuarioApp"` para criar/editar/excluir em Configurações, sem conteúdo de senha.
