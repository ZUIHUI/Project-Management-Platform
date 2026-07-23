#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL must be set to the target PostgreSQL database." >&2
  exit 1
fi

npm --workspace apps/api run db:generate
npm --workspace apps/api run db:migrate:deploy

if [[ "${1:-}" == "--seed-demo" ]]; then
  npm --workspace apps/api run db:seed
fi
