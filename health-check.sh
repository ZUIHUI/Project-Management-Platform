#!/usr/bin/env bash
set -euo pipefail

api_url="${1:-http://localhost:3000}"
web_url="${2:-http://localhost:5173}"

curl --fail --silent --show-error "$api_url/api/v1/health/ready" >/dev/null
curl --fail --silent --show-error "$api_url/api/v1/openapi.yaml" >/dev/null
curl --fail --silent --show-error "$web_url" >/dev/null

echo "Health checks passed."
