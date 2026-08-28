# Vercel + PostgreSQL Deployment

## Runtime architecture

Vercel hosts Next.js. PostgreSQL is the single primary data store. Prisma Client is the only application data-access layer.

Supporting services are optional and separate:

- Redis: rate limiting, distributed locks, cache, jobs.
- Object storage: media and private documents.
- LiveKit: real-time meetings.
- Email/SMS: verification and notifications.

## Environment isolation

Use separate Development, Preview/Staging, and Production environment variables. Never commit secrets.

Required core variables:

- `DATABASE_URL`
- `DIRECT_URL` when required by the database provider
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`

## Migration rule

Do not use database reset or destructive `db push` during Vercel deployment. Run validated migrations through CI/CD with `prisma migrate deploy`, then run smoke/health checks.
