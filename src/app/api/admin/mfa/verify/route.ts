import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSessionFromRequest } from "@/lib/security/admin-session";
import { sameOriginMutationAllowed } from "@/lib/security/admin-authorization";
import { verifyAdminMfa } from "@/lib/security/admin-mfa";
import { rateLimit } from "@/lib/security/rate-limit";

// POST /api/admin/mfa/verify
// Auth + same-origin + rate-limit + DB-state-update for mfaVerifiedAt.
// The cookie does not need to be re-issued: the authoritative verifier
// re-derives mfaVerified from AdminSession.mfaVerifiedAt on every request.
export async function POST(req: NextRequest) {
  const rl = await rateLimit(`admin-mfa-verify:${req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"}`, 5, 300);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many MFA verification attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } });
  }
  if (!sameOriginMutationAllowed(req)) {
    return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
  }
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.mfaVerified) {
    // Idempotent: re-verifying an already-verified session is a no-op.
    return NextResponse.json({ ok: true, mfaVerified: true });
  }
  const body = await req.json().catch(() => ({}));
  const code = String(body?.code ?? "").replace(/\D/g, "");
  if (!/^\d{6}$/.test(code)) return NextResponse.json({ error: "Invalid MFA code" }, { status: 400 });
  const ok = await verifyAdminMfa(session.sub, code);
  if (!ok) return NextResponse.json({ error: "Invalid MFA code" }, { status: 401 });
  const stored = await db.adminSession.findUnique({ where: { sessionId: session.sid } });
  if (!stored || stored.revokedAt) return NextResponse.json({ error: "Session unavailable" }, { status: 401 });
  await db.adminSession.update({ where: { id: stored.id }, data: { mfaVerifiedAt: new Date() } });
  return NextResponse.json({ ok: true, mfaVerified: true });
}
