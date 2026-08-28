import { NextResponse } from "next/server";

/**
 * GET /robots.txt
 */
export async function GET() {
  const baseUrl = "https://saca-md.org";
  const txt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin
Disallow: /api/community/register
Disallow: /api/community/verify
Disallow: /api/community/onboarding
Disallow: /api/community/ai

Sitemap: ${baseUrl}/sitemap.xml
`;
  return new NextResponse(txt, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
