# SACA 3.0 — Administrative Authority Model

## Canonical rule

Administrative access is granted only through a database-provisioned `UserRole` assignment. The login route authenticates the configured bootstrap credential, but a session is not created unless the matching user exists and has an active role assignment.

## Scope

Current `/api/admin/*` command-center endpoints are `NATIONAL` scope. A state/chapter administrator must not be granted access to these national endpoints until dedicated scoped endpoints and resource-level filters are implemented and tested.

## Provisioning

Run in a trusted database environment after PostgreSQL is configured:

```bash
npm run db:provision-admin
```

Required environment variables:

- `ADMIN_USERNAME` — administrator email.
- `ADMIN_ROLE` — one of the seeded role codes.
- `ADMIN_SCOPE_TYPE` — currently `NATIONAL` for the command-center endpoints.
- `ADMIN_SCOPE_ID` — optional for future scoped administration.

The command provisions/rotates the user role assignment and does not create a second authentication system.

## Security rule

A database failure must never cause privilege escalation. If the user, role, or permission cannot be verified, the request is denied.
