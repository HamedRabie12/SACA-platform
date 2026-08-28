# SACA 3.0 Production Closeout Plan

## Must pass in staging before release
1. PostgreSQL migration and data validation.
2. Prisma generate/validate.
3. Typecheck/lint/build.
4. Browser E2E.
5. RBAC/permission/scope tests for every admin API.
6. LiveKit room, participant, reconnect, screen-share and recording tests.
7. Object storage private upload/download tests.
8. Redis distributed rate-limit/queue tests.
9. Stripe/Resend/Twilio staging tests.
10. PostgreSQL backup + real restore drill.
11. Security penetration test.
12. Independent election-security review.

## Rules
- No feature is production-ready from static source inspection alone.
- No external integration is marked PASS until a real staging call succeeds.
- No production migration uses `prisma db push`.
- No production migration uses destructive flags.
- No deployment is approved when any CRITICAL/HIGH security issue remains.
