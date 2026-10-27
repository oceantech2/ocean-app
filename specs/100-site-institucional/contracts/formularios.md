# Contrato: formulários do site

Nenhum dos dois formulários envia, grava ou registra dados (FR-009). Ao enviar com sucesso: confirmação, campos limpos.

## Contato (Home, seção `#contato`)

| Campo | Rótulo | Placeholder | Regra | Mensagem de erro |
|-------|--------|-------------|-------|------------------|
| `nome` | Nome completo * | Seu nome completo | 2–120 caracteres (sem espaços nas pontas) | Informe seu nome |
| `email` | E-mail * | voce@email.com | E-mail válido, até 180 | E-mail inválido |
| `telefone` | Telefone * | (11) 99999-9999 | 8–40 caracteres | Informe um telefone válido / Telefone muito longo |
| `linkedin` | LinkedIn | linkedin.com/in/seu-perfil | Opcional, até 200 | — |
| `cargo` | Cargo * | Seu cargo | 1–120 | Informe seu cargo |
| `empresa` | Empresa * | Nome da empresa | 1–160 | Informe sua empresa |
| `tipo` | Sou... * | Selecione uma opção | Empresa buscando contratar · Profissional em busca de oportunidades · Outro | Selecione uma opção |
| `mensagem` | Mensagem | Como podemos ajudar? | Opcional, até 2000 | — |

- Botão: **Enviar mensagem**
- Confirmação: **Mensagem recebida. Um consultor da Ocean entrará em contato em até 1 dia útil.**

## Tenho interesse (Vagas, modal)

Cabeçalho do modal: título da vaga e "área · nível · local".

| Campo | Rótulo | Placeholder | Regra | Mensagem de erro |
|-------|--------|-------------|-------|------------------|
| `nome` | Nome | — | 2–120 | Informe seu nome |
| `email` | E-mail | — | E-mail válido, até 180 | E-mail inválido |
| `linkedin` | LinkedIn | https://linkedin.com/in/seuperfil | Endereço web válido (`http://` ou `https://`), até 200 | URL inválida |
| `mensagem` | Mensagem (opcional) | — | Opcional, até 1000 | — |

- Botão: **Enviar interesse**
- Confirmação: **Interesse registrado. Em breve retornaremos.**
- O modal fecha com o envio, com Esc, clicando fora ou no botão de fechar; fechar sem enviar descarta o que foi digitado.
