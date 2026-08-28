# SACA 3.0 Archive Policy

The delivery package intentionally contains one canonical runtime/application source only.

Historical source snapshots and the former SQLite runtime database are not shipped in the final runtime package.
They must be retained separately by the project owner under controlled backup storage if required for recovery or historical audit.

Production database: PostgreSQL only.
Application ORM/schema/migration layer: Prisma only.
