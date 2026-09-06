# Quickstart: NF — Duplicidade entre Origens

**Feature**: `053-nf-duplicidade-origem` | **Date**: 2026-09-06  
**Contratos**: [REST](./contracts/rest-nf-duplicidade-origem.md) · [UI](./contracts/ui-nf-duplicidade-origem.md)

## Pré-requisitos

- Infra: `docker compose up -d` (API **8001**, Postgres **5433**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Login admin: `admin` / `123456`
- Página: Contas a Receber

## Cenários de validação

### 1. Create Manual × Maggo (conflito de origem)

1. Garantir NF Maggo com número conhecido `N` (ou criar Maggo via sync e preencher número se o fluxo do ambiente permitir).
2. Como admin, **Nova conta a receber** com o mesmo número `N`.
3. **Esperado**: bloqueio **409** `NF_NUMERO_ORIGEM_CONFLITO`; mensagem citando outra origem; CTA “Abrir existente” abre a NF Maggo; listagem sem segundo registro.

### 2. Create Manual × Manual (duplicidade mesma origem)

1. Criar NF Manual com número `M`.
2. Tentar criar outra Manual com `M`.
3. **Esperado**: **409** `NF_NUMERO_DUPLICADO`; atalho para a existente; sem segundo registro.

### 3. Edit Manual — número de outra origem

1. Duas NFs: Manual `A`, Maggo `B` (números distintos).
2. Editar Manual e mudar número para o de `B`.
3. **Esperado**: `NF_NUMERO_ORIGEM_CONFLITO`; dados anteriores da Manual preservados.

### 4. Edit Manual — próprio número / número livre

1. Editar Manual mantendo o número → sucesso.
2. Alterar para número ainda não usado → sucesso.

### 5. Import — só conflito Maggo

1. Arquivo com número que só existe em NF Maggo.
2. Importar **sem** `on_conflict`.
3. **Esperado**: **200** (não 422); linha em `erros` com `motivo: conflito_origem`; NF Maggo inalterada; nenhum insert Manual com esse número.

### 6. Import — conflito Manual + escolha

1. Arquivo com número já Manual.
2. Primeira chamada sem `on_conflict` → **422** `NF_IMPORT_ON_CONFLICT_REQUIRED`.
3. Reenviar `reject` → linha em `duplicado_cadastro`; NF inalterada.
4. Repetir com `update` → `atualizados >= 1`; ainda um único registro com aquele número.

### 7. Import — misto

1. Arquivo com: número livre, número Manual, número Maggo, número repetido no arquivo.
2. Com `on_conflict=update`: livre cria; Manual atualiza; Maggo → `conflito_origem`; repetido no arquivo → `duplicado_arquivo`.

### 8. Sync Maggo × Manual

1. NF Manual com `maggo_id` ou número que o stub Maggo tentaria gravar (conforme ambiente).
2. Disparar sync (recarregar listagem Contas a Receber).
3. **Esperado**: Manual preservada; colisão refletida no diagnóstico de sync (`X-Ocean-Maggo-Ignorados` ou equivalente); **sem** toast dedicado de conflito.

### 9. Visualizador

1. Login `visualizador` / `123456`.
2. **Esperado**: sem create/edit/import; regra de duplicidade não altera permissões.

## Checks rápidos de código

```bash
cd frontend && npm run lint && npm run type-check
```

## Critério de aceite rápido

- [ ] Códigos 409 distintos para mesma origem vs origem diferente
- [ ] Import: 422 só para conflitos Manual; Maggo sempre `conflito_origem`
- [ ] UNIQUE / listagem: nunca dois registros com o mesmo número após os testes
- [ ] Sem tela histórica; sem toast de sync para colisão Maggo
