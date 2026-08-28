import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/community/organizations/[id]
 * Returns a single organization by ID, including related events and news.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const org = await db.organization.findUnique({
    where: { id },
    include: { state: true, city: true },
  });

  if (!org) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Find related events & news by organizer name / org name match (best-effort join).
  const [relatedEvents, relatedNews] = await Promise.all([
    db.event.findMany({
      where: {
        OR: [
          { organizerName: { contains: org.name } },
          { organizerName: { contains: org.name.split(" - ")[0] } },
        ],
        status: "Upcoming",
      },
      orderBy: { eventDate: "asc" },
      take: 5,
    }),
    db.news.findMany({
      where: {
        OR: [
          { orgName: { contains: org.name } },
          { orgName: { contains: org.name.split(" - ")[0] } },
        ],
        status: "Published",
      },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    organization: {
      id: org.id,
      name: org.name,
      type: org.type,
      description: org.description,
      logoUrl: org.logoUrl,
      coverUrl: org.coverUrl,
      address: org.address,
      latitude: org.latitude,
      longitude: org.longitude,
      phone: org.phone,
      email: org.email,
      website: org.website,
      hoursAr: org.hoursAr,
      services: org.services,
      verification: org.verification,
      rating: org.rating,
      isDevSeed: org.isDevSeed,
      createdAt: org.createdAt.toISOString(),
      state: org.state
        ? { code: org.state.code, nameEn: org.state.nameEn, nameAr: org.state.nameAr }
        : null,
      city: org.city
        ? { nameEn: org.city.nameEn, nameAr: org.city.nameAr }
        : null,
    },
    relatedEvents: relatedEvents.map((e) => ({
      ...e,
      eventDate: e.eventDate.toISOString(),
    })),
    relatedNews: relatedNews.map((n) => ({
      ...n,
      publishedAt: n.publishedAt.toISOString(),
    })),
  });
}
