import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";

/**
 * GET /api/community/audit?page=1&pageSize=50&action=register-otp-request
 *
 * Returns audit logs to authorized administrators according to the canonical role/permission matrix.
 */
export async function GET(req: NextRequest) {
  if (!(await requireAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 50)));
  const action = searchParams.get("action")?.trim();
  const entity = searchParams.get("entity")?.trim();

  const where: Record<string, unknown> = {};
  if (action) where.action = { contains: action };
  if (entity) where.entity = entity;

  const [total, items] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    items: items.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    })),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}
