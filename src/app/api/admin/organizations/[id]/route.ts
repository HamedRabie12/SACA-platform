import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";

/**
 * PATCH  /api/admin/organizations/[id]  — update fields (incl. verification)
 * DELETE /api/admin/organizations/[id]  — soft delete (set verification=Archived)
 */

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

    // Sanitize input — only allow specific fields
    const allowed: Record<string, unknown> = {};
    const fields = [
      "name", "type", "description", "address", "phone", "email",
      "website", "hoursAr", "services", "verification", "rating",
    ];
    for (const f of fields) {
      if (body[f] !== undefined) allowed[f] = body[f];
    }

    // Handle state/city resolution
    if (body.stateCode) {
      const state = await db.uSState.findUnique({
        where: { code: String(body.stateCode).toUpperCase() },
      });
      if (state) {
        allowed.stateId = state.id;
        if (body.cityName) {
          const city = await db.uSCity.findFirst({
            where: { stateId: state.id, nameEn: String(body.cityName) },
          });
          if (city) allowed.cityId = city.id;
        }
      }
    }

    const updated = await db.organization.update({
      where: { id },
      data: allowed,
    });

    // Audit log
    await db.auditLog.create({
      data: {
        actor: "admin",
        action: "organization-updated",
        entity: "organization",
        entityId: id,
        details: JSON.stringify({ fields: Object.keys(allowed) }),
      },
    });

    return NextResponse.json({ ok: true, organization: updated });
  } catch (e) {
    console.error("admin update org error:", e);
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
    // Soft delete: mark as Archived
    await db.organization.update({
      where: { id },
      data: { verification: "Archived" },
    });
    await db.auditLog.create({
      data: {
        actor: "admin",
        action: "organization-archived",
        entity: "organization",
        entityId: id,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin delete org error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
