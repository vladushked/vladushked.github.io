#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -eq 0 ]; then
  echo "Usage: bash docker/run-npm.sh <npm-args...>" >&2
  exit 1
fi

IMAGE_NAME="vladushked-site-dev"
CONTAINER_NAME="vladushked-site-dev"
NODE_MODULES_VOLUME="vladushked-site-node_modules"

docker build -t "$IMAGE_NAME" -f docker/Dockerfile .

if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  docker exec -it "$CONTAINER_NAME" npm "$@"
  exit 0
fi

docker run --rm -it \
  -v "$(pwd):/app" \
  -v "${NODE_MODULES_VOLUME}:/app/node_modules" \
  "$IMAGE_NAME" \
  npm "$@"
