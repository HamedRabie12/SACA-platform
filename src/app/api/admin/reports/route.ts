import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";

async function isAdmin(req: NextRequest): Promise<boolean> {
  return Boolean(await requireAdminRequest(req));
}

/**
 * GET /api/admin/reports — list all reports
 * PATCH /api/admin/reports?id=X&status=Resolved — update report status
 */
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 50)));

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

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status");
    if (!id || !status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }
    const updated = await db.report.update({
      where: { id },
      data: { status: String(status) },
    });
    await db.auditLog.create({
      data: {
        actor: "admin",
        action: "report-status-updated",
        entity: "report",
        entityId: id,
        details: JSON.stringify({ status }),
      },
    });
    return NextResponse.json({ ok: true, report: updated });
  } catch (e) {
    console.error("admin update report error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
