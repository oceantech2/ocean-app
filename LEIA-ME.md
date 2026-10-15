# Ocean App — Instruções de Instalação

## Pré-requisito

Instale o **Docker Desktop** (gratuito):
👉 https://www.docker.com/products/docker-desktop/

Após instalar, abra o Docker Desktop e aguarde ele iniciar completamente (ícone de baleia na barra de menu).

---

## Como rodar

### Opção 1 — Script automático (recomendado)

1. Abra o Terminal
2. Navegue até a pasta do projeto:
   ```
   cd caminho/para/ocean-app
   ```
3. Execute:
   ```
   chmod +x start.sh && ./start.sh
   ```
4. Aguarde a mensagem de confirmação
5. Abra o navegador em **http://localhost:3000**

### Opção 2 — Manual

```bash
docker compose up -d --build
```

Aguarde ~30 segundos e acesse **http://localhost:3000**

---

## Primeiro acesso

O sistema não tem usuário nem senha padrão. Em um banco vazio, crie o primeiro administrador:

```bash
docker exec -it ocean_backend python scripts/criar_admin.py <login>
```

---

## Para encerrar

```bash
docker compose down
```

---

## Portas utilizadas

| Serviço | Porta |
|---|---|
| Aplicação (frontend) | 3000 |
| API (backend) | 8001 |
| PostgreSQL | 5433 |
| Redis | 6380 |

> Se alguma porta estiver em uso, edite o arquivo `docker-compose.yml` e altere o número antes dos dois pontos.
