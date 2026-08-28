# SACA 3.0 — Canonical Community Platform

This repository is the canonical SACA application source.

## Data architecture

- Production database: PostgreSQL only.
- Prisma: ORM, schema, migrations, generated client.
- SQLite: archived under `archive/sqlite/` only for migration/recovery reference; it is not used by the application runtime.

## Security

- Admin sessions: signed HttpOnly cookies.
- Member sessions: DB-backed HttpOnly cookies.
- No hardcoded admin password/token is used by runtime source.
- Admin APIs require server-side session verification.

## Governance

The repository contains the governance/constitution foundation and the official SACA corporate legal-record PDF.

## Meetings

The source includes LiveKit server token issuance and a real-participant React room UI. Runtime credentials are required; absence of credentials must produce a truthful "not configured" state rather than fake participants.

## Verification status

Static and preflight validation pass in the build environment. Full dependency installation, Prisma generation/validation, PostgreSQL migration execution, browser tests, external integrations and production deployment still require a network-enabled CI/staging environment.

See:
- `docs/final/DELIVERY-MANIFEST.md`
- `docs/final/PRODUCTION-CERTIFICATION.md`
- `docs/final/CANONICAL-SOURCE-POLICY.md`

## Administrative provisioning

Run `npm run db:provision-admin` after seeding roles. Current command-center endpoints are national-scope.
