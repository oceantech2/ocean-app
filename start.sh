#!/bin/bash
set -e

echo "================================"
echo "  Ocean App — Iniciando..."
echo "================================"

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
  echo ""
  echo "ERRO: Docker não está rodando."
  echo "Abra o Docker Desktop e tente novamente."
  exit 1
fi

echo ""
echo "▶ Parando containers e removendo imagens antigas..."
docker compose down --rmi local --remove-orphans 2>/dev/null || true

echo ""
echo "▶ Construindo e subindo containers (sem cache)..."
docker compose build --no-cache
docker compose up -d

echo ""
echo "⏳ Aguardando o banco de dados ficar pronto..."
sleep 10

echo ""
echo "================================"
echo "  Ocean App está no ar!"
echo ""
echo "  Acesse: http://localhost:3000"
echo "  Usuário: admin"
echo "  Senha:   123456"
echo "================================"
echo ""
