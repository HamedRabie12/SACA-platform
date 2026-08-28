# PostgreSQL Migration Policy

## Single source of truth

PostgreSQL is the only production database.

Prisma is the ORM, schema, migration, and type-safe database access layer. Prisma is not a second database.

SQLite has been moved out of the runtime path to `archive/sqlite/custom.db` and is retained only as a migration/archive artifact until the PostgreSQL dataset is verified.

## Required production flow

1. Set `DATABASE_URL` to the managed PostgreSQL runtime connection.
2. Set `DIRECT_URL` only when the provider requires a direct migration connection.
3. Generate Prisma client.
4. Validate the schema.
5. Run `prisma migrate deploy` in CI/CD.
6. Run post-migration integrity checks.
7. Run smoke tests.
8. Do not use `prisma db push` or reset commands in production.

## Data migration acceptance

The migration is not considered complete until table counts, critical record counts, foreign-key integrity, unique constraints, indexes, and application read/write paths are verified against staging PostgreSQL.
