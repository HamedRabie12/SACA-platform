import { NextRequest, NextResponse } from "next/server";
import { createAdminSession, setAdminSessionCookie } from "@/lib/security/admin-session";
import { verifyAdminPassword } from "@/lib/security/password";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const username = String(body?.username ?? "").trim();
  const password = String(body?.password ?? "");
  const expectedUser = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  const rl = await rateLimit(`admin-login:${req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"}`, 5, 300);
  if (!rl.allowed) return NextResponse.json({ error: "Too many authentication attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } });

  if (!expectedUser || !passwordHash) {
    return NextResponse.json({ error: "Administrative credentials are not configured." }, { status: 503 });
  }

  if (username !== expectedUser || !verifyAdminPassword(password, passwordHash)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const role = process.env.ADMIN_ROLE || "SUPER_ADMIN";
  try {
    const token = await createAdminSession(username, role, {
      ipHash: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgentHash: req.headers.get("user-agent") ?? undefined,
    });
    const response = NextResponse.json({ ok: true, mfaRequired: true });
    setAdminSessionCookie(response, token);
    return response;
  } catch (error) {
    const code = error instanceof Error ? error.message : "ADMIN_IDENTITY_NOT_PROVISIONED";
    if (code === "ADMIN_IDENTITY_NOT_PROVISIONED" || code === "ADMIN_ROLE_NOT_PROVISIONED") {
      return NextResponse.json({ error: "Administrative identity is not provisioned. Run the documented admin provisioning step first." }, { status: 503 });
    }
    return NextResponse.json({ error: "Unable to establish administrative session." }, { status: 503 });
  }
}
