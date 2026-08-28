import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/community/news/[id]
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const news = await db.news.findUnique({
    where: { id },
    include: { state: true },
  });
  if (!news) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch related news (same category or org)
  const related = await db.news.findMany({
    where: {
      status: "Published",
      id: { not: id },
      OR: [
        { category: news.category },
        { orgName: news.orgName ?? "__no_match__" },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return NextResponse.json({
    news: {
      ...news,
      publishedAt: news.publishedAt.toISOString(),
    },
    related: related.map((n) => ({
      ...n,
      publishedAt: n.publishedAt.toISOString(),
    })),
  });
}
