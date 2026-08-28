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
    const fields = ["name", "description", "tags", "albumId", "isPublic", "type"];
    for (const f of fields) {
      if (body[f] !== undefined) allowed[f] = body[f];
    }
    const updated = await db.mediaItem.update({ where: { id }, data: allowed });
    await db.auditLog.create({
      data: { actor: "admin", action: "media-updated", entity: "media", entityId: id },
    });
    return NextResponse.json({ ok: true, item: updated });
  } catch (e) {
    console.error("admin update media error:", e);
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
    await db.mediaItem.delete({ where: { id } });
    await db.auditLog.create({
      data: { actor: "admin", action: "media-deleted", entity: "media", entityId: id },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin delete media error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
