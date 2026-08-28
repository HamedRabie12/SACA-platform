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
      "name", "email", "phoneE164", "avatarUrl", "bio", "profession",
      "interests", "membershipType", "accountState",
      "privacyShowState", "privacyShowCity",
    ];
    for (const f of fields) {
      if (body[f] !== undefined) allowed[f] = body[f];
    }
    if (body.stateCode) {
      const state = await db.uSState.findUnique({
        where: { code: String(body.stateCode).toUpperCase() },
      });
      if (state) allowed.stateId = state.id;
    }

    const updated = await db.member.update({ where: { id }, data: allowed });
    await db.auditLog.create({
      data: {
        actor: "admin",
        action: "member-updated",
        entity: "member",
        entityId: id,
        details: JSON.stringify({ fields: Object.keys(allowed) }),
      },
    });
    return NextResponse.json({ ok: true, member: updated });
  } catch (e) {
    console.error("admin update member error:", e);
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
    // HARD DELETE: permanently remove from database
    await db.member.delete({
      where: { id },
    });
    await db.auditLog.create({
      data: {
        actor: "admin",
        action: "member-deleted",
        entity: "member",
        entityId: id,
      },
    });
    return NextResponse.json({ ok: true, deleted: true });
  } catch (e) {
    console.error("admin delete member error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
