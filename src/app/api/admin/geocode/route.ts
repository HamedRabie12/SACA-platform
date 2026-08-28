import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";

/**
 * POST /api/admin/geocode
 * Body: { organizationId: string }
 *
 * Uses OpenStreetMap Nominatim (free, no API key required) to geocode
 * the organization's address and store lat/lng in the database.
 *
 * Usage policy: max 1 request per second, max 1000/day.
 */
export async function POST(req: NextRequest) {
  if (!(await requireAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const orgId = String(body?.organizationId ?? "").trim();
    if (!orgId) {
      return NextResponse.json({ error: "organizationId required" }, { status: 400 });
    }

    const org = await db.organization.findUnique({
      where: { id: orgId },
      include: { state: true, city: true },
    });
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const addressParts = [
      org.address,
      org.city?.nameEn,
      org.state?.nameEn,
      org.state?.code,
      "USA",
    ].filter(Boolean);
    const address = addressParts.join(", ");

    if (!address) {
      return NextResponse.json({ error: "No address to geocode" }, { status: 400 });
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=us`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SACA-Platform/1.0 (saca-md.org)",
        "Accept-Language": "en",
      },
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Geocoding API error: ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "Address not found", address }, { status: 404 });
    }

    const { lat, lon } = data[0];
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 500 });
    }

    await db.organization.update({
      where: { id: orgId },
      data: { latitude, longitude },
    });

    await db.auditLog.create({
      data: {
        actor: "admin",
        action: "organization-geocoded",
        entity: "organization",
        entityId: orgId,
        details: JSON.stringify({ address, latitude, longitude }),
      },
    });

    return NextResponse.json({
      ok: true,
      organizationId: orgId,
      address,
      latitude,
      longitude,
      osmUrl: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`,
    });
  } catch (e) {
    console.error("geocode error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/geocode (bulk) — geocode all orgs without coords
 * Body: { ids?: string[] }
 */
export async function PUT(req: NextRequest) {
  if (!(await requireAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];

    const where: Record<string, unknown> = {
      OR: [{ latitude: null }, { longitude: null }],
    };
    if (ids.length > 0) where.id = { in: ids };

    const orgs = await db.organization.findMany({
      where,
      include: { state: true, city: true },
      take: 30, // Be respectful to Nominatim
    });

    const results: Array<{ id: string; name: string; ok: boolean; lat?: number; lng?: number; error?: string }> = [];
    let delay = 0;

    for (const org of orgs) {
      await new Promise((r) => setTimeout(r, delay));
      delay = 1100; // 1.1s between requests

      const address = [
        org.address,
        org.city?.nameEn,
        org.state?.nameEn,
        org.state?.code,
        "USA",
      ].filter(Boolean).join(", ");

      if (!address) {
        results.push({ id: org.id, name: org.name, ok: false, error: "No address" });
        continue;
      }

      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=us`;
        const res = await fetch(url, {
          headers: { "User-Agent": "SACA-Platform/1.0 (saca-md.org)" },
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          if (!isNaN(lat) && !isNaN(lng)) {
            await db.organization.update({
              where: { id: org.id },
              data: { latitude: lat, longitude: lng },
            });
            results.push({ id: org.id, name: org.name, ok: true, lat, lng });
            continue;
          }
        }
        results.push({ id: org.id, name: org.name, ok: false, error: "Not found" });
      } catch (e) {
        results.push({ id: org.id, name: org.name, ok: false, error: (e as Error).message });
      }
    }

    await db.auditLog.create({
      data: {
        actor: "admin",
        action: "bulk-geocoded",
        entity: "organization",
        details: JSON.stringify({
          total: results.length,
          success: results.filter((r) => r.ok).length,
        }),
      },
    });

    return NextResponse.json({
      ok: true,
      processed: results.length,
      success: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    });
  } catch (e) {
    console.error("bulk geocode error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
