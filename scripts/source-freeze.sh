#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUTDIR="${SACA_ARCHIVE_DIR:-${ROOT}/.source-snapshots}"
mkdir -p "$OUTDIR"
OUT="${OUTDIR}/SACA-SOURCE-${STAMP}.tar"

tar --exclude="./node_modules" --exclude="./.next" --exclude="./.git" --exclude="./db/custom.db-journal" --exclude="./archive/source-snapshots" --exclude="./repo.tar" --exclude="./SACA-SOURCE-*.tar" --exclude="./SACA-SOURCE-*.tar.sha256" -cf "$OUT" .
sha256sum "$OUT" > "${OUT}.sha256"
printf "Frozen source stored outside runtime archive: %s\n" "$OUT"
printf 'Frozen source: %s\n' "$OUT"
printf 'Checksum: %s\n' "${OUT}.sha256"
