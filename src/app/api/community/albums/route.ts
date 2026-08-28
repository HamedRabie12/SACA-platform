import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/community/albums — public albums with items count
 */
export async function GET() {
  const albums = await db.album.findMany({
    where: { isPublic: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { items: true } } },
  });
  return NextResponse.json({
    items: albums.map((a) => ({
      id: a.id,
      name: a.name,
      nameAr: a.nameAr,
      description: a.description,
      coverUrl: a.coverUrl,
      itemCount: a._count.items,
      createdAt: a.createdAt.toISOString(),
    })),
  });
}
