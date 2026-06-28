#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/app/42chat"
COMPOSE_FILE="${REPO_DIR}/docker-compose.yml"

echo "[deploy] Iniciando deploy em $(date)"

cd "$REPO_DIR"

echo "[deploy] Atualizando código..."
git pull origin main

echo "[deploy] Baixando imagens atualizadas..."
docker compose pull

echo "[deploy] Reiniciando serviços..."
docker compose up -d --remove-orphans

echo "[deploy] Aguardando healthcheck do backend..."
sleep 5
curl -sf http://localhost/health || (echo "[deploy] ERRO: /health falhou" && exit 1)

echo "[deploy] Deploy concluído com sucesso em $(date)"
