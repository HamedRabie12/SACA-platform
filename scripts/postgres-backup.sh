#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is required}"
out_dir="${1:-backups/postgres}"
mkdir -p "$out_dir"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
file="$out_dir/saca-postgres-$timestamp.dump"
pg_dump --format=custom --no-owner --no-privileges "$DATABASE_URL" > "$file"
printf 'Backup created: %s\n' "$file"
