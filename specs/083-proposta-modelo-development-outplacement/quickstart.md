# Quickstart: validar a feature 083

## Pré-requisitos

- `docker compose up -d` (API em `http://localhost:8001`, PostgreSQL em 5433).
- Frontend do Proposal: `cd frontend && npm run dev` (porta 5193).
- Usuário com acesso ao Proposal (ex.: `admin`).
- Antes de subir a versão nova, ter (se possível) uma proposta Executive Search **pendente em dólar** e uma **assinada**, para validar a migração.

## 1. Build e tipos

```bash
cd frontend && npm run type-check && npm run build
```

Esperado: sem erros.

## 2. Migração (US7, FR-019, FR-029, FR-033, FR-034)

1. Reiniciar o backend (`docker compose restart backend` ou equivalente) e conferir nos logs que não há "Falha ao migrar".
2. No banco: `SELECT id, modelo, modelo_versao, idioma, moeda, validade_dias, garantia_texto, shortlist, jsonb_array_length(projetos) FROM propostas WHERE modelo <> 'simples';`
   - Pendentes ES: `modelo_versao = 3`, `projetos` com 1 item, `garantia_texto` "N months" (USD) ou "N meses" (BRL), `shortlist`/`sla` padrão do idioma, `projeto_nome`/`investimentos`/`garantia_meses` nulos.
   - Assinadas/canceladas: versão e colunas antigas inalteradas; `idioma` preenchido.
3. Abrir a pendente e a assinada pelo link: a assinada abre igual a antes; a pendente aceita assinatura (hash válido).

## 3. API (script Python com `requests`)

Usar o corpo de [contracts/api-proposal.md](./contracts/api-proposal.md) e conferir:

| Caso | Esperado |
|---|---|
| POST D&O com 2 projetos | 201; `projetos_total = 2`; `validade = data + 30` |
| POST com 11 projetos | 422 "Inclua de 1 a 10 projetos" |
| POST com projeto sem nome | 422 "Informe o nome do projeto 2" |
| POST com Retainer repetido no mesmo projeto | 422 tipo repetido |
| POST com Retainer em dois projetos | 201 |
| POST `validade_dias = 0` ou `366` | 422 "Validade deve ser de 1 a 365 dias" |
| POST data 60 dias atrás + 30 dias | 422 "A validade calculada já passou…" |
| POST `idioma = "fr-FR"` | 422 "Idioma inválido" |
| POST Shortlist com 256 caracteres | 422 |
| PUT trocando idioma | 422 "O idioma da proposta não pode ser alterado" |
| PUT removendo o projeto 2 e mudando a garantia | 200, `alterada: true`; histórico com `projeto.2` (novo `null`) e `garantia_texto` |
| PUT sem mudanças | `alterada: false` |
| GET público | `idioma`, `projetos`, `shortlist`, `sla`, `garantia` presentes |

## 4. Navegador — página Development & Outplacement (US1, US2, US3)

1. **Nova proposta** → Modelo **Development & Outplacement**; preencher os dados de exemplo do HTML (2 projetos, Garantia "4 meses", 30 dias). Trocar para Executive Search e voltar: os dados continuam.
2. Abrir o link em janela anônima e comparar lado a lado com `Proposta_Comercial_Development_Outplacement.html`: capa com logo D&O, menu, lead, 3 cartões, investimento com 2 blocos, subtítulo "sobre a remuneração anual" só nas taxas %, Observações da divisão, Garantias sem Observações, validade, contato e rodapé.
3. Celular (DevTools 390px): cartões empilhados, sem rolagem horizontal.
4. **Baixar PDF**: sem menu e botões; nome "Proposta Comercial Ocean - Arxen".
5. Aceitar: nome, e-mail, declaração → "Aceite registrado…" e indicação de assinada após recarregar.

## 5. Idioma e moeda (US4)

Criar 4 propostas (pt+BRL, pt+USD, en+BRL, en+USD) com Valor fechado 50.000,50 e conferir na página: "R$ 50.000,50", "US$ 50.000,50", "R$ 50,000.50", "US$ 50,000.50"; datas "dd/mm/aaaa" em português e "Month D, YYYY" em inglês; textos fixos no idioma escolhido. Na edição, idioma e moeda desabilitados.

## 6. Garantias e condições (US5)

- D&O com Shortlist apagado → só SLA e Garantia; com os três vazios → seção e link somem.
- ES com os três vazios → seção e link aparecem só com as Observações.
- Nova proposta: trocar para Inglês com Shortlist/SLA padrão → textos passam para inglês; alterar o Shortlist e trocar de novo → texto alterado é mantido.

## 7. Validade em dias (US6)

Data 24/10/2026 + 30 dias → "Válida até 23/11/2026" no formulário, no detalhe e na página; mudar a Data para 25/10/2026 → 24/11/2026. **Criar cópia** → Data de hoje e 30 dias.

## 8. Lista e detalhe

Lista mostra "Development & Outplacement", "Português · Real" e "Posição 1 + 1". Detalhe mostra os blocos por projeto, Condições e o histórico legível.
