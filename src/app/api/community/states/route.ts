import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/community/states
 * Returns all active US states + DC, ordered by sortOrder.
 */
export async function GET() {
  const states = await db.uSState.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      cities: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  return NextResponse.json({
    states: states.map((s) => ({
      code: s.code,
      nameEn: s.nameEn,
      nameAr: s.nameAr,
      fipsCode: s.fipsCode,
      cities: s.cities.map((c) => ({
        nameEn: c.nameEn,
        nameAr: c.nameAr,
        latitude: c.latitude,
        longitude: c.longitude,
      })),
    })),
  });
}
