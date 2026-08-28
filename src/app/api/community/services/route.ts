import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const services = await db.service.findMany({ where: { status: "ACTIVE" }, orderBy: { nameEn: "asc" } });
  const counts = await Promise.all(services.map(async (service) => ({
    code: service.code,
    providers: await db.serviceProvider.count({ where: { verificationStatus: "VERIFIED", category: service.code } }),
    requests: await db.serviceRequest.count({ where: { serviceCode: service.code, status: { not: "CLOSED" } } }),
  })));
  const countMap = new Map(counts.map((x) => [x.code, x]));
  return NextResponse.json({ services: services.map((s) => ({ ...s, ...countMap.get(s.code) })) }, { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
