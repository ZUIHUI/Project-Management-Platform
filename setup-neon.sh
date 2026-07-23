#!/usr/bin/env bash
set -euo pipefail

cat <<'EOF'
1. Create a PostgreSQL project in Neon and copy its pooled connection string.
2. Configure DATABASE_URL in the deployment environment.
3. Generate two different random values for JWT_SECRET and JWT_REFRESH_SECRET.
4. Apply migrations with ./setup-production-db.sh before deploying the app.

Generate a secret with:
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
EOF
