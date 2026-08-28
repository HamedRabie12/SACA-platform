import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/community/organizations
 *
 * Query params:
 *   - state: state code (e.g., MD, TX)
 *   - type: organization type (association, center, mosque, education, professional, charity)
 *   - verification: Unverified, PendingVerification, Verified
 *   - q: full-text search (name + description + services + city + state)
 *   - page: 1-indexed page number (default 1)
 *   - pageSize: page size (default 20, max 100)
 *
 * Returns a paginated list of organizations, ordered by Verified first then by name.
 * Only Verified orgs are exposed to public — admin portal exposes all.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state")?.trim();
  const type = searchParams.get("type")?.trim();
  const verification = searchParams.get("verification")?.trim();
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));

  // Build where clause
  const where: Record<string, unknown> = {};

  if (state) {
    where.state = { code: state.toUpperCase() };
  }
  if (type) {
    where.type = type;
  }
  // Public can only see Verified unless verification param is explicitly "PendingVerification"
  // (admin preview will set verification param explicitly).
  if (verification) {
    where.verification = verification;
  } else {
    where.verification = "Verified";
  }
  if (q && q.length > 0) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { services: { contains: q } },
      { address: { contains: q } },
      { city: { nameEn: { contains: q } } },
      { city: { nameAr: { contains: q } } },
      { state: { nameEn: { contains: q } } },
      { state: { nameAr: { contains: q } } },
    ];
  }

  const [total, items] = await Promise.all([
    db.organization.count({ where }),
    db.organization.findMany({
      where,
      include: { state: true, city: true },
      orderBy: [{ verification: "desc" }, { rating: "desc" }, { name: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    items: items.map((o) => ({
      id: o.id,
      name: o.name,
      type: o.type,
      description: o.description,
      logoUrl: o.logoUrl,
      address: o.address,
      latitude: o.latitude,
      longitude: o.longitude,
      phone: o.phone,
      email: o.email,
      website: o.website,
      hoursAr: o.hoursAr,
      services: o.services,
      verification: o.verification,
      rating: o.rating,
      state: o.state
        ? { code: o.state.code, nameEn: o.state.nameEn, nameAr: o.state.nameAr }
        : null,
      city: o.city
        ? { nameEn: o.city.nameEn, nameAr: o.city.nameAr }
        : null,
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}
