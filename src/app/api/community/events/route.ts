import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/community/events
 * Query params:
 *   - state: state code
 *   - category: event category
 *   - status: Upcoming (default) | Live | Completed | Cancelled
 *   - q: search
 *   - page, pageSize
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state")?.trim().toUpperCase();
  const category = searchParams.get("category")?.trim();
  const status = searchParams.get("status")?.trim() || "Upcoming";
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));

  const where: Record<string, unknown> = { status };
  if (state) {
    where.state = { code: state };
  }
  if (category) {
    where.category = category;
  }
  if (q && q.length > 0) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { location: { contains: q } },
      { organizerName: { contains: q } },
    ];
  }
  if (status === "Upcoming") {
    where.eventDate = { gte: new Date() };
  }

  const [total, items] = await Promise.all([
    db.event.count({ where }),
    db.event.findMany({
      where,
      include: { state: true },
      orderBy: [{ eventDate: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    items: items.map((e) => ({
      ...e,
      eventDate: e.eventDate.toISOString(),
      endDate: e.endDate?.toISOString() ?? null,
    })),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}
