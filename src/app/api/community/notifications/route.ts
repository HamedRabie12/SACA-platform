import type { Prisma } from "@/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";
import { resolveMemberSession } from "@/lib/security/member-session";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unreadOnly") === "1";
  const type = searchParams.get("type")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));
  const member = await resolveMemberSession(req);

  const where: Record<string, unknown> = member
    ? { OR: [{ memberId: null }, { memberId: member.memberId }] }
    : { memberId: null };
  if (unreadOnly) where.isRead = false;
  if (type) where.type = type;

  const [total, unreadCount, items] = await Promise.all([
    db.notification.count({ where: where as Prisma.NotificationWhereInput }),
    db.notification.count({ where: { ...(where as Prisma.NotificationWhereInput), isRead: false } }),
    db.notification.findMany({ where: where as Prisma.NotificationWhereInput, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
  ]);

  return NextResponse.json({
    items: items.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() })),
    unreadCount,
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdminRequest(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const title = String(body?.title ?? "").trim();
    const bodyText = String(body?.body ?? "").trim();
    if (!title || !bodyText) return NextResponse.json({ error: "title and body required" }, { status: 400 });
    const targetMemberId = body?.memberId ? String(body.memberId) : null;
    if (targetMemberId) {
      const target = await db.member.findUnique({ where: { id: targetMemberId }, select: { id: true } });
      if (!target) return NextResponse.json({ error: "Target member not found" }, { status: 404 });
    }
    const notif = await db.notification.create({
      data: {
        type: String(body?.type ?? "system").trim(),
        title,
        body: bodyText,
        priority: String(body?.priority ?? "Normal").trim(),
        actionLabel: body?.actionLabel ? String(body.actionLabel) : null,
        actionUrl: body?.actionUrl ? String(body.actionUrl) : null,
        memberId: targetMemberId,
      },
    });
    await db.auditLog.create({ data: { actor: "admin", action: "notification-created", entity: "notification", entityId: notif.id, details: JSON.stringify({ memberId: targetMemberId, type: notif.type }) } });
    return NextResponse.json({ ok: true, notification: notif });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
