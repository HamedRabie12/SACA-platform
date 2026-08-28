import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";

async function isAdmin(req: NextRequest): Promise<boolean> {
  return Boolean(await requireAdminRequest(req));
}

/**
 * POST /api/admin/albums — create album
 * GET  /api/admin/albums — list albums (incl. private)
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const nameAr = body?.nameAr ? String(body.nameAr) : null;
    const description = body?.description ? String(body.description) : null;
    const coverUrl = body?.coverUrl ? String(body.coverUrl) : null;
    const isPublic = body?.isPublic !== false;

    if (!name) {
      return NextResponse.json({ error: "name required" }, { status: 400 });
    }

    const album = await db.album.create({
      data: { name, nameAr, description, coverUrl, isPublic },
    });

    await db.auditLog.create({
      data: { actor: "admin", action: "album-created", entity: "album", entityId: album.id },
    });

    return NextResponse.json({ ok: true, album });
  } catch (e) {
    console.error("admin create album error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const albums = await db.album.findMany({
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
      isPublic: a.isPublic,
      sortOrder: a.sortOrder,
      itemCount: a._count.items,
      createdAt: a.createdAt.toISOString(),
    })),
  });
}
