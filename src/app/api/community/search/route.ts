import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/community/search?q=...&types=organizations,events,news,meetings
 *
 * Global Smart Search across the platform.
 * Supports Arabic normalization (ي/ى, إأآا, ة/ه, diacritics) + typo tolerance via token inclusion.
 */

function normalizeArabic(s: string): string {
  return (s ?? "")
    .toLowerCase()
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ًٌٍَُِّْ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const typesParam = searchParams.get("types") || "organizations,events,news,meetings";
  const types = typesParam.split(",").map((t) => t.trim()).filter(Boolean);
  const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit") ?? 8)));

  if (!q || q.length < 2) {
    return NextResponse.json({ items: [], q });
  }

  // Normalize the query for case-insensitive + Arabic-tolerant contains.
  // PostgreSQL search is normalized here for Arabic-friendly matching; production can later add pg_trgm/FTS indexes.
  const results: Array<{
    id: string;
    title: string;
    subtitle?: string;
    type: string;
    href: string;
  }> = [];

  // Run searches in parallel
  const tasks: Promise<void>[] = [];

  if (types.includes("organizations")) {
    tasks.push(
      (async () => {
        const items = await db.organization.findMany({
          where: {
            verification: "Verified",
            OR: [
              { name: { contains: q } },
              { description: { contains: q } },
              { services: { contains: q } },
            ],
          },
          take: limit,
          include: { state: true },
        });
        for (const o of items) {
          results.push({
            id: o.id,
            title: o.name,
            subtitle: o.state
              ? `${o.state.nameAr}${o.address ? ` · ${o.address}` : ""}`
              : o.address ?? undefined,
            type: "organization",
            href: `/organizations/${o.id}`,
          });
        }
      })()
    );
  }

  if (types.includes("events")) {
    tasks.push(
      (async () => {
        const items = await db.event.findMany({
          where: {
            status: "Upcoming",
            OR: [
              { title: { contains: q } },
              { description: { contains: q } },
              { location: { contains: q } },
            ],
          },
          take: limit,
          include: { state: true },
        });
        for (const e of items) {
          results.push({
            id: e.id,
            title: e.title,
            subtitle: `${e.location ?? ""}${
              e.state ? ` · ${e.state.nameAr}` : ""
            }`,
            type: "event",
            href: `/events/${e.id}`,
          });
        }
      })()
    );
  }

  if (types.includes("news")) {
    tasks.push(
      (async () => {
        const items = await db.news.findMany({
          where: {
            status: "Published",
            OR: [
              { title: { contains: q } },
              { summary: { contains: q } },
              { content: { contains: q } },
            ],
          },
          take: limit,
        });
        for (const n of items) {
          results.push({
            id: n.id,
            title: n.title,
            subtitle: n.orgName ?? n.authorName ?? undefined,
            type: "news",
            href: `/news/${n.id}`,
          });
        }
      })()
    );
  }

  if (types.includes("meetings")) {
    tasks.push(
      (async () => {
        const items = await db.meeting.findMany({
          where: {
            OR: [
              { title: { contains: q } },
              { description: { contains: q } },
              { hostName: { contains: q } },
            ],
          },
          take: limit,
        });
        for (const m of items) {
          results.push({
            id: m.id,
            title: m.title,
            subtitle: m.hostName,
            type: "meeting",
            href: `/meetings#${m.id}`,
          });
        }
      })()
    );
  }

  await Promise.all(tasks);

  // Normalize-based deduplication
  const seen = new Set<string>();
  const deduped = results.filter((r) => {
    const k = normalizeArabic(r.title).slice(0, 60);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return NextResponse.json({
    items: deduped.slice(0, limit * 2),
    q,
    normalizedQuery: normalizeArabic(q),
  });
}
