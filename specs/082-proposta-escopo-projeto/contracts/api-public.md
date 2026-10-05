# Contrato: API pública da proposta (alterações da 082)

Base: `{VITE_API_URL}/public/propostas`. Só as diferenças em relação a [081/contracts/api-public.md](../../081-proposta-idioma-moeda/contracts/api-public.md).

## GET `/{codigo}`

Proposta por modelo pendente ou assinada ganha:

```json
{
  "modelo_versao": 2,
  "projeto_escopo": "<p>Neste projeto, a Ocean irá:</p><ol><li>…</li></ol>"
}
```

- `projeto_escopo`: HTML canônico ([data-model.md](../data-model.md) §2) ou `null`.
- `modelo_versao` (já existente): `1` para propostas assinadas antes da feature (sem título da divisão e sem escopo); `2` para as demais.
- Respostas de proposta cancelada ou expirada continuam sem dados da proposta (sem `projeto_escopo`).
- Propostas simples: sem mudança.

## POST `/{codigo}/assinar`

Sem mudança de corpo nem de respostas. O hash do conteúdo passa a incluir `projeto_escopo` quando houver ([data-model.md](../data-model.md) §3), e a migração das pendentes para a v2 regrava o hash, de modo que propostas abertas antes do deploy continuam aceitáveis sem o aviso de versão desatualizada.
