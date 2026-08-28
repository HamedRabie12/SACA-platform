import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";
import { resolveMemberSession } from "@/lib/security/member-session";

/**
 * POST /api/community/reports
 * Body: { reporter: string, targetType: string, targetId: string, reason: string }
 *
 * Submits a user report for moderation. Status starts as "Open".
 */
export async function POST(req: NextRequest) {
  try {
    const session = await resolveMemberSession(req);
    if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const body = await req.json();
    const reporter = session.memberId;
    const targetType = String(body?.targetType ?? "").trim().slice(0, 50);
    const targetId = String(body?.targetId ?? "").trim().slice(0, 200);
    const reason = String(body?.reason ?? "").trim().slice(0, 1000);

    if (!targetType || !targetId || !reason) {
      return NextResponse.json(
        { error: "targetType, targetId, and reason are required" },
        { status: 400 }
      );
    }

    const report = await db.report.create({
      data: { reporter, targetType, targetId, reason, status: "Open" },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        actor: reporter,
        action: "report-submitted",
        entity: targetType,
        entityId: targetId,
        details: JSON.stringify({ reportId: report.id, reason: reason.slice(0, 200) }),
      },
    });

    return NextResponse.json({ ok: true, reportId: report.id, status: "Open" });
  } catch (e) {
    console.error("report error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/community/reports?page=1&pageSize=50&status=Open
 * Returns paginated reports to authorized administrators.
 */
export async function GET(req: NextRequest) {
  if (!(await requireAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 50)));
  const status = searchParams.get("status")?.trim();

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [total, items] = await Promise.all([
    db.report.count({ where }),
    db.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    items: items.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}
