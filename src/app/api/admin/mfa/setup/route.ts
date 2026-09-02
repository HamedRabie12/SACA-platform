import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/security/admin-session";
import { sameOriginMutationAllowed } from "@/lib/security/admin-authorization";
import { setupAdminMfa } from "@/lib/security/admin-mfa";
import { rateLimit } from "@/lib/security/rate-limit";

// POST /api/admin/mfa/setup
// Auth + same-origin + role check (SUPER_ADMIN or SYSTEM_ADMIN) + rate-limit.
// Returns the freshly generated TOTP secret and otpauth URI exactly once
// for the caller to import into an authenticator app. The secret is never
// logged.
export async function POST(req: NextRequest) {
  const rl = await rateLimit(`admin-mfa-setup:${req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"}`, 5, 600);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many MFA setup attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } });
  }
  if (!sameOriginMutationAllowed(req)) {
    return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
  }
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "SUPER_ADMIN" && session.role !== "SYSTEM_ADMIN") {
    return NextResponse.json({ error: "Insufficient role" }, { status: 403 });
  }
  const result = await setupAdminMfa(session.sub);
  return NextResponse.json(result);
}
