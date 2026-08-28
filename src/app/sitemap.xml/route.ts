import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /sitemap.xml
 *
 * Dynamic sitemap listing all public pages, organizations, events, and news.
 * Per Stage 45 SEO requirements.
 */
export async function GET() {
  const baseUrl = "https://saca-md.org";

  // Fetch all public entities
  const [orgs, events, news, states] = await Promise.all([
    db.organization.findMany({
      where: { verification: "Verified" },
      select: { id: true, updatedAt: true },
    }),
    db.event.findMany({
      where: { status: "Upcoming" },
      select: { id: true, eventDate: true },
    }),
    db.news.findMany({
      where: { status: "Published" },
      select: { id: true, publishedAt: true },
    }),
    db.uSState.findMany({
      where: { isActive: true },
      select: { code: true },
    }),
  ]);

  const now = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const staticUrls = [
    "/", "/organizations", "/events", "/news", "/meetings",
    "/services", "/gallery", "/library", "/auth/register",
  ];
  for (const loc of staticUrls) {
    xml += `  <url>\n    <loc>${baseUrl}${loc}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  }

  for (const o of orgs) {
    xml += `  <url>\n    <loc>${baseUrl}/organizations/${o.id}</loc>\n    <lastmod>${o.updatedAt.toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }
  for (const e of events) {
    xml += `  <url>\n    <loc>${baseUrl}/events/${e.id}</loc>\n    <lastmod>${e.eventDate.toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }
  for (const n of news) {
    xml += `  <url>\n    <loc>${baseUrl}/news/${n.id}</loc>\n    <lastmod>${n.publishedAt.toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }
  for (const s of states) {
    xml += `  <url>\n    <loc>${baseUrl}/community/${s.code}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
  }

  xml += `</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
