# Quickstart: Imposto mensal nas propostas

## Pré-requisitos

```bash
docker compose up -d            # API 8001, Postgres 5433, Redis 6380
cd frontend && npm run dev      # ERP + Proposal na porta 5193
```

Após o boot do backend, confirmar a migração:

```sql
SELECT ano, mes, percentual FROM impostos_proposta;          -- 2026 | 10 | 18.75
SELECT column_name FROM information_schema.columns
 WHERE table_name = 'propostas' AND column_name = 'imposto_percentual';
```

## Cenários

1. **Cadastro (US1)** — ERP como `admin` → Configurações → "Imposto das propostas": Out/2026 aparece com 18,75%. Cadastrar Nov/2026 = 19,10% → aparece na lista. Alterar para 19,20% → continua um único registro. Tentar 0, 100 e vazio → erro, nada salvo. Auditoria mostra as ações. Como `visualizador`, `PUT /api/configuracoes/imposto-proposta` → 403.
2. **Proposta nova (US2)** — Proposal → Nova proposta (Executive Search, pt-BR): o resumo mostra "Imposto: 18,75% — Out/2026". Gerar e abrir o link público: Observações exibem "Impostos (até 18,75%) serão adicionados a todos os valores informados." Repetir em inglês: "Taxes (up to 18.75%)…". Repetir com Development & Outplacement.
3. **Fixação** — Alterar Out/2026 para 18,90% no ERP e reabrir a proposta do cenário 2 sem editar → continua 18,75%.
4. **Edição (US3)** — Editar a proposta do cenário 2: o formulário avisa que o imposto será atualizado de 18,75% para 18,90%; salvar → página mostra 18,90% e o histórico em Detalhe lista "Imposto: 18,75% → 18,90%".
5. **Legado (US3)** — Proposta antiga pendente (coluna nula) mostra 19,55%; ao editar, passa ao vigente e o histórico registra 19,55% → vigente. Proposta assinada antiga continua com 19,55% e o aceite/hash permanece válido.
6. **Fallback** — Em banco sem registros (`DELETE FROM impostos_proposta` em ambiente local), o resumo mostra 18,75% com aviso de "padrão"; com só um mês anterior cadastrado, mostra esse valor com aviso do mês de origem.

## Checks estáticos

```bash
cd frontend && npm run type-check && npm run build
cd backend && python -m py_compile app/main.py app/models/__init__.py app/schemas.py app/services/imposto_proposta.py app/services/propostas.py app/api/routes/configuracoes.py app/api/routes/proposal_propostas.py
```
