import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";
import { z } from "zod";

const rowSchema = z.object({
  name: z.string().min(2).max(200),
  type: z.string().min(1).max(80),
  state: z.string().max(3).optional().default(""),
  city: z.string().max(120).optional().default(""),
  address: z.string().max(500).optional().default(""),
  phone: z.string().max(40).optional().default(""),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
});
const payloadSchema = z.object({ rows: z.array(rowSchema).min(1).max(1000) });

export async function POST(req: NextRequest) {
  const session = await requireAdminRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = payloadSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid import payload", issues: parsed.error.issues }, { status: 400 });

  const result = { created: 0, skipped: 0, errors: [] as Array<{ row: number; reason: string }> };
  for (let i = 0; i < parsed.data.rows.length; i++) {
    const row = parsed.data.rows[i];
    try {
      const state = row.state ? await db.uSState.findUnique({ where: { code: row.state.toUpperCase() } }) : null;
      const city = row.city && state ? await db.uSCity.findFirst({ where: { stateId: state.id, nameEn: row.city } }) : null;
      const duplicate = await db.organization.findFirst({ where: { name: row.name, stateId: state?.id ?? null, cityId: city?.id ?? null } });
      if (duplicate) { result.skipped++; continue; }
      await db.organization.create({ data: { name: row.name, type: row.type, description: row.name, stateId: state?.id, cityId: city?.id, address: row.address || null, phone: row.phone || null, email: row.email || null, website: row.website || null, verification: "Unverified", isDevSeed: false } });
      result.created++;
    } catch (error) {
      result.errors.push({ row: i + 2, reason: error instanceof Error ? error.message : "Import error" });
    }
  }
  await db.auditLog.create({ data: { actor: session.sub, action: "organization-import", entity: "organization", details: JSON.stringify(result) } });
  return NextResponse.json({ ok: result.errors.length === 0, result });
}
