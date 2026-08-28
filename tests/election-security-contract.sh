#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
route="$root/src/app/api/elections/[id]/vote/route.ts"
tally="$root/src/app/api/admin/elections/[id]/tally/route.ts"
cert="$root/src/app/api/admin/elections/[id]/certify/route.ts"
approve="$root/src/app/api/admin/elections/[id]/approve/route.ts"
for f in "$route" "$tally" "$cert" "$approve"; do test -f "$f" || { echo "Missing election security file: $f" >&2; exit 1; }; done
grep -q 'credentialUsedAt: null' "$route"
grep -q 'credentialUsedAt: new Date' "$route"
grep -q 'electionControlApproval' "$tally"
grep -q 'electionControlApproval' "$cert"
grep -q 'required: 2' "$approve"
printf '%s\n' 'election security contract tests passed'
