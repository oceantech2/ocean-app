# Quickstart: Modelos de proposta

## Pré-requisitos

- `docker compose up -d` (backend 8001, Postgres 5433) e `cd frontend && npm run dev` (5193)
- Um usuário admin e um não admin com acesso ao Proposal
- Proposal em `http://proposal.localhost:5193` (ou `consultantpanel.localhost:5193` após a feature 099)

## Validações estáticas

```bash
cd frontend && npx tsc --noEmit
cd backend && python -m py_compile app/api/routes/proposal_modelos.py app/services/proposta_modelos.py app/models/__init__.py
```

## Roteiro manual

1. **Admin cria modelo (US2)**: aba Modelos → Novo modelo → divisão Development & Outplacement, nome "Mapeamento", 1 projeto com Valor fechado e entrada 100% → Salvar. Esperado: modelo na lista; Auditoria do ERP mostra "criar — ModeloProposta".
2. **Nome repetido**: criar outro "mapeamento" na mesma divisão → erro "Já existe um modelo com esse nome nesta divisão".
3. **Não admin (US2/US3)**: entrar com consultor → aba Modelos lista e filtra, sem botões de criar/editar/excluir; `POST /api/proposal/modelos/` com o token dele → 403.
4. **Filtros (US3)**: filtrar por divisão e por trecho do nome; filtro sem resultado mostra "Nenhum modelo encontrado com esses filtros".
5. **Usar modelo (US1)**: Nova proposta → Divisão Development & Outplacement → seletor Modelo → "Mapeamento". Esperado: projetos, investimentos, escopo e garantias preenchidos; empresa vazia; data de hoje; consultor do perfil. Informar empresa e setor → Gerar proposta → sucesso na primeira tentativa.
6. **Confirmação**: digitar algo no formulário e trocar de modelo → confirmação; cancelar mantém o conteúdo.
7. **Troca de divisão**: com modelo aplicado, trocar a divisão → seletor volta para "Em branco" e lista os modelos da nova divisão.
8. **Usar este modelo**: abrir um modelo → "Usar este modelo" → nova proposta com divisão e modelo selecionados.
9. **Independência (FR-010)**: editar e excluir o modelo usado no passo 5 → a proposta gerada não muda.
