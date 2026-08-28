import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveMemberSession } from "@/lib/security/member-session";

/**
 * POST /api/community/follow
 * Body: { targetType: "organization" | "event" | "news", targetId }
 *
 * Toggle follow (follow if not following, unfollow if already following).
 * Stored in the canonical Follow table and mirrored to a personal notification.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await resolveMemberSession(req);
    if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const body = await req.json();
    const memberId = session.memberId;
    const targetType = String(body?.targetType ?? "").trim();
    const targetId = String(body?.targetId ?? "").trim();

    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: "targetType and targetId are required" },
        { status: 400 }
      );
    }

    // Resolve target name
    let targetName = "";
    if (targetType === "organization") {
      const o = await db.organization.findUnique({ where: { id: targetId } });
      targetName = o?.name ?? "";
    } else if (targetType === "event") {
      const e = await db.event.findUnique({ where: { id: targetId } });
      targetName = e?.title ?? "";
    } else if (targetType === "news") {
      const n = await db.news.findUnique({ where: { id: targetId } });
      targetName = n?.title ?? "";
    }

    if (!targetName) {
      return NextResponse.json({ error: "Target not found" }, { status: 404 });
    }

    const existingFollow = await db.follow.findUnique({ where: { memberId_targetType_targetId: { memberId, targetType, targetId } } });
    const following = !existingFollow;
    if (existingFollow) {
      await db.follow.delete({ where: { id: existingFollow.id } });
    } else {
      await db.follow.create({ data: { memberId, targetType, targetId } });
      await db.notification.create({ data: { memberId, type: "follow", title: "أنت الآن تتابع", body: `بدأت بمتابعة: ${targetName}`, priority: "Normal", actionLabel: "عرض", actionUrl: `/${targetType === "organization" ? "organizations" : targetType === "event" ? "events" : "news"}/${targetId}` } });
    }

    await db.auditLog.create({
      data: {
        actor: memberId,
        action: "followed",
        entity: targetType,
        entityId: targetId,
        details: JSON.stringify({ targetName }),
      },
    });

    return NextResponse.json({
      ok: true,
      following,
      targetType,
      targetId,
      targetName,
    });
  } catch (e) {
    console.error("follow error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
