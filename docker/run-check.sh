#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: bash docker/run-check.sh <typecheck|build>" >&2
  exit 1
fi

case "$1" in
  typecheck)
    npm_args=(run typecheck)
    ;;
  build)
    npm_args=(run build)
    ;;
  *)
    echo "Unsupported check: $1" >&2
    echo "Allowed checks: typecheck, build" >&2
    exit 1
    ;;
esac

IMAGE_NAME="vladushked-site-dev"
CONTAINER_NAME="vladushked-site-dev"
NODE_MODULES_VOLUME="vladushked-site-node_modules"

docker build -t "$IMAGE_NAME" -f docker/Dockerfile .

if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  docker exec -it "$CONTAINER_NAME" npm "${npm_args[@]}"
  exit 0
fi

docker run --rm -it \
  -v "$(pwd):/app" \
  -v "${NODE_MODULES_VOLUME}:/app/node_modules" \
  "$IMAGE_NAME" \
  npm "${npm_args[@]}"
