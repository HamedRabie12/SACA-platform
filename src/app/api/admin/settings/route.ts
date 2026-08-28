import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";

async function isAdmin(req: NextRequest): Promise<boolean> {
  return Boolean(await requireAdminRequest(req));
}

/**
 * PATCH /api/admin/settings — update site settings + homepage sections.
 * Body: { settings?: {key, value}[], sections?: {key, isEnabled, sortOrder}[] }
 */
export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const settingsUpdates = Array.isArray(body.settings) ? body.settings : [];
    const sectionsUpdates = Array.isArray(body.sections) ? body.sections : [];

    // Update settings in parallel
    await Promise.all(
      settingsUpdates.map((s: { key: string; value: string }) =>
        db.setting.upsert({
          where: { key: s.key },
          update: { value: String(s.value) },
          create: { key: s.key, value: String(s.value) },
        })
      )
    );

    // Update sections in parallel
    await Promise.all(
      sectionsUpdates.map((s: { key: string; isEnabled?: boolean; sortOrder?: number; title?: string }) =>
        db.homepageSection.upsert({
          where: { key: s.key },
          update: {
            ...(s.isEnabled !== undefined && { isEnabled: s.isEnabled }),
            ...(s.sortOrder !== undefined && { sortOrder: s.sortOrder }),
            ...(s.title !== undefined && { title: s.title }),
          },
          create: {
            key: s.key,
            title: s.title ?? s.key,
            isEnabled: s.isEnabled ?? true,
            sortOrder: s.sortOrder ?? 0,
          },
        })
      )
    );

    await db.auditLog.create({
      data: {
        actor: "admin",
        action: "settings-updated",
        entity: "settings",
        details: JSON.stringify({
          settingsCount: settingsUpdates.length,
          sectionsCount: sectionsUpdates.length,
        }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin settings error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/admin/settings — return all settings + sections (incl. disabled)
 */
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [settings, sections] = await Promise.all([
    db.setting.findMany(),
    db.homepageSection.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return NextResponse.json({
    settings: settings.map((s) => ({ key: s.key, value: s.value })),
    sections: sections.map((s) => ({
      key: s.key,
      title: s.title,
      isEnabled: s.isEnabled,
      sortOrder: s.sortOrder,
    })),
  });
}
