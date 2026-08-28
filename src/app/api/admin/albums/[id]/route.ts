import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";

async function isAdmin(req: NextRequest): Promise<boolean> {
  return Boolean(await requireAdminRequest(req));
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const allowed: Record<string, unknown> = {};
    const fields = ["name", "nameAr", "description", "coverUrl", "isPublic", "sortOrder"];
    for (const f of fields) {
      if (body[f] !== undefined) allowed[f] = body[f];
    }
    const updated = await db.album.update({ where: { id }, data: allowed });
    await db.auditLog.create({
      data: { actor: "admin", action: "album-updated", entity: "album", entityId: id },
    });
    return NextResponse.json({ ok: true, album: updated });
  } catch (e) {
    console.error("admin update album error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    // Detach items from album, then delete album
    await db.mediaItem.updateMany({ where: { albumId: id }, data: { albumId: null } });
    await db.album.delete({ where: { id } });
    await db.auditLog.create({
      data: { actor: "admin", action: "album-deleted", entity: "album", entityId: id },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin delete album error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
