import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";

async function isAdmin(req: NextRequest): Promise<boolean> {
  return Boolean(await requireAdminRequest(req));
}

/**
 * POST /api/admin/meetings — create a meeting
 * GET  /api/admin/meetings — list all meetings
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const title = String(body?.title ?? "").trim();
    const description = String(body?.description ?? "").trim();
    const hostName = String(body?.hostName ?? "").trim();
    const scheduledAtStr = String(body?.scheduledAt ?? "").trim();
    const isPublic = body?.isPublic !== false;
    const stateCode = String(body?.stateCode ?? "").trim().toUpperCase();

    if (!title || !description || !hostName || !scheduledAtStr) {
      return NextResponse.json(
        { error: "title, description, hostName, scheduledAt required" },
        { status: 400 }
      );
    }

    const scheduledAt = new Date(scheduledAtStr);
    if (isNaN(scheduledAt.getTime())) {
      return NextResponse.json({ error: "Invalid scheduledAt" }, { status: 400 });
    }

    let stateId: string | undefined;
    if (stateCode) {
      const state = await db.uSState.findUnique({ where: { code: stateCode } });
      if (state) stateId = state.id;
    }

    const meeting = await db.meeting.create({
      data: {
        title,
        description,
        hostName,
        isLive: false,
        isPublic,
        viewerCount: 0,
        scheduledAt,
        stateId,
      },
    });

    const publicJoinUrl = `/meetings/${meeting.id}`;
    const updatedMeeting = await db.meeting.update({ where: { id: meeting.id }, data: { joinUrl: publicJoinUrl } });

    // Add to AI knowledge base
    await db.aIKnowledgeDoc.create({
      data: {
        title: title,
        sourceType: "meeting",
        sourceId: meeting.id,
        content: `${title}. ${description}. المنظِّم: ${hostName}. بتاريخ ${scheduledAt.toLocaleDateString("ar-EG")}.`,
        tags: "meeting",
      },
    });

    await db.auditLog.create({
      data: {
        actor: "admin",
        action: "meeting-created",
        entity: "meeting",
        entityId: meeting.id,
        details: JSON.stringify({ title, hostName, state: stateCode }),
      },
    });

    return NextResponse.json({ ok: true, meeting: updatedMeeting });
  } catch (e) {
    console.error("admin create meeting error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const liveOnly = searchParams.get("liveOnly") === "1";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 50)));

  const where: Record<string, unknown> = {};
  if (liveOnly) where.isLive = true;

  const [total, items] = await Promise.all([
    db.meeting.count({ where }),
    db.meeting.findMany({
      where,
      include: { state: true },
      orderBy: [{ isLive: "desc" }, { scheduledAt: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    items: items.map((m) => ({
      ...m,
      scheduledAt: m.scheduledAt.toISOString(),
      endsAt: m.endsAt?.toISOString() ?? null,
    })),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}
