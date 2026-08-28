#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCHEMA="$ROOT/prisma/schema.prisma"
PACKAGE="$ROOT/package.json"
DB="$ROOT/src/lib/db.ts"

if ! grep -Eq 'provider[[:space:]]*=[[:space:]]*"postgresql"' "$SCHEMA"; then
  echo "schema provider is not postgresql" >&2; exit 1
fi
if grep -Eq 'provider[[:space:]]*=[[:space:]]*"sqlite"' "$SCHEMA"; then
  echo "sqlite provider still present" >&2; exit 1
fi
if grep -RInE 'prisma[[:space:]]+db[[:space:]]+push|--accept-data-loss|file:.*custom\.db' "$ROOT/src" "$PACKAGE" >/dev/null; then
  echo "unsafe/legacy database runtime command detected" >&2; exit 1
fi
grep -Eq '"db:migrate:deploy"[[:space:]]*:' "$PACKAGE"
grep -Eq 'PrismaPg' "$DB"
grep -Eq 'DATABASE_URL' "$DB"
echo "postgres database contract tests passed"
