import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";
import { resolveMemberSession } from "@/lib/security/member-session";

/**
 * PATCH /api/community/notifications/[id] — mark as read/unread
 * DELETE /api/community/notifications/[id] — delete (admin)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const isRead = body?.isRead === true;
    const session = await resolveMemberSession(req);
    if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const notification = await db.notification.findUnique({ where: { id } });
    if (!notification) return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    if (notification.memberId && notification.memberId !== session.memberId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await db.notification.update({
      where: { id },
      data: { isRead },
    });

    return NextResponse.json({ ok: true, notification: updated });
  } catch (e) {
    console.error("update notification error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    await db.notification.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("delete notification error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
