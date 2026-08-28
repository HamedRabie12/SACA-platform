#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is required}"
backup="${1:?Usage: scripts/postgres-restore.sh <backup.dump>}"
[[ -f "$backup" ]] || { echo "Backup file not found: $backup" >&2; exit 1; }
case "${ALLOW_DESTRUCTIVE_RESTORE:-}" in
  YES) ;; 
  *) echo "Refusing destructive restore. Set ALLOW_DESTRUCTIVE_RESTORE=YES explicitly." >&2; exit 2;;
esac
pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$DATABASE_URL" "$backup"
printf 'Restore completed from: %s\n' "$backup"
