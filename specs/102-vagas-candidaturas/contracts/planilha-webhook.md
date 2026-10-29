# Contrato: envio à planilha "Formulário de candidatura em vaga"

Web App do Google Apps Script mantido pela Ocean. Configuração no servidor:

- `SHEETS_WEBHOOK_URL` — endereço `https://script.google.com/macros/s/.../exec`
- `SHEETS_WEBHOOK_SECRET` — igual ao `WEBHOOK_SECRET` do Apps Script

## Requisição

`POST {SHEETS_WEBHOOK_URL}`, `Content-Type: application/json`, seguindo redirecionamentos (o Apps Script responde 302).

```json
{
  "secret": "<SHEETS_WEBHOOK_SECRET>",
  "externalId": "123",
  "nome": "Maria Silva",
  "email": "maria@exemplo.com",
  "vagaId": "V0005",
  "vaga": "CFO",
  "cliente": "Cliente X",
  "consentimento": true,
  "telefone": "(21) 99999-0000",
  "linkedin": "https://linkedin.com/in/maria",
  "localizacao": "Rio de Janeiro / RJ",
  "cargoAtual": "Diretora Financeira",
  "empresaAtual": "Empresa Y",
  "formacao": "Economia — UFRJ",
  "experiencia": "15 anos em finanças...",
  "ingles": "Fluente",
  "outrosIdiomas": "Espanhol",
  "pretensaoMin": 40000,
  "pretensaoMax": 50000,
  "disponibilidade": "30 dias",
  "mobilidade": "Sim",
  "linkCv": "https://consultantpanel.oceantalentsolutions.com/candidaturas/123/curriculo"
}
```

Regras:

- `vagaId` só quando a vaga tem `codigo_planilha`; sem ele, envia `vaga` (título) e `cliente`.
- Opcionais vazios são omitidos.
- `ingles`, `disponibilidade` e `mobilidade` vão com o rótulo em português.
- Timeout de 30 s.

## Resposta

```json
{ "ok": true, "idCandidatura": "C0042", "idPessoa": "P0010", "pessoaNova": false, "duplicado": false }
```

- `ok: true` (inclusive `duplicado: true`) → enviada.
- `ok: false` → pendente, `planilha_erro` = `"Planilha recusou: <error>"`.
- HTTP ≥ 400, resposta não-JSON ou falha de rede → pendente com a mensagem correspondente.
