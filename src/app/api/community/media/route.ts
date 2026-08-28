import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/community/media?albumId=X&type=image&page=1&pageSize=30
 * Public media items (only isPublic=true)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const albumId = searchParams.get("albumId")?.trim();
  const type = searchParams.get("type")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(60, Math.max(1, Number(searchParams.get("pageSize") ?? 30)));

  const where: Record<string, unknown> = { isPublic: true };
  if (albumId) where.albumId = albumId;
  if (type) where.type = type;

  const [total, items] = await Promise.all([
    db.mediaItem.count({ where }),
    db.mediaItem.findMany({
      where,
      include: { album: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    items: items.map((m) => ({
      id: m.id,
      name: m.name,
      type: m.type,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl,
      size: m.size,
      description: m.description,
      tags: m.tags,
      createdAt: m.createdAt.toISOString(),
      album: m.album ? { id: m.album.id, name: m.album.name, nameAr: m.album.nameAr } : null,
    })),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}
