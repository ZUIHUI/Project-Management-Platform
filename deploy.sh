#!/usr/bin/env bash
set -euo pipefail

platform="${1:-vercel}"

case "$platform" in
  vercel)
    command -v vercel >/dev/null || { echo "Install the Vercel CLI first." >&2; exit 1; }
    echo "Database migrations must be applied by the release pipeline before this command."
    vercel --prod
    ;;
  docker)
    command -v docker >/dev/null || { echo "Docker is required." >&2; exit 1; }
    docker compose up --build -d
    ;;
  *)
    echo "Usage: ./deploy.sh [vercel|docker]" >&2
    exit 1
    ;;
esac
