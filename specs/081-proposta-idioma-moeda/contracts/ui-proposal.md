# Contrato: Interface (alterações da 081)

## Formulário do modelo (`ModeloForm`)

- Novo campo **Moeda**, primeiro do formulário (logo abaixo do seletor "Modelo (divisão)" da `Nova.tsx`):
  - `<select>` com as opções "Real (R$) — apresentação em português" (`BRL`, padrão) e "Dólar (US$) — apresentação em inglês" (`USD`).
  - Texto de apoio: "Define a moeda dos valores e o idioma da página que o cliente recebe."
  - Na edição (`Editar.tsx`): `disabled`, com o texto "A moeda não pode ser alterada depois de criada."
- Alternador de cada quadro de investimento: `%` / `R$` ou `%` / `US$`, conforme a moeda. Trocar a moeda não apaga as taxas digitadas.
- Resumo lateral: taxas em valor com o prefixo da moeda, formatação brasileira (`US$ 50.000`).
- `FormModelo` ganha `moeda: Moeda`; `formModeloInicial` usa `BRL`; `formDeModelo(p)` copia `p.moeda ?? 'BRL'`. O payload envia `moeda`.

## Nova proposta (`Nova.tsx`)

- Proposta nova: moeda `BRL`.
- `?copiar={id}`: moeda da origem, editável.
- Tela "Proposta criada": sem mudança.

## Lista (`Lista.tsx`)

Coluna **Modelo**: "Executive Search" e, em linha menor abaixo, "Real · português" ou "Dólar · inglês". Propostas simples: "Proposta simples", sem segunda linha.

## Detalhe (`Detalhe.tsx`)

- Cabeçalho: "Executive Search · Dólar (inglês) · {projeto}" (ou "Real (português)").
- Cartões de investimento e histórico de edições: taxas em valor com o prefixo da moeda da proposta.

## Página do cliente (`ExecutiveSearchV1`)

- Recebe `dados.moeda`; `idioma = idiomaDaMoeda(dados.moeda ?? 'BRL')`; `t = textosES(idioma)`.
- Todo texto fixo vem de `t`; datas, taxas e garantia formatadas com o idioma e a moeda ([research.md](../research.md) R6).
- Markup, classes e CSS iguais aos atuais.
- `document.documentElement.lang` = `pt-BR` ou `en`; `document.title` = `t.pagina.titulo`; ambos restaurados ao desmontar.
- O setor continua só escolhendo a foto da capa (o nome do setor não é exibido ao cliente), então não entra no dicionário.
- WhatsApp: `t.whatsapp.mensagem(cliente)`. PDF: `t.pdf.nomeArquivo(cliente)`.
- Diálogo de aceite: textos, validações e mensagens de `t.aceite`.

## Página pública (`PropostaPublica.tsx`)

- Cancelada/expirada com `moeda = 'USD'`: moldura com "Commercial proposal" e mensagem de `textosIndisponivel('en-US')` (`i18n/indisponivel.ts`). Demais casos: como hoje.
- Fallback do `Suspense` da página do modelo: "Carregando proposta…" ou "Loading proposal…" conforme a moeda.
- Carregamento inicial, link inválido e erro de rede: sem mudança (português).
