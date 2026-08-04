#!/bin/sh
# Backup automático do PostgreSQL do Ocean App.
# Roda em loop dentro do container `backup`, gerando um dump por dia
# e mantendo os últimos N dias (rotação). Veja docker-compose.yml.

set -eu

PGHOST="${PGHOST:-postgres}"
PGUSER="${PGUSER:-ocean}"
PGDATABASE="${PGDATABASE:-ocean_db}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETENCAO_DIAS="${RETENCAO_DIAS:-14}"
# Intervalo entre backups em segundos (padrão: 24h)
INTERVALO="${INTERVALO:-86400}"

mkdir -p "$BACKUP_DIR"

echo "[backup] Serviço iniciado. Destino: $BACKUP_DIR | retenção: ${RETENCAO_DIAS} dias"

while true; do
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  ARQUIVO="$BACKUP_DIR/ocean_db_${TIMESTAMP}.sql.gz"

  echo "[backup] Gerando dump: $ARQUIVO"
  if pg_dump -h "$PGHOST" -U "$PGUSER" "$PGDATABASE" | gzip > "$ARQUIVO"; then
    echo "[backup] OK ($(du -h "$ARQUIVO" | cut -f1))"
  else
    echo "[backup] FALHOU ao gerar dump" >&2
    rm -f "$ARQUIVO"
  fi

  # Rotação: remove backups mais antigos que RETENCAO_DIAS
  find "$BACKUP_DIR" -name 'ocean_db_*.sql.gz' -type f -mtime "+${RETENCAO_DIAS}" -delete 2>/dev/null || true

  echo "[backup] Próximo backup em ${INTERVALO}s"
  sleep "$INTERVALO"
done
