import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";

async function isAdmin(req: NextRequest): Promise<boolean> {
  return Boolean(await requireAdminRequest(req));
}

/**
 * POST /api/admin/media — create a media item (admin uploads via URL or base64)
 * Body: { name, type, url, thumbnailUrl?, size?, mimeType?, description?, tags?, albumId?, isPublic? }
 *
 * The route stores references to approved managed object-storage URLs; binary upload is handled by the storage integration boundary.
 * For now, the admin provides a URL (e.g., from Unsplash or external CDN).
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const type = String(body?.type ?? "image").trim();
    const url = String(body?.url ?? "").trim();
    const thumbnailUrl = body?.thumbnailUrl ? String(body.thumbnailUrl) : null;
    const size = Math.max(0, Number(body?.size ?? 0));
    const mimeType = body?.mimeType ? String(body.mimeType) : null;
    const description = body?.description ? String(body.description) : null;
    const tags = body?.tags ? String(body.tags) : null;
    const albumId = body?.albumId ? String(body.albumId) : null;
    const isPublic = body?.isPublic !== false;

    if (!name || !url) {
      return NextResponse.json({ error: "name and url required" }, { status: 400 });
    }

    const item = await db.mediaItem.create({
      data: {
        name,
        type,
        url,
        thumbnailUrl,
        size,
        mimeType,
        description,
        tags,
        albumId,
        isPublic,
        uploadedBy: "admin",
      },
    });

    // Update album cover if first item
    if (albumId) {
      const album = await db.album.findUnique({ where: { id: albumId } });
      if (album && !album.coverUrl) {
        await db.album.update({
          where: { id: albumId },
          data: { coverUrl: url },
        });
      }
    }

    await db.auditLog.create({
      data: {
        actor: "admin",
        action: "media-uploaded",
        entity: "media",
        entityId: item.id,
        details: JSON.stringify({ name, type, albumId }),
      },
    });

    return NextResponse.json({ ok: true, item });
  } catch (e) {
    console.error("admin create media error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/admin/media — list all media items (incl. private)
 * Query: albumId, type, page, pageSize
 */
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const albumId = searchParams.get("albumId")?.trim();
  const type = searchParams.get("type")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 50)));

  const where: Record<string, unknown> = {};
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
    items: items.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}
