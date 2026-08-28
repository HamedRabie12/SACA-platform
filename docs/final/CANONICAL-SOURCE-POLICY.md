# Canonical Source Policy

SACA has one runtime application: the repository root application.

The following are never runtime sources:
- `archive/`
- historical SQLite databases
- source snapshots
- old build outputs
- legacy/experimental copies

All feature development must target the canonical repository root only.
Archives are read-only recovery/migration sources and must never be restored automatically during startup or deployment.
