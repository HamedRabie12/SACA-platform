#!/usr/bin/env bash
set -euo pipefail
ARCHIVE="${1:-repo.tar}"
TARGET="${2:-.}"
if [[ ! -f "$ARCHIVE" ]]; then echo "Archive not found: $ARCHIVE" >&2; exit 1; fi
mkdir -p "$TARGET"
tar -xf "$ARCHIVE" -C "$TARGET"
echo "Source restored from $ARCHIVE"
