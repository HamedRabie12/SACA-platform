# SACA 3.0 — Final Repaired Complete Handoff

This package is a canonical production candidate. It is not falsely labeled production-certified.

Key architecture:
- Next.js 16.3
- React 19
- Prisma 7.9.1
- PostgreSQL only at runtime
- Server-side signed/admin/member sessions
- Constitution/Governance/Membership/Election/Meeting/Service/Privacy/Security foundations

Static verification:
- Preflight PASS
- Static validation PASS
- Contract audit PASS
- PostgreSQL contract PASS
- Election security contract PASS

External verification is still required for PostgreSQL staging, dependencies/build, browser E2E, Vercel, LiveKit, Redis, object storage, provider integrations, backup/restore, penetration testing and independent election-security review.

Do not use SQLite as a production runtime database. Do not use `prisma db push` for production migrations. Do not add another parallel application implementation.
