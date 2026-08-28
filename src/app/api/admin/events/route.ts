import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";
import { classifyCommunityContent } from "@/lib/moderation/content-policy";

async function isAdmin(req: NextRequest): Promise<boolean> {
  return Boolean(await requireAdminRequest(req));
}

/**
 * POST /api/admin/events — create event
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const title = String(body?.title ?? "").trim();
    const description = String(body?.description ?? "").trim();
    const category = String(body?.category ?? "social").trim();
    const eventDateStr = String(body?.eventDate ?? "").trim();
    const location = String(body?.location ?? "").trim() || null;
    const isOnline = Boolean(body?.isOnline);
    const capacity = Math.max(0, Number(body?.capacity ?? 0));
    const organizerName = String(body?.organizerName ?? "").trim() || null;
    const stateCode = String(body?.stateCode ?? "").trim().toUpperCase();

    if (!title || !description || !eventDateStr) {
      return NextResponse.json(
        { error: "title, description, and eventDate are required" },
        { status: 400 }
      );
    }

    const moderation = classifyCommunityContent(`${title} ${description}`);
    if (moderation.blocked) {
      await db.moderationCase.create({ data: { targetType: "event", targetId: "pending", category: moderation.classification, severity: "HIGH", reason: moderation.reason ?? "Policy violation" } });
      return NextResponse.json({ error: "CONTENT_POLICY_BLOCK", classification: moderation.classification, reason: moderation.reason }, { status: 422 });
    }

    const eventDate = new Date(eventDateStr);
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json({ error: "Invalid eventDate" }, { status: 400 });
    }

    let stateId: string | undefined;
    if (stateCode) {
      const state = await db.uSState.findUnique({ where: { code: stateCode } });
      if (state) stateId = state.id;
    }

    const event = await db.event.create({
      data: {
        title,
        description,
        category,
        eventDate,
        location,
        isOnline,
        capacity,
        organizerName,
        stateId,
        status: "Upcoming",
      },
    });

    // AI knowledge base entry
    await db.aIKnowledgeDoc.create({
      data: {
        title: title,
        sourceType: "event",
        sourceId: event.id,
        content: `${title}. ${description}. ${location ? `في ${location}.` : ""} بتاريخ ${eventDate.toLocaleDateString("ar-EG")}. ${organizerName ? `المنظم: ${organizerName}.` : ""} ${capacity > 0 ? `السعة: ${capacity} شخص.` : ""}`,
        tags: category,
      },
    });

    await db.auditLog.create({
      data: {
        actor: "admin",
        action: "event-created",
        entity: "event",
        entityId: event.id,
        details: JSON.stringify({ title, category, state: stateCode }),
      },
    });

    return NextResponse.json({ ok: true, event });
  } catch (e) {
    console.error("admin create event error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/admin/events — list all events (incl. draft/cancelled)
 */
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 50)));

  const where: Record<string, unknown> = {};
  if (category) where.category = category;

  const [total, items] = await Promise.all([
    db.event.count({ where }),
    db.event.findMany({
      where,
      include: { state: true },
      orderBy: { eventDate: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    items: items.map((e) => ({
      ...e,
      eventDate: e.eventDate.toISOString(),
      endDate: e.endDate?.toISOString() ?? null,
    })),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}
