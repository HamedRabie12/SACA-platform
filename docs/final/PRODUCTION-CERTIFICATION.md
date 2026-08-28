# Production Certification

## Status
NOT CERTIFIED IN THIS ENVIRONMENT

### Why
The source has passed static architecture and contract checks, but production certification requires a networked staging environment with real PostgreSQL, deployed application dependencies, Vercel, LiveKit, Redis, object storage, messaging/payment providers, browser tests, backup/restore drills, and security review.

### Certification gates
- [x] Canonical runtime source established
- [x] PostgreSQL-only Prisma datasource
- [x] Legacy runtime copies removed
- [x] Admin session hardening
- [x] Member session hardening
- [x] Event registration uniqueness
- [x] Election two-person control foundation
- [x] Static contract validation
- [ ] Lockfile generated and deterministic `npm ci`
- [ ] Prisma generate/validate on staging
- [ ] PostgreSQL migration and data validation
- [ ] Full TypeScript/lint/build
- [ ] Browser E2E
- [ ] LiveKit production test
- [ ] Redis production test
- [ ] Private storage test
- [ ] Provider integrations test
- [ ] Backup/restore test
- [ ] Penetration test
- [ ] Independent election-security review
- [ ] Vercel production smoke test

Only after every required gate is PASS may the status change to PRODUCTION READY.
