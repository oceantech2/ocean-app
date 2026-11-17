# Contrato: envio à planilha "Base de Relacionamento"

Web App do Google Apps Script mantido pela Ocean (cópia versionada: `backend/scripts/apps_script_webhook.gs`). Configuração no servidor:

- `SHEETS_WEBHOOK_URL` — endereço `https://script.google.com/macros/s/.../exec`
- `SHEETS_WEBHOOK_SECRET` — igual ao `WEBHOOK_SECRET` do Apps Script

## Requisição

`POST {SHEETS_WEBHOOK_URL}`, `Content-Type: application/json`, seguindo redirecionamentos (o Apps Script responde 302).

```json
{
  "secret": "<SHEETS_WEBHOOK_SECRET>",
  "tipo": "candidatura",
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
  "cargo2": "Gerente Financeira",
  "empresa2": "Empresa X",
  "cargo3": "Coordenadora de Controladoria",
  "empresa3": "Empresa W",
  "idade": 42,
  "nacionalidade": "Brasileira",
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

- `vaga` (título) e `cliente` sempre; `vagaId` quando a vaga tem `codigo_planilha`. A planilha usa título e cliente da aba Vagas quando acha o `vagaId` e os enviados quando não acha.
- Opcionais vazios são omitidos.
- `ingles`, `disponibilidade` e `mobilidade` vão com o rótulo em português.
- Timeout de 30 s.

## O que a planilha grava (a partir da Versão 4, 16/11/2026)

A candidatura **não** é mais gravada na aba Candidaturas (fica oculta, só como histórico).

1. **Pessoas** — uma linha por pessoa, encontrada por e-mail, e-mail 2 ou LinkedIn; se não existir, é criada. Pessoa nova recebe **Data de cadastro**. Em todo envio, a linha ganha **Última candidatura em** e **Última vaga candidatada**. Campos já preenchidos não são sobrescritos.
2. **Planilha da vaga (Mapeamento)** — quando a vaga tem planilha no **layout novo**, entra também uma linha com Status **"Job post"**. Motivos de não gravar nessa planilha (sem falhar o envio): vaga sem planilha / sem ID / sem link, Opt-out = Sim, layout antigo, ou pessoa já estava na planilha.

## Resposta

Sucesso (pessoa gravada/atualizada na Base):

```json
{
  "ok": true,
  "idCandidatura": "",
  "idPessoa": "P0010",
  "pessoaNova": false,
  "duplicado": false,
  "planilhaVaga": "gravado",
  "linhaPlanilhaVaga": 42
}
```

- `idCandidatura` — sempre `""` (a aba Candidaturas deixou de ser gravada).
- `planilhaVaga` — `"gravado"` ou o motivo de não ter gravado na planilha da vaga (ex.: vaga sem planilha, Opt-out, layout antigo).
- `linhaPlanilhaVaga` — número da linha no Mapeamento quando gravou (ou da linha existente se `duplicado`); senão `null`.
- `ok: true` (inclusive `duplicado: true`) → no painel a candidatura fica **enviada**.
- `ok: false` → **pendente**, `planilha_erro` = `"Planilha recusou: <error>"`. Em especial, se a planilha da vaga **não abrir**, a resposta continua `ok: false` (a pessoa pode já ter sido gravada na Base; o painel mostra pendente e permite o reenvio).
- HTTP ≥ 400, resposta não-JSON ou falha de rede → pendente com a mensagem correspondente.
