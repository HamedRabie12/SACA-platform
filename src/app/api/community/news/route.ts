import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/community/news
 * Query params:
 *   - state, category, q, page, pageSize
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state")?.trim().toUpperCase();
  const category = searchParams.get("category")?.trim();
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));

  const where: Record<string, unknown> = { status: "Published" };
  if (state) where.state = { code: state };
  if (category) where.category = category;
  if (q && q.length > 0) {
    where.OR = [
      { title: { contains: q } },
      { summary: { contains: q } },
      { content: { contains: q } },
      { orgName: { contains: q } },
      { authorName: { contains: q } },
    ];
  }

  const [total, items] = await Promise.all([
    db.news.count({ where }),
    db.news.findMany({
      where,
      include: { state: true },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    items: items.map((n) => ({
      ...n,
      publishedAt: n.publishedAt.toISOString(),
    })),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}
