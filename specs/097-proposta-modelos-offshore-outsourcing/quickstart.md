# Quickstart: validar os modelos Offshore Talent e Outsourcing

## Pré-requisitos

```bash
docker compose up -d
cd frontend && npm run dev   # porta 5193; Proposal em /proposal (ou domínio configurado)
```

## 1. Build

```bash
cd frontend && npm run type-check && npm run build
docker exec ocean_backend python -c "from app.services.proposta_modelos import MODELOS, SETORES; print(list(MODELOS), list(SETORES))"
```

Esperado: sem erros; `MODELOS` com `executive-search`, `offshore-talent`, `outsourcing`, `outplacement-development`; `SETORES` com 6 chaves, `tecnologia` antes de `industria-servicos`.

## 2. Criar as propostas (US1)

1. Proposal → **Nova proposta**: o seletor mostra Executive Search, Offshore Talent, Outsourcing, Development & Outplacement.
2. Escolher **Offshore Talent** e preencher os dados de exemplo (Arxen, 24/10/2026, Infraestrutura, Projeto 1 com Retainer 15%/40% entrada, Sucesso 18%, Valor fechado R$ 50.000/50%; Projeto 2 com Retainer 15%/40%; Garantia "4 meses"; 30 dias). Confirmar.
3. Repetir com **Outsourcing**.
4. Na lista, filtrar por cada modelo e conferir o nome no detalhe.

## 3. Página do cliente (US2)

Abrir cada link em janela anônima e comparar com o HTML de referência:

- Menu: "Offshore Talent · Áreas e cargos · Investimento · Garantias e condições · Contato" (Outsourcing: "Outsourcing · Benefícios · ...").
- Primeira seção com dois parágrafos; 5 itens numerados 01–05 na seção do meio (grade 3 + 2 no computador, empilhados no celular).
- Observações de Investimento: item único da remuneração anual/Retainer, mínimo R$ 15.000,00 e impostos do mês.
- Garantias e condições com a caixa de Observações (aparece mesmo apagando Shortlist, SLA e Garantia).
- Logo da divisão na capa; Baixar PDF sem cortes nos itens.
- Criar cópia em inglês e conferir o conteúdo traduzido.
- Aceitar e conferir status Assinada e o e-mail de aceite com o nome do modelo.

## 4. Setores e fotos (US3)

- O campo Setor mostra 6 opções, com Tecnologia na 5ª posição.
- Para cada modelo × setor (24 combinações), a capa mostra a foto do setor; Indústria & Serviços mostra a foto de Infraestrutura.
- Abrir uma proposta Executive Search antiga de Energia: a capa passa a mostrar a foto de Energia; textos e valores iguais.
