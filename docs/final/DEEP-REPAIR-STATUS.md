# SACA 3.0 — Deep Repair Status

## Repairs completed in this pass

1. Replaced the outdated SQLite-specific database runtime test with a PostgreSQL contract test.
2. Fixed preflight/static validation so scripts scan the actual project root instead of the caller's arbitrary working directory.
3. Removed the stale privacy `.tmp` API file.
4. Consolidated content moderation into one canonical implementation (`content-policy.ts`).
5. Removed the unused `BallotCredential` domain model/table from the canonical schema and added migration `0004_integrity_cleanup`.
6. Added atomic ballot credential consumption (`credentialUsedAt`) to prevent concurrent/double ballot submission.
7. Added election candidate/position validation before accepting a ballot.
8. Bound ballot commitments to election ID and frozen ballot version.
9. Hardened reports so reporter identity is derived from the authenticated member session.
10. Hardened administrative notification targeting and audit logging.
11. Centralized the canonical role/permission matrix and made admin authorization consult the persisted Prisma role/permission data where available.
12. Expanded system permission seeding to cover the full canonical permission matrix.
13. Added automated `audit:contract` checks for PostgreSQL-only runtime, legacy secret patterns, admin-route authorization, duplicate/temp files, and required product routes.

## Verification limitations
`npm install` could not complete inside the constrained build environment before timeout, so a full `prisma generate`, `prisma validate`, TypeScript compilation, Next.js build, and browser E2E cannot honestly be reported as passed here. They remain explicit release gates for a networked/staging environment.

## This delivery gate
- Contract audit: PASS.
- PostgreSQL contract test: PASS.
- Preflight: PASS.
- Static validation: PASS.
- Temporary runtime files: 0.
- Canonical runtime copies under src: 0.
- Prisma model count: 123 after removing the unused duplicate BallotCredential domain.
- Live PostgreSQL execution, package installation, browser E2E, Vercel, LiveKit, Redis, object storage, payment/email/SMS provider calls remain external staging gates because the current environment has no installed dependency tree or provider credentials.
