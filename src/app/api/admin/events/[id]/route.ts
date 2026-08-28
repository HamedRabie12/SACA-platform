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
    const fields = [
      "title", "description", "category", "location", "isOnline",
      "capacity", "registeredCount", "organizerName", "status",
    ];
    for (const f of fields) {
      if (body[f] !== undefined) allowed[f] = body[f];
    }
    if (body.eventDate) {
      const d = new Date(body.eventDate);
      if (!isNaN(d.getTime())) allowed.eventDate = d;
    }
    if (body.stateCode) {
      const state = await db.uSState.findUnique({
        where: { code: String(body.stateCode).toUpperCase() },
      });
      if (state) allowed.stateId = state.id;
    }

    const updated = await db.event.update({ where: { id }, data: allowed });
    await db.auditLog.create({
      data: {
        actor: "admin",
        action: "event-updated",
        entity: "event",
        entityId: id,
        details: JSON.stringify({ fields: Object.keys(allowed) }),
      },
    });
    return NextResponse.json({ ok: true, event: updated });
  } catch (e) {
    console.error("admin update event error:", e);
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
    await db.event.update({ where: { id }, data: { status: "Cancelled" } });
    await db.auditLog.create({
      data: {
        actor: "admin",
        action: "event-cancelled",
        entity: "event",
        entityId: id,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin delete event error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
