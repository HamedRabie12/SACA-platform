import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "saca_admin_session";

function unb64url(value: string): Uint8Array {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function key(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters.");
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function verifyCookie(value: string | undefined): Promise<{ mfaRequired: boolean; mfaVerified: boolean; expired: boolean } | null> {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  try {
    const sigBytes = unb64url(signature);
    const buf = new Uint8Array(sigBytes.buffer.slice(sigBytes.byteOffset, sigBytes.byteOffset + sigBytes.byteLength));
    const ok = await crypto.subtle.verify("HMAC", await key(), buf as unknown as ArrayBuffer, new TextEncoder().encode(payload));
    if (!ok) return null;
    const json = JSON.parse(new TextDecoder().decode(unb64url(payload)));
    const now = Math.floor(Date.now() / 1000);
    if (json.ver !== 3 || !json.sid || !json.sub || json.exp <= now) return { mfaRequired: true, mfaVerified: false, expired: true };
    return { mfaRequired: Boolean(json.mfaRequired), mfaVerified: Boolean(json.mfaVerified), expired: false };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi = pathname.startsWith("/api/admin/") || pathname === "/api/admin";
  const isMfaApi = pathname.startsWith("/api/admin/mfa/");
  const isMfaPage = pathname === "/secure-portal/mfa";

  if (!isAdminPage && !isAdminApi && !isMfaApi && !isMfaPage) {
    const response = NextResponse.next();
    applySecurityHeaders(response);
    return response;
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = await verifyCookie(token);

  if (!session) {
    if (isAdminApi && !isMfaApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = request.nextUrl.clone();
    url.pathname = "/secure-portal";
    url.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(url);
  }

  if (session.expired) {
    if (isAdminApi && !isMfaApi) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    const url = request.nextUrl.clone();
    url.pathname = "/secure-portal";
    url.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(url);
  }

  if (session.mfaRequired && !session.mfaVerified) {
    if (isAdminApi && !isMfaApi) return NextResponse.json({ error: "MFA_REQUIRED" }, { status: 401, headers: { "x-saca-mfa-required": "1" } });
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

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
