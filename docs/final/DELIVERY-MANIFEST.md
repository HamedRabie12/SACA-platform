# SACA 3.0 Final Delivery Manifest

## Canonical source
The repository root is the only runtime/application source shipped in this delivery.

## Database
PostgreSQL is the only production database contract. Prisma is the schema/ORM/migration layer. SQLite is not shipped as a runtime or archive database in this delivery package.

## Checks completed in this environment
- Contract audit: PASS
- PostgreSQL contract test: PASS
- Preflight: PASS
- Static validation: PASS
- Temporary/backup runtime files: none detected
- Legacy runtime copy folders under `src`: none detected

## External gates not honestly claimed as passed here
- npm dependency installation / lockfile generation
- Prisma generate / validate against real PostgreSQL
- PostgreSQL staging migration and data restore
- Next.js production build
- Browser E2E
- LiveKit production runtime
- Redis/Upstash runtime
- Object storage runtime
- Stripe / Resend / Twilio staging calls
- Backup/restore drill
- Independent election-security review
- Vercel staging deployment
