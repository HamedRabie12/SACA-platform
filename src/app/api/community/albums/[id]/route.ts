import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/community/albums/[id] — public album detail + items
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const album = await db.album.findUnique({
    where: { id },
    include: {
      items: {
        where: { isPublic: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!album || !album.isPublic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    album: {
      id: album.id,
      name: album.name,
      nameAr: album.nameAr,
      description: album.description,
      coverUrl: album.coverUrl,
      createdAt: album.createdAt.toISOString(),
    },
    items: album.items.map((m) => ({
      id: m.id,
      name: m.name,
      type: m.type,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl,
      description: m.description,
      tags: m.tags,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}
