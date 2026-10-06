# Contrato: API pública (`/api/public/propostas/{codigo}`)

## GET — proposta por modelo pendente ou assinada

Formato novo (ES v3 e D&O v1):

```json
{
  "status": "aguardando",
  "pode_assinar": true,
  "modelo": "outplacement-development",
  "modelo_versao": 1,
  "idioma": "pt-BR",
  "moeda": "BRL",
  "cliente_nome": "Arxen",
  "data_proposta": "2026-10-24",
  "setor": "infraestrutura",
  "consultor": { "nome": "…", "cargo": "…", "telefone": "…", "telefone_digitos": "5521975540224", "email": "…" },
  "projeto_escopo": "<p>…</p>",
  "projetos": [ { "nome": "Posição 1", "investimentos": [ … ] } ],
  "shortlist": "3 a 5 candidatos",
  "sla": "5 a 10 dias úteis",
  "garantia": "4 meses",
  "validade": "2026-11-23",
  "versao": 1,
  "atualizada_em": null,
  "assinatura": null,
  "projeto_nome": null,
  "investimentos": null,
  "garantia_meses": null
}
```

Formato antigo (ES v1/v2 assinadas): como hoje (`projeto_nome`, `investimentos`, `garantia_meses`), com `projetos: null` e `idioma` preenchido (igual ao derivado da moeda).

## GET — cancelada ou expirada

```json
{ "status": "expirada", "pode_assinar": false, "mensagem": "…", "moeda": "USD", "idioma": "en-US" }
```

A página escolhe o texto pelo `idioma` (antes: pela moeda).

## POST `/assinar`

Sem mudança de contrato. O hash comparado é o do conteúdo canônico do formato da proposta ([data-model.md](../data-model.md) §5).
