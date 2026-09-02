import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSession } from "@/lib/security/admin-verify";

// Middleware is a coarse pre-gate. It delegates the authoritative
// session/MFA/role/scope check to lib/security/admin-verify.ts so
// the cookie, the DB, and every server route handler share the SAME
// source of truth. No parallel cookie-only verifier exists here.

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi = pathname.startsWith("/api/admin/");
  const isMfaApi = pathname.startsWith("/api/admin/mfa/");
  const isMfaPage = pathname === "/secure-portal/mfa";

  if (!isAdminPage && !isAdminApi && !isMfaApi && !isMfaPage) {
    const response = NextResponse.next();
    applySecurityHeaders(response);
    return response;
  }

  const token = request.cookies.get("saca_admin_session")?.value;
  const result = await verifyAdminSession(token);

  if (!result.ok) {
    if (isAdminApi && !isMfaApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = request.nextUrl.clone();
    url.pathname = "/secure-portal";
    url.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(url);
  }

  if (result.session.exp <= Math.floor(Date.now() / 1000)) {
    if (isAdminApi && !isMfaApi) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    const url = request.nextUrl.clone();
    url.pathname = "/secure-portal";
    url.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(url);
  }

  if (result.session.mfaRequired && !result.session.mfaVerified) {
    if (isAdminApi && !isMfaApi) {
      return NextResponse.json({ error: "MFA_REQUIRED" }, { status: 401, headers: { "x-saca-mfa-required": "1" } });
    }
    if (isAdminPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/secure-portal/mfa";
      return NextResponse.redirect(url);
    }
    const response = NextResponse.next();
    applySecurityHeaders(response);
    return response;
  }

  const response = NextResponse.next();
  response.headers.set("x-saca-admin-authenticated", "1");
  applySecurityHeaders(response);
  return response;
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(self), microphone=(self), geolocation=(self)");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  response.headers.set("Cross-Origin-Resource-Policy", "same-site");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
}

// Middleware runs in the Node.js runtime so it can use the Prisma
// client via lib/security/admin-verify.ts. Explicit declaration
// avoids any future Edge-runtime misconfiguration that would
// silently re-introduce a parallel cookie-only verifier.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
  runtime: "nodejs",
};
