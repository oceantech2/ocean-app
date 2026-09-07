# Contract: CLI — Zerar Dados Ocean

**Feature**: `055-zerar-dados-banco`  
**Tipo**: Interface de linha de comando (ops)  
**Artefato**: `backend/scripts/zerar_dados.py`

## Propósito

Executar limpeza pontual do banco e anexos associados, preservando login e fornecedores puros, sem expor a operação na UI/API do produto.

## Invocação

```bash
# Interativo (recomendado)
docker compose exec backend python scripts/zerar_dados.py

# Não interativo (ops/CI controlado)
docker compose exec backend python scripts/zerar_dados.py --confirm="ZERAR DADOS OCEAN"
```

Caminhos equivalentes no host (com `DATABASE_URL` e dirs de upload configurados) também são válidos.

## Entrada

| Parâmetro | Obrigatório | Descrição |
|-----------|-------------|-----------|
| Confirmação interativa | Sim (modo interativo) | Operador digita exatamente `ZERAR DADOS OCEAN` |
| `--confirm` | Sim (modo não interativo) | Mesma frase; valor diferente → aborta |
| Outros flags de “force” sem frase | Não permitidos como único gate | Devem falhar ou ser ignorados sem executar wipe |

## Comportamento

1. Conecta ao banco via settings do app (`DATABASE_URL`)
2. Conta/registra baseline: usuários, fornecedores puros, totais a zerar (log informativo)
3. Exige confirmação (stdin ou `--confirm`)
4. Em uma transação:
   - Coleta paths de arquivos a remover (registros que serão apagados)
   - Apaga dados conforme [data-model.md](../data-model.md)
5. `commit` → remove arquivos coletados (best-effort; falhas de FS viram warning)
6. Imprime resumo: preservados, removidos, exit code

## Códigos de saída

| Code | Significado |
|------|-------------|
| `0` | Limpeza do banco concluída com sucesso (arquivos: best-effort) |
| `1` | Confirmação ausente/inválida — nenhuma alteração |
| `2` | Erro de execução (rollback) — banco inalterado quanto ao escopo |
| `3` | Erro de configuração/conexão antes de mutar |

## Saída (stdout/stderr)

- Mensagens em português
- Em sucesso: contagens preservadas (usuários, fornecedores) e confirmação de tabelas zeradas
- Em falha: motivo claro; não imprimir “sucesso”

## Fora de contrato

- Nenhum endpoint REST `/api/...` para wipe
- Nenhuma tela/menu no frontend
- Não cria backup
- Não executa seed estrutural ao final

## Critérios de aceite do contrato

- Frase errada → exit `1`, counts iguais ao baseline
- Frase correta → exit `0`, só login + fornecedores puros (+ docs/histórico deles)
- Falha injetada no meio da transação → exit `2`, baseline intacto
