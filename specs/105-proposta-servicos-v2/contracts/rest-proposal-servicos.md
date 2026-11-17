# Contract: REST / MCP — serviços na proposta

## Criar / editar proposta (`POST/PUT /api/proposal/propostas`)

Campos novos/alterados no body (modelo ≠ simples):

```json
{
  "modelo": "ocean",
  "servicos": ["recrutamento-e-selecao", "assessment"],
  "setor": "outros",
  "observacoes_investimento": ["Valor mínimo de R$ 15.000,00 por projeto;", "Impostos ({imposto}) serão adicionados a todos os valores informados."],
  "observacoes_garantias": ["..."],
  "cliente_nome": "...",
  "data_proposta": "2026-11-17",
  "idioma": "pt-BR",
  "moeda": "BRL",
  "projetos": [],
  "validade_dias": 30
}
```

### Regras

- `servicos`: array não vazio; cada id ∈ catálogo; ordem canônica do catálogo na persistência.
- `setor`: inclui `outros`.
- Se `servicos` ausente e `modelo` legado: servidor deriva `servicos` pelo mapa de migração (opcional na escrita; obrigatório expor na leitura).
- `{imposto}` pode permanecer literal no JSON; substituição na renderização com imposto vigente.

## Resposta de detalhe / pública

Inclui `servicos`, `observacoes_investimento`, `observacoes_garantias` além dos campos já existentes.

## MCP

- `criar_proposta` / `editar_proposta`: aceitam `servicos` (array) e `setor: outros`; `modelo` preferencialmente `ocean`.
- Documentação das tools atualiza enums.
