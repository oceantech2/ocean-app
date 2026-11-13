# Quickstart: validar o modelo por seção

## Pré-requisitos

- Infra no ar: `docker compose up -d` (API em 8001).
- Frontend: `cd frontend && npm run dev` (porta 5193); abrir o Proposal e entrar com uma conta de `usuarios_app`.
- Dois modelos da mesma divisão (ex.: Executive Search), cadastrados por um admin em **Modelos**, com conteúdos diferentes em todas as seções:
  - **A**: pt-BR/BRL, setor Energia, escopo "Escopo A", projeto "Projeto A", garantia "4 meses", validade 15 dias.
  - **B**: en-US/USD, setor Tecnologia, escopo "Escopo B", projeto "Projeto B", garantia "6 months", validade 30 dias.
  - **C** (opcional): sem setor, para o caso da seção Cliente.

## Verificação estática

```bash
cd frontend && npx tsc --noEmit
```

Esperado: sem erros.

## Roteiro

1. **Seletores visíveis (US1/AC1–2)**: Nova proposta → Divisão Executive Search. Conferir seletor no cabeçalho de Apresentação, Cliente, Escopo, Projetos, Garantias e condições e Validade; nenhum em Consultor. No seletor de Cliente, C não aparece.
2. **Aplicar só uma seção (US1/AC3, SC-002)**: seletor geral → A. Todos os seletores mostram A. Em Projetos, escolher B e confirmar. Só os projetos viram "Projeto B"; escopo, garantias, setor, idioma e validade continuam de A.
3. **Confirmação (US1/AC4–5)**: em Escopo, escolher B → aparece confirmação; cancelar → nada muda. Em Validade, escolher B → aplica direto (30 dias). Em Apresentação, escolher B → en-US/USD direto.
4. **Origem e restauração (US2)**: editar a garantia → seletor de Garantias passa a "Usar modelo…", os outros continuam. Escolher A em Garantias e confirmar → garantia volta a "4 meses" e o seletor mostra A. Apagar e redigitar exatamente "4 meses" → seletor mostra A de novo.
5. **Gerar (US1/AC6, SC-003)**: informar a empresa e gerar. Abrir a proposta: projetos de B, validade de B, demais seções de A.
6. **Bordas**: trocar a divisão → seletores listam modelos da nova divisão e mostram "Usar modelo…", conteúdo mantido. Criar cópia de uma proposta → seletores começam em "Usar modelo…". Editar uma proposta e abrir o cadastro de modelo → sem seletores de seção.
