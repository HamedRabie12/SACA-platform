import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/community/meetings
 * Query params:
 *   - state, liveOnly (1/0), q, page, pageSize
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state")?.trim().toUpperCase();
  const liveOnly = searchParams.get("liveOnly") === "1";
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));

  const where: Record<string, unknown> = {};
  if (state) where.state = { code: state };
  if (liveOnly) where.isLive = true;
  if (q && q.length > 0) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { hostName: { contains: q } },
    ];
  }

  const [total, items] = await Promise.all([
    db.meeting.count({ where }),
    db.meeting.findMany({
      where,
      include: { state: true },
      // Live meetings first, then upcoming
      orderBy: [{ isLive: "desc" }, { scheduledAt: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    items: items.map((m) => ({
      ...m,
      scheduledAt: m.scheduledAt.toISOString(),
      endsAt: m.endsAt?.toISOString() ?? null,
    })),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}
