import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionValue, adminSessionCookieName } from "@/lib/security/admin-session";
import { setupAdminMfa } from "@/lib/security/admin-mfa";

export async function POST(req: NextRequest) {
  const session = await verifyAdminSessionValue(req.cookies.get(adminSessionCookieName())?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await setupAdminMfa(session.sub);
  return NextResponse.json(result);
}
