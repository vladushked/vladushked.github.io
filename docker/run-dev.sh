#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="vladushked-site-dev"
CONTAINER_NAME="vladushked-site-dev"

docker build -t "$IMAGE_NAME" -f docker/Dockerfile .

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  docker rm -f "$CONTAINER_NAME" >/dev/null
fi

docker run --rm -it \
  --name "$CONTAINER_NAME" \
  -p 3000:3000 \
  -v "$(pwd):/app" \
  -v /app/node_modules \
  "$IMAGE_NAME"
