import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";

/**
 * Admin API for organizations.
 *
 * (only Super Admin / Admin / Moderator can write). For now we accept a
 * simple admin session token in the request header.
 *
 * POST   /api/admin/organizations        — create
 * GET    /api/admin/organizations        — list all (incl. Unverified, Suspended, Archived)
 */

async function isAdmin(req: NextRequest): Promise<boolean> {
  return Boolean(await requireAdminRequest(req));
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const type = String(body?.type ?? "association").trim();
    const description = String(body?.description ?? "").trim();
    const stateCode = String(body?.stateCode ?? "").trim().toUpperCase();
    const cityName = String(body?.cityName ?? "").trim();
    const address = String(body?.address ?? "").trim() || null;
    const phone = String(body?.phone ?? "").trim() || null;
    const email = String(body?.email ?? "").trim() || null;
    const website = String(body?.website ?? "").trim() || null;
    const hoursAr = String(body?.hoursAr ?? "").trim() || null;
    const services = String(body?.services ?? "").trim() || null;
    const verification = String(body?.verification ?? "Unverified").trim();

    if (!name || !description) {
      return NextResponse.json(
        { error: "name and description are required" },
        { status: 400 }
      );
    }

    // Resolve state + city
    let stateId: string | undefined;
    let cityId: string | undefined;
    if (stateCode) {
      const state = await db.uSState.findUnique({ where: { code: stateCode } });
      if (state) {
        stateId = state.id;
        if (cityName) {
          const city = await db.uSCity.findFirst({
            where: { stateId: state.id, nameEn: cityName },
          });
          cityId = city?.id;
        }
      }
    }

    const org = await db.organization.create({
      data: {
        name,
        type,
        description,
        stateId,
        cityId,
        address,
        phone,
        email,
        website,
        hoursAr,
        services,
        verification,
        // Geocoding is handled explicitly by the protected /api/admin/geocode workflow.
        latitude: null,
        longitude: null,
      },
      include: { state: true, city: true },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        actor: "admin",
        action: "organization-created",
        entity: "organization",
        entityId: org.id,
        details: JSON.stringify({ name, type, state: stateCode }),
      },
    });

    return NextResponse.json({ ok: true, organization: org });
  } catch (e) {
    console.error("admin create org error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const verification = searchParams.get("verification")?.trim();
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 50)));

  const where: Record<string, unknown> = {};
  if (verification) where.verification = verification;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { services: { contains: q } },
    ];
  }

  const [total, items] = await Promise.all([
    db.organization.count({ where }),
    db.organization.findMany({
      where,
      include: { state: true, city: true },
      orderBy: [{ verification: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    items: items.map((o) => ({
      id: o.id,
      name: o.name,
      type: o.type,
      verification: o.verification,
      rating: o.rating,
      address: o.address,
      state: o.state
        ? { code: o.state.code, nameEn: o.state.nameEn, nameAr: o.state.nameAr }
        : null,
      city: o.city
        ? { nameEn: o.city.nameEn, nameAr: o.city.nameAr }
        : null,
    })),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}
