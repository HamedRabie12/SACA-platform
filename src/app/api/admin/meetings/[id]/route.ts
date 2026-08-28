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
      "title", "description", "hostName", "isLive", "isPublic",
    ];
    for (const f of fields) {
      if (body[f] !== undefined) allowed[f] = body[f];
    }
    if (body.scheduledAt) {
      const d = new Date(body.scheduledAt);
      if (!isNaN(d.getTime())) allowed.scheduledAt = d;
    }
    if (body.stateCode) {
      const state = await db.uSState.findUnique({
        where: { code: String(body.stateCode).toUpperCase() },
      });
      if (state) allowed.stateId = state.id;
    }

    const updated = await db.meeting.update({ where: { id }, data: allowed });
    await db.auditLog.create({
      data: {
        actor: "admin",
        action: "meeting-updated",
        entity: "meeting",
        entityId: id,
        details: JSON.stringify({ fields: Object.keys(allowed) }),
      },
    });

    // If meeting went live, create notification for all users
    if (body.isLive === true) {
      await db.notification.create({
        data: {
          type: "meeting",
          title: "اجتماع مباشر بدأ الآن",
          body: `${updated.title} — انضم الآن!`,
          priority: "Important",
          actionLabel: "انضمام",
          actionUrl: `/meetings#${id}`,
        },
      });
    }

    return NextResponse.json({ ok: true, meeting: updated });
  } catch (e) {
    console.error("admin update meeting error:", e);
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
    await db.aIKnowledgeDoc.deleteMany({
      where: { sourceType: "meeting", sourceId: id },
    });
    await db.meeting.delete({ where: { id } });
    await db.auditLog.create({
      data: {
        actor: "admin",
        action: "meeting-deleted",
        entity: "meeting",
        entityId: id,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin delete meeting error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
