# Quickstart: validar a paginação do PDF da proposta

## Pré-requisitos

- `docker compose up -d` (backend na 8001) e `cd frontend && npm run dev` (5193)
- Chrome ou Edge instalado
- Propostas de teste no Proposal (`http://proposal.localhost:5193`):
  - **A**: Development & Outplacement, pt-BR, 3 projetos (um deles "Especialista Fiscal"), cada um com 2 ou 3 investimentos, com Escopo
  - **B**: Executive Search v3, en-US, 2 projetos, com Escopo longo (mais de uma página)
  - **C**: Executive Search v3, pt-BR, 1 projeto, sem Escopo (controle de nº de páginas)
  - **D**: uma proposta assinada em versão antiga (v1 ou v2), se houver

## Cenário 1: manual (navegador)

1. Abrir `http://proposal.localhost:5193/p/<codigo>` da proposta A e clicar em **Baixar PDF**
2. Na janela de impressão: destino "Salvar como PDF", papel A4, margens padrão
3. Conferir página a página no preview:
   - cada projeto (nome + cartões) inteiro numa página (FR-001, SC-001)
   - nenhum título de seção ou nome de projeto no fim de página sem conteúdo abaixo (FR-003, SC-002)
   - nenhum cartão, quadro de observações, linha de garantia ou cartão de contato cortado (FR-004, SC-003)
4. Repetir para B (Escopo maior que uma página divide entre itens, FR-005), C e D
5. Na tela (sem imprimir), conferir que a página está igual à de antes (FR-008, SC-005)

## Cenário 2: automatizado (Chrome headless)

```bash
chrome --headless=new --no-pdf-header-footer --virtual-time-budget=15000 \
  --print-to-pdf=proposta.pdf "http://proposal.localhost:5193/p/<codigo>"
```

Inspecionar o PDF por página (texto do início e do fim de cada página e imagem) e conferir as mesmas regras do cenário 1. Comparar o nº de páginas da proposta C antes e depois (SC-004: não pode aumentar).

## Cenário 3: build

```bash
cd frontend && npm run type-check && npm run build
```

Resultado esperado: sem erros.
